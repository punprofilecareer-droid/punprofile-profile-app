/**
 * TASK-051: canonical responses -> ScoringInput, by direct assignment.
 *
 * This is the app-era counterpart of `normalize.ts`: no regexes, no guessing,
 * because `questions.ts` only ever stores canonical values. An unanswered
 * question is simply absent, which the scorer already treats honestly (the
 * item drops out of its dimension's mean).
 */

import type { ScoringInput } from "../scoring";

type Responses = Record<string, unknown>;

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

const strArray = (v: unknown): string[] | null =>
  Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : null;

export function toScoringInput(responses: Responses): ScoringInput {
  const input: ScoringInput = {};

  // `pathway` maps to nothing on purpose. It is context and narrative only
  // (SLOT: pathway), stored on the `leads.pathway` column rather than in
  // ScoringInput, so its absence here is a decision, not an omission.

  // Multi-select since 08/08/2026. `targetCountry` is the pre-multi-select key
  // and is read as a fallback so rows written before the change still score.
  const countries =
    strArray(responses.targetCountries) ??
    (str(responses.targetCountry) ? [str(responses.targetCountry) as string] : null);
  if (countries) {
    input.targetCountries = countries.filter((c) => c !== "not_sure");
  }

  const role = str(responses.targetRole);
  if (role) input.targetRole = role === "not_sure" ? null : role;

  const cv = str(responses.cv);
  if (cv === "none" || cv === "untailored" || cv === "europe_ready") input.cv = cv;

  const li = str(responses.linkedin);
  if (li === "none" || li === "basic" || li === "active") input.linkedin = li;

  const wa = str(responses.workAuth);
  if (
    wa === "eu_rights" ||
    wa === "sponsor_route_named" ||
    wa === "sponsor_no_route" ||
    wa === "unsure"
  ) {
    input.workAuth = wa;
  }

  const en = str(responses.english);
  if (en === "A1" || en === "A2" || en === "B1" || en === "B2" || en === "C1" || en === "C2") {
    input.englishCefr = en;
  }

  const stage = str(responses.stage);
  if (
    stage === "not_started" ||
    stage === "researching" ||
    stage === "applying" ||
    stage === "interviewing" ||
    stage === "offer"
  ) {
    input.stage = stage;
  }

  const tl = str(responses.timeline);
  if (tl === "within_3m" || tl === "3_6m" || tl === "6_12m" || tl === "exploring") {
    input.timeline = tl;
  }

  // ---- The five questions carried over from the Google Form, 14/08/2026.
  // Each maps to a shape the scorers already understood, because those scorers
  // were written against the survey. Nothing new was invented here; the app
  // simply stopped being the only source that could not reach them.

  const portfolio = str(responses.portfolio);
  if (portfolio === "none" || portfolio === "partial" || portfolio === "good") {
    input.portfolio = portfolio;
  }

  /**
   * Applications: a band becomes the number the scorer bands again.
   *
   * The representative values are chosen to land in the right band and nowhere
   * near a boundary: `scoreFollowThrough` splits at 0, under 5, and 5 or more,
   * and `scoreApplicationActivity` asks only whether it is 5 or more. So 2 and
   * 10 are not estimates of what anyone applied to, they are the middle of
   * their band, and the band is all that is ever read.
   */
  const APPLICATIONS: Record<string, number> = { "0": 0, "1-4": 2, "5-20": 10, "20+": 25 };
  const apps = str(responses.applications);
  if (apps && apps in APPLICATIONS) input.applicationCount = APPLICATIONS[apps];

  /**
   * AI fluency: count and flags, in the framework's own indicator order.
   *
   * `never` is the exclusive no and produces zero indicators, which scores 1,
   * not null. That distinction is the whole point: "I do none of these" is an
   * answer and "I did not reach this question" is not, and they must never
   * arrive at the same score.
   */
  const AI_ORDER = ["ai_weekly", "eu_tools", "ai_tailor", "self_taught"];
  const ai = strArray(responses.aiTools) ?? [];
  if (ai.length) {
    const flags = AI_ORDER.map((k) => ai.includes(k));
    input.aiIndicatorFlags = flags;
    input.aiIndicators = flags.filter(Boolean).length;
  }

  /**
   * Family: one answer carrying two fields.
   *
   * `none` means nobody moves with them, which the framework auto-scores 5, so
   * the indicators are not read at all. Everything else means somebody does,
   * and `not_yet` is how "somebody does, and we have planned none of it"
   * reaches zero indicators rather than being unanswerable.
   */
  const FAMILY_ORDER = ["discussed", "no_objection", "dependents_plan", "logistics"];
  const family = strArray(responses.family) ?? [];
  if (family.length) {
    if (family.includes("none")) {
      input.hasDependents = false;
    } else {
      input.hasDependents = true;
      const flags = FAMILY_ORDER.map((k) => family.includes(k));
      input.familyIndicatorFlags = flags;
      input.familyIndicators = flags.filter(Boolean).length;
    }
  }

  /**
   * Salary: a band becomes the shape the proxy measures, which is only whether
   * a usable figure was stated. Every band carries a figure, a currency and a
   * period by construction, so they all score the same, and that is correct:
   * judging whether the figure is realistic needs a country and role
   * benchmark, and that stays a coach-tier item.
   */
  const salary = str(responses.salary);
  if (salary) {
    input.salary =
      salary === "not_sure"
        ? { hasFigure: false, hasCurrency: false, hasPeriod: false }
        : { hasFigure: true, hasCurrency: true, hasPeriod: true };
  }

  // Stage 2's language grid, TASK-072. A record rather than a scalar, so it is
  // copied across whole after checking every level, which is the only shape
  // check that matters here: the mutation already filtered the language names.
  const langs = responses.otherLanguages;
  if (langs && typeof langs === "object" && !Array.isArray(langs)) {
    const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
    const clean: Record<string, "A1" | "A2" | "B1" | "B2" | "C1" | "C2"> = {};
    for (const [lang, level] of Object.entries(langs as Record<string, unknown>)) {
      if (typeof level === "string" && LEVELS.has(level)) {
        clean[lang] = level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
      }
    }
    if (Object.keys(clean).length) input.otherLanguages = clean;
  }

  // Stage 2 fields (portfolio, AI habits, family, salary...) map here as their
  // questions land in Phase 2. One function, one direction.
  //
  // `experienceYears` and `priorInvestment` are the deliberate exception, added
  // to Stage 1 on 14/08/2026 and NOT mapped here. Both are items of
  // Professional Capability, which Stage 1 leaves hollow by design (PRD § 1),
  // so routing them through this function would start scoring that dimension as
  // a side effect of a question added for the coach's ICP grade. They reach the
  // grade through `toGradeInput` in `leadGrade.ts` instead. `verify-content.ts`
  // check 3 objects if this is ever reversed by accident.

  return input;
}
