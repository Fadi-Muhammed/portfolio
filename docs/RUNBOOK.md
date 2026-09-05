# Runbook

How to run this site without reading the code. Written for the person who owns it.

Everything here assumes you are signed in to Supabase, Vercel and GitHub as yourself. Nothing
in this file needs a terminal unless it says so.

---

## Where things live

| Thing                      | Where                                              |
| -------------------------- | -------------------------------------------------- |
| Content (all of it)        | Supabase → your project → Table Editor             |
| Images, logos, the CV      | Supabase → Storage → `media`, `logos`, `documents` |
| Hosting, domains, env vars | Vercel → the `portfolio` project                   |
| Analytics                  | cloud.umami.is → fadimuhammed.work                 |
| Source                     | github.com/Fadi-Muhammed/portfolio (private)       |
| Errors and server logs     | Vercel → the project → Logs                        |

---

## Edit any text on the site

Almost every word comes from one table. Supabase → **Table Editor** → `site_settings`. It has
exactly one row; edit the cell and save.

| Column                                       | What it is on the page                            |
| -------------------------------------------- | ------------------------------------------------- |
| `tagline`                                    | The huge line in the hero                         |
| `eyebrow`                                    | The small line above it                           |
| `availability`                               | "Open to work…" in the hero and Contact           |
| `quote`, `quote_author`                      | The quote under the hero buttons                  |
| `bio`, `currently`                           | The two paragraphs in About                       |
| `email`                                      | Everywhere the address is offered                 |
| `socials`                                    | LinkedIn and GitHub links, as JSON                |
| `cv_path`                                    | Which file in `documents` the CV button downloads |
| `maintenance_message`                        | The line on the maintenance page                  |
| `hero_primary_label`, `hero_secondary_label` | The two hero buttons                              |

Changes appear within five minutes. To see one immediately, redeploy in Vercel (Deployments →
the newest → ⋯ → Redeploy).

---

## Replace the CV

1. Supabase → **Storage** → `documents`.
2. Upload the new PDF. If you name it exactly `cv.pdf` it replaces the old one and you are
   done — tick "Overwrite" if asked.
3. If you name it something else, go to `site_settings` and set `cv_path` to the new filename.

Check it: open the site, hop to About, click **Download CV**. The button states the file size,
so if the size did not change, the upload did not take.

---

## Add a product or an engineering project

Two ways. Studio is faster for one; the seed file is better if you are adding several.

**In Studio.** Table Editor → `products` (or `engineering_projects`) → Insert row. The columns
that matter: `slug` (lowercase, hyphens, this becomes the URL), `title`, `summary`, `body`
(markdown), `stack`, `tags`, `cover_image_path`, `live_url`, `repo_url`, `sort_order`, and
`published` — **which must be `true` or nothing appears**. Upload the cover to Storage →
`media` first and put its path in `cover_image_path`.

**From the seed files.** Edit `content/seed/products.json`, then run:

```bash
npm run db:seed
```

It upserts by slug, so running it twice is safe and editing an existing entry updates it.

**Then do the thing that is easy to forget.** Open `content/seed/skills.json` and add the new
slug to every skill the project evidences, then set those skills `published: true` if they now
have work behind them. Seventeen skills are deliberately unpublished because nothing backs
them yet; a skill that filters to nothing is a control that can only disappoint. Re-run
`npm run db:seed` afterwards.

---

## Add an achievement or a talk

Table Editor → `achievements` → Insert row, or edit `content/seed/achievements.json` and run
`npm run db:seed`.

`type` must be one of `hackathon`, `competition`, `talk`, `award`, `program` — it drives the
filter chips. `featured` controls nothing on the deck today; `sort_order` controls the order.
`links` is JSON, for example `{"product": "/products/rubric"}`.

---

## Add a Featured in logo

1. Storage → `logos` → upload the SVG or PNG.
2. Table Editor → `featured_in` → Insert row: `name`, `logo_path` (just the filename),
   `url` (the coverage link), `category` (`press`, `stage` or `program`), `sort_order`,
   `published: true`.

A row with no `url` renders as a logo rather than a link, which is how the nine currently on
the site are set up.

---

## Change the schema

Only when you need a new column or table. This needs a terminal.

```bash
npm run db:new -- add_something        # writes a migration file
# edit supabase/migrations/<timestamp>_add_something.sql
npm run db:push                        # applies it to the live database
npm run db:types                       # regenerates src/lib/supabase/types.ts
npm run typecheck                      # tells you what the change broke
```

Never edit a table's structure in Studio directly. The types file is generated from the
database, and if the two disagree the build fails in a way that is hard to read.

---

## Turn maintenance mode on

Vercel → the project → **Settings → Environment Variables**.

1. Set `MAINTENANCE_MODE` to `true` for Production.
2. Redeploy (Deployments → newest → ⋯ → Redeploy).

Every route now answers "Out of service." with a 503, using the line in
`site_settings.maintenance_message`.

**To get in yourself:** visit `https://fadimuhammed.work/?key=<MAINTENANCE_BYPASS_KEY>` once.
It redirects to a clean URL and sets a cookie that lasts a fortnight, so the rest of your
session is normal. To become a normal visitor again, clear the `maintenance_bypass` cookie in
your browser's site settings.

**To turn it off:** set `MAINTENANCE_MODE` to `false` and redeploy.

If you have not set `MAINTENANCE_BYPASS_KEY`, nobody can bypass — including you. Set it at the
same time as the flag.

---

## Roll back a bad deploy

Vercel → the project → **Deployments**. Find the last deployment that was good, ⋯ →
**Promote to Production**. It is instant and it does not rebuild anything.

This rolls back code only. It does not undo a content change in Supabase — content is not in
the deployment.

---

## Rotate a key

Do them one at a time, and update Vercel before the old key stops working.

| Key                         | Where to rotate it                                        |
| --------------------------- | --------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → rotate. **Server only.**      |
| `RESEND_API_KEY`            | resend.com → API Keys → create new, delete old            |
| `TURNSTILE_SECRET_KEY`      | Cloudflare → Turnstile → your widget → rotate             |
| `REVALIDATE_SECRET`         | Any long random string. Also update the Supabase webhook. |
| `MAINTENANCE_BYPASS_KEY`    | Any long random string.                                   |

After changing any of them in Vercel, redeploy — environment variables are read at build time
for the public ones and at request time for the rest, and redeploying makes both consistent.

If a key ever leaks, rotate first and investigate second.

---

## Where to look when something is wrong

**A page 500s.** Vercel → Logs, filter to Errors. The site's own error page prints a
"Reference" number that matches the `digest` in the log line.

**The contact form stopped working.** Check in this order: the row is missing from
`contact_messages` (Supabase problem), or the row is there but no email arrived (Resend
problem — resend.com → Emails shows every send and its status), or the form refuses to submit
(Turnstile — check the widget's hostnames include the live domain).

**Content changed in Studio but not on the site.** Wait five minutes, or redeploy. If it still
does not appear, check `published` is `true`.

**Analytics shows nothing.** The script only runs in production and only reports from
`fadimuhammed.work` — localhost and Vercel preview URLs are deliberately excluded, so testing
from a preview will never register.

---

## The commands worth knowing

```bash
npm run dev          # local site at http://localhost:3000
npm run build        # production build; run before pushing anything significant
npm test             # unit tests
npm run test:e2e     # browser tests, three engines
npm run screens      # screenshots at 390/768/1440 in both themes, into .screens/
npm run db:seed      # push content/seed/*.json into the database
```

CI runs lint, typecheck, unit tests, the build, the browser tests and Lighthouse on every push
to `main`. If it is red, the site still serves the last good deployment.
