import type { Copy } from "./copy";
import { HERO_REFRAME } from "./home";

/**
 * One page per product. Added 23/08/2026, Paul's call to build all of them
 * rather than only the ones that exist.
 *
 * ---------------------------------------------------------------------------
 * WHAT A PRODUCT PAGE IS FOR, AND WHY IT CARRIES NO PRICE
 * ---------------------------------------------------------------------------
 *
 * `/pricing` is where someone chooses. A product page is where someone learns,
 * and the two must not both try to do both: a number repeated across six
 * marketing pages is six places for it to drift. Decided 23/08/2026, and it is
 * how the reference product handles the same split.
 *
 * The shape follows `careersy.ai/cv-score`: a headline naming the PROBLEM rather
 * than the feature, one line on what you get, how it works in three points, what
 * it does NOT do stated plainly, a short FAQ, and one action repeated at the
 * foot. The "what it does not do" block is not modesty. It is the app's own
 * honesty rule applied to a sales page, and on three of these it carries a
 * standing decision: the app does not rewrite CVs, PunProfile is not a
 * recruiter, and the tracker does not chase employers.
 *
 * **Every Thai string here was read back by Paul on 23/08/2026** through
 * `thai-review-queue.md`. Nine he approved as drafted, the rest he rewrote, and
 * each rewritten line is attributed where it sits. Where his Thai moved the
 * meaning, the English was changed to follow it rather than the other way round.
 *
 * ---------------------------------------------------------------------------
 * STATUS, AND WHY AN UNBUILT PRODUCT STILL GETS A PAGE
 * ---------------------------------------------------------------------------
 *
 * Four of the five do not exist yet: only EU Fit Check is `live`. Their pages ship
 * anyway, with `status: "soon"` rendering a line that says so and an action that
 * opens a conversation rather than a dead button. That is the white-glove flow in
 * any case, since payment is a bank transfer arranged one to one, and it measures
 * demand before the build rather than after it.
 *
 * **A page that pretended the thing existed would be the version to refuse.** The
 * status line is what makes shipping these honest.
 *
 * **And a `soon` page is not a search result.** Each one carries `NOT_YET_INDEXED`
 * from `seo.ts`, `index: false, follow: true`, added 23/08/2026 on Paul's call.
 * They are linked from the Products menu on every page of the site, so leaving
 * them indexable would have made the four thinnest pages the four most linked-to.
 * Three things flip together on the day a product opens: `status` to `live`, the
 * route into `PUBLIC_ROUTES`, and that tag off.
 *
 * Coaching 1:1 is deliberately absent from this file. It has `/coaching`, which
 * is a longer sales page with the founder section and the three service cards
 * on it, and folding that into a template would lose more than it tidied.
 */

export type ProductStatus = "live" | "soon";

/**
 * `audience` and `howLede` were drafted 25/08/2026 to fill `PROD-01` and
 * `PROD-02`, the two parts the reference's product pages have and these did
 * not: a chip saying who the thing is for, above everything else, and a line
 * under "how this works" saying what the steps add up to.
 *
 * Both are written from what each product's own `how` list already says, not
 * from a claim about it, which is the rule that keeps a summary honest: if the
 * line cannot be checked against the three bullets under it, it is marketing.
 */
export interface ProductFaq {
  q: Copy;
  a: Copy;
}

export interface Product {
  /** The URL segment, under `/products/`. */
  slug: string;
  /** Who this one is for, in a few words. Renders as the audience chip. */
  audience: Copy;
  /** One line under "how this works", before the steps. */
  howLede: Copy;
  name: Copy;
  status: ProductStatus;
  /** The problem the reader arrived with, not a description of the feature. */
  headline: Copy;
  /** What they get, in one line. */
  lede: Copy;
  /** How it works. Three, because a fourth stops being read. */
  how: readonly Copy[];
  /** What it does not do. Plainly, and usually carrying a standing decision. */
  limit: Copy;
  faq: readonly ProductFaq[];
  /** Key into `PAGE_ACTIONS`. Every product page has its own entry. */
  actionsKey: string;
}

/**
 * Shown under the name on any product whose `status` is `soon`.
 *
 * One string for all of them rather than a per-product variant, so the promise
 * is identical everywhere and there is one place to change it on the day the
 * first one ships.
 */
export const COMING_SOON: Copy = {
  en: "Not open yet. Message me and I will tell you when it is.",
  // Paul's wording, 23/08/2026.
  th: "ตอนนี้ยังไม่เปิดให้ใช้งาน ทักมาหาผมได้ แล้วผมจะแจ้งให้คุณรู้เมื่อเปิด",
};

export const HOW_HEADING: Copy = {
  en: "How it works",
  // Paul's wording, 23/08/2026.
  th: "บริการนี้ทำงานอย่างไร",
};

export const LIMIT_HEADING: Copy = {
  en: "What it does not do",
  // Drafted 23/08/2026, read back and approved unchanged.
  th: "สิ่งที่บริการนี้ไม่ได้ทำ",
};

export const PRODUCTS: readonly Product[] = [
  /* ------------------------------------------------------------ EU Fit Check */
  {
    slug: "eu-fit-check",
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-01-eu-fit-check`.
    audience: {
      en: "For anyone weighing up a move to Europe",
      th: "คนที่กำลังคิดเรื่องไปทำงานในยุโรป",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-02-eu-fit-check`.
    howLede: {
      en: "Seventeen questions on your phone, and a first read the moment you finish.",
      th: "คำถาม 17 ข้อบนมือถือ และรู้ผลเบื้องต้นทันทีเมื่อทำเสร็จ",
    },
    name: { en: "EU Fit Check", th: "EU Fit Check" },
    status: "live",
    // Lifted whole from `home.ts` HERO_REFRAME, Paul's own Thai. It is already
    // the problem statement this page needs and it is already approved, so
    // composing a second one would be inventing a rival for a line that works.
    headline: HERO_REFRAME,
    lede: {
      en: "Under 2 minutes. Your first read straight away, with no sign-up.",
      // Paul's own Thai, `copy.ts` landing.reassurance.
      th: "ใช้เวลาไม่ถึง 2 นาที รู้ผลเบื้องต้นทันที ไม่ต้องสมัครสมาชิก",
    },
    how: [
      {
        en: "It takes about 2 minutes, and the moment you finish you see your first read and your own chart.",
        // Paul's own Thai, `faq.ts`.
        th: "ใช้เวลาประมาณ 2 นาที พอทำเสร็จ คุณจะเห็นผลเบื้องต้นและกราฟของตัวเองทันที",
      },
      {
        en: "Answer on your phone, and get your first read the moment you finish.",
        // Paul's own Thai, 23/08/2026, from the pricing sheet.
        th: "ตอบคำถามบนมือถือได้เลย รับผลเบื้องต้นทันทีเมื่อทำเสร็จ",
      },
      {
        en: "No. The EU Fit Check is free, and there is no payment step in it.",
        // Paul's own Thai, `faq.ts`.
        th: "ไม่มีค่าใช้จ่าย คุณทำ EU Fit Check ได้ฟรี และไม่มีขั้นตอนการชำระเงิน",
      },
    ],
    limit: {
      en: "We do not guess a score for something a form cannot measure.",
      // Paul's own Thai, `faq.ts`. It is the honesty rule in his own words and it
      // belongs on this page more than anywhere else.
      th: "เพราะเราไม่เดาคะแนนในเรื่องที่แบบฟอร์มวัดไม่ได้",
    },
    faq: [
      {
        q: { en: "Why are parts of my chart empty?", th: "ทำไมกราฟบางส่วนถึงว่างอยู่" },
        a: {
          en: "Because we do not guess a score for something a form cannot measure.",
          th: "เพราะเราไม่เดาคะแนนในเรื่องที่แบบฟอร์มวัดไม่ได้",
        },
      },
      {
        q: { en: "Can I change an answer, or take it again?", th: "แก้คำตอบหรือทำใหม่ได้ไหม" },
        a: {
          en: "Yes. You can go back and change an answer at any point, and the chart updates straight away.",
          th: "ได้ คุณย้อนกลับไปแก้คำตอบได้ตลอด กราฟจะอัปเดตตามคำตอบใหม่ให้ทันที",
        },
      },
    ],
    actionsKey: "/products/eu-fit-check",
  },

  /* --------------------------------------------------------------- CV Check */
  {
    slug: "cv-check",
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-01-cv-check`.
    audience: {
      en: "For anyone whose CV was written for the Thai market",
      th: "คนที่เขียน CV ไว้สำหรับตลาดไทย",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-02-cv-check`.
    howLede: {
      en: "We read your CV the way a European reader does, and list what to fix.",
      th: "เราอ่าน CV ของคุณแบบเดียวกับคนอ่านในยุโรป แล้วบอกว่าควรแก้จุดไหนบ้าง",
    },
    name: { en: "CV Check", th: "CV Check" },
    status: "soon",
    headline: {
      en: "A CV that works in the Thai market can leave a European reader unable to see your strengths.",
      // Paul's wording, 23/08/2026.
      th: "CV ที่ใช้ได้ดีในตลาดไทย อาจทำให้คนในตลาดยุโรปมองไม่เห็นจุดแข็งของคุณ",
    },
    lede: {
      en: "Upload your CV and see how much of your profile a European reader can actually understand. Free.",
      // Paul's wording, 23/08/2026.
      th: "อัปโหลด CV แล้วดูว่าคนในตลาดยุโรปเข้าใจโปรไฟล์ของคุณได้มากแค่ไหน ใช้ฟรี",
    },
    how: [
      {
        en: "What the first third of the page spends itself on, because a screener and a reader both start at the top and both stop early.",
        // Paul's wording, 23/08/2026. The reading-order opener from the Kick-start
        // run sheet, which exists because the ATS artefact only shows up when a CV
        // parses badly and the first real CV parsed cleanly.
        th: "ดูว่าหนึ่งในสามแรกของหน้าใช้พื้นที่ไปกับอะไร เพราะทั้งระบบคัดกรองและคนอ่านต่างเริ่มจากด้านบน และอาจหยุดอ่านตั้งแต่เนิ่น ๆ",
      },
      {
        en: "Whether your employers and job titles mean anything to someone who does not know the Thai market.",
        // Paul's wording, 23/08/2026. This is the core claim in `10_Methodology.md`:
        // illegibility rather than capability. A Bangkok senior title may read as
        // mid-level and a well-known Thai employer reads as an unknown one.
        th: "เช็กว่าชื่อบริษัทและชื่อตำแหน่งของคุณสื่อความหมายกับคนที่ไม่รู้จักตลาดงานไทยหรือไม่",
      },
      {
        en: "Where you have written duties when the market is reading for results.",
        // Drafted 23/08/2026, read back and approved unchanged.
        th: "ชี้จุดที่เขียนเป็นหน้าที่ความรับผิดชอบ ทั้งที่ควรเขียนเป็นผลลัพธ์",
      },
    ],
    limit: {
      en: "We do not rewrite your CV. What you get is a list of what to fix, and why each one matters.",
      /*
       * Drafted 23/08/2026, read back and approved unchanged, and this line is a standing decision rather
       * than a caveat. **The app does not rewrite CVs**, decided by Paul on
       * 04/08/2026 and recorded in `competitive-reference.md` as the one thing
       * explicitly not taken from the nearest competitor. A checker reads and
       * scores. The difference has to hold in the copy as well as the code.
       */
      th: "เราไม่เขียน CV ใหม่ให้คุณ สิ่งที่ได้คือรายการจุดที่ควรแก้ พร้อมเหตุผลของแต่ละจุด",
    },
    faq: [
      {
        q: { en: "Does it cost anything?", th: "มีค่าใช้จ่ายไหม" },
        a: {
          en: "No. The CV Check is free.",
          // Paul's wording, 23/08/2026.
          th: "ไม่มีค่าใช้จ่าย CV Check ใช้ฟรี",
        },
      },
    ],
    actionsKey: "/products/cv-check",
  },

  /* ------------------------------------------------------------- Fit Report */
  {
    slug: "fit-report",
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-01-fit-report`.
    audience: {
      en: "For anyone who wants the full read, not the summary",
      th: "คนที่อยากได้ผลแบบเต็ม ไม่ใช่แค่สรุป",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-02-fit-report`.
    howLede: {
      en: "All four scores against the market's own bars, and what to do first.",
      th: "คะแนนทั้งสี่ด้านเทียบกับเกณฑ์ที่ตลาดใช้จริง พร้อมบอกว่าควรเริ่มจากอะไร",
    },
    name: { en: "Fit Report", th: "Fit Report" },
    status: "soon",
    headline: {
      en: "You know which stage you are at. The next question is what to do first.",
      // Drafted 23/08/2026, read back and approved unchanged. `อยู่ขั้นไหน` is Paul's own correction on the
      // pinned post of 14/08/2026, where he changed อยู่ตรงไหน to อยู่ขั้นไหน:
      // progress is a stage you are at, not a place you are in.
      th: "รู้ว่าตัวเองอยู่ขั้นไหนแล้ว คำถามต่อไปคือควรลงมือทำอะไรก่อน",
    },
    lede: {
      en: "The full EU Fit Check result as a document you keep and plan the next step with.",
      // Rebuilt from Paul's own Thai of 23/08/2026 on the pricing sheet.
      th: "ผลประเมินฉบับเต็มจาก EU Fit Check ในรูปแบบเอกสารที่คุณเก็บไว้ใช้ในการวางแผนขั้นต่อไปได้",
    },
    how: [
      {
        en: "All four scores against the bars the European market actually uses, rather than four numbers on their own.",
        // Drafted 23/08/2026, read back and approved unchanged. Thresholds rather than scores, which
        // `10_Methodology.md` calls the single most important idea in the method.
        th: "เทียบคะแนนทั้งสี่ด้านกับเกณฑ์ที่ตลาดยุโรปใช้จริง ไม่ใช่แค่ตัวเลขลอย ๆ",
      },
      {
        en: "Which gate you have not cleared, and why you should start with that one.",
        // Paul's wording, 23/08/2026. Gates are cleared in dependency order, not
        // score order, and the lowest uncleared one is the only one that matters
        // this month.
        th: "บอกว่าคุณยังไม่ผ่านด่านไหน และทำไมจึงควรเริ่มจากด่านนั้นก่อน",
      },
      {
        en: "A sequence of what to do, ordered by what moves the result soonest.",
        // Paul's wording, 23/08/2026.
        th: "จัดลำดับสิ่งที่ควรทำ โดยเริ่มจากสิ่งที่จะช่วยให้คุณเห็นผลได้เร็วที่สุด",
      },
    ],
    limit: {
      en: "The document tells you what to do. It does not do it for you.",
      // Drafted 23/08/2026, read back and approved unchanged.
      th: "เอกสารนี้บอกว่าควรทำอะไร แต่ไม่ได้ลงมือทำแทนคุณ",
    },
    faq: [
      {
        q: { en: "How is this different from the free result?", th: "ต่างจากผลเบื้องต้นที่ได้ฟรีอย่างไร" },
        a: {
          en: "The free read shows you where you stand. This one names the gate and sequences the work.",
          // Paul's wording, 23/08/2026.
          th: "ผลเบื้องต้นบอกว่าคุณอยู่ขั้นไหน ส่วนฉบับเต็มบอกว่าด่านไหนยังไม่ผ่าน และควรทำอะไรตามลำดับ",
        },
      },
    ],
    actionsKey: "/products/fit-report",
  },

  /* ----------------------------------------------------------- Matched Jobs */
  {
    slug: "matched-jobs",
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-01-matched-jobs`.
    audience: {
      en: "For anyone tired of scrolling job boards",
      th: "คนที่เหนื่อยกับการไล่หาประกาศงานเอง",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-02-matched-jobs`.
    howLede: {
      en: "You set the criteria, we screen against them and send one role at a time.",
      th: "คุณกำหนดเงื่อนไข เราคัดกรองให้ตามนั้น แล้วส่งให้ทีละตำแหน่ง",
    },
    name: { en: "Matched Jobs", th: "Matched Jobs" },
    status: "soon",
    headline: {
      en: "There are plenty of roles in Europe. There are not many you can actually apply for.",
      // Drafted 23/08/2026, read back and approved unchanged.
      th: "ตำแหน่งงานในยุโรปมีเยอะ แต่ที่คุณสมัครได้จริงมีไม่กี่ตำแหน่ง",
    },
    lede: {
      en: "We screen roles against the criteria you set and send them to your email, one at a time.",
      // Paul's own Thai of 23/08/2026, from the pricing sheet.
      th: "เราคัดตำแหน่งงานที่ตรงกับเงื่อนไขของคุณ แล้วส่งตรงถึงอีเมลทีละตำแหน่ง",
    },
    how: [
      {
        en: "You set the criteria: the field, the countries, the language, the level of role you want.",
        // Paul's wording, 23/08/2026.
        th: "คุณเป็นคนกำหนดเงื่อนไขเอง ทั้งสายงาน ประเทศ ภาษา และระดับตำแหน่งที่ต้องการ",
      },
      {
        en: "One role at a time, so you have the time to look at each one properly.",
        // Paul's wording, 23/08/2026. One at a time is the method's own rule
        // against handing anyone a five-item list, applied to job search.
        th: "ส่งให้ทีละตำแหน่ง เพื่อให้คุณมีเวลาดูแต่ละงานจริง ๆ",
      },
      {
        en: "Every role says plainly whether it needs work rights you already hold, before you spend time applying.",
        // Drafted 23/08/2026, read back and approved unchanged. Work rights sit outside the match bar and are
        // always stated, decided 22/08/2026, using the pipeline's own
        // "Publish (Work Rights Required)" verdict whose rule is that the label is
        // not optional and not a footnote.
        th: "ทุกตำแหน่งระบุชัดว่าต้องมีสิทธิ์ทำงานอยู่แล้วหรือไม่ ก่อนที่คุณจะเสียเวลาในการสมัคร",
      },
    ],
    limit: {
      en: "We are not a recruitment agency. Applying is still yours.",
      // Paul's wording, 23/08/2026. Paul's own FAQ makes the same point: PunProfile
      // takes its fee from the candidate rather than the employer, so there is no
      // quota and no role anyone is pushed toward.
      th: "เราไม่ใช่บริษัทจัดหางาน และคุณยังต้องเป็นคนสมัครด้วยตัวเอง",
    },
    faq: [
      {
        q: { en: "What if nothing matches?", th: "ถ้ารอบไหนไม่มีตำแหน่งที่ตรงเลย" },
        a: {
          en: "We keep looking, and a token is only deducted once a role matching your criteria has reached you.",
          // Paul's wording, 23/08/2026. Deliberately does not say real time: the
          // mechanism will be batched, and a promise of real time is a claim the
          // system does not meet.
          th: "เราจะค้นหาต่อให้ และหักโทเคนเฉพาะเมื่อมีตำแหน่งที่ตรงกับเงื่อนไขส่งถึงคุณแล้ว",
        },
      },
    ],
    actionsKey: "/products/matched-jobs",
  },

  /* ------------------------------------------------------- Guided Job Hunt */
  {
    slug: "guided-job-hunt",
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-01-guided-job-hunt`.
    audience: {
      en: "For anyone applying to several roles at once",
      th: "คนที่กำลังสมัครงานหลายตำแหน่งพร้อมกัน",
    },
    // TH-UNREVIEWED, 25/08/2026. Draft for `PROD-02-guided-job-hunt`.
    howLede: {
      en: "One place holding every application and where each one stands.",
      th: "ที่เดียวที่เก็บทุกตำแหน่งที่คุณสมัคร พร้อมสถานะของแต่ละตำแหน่ง",
    },
    name: { en: "Guided Job Hunt", th: "Guided Job Hunt" },
    status: "soon",
    headline: {
      en: "You have applied to a lot of places, and you can no longer remember which one is where.",
      // Drafted 23/08/2026, read back and approved unchanged.
      th: "สมัครไปหลายที่ จนจำไม่ได้แล้วว่าที่ไหนไปถึงขั้นไหน",
    },
    lede: {
      en: "One place holding every role you applied for, with where each one stands. Free.",
      // Paul's wording, 23/08/2026. Free because it is the surface paid deliveries
      // land on, decided 23/08/2026: charging for it would be charging twice for
      // one workflow.
      th: "รวมทุกตำแหน่งที่คุณสมัครไว้ในที่เดียว พร้อมสถานะล่าสุดของแต่ละที่ ใช้ฟรี",
    },
    how: [
      {
        en: "Save the roles you are interested in, then decide which to apply for.",
        // Paul's wording, 23/08/2026.
        th: "บันทึกตำแหน่งที่สนใจไว้ แล้วค่อยตัดสินใจว่าจะสมัครตำแหน่งไหน",
      },
      {
        en: "Update the status yourself, from applying through interviews to an offer.",
        // Paul's wording, 23/08/2026. Self-updated by design: a notebook rather than
        // an automated pipeline, per the 04/08/2026 scope note.
        th: "อัปเดตสถานะได้ด้วยตัวเอง ตั้งแต่ส่งใบสมัคร นัดสัมภาษณ์ ไปจนถึงได้รับข้อเสนองาน",
      },
      {
        en: "See where you are actually getting stuck most often.",
        // Paul's wording, 23/08/2026.
        th: "ดูได้ว่าคุณมักติดอยู่ที่ขั้นตอนไหนของการสมัครงาน",
      },
    ],
    limit: {
      en: "We do not apply for you, and we do not chase employers on your behalf.",
      // Paul's wording, 23/08/2026.
      th: "เราไม่สมัครงานแทนคุณ และไม่ติดตามนายจ้างแทนคุณ",
    },
    faq: [
      {
        q: { en: "Does it cost anything?", th: "มีค่าใช้จ่ายไหม" },
        a: {
          en: "No charge. It is included with Matched Jobs, because it is where those roles arrive.",
          // Paul's wording, 23/08/2026.
          th: "ไม่มีค่าใช้จ่าย เพราะรวมอยู่ในบริการส่งตำแหน่งงานที่ตรงกับคุณแล้ว",
        },
      },
    ],
    actionsKey: "/products/guided-job-hunt",
  },
];

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);
