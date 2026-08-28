/**
 * Runs the Supabase CLI with the credentials from .env.local loaded.
 *
 *   node scripts/supabase.mts db push
 *   node scripts/supabase.mts gen types --lang=typescript --linked
 *
 * npm scripts do not read .env.local, and the CLI wants SUPABASE_ACCESS_TOKEN and
 * SUPABASE_DB_PASSWORD from the environment. Loading the file here keeps both secrets
 * in the one gitignored place instead of being exported by hand every session — and
 * avoids adding dotenv-cli for what Node 22 already does natively.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");

if (!existsSync(ENV_FILE)) {
  console.error("No .env.local found. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

process.loadEnvFile(ENV_FILE);

const missing = ["SUPABASE_ACCESS_TOKEN", "SUPABASE_PROJECT_REF"].filter(
  (name) => !process.env[name],
);

if (missing.length > 0) {
  console.error(`.env.local is missing: ${missing.join(", ")}`);
  process.exit(1);
}

// The CLI resolves the linked project from supabase/.temp, but db push additionally
// needs the database password. Named explicitly so the failure is legible.
const needsDatabase = process.argv[2] === "db";
if (needsDatabase && !process.env.SUPABASE_DB_PASSWORD) {
  console.error(
    "SUPABASE_DB_PASSWORD is not set in .env.local, and `supabase db` needs it to\n" +
      "connect to Postgres. Supabase dashboard: Settings > Database > Reset database\n" +
      "password if you no longer have it.",
  );
  process.exit(1);
}

const binary = path.join(
  ROOT,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "supabase.cmd" : "supabase",
);

const child = spawn(binary, process.argv.slice(2), {
  cwd: ROOT,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (error) => {
  console.error(`Could not run the Supabase CLI: ${error.message}`);
  process.exit(1);
});
