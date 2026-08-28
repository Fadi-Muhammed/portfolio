/**
 * Uploads content/assets/** to the matching Supabase Storage buckets.
 *
 *   npm run assets:upload
 *   npm run assets:upload -- --force    # re-upload everything
 *
 * The folder name is the bucket name, and the path below it is the path inside the
 * bucket: content/assets/media/rubric/cover.png becomes media/rubric/cover.png, which
 * is exactly the string that goes in a row's cover_image_path.
 *
 * Idempotent. A file whose size matches the object already in the bucket is skipped,
 * so re-running costs nothing. Size is a cheap proxy rather than a real comparison —
 * an edit that happens to preserve byte length will not be detected — which is what
 * --force is for.
 *
 * Uses the service-role key: the buckets are public to read and closed to write.
 */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS_DIR = path.join(ROOT, "content", "assets");
const ENV_FILE = path.join(ROOT, ".env.local");

const BUCKETS = ["media", "logos", "documents"] as const;
type Bucket = (typeof BUCKETS)[number];

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};

if (!existsSync(ENV_FILE)) {
  console.error("No .env.local found. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

process.loadEnvFile(ENV_FILE);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Uploading needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const force = process.argv.includes("--force");
const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Every file under dir, as paths relative to it, using forward slashes. */
async function walk(dir: string, prefix = ""): Promise<string[]> {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "README.md") continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await walk(path.join(dir, entry.name), relative)));
    } else {
      files.push(relative);
    }
  }

  return files;
}

/** Object path to byte size for everything already in the bucket. */
async function remoteSizes(bucket: Bucket, prefix = ""): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });

  if (error) throw new Error(`Could not list ${bucket}: ${error.message}`);
  if (!data) return sizes;

  for (const entry of data) {
    const full = prefix ? `${prefix}/${entry.name}` : entry.name;
    // A folder comes back with no id; recurse into it.
    if (entry.id === null) {
      for (const [key, value] of await remoteSizes(bucket, full)) sizes.set(key, value);
    } else {
      const size = (entry.metadata as { size?: number } | null)?.size;
      if (typeof size === "number") sizes.set(full, size);
    }
  }

  return sizes;
}

async function uploadBucket(bucket: Bucket): Promise<{ uploaded: number; skipped: number }> {
  const dir = path.join(ASSETS_DIR, bucket);
  const files = await walk(dir);

  if (files.length === 0) return { uploaded: 0, skipped: 0 };

  const remote = force ? new Map<string, number>() : await remoteSizes(bucket);
  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const local = path.join(dir, ...file.split("/"));
    const { size } = await stat(local);

    if (remote.get(file) === size) {
      skipped += 1;
      continue;
    }

    const body = await readFile(local);
    const contentType =
      CONTENT_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";

    const { error } = await supabase.storage.from(bucket).upload(file, body, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

    if (error) throw new Error(`Could not upload ${bucket}/${file}: ${error.message}`);

    console.log(`  uploaded  ${bucket}/${file}`);
    uploaded += 1;
  }

  return { uploaded, skipped };
}

async function main(): Promise<void> {
  if (!existsSync(ASSETS_DIR)) {
    console.log("No content/assets directory. Nothing to upload.");
    return;
  }

  let uploaded = 0;
  let skipped = 0;

  for (const bucket of BUCKETS) {
    const result = await uploadBucket(bucket);
    uploaded += result.uploaded;
    skipped += result.skipped;
  }

  if (uploaded === 0 && skipped === 0) {
    console.log("content/assets is empty. Add files, then run this again.");
    console.log("See content/assets/README.md for where each file goes.");
    return;
  }

  console.log(`\n${uploaded} uploaded, ${skipped} unchanged.`);
}

await main();
