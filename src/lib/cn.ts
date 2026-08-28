/**
 * Joins class names, dropping anything falsy.
 *
 * Deliberately not clsx + tailwind-merge: that pair exists to resolve conflicting
 * utilities, and the primitives here are built so callers do not need to override
 * token-bound styles in the first place. One less dependency, and a conflict becomes
 * a design smell rather than something a library quietly patches over.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
