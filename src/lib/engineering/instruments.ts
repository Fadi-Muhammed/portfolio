import type { Adc, Divider } from "./threshold";

/**
 * What an instrument needs before it may be drawn.
 *
 * `engineering_projects.data` is `jsonb`, so the database guarantees nothing about its
 * shape. Everything is narrowed here, once, and a config that is missing a value or has
 * the wrong type comes back as null — which the instrument renders as a stated empty
 * state rather than a curve drawn from defaults.
 *
 * That distinction is the whole point. An instrument with invented component values is a
 * drawing of nothing that looks exactly like a drawing of something, and it is the fastest
 * way to put a false claim on an engineering portfolio.
 */

export type ThresholdConfig = {
  divider: Divider;
  adc: Adc;
  /** The potentiometer's setting, in ADC counts. The lamp is on at or below this. */
  darkBelow: number;
  range: { minLux: number; maxLux: number };
  /** Where the numbers came from, shown with the instrument. */
  source: string;
};

function num(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseThresholdConfig(value: unknown): ThresholdConfig | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const supplyV = num(record, "supplyV");
  const fixedOhms = num(record, "fixedOhms");
  const ldrAt10LuxOhms = num(record, "ldrAt10LuxOhms");
  const gamma = num(record, "gamma");
  const adcBits = num(record, "adcBits");
  const adcFullScaleV = num(record, "adcFullScaleV");
  const darkBelow = num(record, "darkBelow");
  const minLux = num(record, "minLux");
  const maxLux = num(record, "maxLux");
  const source = typeof record.source === "string" ? record.source : null;

  if (
    supplyV === null ||
    fixedOhms === null ||
    ldrAt10LuxOhms === null ||
    gamma === null ||
    adcBits === null ||
    adcFullScaleV === null ||
    darkBelow === null ||
    minLux === null ||
    maxLux === null ||
    source === null
  ) {
    return null;
  }

  // Values that would produce a nonsense drawing rather than an inaccurate one.
  if (supplyV <= 0 || fixedOhms <= 0 || ldrAt10LuxOhms <= 0) return null;
  if (adcBits < 1 || adcBits > 24 || adcFullScaleV <= 0) return null;
  if (minLux <= 0 || maxLux <= minLux) return null;

  return {
    divider: {
      supplyV,
      fixedOhms,
      ldrAt10LuxOhms,
      gamma,
      ldrOnTop: record.ldrOnTop !== false,
    },
    adc: { bits: adcBits, fullScaleV: adcFullScaleV },
    darkBelow,
    range: { minLux, maxLux },
    source,
  };
}

/** Which instruments exist. `interactive_widget` holds one of these, or nothing. */
export const INSTRUMENTS = ["light-threshold"] as const;
export type InstrumentId = (typeof INSTRUMENTS)[number];

export function isInstrumentId(value: string | null): value is InstrumentId {
  return value !== null && (INSTRUMENTS as readonly string[]).includes(value);
}
