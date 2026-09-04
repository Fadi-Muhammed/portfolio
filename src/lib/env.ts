import { z } from "zod";

/**
 * Environment variables, validated rather than trusted.
 *
 * Public and server variables are kept in separate schemas on purpose: anything in
 * the public schema is inlined into the client bundle by Next, so a secret must never
 * be added there. Server-only values (Supabase service key, Resend, Turnstile) arrive
 * in the parts that introduce them — Part 3 and Part 13 — and go in `serverSchema`.
 *
 * Both parsers take their source as an argument so they can be tested without
 * mutating the real process environment.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url({
    error: "NEXT_PUBLIC_SITE_URL must be a full URL, for example https://fadimuhammed.work",
  }),
  // Gates the /design token playground. Off unless explicitly turned on, so it can be
  // opened on the deployed site when reviewing but is absent by default.
  NEXT_PUBLIC_ENABLE_DESIGN_ROUTE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  // Public by design. The anon key ships in the client bundle; Row Level Security is
  // what makes that safe, not secrecy.
  NEXT_PUBLIC_SUPABASE_URL: z.url({
    error: "NEXT_PUBLIC_SUPABASE_URL must be the project base URL, https://<ref>.supabase.co",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, { error: "NEXT_PUBLIC_SUPABASE_ANON_KEY looks too short to be a real key" }),
  // Public by design: Turnstile's site key is rendered into the widget's markup. The
  // secret that verifies a token is the other half, and lives in the server schema.
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z
    .string()
    .min(10, { error: "NEXT_PUBLIC_TURNSTILE_SITE_KEY looks too short to be a real key" }),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Bypasses every RLS policy. Server only — it must never gain a NEXT_PUBLIC_ prefix,
  // which is why it lives in this schema and not the one above.
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, { error: "SUPABASE_SERVICE_ROLE_KEY looks too short to be a real key" }),
  // Shared secret for POST /api/revalidate, called by the Supabase database webhook.
  // Long because it is checked by anyone who finds the endpoint.
  REVALIDATE_SECRET: z
    .string()
    .min(32, { error: "REVALIDATE_SECRET should be at least 32 characters" }),
  // Verifies a Turnstile token against Cloudflare. Server only.
  TURNSTILE_SECRET_KEY: z
    .string()
    .min(10, { error: "TURNSTILE_SECRET_KEY looks too short to be a real key" }),
  // Sending-access key. It can send mail and nothing else, which is why a leak is
  // survivable rather than a domain takeover.
  RESEND_API_KEY: z.string().startsWith("re_", {
    error: "RESEND_API_KEY should start with re_",
  }),
  // The shared onboarding sender until the domain is verified — see DECISIONS, 4 September
  // 2026. A variable rather than a literal so verifying the domain is a config change.
  CONTACT_FROM_EMAIL: z.email({ error: "CONTACT_FROM_EMAIL must be an email address" }),
  CONTACT_TO_EMAIL: z.email({ error: "CONTACT_TO_EMAIL must be an email address" }),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

/** Thrown when the environment is missing or malformed. Names the variables at fault. */
export class EnvError extends Error {
  constructor(issues: string[]) {
    super(
      `Environment is not valid:\n${issues.map((line) => `  - ${line}`).join("\n")}\n` +
        `Copy .env.example to .env.local and fill in the values.`,
    );
    this.name = "EnvError";
  }
}

function issuesOf(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  // Read through explicit keys: Next only inlines NEXT_PUBLIC_* values it can see
  // statically, so `source.NEXT_PUBLIC_SITE_URL` must appear literally.
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: source.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ENABLE_DESIGN_ROUTE: source.NEXT_PUBLIC_ENABLE_DESIGN_ROUTE,
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: source.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });
  if (!result.success) throw new EnvError(issuesOf(result.error));
  return result.data;
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverSchema.safeParse({
    NODE_ENV: source.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
    REVALIDATE_SECRET: source.REVALIDATE_SECRET,
    TURNSTILE_SECRET_KEY: source.TURNSTILE_SECRET_KEY,
    RESEND_API_KEY: source.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: source.CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL: source.CONTACT_TO_EMAIL,
  });
  if (!result.success) throw new EnvError(issuesOf(result.error));
  return result.data;
}
