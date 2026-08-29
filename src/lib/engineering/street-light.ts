/**
 * The street light's control loop, modelled from the firmware rather than from physics.
 *
 * The obvious instrument for this project would plot the LDR's response against
 * illuminance. It is not buildable honestly: the report records no photometry — no lux,
 * no LDR resistance, no datasheet curve — so every point on that plot would be invented.
 * What the report does record is the pair of numbers the system actually compares, and a
 * measured line of console output to check the model against.
 *
 * So this models `main.py`, one loop iteration at a time. Every constant below is from
 * the listing in the report; none is chosen here.
 */

/** 12-bit ADC with 11 dB attenuation, so both sensors read 0..4095 across 0..3.3 V. */
export const ADC_MAX = 4095;
/** `led.duty(819)` — about 80 % of MicroPython's 0..1023 PWM range. */
export const LED_DUTY_ON = 819;
export const LED_DUTY_OFF = 0;
/** `if ticks >= 50` at `sleep(0.1)`: a five-second window. */
export const WINDOW_TICKS = 50;
export const WINDOW_SECONDS = (WINDOW_TICKS * 0.1).toFixed(0);
/** `if flips >= 6` inside that window means the sensor is flickering. */
export const FAULT_FLIPS = 6;

export type Inputs = {
  /** What `ldr.read()` returns. High is dark: see the note in `polarity` below. */
  ldr: number;
  /** What `pot.read()` returns — the threshold the potentiometer sets. */
  threshold: number;
  /** True after an odd number of button presses. */
  manual: boolean;
  /** Day/night changes counted inside the current five-second window. */
  flips: number;
};

export type Outputs = {
  isNight: boolean;
  lightOn: boolean;
  ledDuty: number;
  relay: boolean;
  fault: boolean;
  mode: "AUTO" | "MANUAL";
  status: string;
  /** The line `main.py` prints, reproduced exactly. */
  console: string;
};

const clamp = (value: number) => Math.min(ADC_MAX, Math.max(0, Math.round(value)));

/**
 * One pass of the main loop.
 *
 * The comparison is `ldr_value > threshold`, strictly greater, exactly as the firmware
 * has it. That direction is not arbitrary: the rig reads high in the dark, which the
 * report confirms was checked during calibration.
 */
export function step(inputs: Inputs): Outputs {
  const ldr = clamp(inputs.ldr);
  const threshold = clamp(inputs.threshold);

  const isNight = ldr > threshold;
  const fault = inputs.flips >= FAULT_FLIPS;
  const lightOn = inputs.manual || isNight;
  const mode = inputs.manual ? "MANUAL" : "AUTO";

  const status = fault ? "FAULT - sensor erratic" : lightOn ? "Light ON" : "Light OFF";

  return {
    isNight,
    lightOn,
    ledDuty: lightOn ? LED_DUTY_ON : LED_DUTY_OFF,
    relay: lightOn,
    fault,
    mode,
    status,
    console: `Mode: ${mode} | ${status} | LDR = ${ldr} | TH = ${threshold}`,
  };
}

/**
 * Whether moving the reading from one value to another crosses the threshold.
 *
 * This is what the firmware counts as a flip — `is_night != last_night`. The instrument
 * counts them the same way as the visitor drags, which is how the fault alarm becomes
 * reachable by hand instead of being described in a caption.
 */
export function crossesThreshold(from: number, to: number, threshold: number): boolean {
  return clamp(from) > threshold !== clamp(to) > threshold;
}

/** The duty cycle as a percentage, for display. 819 of 1023 is about 80 %. */
export function dutyPercent(duty: number): number {
  return Math.round((duty / 1023) * 100);
}
