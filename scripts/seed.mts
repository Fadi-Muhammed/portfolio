/**
 * Loads content/seed/*.json into Supabase.
 *
 *   npm run db:seed
 *
 * Idempotent: every row is upserted on its slug, and site_settings on its singleton
 * column, so running this twice changes nothing. That matters because seeding is not a
 * one-off — it is how content edited in the repo gets to the database, repeatedly.
 *
 * Validation happens before anything is written. Postgres would reject a bad row too,
 * but one at a time and in its own vocabulary; zod fails the whole run with every
 * problem listed, naming the file, the row and the field.
 *
 * Uses the service-role key, which bypasses RLS. That is the point: seeding writes
 * unpublished rows, which no other client can do. The key is read from .env.local and
 * never leaves this process.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { seedTables, siteSettingsSchema, type SeedTable } from "../src/lib/content/schemas.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const SEED_DIR = path.join(ROOT, "content", "seed");
const ENV_FILE = path.join(ROOT, ".env.local");

if (!existsSync(ENV_FILE)) {
  console.error("No .env.local found. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

process.loadEnvFile(ENV_FILE);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Seeding needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function reportIssues(file: string, index: number | null, error: z.ZodError): string[] {
  const where = index === null ? file : `${file}[${index}]`;
  return error.issues.map(
    (issue) => `  ${where} → ${issue.path.join(".") || "(root)"}: ${issue.message}`,
  );
}

async function readJson(file: string): Promise<unknown> {
  const raw = await readFile(path.join(SEED_DIR, file), "utf8");
  return JSON.parse(raw) as unknown;
}

async function seedTable(table: SeedTable): Promise<number> {
  const file = `${table}.json`;
  const parsed = await readJson(file);

  if (!Array.isArray(parsed)) {
    throw new Error(`${file} must contain an array`);
  }

  const schema = seedTables[table];
  const rows: unknown[] = [];
  const problems: string[] = [];

  parsed.forEach((row, index) => {
    const result = schema.safeParse(row);
    if (result.success) rows.push(result.data);
    else problems.push(...reportIssues(file, index, result.error));
  });

  if (problems.length > 0) {
    throw new Error(`${file} is not valid:\n${problems.join("\n")}`);
  }

  if (rows.length === 0) return 0;

  const { error } = await supabase.from(table).upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(`Could not seed ${table}: ${error.message}`);

  return rows.length;
}

async function seedSiteSettings(): Promise<number> {
  const parsed = await readJson("site_settings.json");
  const result = siteSettingsSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(
      `site_settings.json is not valid:\n${reportIssues("site_settings.json", null, result.error).join("\n")}`,
    );
  }

  // singleton is unique and constrained to true, so this updates the one row rather
  // than ever creating a second.
  const { error } = await supabase
    .from("site_settings")
    .upsert({ ...result.data, singleton: true }, { onConflict: "singleton" });

  if (error) throw new Error(`Could not seed site_settings: ${error.message}`);
  return 1;
}

async function main(): Promise<void> {
  const counts: Array<[string, number]> = [];

  for (const table of Object.keys(seedTables) as SeedTable[]) {
    counts.push([table, await seedTable(table)]);
  }
  counts.push(["site_settings", await seedSiteSettings()]);

  console.log("Seeded:\n");
  for (const [table, count] of counts) {
    console.log(`  ${table.padEnd(22)} ${count}`);
  }

  // Published counts are what the site will actually show, and they are usually the
  // number someone is surprised by.
  console.log("\nPublished (what the site will render):\n");
  for (const table of Object.keys(seedTables) as SeedTable[]) {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("published", true);
    if (error) throw new Error(`Could not count ${table}: ${error.message}`);
    console.log(`  ${table.padEnd(22)} ${count ?? 0}`);
  }
}

await main();
