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
  if (cv === "none" || cv === "untailored" || cv === "out_dated" || cv === "europe_ready")
    input.cv = cv;

  const li = str(responses.linkedin);
  if (li === "none" || li === "basic" || li === "active" || li === "utilized")
    input.linkedin = li;

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

  // `negotiating` since 15/08/2026, when the question stopped merging it into
  // `offer`. Both still score 5; the split exists because the booking rule and
  // the negotiation module read the value, not the score.
  const stage = str(responses.stage);
  if (
    stage === "not_started" ||
    stage === "researching" ||
    stage === "applying" ||
    stage === "interviewing" ||
    stage === "interviewing_unsuccessful" ||
    stage === "offer" ||
    stage === "negotiating"
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
  if (
    portfolio === "none" ||
    portfolio === "partial" ||
    // `good` is legacy and still accepted; records hold it.
    portfolio === "good" ||
    portfolio === "good_physical" ||
    portfolio === "good_digital"
  ) {
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
  const APPLICATIONS: Record<string, number> = {
    "0": 0,
    "1-4": 2,
    "5-20": 10,
    "21-50": 35,
    "51-100": 75,
    "100+": 150,
    // Retired from the question 15/08/2026, superseded by the three bands
    // above. Kept because existing records hold it.
    "20+": 25,
  };
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

// ------------------------------------------------------- the other vocabulary

/**
 * Fields only the backfill ever writes.
 *
 * Each is a `ScoringInput` field name that no question key shares, so any one
 * of them present means the record was written by `scripts/backfill-leads.ts`
 * rather than by the app. Deliberately not `_contactRaw` or `_entryPoint`
 * alone: those are the coach's sheet columns and one imported row carried them
 * empty.
 */
const IMPORT_ONLY_KEYS = [
  "englishCefr",
  "applicationCount",
  "aiIndicators",
  "aiIndicatorFlags",
  "otherLanguageCefr",
  "hasDependents",
  "familyIndicators",
  "familyIndicatorFlags",
  "salaryText",
] as const;

/** True when `responses` speaks the survey vocabulary rather than the app's. */
export function isImportedRecord(responses: Responses): boolean {
  return IMPORT_ONLY_KEYS.some((k) => k in responses);
}

const CEFR = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;

const boolArray = (v: unknown): boolean[] | undefined =>
  Array.isArray(v) && v.every((x) => typeof x === "boolean") ? (v as boolean[]) : undefined;

const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

/**
 * The survey vocabulary, read back as a `ScoringInput`.
 *
 * The backfill stored the normalised input verbatim, so this is close to a cast.
 * It is written out field by field anyway, for the same reason `normalize.ts`
 * returns null on anything it does not recognise: a record that has drifted
 * should lose the drifted field, not smuggle an unchecked value into the scorer.
 *
 * `experienceYears` and `priorInvestment` ARE read here, and that is not a
 * reversal of the decision above. Those two are excluded from the app path
 * because Stage 1 leaves Professional Capability hollow by design. These leads
 * answered the full survey, were scored on it at import, and their stored
 * `leads.scores` already carries that dimension. Dropping the two fields here
 * would make the admin screen disagree with the number in the database.
 */
function fromImportedRecord(responses: Responses): ScoringInput {
  const input: ScoringInput = {};

  const experience = oneOf(responses.experienceYears, ["0-1", "2-10", "11-15", "16+"] as const);
  if (experience) input.experienceYears = experience;

  const investment = oneOf(responses.priorInvestment, [
    "none",
    "unrelated",
    "relevant",
    "unclassified",
  ] as const);
  if (investment) input.priorInvestment = investment;

  const countries = strArray(responses.targetCountries);
  if (countries) input.targetCountries = countries;

  const role = str(responses.targetRole);
  if (role) input.targetRole = role;

  const timeline = oneOf(responses.timeline, ["within_3m", "3_6m", "6_12m", "exploring"] as const);
  if (timeline) input.timeline = timeline;

  const stage = oneOf(responses.stage, [
    "not_started",
    "researching",
    "applying",
    "interviewing",
    "interviewing_unsuccessful",
    "offer",
    "negotiating",
  ] as const);
  if (stage) input.stage = stage;

  const applications = num(responses.applicationCount);
  if (applications !== undefined) input.applicationCount = applications;

  const cv = oneOf(responses.cv, ["none", "untailored", "out_dated", "europe_ready"] as const);
  if (cv) input.cv = cv;

  const linkedin = oneOf(responses.linkedin, ["none", "basic", "active", "utilized"] as const);
  if (linkedin) input.linkedin = linkedin;

  const portfolio = oneOf(responses.portfolio, [
    "none",
    "partial",
    "good",
    "good_physical",
    "good_digital",
  ] as const);
  if (portfolio) input.portfolio = portfolio;

  const english = str(responses.englishCefr);
  if (english && CEFR.has(english)) input.englishCefr = english as ScoringInput["englishCefr"];

  const otherLanguage = str(responses.otherLanguageCefr);
  if (otherLanguage && CEFR.has(otherLanguage)) {
    input.otherLanguageCefr = otherLanguage as ScoringInput["otherLanguageCefr"];
  }

  const workAuth = oneOf(responses.workAuth, [
    "eu_rights",
    "sponsor_route_named",
    "sponsor_no_route",
    "unsure",
    "no_awareness",
  ] as const);
  if (workAuth) input.workAuth = workAuth;

  // Flags first, count derived: evidence stays granular and the count is the
  // compression, never the other way round (`candidate-data-architecture.md` L0).
  const aiFlags = boolArray(responses.aiIndicatorFlags);
  if (aiFlags) {
    input.aiIndicatorFlags = aiFlags;
    input.aiIndicators = aiFlags.filter(Boolean).length;
  }

  if (typeof responses.hasDependents === "boolean") {
    input.hasDependents = responses.hasDependents;
    const familyFlags = boolArray(responses.familyIndicatorFlags);
    if (familyFlags) {
      input.familyIndicatorFlags = familyFlags;
      input.familyIndicators = familyFlags.filter(Boolean).length;
    }
  }

  // The parsed shape, not a figure. The survey asked salary as free text and
  // `normalize.ts` reduced it to whether a usable figure was stated, which is
  // all `scoreSalaryStated` ever reads.
  const salary = responses.salary;
  if (salary && typeof salary === "object" && !Array.isArray(salary)) {
    const s = salary as Record<string, unknown>;
    if (
      typeof s.hasFigure === "boolean" &&
      typeof s.hasCurrency === "boolean" &&
      typeof s.hasPeriod === "boolean"
    ) {
      input.salary = { hasFigure: s.hasFigure, hasCurrency: s.hasCurrency, hasPeriod: s.hasPeriod };
    }
  }

  return input;
}

/**
 * A lead's stored answers as a `ScoringInput`, whichever vocabulary they are in.
 *
 * Every admin surface must use this rather than `toScoringInput`. Reading an
 * imported row with the app mapper silently drops English, applications, AI
 * fluency, family and salary: on a real lead that took European Market Fit from
 * 3.5 to 2.0, Mobility Readiness from 3.8 to 3.0, and emptied Professional
 * Capability entirely, while the chart carried on looking finished. A wrong
 * chart that looks complete is the exact failure this product exists to avoid.
 *
 * `leadGrade.ts` already named the two-vocabulary split. It never had to choose
 * between them, because the two fields the grade reads are spelled the same in
 * both. The scorer reads nine that are not.
 */
export function toScoringInputForLead(responses: Responses): ScoringInput {
  return isImportedRecord(responses) ? fromImportedRecord(responses) : toScoringInput(responses);
}
