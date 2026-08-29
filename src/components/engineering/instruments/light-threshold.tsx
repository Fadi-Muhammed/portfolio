"use client";

import { useId, useState } from "react";
import type { ThresholdConfig } from "@/lib/engineering/instruments";
import { adcMax, curve, evaluate, ldrResistance, switchingLux } from "@/lib/engineering/threshold";

/**
 * The street light's control loop, made touchable.
 *
 * Two controls, because the real system has two variables: the ambient light, which the
 * world sets, and the threshold, which the potentiometer sets. Everything else — the
 * divider voltage, the ADC count, whether the relay is closed — follows from those and is
 * computed by the tested functions in `@/lib/engineering/threshold`, not here.
 *
 * It moves only when the visitor moves it. There is no animation, no auto-play and no
 * transition on the readouts: an instrument that drifts on its own is a decoration, and
 * this is the section that is supposed to feel like instrumentation. That is also why it
 * needs no reduced-motion branch — there is no motion to reduce.
 *
 * Both controls are native range inputs, so they are keyboard-operable and touch-operable
 * without a line of code for either.
 */

const WIDTH = 640;
const HEIGHT = 300;
const PAD = { top: 16, right: 16, bottom: 40, left: 52 };

export function LightThreshold({ config }: { config: ThresholdConfig }) {
  const id = useId();
  const { divider, adc, range } = config;
  const max = adcMax(adc);

  const [lux, setLux] = useState(() => Math.sqrt(range.minLux * range.maxLux));
  const [darkBelow, setDarkBelow] = useState(config.darkBelow);

  const state = evaluate(lux, divider, adc, darkBelow);
  const points = curve(divider, adc, range);
  const crossing = switchingLux(divider, adc, darkBelow, range);

  const logMin = Math.log10(range.minLux);
  const logMax = Math.log10(range.maxLux);
  const x = (value: number) =>
    PAD.left +
    ((Math.log10(Math.max(value, range.minLux)) - logMin) / (logMax - logMin)) *
      (WIDTH - PAD.left - PAD.right);
  const y = (count: number) => PAD.top + (1 - count / max) * (HEIGHT - PAD.top - PAD.bottom);

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${x(point.lux).toFixed(1)} ${y(point.count).toFixed(1)}`,
    )
    .join(" ");

  // A decade per gridline: the honest spacing for a log axis, and the one an engineer
  // reading this would expect.
  const decades: number[] = [];
  for (let power = Math.ceil(logMin); power <= Math.floor(logMax); power += 1) {
    decades.push(Math.pow(10, power));
  }

  return (
    <div className="instrument">
      <figure className="instrument__figure">
        <svg
          className="instrument__plot"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Analogue reading against ambient light. At ${format(lux)} lux the reading is ${state.count} of ${max} and the lamp is ${state.lampOn ? "on" : "off"}.`}
        >
          {decades.map((value) => (
            <g key={value}>
              <line
                className="instrument__grid"
                x1={x(value)}
                y1={PAD.top}
                x2={x(value)}
                y2={HEIGHT - PAD.bottom}
              />
              <text
                className="instrument__tick"
                x={x(value)}
                y={HEIGHT - PAD.bottom + 16}
                textAnchor="middle"
              >
                {format(value)}
              </text>
            </g>
          ))}

          {[0, max].map((count) => (
            <text
              key={count}
              className="instrument__tick"
              x={PAD.left - 8}
              y={y(count) + 4}
              textAnchor="end"
            >
              {count}
            </text>
          ))}

          <line
            className="instrument__axis"
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={HEIGHT - PAD.bottom}
          />
          <line
            className="instrument__axis"
            x1={PAD.left}
            y1={HEIGHT - PAD.bottom}
            x2={WIDTH - PAD.right}
            y2={HEIGHT - PAD.bottom}
          />

          {/* Everything at or below the threshold is dark enough for the lamp. */}
          <rect
            className="instrument__band"
            x={PAD.left}
            y={y(darkBelow)}
            width={WIDTH - PAD.left - PAD.right}
            height={Math.max(0, HEIGHT - PAD.bottom - y(darkBelow))}
          />
          <line
            className="instrument__threshold"
            x1={PAD.left}
            y1={y(darkBelow)}
            x2={WIDTH - PAD.right}
            y2={y(darkBelow)}
          />

          <path className="instrument__curve" d={path} />

          {crossing !== null ? (
            <line
              className="instrument__crossing"
              x1={x(crossing)}
              y1={PAD.top}
              x2={x(crossing)}
              y2={HEIGHT - PAD.bottom}
            />
          ) : null}

          <circle
            className="instrument__cursor"
            cx={x(lux)}
            cy={y(state.count)}
            r={4}
            data-lamp={state.lampOn ? "on" : "off"}
          />

          <text className="instrument__label" x={WIDTH / 2} y={HEIGHT - 6} textAnchor="middle">
            ambient light (lux, log)
          </text>
          <text
            className="instrument__label"
            transform={`translate(14 ${(HEIGHT - PAD.bottom) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            adc count
          </text>
        </svg>
        <figcaption className="text-small text-muted">{config.source}</figcaption>
      </figure>

      <div className="instrument__controls">
        <label className="instrument__control" htmlFor={`${id}-lux`}>
          <span className="text-data text-muted">Ambient light</span>
          <input
            id={`${id}-lux`}
            type="range"
            min={Math.log10(range.minLux)}
            max={Math.log10(range.maxLux)}
            step={0.01}
            value={Math.log10(lux)}
            onChange={(event) => setLux(Math.pow(10, Number(event.target.value)))}
            aria-valuetext={`${format(lux)} lux`}
          />
          <output className="text-data">{format(lux)} lux</output>
        </label>

        <label className="instrument__control" htmlFor={`${id}-threshold`}>
          <span className="text-data text-muted">Threshold (potentiometer)</span>
          <input
            id={`${id}-threshold`}
            type="range"
            min={0}
            max={max}
            step={1}
            value={darkBelow}
            onChange={(event) => setDarkBelow(Number(event.target.value))}
            aria-valuetext={`${darkBelow} of ${max} counts`}
          />
          <output className="text-data">
            {darkBelow} / {max}
          </output>
        </label>
      </div>

      <dl className="instrument__readout">
        <Reading label="LDR" value={`${formatOhms(ldrResistance(lux, divider))}Ω`} />
        <Reading label="Divider" value={`${state.volts.toFixed(2)} V`} />
        <Reading label="ADC" value={`${state.count}`} />
        <Reading label="Lamp" value={state.lampOn ? "on" : "off"} live />
      </dl>

      <p className="instrument__note text-small text-muted">
        {crossing === null
          ? "At this threshold the lamp never switches across the range — it stays " +
            (state.lampOn ? "on" : "off") +
            " throughout."
          : `The lamp switches at about ${format(crossing)} lux.`}{" "}
        The LDR follows the usual log-log approximation, so the curve is close rather than exact.
      </p>
    </div>
  );
}

function Reading({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="instrument__reading">
      <dt className="text-data text-muted">{label}</dt>
      <dd className="text-h3 text-ink" data-live={live ? value : undefined}>
        {value}
      </dd>
    </div>
  );
}

function format(value: number): string {
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  if (value >= 10) return String(Math.round(value));
  if (value >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

function formatOhms(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}
