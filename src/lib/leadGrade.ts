/**
 * ICP / Lead Grade: "should we work with this person".
 *
 * Implements `08_Coaching_Business.md` → Ideal Customer Profile, **as
 * restructured 13/08/2026 into two gates and one score**. The previous
 * three-criteria, max-10 version this file used to carry is dead: measured
 * across all 90 real leads it called 68% Strong and two of ninety Weak, which
 * qualifies nobody. The cause was not bad scoring, it was that Thai Jobs in
 * Europe already excludes front-line work, so ICP was re-measuring a selection
 * that had already happened upstream. The point values are that document's, not
 * this file's; if they disagree, it wins.
 *
 * **This is the buying axis, and it is deliberately not combined with urgency.**
 * That document is explicit: "Fit and Temperature stay independent axes, not
 * combined into one number", because strong fit with low urgency is a nurture
 * and weak fit with high urgency is a manage-expectations, and one blended
 * number cannot say either.
 *
 * **Temperature is not implemented.** Its per-answer weights were recovered on
 * 14/08/2026 and belong in `08_Coaching_Business.md`; porting them is TASK-055.
 * Note that urgency is not what gates a booking anyway: the SQL trigger is the
 * stage question, decided 14/08/2026.
 */

import type { ScoringInput } from "./scoring";

export type FitTier = "weak" | "moderate" | "strong";

/**
 * A gate can fail, pass, or have nothing to judge on. `assumed_pass` is the
 * third state kept separate from a real pass on purpose: the framework says an
 * ungated lead stays in scope by default, and that is safe because the channel
 * filtered them, but it is not the same claim as having checked.
 */
export type GateVerdict = "pass" | "assumed_pass" | "fail";

export interface LeadGrade {
  /** Gate 1, In Scope. White-collar or IT professional, read off the CV. */
  inScope: GateVerdict;
  /** Gate 2, Offering Match. Standard coaching, or needs a different offering. */
  offeringMatch: GateVerdict;
  /** Why Gate 2 failed, in words a coach can act on. Null when it passed. */
  routingNote: string | null;
  /** Investment Readiness, 0-3. Null when the question was not answered. */
  score: number | null;
  tier: FitTier | null;
  /** Criteria the data cannot reach, named rather than silently scored zero. */
  unmeasured: string[];
}

/**
 * Gate 2, Offering Match, from years of experience.
 *
 * 16+ years and true first-jobbers route to a different offering. The framework
 * is explicit that this "may need a different offering, not necessarily a worse
 * lead", which is exactly why it stopped being a deduction: expressing it as
 * lost points contradicted the document's own note.
 */
function offeringGate(years: ScoringInput["experienceYears"]): {
  verdict: GateVerdict;
  note: string | null;
} {
  switch (years) {
    case "2-10":
    case "11-15":
      return { verdict: "pass", note: null };
    case "16+":
      return {
        verdict: "fail",
        note: "16+ years. Senior enough that standard coaching is likely the wrong pitch, not a weaker lead.",
      };
    case "0-1":
      return {
        verdict: "fail",
        note: "First-jobber. Needs a different conversation from a mid-career relocation.",
      };
    default:
      return { verdict: "assumed_pass", note: null };
  }
}

/**
 * Investment Readiness, 0-3. The only criterion that separated the pool, 41%
 * having paid for career development before against 53% who had not, and the
 * closest thing to a willingness-to-pay signal that exists pre-sale.
 *
 * Having paid for anything before is the signal, whether or not it was
 * relevant: the framework asks about prior spend, not its aim.
 *
 * The 0 band ("explicitly cited money as a blocker") cannot be reached from
 * here. It comes from free-text answers the app does not collect and the
 * importer does not parse, so a money-blocked lead scores 1 rather than 0 and
 * reads slightly warmer than they are.
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

/**
 * Build the grade's input from a raw `leads.responses` record.
 *
 * Separate from `toScoringInput` on purpose, and this is the important part of
 * this file. Two reasons:
 *
 * 1. **The candidate's chart must not change.** `experienceDepth` and
 *    `learningInvestment` are items of Professional Capability, which Stage 1
 *    leaves hollow by design (PRD § 1). Routing these two answers through
 *    `toScoringInput` would silently start scoring that dimension and reverse a
 *    decision nobody made. The coach gets the answers; the chart does not.
 * 2. **Two vocabularies exist.** App-native rows are keyed by question key,
 *    while the 90 rows written by `scripts/backfill-leads.ts` are keyed by
 *    ScoringInput field name. Both spell these two fields the same way, but
 *    reading the record directly rather than through the app-only mapper is
 *    what makes imported leads gradeable at all.
 */
export function toGradeInput(responses: Record<string, unknown>): ScoringInput {
  const experience = responses.experienceYears;
  const investment = responses.priorInvestment;

  const EXPERIENCE = new Set(["0-1", "2-10", "11-15", "16+"]);
  const INVESTMENT = new Set(["none", "unrelated", "relevant", "unclassified"]);

  /**
   * Two shapes reach this field and both have to collapse to the same three
   * states the score understands.
   *
   * The 90 imported survey rows hold a single string from the old vocabulary.
   * App rows since 14/08/2026 hold an array of the areas the candidate paid
   * for, because Paul wanted to know what they bought rather than only whether
   * they bought. The score deliberately does not read the areas: the framework
   * asks about prior spend and not its aim, so any paid area is `unrelated`,
   * which is the band that already means "paid for something, relevance not
   * established". `never` is the exclusive no, and it maps to `none`.
   *
   * An empty array is not a no. It means the question was reached and left,
   * which is unmeasured, and the whole product rests on not confusing the two.
   */
  const readInvestment = (): ScoringInput["priorInvestment"] => {
    if (typeof investment === "string") {
      return INVESTMENT.has(investment)
        ? (investment as ScoringInput["priorInvestment"])
        : null;
    }
    if (Array.isArray(investment)) {
      const picked = investment.filter((v): v is string => typeof v === "string");
      if (!picked.length) return null;
      if (picked.includes("never")) return "none";
      return "unrelated";
    }
    return null;
  };

  return {
    experienceYears:
      typeof experience === "string" && EXPERIENCE.has(experience)
        ? (experience as ScoringInput["experienceYears"])
        : null,
    priorInvestment: readInvestment(),
  };
}

export function gradeLead(input: ScoringInput): LeadGrade {
  const gate2 = offeringGate(input.experienceYears);
  const score = investmentPoints(input.priorInvestment);

  const unmeasured: string[] = [];
  // Gate 1 reads the current job title off the CV (decided 13/08/2026: not a
  // new question, because the app has no free-text input type and the signal it
  // replaces gave 81% of leads the same answer). Until the Phase 5 CV pipeline
  // lands there is nothing to read, so every lead is in scope by default.
  unmeasured.push("In Scope gate (no CV pipeline yet)");
  if (gate2.verdict === "assumed_pass") unmeasured.push("Offering Match gate");
  if (score === null) unmeasured.push("Investment Readiness");

  return {
    inScope: "assumed_pass",
    offeringMatch: gate2.verdict,
    routingNote: gate2.note,
    score,
    // Null rather than a low number when nothing is known. A lead with no data
    // is not a weak lead, and the whole product rests on not confusing the two.
    tier: score === null ? null : score === 0 ? "weak" : score === 1 ? "moderate" : "strong",
    unmeasured,
  };
}

/** Mean of the scored dimensions: how ready they are to land a job. */
export function readinessScore(dimensions: { score: number | null }[]): number | null {
  const scored = dimensions.filter((d) => d.score !== null);
  if (!scored.length) return null;
  return scored.reduce((sum, d) => sum + (d.score as number), 0) / scored.length;
}
