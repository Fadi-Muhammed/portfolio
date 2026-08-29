import { describe, expect, it } from "vitest";
import {
  adcCount,
  adcMax,
  curve,
  dividerVoltage,
  evaluate,
  ldrResistance,
  switchingLux,
  type Adc,
  type Divider,
} from "./threshold";

/**
 * Worked against values computed by hand, so a change to the model fails here rather
 * than quietly redrawing a curve that still looks plausible. Plausible is the failure
 * mode for anything that draws a graph.
 */

const divider: Divider = {
  supplyV: 3.3,
  fixedOhms: 10_000,
  ldrAt10LuxOhms: 10_000,
  gamma: 0.7,
  ldrOnTop: true,
};

const adc: Adc = { bits: 12, fullScaleV: 3.3 };

describe("the LDR", () => {
  it("is at its stated resistance at the stated illuminance", () => {
    expect(ldrResistance(10, divider)).toBeCloseTo(10_000, 6);
  });

  it("falls as the light rises, and rises as it falls", () => {
    expect(ldrResistance(100, divider)).toBeLessThan(ldrResistance(10, divider));
    expect(ldrResistance(1, divider)).toBeGreaterThan(ldrResistance(10, divider));
  });

  it("follows the log-log slope", () => {
    // A decade more light divides the resistance by 10^gamma.
    expect(ldrResistance(100, divider)).toBeCloseTo(10_000 * Math.pow(10, -0.7), 6);
  });

  it("stays finite in the dark, where the model would otherwise run away", () => {
    expect(Number.isFinite(ldrResistance(0, divider))).toBe(true);
  });
});

describe("the divider", () => {
  it("splits the supply evenly when both legs are equal", () => {
    // At 10 lux the LDR is 10k and the fixed resistor is 10k.
    expect(dividerVoltage(10, divider)).toBeCloseTo(1.65, 6);
  });

  it("reads higher in bright light, with the LDR on top", () => {
    // Brighter light lowers the top leg, so more of the supply lands on the output.
    expect(dividerVoltage(1000, divider)).toBeGreaterThan(dividerVoltage(10, divider));
    expect(dividerVoltage(0.1, divider)).toBeLessThan(dividerVoltage(10, divider));
  });

  it("reads the other way round when the LDR is the bottom leg", () => {
    const flipped = { ...divider, ldrOnTop: false };
    expect(dividerVoltage(1000, flipped)).toBeLessThan(dividerVoltage(10, flipped));
  });
});

describe("the ADC", () => {
  it("maps full scale to its highest count", () => {
    expect(adcCount(3.3, adc)).toBe(4095);
    expect(adcMax(adc)).toBe(4095);
  });

  it("maps half scale to the middle", () => {
    expect(adcCount(1.65, adc)).toBe(2048);
  });

  it("clamps rather than reporting a count that cannot exist", () => {
    expect(adcCount(-1, adc)).toBe(0);
    expect(adcCount(99, adc)).toBe(4095);
  });

  it("returns whole counts", () => {
    expect(Number.isInteger(adcCount(1.234, adc))).toBe(true);
  });
});

describe("the lamp", () => {
  it("is on in the dark and off in the light", () => {
    const threshold = 2048;
    expect(evaluate(0.1, divider, adc, threshold).lampOn).toBe(true);
    expect(evaluate(1000, divider, adc, threshold).lampOn).toBe(false);
  });

  it("switches at the light level where the reading crosses the threshold", () => {
    const threshold = 2048;
    const lux = switchingLux(divider, adc, threshold, { minLux: 0.01, maxLux: 10_000 });
    expect(lux).not.toBeNull();
    // Threshold at the midpoint count is the 10 lux point for these components.
    expect(lux!).toBeGreaterThan(9);
    expect(lux!).toBeLessThan(11);
  });

  it("reports no switching point when the lamp never changes state", () => {
    // A threshold above everything the ADC can report: the lamp is always on, so there
    // is no crossing to draw. The instrument has to show that rather than invent a line.
    expect(switchingLux(divider, adc, 4095, { minLux: 0.01, maxLux: 10_000 })).toBeNull();
    expect(switchingLux(divider, adc, -1, { minLux: 0.01, maxLux: 10_000 })).toBeNull();
  });

  it("moves the switching point when the threshold moves", () => {
    const range = { minLux: 0.01, maxLux: 10_000 };
    const low = switchingLux(divider, adc, 1000, range);
    const high = switchingLux(divider, adc, 3000, range);
    // A higher threshold means the lamp waits for less darkness, so it switches at a
    // higher light level.
    expect(high!).toBeGreaterThan(low!);
  });
});

describe("the curve", () => {
  it("spans the range and rises with the light", () => {
    const points = curve(divider, adc, { minLux: 0.1, maxLux: 1000 }, 20);
    expect(points).toHaveLength(20);
    expect(points[0].lux).toBeCloseTo(0.1, 6);
    expect(points[points.length - 1].lux).toBeCloseTo(1000, 6);
    expect(points[points.length - 1].count).toBeGreaterThan(points[0].count);
  });

  it("never reports a count outside the ADC's range", () => {
    for (const point of curve(divider, adc, { minLux: 0.01, maxLux: 100_000 })) {
      expect(point.count).toBeGreaterThanOrEqual(0);
      expect(point.count).toBeLessThanOrEqual(4095);
    }
  });
});
