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
| Thai language rules LR-01 to LR-08 | `Language_System.md` |
| Decided Thai terms. `npm run termbase` syncs it here; `verify-copy` enforces it | `termbase.yml` |
| **Design tokens: real colours, typography, spacing, components** | `ctxt-brand/design.md` |
| Brand personality, voice, colour meaning | `Brand_Guidelines.md` |
| Mission, offerings, scope, audience | `01_Project_Foundation.md` |
| Decisions and their rationale, including abandoned attempts | `09_Decision_Log.md` |
| Roadmap and session handoff | `punprofile-work/work-projects/eu-fit-check/` |

Cross-references in this repo's code are bare filenames in backticks, never
paths, which is what let those files move without breaking a single citation.
Keep it that way.

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

Applied 08/08/2026. The token layer is `src/app/globals.css` for the app and
`src/lib/design-tokens.ts` for everything generated outside Next. Those two are the
only definitions of the palette; keep them from drifting and never add a third.
Some things worth knowing before you touch styling:

- **There is no dark mode and there must not be one.** The system's base is white
  with full-bleed colour washes and it defines no dark ramp, so a `dark:` variant or
  a `prefers-color-scheme` block would be invented tokens.
- **Terracotta is one action per view**, teal is everything else that needs emphasis,
  and `error` is neither.
- **No spacing tokens.** The system's scale already maps onto Tailwind's 4px base.
- **`src/lib/radar.ts` holds no colours** and should stay that way.
- **The `--viz-*`, `--ink-*` and `--border` names are load-bearing.**
  `scripts/build-report-book.ts` reads them out of a rendered report's stylesheet;
  renaming one strips the book's sidebar with no error.

Still placeholder: the wordmark, the mascot, section wash rotation and the editorial
spacing pass. Those need assets from the sibling repo's `ctxt-brand/assets/`.

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
