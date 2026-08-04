/**
 * TASK-051: canonical responses -> ScoringInput, by direct assignment.
 *
 * This is the app-era counterpart of `normalize.ts`: no regexes, no guessing,
 * because `questions.ts` only ever stores canonical values. An unanswered
 * question is simply absent, which the scorer already treats honestly (the
 * item drops out of its dimension's mean).
 */

import type { ScoringInput } from "../scoring.js";

type Responses = Record<string, unknown>;

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

export function toScoringInput(responses: Responses): ScoringInput {
  const input: ScoringInput = {};

  const country = str(responses.targetCountry);
  if (country) input.targetCountries = country === "not_sure" ? [] : [country];

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
    stage === "offer" ||
    stage === "negotiating"
  ) {
    input.stage = stage;
  }

  const tl = str(responses.timeline);
  if (tl === "within_3m" || tl === "3_6m" || tl === "6_12m" || tl === "exploring") {
    input.timeline = tl;
  }

  // Stage 2 fields (portfolio, AI habits, family, salary, experience...) map
  // here as their questions land in Phase 2. One function, one direction.

  return input;
}
