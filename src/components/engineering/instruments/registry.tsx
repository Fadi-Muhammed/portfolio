import { isInstrumentId, parseStreetLightConfig } from "@/lib/engineering/instruments";
import type { EngineeringProject } from "@/lib/content/queries";
import { StreetLightBench } from "./street-light-bench";

/**
 * Which instrument, if any, a project gets.
 *
 * Keyed on `engineering_projects.interactive_widget`, with the numbers coming from that
 * project's own `data`. Both have to be there: a project that names an instrument but has
 * no usable data gets a stated empty state, never a bench drawn from defaults.
 *
 * The map holds one instrument, because one is the number of projects in the database
 * that supports one. B2's other three — a BER curve, a clickable topology, a packet
 * capture — arrive with the projects that would justify them.
 */
export function Instrument({ project }: { project: EngineeringProject }) {
  const widget = project.interactive_widget;
  if (!isInstrumentId(widget)) return null;

  if (widget === "street-light-bench") {
    const config = parseStreetLightConfig(project.data);
    if (!config) {
      return (
        <p className="instrument-empty text-small text-muted">
          The interactive version of this needs the readings recorded on the rig, which are not in
          the database yet. The method above describes the same loop.
        </p>
      );
    }
    return <StreetLightBench config={config} />;
  }

  return null;
}
