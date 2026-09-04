# Backend

How the Supabase side of this site works, and how to change it safely. Written in
Part 3; the data layer that reads from it arrives in Part 4.

Project: **Portfolio**, ref `hulswrqpouaokbrbrflk`, region `ap-northeast-1` (Tokyo).

---

## The rule that matters

**The schema is only ever changed by a migration.** Not in the Studio SQL editor, not by
clicking in the table editor. A change made in the dashboard exists in exactly one
place — that database — and the next `db push` from a clean checkout will not know
about it. Content is edited in Studio; structure is edited in `supabase/migrations`.

---

## Making a schema change

```bash
npm run db:new -- add_testimonials     # creates supabase/migrations/<timestamp>_add_testimonials.sql
# write the SQL
npm run db:push                        # applies it to the linked project
npm run db:types                       # regenerates src/lib/supabase/types.ts
```

Then commit the migration **and** the regenerated types together. They are one change;
splitting them leaves the repo describing a schema that does not exist.

`npm run db:types` writes `src/lib/supabase/types.ts`. That file is generated — never
edit it by hand, because the next push overwrites it.

### The scripts

All three go through `scripts/supabase.mts`, which loads `.env.local` before running
the CLI. npm scripts do not read `.env.local` on their own, and the CLI needs
`SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` from the environment. The wrapper
fails with a message naming the missing variable rather than a connection error.

It runs the CLI's JS entry point with `node` directly rather than through
`node_modules/.bin`. That avoids a shell, which on Windows would split this project's
path at the space in "Portfolio site".

---

## Security

Two independent gates. Understanding both matters, because each one alone is a hole.

**Gate 1 — GRANTs.** Whether a role can see a table through the Data API at all. The
project was created with _"automatically expose new tables"_ switched off, so a new
table is invisible until granted by name in a migration. The failure mode is a page
that cannot load its content: visible, and safe. The alternative failure mode — a
table quietly readable by the public — is neither.

**Gate 2 — Row Level Security.** Which rows a role may read. Enabled on all nine
tables. With RLS on and no policy attached, the answer is "none".

### What the anon role can do

|                     |                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Read published rows | `products`, `engineering_projects`, `achievements`, `featured_in`, `skills`, `certifications`, `experience` |
| Read all rows       | `site_settings` — one row, and it is the site's own copy                                                    |
| Everything else     | Nothing. No insert, update or delete policy exists anywhere for anon.                                       |
| `contact_messages`  | No grant, no policy, and an explicit `REVOKE`. Returns 401.                                                 |

`published` defaults to **false**, so a new row is private until deliberately
published. That is the safety property: forgetting to set a flag hides content, it
does not expose it.

### Verified, not assumed

Run against the live database at the end of Part 3:

- Reads on all eight public tables: 200
- `contact_messages`: **401**
- Anon insert, update, delete: **401**
- An unpublished row inserted by the server: **invisible** to anon
- The same row after publishing: **visible**
- `updated_at` trigger: fires on update

Worth re-running after any change to policies or grants.

### The keys

| Variable                        | Public? | What it can do                                                         |
| ------------------------------- | ------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes     | Nothing on its own                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes     | Read published rows. Ships in the browser bundle by design.            |
| `SUPABASE_SERVICE_ROLE_KEY`     | **No**  | **Bypasses every policy.** Read drafts, read messages, write anything. |
| `SUPABASE_ACCESS_TOKEN`         | **No**  | Manage the project via the CLI. Local tooling only.                    |
| `SUPABASE_DB_PASSWORD`          | **No**  | Direct Postgres connection. Local tooling only.                        |

The service-role key must never gain a `NEXT_PUBLIC_` prefix — that prefix is what
tells Next to compile a value into the JavaScript every visitor downloads.

Two things enforce this. It lives in the _server_ schema in `src/lib/env.ts`, so the
public parser neither validates nor returns it. And `src/lib/supabase/server.ts` opens
with `import "server-only"`, which makes the build fail at compile time if any client
component imports it, however indirectly.

---

## Storage buckets

| Bucket      | Holds                             | Access      |
| ----------- | --------------------------------- | ----------- |
| `media`     | Covers, galleries, photos         | Public read |
| `logos`     | Featured-in logos, monochrome SVG | Public read |
| `documents` | The CV, engineering reports       | Public read |

Public read is deliberate: these are files meant to be linked from a portfolio, and
signed URLs would buy nothing but latency. **Writing is not public** — no insert or
update policy exists for anon, so uploads happen through Studio or the upload script
using the service key.

Columns store the **path within the bucket**, not a full URL. Public URLs are built at
render time, so moving buckets or adding a CDN later does not mean rewriting rows.

---

## Editing content in Studio

Day to day, this is where content changes — no code, no deploy.

1. Supabase dashboard → **Table Editor**
2. Pick the table, **Insert row**, fill the fields
3. Set `sort_order` to control position on the page
4. Tick **`published`** — nothing appears on the site until you do
5. Images: **Storage** → the right bucket → upload, then paste the _path_ into the row

Some fields are `jsonb` (`links`, `gallery`, `metrics`, `socials`) and expect an
object, e.g. `{"coverage": "https://…", "video_url": "https://…"}`. Others are text
arrays (`stack`, `concepts`, `highlights`) and expect `{"one","two"}` in Studio.

`site_settings` holds exactly one row, enforced by a database constraint. Edit it;
do not try to add a second, which will be rejected.

Changes appear on the site within about five minutes once ISR is wired in Part 4,
which also adds a webhook to push them through immediately.

---

## Tables

Nine, all with `id`, `created_at`, `updated_at`. Content tables add `slug` (unique),
`sort_order` and `published`. Every table carries a SQL `COMMENT` describing what it is
for — visible in Studio and in `\d+` — so the schema explains itself.

| Table                  | For                                                                  |
| ---------------------- | -------------------------------------------------------------------- |
| `products`             | Tech products built and shipped. Case studies at `/products/[slug]`. |
| `engineering_projects` | Lab, capstone, course and personal work. `/engineering/[slug]`.      |
| `achievements`         | Competitions, hackathons, programs, awards, talks. One hop per row.  |
| `featured_in`          | Press, stages, programs. Logos only.                                 |
| `skills`               | Software and telecom skills, each linked to work that proves it.     |
| `certifications`       | CCNA and similar.                                                    |
| `experience`           | Internships, jobs, volunteering, leadership, education.              |
| `site_settings`        | The one row of site-wide copy.                                       |
| `contact_messages`     | Form submissions. Server-written only.                               |

Enums are used for every typed column, so a typo fails the insert rather than silently
dropping a row out of a filter.

`testimonials` from B11 is **not** created. It is optional and belongs to Part 18; the
migration that adds it should be written when the decision is made.

---

## Seeding content

Content lives in two places, and the difference matters:

- **`content/seed/*.json` in this repo** — version-controlled, reviewable, and the way
  content gets loaded in bulk.
- **Supabase Studio** — the way a single row gets edited day to day, with no deploy.

Neither overwrites the other silently. Seeding upserts **by slug**, so it updates rows it
already created and leaves anything else alone. Running it twice changes nothing.

```bash
npm run db:seed
```

It validates every file against the zod schemas in `src/lib/content/schemas.ts` before
writing anything. A bad row fails the whole run with the file, row and field named,
rather than getting halfway and leaving the database in a half-seeded state.

The output prints two counts per table: how many rows were seeded, and how many are
**published**. The second is what the site actually renders, and it is usually the
surprising one.

### Assets

```bash
npm run assets:upload            # skips files already uploaded at the same size
npm run assets:upload -- --force # re-upload everything
```

Folder name is bucket name: `content/assets/media/rubric/cover.png` uploads to
`media/rubric/cover.png`, which is the exact string that goes in `cover_image_path`.
See `content/assets/README.md`.

---

## On-demand revalidation

Pages cache their reads for 300 seconds. Without a webhook, an edit in Studio takes up
to five minutes to appear. With one, it appears immediately.

`POST /api/revalidate` drops the cache for one table. It is authenticated by a shared
secret in the `x-revalidate-secret` header, compared in constant time.

### Creating the webhook

Once per content table, in the Supabase dashboard:

1. **Database → Webhooks → Create a new hook**
2. Name it after the table, e.g. `revalidate-products`
3. **Table**: the content table
4. **Events**: tick **Insert**, **Update** and **Delete**
5. **Type**: HTTP Request
6. **Method**: `POST`
7. **URL**: `https://<your-domain>/api/revalidate`
8. **HTTP Headers**: add `x-revalidate-secret` with the value of `REVALIDATE_SECRET`
9. Create

The webhook already sends `{ type, table, record, old_record, schema }`, and the route
reads `table` from it, so no custom payload is needed.

`REVALIDATE_SECRET` must be set in Vercel as a **Secret**, matching `.env.local`.
Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

If it is not set, the route answers 503 rather than revalidating freely — an unset
secret is a misconfiguration, and treating it as "no auth needed" would be the worst
possible default.

### Checking it works

```bash
curl -X POST https://<your-domain>/api/revalidate   -H "x-revalidate-secret: <the secret>"   -H "Content-Type: application/json"   -d '{"table":"products"}'
```

Expect `{"revalidated":"products"}`. A wrong secret gives 401; an unknown table gives
400 without echoing what was sent.

---

## Health check

`GET /api/health` returns `{"status":"ok","database":"reachable"}` when the anon key can
reach the database.

It checks with the **anon** client deliberately. A health check should walk the same
path a visitor does — checking with the service key would report healthy even with the
grants or RLS broken for everyone else.

It reports status and nothing else: no URL, no key, no driver error text. The endpoint
is public, and driver errors leak schema details.

| Response             | Means                                    |
| -------------------- | ---------------------------------------- |
| `ok` / 200           | Reachable                                |
| `degraded` / 503     | Configured, but the query failed         |
| `unconfigured` / 503 | No Supabase environment — expected in CI |

---

## The contact flow (Part 13)

What happens between someone pressing "Send message" and Fadi reading it.

### The path

1. **Honeypot.** A field called `company`, off-screen and `aria-hidden`, that no person
   sees. Filled means a bot, and the answer is `{ status: "sent" }` — success, immediately,
   with nothing written and nothing sent. Telling a bot it was detected is telling it what
   to change.
2. **Validation** against `contactSchema`, the same zod schema the form uses on blur. The
   client's opinion is a courtesy; this is the control.
3. **Turnstile**, verified server-side against Cloudflare with the secret and the client's
   IP. A token is single-use and short-lived, so a replayed one is refused by Cloudflare
   rather than by us.
4. **Throttle.** Messages from the same hashed IP in the last ten minutes are counted; three
   is the limit.
5. **Insert** into `contact_messages` with the service-role client — the table has no anon
   policy at all, so this is the only way a row can arrive.
6. **Notify** through Resend, best-effort.

Cheap and local first, network last: an invalid submission never costs a Cloudflare round
trip, and a bot caught by the honeypot costs nothing at all.

### What is stored, and what is not

`contact_messages` holds the name, the email, the message, the user agent, and `ip_hash` —
never the address itself. The hash is a salted SHA-256 using `REVALIDATE_SECRET` as the
salt: stable enough to count against for ten minutes, irreversible, and useless to anyone
who reads the table. The salt is reused rather than introduced because it is already
required, already long, and already server-only.

### Three failures, three answers

| Failure                       | Answer                           | Why                                                                                                                                             |
| ----------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Turnstile rejects the token   | "That didn't look like a human." | Something answered the challenge wrongly.                                                                                                       |
| Cloudflare is unreachable     | The message is accepted.         | Our outage, not the visitor's. Four other checks still apply, and the form must not go down when a third party does.                            |
| Resend fails after the insert | Success.                         | The message is in the database. A missing notification costs a prompt reply, not the message — and saying it failed would invite a second send. |
| The throttle query fails      | The message is accepted.         | If the limit cannot be measured, the other checks still stand.                                                                                  |

### Environment

| Variable                         | Where  | Notes                                                                                                                      |
| -------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Rendered into the widget. Public by design.                                                                                |
| `TURNSTILE_SECRET_KEY`           | Server | Verifies the token. Never prefixed.                                                                                        |
| `RESEND_API_KEY`                 | Server | **Sending access only.** A full-access key that leaked would let someone read the logs and edit sending domains.           |
| `CONTACT_FROM_EMAIL`             | Server | `onboarding@resend.dev` until the domain is verified.                                                                      |
| `CONTACT_TO_EMAIL`               | Server | Must be the address that owns the Resend account while the shared sender is in use — that sender can deliver nowhere else. |

CI and Vercel previews use Cloudflare's published always-pass keys
(`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`). A preview runs on
`*.vercel.app`, which cannot be added to a widget's hostname list and cannot be wildcarded,
so there is no other workable answer there.

### Verifying a real send

The automated suite deliberately never writes a row: it reaches the success state through
the honeypot, which returns before touching anything. To check the whole path for real:

1. `npm run dev`, open the site, hop to Contact, and send a message from a normal browser.
   A headless one cannot solve a Managed challenge, which is the widget working.
2. Confirm the row: Supabase Studio, `contact_messages`, newest first.
3. Confirm the email arrives at `CONTACT_TO_EMAIL`, and that replying to it reaches the
   address that was typed into the form rather than Resend.
