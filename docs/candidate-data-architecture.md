---
status: alpha
version: 1.0
name: EU Fit Check, candidate data architecture
description: >
  How one assessment becomes two representations: the coach playbook (raise the
  score, deploy the AI toolstack) and the candidate journey (motivation).
  Owns the layer model, the whitelist rule, the lever math and the trajectory
  plan. Read before adding any candidate-facing surface or any coach tooling.
---

# Candidate data architecture

There are two audiences for the same candidate data.

1. The coach view: how PunProfile moves this person forward. Which lever
   raises their Employability score, and which AI tactics to deploy in their
   search.
2. The candidate view: what the person themselves sees, framed to keep them
   moving.

The architecture exists to serve both without ever having two versions of the
truth. Every rule below follows from one principle: **two projections, one
assessment.** The moment the motivational view computes its own numbers, it
starts flattering, and the product's honesty promise (`prd.md` § 1) collapses.

## The layers

```
survey answers (Google Form today, the app in Phase 1)
        |
        v
L0  EVIDENCE      SurveyResponse, normalised, granular
        |
        v
L1  ASSESSMENT    scoreResponse() in src/lib/scoring.ts, the only engine
        |
        +---------------------------+
        v                           v
L2a COACH PLAYBOOK             L2b CANDIDATE JOURNEY
    views.ts buildCoachView        views.ts buildCandidateJourney
    gaps, ranked levers,           strengths first, one next step,
    AI plan, unlock services       checklist, reachable deltas
        \                           /
         v                         v
L3  TRAJECTORY    snapshots per candidate over time (Phase 1, Convex)
```

Both L2 projections are pure functions of L1. Neither stores anything. That is
what makes them impossible to desynchronise.

## L0, evidence: keep it granular

Scores compress; plans need the granularity back. Q32 (AI & digital fluency)
is the canonical case: the score only needs the count of indicators met, but a
tactic plan needs to know WHICH indicator is missing, because "adopt the
tailoring workflow" is only prescribable when tailoring is the gap. So the
normaliser stores `aiIndicatorFlags: boolean[]` and the count derives from it,
never the other way around. Same for Q34 family indicators.

Rule: when a question's answer has internal structure, store the structure.
Compression happens in scoring, not in capture.

## L1, assessment: unchanged

`docs/self-report-scoring.md` owns this layer: the three tiers (ecra, proxy,
coach), the lookup tables, the coverage math. Nothing in this document changes
it, and nothing downstream of it recomputes a score.

## L2, the two projections

### Coach playbook (`buildCoachView`)

Serves goals 1.1 and 1.2 directly:

- **Levers (1.1).** A lever is not advice text with a guessed benefit. It is a
  hypothetical change to the candidate's own answers, re-run through the real
  scoring lookups (`levers.ts`). "Rework the CV" is simulated as
  `cv: untailored -> europe_ready`, and the displayed uplift (Employability
  2.8 to 3.3 for a real candidate) is arithmetic, not an estimate.
  `rankMoves(input, "employability")` answers the coach's question of which
  action moves that score most.
- **AI toolstack (1.2).** The four Q32 indicators are the tactic list, one
  move each, prescribed from the flags. When Q32 was never answered (all
  pre-12/07/2026 respondents), single-indicator advice would be guesswork, so
  the whole stack becomes one onboarding move that also captures the answers.
- **Unlocks.** Services (coaching conversation, CV & LinkedIn review, mock
  interview, country research) never move a self-report score. They measure
  coach-tier items, which moves coverage: 12 of 44 items measured becomes 41
  of 44. Score levers and coverage levers are kept apart deliberately;
  conflating them is how faked precision starts. Every coach-tier item belongs
  to exactly one service, enforced by `validateCatalog()`.

Two lever families the catalog deliberately excludes: Family Readiness and
Relocation Timeline (life circumstances, not tasks, same rule as
`firstAction`), and job-search stage ("be interviewing" is an outcome, not an
action).

### Candidate journey (`buildCandidateJourney`)

The motivational surface, built on three mechanics that do not require
softening any number:

- **Strengths lead.** Top three scored items open the view.
- **Progress is visible.** The seven funnel steps render as a checklist with
  done / next / later / unanswered states. Completion states are facts
  ("LinkedIn active"), so the progress mechanic costs no honesty. The step
  marked "next" is the same pick `firstAction` makes, never a second opinion.
- **The gap is reachable.** "Retailor your CV and your self-assessed
  Employability moves from 2.8 to 3.3" is the same lever simulation the coach
  sees, phrased as the candidate's own numbers. And the unlock line sells
  measurement, not a verdict: "a free 30-minute conversation can measure 29
  more areas" is true, motivating, and routes to the discovery call.

**The whitelist rule.** The journey is a typed shape containing only fields
safe to show. It is never the coach view with fields deleted. Internal ops
vocabulary (lead, ICP, propensity, entry point, triage, temperature, tier,
qualification, asset, conversion) must not appear, per the customer-facing
naming rule in `08_Coaching_Business.md`; `assertCandidateSafe()` checks the
rendered output and the demo script fails the build on a leak.

The self-reported caveat stays on every candidate surface. Motivation never
buys honesty back.

## L3, trajectory: what makes "get the score up" measurable

Not yet built; folds into TASK-011 when the Convex schema lands. The design:

```
assessments: defineTable({
  leadId: v.id("leads"),
  takenAt: v.number(),
  source: v.union(v.literal("survey_import"), v.literal("app"), v.literal("coach")),
  responses: v.record(v.string(), v.any()),   // the L0 snapshot, verbatim
}).index("by_lead_time", ["leadId", "takenAt"])
```

Snapshots store evidence, never scores; scores are recomputed on read, so a
scoring fix retroactively corrects history instead of contradicting it. A
delta between two snapshots is per-item and carries attribution: a
`source: "app"` change stays self-reported ("you now rate your CV
Europe-ready"), a `source: "coach"` change is verified. The candidate journey
gains its strongest motivator here, real deltas over time, and the coach gains
the 1.1 progress measure: Employability at intake versus today.

The `leads.scores` field from `prd.md` § 3 is unaffected; it remains the
denormalised latest value that makes the teaser chart reactive.

## Ownership

`08_Coaching_Business.md` owns the framework, the offerings and the naming
rules. `01_Project_Foundation.md` owns what the modules are. This repo owns
the catalogs as code (`levers.ts` module names must match those offerings) and
the projections as code (`views.ts`). Copy in the catalogs is EN placeholder;
candidate-facing text ships only after the Thai native-tone pass
`03_Content_System.md` requires.

## Build state

Built 04/08/2026: flags in `normalize.ts`, `levers.ts` (14 moves, 4 services,
simulation, catalog validation), `views.ts` (both projections plus the safety
check), `scripts/demo-views.ts` (side-by-side render, fails on vocabulary
leak). Not built: L3 snapshots (needs Convex, TASK-011), Thai copy pass, the
in-app rendering of either view.
