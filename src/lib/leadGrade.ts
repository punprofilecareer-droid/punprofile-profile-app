/**
 * ICP / Lead Grade: "should we work with this person".
 *
 * Implements the framework in `08_Coaching_Business.md` → Ideal Customer
 * Profile (ICP), added 2026-07-11 and grounded in a review of the first 23 real
 * survey responses. Three criteria, max 10, banded into three tiers. The point
 * values are that document's, not this file's; if they disagree, it wins.
 *
 * **This is the buying axis, and it is deliberately not combined with urgency.**
 * That document is explicit: "Fit and Temperature stay independent axes, not
 * combined into one number", because strong fit with low urgency is a nurture
 * and weak fit with high urgency is a manage-expectations, and one blended
 * number cannot say either. So there is no single "propensity to buy" score
 * here, and adding one would be overriding a decision someone already made for
 * a reason.
 *
 * **Temperature is not implemented.** Its tiers are specified but its per-answer
 * point values are not: they live in the response sheet's ARRAYFORMULA columns
 * (that document, Build note, 2026-07-11). Porting it is TASK-055 and needs
 * those formulas, so this file scores fit only rather than guessing at urgency.
 */

import type { ScoringInput } from "./scoring";

export type FitTier = "weak" | "moderate" | "strong";

export interface LeadGrade {
  /** 0-10, or null when nothing needed for it was answered. */
  score: number | null;
  tier: FitTier | null;
  /** Per-criterion, so the coach can see which part carried the score. */
  parts: {
    roleFit: number;
    experience: number | null;
    investment: number | null;
  };
  /** Criteria the data cannot reach, named rather than silently scored zero. */
  unmeasured: string[];
}

/**
 * Role/Industry Fit, 0-4, from the Job Title Pool lookup.
 *
 * The pool is a spreadsheet tab this app has no copy of, so every lead takes
 * the documented fallback of 2 (ambiguous). That is the same behaviour as the
 * master sheet's own formula, which uses `IFERROR(VLOOKUP(...), 2)` rather than
 * erroring or scoring zero on an unknown title. Importing the pool would make
 * this real; until then the criterion contributes a constant and says so.
 */
const ROLE_FIT_FALLBACK = 2;

/** 2-10 years is the real cluster in this pool, so it scores highest. */
function experiencePoints(years: ScoringInput["experienceYears"]): number | null {
  switch (years) {
    case "2-10":
      return 3;
    case "0-1":
    case "11-15":
      return 2;
    case "16+":
      return 1;
    default:
      return null;
  }
}

/**
 * Investment Readiness. Having paid for anything before is the signal, whether
 * or not it was relevant: the framework asks about prior spend, not its aim.
 *
 * The 0 band ("explicitly cited money as a blocker") cannot be reached from
 * here. It comes from free-text answers the app does not collect and the
 * importer does not parse, so a money-blocked lead currently scores 1 rather
 * than 0 and reads slightly warmer than they are.
 */
function investmentPoints(prior: ScoringInput["priorInvestment"]): number | null {
  switch (prior) {
    case "relevant":
    case "unrelated":
      return 3;
    case "none":
      return 1;
    default:
      return null;
  }
}

export function gradeLead(input: ScoringInput): LeadGrade {
  const experience = experiencePoints(input.experienceYears);
  const investment = investmentPoints(input.priorInvestment);

  const unmeasured: string[] = ["Role/Industry Fit (no Job Title Pool)"];
  if (experience === null) unmeasured.push("Experience Level");
  if (investment === null) unmeasured.push("Investment Readiness");

  // Null rather than a low number when nothing is known. A lead with no data
  // is not a weak lead, and the whole product rests on not confusing the two.
  const score =
    experience === null && investment === null
      ? null
      : ROLE_FIT_FALLBACK + (experience ?? 0) + (investment ?? 0);

  return {
    score,
    tier: score === null ? null : score <= 3 ? "weak" : score <= 7 ? "moderate" : "strong",
    parts: { roleFit: ROLE_FIT_FALLBACK, experience, investment },
    unmeasured,
  };
}

/** Mean of the scored dimensions: how ready they are to land a job. */
export function readinessScore(dimensions: { score: number | null }[]): number | null {
  const scored = dimensions.filter((d) => d.score !== null);
  if (!scored.length) return null;
  return scored.reduce((sum, d) => sum + (d.score as number), 0) / scored.length;
}
