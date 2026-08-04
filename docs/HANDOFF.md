---
status: current as of 04/08/2026
name: EU Fit Check, session handoff
description: >
  Where the build stands, what to do next, and the decisions that must not be
  quietly reversed. Read this plus AGENTS.md before touching anything.
---

# Handoff

## Read these first, in this order

1. `AGENTS.md`, the operating contract. It points at the four owning documents
   in the sibling repo `punprofile-career-coaching/` and carries the house
   rules.
2. `docs/self-report-scoring.md`, why only 5 of ECRA's 34 competencies get a
   real score, and the three-tier rule that governs everything candidate-facing.
3. `docs/candidate-data-architecture.md`, the two-projection model (coach
   playbook, candidate journey) and why they are projections of one assessment
   rather than two scoring paths.
4. `docs/product-roadmap.md`, task list and its 04/08/2026 addendum.

## Current state: 12/50 tasks, Phase 1 substantially built

**Live infrastructure.** GitHub `punprofilecareer-droid/punprofile-profile-app`,
Convex dev deployment `quiet-mule-251` (eu-west-1), Vercel at
`punprofile-profile-app.vercel.app`, Sentry org `punprofile`. Details and
what remains of Phase 0 are in the session memory file `reference_deployments.md`.

**Built and committed:**

- Scoring engine (`src/lib/scoring.ts`) with the model, normaliser, narrative,
  radar SVG builder and report renderer. Validated against 63 real survey
  responses.
- Two projections (`src/lib/views.ts`, `levers.ts`), coach playbook and
  candidate journey, with a whitelist safety check.
- Convex schema: `leads`, `magicLinks`, `assessments` (the trajectory
  snapshots table), all deployed with indexes.
- Single-admin auth (Convex Auth, password, sign-up gated to `ADMIN_EMAIL`),
  middleware protecting `/admin`, login page.
- Sentry across all three runtimes with a shared PII scrub module.
- Stage 1 assessment flow: content model with canonical answers, four Convex
  mutations/queries, tap-only question UI, teaser spider chart.
- Offline tooling in `scripts/`: report generation, the searchable report book,
  the Candidates Master ECRA export, parser audit, content verification.

**Not built:** email capture and magic links (Phase 2), admin dashboard,
pathway-aware narrative, Thai copy, the historical backfill.

## Immediate next task

**The survey specification.** The founder is filling in
`docs/survey-spec-template.md`. When it comes back, that worksheet is the
input to:

1. Rewrite `src/lib/content/questions.ts` from the filled worksheet.
2. Add a multi-select variant to `src/components/features/assessment/QuestionCard.tsx`
   (target countries specifically, the data model already stores a list).
3. Extend `src/lib/content/mapping.ts` for any new scoring slots.
4. Apply the founder's scoring decision from worksheet section 5.1 in
   `scoreTargetClarity` (`src/lib/scoring.ts`) and update
   `docs/self-report-scoring.md` in the same commit.
5. Re-run `npx tsx scripts/verify-content.ts`. It must stay green.

Do not start this before the worksheet is filled in. The current question set
is known to be suboptimal and rewriting it twice wastes the effort.

## Decisions that must not be quietly reversed

These were each reached deliberately and reversing one silently would break
the product's core promise.

- **Never score a `coach`-tier competency.** If a form cannot evidence it, it
  renders blank, not estimated. This is the "no faked precision" rule from
  PRD § 1 and it is the product's entire differentiation.
- **Never name a proxy after the competency it gestures at.** "CV Status
  (self-declared)" sits beside a still-empty "CV Quality".
- **Stage 1 deliberately leaves Professional Capability unscored**, so its
  teaser axis renders hollow. `scripts/verify-content.ts` asserts both
  directions of this; if you change it, change it on purpose.
- **The candidate view is a typed whitelist**, never the coach view with fields
  removed. `assertCandidateSafe()` fails the render if internal vocabulary
  (lead, ICP, propensity, triage, temperature, tier) leaks.
- **One scoring implementation.** `src/lib/scoring.ts` is it. `convex/scoring.ts`
  wraps it; the client and scripts import it. Never add a second, including as
  a spreadsheet formula.
- **The app absorbs both Google instruments** (decided 04/08/2026). No new data
  ever lands in a Google Form again. The fuzzy parsers in `normalize.ts` are
  backfill-only code now.
- **Levers show computed uplift, never estimates.** A lever re-scores the
  candidate's own answers through the real lookups.
- **Four instruments have similar names** and conflating them has already
  caused a wrong analysis once. Quiz (stage 1 propensity), Lead Discovery
  Survey (stage 2 ICP), ECRA (stage 3, post-sale), EU Fit Check (this app).
  See the sibling repo's root `CLAUDE.md`.

## Practical notes

- **Verification scripts are the safety net.** `scripts/audit.ts` after
  touching `normalize.ts`, `scripts/verify-content.ts` after touching the
  content model or scorers, `scripts/demo-views.ts` after touching the
  projections. All run through `tsx`.
- **Google Fonts is unreachable from some sandboxes**, which breaks
  `next build` on the `Geist` import in `layout.tsx`. Locally this is a
  non-issue.
- **`docs/design.md` is a deliberate PENDING stub.** Use framework defaults;
  never invent a palette or type scale. The chart's colours are a validated
  brand-neutral placeholder, swappable in one CSS block.
- **Copy is English-first placeholder.** The Thai pass (TASK-052) is one
  consolidated review of a generated bilingual deck, not per-file translation.
  Nothing candidate-facing ships before the founder signs it off.
- **House style:** dates DD/MM/YYYY, no em dashes in prose or markdown (code
  comments exempt), one commit per decision.

## Open items needing the founder

- Local sign-in test at `/admin` (create the admin account, first-time button).
- TASK-009: Convex production deploy key into Vercel, and the build command
  `npx convex deploy --cmd 'npm run build'`.
- TASK-010: end-to-end foundation check including a deliberate Sentry error.
- The survey worksheet.
