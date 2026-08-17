import type { Copy } from "./copy";

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
 * **Provenance is marked on every string.** Three sources, and they are not
 * equal:
 *
 * - `PAUL` — lifted from `pinned-post-punprofile-intro.md`, the one piece of
 *   Thai in either repo confirmed to be his own edit. Do not paraphrase these.
 * - `SERVICES` — read out of `services.ts` at render rather than copied, which
 *   is why the three offerings are not written in this file at all.
 * - `TH-UNREVIEWED` — composed in Thai for this page under LR-09, not yet read
 *   back by Paul. Composed is not the same as approved.
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
  en: "We have talked with hundreds of Thai professionals who want to work in Europe, and the same pattern keeps coming back.",
  th: "เราคุยกับคนไทยที่อยากไปทำงานยุโรปมาเป็นร้อยคน เจอแพทเทิร์นเดิมซ้ำ ๆ",
};

/**
 * The reframe. Move 4, the brand's emotional core: relocate the cause from the
 * reader's worth to a system nobody has shown them.
 *
 * Built on the pinned post's "การหางานในยุโรปมีกติกาที่ต่างจากไทยเยอะ" and
 * deliberately not on `/coaching`'s version of the same move, which runs
 * through visibility rather than through rules. Two pages making the brand's
 * one argument from two angles is the intent; two pages making it in nearly the
 * same words would be drift.
 *
 * The pinned post ends this sentence on "!" and this does not. Emphasis rationed
 * to one sentence is a feed rule, and a page carrying an exclamation mark in its
 * second paragraph reads as a sales letter.
 */
export const HERO_REFRAME: Copy = {
  en: "It is rarely about ability. Hiring in Europe runs on rules that are not the ones you learned in Thailand, and nobody hands you those rules.",
  // TH-UNREVIEWED: composed 17/08/2026 from the pinned post's own clause.
  th: "ปัญหาไม่ค่อยได้อยู่ที่ความสามารถ แต่การหางานในยุโรปมีกติกาที่ต่างจากไทยเยอะ และไม่มีใครบอกกติกาพวกนั้นกับคุณ",
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
  en: "What we actually do, week after week",
  // TH-UNREVIEWED: composed 17/08/2026.
  th: "สิ่งที่เราทำอยู่จริง ทุกสัปดาห์",
};

export const MARKET_BODY: Copy = {
  en: "We read job adverts across Europe, check which employers genuinely sponsor a visa, and publish only the roles a Thai applicant can act on.",
  // TH-UNREVIEWED: composed 17/08/2026. ตำแหน่ง rather than โอกาส, per LR-05:
  // this is about specific openings, not opportunity in the abstract.
  th: "เราอ่านประกาศงานทั่วยุโรป ตรวจว่าบริษัทไหนสปอนเซอร์วีซ่าจริง แล้วประกาศเฉพาะตำแหน่งที่คนไทยสมัครได้",
};

export interface MarketStat {
  /** Key into `MARKET`. The value is never written in this file. */
  field: "screened" | "published" | "employers";
  label: Copy;
}

export const MARKET_STATS: readonly MarketStat[] = [
  {
    field: "screened",
    label: {
      en: "roles read",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ตำแหน่งที่อ่าน",
    },
  },
  {
    field: "published",
    label: {
      en: "cleared the visa-sponsorship bar",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ผ่านเกณฑ์สปอนเซอร์วีซ่า",
    },
  },
  {
    field: "employers",
    label: {
      en: "employers",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "บริษัท",
    },
  },
];

export const MARKET_FOOT: Copy = {
  en: "Between {from} and {to}. We post these in the Thai Jobs in Europe group, free and public.",
  // "เปิดฟรีและเป็นสาธารณะ" is reused verbatim from `FOLLOW_BODY` in `footer.ts`,
  // which Paul passed on 15/08/2026. Reusing an approved collocation is safer
  // than composing a second one for the same idea, and LR-04 is exactly the rule
  // that punishes composing a new one.
  th: "ระหว่าง {from} ถึง {to} เราประกาศตำแหน่งเหล่านี้ในกลุ่ม Thai Jobs in Europe เปิดฟรีและเป็นสาธารณะ",
};

// ------------------------------------------------- three things we help with

/**
 * The names and questions are read out of `SERVICES` in `services.ts` at
 * render. They are deliberately not written here: `01_Project_Foundation.md`
 * § Core Offerings owns the structure and `services.ts` owns the wording, and a
 * third rendering of the same three offerings is a third wording of them.
 */
export const HELP_HEADING: Copy = {
  en: "Three things we help with",
  // TH-UNREVIEWED: composed 17/08/2026.
  th: "สามเรื่องที่เราช่วยคุณได้",
};

export const HELP_INTRO: Copy = {
  en: "Career coaching is where everyone starts. The other two can be taken on their own.",
  // Compressed from `SERVICES_INTRO` in `services.ts`, which is Paul's Thai. The
  // full sentence belongs on the page that sells them.
  // TH-UNREVIEWED: composed 17/08/2026.
  th: "แคเรียร์โค้ชชิ่งคือจุดเริ่มต้นของทุกคน ส่วนอีกสองบริการเลือกใช้แยกกันได้",
};

// ------------------------------------------------------------ the visa answer

/**
 * Paul's paragraph, verbatim from the pinned post, and the section is short on
 * purpose. Move 5: name the objection, then refuse the magic, in the same breath
 * as the offer.
 *
 * The "we are not immigration lawyers" half of this is in `DISCLAIMER` in
 * `footer.ts` on every page of the site and is not restated here.
 */
export const VISA_HEADING: Copy = {
  en: "About visa sponsorship",
  // TH-UNREVIEWED: composed 17/08/2026.
  th: "เรื่องวีซ่าสปอนเซอร์",
};

export const VISA_BODY: Copy = {
  en: "It is the question we are asked most. What we can affect is making your profile strong enough to compete from the start, rather than leaving it to luck.",
  // PAUL, verbatim, from `pinned-post-punprofile-intro.md`. Do not paraphrase.
  th: "เรื่องวีซ่าสปอนเซอร์เป็นคำถามที่เจอบ่อยที่สุด สิ่งที่เราช่วยได้คือทำให้โปรไฟล์ของคุณแข็งแกร่งพอที่จะแข่งขันได้ตั้งแต่ต้น ไม่ใช่แค่รอโชคช่วย",
};

// ------------------------------------------------ what is free and what is not

/**
 * The section nothing else on the site carries, and the reason this page was
 * worth rebuilding rather than rewording.
 *
 * `01_Project_Foundation.md` § The three surfaces calls the group, the app and
 * the coaching "one path at three depths". A reader arriving from a job post has
 * no way to know which of those depths costs money, and answering it unprompted
 * is cheaper than being asked.
 *
 * **The group is named and never linked.** `footer.ts` records Paul's
 * instruction of 14/08/2026 not to publish the group's URL, and it is not on
 * record anywhere in the coaching repo in any case.
 *
 * **No prices.** `01_Project_Foundation.md` heads its table "Pricing (pilot
 * hypothesis)" with the validation plan still open, and `services.ts` already
 * refuses to print a hypothesis on a public page. The paid row says มีค่าบริการ
 * and stops.
 *
 * **ฟรี is avoided here in favour of ไม่มีค่าใช้จ่าย.** LR-04 attaches ฟรี only to
 * a word that already denotes a valuable service, ปรึกษาฟรี being the worked
 * example, and a free-versus-paid table is not one.
 */
export interface CostRow {
  id: "jobs" | "check" | "coaching";
  surface: Copy;
  price: Copy;
  body: Copy;
}

export const COST_HEADING: Copy = {
  en: "What is free, and what is not",
  // TH-UNREVIEWED: composed 17/08/2026.
  th: "อะไรไม่มีค่าใช้จ่าย และอะไรมีค่าบริการ",
};

export const COST_ROWS: readonly CostRow[] = [
  {
    id: "jobs",
    surface: {
      en: "The jobs we screen",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ตำแหน่งงานที่เราคัดมา",
    },
    price: {
      en: "Free, always",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ไม่มีค่าใช้จ่าย ตลอดไป",
    },
    body: {
      en: "Posted in the Thai Jobs in Europe group. Anyone can read them, and that does not change.",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ประกาศในกลุ่ม Thai Jobs in Europe ใครก็เข้าอ่านได้ และจะเป็นแบบนี้ต่อไป",
    },
  },
  {
    id: "check",
    surface: {
      en: "EU Fit Check",
      th: "EU Fit Check",
    },
    price: {
      en: "Free",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ไม่มีค่าใช้จ่าย",
    },
    body: {
      en: "Answer on your phone and see where you stand the moment you finish. We follow up personally afterwards.",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ตอบคำถามบนมือถือ แล้วดูผลเบื้องต้นได้ทันทีที่ทำเสร็จ จากนั้นเราจะติดต่อกลับไปคุยกับคุณเอง",
    },
  },
  {
    id: "coaching",
    surface: {
      // The fixed term from `termbase.yml`. โค้ชชิ่งตัวต่อตัว is banned there.
      en: "Coaching 1:1",
      th: "Coaching 1:1",
    },
    price: {
      en: "Paid",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "มีค่าบริการ",
    },
    body: {
      en: "Working one to one on your own CV, your own applications and your own interviews. What it costs is settled in the conversation.",
      // TH-UNREVIEWED: composed 17/08/2026.
      th: "ทำงานตัวต่อตัวกับ CV ใบสมัคร และการสัมภาษณ์ของคุณเอง ส่วนค่าบริการคุยกันตอนปรึกษา",
    },
  },
];

// --------------------------------------------------------------------- close

/**
 * The pinned post's closing line, minus its "ใช้เวลาแค่ 2 นาที รู้ผลทันที" clause.
 * `landing.reassurance` already carries the timing under the hero button, and
 * the same claim twice on one page reads as padding.
 */
export const CLOSE_LEAD: Copy = {
  en: "See which stage of the path to working in Europe you are on.",
  // PAUL, from `pinned-post-punprofile-intro.md`, with the timing clause removed.
  th: "เช็กว่าตอนนี้คุณอยู่ขั้นไหนบนเส้นทางสู่การทำงานในยุโรป",
};
