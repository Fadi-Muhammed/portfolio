import { isInstrumentId, parseThresholdConfig } from "@/lib/engineering/instruments";
import type { EngineeringProject } from "@/lib/content/queries";
import { LightThreshold } from "./light-threshold";

/**
 * Which instrument, if any, a project gets.
 *
 * Keyed on `engineering_projects.interactive_widget`, with the numbers coming from that
 * project's own `data`. Both have to be there: a project that names an instrument but has
 * no usable data gets a stated empty state, never a curve drawn from defaults.
 *
 * The map is deliberately small. B2 lists four instruments and this holds one, because
 * one is the number of projects in the database that supports one. The rest arrive with
 * the projects that justify them.
 */
export function Instrument({ project }: { project: EngineeringProject }) {
  const widget = project.interactive_widget;
  if (!isInstrumentId(widget)) return null;

  if (widget === "light-threshold") {
    const config = parseThresholdConfig(project.data);
    if (!config) {
      return (
        <p className="instrument-empty text-small text-muted">
          The interactive version of this needs the measured component values, which are not
          recorded yet. The method below describes the same circuit.
        </p>
      );
    }
    return <LightThreshold config={config} />;
  }

  return null;
}
