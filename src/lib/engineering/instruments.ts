/**
 * What an instrument needs before it may be drawn.
 *
 * `engineering_projects.data` is `jsonb`, so the database guarantees nothing about its
 * shape. Everything is narrowed here, once, and a config missing a value comes back as
 * null — which the registry renders as a stated empty state rather than a bench drawn
 * from defaults. An instrument with invented numbers is a drawing of nothing that looks
 * exactly like a drawing of something.
 */

export type StreetLightConfig = {
  /** The reading the report records during night operation. */
  defaultLdr: number;
  /** The threshold the report records alongside it. */
  defaultThreshold: number;
  /** Where these numbers came from, shown with the instrument. */
  source: string;
};

function num(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseStreetLightConfig(value: unknown): StreetLightConfig | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const defaultLdr = num(record, "defaultLdr");
  const defaultThreshold = num(record, "defaultThreshold");
  const source = typeof record.source === "string" ? record.source : null;

  if (defaultLdr === null || defaultThreshold === null || source === null) return null;
  if (defaultLdr < 0 || defaultLdr > 4095) return null;
  if (defaultThreshold < 0 || defaultThreshold > 4095) return null;

  return { defaultLdr, defaultThreshold, source };
}

/** Which instruments exist. `interactive_widget` holds one of these, or nothing. */
export const INSTRUMENTS = ["street-light-bench"] as const;
export type InstrumentId = (typeof INSTRUMENTS)[number];

export function isInstrumentId(value: string | null): value is InstrumentId {
  return value !== null && (INSTRUMENTS as readonly string[]).includes(value);
}
