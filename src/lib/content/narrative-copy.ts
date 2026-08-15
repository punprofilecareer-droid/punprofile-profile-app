/**
 * **Thai wording passed by Paul, 15/08/2026**, in the review of all shipped
 * Thai. One edit was overruled by the lint and not by me: `นัดคุยฟรี 30 นาที`
 * is the ฟรี collocation LR-04 exists to prevent, and the termbase already
 * bans it in favour of the fixed `นัดปรึกษาฟรี 30 นาที`.
 *
 * The sentence bank behind the personalized result summary.
 *
 * **This personalizes by selection, not generation.** The engine picks which of
 * these fixed sentences apply from the candidate's own scores; it never writes
 * one. That is the only way the summary can be both translatable and honest: a
 * generated sentence would reach a candidate in unreviewed Thai, and could
 * claim something the scores do not support.
 *
 * Language rules live in `Language_System.md`, LR-01 to LR-08, with the decided
 * terms in `termbase.yml` beside it. Read them there rather than trusting a
 * summary here, because they change: two were added on 09/08/2026 alone.
 * `scripts/lint-thai.ts` enforces the mechanical ones over these strings on
 * every `verify-copy` run.
 *
 * The one constraint specific to this file: a sentence here must stand on its
 * own for the situation named in its `screen` note, without knowing which
 * others appear beside it, because the engine selects rather than composes.
 * `assertCandidateSafe()` and `scripts/verify-copy.ts` enforce the rest.
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
    th: "คุณตั้งใจหางานให้ได้ก่อนแล้วค่อยย้าย เส้นทางนี้มีหลายเรื่องให้จัดการ แต่ไม่ต้องทำทุกอย่างพร้อมกัน ยิ่งรู้ชัดว่าอยากไปประเทศไหนและทำงานอะไร ก็ยิ่งวางแผนขั้นต่อไปได้ง่ายขึ้น",
  },
  "narrative.opener.study_first": {
    screen: "Result summary, opening line when the route is study-first",
    en: "You're planning to study first, then work. That buys you time in-country, and it changes which parts of this matter most right now.",
    th: "คุณวางแผนไปเรียนก่อนแล้วค่อยเริ่มทำงาน แบบนี้จะมีเวลาอยู่ในประเทศเป้าหมายมากขึ้น โอกาสในการฝึกงาน เรื่องที่ควรเตรียมตอนนี้จึงต่างจากคนที่กำลังสมัครงานจากไทย",
  },
  "narrative.opener.family": {
    screen: "Result summary, opening line when the route is family or partner",
    en: "You're moving through a family or partner route. Your right to work is likely the settled part, so the work goes into the profile itself.",
    th: "คุณวางแผนย้ายไปยุโรปกับครอบครัวหรือคู่ครอง เรื่องสิทธิในการทำงานจึงน่าจะชัดขึ้นแล้ว จากนี้ควรหันมาเตรียมโปรไฟล์ให้พร้อมสำหรับตลาดงาน",
  },
  "narrative.opener.not_sure": {
    screen: "Result summary, opening line when the route is not chosen yet. Must not read as a worse answer",
    en: "You're still weighing up how you'd get to Europe. That's a reasonable place to be, and this read is meant to help you choose rather than assume you already have.",
    th: "คุณยังไม่แน่ใจว่าจะไปยุโรปด้วยเส้นทางไหน ไม่เป็นไรเลย ผลประเมินนี้มีไว้ช่วยให้คุณเห็นทางเลือกชัดขึ้น ไม่ได้คาดหวังว่าต้องมีคำตอบตั้งแต่วันนี้",
  },

  // ------------------------------------------------------- overall standing
  "narrative.standing.advantage": {
    screen: "Result summary, when the overall picture is a real advantage",
    en: "On what you've told us, you're further along than most people at this stage.",
    th: "จากคำตอบของคุณ ตอนนี้ถือว่าพร้อมกว่าคนส่วนใหญ่ที่อยู่ในจุดเดียวกัน",
  },
  "narrative.standing.strong": {
    screen: "Result summary, when the overall picture is strong",
    en: "On what you've told us, you've got real foundations in place.",
    th: "จากคำตอบของคุณ พื้นฐานตอนนี้ถือว่าดีทีเดียว",
  },
  "narrative.standing.typical": {
    screen: "Result summary, when the overall picture is mid-range",
    en: "On what you've told us, you're about where most people are at this stage.",
    th: "ความพร้อมของคุณตอนนี้ใกล้เคียงกับคนส่วนใหญ่ที่อยู่ในจุดเดียวกัน",
  },
  "narrative.standing.developing": {
    screen: "Result summary, when the overall picture is still developing",
    en: "On what you've told us, there's groundwork still to do. That's normal this early, and it's all work you can actually do.",
    th: "ยังมีบางเรื่องที่ควรเตรียมเพิ่ม ซึ่งเป็นเรื่องปกติมากในช่วงเริ่มต้น ค่อย ๆ ทำทีละเรื่องได้",
  },
  "narrative.standing.earliest": {
    screen: "Result summary, when the candidate is at the very beginning",
    en: "You're at the start of this. Nothing here is a verdict, and every part of it moves with work.",
    th: "ตอนนี้คุณเพิ่งเริ่มต้น ผลนี้จึงเป็นเพียงภาพคร่าว ๆ ว่าควรพัฒนาตรงไหนต่อ ไม่ใช่คำตัดสินว่าคุณไปได้ไกลแค่ไหน",
  },

  // ------------------------------------------------------------ lead-in lines
  "narrative.strength.lead": {
    screen: "Result summary, before the strongest area. {area} is substituted",
    en: "Your strongest area right now is {area}.",
    th: "ตอนนี้จุดแข็งที่เห็นชัดที่สุดของคุณคือ {area}",
  },
  "narrative.next.lead": {
    screen: "Result summary, before the single next action",
    en: "If you change one thing first, make it this:",
    th: "ถ้าจะเลือกทำก่อนสักเรื่อง เราแนะนำเรื่องนี้:",
  },
  "narrative.unmeasured": {
    screen: "Result summary, when parts could not be scored. {count} is substituted",
    en: "{count} things this measures need a conversation rather than a form, so they're left blank rather than guessed at.",
    th: "ยังมีอีก {count} เรื่องที่ต้องคุยกันเพิ่มเติมถึงจะประเมินได้ เราเลยเว้นส่วนนั้นไว้ก่อน แทนที่จะเดาคำตอบให้คุณ",
  },

  // -------------------------------------------------------------------- CTA
  "narrative.cta.heading": {
    screen: "Result summary, above the consultation button",
    en: "Want to go through this properly?",
    th: "อยากเข้าใจผลประเมินนี้ให้ชัดขึ้นไหม",
  },
  "narrative.cta.body": {
    screen: "Result summary, under the heading. Sells measurement, never a verdict",
    en: "A 30-minute consultation with PunProfile goes through your answers in detail and turns this into a plan you can act on.",
    th: "มาคุยกัน 30 นาทีกับ PunProfile เราจะช่วยดูคำตอบของคุณให้ละเอียดขึ้น แล้วเรียบเรียงออกมาเป็นแผนที่รู้ว่าควรทำอะไรต่อ",
  },
  "narrative.cta.button": {
    screen: "Result summary, the consultation button itself",
    en: "Book a free 30-minute consultation",
    th: "นัดปรึกษาฟรี 30 นาที",
  },
} as const satisfies Record<string, CopyEntry>;

export type NarrativeCopyKey = keyof typeof NARRATIVE_COPY;
