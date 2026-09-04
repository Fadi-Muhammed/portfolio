import { z } from "zod";

/**
 * What a contact message has to be, checked in one place and used on both sides.
 *
 * The client validates with this to show a message beside the field the moment focus
 * leaves it; the server validates with the same schema because the client's opinion is
 * a courtesy, not a control. One definition means the two can never drift into
 * disagreeing about what a valid message is.
 *
 * The messages are the ones a person reads, so they say what to do rather than what
 * failed: "Add your name", not "name is required".
 */

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const NAME_MAX = 100;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Add your name." })
    .max(NAME_MAX, { error: `Keep the name under ${NAME_MAX} characters.` }),
  email: z
    .string()
    .trim()
    .min(1, { error: "Add an email address so I can reply." })
    .pipe(z.email({ error: "That does not look like an email address." })),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, { error: `A sentence or two, please — at least ${MESSAGE_MIN} characters.` })
    .max(MESSAGE_MAX, { error: `Keep it under ${MESSAGE_MAX} characters.` }),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * The honeypot.
 *
 * A field a person never sees and never fills, positioned off-screen rather than
 * `display: none` — some bots skip hidden inputs, and rather more of them fill in
 * anything with a plausible name. It is called `company` because that is what a bot
 * expects to find on a contact form, and `autocomplete="off"` with `tabIndex={-1}` keeps
 * a browser's autofill and a keyboard visitor away from it.
 *
 * A filled honeypot is answered with success, not with an error. Telling a bot it was
 * detected is telling it what to change.
 */
export const HONEYPOT_FIELD = "company";

/** Field-level errors, keyed by field. Empty when the input was fine. */
export type FieldErrors = Partial<Record<keyof ContactInput, string>>;

export function fieldErrorsFrom(error: z.ZodError<ContactInput>): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in ({ name: 1, email: 1, message: 1 } as const)) {
      const key = field as keyof ContactInput;
      // First message per field: a list of three complaints about one input is noise.
      errors[key] ??= issue.message;
    }
  }
  return errors;
}

/**
 * What the server hands back. A discriminated union rather than loose flags, so a caller
 * cannot render "sent" and an error at the same time.
 */
export type ContactResult =
  | { status: "sent" }
  | { status: "invalid"; fields: FieldErrors }
  | { status: "throttled"; message: string }
  | { status: "failed"; message: string };
