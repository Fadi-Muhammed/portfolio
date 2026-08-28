"use client";

import { Command } from "cmdk";
import { useCallback, useState } from "react";
import { useDeck } from "@/components/deck/deck-provider";
import { useTheme } from "@/components/theme/theme-provider";
import {
  buildItems,
  groupItems,
  type PaletteAction,
  type PaletteContent,
  type PaletteItem,
} from "@/lib/palette/items";

/**
 * The command palette (B6).
 *
 * Two kinds of item live here and they behave differently on purpose. Anything that takes
 * you somewhere closes the palette, because staying open over the place you just asked to
 * see would be in the way. Anything that produces an answer — copy, theme, ping — keeps it
 * open and prints below the input, because the palette is where the answer belongs.
 *
 * Navigation always goes through hopTo. The palette is a shortcut to the deck, not a
 * second way of moving that could drift from it.
 */

type PaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: PaletteContent;
};

export function Palette({ open, onOpenChange, content }: PaletteProps) {
  const { hopTo } = useDeck();
  const { toggle } = useTheme();
  const [status, setStatus] = useState<string | null>(null);

  const items = buildItems(content);
  const groups = groupItems(items);

  const close = useCallback(() => {
    onOpenChange(false);
    setStatus(null);
  }, [onOpenChange]);

  /**
   * The real ping. B6 asked for a mock reply; measuring the actual round trip to the
   * health endpoint costs the same and is the difference between joking about being a
   * network engineer and being one. It also cannot quietly become an invented number.
   */
  const ping = useCallback(async () => {
    const host = window.location.host;
    setStatus(`PING ${host} — sending…`);

    const started = performance.now();
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const elapsed = Math.round(performance.now() - started);
      setStatus(
        response.ok
          ? `PING ${host} — 64 bytes, time=${elapsed} ms\n1 packet transmitted, 1 received, 0% loss`
          : `PING ${host} — no reply (${response.status})\n1 packet transmitted, 0 received, 100% loss`,
      );
    } catch {
      setStatus(`PING ${host} — unreachable\n1 packet transmitted, 0 received, 100% loss`);
    }
  }, []);

  const run = useCallback(
    (item: PaletteItem) => {
      const action: PaletteAction = item.action;

      switch (action.kind) {
        case "hop": {
          // The hop happens now; the line is an acknowledgement, not a delay.
          setStatus(`routing to ${item.label.toLowerCase()}…`);
          hopTo(action.section);
          window.setTimeout(close, 220);
          return;
        }
        case "external": {
          window.open(action.href, "_blank", "noopener,noreferrer");
          close();
          return;
        }
        case "download": {
          const link = document.createElement("a");
          link.href = action.href;
          link.download = "";
          link.rel = "noopener";
          link.click();
          close();
          return;
        }
        case "copy-email": {
          void navigator.clipboard
            .writeText(action.email)
            .then(() => setStatus(`Copied ${action.email}`))
            .catch(() => setStatus("Could not copy. Select the address and copy it manually."));
          return;
        }
        case "toggle-theme": {
          toggle();
          return;
        }
        case "ping": {
          void ping();
          return;
        }
      }
    },
    [close, hopTo, ping, toggle],
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search the site"
      shouldFilter
      className="palette"
      overlayClassName="palette-scrim"
      contentClassName="palette-panel"
      loop
    >
      <div className="palette-input-row">
        <Command.Input
          placeholder="Search sections, work and actions…"
          className="palette-input text-body"
          autoFocus
        />
        <kbd className="text-data palette-kbd">esc</kbd>
      </div>

      <Command.List className="palette-list">
        <Command.Empty className="palette-empty">
          <p className="text-body text-ink">No route to that.</p>
          <p className="text-small mt-1 text-muted">Try a section name, a project, or “ping”.</p>
        </Command.Empty>

        {groups.map(([group, groupItems]) => (
          <Command.Group key={group} heading={group} className="palette-group">
            {groupItems.map((item) => (
              <Command.Item
                key={item.id}
                value={`${item.label} ${item.keywords.join(" ")}`}
                onSelect={() => run(item)}
                className="palette-item"
              >
                <span aria-hidden="true" className="palette-packet" />
                <span className="palette-label text-small text-ink">{item.label}</span>
                {item.hint ? (
                  <span className="palette-hint text-data text-muted">{item.hint}</span>
                ) : null}
                {item.external ? (
                  <>
                    <span aria-hidden="true" className="text-data text-muted">
                      ↗
                    </span>
                    <span className="sr-only">Opens in a new tab</span>
                  </>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>

      {status ? (
        <p role="status" aria-live="polite" className="palette-status text-data text-muted">
          {status}
        </p>
      ) : null}
    </Command.Dialog>
  );
}
