import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ThresholdConfig } from "@/lib/engineering/instruments";
import { LightThreshold } from "./light-threshold";

/**
 * The instrument's wiring: that the controls are labelled, that the readings follow them,
 * and that it states the cases it cannot draw.
 *
 * The config here is a stand-in with round numbers, not Fadi's measured components. What
 * these assert is true whatever the real values turn out to be; the arithmetic itself is
 * checked against hand-worked figures in `src/lib/engineering/threshold.test.ts`.
 *
 * Keyboard operation is tested in Playwright rather than here. Both controls are native
 * range inputs, so "an arrow key moves it" is a browser guarantee — asserting it in jsdom
 * would be testing jsdom's implementation of a slider, not this component.
 */

const config: ThresholdConfig = {
  divider: { supplyV: 3.3, fixedOhms: 10_000, ldrAt10LuxOhms: 10_000, gamma: 0.7, ldrOnTop: true },
  adc: { bits: 12, fullScaleV: 3.3 },
  darkBelow: 2048,
  range: { minLux: 0.1, maxLux: 10_000 },
  source: "Component values from the lab sheet.",
};

/** The text of one readout, found by its label rather than by position. */
function reading(label: string): string {
  const term = screen.getByText(label, { selector: "dt" });
  return term.parentElement?.textContent ?? "";
}

const setSlider = (element: HTMLElement, value: number) =>
  fireEvent.change(element, { target: { value: String(value) } });

describe("the light threshold instrument", () => {
  it("labels both controls and says where its numbers came from", () => {
    render(<LightThreshold config={config} />);
    expect(screen.getByLabelText(/Ambient light/)).toHaveAttribute("type", "range");
    expect(screen.getByLabelText(/Threshold/)).toHaveAttribute("type", "range");
    expect(screen.getByText(config.source)).toBeInTheDocument();
  });

  it("turns the lamp on in the dark and off in the light", () => {
    render(<LightThreshold config={config} />);
    const light = screen.getByLabelText(/Ambient light/);

    setSlider(light, Math.log10(0.1));
    expect(reading("Lamp")).toContain("on");

    setSlider(light, Math.log10(10_000));
    expect(reading("Lamp")).toContain("off");
  });

  it("moves every reading together, because they are one measurement", () => {
    render(<LightThreshold config={config} />);
    const light = screen.getByLabelText(/Ambient light/);

    setSlider(light, Math.log10(0.1));
    const dark = { adc: reading("ADC"), volts: reading("Divider"), ldr: reading("LDR") };

    setSlider(light, Math.log10(10_000));
    expect(reading("ADC")).not.toBe(dark.adc);
    expect(reading("Divider")).not.toBe(dark.volts);
    // Brighter light means less resistance: the whole chain has to move the same way.
    expect(reading("LDR")).not.toBe(dark.ldr);
  });

  it("says the lamp never switches, rather than drawing a line that is not there", () => {
    render(<LightThreshold config={config} />);
    setSlider(screen.getByLabelText(/Threshold/), 4095);
    expect(screen.getByText(/never switches across the range/)).toBeInTheDocument();
  });

  it("reports where it switches when it does", () => {
    render(<LightThreshold config={config} />);
    setSlider(screen.getByLabelText(/Threshold/), 2048);
    expect(screen.getByText(/switches at about/)).toBeInTheDocument();
  });

  it("moves the switching point when the threshold moves", () => {
    render(<LightThreshold config={config} />);
    const threshold = screen.getByLabelText(/Threshold/);

    setSlider(threshold, 1000);
    const low = screen.getByText(/never switches|switches at about/).textContent;
    setSlider(threshold, 3000);
    expect(screen.getByText(/never switches|switches at about/).textContent).not.toBe(low);
  });

  it("describes the plot for a screen reader, and keeps that description current", () => {
    render(<LightThreshold config={config} />);
    const plot = screen.getByRole("img");
    const before = plot.getAttribute("aria-label");

    setSlider(screen.getByLabelText(/Ambient light/), Math.log10(0.1));
    expect(plot.getAttribute("aria-label")).not.toBe(before);
    expect(plot.getAttribute("aria-label")).toMatch(/lux/);
  });

  it("names its axes, so the plot reads as a measurement rather than a shape", () => {
    render(<LightThreshold config={config} />);
    expect(screen.getByText(/ambient light \(lux, log\)/)).toBeInTheDocument();
    expect(screen.getByText(/adc count/)).toBeInTheDocument();
  });

  it("tells the visitor the model is an approximation", () => {
    // The LDR curve is a log-log fit, not a measured sweep. Saying so is the difference
    // between an instrument and a claim.
    render(<LightThreshold config={config} />);
    expect(screen.getByText(/close rather than\s+exact/)).toBeInTheDocument();
  });
});
