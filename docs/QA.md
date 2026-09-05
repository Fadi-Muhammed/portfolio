# QA

Cross-device, performance and accessibility results for the site (B12, B13, Part 16).

Two kinds of claim live here and they are kept apart on purpose. **Automated** means a
machine asserts it on every run and a regression fails the build. **Emulated** means
Playwright drove a simulated device, which catches layout, hit targets and overflow and
cannot catch a real address bar or a real thumb. **Manual** means a person has to do it,
and until someone has, it is not a result.

Last measured: 5 September 2026, against the build at `part16-done`.

---

## Performance

Lighthouse, mobile preset with its default throttling, median of three runs, on an
otherwise idle machine.

| Route              | Performance | Accessibility | Best practices | SEO  | LCP   | CLS | TBT   |
| ------------------ | ----------- | ------------- | -------------- | ---- | ----- | --- | ----- |
| `/`                | 91          | 100           | 100            | 66\* | 3.4 s | 0   | 97 ms |
| `/products/rubric` | 92          | 100           | 100            | 69\* | 3.2 s | 0   | 72 ms |

\* The SEO score is the deliberate `noindex`, and nothing else. The same build with
`NEXT_PUBLIC_INDEXABLE=true` scores **100 with no failing audits** — measured, not
assumed. Part 17 turns indexing on and this becomes a real 100.

### Against B12's budgets

| Budget                    | Target    | Actual        | Verdict                      |
| ------------------------- | --------- | ------------- | ---------------------------- |
| Lighthouse Performance    | ≥ 90      | 91 / 92       | **met**                      |
| Lighthouse Accessibility  | ≥ 90      | 100           | **met**                      |
| Lighthouse Best practices | ≥ 90      | 100           | **met**                      |
| Lighthouse SEO            | ≥ 90      | 100 indexable | **met**, once indexing is on |
| Cumulative Layout Shift   | < 0.05    | 0             | **met**                      |
| Largest Contentful Paint  | < 2.0 s   | 3.2–3.4 s     | **missed** — see below       |
| Home JavaScript, gzipped  | ≤ ~200 KB | 270 KB        | **missed** — see below       |

### Why LCP misses, and what was ruled out

LCP is **84–88% render delay**: the browser has the content and cannot paint it because
the main thread is busy. It is not a download problem — the largest image on a case study
is 16 KB and arrives in a quarter of a second.

Two candidates were tested and cleared rather than assumed:

- **The hero entrance animation is not the cause.** Disabling it entirely measured LCP at
  3.9 s against 3.8 s with it, on the same build and machine. It stays.
- **The measurement itself was polluted.** The first numbers were taken with five stray
  dev servers running from earlier experiments; the same build measured 87 then and 91
  on a quiet machine. Any performance number taken on a busy machine is worthless, which
  is also why CI only warns on this metric.

What remains is the shape of the page: the home route ships every section's client code
and serialises every section's data into the RSC payload, because the deck passes all
seven sections as children even though it mounts two. That is B3's design working as
specified, and the cost lands here. Reducing it means changing how the deck receives its
sections, which is a change to a specified behaviour and belongs in a decision, not in a
performance pass.

### Bundle

Measured as the real gzipped transfer of every script the document references.

| Route                 | Gzipped JS | Notes                                      |
| --------------------- | ---------- | ------------------------------------------ |
| `/`                   | 270 KB     | 152 KB of it is React and the Next runtime |
| `/products/[slug]`    | 196 KB     |                                            |
| `/engineering/[slug]` | 197 KB     |                                            |

The budget is ~200 KB **including the framework**, and the framework alone is 152 KB —
which leaves 48 KB for a deck of seven sections, a command palette, an animated topology,
an instrument and a validated form. The home page is 70 KB over. `motion` and
`@supabase/ssr` were removed as genuinely unused; what is left is used.

---

## Accessibility

**Automated, every run:** axe at 200% zoom equivalent, and on eight routes × both themes — `/`, `/products`,
`/products/[slug]`, `/engineering`, `/engineering/[slug]`, the 404, `/maintenance` and
`/design`. **Zero serious or critical violations in all sixteen combinations.**

Fixed in this part, both found by Lighthouse:

- **The skip link pointed at nothing on every page but the deck.** It said "Skip to
  contact" everywhere; a case study has no `#contact`, so it moved focus nowhere. It now
  targets the page's own `main` landmark, and the state pages and `/design` gained one.
- **The peek header's name did not contain its visible text.** "Hop to Products" against
  a link that visibly reads "Products" and its teaser. WCAG 2.5.3 exists because voice
  control users say what they can see.

Known and accepted:

- Emulated WebKit cannot synthesise a wheel event, so the deck's snapping is asserted on
  Chromium only. On WebKit it is a manual check below.

---

## Print

**Automated:** the deck mounts all seven sections for a print, the scroll container
unwinds, the rail and skip link are gone, and external links print their address.

A deck that mounts two sections would otherwise print two sections and five empty
shells — CSS cannot lay out content that is not in the document, so the provider listens
for `beforeprint` and mounts everything. It always prints on white whichever theme was on
screen.

**Manual, not yet done:** open `/` and `/products/rubric`, press Ctrl+P, and read the
preview. Automation asserts the rules applied; only a person can say the pages are
_readable_.

---

## Device and browser matrix

| Target                    | How             | Result                                                 |
| ------------------------- | --------------- | ------------------------------------------------------ |
| Desktop Chrome            | Automated       | Full suite, every run                                  |
| Mobile Chrome (Pixel 7)   | Emulated        | Passing: overflow, hit targets, height, nav, snapping  |
| Mobile Safari (iPhone 14) | Emulated        | Passing, except snapping — no wheel in emulated WebKit |
| Desktop Firefox           | Not covered     | See below                                              |
| Desktop Safari            | Not covered     | See below                                              |
| 13-inch laptop at 100%    | Not covered     | Manual                                                 |
| 200% browser zoom         | Automated       | No sideways overflow, no serious axe violations        |
| Real iOS Safari           | **Outstanding** | The one that matters most — see below                  |
| Real Android Chrome       | **Outstanding** | Manual                                                 |

Firefox and Safari desktop are not in CI. Section F asks for them before launch rather
than on every push, and adding two more engines to a suite of 135 tests would treble the
slowest job to catch layout bugs the emulated phones already catch. They are on the
launch checklist.

### What only a real device can answer

Emulation resizes a viewport. It does not move an address bar, and it has no thumb. Part 5
found two bugs on a real phone that no emulator would have shown, and **the fix for them
has never been confirmed on hardware**.

For Fadi, on an iPhone if possible and an Android if not:

1. **Scroll the deck down and back up.** Does the address bar appearing and disappearing
   make the deck jump or feel glitchy? This is the `100dvh` → `100svh` fix from Part 5,
   still unconfirmed.
2. **Flick fast through several sections.** Does it ever skip one? It should always land
   on a section, never between two.
3. **Drag the slider in Contact with a thumb.** Does it move smoothly, and does the page
   stay still underneath it rather than scrolling?
4. **Tap the rail dots and the peek strip.** Does every one hit first time?
5. **Rotate to landscape.** Does anything overlap or overflow sideways?
6. **Turn on Reduce Motion** (Settings → Accessibility → Motion) and reload. Nothing
   should animate anywhere, and everything should still be reachable.

Report anything that felt wrong, however small — "it felt glitchy" was the whole of the
Part 5 report and it was correct.

---

## Reproducing any of this

```
npm run build
npx lhci autorun                       # Lighthouse, with the assertions in lighthouserc.json
npx playwright test                    # desktop, 135 tests
npx playwright test --project=mobile-safari --project=mobile-chrome
npx playwright test qa.spec.ts         # the axe sweep and the print rules
```

Performance numbers are only meaningful on an idle machine. Close other servers first —
`npx next start` instances left running from earlier work cost this project four
Lighthouse points before anyone noticed.
