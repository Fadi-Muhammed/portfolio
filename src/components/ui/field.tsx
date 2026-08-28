"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Inputs and textareas share one shell so a label, hint and error always behave the
 * same way. Errors never rely on colour alone: the field gets the danger border, a
 * message naming what is wrong, and aria-invalid wired to that message.
 */

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
};

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-data text-muted">
        {label}
      </label>

      {children({ id, describedBy: describedBy || undefined })}

      {hint && !error ? (
        <p id={hintId} className="text-small text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-small text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const control = cn(
  "min-h-11 w-full rounded-sm border bg-surface px-3 py-2 text-body text-ink",
  "placeholder:text-muted",
  "transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease)]",
  "disabled:cursor-not-allowed disabled:bg-bg disabled:text-muted",
);

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy }) => (
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(control, error ? "border-danger" : "border-line", className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, className, rows = 5, ...props }: TextareaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy }) => (
        <textarea
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(control, "resize-y", error ? "border-danger" : "border-line", className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}
