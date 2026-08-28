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

// The package's bin is a plain JS file, so it is run with node directly rather than
// through node_modules/.bin. That avoids a shell entirely — and on Windows a shell
// would split this project's path at the space in "Portfolio site".
const entry = path.join(ROOT, "node_modules", "supabase", "dist", "supabase.js");

if (!existsSync(entry)) {
  console.error("The supabase CLI is not installed. Run: npm i -D supabase");
  process.exit(1);
}

const child = spawn(process.execPath, [entry, ...process.argv.slice(2)], {
  cwd: ROOT,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (error) => {
  console.error(`Could not run the Supabase CLI: ${error.message}`);
  process.exit(1);
});
