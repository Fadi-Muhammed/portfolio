"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

/**
 * Flips between light and dark. The visitor starts on the system setting and stays
 * there until they touch this, at which point their choice is persisted and wins.
 *
 * The label says what pressing it will do, not what the current state is — a control
 * is named for its action (B12, and the skill's writing section).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="quiet"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className={className}
    >
      {theme === "dark" ? (
        <Sun size={20} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon size={20} strokeWidth={1.5} aria-hidden="true" />
      )}
      <span className="text-data">{next}</span>
    </Button>
  );
}
