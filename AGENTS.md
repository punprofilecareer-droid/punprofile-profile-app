# AGENTS.md

Operating contract for `punprofile-profile-app`, the **PunProfile App**.

**Naming, decided 04/08/2026.** The product is the PunProfile App. **EU Fit
Check is its assessment feature**, alongside a personalized job board, saved
jobs with self-tracked status, and email notifications (Phase 4). Older text in
the specs uses "EU Fit Check" to mean the whole product; read it as the app.
The public-facing name is a working name and not settled, so do not hard-code
a product name into user-facing copy beyond the brand "PunProfile".

## This repo holds implementation only

**Every specification lives in the sibling repo `../punprofile-career-coaching/`.**
Reorganised 04/08/2026: this repo's `docs/` folder was emptied and its contents
moved there. Nothing here defines what the app should be.

| Fact | Owner, in the sibling repo |
|---|---|
| The method: core claim, gates, stages, Thai-specific factors | `10_Methodology.md` |
| EU Fit Check specs: PRD, product vision, scoring spec, survey spec | `ctxt-product/` |
| Lead qualification, ICP, ECRA, live form URLs | `08_Coaching_Business.md` |
| Writing standards, Thai tone, the fixed CTA pool | `03_Content_System.md` |
| Thai language rules LR-01 to LR-09 | `Language_System.md` |
| Decided Thai terms. `npm run termbase` syncs it here; `verify-copy` enforces it | `termbase.yml` |
| **Design tokens: real colours, typography, spacing, components** | `ctxt-brand/design.md` |
| Brand personality, voice, colour meaning | `Brand_Guidelines.md` |
| Mission, offerings, scope, audience | `01_Project_Foundation.md` |
| Decisions and their rationale, including abandoned attempts | `09_Decision_Log.md` |
| Roadmap and session handoff | `punprofile-work/work-projects/eu-fit-check/` |

Cross-references in this repo's code are bare filenames in backticks, never
paths, which is what let those files move without breaking a single citation.
Keep it that way.

### Setting up a machine needs both repos, from two GitHub accounts

Recorded 17/08/2026, when the coaching repo got a remote for the first time.

| Repo | GitHub |
|---|---|
| This one | `punprofilecareer-droid/punprofile-profile-app` |
| The coaching repo | `paulthinks/punprofile-career-coaching` |

Two owners, both private, and **they must be cloned as siblings in the same
parent folder**, because eleven scripts here read across the boundary by relative
path: `build-tokens.ts` generates the whole token layer from `design.md`,
`sync-termbase.ts` reads `termbase.yml`, `verify-thai-register.ts` reads
`golden-th/`, and `verify-pages.ts` and the review exporters write their output
there.

So a clone of this repo alone installs and runs, and cannot regenerate its own
colours or its own termbase. `verify-copy.ts` says so out loud when the sibling
is missing rather than silently passing, which is the behaviour to preserve in
anything new that reads across.

**Candidate data is not in either repo.** `/data` here is gitignored and always
was; the coaching repo's history was scrubbed of a 101-record survey export on
17/08/2026, before its first push. `data-inventory.md` there is the record.

Read the owning document before reasoning about anything. The workspace root
`../CLAUDE.md` carries the full map, and it exists because reading this repo in
isolation has already produced wrong work twice.

### Four instruments with similar names

Conflating these has already produced confidently wrong analysis. The full table and
the warning that goes with it are in the sibling repo's root `CLAUDE.md`.

- **Europe Readiness Check** is the 6-question quiz. Stage 1, Product Propensity.
- **Lead Discovery Survey** is the 21-question form. Stage 2, ICP / Lead Grade.
- **ECRA** is the 34-competency diagnostic. Stage 3, in-engagement, post-sale.
- **EU Fit Check** is this app, replacing stages 1 and 2.

The quiz feeds the survey, it does not compete with it. Never infer the funnel's shape
from where a form link is posted, from a copy document, or from a response sheet's row
count.

## Scoring

`src/lib/scoring.ts` is the single implementation. `convex/scoring.ts` wraps it, the
client calls it for the teaser chart, and `scripts/` calls it for offline reports.
Do not add a second one, including as a spreadsheet formula.

Every score carries a tier: `ecra` where the survey collects that competency's own
defined inputs, `proxy` where it evidences part of the picture, `coach` where it does
not reach at all. Never score a `coach` item. Never name a proxy after the competency
it gestures at. `docs/self-report-scoring.md` has the reasoning.

Run `npx tsx scripts/audit.ts <responses.json>` after touching `src/lib/normalize.ts`.
It reports per-question parse rates, prints every rejected value, and asserts the
scoring invariants.

## House rules

Inherited from the sibling repo's root `CLAUDE.md`, which this repo does not otherwise
read:

- Dates in DD/MM/YYYY.
- No em dashes in what PunProfile **says** to someone: chat and LINE, email,
  social posts. Everything else is product and may use them, and that includes
  this app's own candidate-facing copy. Narrowed 15/08/2026, having been a
  blanket ban that `verify-copy.ts` enforced over the questionnaire.
- Never fabricate figures, pricing or third-party terms. Ask rather than infer.
- Be explicit about what is verified, what is inferred and what is opinion.
- Minimal, precise output. No padding caveats.
- One commit per decision. Git history is the decision log.
- Accuracy > Trust > Practical usefulness > Clarity > Speed > Volume.

## Build state

Roadmap is `product-roadmap.md` in the sibling repo's
`punprofile-work/work-projects/eu-fit-check/`.

**The design system is real and lives in the sibling repo's `design.md`.** This
repo's old `docs/design.md` stub, which said no tokens existed, was wrong and has
been removed.

Rebranded to **Material Design 3**, 16/08/2026. The token layer is now
GENERATED, and that is the thing to know before touching styling:

- **`src/app/tokens.generated.css` and `src/lib/design-tokens.generated.ts` are
  written by `scripts/build-tokens.ts` from `design.md` in the sibling repo.**
  Never hand-edit either. Change the token there, run `npm run tokens`, commit
  both. `globals.css` imports the CSS one and holds only what is not a token:
  the base layer, the chart styles, the animations. `design-tokens.ts` is a
  re-export, kept so no consumer's import path had to change.
- `npm run design:html` regenerates the rendered style guide beside `design.md`.
- **Colour roles, not colour names.** Ask what job an element does, then pick the
  role. `primary` is olive and is the brand. `secondary` is the teal the brand
  used to be. `tertiary` is EU Fit Check's blue. `action` is rust and is the
  single primary action per view, and it is deliberately NOT an M3 role, so a
  page can be saturated in brand colour with only one thing looking pressable.
  `error` is none of those.
- **There is a dark scheme since 16/08/2026, and no component may name it.**
  `tokens.generated.css` redefines the same `--color-*` names inside a
  `prefers-color-scheme: dark` block, so every utility switches on its own.
  **Do not use Tailwind's `dark:` prefix.** A component that has to name both
  schemes is a component that can get one of them wrong, and there are roughly
  nine hundred colour utilities in this app. If a surface looks wrong in dark,
  the fix is almost always that it is using a literal colour or the wrong role,
  not that it needs a `dark:` override.
  The footer is on `inverse-surface` in both schemes, which is what that role is
  for: it inverts against whatever surrounds it.
- **Hover is a state layer, not a colour.** 8% of the element's own content
  colour over its own background. There is no second, brighter token per
  interactive colour any more. `.btn-filled` in `globals.css` is the worked
  example and implements `button-filled` from `design.md`.
- **Buttons are pills.** The old rule forbidding fully-rounded shapes, on the
  grounds that they were Thai Jobs in Europe's register, was retired 16/08/2026.
  Colour and type now carry the whole separation between the two brands, which
  makes Fraunces and the reserved `action` colour load-bearing rather than
  decorative. Do not drop the serif on small titles to tidy something up.
- **Shape names are M3's**: `rounded-extra-small|small|medium|large|extra-large|full`.
  Tailwind still ships its own `rounded-sm|md|lg` and they will silently resolve
  to Tailwind's values rather than the system's, so do not use them.
- **Breakpoints are M3's window size classes**: `medium:` 600, `expanded:` 840,
  `large:` 1200, `xlarge:` 1600. Tailwind's `sm|md|lg|xl` still exist and still
  mean 640 / 768 / 1024 / 1280, which is a different set of numbers. Do not use
  them.
- **A page's columns belong at `large:`, not `expanded:`.** The standard drawer
  appears at `expanded` and takes 280px, so a page's content pane is only 560
  wide at an 840 window, which wants one column. Content thresholds sit one
  class above the window ones. The shell and the assessment are the exceptions
  and use `expanded:`: the shell IS the drawer, and the assessment hides it.
- **Liquid Glass is retired**, along with `.material`, `.material-mint`, the
  `.eufit-field` background and the `data-perf` capability probe. M3 answers the
  same question with tonal surfaces and elevation. Content cards are
  `.card-outlined` and `.card-tonal`. Do not reintroduce a backdrop filter.
- **`--ease-settle` is retired**; motion is M3's four curves. Mixing a fifth in
  from outside breaks the relationship between them.
- **Write `--color-*`, not `--md-sys-*`.** Both exist; the M3 names are aliases
  emitted for anything that speaks the spec, and Tailwind generates its utilities
  from its own namespace. Reading either is fine, writing the M3 one is not.
- **Elevation is a tone, not a shadow.** Level 1 is `surface-container-low`, 2 is
  `surface-container`, 3 is `surface-container-high`, 4 and 5 are
  `surface-container-highest`. A `shadow-level-*` is earned only when the element
  floats over content that may be busy. Three surfaces in this app qualify.
- **No spacing tokens.** The system's scale already maps onto Tailwind's 4px base.
- **`src/lib/radar.ts` holds no colours** and should stay that way.
- **The `--viz-*`, `--ink-*` and `--border` names are load-bearing.**
  `scripts/build-report-book.ts` reads them out of a rendered report's
  stylesheet; renaming one strips the book's sidebar with no error. They are
  emitted outside `@theme` with bare names for exactly that reason, and mapped
  onto roles in the `ALIASES` table in `scripts/build-tokens.ts`.

The logo and mark now exist as vector SVGs in the sibling repo's
`ctxt-brand/assets/inbox/`, with a generated favicon set in
`punprofile-work/work-projects/rebrand-m3/favicon/`. Wiring them into the app is
not done.

## Routing, and the three root layouts

Added 16/08/2026 with the `/en` tree. Read this before adding a page, because
the shape is not the one Next's own i18n guide describes and a page added in the
wrong place is invisible in one language.

```
src/app/
  (th)/      Thai, at the root:  /  /assess  /blog  /coaching  …
  (en)/en/   English, prefixed:  /en  /en/assess  /en/blog  …
  (private)/ /admin and /login, in neither tree
  sitemap.ts  robots.ts  llms.txt/
```

**Thai is unprefixed and English is prefixed**, not `/th` and `/en`. Every link
ever posted to the group carries the app URL with its `?src=fb&job=` parameters
from `00_Quick_Facts.md`, and a `/th` prefix would have turned all of them into
redirects. It also keeps `/admin` out of both trees, so `src/proxy.ts` and its
`/admin(.*)` matcher know nothing about locales, and it avoids the collision a
top-level `[lang]` segment would have had with `/admin`.

Three root layouts because Next renders one `<html>` per request from a root
layout and `<html lang>` has to be true. All three render `SiteShell` and differ
only in the locale they pass.

**Adding a page means two files**: the real one under `(th)/`, and a
`(en)/en/…/page.tsx` that re-exports its default and declares its own metadata
through `pageMetadata({ …, locale: "en" })`. Add it to `PUBLIC_ROUTES` in
`src/lib/seo.ts` and the sitemap, `hreflang` and `llms.txt` follow.

**Every internal link is written as its Thai path** and passed through
`path()` from `useCopy()`, or `localePath(href, locale)` in a server component.
The link tables in `nav.ts`, `footer.ts`, `cta.ts` and `faq.ts` hold Thai paths
and no locale at all: a link is a destination, and which language it is read in
is a property of the reader.

## Deploying

Written 15/08/2026, after a session asked how work gets deployed as one package
rather than half at a time when several sessions are open at once.

### Two deployments, and they are not interchangeable

| Name | Role | Notes |
|---|---|---|
| `dashing-shepherd-41` | **Production**, serves `punprofile.vercel.app` | Created 14/08/2026 |
| `quiet-mule-251` | **Development** | Holds the 90 leads imported on 10/08/2026, so it is real personal data, not a scratch environment |

`.env.local` says `dev:quiet-mule-251`, so **every CLI command without `--prod`
hits dev.** `data-inventory.md` in the sibling repo carries the same table and
the PDPA consequence.

### The one rule

**Production is deployed by pushing `master`. Never from a laptop.**

Vercel's build command override is `npx convex deploy --cmd 'npm run build'`, so
one push runs the Convex backend deploy *and then* the Next build, in that
order, as one build. That is already the atomic package, and it is why a schema
change can never land ahead of the frontend that needs it.

So: do not run `npx convex deploy --prod`. It would put code in production that
is in nobody's git history, and the next real push would silently revert it.

Consequence worth having: **what is in production equals what is in `master`**,
and that is checkable in one command rather than believed.

### Why a half-deploy happens, and what actually prevents it

Three different risks. Only the third needs care.

1. **Within one deploy: not possible.** Convex pushes the schema and every
   function as a unit, validating the schema against existing documents first.
   It succeeds whole or fails whole.
2. **Frontend ahead of backend: not possible**, because of the build command
   above. Convex goes first.
3. **Code and data migration: genuinely two steps, and nothing can make them
   one.** A backfill is not part of a deploy and never will be.

   The fix is not a lock, it is writing the change so **any interleaving is
   safe**. The consent migration is the worked example and the pattern to copy:

   - **Dual-write.** `captureContact` writes the old flat timestamps *and* the
     new events, so code from before the migration still works.
   - **Reads degrade honestly.** `resolveConsent` returns `never_asked` when
     there are no events, which is correct rather than merely safe, so a read
     that runs before the backfill is not wrong.
   - **The backfill is idempotent.** Verified 15/08/2026 on dev: first run wrote
     200 events, the immediate re-run reported 0 written and 200 already
     present. A run that dies half way is resumed by running it again.

   Deploy-then-backfill, backfill-then-deploy, and backfill-crashed-halfway are
   all safe. That is what "packaged together" actually buys you, and a lock
   would not have bought it.

### Several sessions open at once

The real hazard is not the deploy, it is the **working tree**. `npx convex dev`
and `npx convex deploy` push the files on disk, not a commit. Two sessions
editing this repo at the same time means whichever runs the command pushes the
union of both sessions' work, including the half-finished half.

Git is the lock. In practice:

- **Commit before deploying anything.** `git status --short` empty is the gate.
- Dev will drift, and that is fine; it is where work in progress lands. Do not
  try to hold dev and prod equal continuously. Make dev *reproducible* instead:
  from a clean tree, `npx convex dev --once` rebuilds it from what is committed.
- If a deploy "changed nothing", you deployed a different deployment. Re-check
  the target rather than deploying again.

### Before a production push

**`verify:pages` joined this list on 17/08/2026.** `verify:copy` lints `copy.ts`,
the question bank and the privacy notice; **it has never read the per-page
content modules**, which is 91 candidate-facing strings across `home.ts`,
`coaching.ts`, `services.ts`, `faq.ts` and `footer.ts`. Nobody had noticed,
because those modules are written from Paul's own Thai and were therefore
assumed to be fine. The first run found a real LR-04 failure in `footer.ts`
shipped since 15/08/2026.

```
git status --short                        # must be empty
git rev-list --count origin/master..HEAD  # know what is going out
npx tsc --noEmit -p tsconfig.json
npx tsc --noEmit -p convex/tsconfig.json
npm run lint
npm run verify:copy
npm run verify:pages
npm run verify:consent
git push origin master
```

Then watch the Vercel build show `convex deploy` running **before** `next
build`, and run any pending backfill against `--prod` afterwards.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
