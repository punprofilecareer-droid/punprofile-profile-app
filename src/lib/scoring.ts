/**
 * EU Fit Check — self-report scoring.
 *
 * Pure functions over a canonical `SurveyResponse`. No Convex, no React, no I/O.
 * `convex/scoring.ts` calls `scoreResponse` inside `leads.submitAnswer`; the
 * client calls the same function for the optimistic teaser render; the offline
 * report renderer calls it too. One implementation, three callers.
 *
 * Every lookup table here is specified in `self-report-scoring.md`, which lives in
 * the COACHING repo at `punprofile-context/ctxt-product/`, not in this repo's
 * `docs/`, which is empty. Change that document and this file in the same commit,
 * or they drift.
 */

import { DIMENSIONS, TIER_WEIGHT, bandFor, GATES, DIRECTION_ITEMS } from "./model";
import { countryWeight, countryWeightWithLanguages } from "./country-english";
import type { DimensionKey, ConfidenceBand, Tier } from "./model";
import type { SurveyResponse, SalaryShape } from "./normalize";

export interface ItemScore {
  key: string;
  label: string;
  tier: Tier;
  /** 1-5, or null when the survey didn't reach it (coach item, or unanswered). */
  score: number | null;
  /** Why it's null. Shown in the report so an empty axis is never mysterious. */
  reason?: "coach_assessment" | "unanswered" | "unrecognised";
  note?: string;
}

export interface DimensionScore {
  key: DimensionKey;
  label: string;
  question: string;
  /** Mean of the scored items, 1-5, rounded to 1dp. Null when nothing scored. */
  score: number | null;
  /** Scored weight / total competencies. ECRA items weigh 1, proxies 0.5. */
  coverage: number;
  band: ConfidenceBand;
  items: ItemScore[];
  scoredCount: number;
  totalCount: number;
}

export interface ProfileScore {
  dimensions: DimensionScore[];
  /** Share of all 39 items that carry a score. Drives the report's headline caveat. */
  overallCoverage: number;
  /** True once at least one dimension has a score — the teaser-reveal trigger. */
  hasAnyScore: boolean;
}

// ------------------------------------------------------------------ lookups

const clamp = (n: number) => Math.max(1, Math.min(5, n));

function scoreExperienceDepth(v: SurveyResponse["experienceYears"]): number | null {
  // Caps at 4: years served is a floor on capability, never a demonstration of it.
  switch (v) {
    case "0-1": return 2;
    case "2-10": return 3;
    case "11-15": return 4;
    case "16+": return 4;
    default: return null;
  }
}

function scoreLearningInvestment(v: SurveyResponse["priorInvestment"]): number | null {
  switch (v) {
    case "none": return 2;
    case "unrelated": return 3;
    // Free-text answers describe real investment but can't be classified for
    // relevance without coach judgment, so they take the neutral middle.
    case "unclassified": return 3;
    case "relevant": return 4;
    default: return null;
  }
}

function scoreFollowThrough(n: number | null | undefined): number | null {
  if (n === null || n === undefined) return null;
  if (n === 0) return 1;
  if (n < 5) return 3;
  return 4;
}

function scoreAiFluency(indicators: number | null | undefined): number | null {
  // The framework's own formula: score = 1 + indicators met.
  if (indicators === null || indicators === undefined) return null;
  return clamp(1 + indicators);
}

function scoreCv(v: SurveyResponse["cv"]): number | null {
  // "Europe-ready" caps at 4 — self-declaration can't reach ECRA's 5.
  switch (v) {
    case "none": return 1;
    case "untailored": return 2;
    // Same band as untailored on purpose: both mean "exists, not sendable".
    // What differs is the action, not the readiness, and the action is a lever.
    case "out_dated": return 2;
    case "europe_ready": return 4;
    default: return null;
  }
}

function scoreLinkedin(v: SurveyResponse["linkedin"]): number | null {
  switch (v) {
    case "none": return 1;
    case "basic": return 2;
    case "active": return 4;
    // Posting regularly is the visibility this competency actually measures,
    // which is why it sits above a profile that is merely current.
    case "utilized": return 5;
    default: return null;
  }
}

function scorePortfolio(v: SurveyResponse["portfolio"]): number | null {
  switch (v) {
    case "none": return 1;
    case "partial": return 3;
    // `good` is legacy and still scores; ~160 records hold it.
    case "good":
    case "good_digital": return 4;
    // A paper portfolio cannot be linked in an application, which is most of
    // what a portfolio is for in this market.
    case "good_physical": return 3;
    default: return null;
  }
}

function scoreApplicationActivity(r: SurveyResponse): number | null {
  // The one proxy that can reach 5: "negotiating an offer" is a fact, not a self-rating.
  switch (r.stage) {
    case "not_started": return 1;
    case "researching": return 2;
    case "applying": return (r.applicationCount ?? 0) >= 5 ? 4 : 3;
    case "interviewing":
    // Interviewing without getting through is still interviewing: the market is
    // engaging with them. What it is not is progress, and the gap is what the
    // call exists to diagnose.
    case "interviewing_unsuccessful": return 4;
    case "offer": return 5;
    case "negotiating": return 5;
    default: return null;
  }
}

const CEFR_TO_SCORE: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 3, C1: 4, C2: 5 };

function scoreLanguageReadiness(r: SurveyResponse): number | null {
  if (!r.englishCefr) return null;
  const base = CEFR_TO_SCORE[r.englishCefr];
  // A second European language at B2+ adds one, capped — a fluent-English candidate
  // with B2 German must not outrank a native speaker's ceiling.
  const other = r.otherLanguageCefr;
  const bonus = other && ["B2", "C1", "C2"].includes(other) ? 1 : 0;
  return clamp(base + bonus);
}

function scoreBusinessEnglish(r: SurveyResponse): number | null {
  if (!r.englishCefr) return null;
  return CEFR_TO_SCORE[r.englishCefr];
}

function scoreVisaReadiness(v: SurveyResponse["workAuth"]): number | null {
  switch (v) {
    case "eu_rights": return 5;
    case "sponsor_route_named": return 4;
    case "sponsor_no_route": return 3;
    case "unsure": return 2;
    case "no_awareness": return 1;
    default: return null;
  }
}

function scoreFamilyReadiness(r: SurveyResponse): number | null {
  if (r.hasDependents === null || r.hasDependents === undefined) return null;
  // The framework auto-scores 5 when no dependents or partner are involved.
  if (r.hasDependents === false) return 5;
  if (r.familyIndicators === null || r.familyIndicators === undefined) return null;
  return clamp(1 + r.familyIndicators);
}

function scoreRelocationTimeline(r: SurveyResponse): number | null {
  let base: number;
  switch (r.timeline) {
    case "within_3m": base = 4; break;
    case "3_6m": base = 3; break;
    case "6_12m": base = 2; break;
    case "exploring": base = 1; break;
    default: return null;
  }
  // A date with no destination isn't a plan.
  if (!r.targetCountries || r.targetCountries.length === 0) base -= 1;
  return clamp(base);
}

/**
 * Target Clarity scores the ROLE only.
 *
 * See `08_Coaching_Business.md` § Country Reach: country count is reach, not
 * clarity, and it moved out of this item entirely. Counting countries could
 * never tell a language market from a scattergun, because it never asked what
 * the candidate holds — someone with German at B2 naming Germany, Austria and
 * Switzerland has named one language market spanning three states, and the old
 * rule penalised them against someone who ticked one country at random. The
 * 08/08/2026 taper was a patch on that same premise and is gone with it, which
 * also removes the model's only half-point.
 *
 * **This function must never read `targetCountries`.** Reach is scored by
 * Country Reach (TASK-073), owned by `08_Coaching_Business.md` → Country Fit.
 * `scripts/audit.ts` asserts the independence behaviourally, so reintroducing a
 * country branch here fails the audit rather than surviving quietly.
 *
 * The 4 and 2 bands need a CV and are unreachable until the Document tier lands
 * (TASK-066): a role the document supports scores above a role merely named,
 * and a role the document contradicts scores below it. Until then every named
 * role sits at 3, which is the honest ceiling for an unevidenced self-report.
 */
function scoreTargetClarity(r: SurveyResponse): number | null {
  const hasRole = !!(r.targetRole && r.targetRole.trim().length > 2 && r.targetRole.trim() !== "not_sure");
  return hasRole ? 3 : 1;
}

/**
 * Country Reach: the fraction of the candidate's named countries they can
 * realistically work in, `reachable / selected`.
 *
 * See `08_Coaching_Business.md` § Country Reach: country count is reach, not clarity.
 * **Four countries a candidate can genuinely reach score ABOVE one country**,
 * because a set held together by a language they hold is capability, not
 * vagueness. A scattergun still scores low with no count rule anywhere: B1
 * English across twelve countries produces a low ratio on its own, which is also
 * how the live form's real answer "สนใจทุกประเทศ" resolves correctly.
 *
 * English only, for now. `otherLanguageCefr` stores the highest level in ANY
 * European language without saying which, so it cannot be matched to a country.
 * See `REACH_IS_ENGLISH_ONLY` in `country-english.ts`.
 */
function scoreCountryReach(r: SurveyResponse): number | null {
  const countries = (r.targetCountries ?? []).filter((c) => c && c !== "not_sure");
  if (!countries.length) return 1;
  // The grid, when the candidate filled one in, otherwise English alone. A
  // local working language at B2 opens a country on its own, which is the only
  // way a "lower" band country such as Italy or Poland can score at all.
  const total = countries.reduce(
    (sum, c) => sum + countryWeightWithLanguages(c, r.englishCefr ?? null, r.otherLanguages),
    0,
  );
  const ratio = total / countries.length;
  if (ratio >= 1) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

function scoreSalaryStated(s: SalaryShape | null | undefined): number | null {
  if (!s) return null;
  if (!s.hasFigure) return 1;
  return s.hasCurrency && s.hasPeriod ? 3 : 2;
}

// ------------------------------------------------------------------ scoring

/** Everything the scorer needs beyond the canonical response. */
export interface ScoringInput extends SurveyResponse {
  salary?: SalaryShape | null;
  /**
   * Whether anyone replied to their applications. Asked by this app since
   * 19/08/2026 and never by the survey, which is why it sits here rather than
   * in `SurveyResponse`.
   *
   * **Nothing in this file reads it.** It exists for `temperature.ts`, whose
   * weights were written against exactly this question, and it deliberately
   * scores no competency: response rate is market feedback about a CV, not a
   * self-reported capability, and the item it looks like (Search
   * Follow-through) is already measured by `applicationCount`.
   */
  applicationResponse?: "not_applied" | "no_replies" | "some_replies" | null;
}

const SCORERS: Record<string, (r: ScoringInput) => number | null> = {
  experienceDepth: (r) => scoreExperienceDepth(r.experienceYears),
  learningInvestment: (r) => scoreLearningInvestment(r.priorInvestment),
  searchFollowThrough: (r) => scoreFollowThrough(r.applicationCount),
  aiDigitalFluency: (r) => scoreAiFluency(r.aiIndicators),
  cvStatus: (r) => scoreCv(r.cv),
  linkedinStatus: (r) => scoreLinkedin(r.linkedin),
  portfolioEvidence: (r) => scorePortfolio(r.portfolio),
  applicationActivity: scoreApplicationActivity,
  visaReadiness: (r) => scoreVisaReadiness(r.workAuth),
  languageReadiness: scoreLanguageReadiness,
  familyReadiness: scoreFamilyReadiness,
  relocationTimeline: scoreRelocationTimeline,
  businessEnglish: scoreBusinessEnglish,
  targetClarity: scoreTargetClarity,
  countryReach: scoreCountryReach,
  salaryStated: (r) => scoreSalaryStated(r.salary),
};

export function scoreResponse(response: ScoringInput): ProfileScore {
  let scoredWeight = 0;
  let totalWeight = 0;

  const dimensions: DimensionScore[] = DIMENSIONS.map((dim) => {
    const items: ItemScore[] = dim.items.map((def) => {
      if (def.tier === "coach") {
        return { key: def.key, label: def.label, tier: def.tier, score: null, reason: "coach_assessment" as const, note: def.note };
      }
      const scorer = SCORERS[def.key];
      const score = scorer ? scorer(response) : null;
      return {
        key: def.key,
        label: def.label,
        tier: def.tier,
        score,
        reason: score === null ? ("unanswered" as const) : undefined,
        note: def.note,
      };
    });

    const scored = items.filter((i) => i.score !== null);
    const mean = scored.length ? scored.reduce((s, i) => s + (i.score as number), 0) / scored.length : null;

    // Coverage counts the weight actually earned, not the weight theoretically
    // available — an unanswered ECRA question lowers coverage exactly as a
    // coach-only competency does, because in both cases we don't know.
    const earned = items.reduce((w, i) => w + (i.score !== null ? TIER_WEIGHT[i.tier] : 0), 0);
    const coverage = earned / dim.items.length;

    scoredWeight += earned;
    totalWeight += dim.items.length;

    return {
      key: dim.key,
      label: dim.label,
      question: dim.question,
      score: mean === null ? null : Math.round(mean * 10) / 10,
      coverage,
      band: bandFor(coverage),
      items,
      scoredCount: scored.length,
      totalCount: dim.items.length,
    };
  });

  return {
    dimensions,
    overallCoverage: totalWeight ? scoredWeight / totalWeight : 0,
    hasAnyScore: dimensions.some((d) => d.score !== null),
  };
}

// --------------------------------------------------------------- highlights

export interface Highlight {
  dimension: string;
  label: string;
  score: number;
  tier: Tier;
  key: string;
  actionRank?: number;
  actionWhy?: string;
}

/** Strongest scored items, best first. Ties break toward ECRA-tier evidence. */
export function topStrengths(profile: ProfileScore, n = 4): Highlight[] {
  return collect(profile)
    .sort((a, b) => b.score - a.score || tierRank(a.tier) - tierRank(b.tier))
    .slice(0, n);
}

/** Weakest scored items, worst first — the highest-impact things to move. */
export function developmentPriorities(profile: ProfileScore, n = 4): Highlight[] {
  return collect(profile)
    .sort((a, b) => a.score - b.score || tierRank(a.tier) - tierRank(b.tier))
    .slice(0, n);
}

function tierRank(t: Tier): number {
  return t === "ecra" ? 0 : t === "proxy" ? 1 : 2;
}

/**
 * The first thing the candidate should actually go and do.
 *
 * Deliberately NOT "the lowest score". Two reasons:
 *
 * 1. Family Readiness and Relocation Timeline are often low for reasons that are
 *    life circumstances rather than tasks. Telling someone their family
 *    situation is their top action item is both wrong and unkind, so neither
 *    carries an `actionRank` and neither is ever offered here.
 * 2. Ranking purely by score puts Portfolio Evidence first for most respondents
 *    — 44 of the 63 real responses report no portfolio, scoring the floor —
 *    when a portfolio is a late-stage nice-to-have for most white-collar roles
 *    and an unfixed CV is not. Lowest-score-wins produces advice that is
 *    arithmetically correct and practically useless.
 *
 * So funnel order leads and the score only decides whether a stage counts as
 * deficient, following the triage order in `08_Coaching_Business.md` → Triage
 * Logic: direction, then assets, then applications. The earliest clearly-weak
 * stage wins; failing that, the earliest merely-average one; failing that, the
 * weakest thing available.
 */
export function firstAction(profile: ProfileScore): Highlight | null {
  const actionable = collect(profile)
    .filter((h) => h.actionRank !== undefined)
    .sort((a, b) => (a.actionRank as number) - (b.actionRank as number));
  if (!actionable.length) return null;

  // Step 1. Direction is a precondition, not a gate. Settled 13/08/2026: this
  // funnel order and `10_Methodology.md`'s gate order picked different actions
  // for the same candidate, one choosing the CV while the other chose the visa
  // route, and the app has one slot. The root cause was structural rather than a
  // tie: Direction is Stage 0 and precedes every gate, but its evidence sits
  // inside European Market Fit, which gates fourth. So it is checked first and
  // explicitly.
  const direction = actionable
    .filter((h) => (DIRECTION_ITEMS as readonly string[]).includes(h.key))
    .filter((h) => h.score <= 2)
    .sort((a, b) => a.score - b.score || (a.actionRank as number) - (b.actionRank as number));
  if (direction.length) return direction[0];

  // Step 2. The lowest uncleared gate, in dependency order, sets the stage.
  // Step 3. Funnel order picks the item inside it. A gate with no actionable item
  // is skipped rather than ending the search: its items are coach-tier or life
  // circumstances, which are never offered as "the first thing to move".
  for (const gate of GATES) {
    const dim = profile.dimensions.find((d) => d.key === gate.key);
    if (!dim || dim.score === null || dim.score >= gate.bar) continue;
    const keys = new Set(dim.items.map((i) => i.key));
    const inGate = actionable.filter((h) => keys.has(h.key));
    if (!inGate.length) continue;
    return (
      inGate.find((h) => h.score <= 2) ??
      inGate.find((h) => h.score <= 3) ??
      [...inGate].sort((a, b) => a.score - b.score)[0]
    );
  }

  // Every gate cleared, or no gate had anything actionable. Fall back to the
  // funnel across the whole profile, which is what this function did before.
  return (
    actionable.find((h) => h.score <= 2) ??
    actionable.find((h) => h.score <= 3) ??
    [...actionable].sort((a, b) => a.score - b.score)[0]
  );
}

function collect(profile: ProfileScore): Highlight[] {
  const out: Highlight[] = [];
  for (const d of profile.dimensions) {
    for (const i of d.items) {
      if (i.score === null) continue;
      const def = DIMENSIONS.find((x) => x.key === d.key)?.items.find((x) => x.key === i.key);
      out.push({
        dimension: d.label,
        label: i.label,
        score: i.score,
        tier: i.tier,
        key: i.key,
        actionRank: def?.actionRank,
        actionWhy: def?.actionWhy,
      });
    }
  }
  return out;
}
