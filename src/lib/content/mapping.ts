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
