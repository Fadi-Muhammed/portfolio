"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { Link } from "@/components/ui/link";
import { submitContact } from "@/app/contact/actions";
import {
  contactSchema,
  fieldErrorsFrom,
  HONEYPOT_FIELD,
  MESSAGE_MAX,
  type ContactResult,
  type FieldErrors,
} from "@/lib/contact/schema";
import { Handshake } from "./handshake";
import { Turnstile } from "./turnstile-widget";

/**
 * The contact form.
 *
 * `useActionState` with the server action means the form element carries a real `action`,
 * so it still posts and still works with JavaScript switched off — B9 asks for that where
 * feasible, and here it costs nothing. Everything below is enhancement over a form that
 * already functions.
 *
 * Validation happens twice and that is deliberate: here on blur so a mistake is caught
 * beside the field while the visitor is still looking at it, and again on the server
 * because the client's opinion is a courtesy rather than a control. Both use the same
 * schema, so they cannot come to disagree.
 */

const initial: ContactResult | null = null;

export function ContactForm({ email }: { email: string | null }) {
  const [result, formAction, pending] = useActionState(
    async (_previous: ContactResult | null, formData: FormData) => submitContact(formData),
    initial,
  );

  // Errors found here on blur, kept apart from the server's so a fresh submission does
  // not resurrect a message the visitor has already fixed.
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const headingId = useId();

  const serverErrors = result?.status === "invalid" ? result.fields : {};
  const errors: FieldErrors = { ...serverErrors, ...localErrors };
  const sent = result?.status === "sent";

  // Clear the fields once, on success, so a second message starts from a blank form
  // rather than the last one.
  useEffect(() => {
    if (sent) formRef.current?.reset();
  }, [sent]);

  /** Validates one field against the shared schema, on blur. */
  const validateField = (field: "name" | "email" | "message", value: string) => {
    const result = contactSchema.safeParse({
      name: field === "name" ? value : "placeholder",
      email: field === "email" ? value : "placeholder@example.com",
      message: field === "message" ? value : "placeholder message text",
    });

    setLocalErrors((current) => {
      const next = { ...current };
      if (result.success) delete next[field];
      else {
        const found = fieldErrorsFrom(result.error)[field];
        if (found) next[field] = found;
        else delete next[field];
      }
      return next;
    });
  };

  if (sent) {
    return (
      <div className="contact-sent" role="status" aria-live="polite">
        <Handshake />
        <p className="text-h3 text-ink">Message sent</p>
        <p className="text-body text-muted measure">
          It lands in my inbox and I reply from there. If it is urgent, the email address is below.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="contact-form" aria-labelledby={headingId}>
      <h3 id={headingId} className="sr-only">
        Send a message
      </h3>

      <Input
        label="Name"
        name="name"
        autoComplete="name"
        required
        error={errors.name}
        onBlur={(event) => validateField("name", event.target.value)}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={errors.email}
        onBlur={(event) => validateField("email", event.target.value)}
      />

      <Textarea
        label="Message"
        name="message"
        rows={4}
        maxLength={MESSAGE_MAX}
        required
        error={errors.message}
        onBlur={(event) => validateField("message", event.target.value)}
      />

      {/*
        The honeypot. Off-screen rather than display:none — some bots skip hidden inputs
        and rather more of them fill anything with a plausible name. aria-hidden and
        tabIndex keep it away from a screen reader and a keyboard alike.
      */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD}>Company</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Turnstile />

      <div className="contact-form__foot">
        <Button type="submit" loading={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>

        {result?.status === "failed" || result?.status === "throttled" ? (
          <p className="contact-form__error text-small text-danger" role="alert">
            {result.message}
            {email ? (
              <>
                {" "}
                <Link href={`mailto:${email}`} className="text-small">
                  Email me directly
                </Link>
                .
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  );
}
