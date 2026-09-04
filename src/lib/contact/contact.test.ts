import { describe, expect, it, vi } from "vitest";
import { contactSchema, fieldErrorsFrom, HONEYPOT_FIELD, MESSAGE_MIN } from "./schema";
import { clientIp, hashIp, isThrottled, MAX_IN_WINDOW, windowStart } from "./throttle";
import { verifyTurnstile } from "./turnstile";
import { buildNotification } from "./notify";

/**
 * The contact form's server side, which is the part of this site a stranger can reach
 * without being invited. These test the decisions rather than the plumbing: what counts
 * as a valid message, who is turned away, and what leaves the building.
 */

const valid = {
  name: "Sam Okonkwo",
  email: "sam@example.com",
  message: "I saw the street lighting write-up and wanted to ask about the fault detector.",
};

describe("validation", () => {
  it("accepts a real message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("trims, so whitespace is not a name", () => {
    const result = contactSchema.safeParse({ ...valid, name: "   " });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsFrom(result.error).name).toBe("Add your name.");
  });

  it.each([["not-an-email"], ["missing@"], ["@example.com"], ["two@@example.com"]])(
    "rejects %s as an address",
    (email) => {
      expect(contactSchema.safeParse({ ...valid, email }).success).toBe(false);
    },
  );

  it("asks for a sentence rather than accepting a word", () => {
    const result = contactSchema.safeParse({ ...valid, message: "hi" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsFrom(result.error).message).toContain(String(MESSAGE_MIN));
    }
  });

  it("caps the message, so the field cannot be used as free storage", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });

  it("reports one message per field, not three", () => {
    const result = contactSchema.safeParse({ name: "", email: "nope", message: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrorsFrom(result.error);
      expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
      expect(Object.values(errors).every((value) => typeof value === "string")).toBe(true);
    }
  });

  it("names the honeypot something a bot expects and a person never sees", () => {
    expect(HONEYPOT_FIELD).toBe("company");
  });
});

describe("hashIp", () => {
  it("is stable for the same address and salt", () => {
    expect(hashIp("203.0.113.9", "salt")).toBe(hashIp("203.0.113.9", "salt"));
  });

  it("does not contain the address it came from", () => {
    const hash = hashIp("203.0.113.9", "salt");
    expect(hash).not.toContain("203.0.113.9");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs with the salt, so a leaked table cannot be reversed with a rainbow table", () => {
    expect(hashIp("203.0.113.9", "one")).not.toBe(hashIp("203.0.113.9", "two"));
  });

  it("answers null when there is no address to hash", () => {
    expect(hashIp(null, "salt")).toBeNull();
    expect(hashIp("", "salt")).toBeNull();
  });
});

describe("clientIp", () => {
  it("takes the first entry of x-forwarded-for, which is the only one a client cannot forge", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.9, 70.41.3.18, 150.172.238.178" });
    expect(clientIp(headers)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
  });

  it("answers null when the request carries neither", () => {
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe("throttling", () => {
  it("lets a person send more than once", () => {
    expect(isThrottled(0)).toBe(false);
    expect(isThrottled(MAX_IN_WINDOW - 1)).toBe(false);
  });

  it("stops at the limit", () => {
    expect(isThrottled(MAX_IN_WINDOW)).toBe(true);
    expect(isThrottled(MAX_IN_WINDOW + 40)).toBe(true);
  });

  it("opens the window ten minutes back", () => {
    const now = new Date("2026-09-04T12:00:00.000Z");
    expect(windowStart(now)).toBe("2026-09-04T11:50:00.000Z");
  });
});

describe("verifyTurnstile", () => {
  const ok = () =>
    Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));

  it("does not call out when there is no token", async () => {
    const fetchImpl = vi.fn();
    const verdict = await verifyTurnstile("", "secret", { fetchImpl: fetchImpl as never });

    expect(verdict).toEqual({ ok: false, reason: "missing-token" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends the secret, the token and the address Cloudflare needs", async () => {
    const fetchImpl = vi.fn(ok);
    await verifyTurnstile("token-abc", "the-secret", {
      remoteIp: "203.0.113.9",
      fetchImpl: fetchImpl as never,
    });

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("challenges.cloudflare.com");
    const body = new URLSearchParams(String(init.body));
    expect(body.get("secret")).toBe("the-secret");
    expect(body.get("response")).toBe("token-abc");
    expect(body.get("remoteip")).toBe("203.0.113.9");
  });

  it("passes a successful verdict through", async () => {
    expect(await verifyTurnstile("t", "s", { fetchImpl: ok as never })).toEqual({ ok: true });
  });

  it("reports a rejection with the codes, so a log says why", async () => {
    const fetchImpl = () =>
      Promise.resolve(
        new Response(JSON.stringify({ success: false, "error-codes": ["timeout-or-duplicate"] }), {
          status: 200,
        }),
      );

    expect(await verifyTurnstile("t", "s", { fetchImpl: fetchImpl as never })).toEqual({
      ok: false,
      reason: "rejected",
      codes: ["timeout-or-duplicate"],
    });
  });

  it("separates Cloudflare being unreachable from a token being wrong", async () => {
    // The two get different answers from the caller: one is the visitor's problem and
    // the other is ours, so folding them together would fail people for our outage.
    const thrown = () => Promise.reject(new Error("network"));
    expect(await verifyTurnstile("t", "s", { fetchImpl: thrown as never })).toEqual({
      ok: false,
      reason: "unreachable",
    });

    const serverError = () => Promise.resolve(new Response("", { status: 500 }));
    expect(await verifyTurnstile("t", "s", { fetchImpl: serverError as never })).toEqual({
      ok: false,
      reason: "unreachable",
    });
  });
});

describe("buildNotification", () => {
  const payload = buildNotification(valid, {
    from: "onboarding@resend.dev",
    to: "work.fmuhammed@gmail.com",
    siteUrl: "https://fadimuhammed.work",
  });

  it("replies to the visitor, not to the sender the mail went out as", () => {
    // The single most useful line in the email: hitting reply reaches the person who
    // wrote in rather than Resend's shared address.
    expect(payload.replyTo).toBe(valid.email);
    expect(payload.from).toBe("onboarding@resend.dev");
    expect(payload.to).toBe("work.fmuhammed@gmail.com");
  });

  it("puts the name in the subject, because that is what an inbox list shows", () => {
    expect(payload.subject).toBe("Portfolio contact — Sam Okonkwo");
  });

  it("carries the message and the address in the body", () => {
    expect(payload.text).toContain(valid.message);
    expect(payload.text).toContain(valid.email);
    expect(payload.text).toContain("https://fadimuhammed.work");
  });

  it("survives having no site URL configured", () => {
    const bare = buildNotification(valid, { from: "a@b.co", to: "c@d.co" });
    expect(bare.text).toContain("Sent from the contact form");
    expect(bare.text).not.toContain("undefined");
  });
});
