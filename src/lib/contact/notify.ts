import "server-only";
import type { ContactInput } from "./schema";

/**
 * The notification email.
 *
 * Built as data rather than sent here, so a test can assert what would be sent without a
 * network, a key or a mock of the Resend client. `sendNotification` is the thin part that
 * actually calls out.
 *
 * The email is plain text. It goes to one person, it is read on a phone, and every line
 * in it is something the sender typed — an HTML template would be styling a stranger's
 * words for an audience of one.
 */

export type EmailPayload = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export function buildNotification(
  input: ContactInput,
  options: { from: string; to: string; siteUrl?: string },
): EmailPayload {
  /*
   * `reply_to` is the visitor, so hitting reply in Gmail reaches the person who wrote in
   * rather than Resend's shared sender. It is the single most useful line in this file.
   */
  return {
    from: options.from,
    to: options.to,
    replyTo: input.email,
    // The name is in the subject because that is what the inbox list shows, and the
    // prefix is there so a filter can find these without matching on a person's name.
    subject: `Portfolio contact — ${input.name}`,
    text: [
      `${input.name} <${input.email}>`,
      "",
      input.message,
      "",
      "—",
      "Sent from the contact form" + (options.siteUrl ? ` at ${options.siteUrl}` : ""),
      "Reply to this email to answer them directly.",
    ].join("\n"),
  };
}

/**
 * Sends it, and reports whether it went.
 *
 * The caller does not fail the visitor's submission when this returns false. The message
 * is already in the database at that point, so a Resend outage costs a notification, not
 * a conversation — and telling someone their message failed when it did not is worse than
 * a late reply.
 */
export async function sendNotification(payload: EmailPayload, apiKey: string): Promise<boolean> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
    });

    if (error) {
      console.error("Contact notification was not sent:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Contact notification threw:", error);
    return false;
  }
}
