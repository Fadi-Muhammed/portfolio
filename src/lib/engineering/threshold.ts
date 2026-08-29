/**
 * The street light's control loop, as arithmetic.
 *
 * An LDR and a fixed resistor form a divider. The ESP32's ADC reads the divider's
 * output; a potentiometer sets a threshold; when the reading falls below it — meaning it
 * has got dark — the relay closes and the lamp comes on.
 *
 * This is the real loop rather than a plausible-looking curve, which is why it is here as
 * pure functions with the project's own component values passed in. Everything the
 * instrument draws comes from these, and they are tested against values worked by hand.
 *
 * The LDR model is the standard log-log one: resistance falls as a power of illuminance,
 * R = R10 * (lux / 10) ^ -gamma, with R10 the resistance at 10 lux and gamma the slope
 * from the datasheet. It is an approximation, and the instrument says so.
 */

export type Divider = {
  /** Supply across the divider, volts. */
  supplyV: number;
  /** The fixed resistor, ohms. */
  fixedOhms: number;
  /** LDR resistance at 10 lux, ohms. */
  ldrAt10LuxOhms: number;
  /** Log-log slope of the LDR. Typically 0.5 to 0.9. */
  gamma: number;
  /** True when the LDR is the top leg, so the output rises as it gets darker. */
  ldrOnTop: boolean;
};

export type Adc = {
  /** Resolution in bits. The ESP32's is 12. */
  bits: number;
  /** Full-scale voltage the ADC maps to its maximum count. */
  fullScaleV: number;
};

/** LDR resistance at a given illuminance, in ohms. */
export function ldrResistance(lux: number, divider: Divider): number {
  // Zero lux is unreachable in the model and unbounded in reality; clamp to something a
  // dark room can actually produce so the curve stays finite at the left edge.
  const clamped = Math.max(lux, 0.01);
  return divider.ldrAt10LuxOhms * Math.pow(clamped / 10, -divider.gamma);
}

/** The divider's output voltage at a given illuminance. */
export function dividerVoltage(lux: number, divider: Divider): number {
  const ldr = ldrResistance(lux, divider);
  const total = ldr + divider.fixedOhms;
  if (total === 0) return 0;
  // With the LDR on top, the fixed resistor is what the output is taken across.
  const acrossOutput = divider.ldrOnTop ? divider.fixedOhms : ldr;
  return (divider.supplyV * acrossOutput) / total;
}

/** What the ADC reports for a given voltage: an integer count, clamped to its range. */
export function adcCount(volts: number, adc: Adc): number {
  const max = Math.pow(2, adc.bits) - 1;
  const raw = Math.round((volts / adc.fullScaleV) * max);
  return Math.min(max, Math.max(0, raw));
}

export function adcMax(adc: Adc): number {
  return Math.pow(2, adc.bits) - 1;
}

export type LampState = {
  lux: number;
  volts: number;
  count: number;
  /** True when the lamp is on — that is, when it is dark enough. */
  lampOn: boolean;
};

/**
 * The whole loop at one light level.
 *
 * `darkBelow` is the threshold in ADC counts, as the potentiometer sets it. The lamp is
 * on when the reading is at or below it, which is the comparison the firmware makes.
 */
export function evaluate(lux: number, divider: Divider, adc: Adc, darkBelow: number): LampState {
  const volts = dividerVoltage(lux, divider);
  const count = adcCount(volts, adc);
  return { lux, volts, count, lampOn: count <= darkBelow };
}

/**
 * The illuminance at which the lamp switches, found by bisection.
 *
 * Bisection rather than algebra because the ADC quantises: the switching point is where
 * the *rounded* count crosses the threshold, which the closed form does not describe.
 * Returns null when the lamp never switches across the range — a real state, and one the
 * instrument has to show rather than draw a line at a level that does not exist.
 */
export function switchingLux(
  divider: Divider,
  adc: Adc,
  darkBelow: number,
  range: { minLux: number; maxLux: number },
): number | null {
  const atMin = evaluate(range.minLux, divider, adc, darkBelow).lampOn;
  const atMax = evaluate(range.maxLux, divider, adc, darkBelow).lampOn;
  if (atMin === atMax) return null;

  let low = range.minLux;
  let high = range.maxLux;
  for (let step = 0; step < 60; step += 1) {
    const middle = (low + high) / 2;
    if (evaluate(middle, divider, adc, darkBelow).lampOn === atMin) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

/** A curve of ADC count against illuminance, for drawing. Log-spaced across the range. */
export function curve(
  divider: Divider,
  adc: Adc,
  range: { minLux: number; maxLux: number },
  samples = 80,
): Array<{ lux: number; count: number }> {
  const from = Math.log10(Math.max(range.minLux, 0.01));
  const to = Math.log10(range.maxLux);
  return Array.from({ length: samples }, (_, index) => {
    const lux = Math.pow(10, from + ((to - from) * index) / (samples - 1));
    return { lux, count: adcCount(dividerVoltage(lux, divider), adc) };
  });
}
