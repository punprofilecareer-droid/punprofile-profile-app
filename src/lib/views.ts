/**
 * The two projections of one assessment.
 *
 * Coach view: gaps, levers ranked by simulated uplift with an employability
 * focus, the AI toolstack plan, and what an engagement unlocks. Free to use
 * internal vocabulary.
 *
 * Candidate journey: the motivational surface. Built as a WHITELIST, a typed
 * shape containing only fields safe to show, rather than the coach view with
 * fields removed. `08_Coaching_Business.md` is explicit that internal ops
 * terms (lead, qualification, triage, temperature, propensity, tier, asset)
 * never appear respondent-facing; `assertCandidateSafe` makes that a check
 * instead of a hope. Motivation here never buys honesty back: reachable
 * deltas are the candidate's own re-scored answers, and the unlock line sells
 * measurement, not a verdict.
 */

import { scoreResponse, topStrengths, firstAction } from "./scoring";
import type { ScoringInput, ProfileScore, Highlight } from "./scoring";
import { rankMoves, projectUnlock, MOVES } from "./levers";
import type { MoveImpact, UnlockProjection, Module } from "./levers";
import { DIMENSIONS, BAND_COPY } from "./model";
import { AI_INDICATOR_LABELS } from "./normalize";
import { pick, t, ALL_COPY } from "./locale";
import type { AnyCopyKey } from "./locale";
import type { Locale } from "./locale";
import { NARRATIVE_COPY, standingFor } from "./content/narrative-copy";

// -------------------------------------------------------------- coach view

export interface CoachView {
  candidate: string;
  dims: { key: string; label: string; score: number | null; coverage: number; band: string; bandCopy: string }[];
  /** The same pick the report's "what to do first" makes. */
  firstAction: Highlight | null;
  /** Goal 1.1: levers ranked by simulated Employability delta. */
  employabilityLevers: MoveImpact[];
  /** Best moves overall, any dimension. */
  topLevers: MoveImpact[];
  /** Goal 1.2: the AI toolstack state and what to deploy. */
  aiPlan: {
    state: "unknown" | "partial" | "complete";
    metCount: number | null;
    missing: string[];
    moves: MoveImpact[];
  };
  /** What an engagement measures that self-report cannot. */
  unlock: UnlockProjection;
  byModule: { module: Module; moves: MoveImpact[] }[];
}

export function buildCoachView(input: ScoringInput, candidate: string): CoachView {
  const profile = scoreResponse(input);
  const overall = rankMoves(input);
  const employability = rankMoves(input, "employability").filter(
    (x) => (x.changes.find((c) => c.dimension === "employability")?.delta ?? 0) > 0,
  );
  const aiMoves = overall.filter((x) => x.move.ai && x.move.itemKey === "aiDigitalFluency");
  const flags = input.aiIndicatorFlags ?? null;
  const missing = flags ? AI_INDICATOR_LABELS.filter((_, i) => !flags[i]) : [...AI_INDICATOR_LABELS];

  const modules: Module[] = ["Career Coaching", "Candidate Profile Optimization", "Job Application Lifecycle", "Self-serve"];
  return {
    candidate,
    dims: profile.dimensions.map((d) => ({
      key: d.key, label: d.label, score: d.score, coverage: d.coverage, band: d.band, bandCopy: BAND_COPY[d.band],
    })),
    firstAction: firstAction(profile),
    employabilityLevers: employability,
    topLevers: overall.slice(0, 6),
    aiPlan: {
      state: flags === null ? "unknown" : missing.length === 0 ? "complete" : "partial",
      metCount: flags ? flags.filter(Boolean).length : null,
      missing,
      moves: aiMoves,
    },
    unlock: projectUnlock(profile),
    byModule: modules
      .map((m) => ({ module: m, moves: overall.filter((x) => x.move.module === m) }))
      .filter((g) => g.moves.length > 0),
  };
}

// -------------------------------------------------------- candidate journey

export interface JourneyStep {
  label: string;
  status: "done" | "next" | "later" | "unanswered";
  detail?: string;
}

export interface CandidateJourney {
  candidate: string;
  /** Lead with what they have, not what they lack. */
  strengths: { label: string; score: number; area: string }[];
  next: { title: string; why: string } | null;
  /** The funnel as a visible checklist: progress mechanics without fake scores. */
  steps: JourneyStep[];
  aiHabits: { label: string; done: boolean | null }[];
  /** "Doing X moves Y from a to b", re-scored from their own answers. */
  reachable: { action: string; area: string; from: number | null; to: number | null }[];
  measured: { count: number; total: number; line: string };
  caveat: string;
}

/**
 * The funnel steps as candidate-visible mechanics. `doneAt` is the score at
 * which the step reads as complete; salary caps at 3 by design, language is
 * usable from conversational.
 */
const STEPS: { itemKey: string; doneAt: number }[] = [
  { itemKey: "targetClarity", doneAt: 4 },
  { itemKey: "cvStatus", doneAt: 4 },
  { itemKey: "linkedinStatus", doneAt: 4 },
  { itemKey: "visaReadiness", doneAt: 4 },
  { itemKey: "languageReadiness", doneAt: 3 },
  { itemKey: "portfolioEvidence", doneAt: 3 },
  { itemKey: "applicationActivity", doneAt: 3 },
];

export function buildCandidateJourney(
  input: ScoringInput,
  candidate: string,
  /**
   * Candidate-facing strings resolve here rather than at render, so the whole
   * projection stays a flat shape. Defaults to English for the offline coach
   * tooling, which has no locale of its own.
   */
  locale: Locale = "en",
): CandidateJourney {
  const profile = scoreResponse(input);
  const itemScores = new Map<string, number | null>();
  for (const d of profile.dimensions) for (const i of d.items) itemScores.set(i.key, i.score);

  const fa = firstAction(profile);
  // The move's candidate copy already carries its own reasoning, so the card
  // shows one text or the other, never both saying the same thing twice.
  const faMove = fa ? MOVES.find((m) => m.itemKey === fa.key && m.applies(input)) : undefined;

  // The checklist's "next" is the SAME pick firstAction makes, not merely the
  // first unfinished step in display order. firstAction prefers the earliest
  // clearly-weak stage; marking a different step "next" here would give the
  // candidate two competing instructions on one page.
  const steps: JourneyStep[] = STEPS.map((s) => {
    const label = t(`step.${s.itemKey}` as AnyCopyKey, locale);
    const score = itemScores.get(s.itemKey);
    if (score === null || score === undefined) {
      return { label, status: "unanswered", detail: t("step.unanswered", locale) };
    }
    if (score >= s.doneAt) return { label, status: "done" };
    if (fa && s.itemKey === fa.key) return { label, status: "next" };
    return { label, status: "later" };
  });

  const flags = input.aiIndicatorFlags ?? null;
  const aiHabits = AI_INDICATOR_LABELS.map((label, i) => ({ label, done: flags ? flags[i] : null }));

  const reachable = rankMoves(input)
    .filter((x) => (x.changes[0]?.delta ?? 0) > 0)
    .slice(0, 2)
    .map((x) => ({
      action: pick(x.move.candidate, locale),
      area: dimensionName(x.changes[0].dimension, x.changes[0].label, locale),
      from: x.changes[0].from,
      to: x.changes[0].to,
    }));

  const unlock = projectUnlock(profile);
  return {
    candidate,
    strengths: topStrengths(profile, 3).map((h) => ({
      label: itemName(h.key, h.label, locale),
      score: h.score,
      area: dimensionName(DIM_KEY_BY_LABEL.get(h.dimension) ?? "", h.dimension, locale),
    })),
    next: fa
      ? faMove
        ? { title: pick(faMove.candidate, locale), why: "" }
        : {
            title: t("result.startWith", locale, { area: itemName(fa.key, fa.label, locale) }),
            why: fa.actionWhy ?? "",
          }
      : null,
    steps,
    aiHabits,
    reachable,
    measured: {
      count: unlock.measuredNow,
      total: unlock.totalItems,
      line: t("result.measured", locale, {
        count: unlock.measuredNow,
        total: unlock.totalItems,
        more: unlock.measuredAfter - unlock.measuredNow,
      }),
    },
    caveat: t("result.caveat", locale),
  };
}

// ----------------------------------------------------------- teaser summary

export interface TeaserSummary {
  /** Pathway-aware opening line, FR-008. */
  opener: string;
  /** Where they stand overall, from the mean of the scored dimensions. */
  standing: string;
  /** Their best area, named. Null when nothing scored yet. */
  strengthLead: string | null;
  /** The single highest-impact next move, named but not explained. */
  nextLead: string;
  next: string | null;
  /** Present only when something could not be scored. Never softened. */
  unmeasured: string | null;
}

type Pathway = "job_first" | "study_first" | "family" | "not_sure";

/**
 * The candidate-facing name of a competency. `model.ts` names them in English
 * for the coach report; naming one to a candidate goes through COPY instead, or
 * a Thai sentence ends up with an English noun dropped into the middle of it.
 * Falls back to the model's label so an unmapped item degrades to English
 * rather than to a blank.
 */
export function itemName(key: string, fallback: string, locale: Locale): string {
  const copyKey = `item.${key}` as AnyCopyKey;
  if (copyKey in ALL_COPY) return t(copyKey, locale);
  return fallback.replace(/ \(self-declared\)$/, "");
}

/**
 * The candidate-facing name of a dimension, for the same reason as `itemName`.
 * `model.ts` and the chart both name these; the chart already reads COPY, and
 * anything else that shows a dimension by name to a candidate must too.
 */
export function dimensionName(key: string, fallback: string, locale: Locale): string {
  const copyKey = `dimension.${key}` as AnyCopyKey;
  return copyKey in ALL_COPY ? t(copyKey, locale) : fallback;
}

/**
 * The same, for callers holding only the English label.
 *
 * `Highlight.dimension` carries the label rather than the key, and the
 * candidate report shows which area a strength came from. Named here beside
 * `DIM_KEY_BY_LABEL` rather than exporting the map, so the fallback rule lives
 * in one place.
 */
export function dimensionNameByLabel(label: string, locale: Locale): string {
  return dimensionName(DIM_KEY_BY_LABEL.get(label) ?? "", label, locale);
}

/**
 * `Highlight.dimension` carries the English LABEL rather than the key
 * (`scoring.ts:350`), so a candidate surface has to map it back before it can
 * be named. Widening `Highlight` itself would ripple through the coach report
 * for no gain there, since that report wants the English.
 */
const DIM_KEY_BY_LABEL = new Map(DIMENSIONS.map((d) => [d.label, d.key]));

/**
 * The short version, for the pre-unlock teaser.
 *
 * Deliberately thinner than `buildCandidateJourney`. PRD FR-004 keeps the
 * teaser free of any contact ask, and FR-005 makes the full chart AND narrative
 * the reward for giving contact details, so the whole journey here would leave
 * the unlock with nothing to give. This names the next move; it does not
 * explain how to make it.
 *
 * Every sentence is selected from `NARRATIVE_COPY`, never composed, so nothing
 * can reach a candidate untranslated or unreviewed.
 */
export function buildTeaserSummary(
  input: ScoringInput,
  pathway: Pathway | null,
  locale: Locale = "en",
): TeaserSummary {
  const profile = scoreResponse(input);
  const scored = profile.dimensions.filter((d) => d.score !== null);
  const mean =
    scored.length > 0
      ? scored.reduce((sum, d) => sum + (d.score as number), 0) / scored.length
      : 0;

  const best = topStrengths(profile, 1)[0] ?? null;
  const fa = firstAction(profile);
  const faMove = fa ? MOVES.find((m) => m.itemKey === fa.key && m.applies(input)) : undefined;

  const unmeasuredCount = profile.dimensions.reduce(
    (n, d) => n + (d.totalCount - d.scoredCount),
    0,
  );

  return {
    opener: t(`narrative.opener.${pathway ?? "not_sure"}` as const, locale),
    standing: t(`narrative.standing.${standingFor(mean)}` as const, locale),
    strengthLead: best
      ? t("narrative.strength.lead", locale, { area: itemName(best.key, best.label, locale) })
      : null,
    nextLead: t("narrative.next.lead", locale),
    next: faMove ? pick(faMove.candidate, locale) : null,
    unmeasured:
      unmeasuredCount > 0
        ? t("narrative.unmeasured", locale, { count: unmeasuredCount })
        : null,
  };
}

// ------------------------------------------------------------- safety check

/**
 * Internal ops vocabulary that must never reach a candidate surface, per the
 * customer-facing naming rule in `08_Coaching_Business.md`. Run against the
 * rendered candidate output, not the data, so template slip-ups are caught too.
 */
const BANNED: RegExp[] = [
  /\blead\b/i, /\bleads\b/i, /\bICP\b/, /propensity/i, /entry point/i,
  /\btriage\b/i, /temperature/i, /\btier\b/i, /qualif/i, /\basset\b/i, /conversion/i,
];

export function assertCandidateSafe(renderedText: string): string[] {
  return BANNED.filter((re) => re.test(renderedText)).map((re) => String(re));
}
