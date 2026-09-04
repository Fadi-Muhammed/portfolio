"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { buildNotification, sendNotification } from "@/lib/contact/notify";
import {
  clientIp,
  hashIp,
  isThrottled,
  THROTTLE_MESSAGE,
  windowStart,
} from "@/lib/contact/throttle";
import { verifyTurnstile } from "@/lib/contact/turnstile";
import {
  contactSchema,
  fieldErrorsFrom,
  HONEYPOT_FIELD,
  type ContactResult,
} from "@/lib/contact/schema";

/**
 * Receiving a contact message.
 *
 * A server action rather than a route handler, because the form can then call it
 * directly and — with `action={submitContact}` on the form element — still work with
 * JavaScript switched off. B9 asks for that fallback where feasible; here it is feasible,
 * which is why the return type is data the form can render rather than a redirect.
 *
 * The order of the checks is the design. Cheap and local first, network last: an
 * obviously invalid submission never costs a Cloudflare round trip, and a bot caught by
 * the honeypot costs nothing at all.
 */

const FAILURE_MESSAGE = "Message didn't send. Check your connection and try again.";

export async function submitContact(formData: FormData): Promise<ContactResult> {
  /*
   * The honeypot, first and silently.
   *
   * A filled honeypot is answered with "sent". Telling a bot it was detected is telling
   * it what to change, and the visitor who could see this field does not exist.
   */
  if (String(formData.get(HONEYPOT_FIELD) ?? "").trim() !== "") {
    return { status: "sent" };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { status: "invalid", fields: fieldErrorsFrom(parsed.error) };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!secret || !apiKey || !from || !to) {
    // A misconfigured server is our fault, and the visitor is told the truth about it
    // rather than being blamed for a message they wrote correctly.
    console.error("Contact form is not configured: missing Turnstile or Resend variables.");
    return { status: "failed", message: FAILURE_MESSAGE };
  }

  const headerList = await headers();
  const ip = clientIp(headerList);

  const verdict = await verifyTurnstile(
    String(formData.get("cf-turnstile-response") ?? ""),
    secret,
    {
      remoteIp: ip,
    },
  );

  if (!verdict.ok) {
    /*
     * An unreachable Cloudflare is our outage, not the visitor's. Failing them for it
     * would mean the form goes down whenever a third party does, and the honeypot,
     * validation and throttle are all still standing. A rejected token is different:
     * something answered the challenge wrongly, and that is worth stopping.
     */
    if (verdict.reason !== "unreachable") {
      return {
        status: "failed",
        message: "That didn't look like a human. Refresh the page and try again.",
      };
    }
    console.error("Turnstile was unreachable; accepting the message on the other checks.");
  }

  const supabase = createServiceClient();
  const ipHash = hashIp(ip, process.env.REVALIDATE_SECRET ?? "");

  if (ipHash) {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart());

    // A failed count is not a reason to turn someone away: if the throttle cannot be
    // measured, the other four checks still apply.
    if (!error && isThrottled(count ?? 0)) {
      return { status: "throttled", message: THROTTLE_MESSAGE };
    }
  }

  const { error: insertError } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    ip_hash: ipHash,
    user_agent: headerList.get("user-agent"),
    source: "contact-form",
  });

  if (insertError) {
    console.error("Contact message was not stored:", insertError.message);
    return { status: "failed", message: FAILURE_MESSAGE };
  }

  /*
   * The message is safely stored by this point, so the notification is best-effort. A
   * Resend outage costs a prompt reply, not the message — and telling someone their
   * message failed when it is sitting in the database would be a lie that also invites
   * them to send it again.
   */
  await sendNotification(
    buildNotification(parsed.data, { from, to, siteUrl: process.env.NEXT_PUBLIC_SITE_URL }),
    apiKey,
  );

  return { status: "sent" };
}
