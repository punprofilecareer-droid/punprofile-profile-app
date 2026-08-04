# AGENTS.md

Operating contract for `punprofile-profile-app`, the EU Fit Check web app.

## This repo does not define its own purpose

EU Fit Check exists to replace PunProfile Career Coaching's Google Form lead funnel.
What it is replacing, and the frameworks it derives from, live in the sibling repo
`punprofile-career-coaching/`, not here:

| Fact | Owner, in the sibling repo |
|---|---|
| Lead qualification, ICP, ECRA, live form URLs | `08_Coaching_Business.md` |
| Writing standards, Thai tone, the fixed CTA pool | `03_Content_System.md` |
| Mission, offerings, scope, audience | `01_Project_Foundation.md` |
| Decisions and their rationale | `09_Decision_Log.md` |

Read the owning document before reasoning about the funnel. Do not restate its values
here, link instead. `docs/self-report-scoring.md` records only the survey-to-score
mapping this app implements and defers to `08_Coaching_Business.md` on the framework.

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
- No em dashes in prose, markdown or user-facing copy; use commas or shorter
  sentences. Code comments are exempt, so this never drives a mechanical sweep of
  source files.
- Never fabricate figures, pricing or third-party terms. Ask rather than infer.
- Be explicit about what is verified, what is inferred and what is opinion.
- Minimal, precise output. No padding caveats.
- One commit per decision. Git history is the decision log.
- Accuracy > Trust > Practical usefulness > Clarity > Speed > Volume.

## Build state

Following `docs/product-roadmap.md`. `docs/design.md` is a PENDING stub: use framework
defaults as placeholder styling, and never invent a colour palette or type scale to
fill that gap.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
