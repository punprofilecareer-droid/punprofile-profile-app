/**
 * The sentence bank behind the personalized result summary.
 *
 * **This personalizes by selection, not generation.** The engine picks which of
 * these fixed sentences apply from the candidate's own scores; it never writes
 * one. That is the only way the summary can be both translatable and honest: a
 * generated sentence would reach a candidate in unreviewed Thai, and could
 * claim something the scores do not support.
 *
 * English here is a draft written against the scoring logic so the meaning is
 * correct. Replace it with natural Thai through the worksheet rather than
 * translating it clause by clause, per the native-tone rule in
 * `03_Content_System.md`.
 *
 * Two rules this copy must not break, both from `08_Coaching_Business.md` and
 * enforced by `assertCandidateSafe()`:
 *   - no internal vocabulary (lead, propensity, triage, temperature, tier)
 *   - motivation never buys honesty back. An unmeasured area says so; it is
 *     never softened into a score.
 */

import type { CopyEntry } from "./copy";

/**
 * Overall standing bands. Thresholds match `describe()` in `narrative.ts`, so
 * the teaser and the coach report never disagree about what a number means.
 */
export const STANDING_BANDS = [
  { key: "advantage", min: 4.5 },
  { key: "strong", min: 3.5 },
  { key: "typical", min: 2.5 },
  { key: "developing", min: 1.5 },
  { key: "earliest", min: 0 },
] as const;

export type StandingKey = (typeof STANDING_BANDS)[number]["key"];

export const standingFor = (score: number): StandingKey =>
  (STANDING_BANDS.find((b) => score >= b.min) ?? STANDING_BANDS[4]).key;

export const NARRATIVE_COPY = {
  // ------------------------------------------------------- pathway openers
  // FR-008: the opening line must differ meaningfully by route, and "not sure"
  // must read as an equally legitimate answer rather than a lesser one.
  "narrative.opener.job_first": {
    screen: "Result summary, opening line when the route is find-a-job-first",
    en: "You're aiming to land the job first, then move. That's the route with the most moving parts, and the one where being specific pays off fastest.",
    th: "",
  },
  "narrative.opener.study_first": {
    screen: "Result summary, opening line when the route is study-first",
    en: "You're planning to study first, then work. That buys you time in-country, and it changes which parts of this matter most right now.",
    th: "",
  },
  "narrative.opener.family": {
    screen: "Result summary, opening line when the route is family or partner",
    en: "You're moving through a family or partner route. Your right to work is likely the settled part, so the work goes into the profile itself.",
    th: "",
  },
  "narrative.opener.not_sure": {
    screen: "Result summary, opening line when the route is not chosen yet. Must not read as a worse answer",
    en: "You're still weighing up how you'd get to Europe. That's a reasonable place to be, and this read is meant to help you choose rather than assume you already have.",
    th: "",
  },

  // ------------------------------------------------------- overall standing
  "narrative.standing.advantage": {
    screen: "Result summary, when the overall picture is a real advantage",
    en: "On what you've told us, you're further along than most people at this stage.",
    th: "",
  },
  "narrative.standing.strong": {
    screen: "Result summary, when the overall picture is strong",
    en: "On what you've told us, you've got real foundations in place.",
    th: "",
  },
  "narrative.standing.typical": {
    screen: "Result summary, when the overall picture is mid-range",
    en: "On what you've told us, you're about where most people are at this stage.",
    th: "",
  },
  "narrative.standing.developing": {
    screen: "Result summary, when the overall picture is still developing",
    en: "On what you've told us, there's groundwork still to do. That's normal this early, and it's all work you can actually do.",
    th: "",
  },
  "narrative.standing.earliest": {
    screen: "Result summary, when the candidate is at the very beginning",
    en: "You're at the start of this. Nothing here is a verdict, and every part of it moves with work.",
    th: "",
  },

  // ------------------------------------------------------------ lead-in lines
  "narrative.strength.lead": {
    screen: "Result summary, before the strongest area. {area} is substituted",
    en: "Your strongest area right now is {area}.",
    th: "",
  },
  "narrative.next.lead": {
    screen: "Result summary, before the single next action",
    en: "If you change one thing first, make it this:",
    th: "",
  },
  "narrative.unmeasured": {
    screen: "Result summary, when parts could not be scored. {count} is substituted",
    en: "{count} things this measures need a conversation rather than a form, so they're left blank rather than guessed at.",
    th: "",
  },

  // -------------------------------------------------------------------- CTA
  "narrative.cta.heading": {
    screen: "Result summary, above the consultation button",
    en: "Want to go through this properly?",
    th: "",
  },
  "narrative.cta.body": {
    screen: "Result summary, under the heading. Sells measurement, never a verdict",
    en: "A 30-minute consultation with PunProfile goes through your answers in detail and turns this into a plan you can act on.",
    th: "",
  },
  "narrative.cta.button": {
    screen: "Result summary, the consultation button itself",
    en: "Book a free 30-minute consultation",
    th: "",
  },
} as const satisfies Record<string, CopyEntry>;

export type NarrativeCopyKey = keyof typeof NARRATIVE_COPY;
