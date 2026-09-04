"use client";

import { ArrowRight, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * "Slide into my LinkedIn" (B7).
 *
 * The last call to action on the site, and the one component allowed a bounce — B5 makes
 * it the single exception because a spring back is physical rather than decorative: the
 * handle was dragged and let go, and things that are let go return.
 *
 * It is a real drag, not a button dressed as one. Pointer events rather than mouse or
 * touch events so one code path covers a finger, a mouse and a stylus, and
 * `touch-action: none` on the track so a drag along it does not scroll the deck instead.
 *
 * And it is a real button underneath: `role="button"`, focusable, Enter and Space open the
 * profile. Someone on a keyboard never has to simulate a drag, which is the failure mode
 * of every slider that treats dragging as the only way in.
 */

const THRESHOLD = 0.85;

type Props = {
  href: string;
  /** "LinkedIn". Used in the label, the success line and the accessible name. */
  target: string;
};

export function SlideToOpen({ href, target }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [opened, setOpened] = useState(false);
  const [nudged, setNudged] = useState(false);
  const reducedMotion = useReducedMotion();

  const open = useCallback(() => {
    setOpened(true);
    setProgress(1);
    window.open(href, "_blank", "noopener,noreferrer");
    // Back to the start after a moment, so the control is usable again rather than
    // stuck in its success state.
    window.setTimeout(() => {
      setOpened(false);
      setProgress(0);
    }, 2000);
  }, [href]);

  /*
   * A one-time nudge per session, so the handle reads as draggable without a caption
   * explaining that it is. Skipped entirely under reduced motion: a control that moves on
   * its own is exactly what that setting is asking not to happen.
   */
  useEffect(() => {
    if (reducedMotion || nudged) return;
    if (sessionStorage.getItem("slider-nudged") === "1") return;

    const timer = window.setTimeout(() => {
      setNudged(true);
      sessionStorage.setItem("slider-nudged", "1");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, nudged]);

  const positionFrom = (clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const handle = rect.height;
    const travel = Math.max(1, rect.width - handle);
    return Math.min(1, Math.max(0, (clientX - rect.left - handle / 2) / travel));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (opened) return;
    // Capture, so a drag that leaves the track still belongs to it and still ends here.
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setProgress(positionFrom(event.clientX));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setProgress(positionFrom(event.clientX));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);

    if (positionFrom(event.clientX) >= THRESHOLD) open();
    else setProgress(0); // Released early: spring back.
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open();
  };

  return (
    <div
      ref={trackRef}
      className="slider"
      role="button"
      tabIndex={0}
      aria-label={opened ? `Opening ${target}` : `Slide to open my ${target} profile`}
      data-dragging={dragging || undefined}
      data-opened={opened || undefined}
      data-nudge={nudged && !dragging && progress === 0 && !opened ? "" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <span className="slider__label text-small" style={{ opacity: 1 - progress * 1.4 }}>
        Slide into my {target} <span aria-hidden="true">→</span>
      </span>

      <span className="slider__done text-small" aria-hidden="true">
        Opening {target}…
      </span>

      <span
        className="slider__handle"
        aria-hidden="true"
        style={{
          // Percentage of the free travel, so the handle never leaves the track whatever
          // the track's width happens to be.
          transform: `translateX(calc(${progress} * (100cqw - 100%)))`,
        }}
      >
        {opened ? <Check size={20} strokeWidth={2} /> : <ArrowRight size={20} strokeWidth={2} />}
      </span>
    </div>
  );
}
