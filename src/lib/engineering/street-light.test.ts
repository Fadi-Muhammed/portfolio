import { describe, expect, it } from "vitest";
import {
  ADC_MAX,
  FAULT_FLIPS,
  LED_DUTY_OFF,
  LED_DUTY_ON,
  WINDOW_TICKS,
  crossesThreshold,
  dutyPercent,
  step,
} from "./street-light";

/**
 * Checked against the firmware listing and the one measured console line in the report:
 *
 *   Mode: AUTO | Light ON | LDR = 3120 | TH = 1850
 *
 * That line is the only ground truth available for this project, so it is asserted
 * character for character. If the model ever stops reproducing it, the model is wrong.
 */

const base = { ldr: 0, threshold: 1850, manual: false, flips: 0 };

describe("the constants come from the listing", () => {
  it("matches the firmware's values", () => {
    expect(ADC_MAX).toBe(4095); // 12-bit
    expect(LED_DUTY_ON).toBe(819); // ~80% of 1023
    expect(WINDOW_TICKS).toBe(50); // 50 x 0.1s = 5s
    expect(FAULT_FLIPS).toBe(6);
    expect(dutyPercent(LED_DUTY_ON)).toBe(80);
  });
});

describe("one pass of the loop", () => {
  it("reproduces the console line recorded in the report", () => {
    const out = step({ ...base, ldr: 3120, threshold: 1850 });
    expect(out.console).toBe("Mode: AUTO | Light ON | LDR = 3120 | TH = 1850");
  });

  it("calls it night when the reading is above the threshold", () => {
    // High reads dark on this rig, which the report confirms was checked in calibration.
    expect(step({ ...base, ldr: 1851 }).isNight).toBe(true);
    expect(step({ ...base, ldr: 1850 }).isNight).toBe(false);
    expect(step({ ...base, ldr: 1849 }).isNight).toBe(false);
  });

  it("drives the LED at 80 per cent and closes the relay when the light is on", () => {
    const night = step({ ...base, ldr: 3120 });
    expect(night.lightOn).toBe(true);
    expect(night.ledDuty).toBe(LED_DUTY_ON);
    expect(night.relay).toBe(true);

    const day = step({ ...base, ldr: 200 });
    expect(day.lightOn).toBe(false);
    expect(day.ledDuty).toBe(LED_DUTY_OFF);
    expect(day.relay).toBe(false);
  });

  it("lets the manual override win in broad daylight", () => {
    const out = step({ ...base, ldr: 0, manual: true });
    expect(out.mode).toBe("MANUAL");
    expect(out.lightOn).toBe(true);
    expect(out.console).toBe("Mode: MANUAL | Light ON | LDR = 0 | TH = 1850");
  });

  it("reports a fault once the flips reach the limit, and says so instead of the light state", () => {
    const out = step({ ...base, ldr: 3120, flips: FAULT_FLIPS });
    expect(out.fault).toBe(true);
    expect(out.status).toBe("FAULT - sensor erratic");
    expect(out.console).toContain("FAULT - sensor erratic");
  });

  it("does not report a fault one flip short", () => {
    expect(step({ ...base, flips: FAULT_FLIPS - 1 }).fault).toBe(false);
  });

  it("clamps readings to what a 12-bit ADC can return", () => {
    expect(step({ ...base, ldr: 99_999 }).console).toContain("LDR = 4095");
    expect(step({ ...base, ldr: -5 }).console).toContain("LDR = 0");
  });
});

describe("counting flips", () => {
  it("counts a crossing in either direction", () => {
    expect(crossesThreshold(1000, 3000, 1850)).toBe(true);
    expect(crossesThreshold(3000, 1000, 1850)).toBe(true);
  });

  it("does not count a move that stays on one side", () => {
    expect(crossesThreshold(2000, 3000, 1850)).toBe(false);
    expect(crossesThreshold(100, 1000, 1850)).toBe(false);
  });

  it("agrees with the night test about where the boundary is", () => {
    // The firmware counts a flip when is_night changes, so the two must not disagree
    // about which side of the threshold a reading falls on.
    expect(crossesThreshold(1850, 1851, 1850)).toBe(true);
    expect(crossesThreshold(1849, 1850, 1850)).toBe(false);
  });
});
