import type { Copy } from "./copy";

/**
 * What PunProfile sells, and what it costs. Added 23/08/2026.
 *
 * **The words are Paul's**, from his review pass on `review-pricing-th.md` the
 * same day; the English is a translation of his Thai rather than the other way
 * round, as in `services.ts`.
 *
 * `SCREENED_FOR_YOU` and `NOTHING_FOUND` were the two written after his RETHINK
 * notes rather than by him. Both went back through `thai-review-queue.md` on
 * 23/08/2026 and both came back rewritten, so there is no unread Thai left in
 * this file.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS NOT `services.ts` WITH PRICES ADDED
 * ---------------------------------------------------------------------------
 *
 * `services.ts` sells three coaching offerings that end in a conversation, and
 * its own header refuses to print a price because `01_Project_Foundation.md`
 * still calls its table a pilot hypothesis. That has not changed.
 *
 * This file is the self-serve half, decided 23/08/2026: everything a candidate
 * can buy without talking to anyone, priced in one currency. The two must not be
 * merged. A grid mixing a 1,000 THB purchase with a 15,000 to 25,000 engagement
 * asks the reader to compare things that are not comparable.
 *
 * **One currency.** A token is the only unit. A matched role is 1, a Fit Report
 * is 20, and the packs below are the only prices printed anywhere on the site.
 * Coaching stays outside it, because it is a conversation and it is priced in
 * one.
 *
 * **No price appears on any product page**, by the same decision. A number
 * repeated across six marketing pages is six places for it to drift.
 */

/* -------------------------------------------------------------------- hero */

export const PRICING_HEADING: Copy = {
  en: "Start free, pay only for the features you choose",
  // Paul's wording, 23/08/2026. He replaced `ส่วนไหนฟรี และส่วนไหนมีค่าใช้จ่าย`,
  // which was his own 17/08 line and still stands whole on the landing page. The
  // new one frames the page as free-then-pay rather than free-versus-paid, which
  // is the structure the page actually has.
  th: "เริ่มใช้ฟรี จ่ายเฉพาะบริการที่คุณเลือก",
};

export const PRICING_INTRO: Copy = {
  en: "One token, good for every service on the site. Pick the pack that fits how much you will use it.",
  // Paul's wording, 23/08/2026. This is the one-currency decision said out loud
  // and the sentence the rest of the page depends on.
  th: "โทเคนเดียว ใช้ได้กับทุกบริการบนเว็บไซต์ เลือกแพ็กที่พอดีกับการใช้งานของคุณได้เลย",
};

/* -------------------------------------------------------------------- free */

/**
 * The free tier sits ABOVE the packs and is deliberately not a card beside them.
 *
 * Careersy's pricing page has no free row among its plan cards and explains free
 * credits separately further down; the same reasoning applies here. A free card
 * standing next to a paid pack invites a comparison between things that are not
 * alternatives to each other.
 */
export const FREE_HEADING: Copy = {
  en: "Which features are free",
  // Paul's wording, 23/08/2026. He replaced `ส่วนไหนฟรี` with the ฟีเจอร์
  // loanword, which matches the headline above it.
  th: "ใช้ฟรีได้อะไรบ้าง?",
};

export interface FreeItem {
  id: "jobs" | "check";
  name: Copy;
  body: Copy;
}

export const FREE_ITEMS: readonly FreeItem[] = [
  {
    id: "jobs",
    name: {
      en: "The jobs we screen for you",
      // Paul's wording, 17/08/2026, carried over from `home.ts`.
      th: "ตำแหน่งงานที่เราคัดมาให้",
    },
    body: {
      en: "Posted in the Thai Jobs in Europe group, free for anyone to read.",
      th: "ประกาศงานในกลุ่ม Thai Jobs in Europe เปิดให้ทุกคนอ่านฟรี",
    },
  },
  {
    id: "check",
    name: { en: "EU Fit Check", th: "EU Fit Check" },
    body: {
      en: "Answer on your phone, and get your first read the moment you finish.",
      /*
       * Paul's wording, 23/08/2026, and the CUT is the point of it.
       *
       * The `home.ts` version of this sentence ends `จากนั้นจะมีคนอ่านคำตอบของคุณ
       * จริง ๆ และติดต่อกลับ`. He removed that clause here: "removed ... as
       * that's no longer true. No contact, only hot leads self qualify themself
       * and contact us."
       *
       * Clarified by him the same day, and the distinction is the whole of it:
       * **outbound contact has not stopped. The public promise of it has.** He
       * still contacts the most ready leads. What he will not do is tell every
       * finisher they will be contacted, because to a lead who is not ready that
       * is a promise nobody intends to keep.
       *
       * So this is a marketing-copy change and not a funnel change. The
       * 10/08/2026 decision that a person delivers the full result stands, and
       * `customer-journey.md` milestone 6 is unaffected.
       *
       * Three surfaces are deliberately NOT changed with it, because they are
       * not promises: `consent-copy.ts` asks PERMISSION to make contact, which is
       * the legal basis and must not be softened; `privacy.ts` states factually
       * that a human reads before contact; and `faq.ts` already carries his own
       * hedge, that a reply may take a while and its absence does not mean the
       * result was bad.
       */
      th: "ตอบคำถามบนมือถือได้เลย รับผลเบื้องต้นทันทีเมื่อทำเสร็จ",
    },
  },
];

/* ------------------------------------------------------------------- packs */

export const PACKS_HEADING: Copy = {
  en: "Token packs",
  // Paul's wording, 23/08/2026.
  th: "แพ็กโทเคน",
};

export interface Pack {
  id: "starter" | "standard" | "serious";
  name: Copy;
  /** Where the reader is, not what the pack contains. */
  tagline: Copy;
  thb: number;
  tokens: number;
  who: Copy;
  /** Exactly one pack carries it. */
  recommended?: boolean;
}

/**
 * **CONFIRMED BY PAUL, 23/08/2026.** 500/10, 1,000/21 and 1,500/33, over his own
 * earlier 590/990/1,500, which were set before the token currency existed.
 *
 * **What the shape means, and it is the part to protect.** The unit price stays
 * flat at 50 THB. A bigger pack does not buy a cheaper token, it buys free ones:
 * 10, then 20 plus 1, then 30 plus 3. That keeps 50 THB true as the single
 * number a candidate has to hold, which is what the whole one-currency decision
 * was for, and it means the price of the thing never depends on how much of it
 * you bought. Discounting the token instead would make "1 token is 1 role" false
 * for everyone except starter-pack buyers.
 *
 * 50 THB is Paul's own answer of 22/08/2026 to what a Thai candidate would pay
 * for one role at 80% match, delivered one at a time. Every other price on the
 * site is a multiple of it.
 *
 * Round numbers on purpose. These are bank-transfer amounts somebody types into
 * a phone.
 */
export const PACKS: readonly Pack[] = [
  {
    id: "starter",
    name: { en: "Starter pack", th: "แพ็กเกจเริ่มต้น" },
    tagline: { en: "Trying it out", th: "ลองใช้บริการ" },
    thb: 500,
    tokens: 10,
    who: {
      en: "For someone who wants to see first how closely the roles we pick match what you are looking for.",
      th: "เหมาะกับคนที่อยากลองดูก่อนว่า ตำแหน่งที่เราคัดให้ตรงกับสิ่งที่คุณมองหาแค่ไหน",
    },
  },
  {
    id: "standard",
    name: { en: "Standard", th: "มาตรฐาน" },
    tagline: { en: "Job hunting", th: "กำลังหางานอยู่" },
    thb: 1000,
    tokens: 21,
    who: {
      en: "For someone applying every week who also wants the full assessment to plan the next step with.",
      th: "เหมาะกับคนที่สมัครงานเป็นประจำทุกสัปดาห์ และอยากได้ผลประเมินฉบับเต็มไว้ช่วยวางแผนขั้นต่อไป",
    },
    recommended: true,
  },
  {
    id: "serious",
    name: { en: "Serious pack", th: "แพ็กเกจเอาจริง" },
    tagline: { en: "Moving this year", th: "ตั้งใจย้ายปีนี้" },
    thb: 1500,
    tokens: 33,
    who: {
      en: "For someone set on moving to Europe within the year, searching steadily over the months ahead.",
      th: "เหมาะกับคนที่ตั้งใจย้ายไปยุโรปภายในปีนี้ และวางแผนหางานอย่างต่อเนื่องในช่วงหลายเดือนข้างหน้า",
    },
  },
];

/**
 * The badge on the recommended pack.
 *
 * **It says PunProfile recommends this one. It does not say most people choose
 * it.** Careersy's badge reads "Where most people land", which is a claim about
 * its own customers. PunProfile has none, so the same badge would be false, and
 * the Social Proof pillar being empty is exactly why. Do not let this drift back
 * toward a popularity claim once there are a few customers and the temptation
 * returns; that needs its own decision and a real number behind it.
 */
export const RECOMMENDED_BADGE: Copy = {
  en: "Recommended",
  // Paul's wording, 23/08/2026.
  th: "แพ็กเกจแนะนำ",
};

/* ---------------------------------------------------------------- includes */

export const INCLUDES_HEADING: Copy = {
  en: "Whichever pack you pick, it works on everything",
  // Paul's wording, 23/08/2026.
  th: "ไม่ว่าเลือกแพ็กไหน ก็ใช้ได้กับทุกบริการ",
};

/**
 * `SCREENED_FOR_YOU` replaces a line Paul rejected, and his reason is recorded
 * because it generalises: the first version said every role is screened by the
 * same standard as the ones posted in the group, and he wrote "this is not good
 * selling as it has to be better, not the same. and we dont mention the FB group
 * everywhere."
 *
 * Both halves hold. Telling a paying customer they get the same thing that is
 * free elsewhere argues against the purchase, and it was the second group
 * mention he cut in two passes, for the same reason each time: not every lead
 * knows the group exists.
 *
 * The true difference is not the standard, which genuinely is the same one. It
 * is who the screening was done FOR: the feed is one to many, a token is one to
 * one. `01_Project_Foundation.md` already draws that line internally; this is it
 * said to a candidate.
 */
export const INCLUDES: readonly Copy[] = [
  {
    en: "Tokens never expire",
    // Paul's wording, 23/08/2026.
    th: "โทเคนไม่มีวันหมดอายุ",
  },
  {
    en: "Withdraw them as cash if you have not used them",
    // Paul's wording, 23/08/2026. He changed ขอคืน to ถอนออกคืน.
    th: "ขอคืนเงินได้ หากยังไม่ได้ใช้โทเคน",
  },
  {
    en: "Screened against the criteria you set, not one list sent to everyone",
    // Paul's wording, 23/08/2026, over the line written after his RETHINK. See the note above.
    th: "คัดตามเงื่อนไขที่คุณกำหนด ไม่ใช่รายการเดียวกันที่ส่งให้ทุกคน",
  },
  {
    en: "Work rights are stated clearly on every role",
    // Paul's wording, 23/08/2026. This is the decision of 22/08/2026 that work
    // rights sit outside the match bar and are always named, said to a candidate.
    th: "ระบุสิทธิ์การทำงานของทุกตำแหน่งให้ชัด",
  },
];

/* ------------------------------------------------------------ what a token */

export const TOKEN_HEADING: Copy = {
  en: "What can one token do",
  // Paul's wording, 23/08/2026.
  th: "1 โทเคนใช้ทำอะไรได้บ้าง",
};

export const TOKEN_BODY: Copy = {
  en: "Every PunProfile service uses the same token, and we only deduct one once you have actually received the service.",
  // Paul's wording, 23/08/2026.
  th: "ทุกบริการบน PunProfile ใช้โทเคนเดียวกัน และเราจะหักโทเคนก็ต่อเมื่อคุณได้รับบริการจริงแล้วเท่านั้น",
};

export const TOKEN_EXAMPLES: readonly Copy[] = [
  {
    en: "1 token is 1 role matching your criteria, sent to your email",
    // Paul's wording, 23/08/2026.
    th: "1 โทเคน = 1 ตำแหน่งที่ตรงกับเงื่อนไขของคุณ ส่งตรงถึงอีเมล",
  },
  {
    en: "20 tokens = 1 Fit Report",
    // Paul's wording, 23/08/2026.
    th: "20 โทเคน = Fit Report 1 ฉบับ",
  },
];

/**
 * The rule that stops this reading like a slot machine, rewritten 23/08/2026.
 *
 * The first version said "if a round finds nothing close enough, no token is
 * deducted". Paul: "it's not shown to the candidates which round we run, for
 * them it's running all the time! real time!"
 *
 * Right that รอบ should not appear; a candidate should experience a standing
 * search rather than a schedule. **But this copy deliberately does not say real
 * time.** The batching test decided on 22/08/2026 exists because per-candidate
 * runs only work at this price if one run serves several candidates, so the
 * mechanism will be batched. Promising real time would be a claim the system
 * does not meet, in the product whose own principle is honesty over conversion
 * optimisation.
 *
 * `ต่อเนื่อง` is true under either mechanism and asserts nothing about
 * frequency.
 */
export const NOTHING_FOUND: Copy = {
  en: "We keep looking, and a token is only deducted once a role matching your criteria has reached you.",
  // Paul's wording, 23/08/2026, over the line written after his RETHINK. See the note above.
  th: "เราจะค้นหาต่อให้ และหักโทเคนเฉพาะเมื่อมีตำแหน่งที่ตรงกับเงื่อนไขส่งถึงคุณแล้ว",
};

/* ------------------------------------------------------------- calculator */

export const CALC_HEADING: Copy = {
  en: "Work out which pack fits how much you will use it",
  // Paul's wording, 23/08/2026.
  th: "ลองคำนวณดูว่าแพ็กไหนพอดีกับการใช้งานของคุณ",
};

export const CALC_NOW: Copy = {
  en: "Salary now",
  th: "เงินเดือนปัจจุบัน",
};

export const CALC_TARGET: Copy = {
  en: "Target salary",
  th: "เงินเดือนเป้าหมาย",
};

export const CALC_PER_MONTH: Copy = {
  en: "Difference per month",
  th: "ส่วนต่างเงินเดือนต่อเดือน",
};

export const CALC_PER_YEAR: Copy = {
  en: "Difference per year",
  th: "ส่วนต่างเงินเดือนต่อปี",
};

export const CALC_IN_TOKENS: Copy = {
  en: "How many tokens that is",
  th: "คิดเป็นกี่โทเคน?",
};

/**
 * The line that makes the calculator publishable at all.
 *
 * Careersy's equivalent defaults an uplift slider to 15%, which it can do
 * because it has 300 coached professionals behind it. PunProfile has no placed
 * clients and an empty Social Proof pillar, so **both numbers come from the
 * candidate and the page asserts nothing.** No default target salary, because a
 * default is a suggestion. No currency conversion, because a European figure
 * PunProfile supplied would be a market claim.
 */
export const CALC_NOTE: Copy = {
  en: "The result is worked out from what you entered. It is an estimate, not a guarantee of what you will actually earn.",
  // Paul's wording, 23/08/2026.
  th: "ผลคำนวณอ้างอิงจากข้อมูลที่คุณกรอก เป็นเพียงตัวเลขประมาณการ และไม่ใช่การรับประกันเงินเดือนที่คุณจะได้รับจริง",
};

/* --------------------------------------------------------------- questions */

export interface PricingQuestion {
  q: Copy;
  a: readonly Copy[];
}

/**
 * Two questions only. The rest of the FAQ lives in `faq.ts` and is not
 * duplicated here.
 *
 * The first pair is Paul's rewrite of 23/08/2026 of strings that are ALREADY
 * LIVE in `faq.ts`. The same rewrite has to land there too, or one question is
 * answered two ways on two pages.
 */
export const PRICING_QUESTIONS: readonly PricingQuestion[] = [
  {
    q: {
      en: "What does Career Coaching cost?",
      th: "บริการ Career Coaching ราคาเท่าไร?",
    },
    a: [
      {
        en: "It depends what you want help with and how far that help goes. We go through the details and tell you the cost clearly the first time we talk, and then you decide whether to go ahead.",
        th: "ค่าบริการขึ้นอยู่กับเรื่องที่คุณอยากให้เราช่วยและขอบเขตความช่วยเหลือที่ต้องการ เราจะคุยรายละเอียดพร้อมแจ้งค่าใช้จ่ายให้ชัดเจนตั้งแต่ครั้งแรก แล้วคุณค่อยตัดสินใจว่าจะใช้บริการหรือไม่",
      },
      {
        en: "Both the EU Fit Check and that first conversation are free.",
        th: "ทำ EU Fit Check พร้อมดูผลเบื้องต้น และคุยกับเราครั้งแรกได้ฟรี",
      },
    ],
  },
  {
    q: { en: "Do tokens expire?", th: "โทเคนมีวันหมดอายุไหม?" },
    a: [
      {
        en: "They do not. And if you have not used them, you can have the money back.",
        th: "ไม่หมดอายุ และถ้ายังไม่ได้ใช้ ขอคืนเป็นเงินได้",
      },
    ],
  },
];
