import type { Copy, CopyKey } from "./copy";
// `SampleAxis` labels the four axes by their `dimension.*` keys rather than by
// restating them, so the sample cannot drift from the real chart.
import type { AnyCopyKey } from "@/lib/locale";

/**
 * The home page. 17/08/2026.
 *
 * Full reasoning, section by section, is `home-page.md` in the coaching repo's
 * `work-projects/eu-fit-check/`. The short version:
 *
 * `/` was four elements and all four were about EU Fit Check. That stopped
 * being right on 04/08/2026, when `AGENTS.md` named the app as the product and
 * the assessment as one feature of it. The same correction was already made on
 * the share card on 16/08/2026, on Paul's call, and the page the card points at
 * had not caught up.
 *
 * **This is not a third sales page.** `/coaching` sells the engagement and
 * `/services` says what the offerings are. The home page answers the two
 * questions a stranger arriving from a job post actually holds: who are you,
 * and what does this cost me. Nothing else on the site answers the second one.
 *
 * **Long-form, so it does not inherit the pinned post's shape.**
 * `03_Content_System.md` § Short-form and long-form is explicit: the symptom
 * stack and the check-in earn attention in a feed and read as padding once the
 * reader has already opened the page. A page opens on the question the reader
 * came with.
 *
 * **This is Paul's own Thai, as of 17/08/2026.** He read all twenty-six strings
 * on the generated review sheet and rewrote twenty of them, including several the
 * sheet had marked as already his. Every string here now carries a note saying
 * what he changed and why, or that he read it and left it alone.
 *
 * That matters beyond bookkeeping: `scripts/lib/provenance.ts` reads this claim,
 * and `npm run audit:thai` files the file under ALREADY HIS or NEEDS A PASS on
 * the strength of it. The claim is a statement, never an inference from how good
 * the Thai looks, so it is only ever updated when he has actually read it.
 *
 * Two other sources appear alongside his, and are labelled where they are used:
 *
 * - The pinned post, `pinned-post-punprofile-intro.md`, which he wrote and which
 *   he then revised further for this page.
 * - `services.ts` and `copy.ts`, read at render rather than copied, which is why
 *   the three offerings and the three figure labels are not written here at all. Composed is not the same as approved.
 *
 * The hero's four strings are deliberately NOT here. They live in `copy.ts`,
 * because `verify-copy.ts` runs `lint-thai` over that file and not over the
 * per-page modules, and because two of them are also the site's default title
 * and meta description in `(th)/layout.tsx`.
 */

// --------------------------------------------------------------------- hero

/**
 * The standing claim, and it is Paul's own sentence.
 *
 * `03_Content_System.md` move 1: authority comes from the volume of listening,
 * never from credentials. It is also the only claim available while the Social
 * Proof pillar is empty, which it is until the pilot closes.
 *
 * "เป็นร้อยคน" rather than the "มารับร้อยคน" that sits in the pinned-post file:
 * that file's own changelog records the edit as "หลายคน" -> "เป็นร้อยคน", so the
 * published string is the typo and this is what he meant.
 */
export const HERO_STANDING: Copy = {
  en: "We have talked with over a hundred Thai professionals who want to work in Europe, and we see the same picture come up again and again.",
  // **Rewritten by Paul, 17/08/2026**, from his own pinned-post sentence.
  // The note above about `มารับร้อยคน` being a typo for `มาเป็นร้อยคน` is
  // settled by this: he wrote `กว่าร้อยคน`, and moved it in front of the
  // clause it modifies rather than leaving it trailing.
  //
  // `เห็นภาพเดิมเกิดขึ้นซ้ำ ๆ` replaces `เจอแพทเทิร์นเดิมซ้ำ ๆ`. The loanword
  // goes, which is the opposite of LR-05's usual direction and right here:
  // ภาพ is ordinary Thai for what he means, and แพทเทิร์น was carrying
  // nothing the Thai could not.
  th: "เราคุยกับคนไทยกว่าร้อยคนที่อยากไปทำงานในยุโรป และเห็นภาพเดิมเกิดขึ้นซ้ำ ๆ",
};

/**
 * The reframe. Move 4, the brand's emotional core: relocate the cause from the
 * reader's worth to a system nobody has shown them.
 *
 * Built on the pinned post's กติกา and deliberately not on `/coaching`'s
 * version of the same move, which runs through visibility rather than through
 * rules. Two pages making the brand's one argument from two angles is the
 * intent; two pages making it in nearly the same words would be drift.
 *
 * The pinned post ends this sentence on "!" and this does not. Emphasis rationed
 * to one sentence is a feed rule, and a page carrying an exclamation mark in its
 * second paragraph reads as a sales letter.
 *
 * **Revised 17/08/2026 after measuring the first draft against his page copy,
 * and this is the string that most needed it.** Three words came out:
 *
 * - `เยอะ` occurs ZERO times in his page and long-form Thai. It is in the pinned
 *   post, which is a feed surface, and § Short-form and long-form says wording
 *   is shared but this one is register rather than vocabulary: it reads chatty
 *   on a page.
 * - `พวกนั้น` also zero. `เหล่านั้น` is what he writes, four times.
 * - `บอก...กับคุณ` became `อธิบาย...ให้ฟัง`. `อธิบาย` is his, eight uses.
 *
 * What came IN is his own construction: `ไม่ได้อยู่ที่ X แต่อยู่ที่ Y`, which he
 * uses in the guide, and `ไม่ใช่` more broadly, thirty-five times. Recombining an
 * approved sentence pattern beats a fresh one, which is the whole of the
 * composer skill's step 1.
 */
export const HERO_REFRAME: Copy = {
  en: "Most of the problem is not that you are not good enough. It is that the European job market plays by a different set of rules from Thailand's, and nobody tells you at the start what those rules are.",
  // **Paul's wording, 17/08/2026.** Worth reading against what it replaced,
  // because it is the same move landed harder.
  //
  // `ไม่ใช่ว่าคุณเก่งไม่พอ` rather than `ไม่ได้อยู่ที่ความสามารถ`: the abstract
  // noun becomes the thing the reader actually says to themselves, in the
  // second person. That is move 4 doing its job, and my version had sanded
  // it into a proposition.
  //
  // `ตลาดงานยุโรปเล่นด้วยกติกาคนละชุด` gives the market the verb. The rules
  // stop being a property of a situation and become something someone else
  // is already playing by.
  th: "ปัญหาส่วนใหญ่ไม่ใช่ว่าคุณเก่งไม่พอ แต่เป็นเพราะตลาดงานยุโรปเล่นด้วยกติกาคนละชุดกับไทย และไม่มีใครบอกคุณตั้งแต่แรกว่ากติกาเหล่านั้นคืออะไร",
};

export const HERO_MASCOT_ALT: Copy = {
  en: "The PunProfile character reading a document through a magnifying glass",
  th: "ตัวการ์ตูน PunProfile กำลังส่องเอกสารด้วยแว่นขยาย",
};

// ------------------------------------------------------- what we actually do

/**
 * The only section on the page about PunProfile doing work rather than making a
 * claim, which is why it sits directly under the hero.
 *
 * Figures come from `market-snapshot.generated.ts` and nothing here restates
 * them. The window is printed rather than implied, for the reason
 * `MarketProof.tsx` already gives: a screening figure with no window is a boast.
 *
 * Nothing refreshes it. `npm run market`, then commit both files.
 */
export const MARKET_HEADING: Copy = {
  en: "What we actually do, every day",
  // **Daily, not weekly**, corrected by Paul 17/08/2026. That is a fact
  // rather than a wording preference and I had it wrong: `run.sh` in the
  // coaching repo's `work-skills/daily-jobs/` fires every day at 18:00
  // Europe/Berlin.
  //
  // `ทุกๆวัน` is his spacing and is left exactly as he typed it.
  th: "สิ่งที่เราทำจริงในทุกวัน",
};

export const MARKET_BODY: Copy = {
  en: "We go through job adverts from across Europe, check which employers really do sponsor a visa, and pick out only the roles a Thai applicant can genuinely apply for.",
  // **`สปอนเซอร์วีซ่า`, decided by Paul 17/08/2026**, overriding the
  // `สนับสนุนวีซ่า` this line briefly carried. He used it as a verb three
  // times in one review pass, here, on the stat label below and in
  // `VISA_BODY`, which settles a term that had never actually been decided.
  // It belongs in `termbase.yml`.
  //
  // `ไล่ดู` and `คัดมา` rather than `อ่าน` and `ประกาศ`: the first pair
  // describes sifting, the second described reading and republishing, and
  // sifting is what the pipeline does. `สมัครได้จริง` closes on the reader.
  th: "เราไล่ดูประกาศงานจากทั่วยุโรป เช็กว่าบริษัทไหนระบุเรื่องสปอนเซอร์วีซ่าไว้อย่างชัดเจน แล้วคัดมาเฉพาะตำแหน่งที่คนไทยมีโอกาสสมัครได้จริง",
};

/**
 * A figure from `MARKET`, and the copy key that labels it.
 *
 * **The labels are not in this file**, and that changed on 17/08/2026. They were
 * here as `{ en, th }` pairs, and the first read had its own copies of the same
 * two in `copy.ts`: two sessions split the old one-sentence `stats.market.value`
 * on the same day and each gave the pieces their own home. Two definitions of one
 * label is two wordings of it, which is the failure the one-string-one-place rule
 * exists to prevent, and it had already happened here inside a day.
 *
 * `copy.ts` won rather than this file, for two reasons. `verify-copy.ts` runs the
 * Thai lint over it and not over the page modules, and the first read needs these
 * strings too, so a page module would have been the wrong owner even if the lint
 * reached it.
 */
export interface MarketStat {
  /** Key into `MARKET`. The value is never written in this file. */
  field: "screened" | "published" | "employers";
  /** Key into `COPY`. The label is never written in this file either. */
  label: CopyKey;
}

export const MARKET_STATS: readonly MarketStat[] = [
  { field: "screened", label: "stats.market.screened" },
  { field: "published", label: "stats.market.published" },
  { field: "employers", label: "stats.market.employers" },
];

export const MARKET_FOOT: Copy = {
  en: "Figures from {from} to {to}. We post these roles in the Thai Jobs in Europe group.",
  /*
   * The free-and-public clause was here and came out on 17/08/2026, for two
   * reasons that landed together.
   *
   * The first is a rule. It was `เปิดฟรีและเป็นสาธารณะ`, reused verbatim from
   * `FOLLOW_BODY` in `footer.ts` on the reasoning that an approved collocation
   * beats a fresh one. Running `lint-thai` over the page modules, which
   * `verify-copy.ts` does not reach, **failed it under LR-04**: ฟรี is attached
   * to เปิด, and LR-04 allows ฟรี only on a word that already denotes a valuable
   * service. The reuse was sound and the string it reused had simply never been
   * linted. `footer.ts` still carries it and that is Paul's to decide; see
   * `npm run verify:pages`.
   *
   * The second is better than the first. The claim belongs in `COST_ROWS`, which
   * is a whole section about what is free, and a footnote about dates is not
   * where a reader looks for it. Removing it removed a duplicate.
   */
  th: "ระหว่าง {from} ถึง {to} เราได้ประกาศตำแหน่งเหล่านี้ในกลุ่ม Thai Jobs in Europe",
};


// ------------------------------------------------------------- the problem
//
// Careersy's sections 4 and 5, which are the two that made the reference page
// worth copying: name the problem in the reader's own words, then let them
// point at the one that is theirs. `home-page-v2.md` carries the full mapping.

export const PROBLEM_HEADING: Copy = {
  en: "The problem is rarely the experience",
  // Read back 25/08/2026. `10_Methodology.md`'s core claim said to a
  // stranger: illegibility rather than capability.
  th: "ปัญหาส่วนใหญ่ไม่ได้อยู่ที่ประสบการณ์ของคุณ",
};

export const PROBLEM_BODY: Copy = {
  en: "A Bangkok senior title can read as mid-level in Amsterdam. A well-known Thai employer reads as an unknown one. Most people are not turned down for what they have done, they are turned down before anyone works out what that was.",
  // Read back 25/08/2026. Drafted from `10_Methodology.md` and from the
  // CV Check page's own `how` lines, which Paul reviewed on 23/08/2026.
  th: "ตำแหน่งระดับอาวุโสในกรุงเทพฯ อาจถูกมองว่าเป็นเพียงระดับกลางในอัมสเตอร์ดัม บริษัทชื่อดังในไทยอาจไม่มีใครรู้จักในยุโรป คนส่วนใหญ่ไม่ได้ถูกปฏิเสธเพราะประสบการณ์ที่มี แต่ถูกปฏิเสธก่อนที่ใครจะเข้าใจด้วยซ้ำว่าเคยทำอะไรมาบ้าง",
};

// ------------------------------------------------------------------ triage

/**
 * Six things a reader recognises as their own situation, each pointing at where
 * the site answers it.
 *
 * **Five of the six are answer options out of `questions.ts`**, which is Thai
 * Paul reviewed long ago, expanded only far enough to stand up outside the
 * question they belong to. `ยังไม่แน่ใจ` on its own means nothing on a landing
 * page; `ยังไม่แน่ใจว่าอยากทำงานสายไหนในยุโรป` is the same answer with its
 * question folded in. Each entry records which option it came from.
 *
 * That is the point of the section and the reason it is honest: these are not
 * personas invented to sell something. They are the answers real candidates
 * pick, taken from the instrument they pick them in.
 */
export interface Triage {
  id: string;
  /** The reader's own situation. */
  line: Copy;
  /**
   * What pressing the row gets them. Drafted 25/08/2026 to fill `HOME-05`.
   *
   * The reference's row list gives every row a line of body under its title,
   * and the rule that makes these honest is that each says where the row GOES,
   * not what it promises: three of the six lead to the check, two to coaching,
   * one to CV Check, and the line names that rather than the outcome.
   */
  body: Copy;
  /** Where the site answers it. */
  href: string;
}

/**
 * The line under the sample card's heading. Drafted 25/08/2026 for `HOME-03`.
 *
 * The reference's split carries a line between the headline and the action,
 * saying what the thing beside it is. This one names the card as an example and
 * nothing more, because `SampleRead` already says twice that its numbers are
 * invented and a third claim here would be the one that oversells it.
 */
// TH-UNREVIEWED, 25/08/2026. Draft.
export const SAMPLE_LEAD: Copy = {
  en: "This is what the first read looks like: four scores, and what each one means for you.",
  th: "หน้าตาของผลเบื้องต้นเป็นแบบนี้ คะแนนสี่ด้าน พร้อมความหมายของแต่ละด้าน",
};

/**
 * The line under the catalogue's heading. Drafted 25/08/2026 for `HOME-04`.
 *
 * What the three cards have in common, which is the thing the reference's card
 * rows always say: they are the three ways of working together, and the rest of
 * the page is what you can buy without one.
 */
// TH-UNREVIEWED, 25/08/2026. Draft.
export const CATALOGUE_LEAD: Copy = {
  en: "Three ways of working together, and below them everything you can use on your own.",
  th: "สามรูปแบบของการทำงานร่วมกัน และด้านล่างคือทุกอย่างที่คุณใช้เองได้",
};

export const TRIAGE_HEADING: Copy = {
  en: "You do not need to know which service you need",
  // Read back 25/08/2026. The reference product's own framing, which is
  // the load-bearing idea on its page: the reader picks a problem, not a tool.
  th: "คุณไม่จำเป็นต้องรู้ว่าควรใช้บริการไหน",
};

export const TRIAGE_LEAD: Copy = {
  en: "Pick the one that sounds like you.",
  // Read back 25/08/2026.
  th: "เลือกข้อที่ตรงกับคุณที่สุด",
};

export const TRIAGE: readonly Triage[] = [
  {
    id: "no-callbacks",
    line: {
      en: "I have applied to a lot of places and hardly anyone gets back to me.",
      // Paul's Thai, VERBATIM from `questions.ts`, the employer-response option.
      // Nothing was added: it already stands on its own.
      th: "สมัครไปหลายที่แล้ว แต่แทบไม่มีใครติดต่อกลับ",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `HOME-05-no-callbacks`.
    body: {
      en: "Go to CV Check, which reads the CV the way a European screener reads it.",
      th: "ไปที่ CV Check ซึ่งจะอ่าน CV ของคุณแบบเดียวกับที่ผู้คัดกรองในยุโรปอ่าน",
    },
    href: "/products/cv-check",
  },
  {
    id: "no-offers",
    line: {
      en: "I have interviewed, but I do not get through to the next round.",
      // Paul's Thai, VERBATIM from `questions.ts`, the job-search-stage option.
      th: "เคยสัมภาษณ์แล้ว แต่ยังไม่ผ่านเข้ารอบถัดไป",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `HOME-05-no-offers`.
    body: {
      en: "Go to coaching, where we work through the round you keep stopping at.",
      th: "ไปที่หน้าโค้ชชิ่ง เพื่อดูว่าเราทำงานกับรอบที่คุณติดอยู่อย่างไร",
    },
    href: "/coaching",
  },
  {
    id: "cv-not-europe",
    line: {
      en: "I have a CV, but it has not been adapted for Europe.",
      // Read back 25/08/2026. Paul's CV option `มีแต่ยังไม่ปรับให้เหมาะกับยุโรป`
      // with its subject restored, because the option is a fragment answering
      // a question the reader cannot see here.
      th: "มี CV อยู่แล้ว แต่ยังไม่ได้ปรับให้เหมาะกับตลาดยุโรป",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `HOME-05-cv-not-europe`.
    body: {
      en: "Go to CV Check, which lists what to change and why, one point at a time.",
      th: "ไปที่ CV Check ซึ่งจะบอกว่าควรแก้จุดไหน พร้อมเหตุผลของแต่ละจุด",
    },
    href: "/products/cv-check",
  },
  {
    id: "visa-unknown",
    line: {
      en: "On visas and work rights, I do not yet know what I need to prepare.",
      // Read back 25/08/2026. Paul's visa option `ยังไม่รู้ว่าต้องเตรียมอะไรบ้าง`
      // with the subject of its own question folded in.
      th: "เรื่องวีซ่าและสิทธิในการทำงาน ยังไม่รู้ว่าต้องเตรียมอะไรบ้าง",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `HOME-05-visa-unknown`.
    body: {
      en: "Start the check, which asks about work rights and says where you stand.",
      th: "เริ่มทำ EU Fit Check ซึ่งมีคำถามเรื่องสิทธิการทำงาน และจะบอกว่าคุณอยู่ตรงไหน",
    },
    href: "/efc-assessment",
  },
  {
    id: "no-target",
    line: {
      en: "I am not sure which field I want to work in over there.",
      // Read back 25/08/2026. Paul's `ยังไม่แน่ใจ` on the target-field
      // question, which needs that question to mean anything.
      th: "ยังไม่แน่ใจว่าอยากทำงานสายไหนในยุโรป",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `HOME-05-no-target`.
    body: {
      en: "Go to coaching, where deciding the direction is the first thing we do.",
      th: "ไปที่หน้าโค้ชชิ่ง ซึ่งเริ่มจากการตัดสินใจเรื่องทิศทางก่อนเป็นอย่างแรก",
    },
    href: "/coaching",
  },
  {
    id: "dormant-linkedin",
    line: {
      en: "I have a LinkedIn, but I have not updated it in a long time.",
      // Read back 25/08/2026. Paul's LinkedIn option `มี แต่ไม่ได้อัปเดต`,
      // expanded the same way as the two above.
      th: "มี LinkedIn อยู่ แต่ไม่ได้อัปเดตมานานแล้ว",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `HOME-05-dormant-linkedin`.
    body: {
      en: "Start the check, which scores how ready your profile is to be found.",
      th: "เริ่มทำ EU Fit Check ซึ่งจะประเมินว่าโปรไฟล์ของคุณพร้อมให้คนหาเจอแค่ไหน",
    },
    href: "/efc-assessment",
  },
];

// ------------------------------------------------------------ how it works

/**
 * The reference product's four numbered steps, which is the shape rather than
 * the content: theirs describes a conversation with an AI, and this describes
 * what actually happens here.
 *
 * Step 4 deliberately does NOT promise contact. `pricing.ts` carries the same
 * decision and the reason: outbound contact has not stopped, the public promise
 * of it has.
 */
export interface HowStep {
  n: number;
  title: Copy;
  body: Copy;
}

export const HOW_HEADING: Copy = {
  en: "How it works",
  // Read back 25/08/2026.
  th: "ขั้นตอนเป็นอย่างไร",
};

export const HOW_STEPS: readonly HowStep[] = [
  {
    n: 1,
    title: {
      en: "Answer on your phone",
      // Rebuilt from Paul's own EU Fit Check line of 23/08/2026 on `/pricing`.
      th: "ตอบคำถามบนมือถือ",
    },
    body: {
      en: "Seventeen questions about where you are now. No CV needed and no account.",
      // Read back 25/08/2026. The count is real: `verify-content.ts` pins
      // Stage 1 at 17 questions and fails the build if it drifts.
      th: "คำถาม 17 ข้อเกี่ยวกับสถานการณ์ของคุณตอนนี้ ไม่ต้องใช้ CV และไม่ต้องสร้างบัญชี",
    },
  },
  {
    n: 2,
    title: {
      en: "See your first read straight away",
      // Read back 25/08/2026.
      th: "เห็นผลเบื้องต้นทันที",
    },
    body: {
      en: "Four scores against the bars the European market uses, and the parts your answers could not reach are named rather than filled in.",
      // Read back 25/08/2026. The second clause is the not-measured rule
      // from `teaser.score.none`, which is the honest half of this product.
      th: "คะแนนสี่ด้านเทียบกับเกณฑ์ที่ตลาดยุโรปใช้จริง ส่วนที่คำตอบของคุณยังประเมินไม่ได้ เราจะบอกตรง ๆ แทนที่จะเดาให้",
    },
  },
  {
    n: 3,
    title: {
      en: "Find which one comes first",
      // Read back 25/08/2026.
      th: "รู้ว่าควรเริ่มจากเรื่องไหน",
    },
    body: {
      en: "The read names the weakest area and what to do about it, in the order that moves the result soonest.",
      // Read back 25/08/2026. `เห็นผลได้เร็วที่สุด` is Paul's own phrase from
      // the Fit Report page, reviewed 23/08/2026.
      th: "ผลจะบอกว่าด้านไหนยังอ่อนที่สุด และควรทำอะไรก่อน โดยเริ่มจากสิ่งที่จะช่วยให้คุณเห็นผลได้เร็วที่สุด",
    },
  },
  {
    n: 4,
    title: {
      en: "Take the next step when you are ready",
      // Read back 25/08/2026.
      th: "ไปต่อเมื่อคุณพร้อม",
    },
    body: {
      en: "Some of what comes next is free. The rest is bought a piece at a time, and nothing needs a subscription.",
      // Read back 25/08/2026. Says nothing about being contacted, which is
      // the 23/08/2026 decision recorded on `FREE_ITEMS` in `pricing.ts`.
      th: "บางส่วนใช้ได้ฟรี ส่วนที่เหลือเลือกซื้อทีละชิ้นได้ตามที่ต้องการ ไม่มีระบบสมาชิกรายเดือน",
    },
  },
];

// -------------------------------------------------------- a sample first read

/**
 * The reference product shows a real scored output on its landing page, low on
 * purpose, because a tool that will tell you something uncomfortable is more
 * credible than one that promises. This is that section.
 *
 * **The numbers are invented and the label says so.** `SAMPLE_LABEL` renders
 * above the card and `SAMPLE_NOTE` under it. That is not a formality: the
 * Social Proof pillar is empty, there are no placed clients, and this is the
 * only fabricated thing on the site. It is publishable because it illustrates
 * a format rather than asserting a result, which is the same test `/pricing`'s
 * calculator disclaimer had to pass.
 *
 * The profile is deliberately uneven and one axis is unmeasured. A sample where
 * everything scores well would teach the reader nothing about the instrument,
 * and the not-measured state is the part of this product worth showing.
 */
export interface SampleAxis {
  /** The `dimension.*` key in `copy.ts`, so the labels cannot drift. */
  label: AnyCopyKey;
  /** Out of 5, or null for an axis the answers could not reach. */
  score: number | null;
}

export const SAMPLE_HEADING: Copy = {
  en: "You cannot fix what nobody will tell you",
  // Read back 25/08/2026. The reference product's own heading, which is
  // the argument for the whole section.
  th: "สิ่งที่ไม่มีใครบอก คุณก็แก้ไม่ได้",
};

export const SAMPLE_LABEL: Copy = {
  en: "Example",
  // Read back 25/08/2026. One word, above the card, unmissable.
  th: "ตัวอย่าง",
};

export const SAMPLE_AXES: readonly SampleAxis[] = [
  { label: "dimension.professionalCapability", score: 3.8 },
  { label: "dimension.employability", score: 2.1 },
  { label: "dimension.mobilityReadiness", score: 3.0 },
  { label: "dimension.europeanMarketFit", score: null },
];

export const SAMPLE_NOTE: Copy = {
  en: "An example, not a real person. Your own numbers come from your own answers.",
  // Read back 25/08/2026. Built on the shape of Paul's own calculator
  // disclaimer of 23/08/2026, which says the numbers come from what you typed.
  th: "นี่เป็นเพียงตัวอย่าง ไม่ใช่ผลของคนจริง ตัวเลขของคุณจะมาจากคำตอบของคุณเอง",
};

// --------------------------------------------------------------- who this is

/**
 * The reference product's founder-credibility block, minus the numbers.
 *
 * Paul's call, 24/08/2026: no personal statistics. Careersy leads with thirteen
 * years and 26,000 resumes. Nothing of that kind is claimed here, and the
 * section above this one already carries the only figures on the page, which
 * are the pipeline's rather than a person's.
 */
export const WHO_HEADING: Copy = {
  en: "Who is behind this",
  // Read back 25/08/2026.
  th: "ใครอยู่เบื้องหลัง PunProfile",
};

export const WHO_BODY: Copy = {
  en: "PunProfile is run by one person, and every conversation is with him. That is the reason the advice starts from your goals rather than from a vacancy somebody is rushing to fill.",
  // Read back 25/08/2026. The second sentence is Paul's own, from
  // `FOUNDER_AFTER` in `coaching.ts`, which he wrote and reviewed.
  th: "PunProfile ดูแลโดยคนเพียงคนเดียว และทุกครั้งคุณจะได้คุยกับเขาโดยตรง นั่นคือเหตุผลที่คำแนะนำเริ่มจากเป้าหมายของคุณ ไม่ใช่จากตำแหน่งว่างที่ใครบางคนกำลังเร่งหาคน",
};

// ------------------------------------------------------------------- results

/**
 * **Nothing renders from here yet, and that is deliberate.** Paul's call of
 * 24/08/2026, option 2b: keep the shape so the first real result has somewhere
 * to go, rather than inventing one now or rebuilding the section later.
 *
 * The reference product's equivalent section carries three named testimonials.
 * PunProfile has no placed clients, the Social Proof pillar in
 * `01_Project_Foundation.md` is empty, and a fabricated one would be the single
 * worst thing that could be put on this site.
 *
 * **The rules for the day this fills.** A result needs a real person's consent
 * in writing, their own words rather than a paraphrase, and the same variability
 * disclaimer the reference product carries. One real result outranks three
 * polished ones. Until then `RESULTS` stays empty and the page renders no
 * heading, no empty state and no "coming soon", because a visible placeholder
 * for social proof is a claim that social proof is imminent.
 */
export interface Result {
  id: string;
  quote: Copy;
  /** First name and role only, and only with written consent. */
  who: Copy;
}

export const RESULTS_HEADING: Copy = {
  en: "What happened next",
  // Not rendered while RESULTS is empty. Held rather than written, so the day
  // there is one to show, the heading is not the thing blocking it.
  th: "ผลลัพธ์ที่เกิดขึ้นจริง",
};

export const RESULTS: readonly Result[] = [];

// -------------------------------------------------------------- the catalogue

/**
 * Replaces BOTH the old "three things we help with" section, which read
 * `services.ts` and so named only the coaching half, and the old cost table,
 * which `/pricing` has carried since 23/08/2026.
 *
 * **The cards are read from `products.ts` at render**, not restated here, for
 * the same reason the old section read `services.ts`: a third rendering of the
 * catalogue is a third wording of it.
 *
 * The one number on this page is the unit, 50 THB, per Paul's decision of
 * 24/08/2026. Pack prices live on `/pricing` and appear nowhere else.
 */
export const CATALOGUE_HEADING: Copy = {
  en: "What you can get",
  // Read back 25/08/2026.
  th: "คุณได้อะไรจากที่นี่บ้าง",
};

export const CATALOGUE_FREE: Copy = {
  en: "Free",
  // Paul's own heading from `/pricing`, 23/08/2026, shortened to a label.
  th: "ใช้ได้ฟรี",
};

export const CATALOGUE_PAID: Copy = {
  en: "Paid with tokens",
  // Read back 25/08/2026.
  th: "จ่ายด้วยโทเคน",
};

export const CATALOGUE_PRICE_LINE: Copy = {
  en: "One role that matches your criteria, sent to you, is 50 THB. Everything here is priced in the same token.",
  /*
   * Read back 25/08/2026, and this is the only price on the page.
   *
   * Paul, 24/08/2026, option 2a: one number and a link, not the pack table.
   * The number is the unit rather than a pack, which is the whole reason the
   * unit was held flat at 50 THB when the packs were decided: it is the one
   * figure a candidate has to carry, and it stays true whichever pack they buy.
   */
  th: "ตำแหน่งงาน 1 ตำแหน่งที่ตรงกับเงื่อนไขของคุณและส่งตรงถึงคุณ ราคา 50 บาท ทุกอย่างที่นี่คิดราคาเป็นหน่วยโทเคนเดียวกัน",
};

// --------------------------------------------------------------- FAQ teaser

export const FAQ_TEASER_HEADING: Copy = {
  en: "You ask, we answer straight",
  // Read back 25/08/2026. The reference product's own heading, and it
  // suits a page whose FAQ opens by refusing to guarantee a job or a visa.
  th: "ถามมา เราตอบตรง",
};

// ------------------------------------------------------------ the visa answer

/**
 * Paul's paragraph, verbatim from the pinned post, and the section is short on
 * purpose. Move 5: name the objection, then refuse the magic, in the same breath
 * as the offer.
 *
 * The "we are not immigration lawyers" half of this is in `DISCLAIMER` in
 * `footer.ts` on every page of the site and is not restated here.
 *
 * **There is no heading, and that is deliberate as of 17/08/2026.** There was
 * one, `เรื่องวีซ่าสปอนเซอร์`, and his sentence opens on those same three words,
 * so the section said them twice in a row. The alternatives were to paraphrase
 * his sentence, which is not available, or to invent a heading that says
 * something the paragraph does not. A one-paragraph section on its own ground
 * needs neither.
 */
export const VISA_BODY: Copy = {
  en: "Visa sponsorship is the question we are asked most. What we can do is help make your profile strong enough to compete from the start, rather than waiting for luck to fall your way.",
  // **Paul rewrote his own pinned-post sentence for this page, 17/08/2026.**
  // The note that used to sit here said it was his verbatim and not to be
  // paraphrased, which was right about everyone except him.
  //
  // `การสปอนเซอร์วีซ่า` nominalises what was a bare noun phrase, `แข็งแรง`
  // replaces `แข็งแกร่ง`, and `แทนที่จะต้องรอให้โชคเข้าข้าง` replaces
  // `ไม่ใช่แค่รอโชคช่วย`. That last one is the interesting change: the feed
  // version refuses the magic in four words, and a page has room to say
  // what you do instead of waiting.
  th: "คำถามเรื่องการสปอนเซอร์วีซ่าคือเรื่องที่เราเจอบ่อยที่สุด สิ่งที่เราทำได้คือช่วยให้โปรไฟล์ของคุณแข็งแรงพอที่จะแข่งขันได้ตั้งแต่แรก แทนที่จะต้องรอให้โชคเข้าข้าง",
};

// ---------------------------------------------------- what is free, RETIRED
//
// `COST_HEADING` and `COST_ROWS` were here and came out on 24/08/2026.
//
// The section was built as "the section nothing else on the site carries", the
// only place answering what things cost, and it deliberately printed no prices
// because `01_Project_Foundation.md` still headed its table "Pricing (pilot
// hypothesis)". `/pricing` has answered that question with real numbers since
// 23/08/2026, and two of the three rows here were the same strings as its free
// block word for word, so the home page was carrying a price section with no
// prices one click from a price page with prices.
//
// Nothing is lost. `FREE_ITEMS` in `pricing.ts` holds both free rows in Paul's
// own Thai, and the catalogue section above links to them.

// --------------------------------------------------------------------- close

/**
 * The pinned post's closing line, minus its "ใช้เวลาแค่ 2 นาที รู้ผลทันที" clause.
 * `landing.reassurance` already carries the timing under the hero button, and
 * the same claim twice on one page reads as padding.
 */
export const CLOSE_LEAD: Copy = {
  en: "See which stage of the path to working in Europe you are on.",
  // PAUL, from `pinned-post-punprofile-intro.md`, with the timing clause
  // removed, and `ไปทำงาน` restored on his read of 17/08/2026 where this
  // file had drifted to `สู่การทำงาน`.
  th: "เช็กว่าตอนนี้คุณอยู่ขั้นไหน และควรทำอะไรต่อเพื่อไปทำงานในยุโรป",
};
