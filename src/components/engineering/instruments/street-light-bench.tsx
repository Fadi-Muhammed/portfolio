"use client";

import { useId, useState } from "react";
import type { StreetLightConfig } from "@/lib/engineering/instruments";
import {
  ADC_MAX,
  FAULT_FLIPS,
  WINDOW_SECONDS,
  crossesThreshold,
  dutyPercent,
  step,
} from "@/lib/engineering/street-light";

/**
 * The rig, driven by hand.
 *
 * Three controls, because the real system has three inputs: the light falling on the LDR,
 * the potentiometer that sets the threshold, and the override button. Everything below
 * them is computed by `step()`, which is the firmware's own loop and is tested against
 * the one console line the report records.
 *
 * The flip counter is the part worth touching. In the firmware, six day/night changes
 * inside five seconds mean the sensor is flickering, and the buzzer sounds. Here the
 * flips are counted as the visitor drags the reading back and forth across the threshold
 * — the same test the report describes running by waving a hand over the LDR — so the
 * fault state is something you can reach rather than something a caption claims.
 *
 * Nothing moves on its own. There is no clock and no animation: the window advances when
 * the visitor crosses the threshold, not on a timer, which keeps the instrument an
 * instrument rather than a demo that plays at you. That is also why it needs no
 * reduced-motion branch — there is no motion to reduce.
 */
export function StreetLightBench({ config }: { config: StreetLightConfig }) {
  const id = useId();
  const [ldr, setLdr] = useState(config.defaultLdr);
  const [threshold, setThreshold] = useState(config.defaultThreshold);
  const [manual, setManual] = useState(false);
  const [flips, setFlips] = useState(0);

  const out = step({ ldr, threshold, manual, flips });

  const moveLdr = (next: number) => {
    if (crossesThreshold(ldr, next, threshold)) setFlips((count) => count + 1);
    setLdr(next);
  };

  const percent = (value: number) => (value / ADC_MAX) * 100;

  return (
    <div className="instrument">
      <div className="instrument__scale" aria-hidden="true">
        {/* Above the threshold is night, which is the half where the lamp is on. */}
        <div className="instrument__night" style={{ left: `${percent(threshold)}%` }} />
        <div className="instrument__mark" style={{ left: `${percent(threshold)}%` }} />
        <div
          className="instrument__reading"
          style={{ left: `${percent(ldr)}%` }}
          data-night={out.isNight ? "" : undefined}
        />
      </div>
      <p className="instrument__scale-key text-data text-muted" aria-hidden="true">
        <span>0 — bright</span>
        <span>dark — {ADC_MAX}</span>
      </p>

      <div className="instrument__controls">
        <label className="instrument__control" htmlFor={`${id}-ldr`}>
          <span className="text-data text-muted">LDR reading · GPIO34</span>
          <input
            id={`${id}-ldr`}
            type="range"
            min={0}
            max={ADC_MAX}
            step={1}
            value={ldr}
            onChange={(event) => moveLdr(Number(event.target.value))}
          />
          <output className="text-data">{ldr}</output>
        </label>

        <label className="instrument__control" htmlFor={`${id}-threshold`}>
          <span className="text-data text-muted">Threshold · potentiometer, GPIO35</span>
          <input
            id={`${id}-threshold`}
            type="range"
            min={0}
            max={ADC_MAX}
            step={1}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
          />
          <output className="text-data">{threshold}</output>
        </label>
      </div>

      <div className="instrument__actions">
        <button
          type="button"
          className="instrument__button"
          aria-pressed={manual}
          onClick={() => setManual((value) => !value)}
        >
          {manual ? "Return to AUTO" : "Press override button"}
        </button>
        <button
          type="button"
          className="instrument__button"
          onClick={() => setFlips(0)}
          disabled={flips === 0}
        >
          Reset window
        </button>
      </div>

      <dl className="instrument__readout">
        <Reading label="is_night" value={out.isNight ? "1" : "0"} code />
        <Reading label="LED duty" value={`${out.ledDuty} · ${dutyPercent(out.ledDuty)}%`} />
        <Reading label="Relay" value={out.relay ? "closed" : "open"} live={out.relay} />
        <Reading label="Flips" value={`${flips} / ${FAULT_FLIPS}`} live={out.fault} />
      </dl>

      {/* The line main.py prints, reproduced exactly rather than paraphrased. */}
      <p className="instrument__console" data-fault={out.fault ? "" : undefined}>
        {out.console}
      </p>

      <p className="instrument__note text-small text-muted">
        {out.fault
          ? `Six day/night changes inside ${WINDOW_SECONDS} seconds is what the firmware treats as a flickering sensor, so the buzzer on GPIO17 is sounding. Reset the window to clear it.`
          : `Drag the reading back and forth across the threshold. ${FAULT_FLIPS} crossings within ${WINDOW_SECONDS} seconds is what the firmware calls a faulty sensor.`}{" "}
        {config.source}
      </p>
    </div>
  );
}

function Reading({
  label,
  value,
  live,
  code,
}: {
  label: string;
  value: string;
  live?: boolean;
  /** A name from the source. Rendered as written — `is_night`, not `IS_NIGHT`. */
  code?: boolean;
}) {
  return (
    <div className="instrument__reading-item">
      <dt className={code ? "instrument__code text-muted" : "text-data text-muted"}>{label}</dt>
      <dd className="text-h3 text-ink" data-live={live ? "" : undefined}>
        {value}
      </dd>
    </div>
  );
}
