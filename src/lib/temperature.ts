/**
 * Temperature: how urgently, on the scale `08_Coaching_Business.md` owns.
 *
 * TASK-055. The weights implemented here are that document's "Per-answer
 * weights, recovered 14/08/2026" table, which is the owner: it exists because
 * the numbers lived only inside a Google Sheet's `ARRAYFORMULA` columns, were
 * read out before the sheet was retired, and carry two corrections the sheet
 * was deliberately never given. **If this file and that table disagree, the
 * table wins.** Do not re-derive anything here from the formulas.
 *
 * **It is not combined with Fit, and must not be.** That document is explicit
 * that the two stay independent axes: strong fit with low urgency is a
 * nurture, weak fit with high urgency is a manage-expectations, and one blended
 * number says neither. `leadGrade.ts` answers "should we work with this
 * person"; this answers "how soon". Read them side by side, never multiplied.
 *
 * **Ops vocabulary, never candidate-facing.** `assertCandidateSafe()` already
 * rejects the word temperature, and the tier names below are for a coach's
 * screen and an agent's file.
 *
 * ---
 *
 * ## What porting cost, stated rather than smoothed over
 *
 * The weights were written for the Europe Readiness Check, a 6-question quiz
 * retired 15/08/2026 with one lifetime response. This app asks different
 * questions. Four of the five scored inputs survive the move intact; one does
 * not, and pretending otherwise would produce a number nobody could trust.
 *
 * - **Q1 Direction** → `targetCountries` and `targetRole`. Clear on both, one,
 *   or neither. Exact.
 * - **Q2 Stage** → `stage`. Exact, and this app has the split the quiz's
 *   formula never got: `interviewing` and `negotiating` both score 2 as the
 *   correction intended.
 * - **Q4 Applications** → `applicationResponse`, since 19/08/2026. The quiz
 *   asked about the *response* to applications, and for one day this app could
 *   not answer that: it asks how many roles were applied to, not who replied,
 *   so the input capped at 1 of 2 and nobody in the base could reach the top
 *   band. Paul's call was to add the question rather than move the line, so
 *   `questions.ts` now asks the quiz's own Q4 and this reads it directly.
 *
 *   The fallback is `applicationCount`, and it is exactly the old capped
 *   behaviour: the 90 imported survey leads were never asked about replies and
 *   never will be, so "applied, response unknown" scores 1 and says so in
 *   `unmeasured`. Inferring a response from `stage` was considered and
 *   rejected for both paths: it would score Q2 twice under two names.
 * - **Q5 Visa** → `workAuth`. Exact. Both sponsorship answers are the
 *   "understand I'll need sponsorship" band; `no_awareness` joins `unsure`.
 * - **Q6 Timeline** → `timeline`. Exact.
 *
 * So a lead who answered the app's questions reaches 10, and one imported from
 * the survey reaches 9. `measuredMax` says which per lead, rather than leaving
 * a reader to discover it.
 *
 * ## Unanswered questions do not score zero
 *
 * Same rule as everything else here: a question nobody reached is not a low
 * answer. Absent inputs are excluded from the sum and named in `unmeasured`.
 * The tier is then only reported when it is *certain*: the band is computed
 * from what is measured plus the most and least the missing answers could add,
 * and if those land in different bands the tier is null and `tierRange` says
 * which two. A half-answered lead is honestly ambiguous rather than falsely
 * cold, which matters because cold is exactly the state that gets nobody
 * called.
 */

import type { ScoringInput } from "./scoring";

export const TEMPERATURE_TIERS = ["just_starting", "getting_there", "ready_to_move"] as const;
export type TemperatureTier = (typeof TEMPERATURE_TIERS)[number];

/**
 * Bands and names from the owning document's Temperature table. The Thai is
 * that table's own, kept because it is the name Paul uses for the tier; it is
 * an ops label and never rendered to a candidate.
 */
export const TEMPERATURE_TIER_LABELS: Record<TemperatureTier, { th: string; en: string; cta: string }> = {
  just_starting: { th: "เพิ่งเริ่มต้น", en: "Just starting", cta: "Soft nurture, no form ask" },
  getting_there: { th: "ใกล้พร้อมแล้ว", en: "Getting there", cta: "Route to EU Fit Check" },
  ready_to_move: { th: "พร้อมลุย", en: "Ready to move", cta: "Book the consultation directly" },
};

/** 0-3, 4-7, 8-10. The document's cuts, not this file's. */
export function tierFor(score: number): TemperatureTier {
  if (score >= 8) return "ready_to_move";
  if (score >= 4) return "getting_there";
  return "just_starting";
}

/** One scored input: what it contributed, and why. */
export interface TemperatureInput {
  key: "direction" | "stage" | "applications" | "visa" | "timeline";
  /** Null when the question was not reached. Never 0 for "unanswered". */
  points: number | null;
  /** The most this input could score for anyone. 2 everywhere except Q4. */
  max: number;
  /** The answer that produced the points, for a coach reading the row. */
  basis: string | null;
}

export interface Temperature {
  /** Sum of the measured inputs, 0-9 in practice. Null when nothing measured. */
  score: number | null;
  /** The document's nominal maximum. Always 10. */
  max: number;
  /** What this lead's answered inputs could have summed to. */
  measuredMax: number;
  /** Set only when the missing answers cannot change the band. */
  tier: TemperatureTier | null;
  /** The two bands the lead could be in, when `tier` is null. */
  tierRange: [TemperatureTier, TemperatureTier] | null;
  inputs: TemperatureInput[];
  /** Named, never silently scored zero. */
  unmeasured: string[];
  /** Which interaction rule was applied, in words. Null when none was. */
  interaction: string | null;
}

const NOT_REACHED = (key: TemperatureInput["key"], max = 2): TemperatureInput => ({
  key,
  points: null,
  max,
  basis: null,
});

/** Q1. Clear on both, clear on one, still exploring. */
function direction(input: ScoringInput): TemperatureInput {
  const countriesAnswered = input.targetCountries !== undefined;
  const roleAnswered = "targetRole" in input;
  if (!countriesAnswered && !roleAnswered) return NOT_REACHED("direction");

  // `not_sure` is filtered to an empty array and a null role by the mappers, so
  // an answered-but-unsure question reads as "no", which is the intended state.
  const hasCountry = (input.targetCountries?.length ?? 0) > 0;
  const hasRole = Boolean(input.targetRole);
  const points = (hasCountry ? 1 : 0) + (hasRole ? 1 : 0);
  return {
    key: "direction",
    points,
    max: 2,
    basis:
      points === 2 ? "country and role" : points === 1 ? (hasCountry ? "country only" : "role only") : "still exploring",
  };
}

/** Q2. The correction the retired sheet never got: both ends of the split score 2. */
function stage(input: ScoringInput): TemperatureInput {
  if (input.stage === undefined || input.stage === null) return NOT_REACHED("stage");
  const s = input.stage;
  // `interviewing_unsuccessful` scores 2 with the other two. It was added to
  // this app after the weights were recovered, and the booking gate already
  // treats it as interviewing: the market is engaging with them, which is what
  // this input measures. `offer` is at least as urgent as negotiating one.
  const points =
    s === "interviewing" || s === "interviewing_unsuccessful" || s === "offer" || s === "negotiating"
      ? 2
      : s === "applying"
        ? 1
        : 0;
  return { key: "stage", points, max: 2, basis: s };
}

/**
 * Q4, the input that needed a question adding to reach full resolution.
 *
 * Two paths, and `max` differs between them, which is the point: a lead who
 * answered `applicationResponse` can score 2, and one who only has a count
 * cannot score more than 1 no matter how many roles they applied to. Reporting
 * `max: 1` on the fallback is what keeps the tier arithmetic honest, because
 * the tier is decided by what the outstanding answers could still add.
 */
function applications(input: ScoringInput): TemperatureInput {
  const reply = input.applicationResponse;
  if (reply) {
    const points = reply === "some_replies" ? 2 : reply === "no_replies" ? 1 : 0;
    return { key: "applications", points, max: 2, basis: reply };
  }

  // Neither answer present: the lead has reached neither question. Bounded at 2
  // rather than 1, because the reply question is the one they would reach next
  // and it can still score 2. An imported record with no application count is
  // bounded optimistically for one run and settles the moment either lands.
  if (input.applicationCount === undefined || input.applicationCount === null) {
    return NOT_REACHED("applications", 2);
  }
  const applied = input.applicationCount > 0;
  return {
    key: "applications",
    points: applied ? 1 : 0,
    max: 1,
    basis: applied ? "has applied, replies not asked" : "has not applied",
  };
}

/**
 * Q5.
 *
 * **`sponsor_route_named` scores 2, changed 26/08/2026 (Paul).** It scored 1,
 * the same as `sponsor_no_route`, and that was a straight error rather than a
 * judgement: `10_Methodology.md`'s Mobility Readiness ladder has five rungs and
 * names those two separately, because someone who knows they need sponsorship
 * AND has identified a route they can use is materially further along than
 * someone who knows they need one and has nothing. The method said so; this
 * file collapsed them.
 *
 * It is also what made the top tier unreachable. Measured across 195 reachable
 * rows, nobody had ever scored above 7 against a band starting at 8, because
 * three of the five inputs have a 2-point band this audience is defined by NOT
 * having: applications wants "got some responses" (0 of 147), this one wanted
 * EU work rights (10%), and stage wants interviewing or negotiating (2%). The
 * arithmetic ceiling for a candidate squarely inside the ICP was exactly 7.
 *
 * With this line, 8 is reachable from inside the ICP, which is what a top band
 * has to be. Six leads clear it, all the same profile: country and role known,
 * actively applying, a named visa route, moving within three months. The
 * boundary did not move, and lowering it to 7 stays rejected: 33 people sit on
 * 7 and that is not a call list. See `temperature-top-band.md`.
 */
function visa(input: ScoringInput): TemperatureInput {
  if (input.workAuth === undefined || input.workAuth === null) return NOT_REACHED("visa");
  const w = input.workAuth;
  const points = w === "eu_rights" || w === "sponsor_route_named" ? 2 : w === "sponsor_no_route" ? 1 : 0;
  return { key: "visa", points, max: 2, basis: w };
}

/** Q6. */
function timeline(input: ScoringInput): TemperatureInput {
  if (input.timeline === undefined || input.timeline === null) return NOT_REACHED("timeline");
  const t = input.timeline;
  const points = t === "within_3m" ? 2 : t === "3_6m" || t === "6_12m" ? 1 : 0;
  return { key: "timeline", points, max: 2, basis: t };
}

const UNMEASURED_LABELS: Record<TemperatureInput["key"], string> = {
  direction: "Direction (target country and role)",
  stage: "Job-search stage",
  applications: "Applications",
  visa: "Work authorisation",
  timeline: "Timeline",
};

export function temperatureFor(input: ScoringInput): Temperature {
  const inputs = [direction(input), stage(input), applications(input), visa(input), timeline(input)];

  const measured = inputs.filter((i) => i.points !== null);
  const unmeasured: string[] = inputs
    .filter((i) => i.points === null)
    .map((i) => `${UNMEASURED_LABELS[i.key]} not answered`);

  // Not a missing answer: the question was never put to this lead, which is
  // true of every imported survey record and of nobody who answers the app
  // today. Named separately, and only when it actually bit.
  const apps = inputs.find((i) => i.key === "applications");
  if (apps?.points === 1 && apps.max === 1) {
    unmeasured.push("Whether anyone replied (not asked of this lead; caps the input at 1 of 2)");
  }

  if (measured.length === 0) {
    return {
      score: null,
      max: 10,
      measuredMax: 0,
      tier: null,
      tierRange: null,
      inputs,
      unmeasured,
      interaction: null,
    };
  }

  const score = measured.reduce((sum, i) => sum + (i.points ?? 0), 0);
  const measuredMax = measured.reduce((sum, i) => sum + i.max, 0);
  const missingMax = inputs.filter((i) => i.points === null).reduce((sum, i) => sum + i.max, 0);

  /**
   * The document's first interaction rule, and only that one.
   *
   * "If Entry Point = Career Coaching, cap temperature at ใกล้พร้อมแล้ว." Step 1
   * of the Entry Point tree is `Q1 = direction unclear`, and it stops there, so
   * direction scoring 0 IS that entry point. No decision tree needs porting to
   * evaluate it.
   *
   * The second rule, the negotiation floor, is deliberately NOT applied. It
   * keys on Entry Point = Job Application Lifecycle - negotiation, which the
   * tree reaches through Q3 and Q4, and Q4 is the input this app cannot
   * measure. Applying a partial version would be inventing a routing rule the
   * owning document did not write. The floor stays unreachable here for the
   * same reason it was unreachable in the retired sheet, minus the bug.
   *
   * The cap is applied to the band, not to the score. The raw sum stays what
   * the answers add up to, because a capped number that no longer matches its
   * own inputs is the kind of value nobody can check.
   */
  const RANK: Record<TemperatureTier, number> = {
    just_starting: 0,
    getting_there: 1,
    ready_to_move: 2,
  };
  const capAt = (t: TemperatureTier, ceiling: TemperatureTier) =>
    RANK[t] > RANK[ceiling] ? ceiling : t;

  // Certain only when the answers still outstanding cannot move the band.
  let low = tierFor(score);
  let high = tierFor(score + missingMax);

  let interaction: string | null = null;
  const dir = inputs.find((i) => i.key === "direction");
  if (dir?.points === 0) {
    const bound = high === "ready_to_move";
    low = capAt(low, "getting_there");
    high = capAt(high, "getting_there");
    if (bound) {
      interaction =
        "Capped at getting_there: no clear target country or role, which is step 1 of the Entry " +
        "Point tree and therefore the Career Coaching entry point. Someone without a direction " +
        "needs the fuller conversation before being pushed to book.";
    }
  }

  const tier: TemperatureTier | null = low === high ? low : null;
  const tierRange: [TemperatureTier, TemperatureTier] | null = tier === null ? [low, high] : null;

  return { score, max: 10, measuredMax, tier, tierRange, inputs, unmeasured, interaction };
}
