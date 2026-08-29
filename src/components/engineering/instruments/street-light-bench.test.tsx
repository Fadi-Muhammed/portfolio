import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StreetLightConfig } from "@/lib/engineering/instruments";
import { StreetLightBench } from "./street-light-bench";

/**
 * The bench's wiring: that the controls are labelled, that the readouts follow them, and
 * that the fault state is reachable by hand rather than only described.
 *
 * The loop's arithmetic is checked separately against the firmware listing and the one
 * measured console line, in `src/lib/engineering/street-light.test.ts`.
 *
 * Keyboard operation is not asserted here. Both controls are native range inputs and both
 * actions are native buttons, so "an arrow key moves it" is a browser guarantee —
 * asserting it in jsdom would test jsdom, not this component. Playwright covers it in a
 * real browser.
 */

const config: StreetLightConfig = {
  defaultLdr: 3120,
  defaultThreshold: 1850,
  source: "Readings from the report.",
};

const setSlider = (element: HTMLElement, value: number) =>
  fireEvent.change(element, { target: { value: String(value) } });

const ldrSlider = () => screen.getByLabelText(/LDR reading/);
const readout = (label: string) =>
  screen.getByText(label, { selector: "dt" }).parentElement?.textContent ?? "";

describe("the street light bench", () => {
  it("opens on the readings the report recorded", () => {
    render(<StreetLightBench config={config} />);
    expect(screen.getByText("Mode: AUTO | Light ON | LDR = 3120 | TH = 1850")).toBeInTheDocument();
    expect(screen.getByText(config.source, { exact: false })).toBeInTheDocument();
  });

  it("turns the lamp off when the reading falls below the threshold", () => {
    render(<StreetLightBench config={config} />);
    setSlider(ldrSlider(), 200);
    expect(screen.getByText(/Light OFF/)).toBeInTheDocument();
    expect(readout("Relay")).toContain("open");
    expect(readout("is_night")).toContain("0");
  });

  it("drives the LED at the firmware's 80 per cent when the lamp is on", () => {
    render(<StreetLightBench config={config} />);
    expect(readout("LED duty")).toContain("819");
    expect(readout("LED duty")).toContain("80%");
  });

  it("lets the override force the lamp on in daylight, and says which mode it is in", () => {
    render(<StreetLightBench config={config} />);
    setSlider(ldrSlider(), 0);
    expect(screen.getByText(/Light OFF/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /override/i }));
    expect(screen.getByText("Mode: MANUAL | Light ON | LDR = 0 | TH = 1850")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Return to AUTO/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("counts a flip only when the reading crosses the threshold", () => {
    render(<StreetLightBench config={config} />);
    const slider = ldrSlider();

    setSlider(slider, 3000); // still night, no crossing
    expect(readout("Flips")).toContain("0 / 6");

    setSlider(slider, 100); // night to day
    expect(readout("Flips")).toContain("1 / 6");
  });

  it("reaches the fault state by hand, the way waving a hand over the sensor does", () => {
    render(<StreetLightBench config={config} />);
    const slider = ldrSlider();

    for (let index = 0; index < 6; index += 1) {
      setSlider(slider, index % 2 === 0 ? 100 : 3000);
    }

    expect(screen.getByText(/FAULT - sensor erratic/)).toBeInTheDocument();
    expect(readout("Flips")).toContain("6 / 6");
  });

  it("clears the window when asked, and cannot be cleared when there is nothing to clear", () => {
    render(<StreetLightBench config={config} />);
    const reset = screen.getByRole("button", { name: /Reset window/ });
    expect(reset).toBeDisabled();

    setSlider(ldrSlider(), 100);
    expect(reset).toBeEnabled();
    fireEvent.click(reset);
    expect(readout("Flips")).toContain("0 / 6");
  });

  it("prints the console line rather than paraphrasing it", () => {
    // The point of the instrument is that it is the firmware, not an illustration of it.
    render(<StreetLightBench config={config} />);
    setSlider(ldrSlider(), 4095);
    expect(screen.getByText("Mode: AUTO | Light ON | LDR = 4095 | TH = 1850")).toBeInTheDocument();
  });
});
