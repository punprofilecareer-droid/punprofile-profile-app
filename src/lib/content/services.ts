import type { Copy } from "./copy";

/**
 * What PunProfile sells. TASK-084, rewritten 14/08/2026 from Paul's own Thai.
 *
 * Source of truth for the structure is `01_Project_Foundation.md` -> Core
 * Offerings: a hybrid, where Career Coaching is the engagement everyone starts
 * with and the other two also sell standalone. **The words are now Paul's**,
 * supplied in Thai; the English is a translation of his Thai rather than the
 * other way round, which is the correct direction for a Thai-first product and
 * a change from the first version of this file.
 *
 * **Still no prices.** `01_Project_Foundation.md` heads its table "Pricing
 * (pilot hypothesis)" and says in as many words that the ranges are a starting
 * point to pilot with real leads, with a validation plan still open. A public
 * page is where a hypothesis stops being one: whatever is printed here is what
 * the next caller has already anchored on. Paul's copy does not mention price
 * either, so the page ends on a conversation. This comment is the thing to
 * delete first when the pilot closes.
 *
 * **The three illustrations became photographs on 17/08/2026**, on Paul's call:
 * `pp_mascot_steping`, `pp_mascot_cv_laptop` and `pp_mascot_magnifying` from the
 * brand assets inbox. They are studio renders of the mascot rather than flat art,
 * which is why `wash` went with them; see the note on `image` below.
 *
 * All three were cover-cropped to 4:3 and re-encoded at build time, 1200x900 at
 * quality 82, which took them from 0.5-1.7MB each to 58-85KB. The crop is decided
 * once in the asset rather than on every render.
 */

export type ServiceId = "coaching" | "profile" | "applications";

export interface Service {
  id: ServiceId;
  /** True for the engagement every client starts with. */
  core: boolean;
  name: Copy;
  /** The client's question, in their words. */
  question: Copy;
  summary: Copy;
  includes: Copy[];
  /**
   * Public path to the photograph for this service.
   *
   * **`wash` is gone, 17/08/2026.** It held the exact colour each illustration
   * was drawn on, so the panel behind it could be painted to match and the image
   * would have no visible edge. That was right for flat art on a single colour
   * and is wrong for what replaced it: these are studio renders on a soft grey
   * with a gradient and a cast shadow, so there is no colour to match and a panel
   * painted to the average would seam wherever the backdrop falls away. The image
   * fills its band edge to edge instead.
   */
  image: { src: string; alt: Copy };
  /**
   * The chart axis this service answers, so the result screen can open the page
   * on the card a candidate's own chart points at. A low score here is a reason
   * to read this card first, never a diagnosis that it is the only one.
   */
  answers: "professionalCapability" | "employability" | "mobilityReadiness" | "europeanMarketFit";
}

export const SERVICES_HEADING: Copy = {
  en: "What PunProfile helps you with",
  th: "PunProfile ช่วยคุณเรื่องอะไรบ้าง",
};

export const SERVICES_INTRO: Copy = {
  en: "Career coaching is the core service every client starts with. The other two can be taken on their own, depending on what you actually need.",
  th: "แคเรียร์โค้ชชิ่งเป็นบริการหลักที่ลูกค้าทุกคนเริ่มต้นด้วย ส่วนอีกสองบริการเลือกใช้แยกกันได้ตามสิ่งที่คุณต้องการ",
};

export const SERVICES: readonly Service[] = [
  {
    id: "coaching",
    core: true,
    name: { en: "Career Coaching", th: "แคเรียร์โค้ชชิ่ง" },
    question: {
      en: "Where should you be heading, and why?",
      th: "คุณควรมุ่งไปทางไหน และเพราะอะไร",
    },
    summary: {
      en: "This is where every client starts. We get the direction clear before writing a single document, because however good a CV is, sent into the wrong market it is still an application aimed at nothing.",
      th: "นี่คือจุดเริ่มต้นของลูกค้าทุกคน เราจะช่วยกันหาทิศทางให้ชัดก่อนลงมือเขียนเอกสาร เพราะต่อให้ CV ดีแค่ไหน ถ้าส่งไปผิดตลาด ก็ยังเป็นการสมัครที่ไม่ตรงเป้าอยู่ดี",
    },
    includes: [
      {
        en: "Getting the direction and the goal clear: the role, the industry, the country",
        th: "หาทิศทางและกำหนดเป้าหมายให้ชัด ทั้งตำแหน่ง อุตสาหกรรม และประเทศ",
      },
      {
        en: "A realistic look at where you stand right now against what the European market is asking for",
        th: "ดูตามความเป็นจริงว่าตอนนี้คุณอยู่ตรงไหน เมื่อเทียบกับสิ่งที่ตลาดงานยุโรปต้องการ",
      },
      {
        en: "Thinking through and deciding on a career change and a move abroad",
        th: "ช่วยคิดและตัดสินใจเรื่องการเปลี่ยนสายงานและการย้ายประเทศ",
      },
      {
        en: "Finding the right position to stand in: what makes you worth hiring, and which employers are looking for someone like you",
        th: "หาจุดยืนที่ใช่ ว่าอะไรทำให้คุณน่าจ้าง และนายจ้างแบบไหนกำลังมองหาคนอย่างคุณ",
      },
      // Added 17/08/2026 (Paul). The sessions were always in English; saying so
      // turns a fact about how the service runs into a reason to buy it, since
      // the interview this audience is preparing for is in English too.
      //
      // EN-FIRST, which is the wrong direction for this file: its header records
      // that the words are Paul's Thai and the English is the translation. This
      // one arrived in English, so the Thai below is mine and awaits his pass.
      {
        en: "Sessions are held mainly in English, so every conversation doubles as practice for the interviews you are preparing for",
        // Paul's wording, 17/08/2026. `เป็นหลัก` added, and it is a promise being
        // made accurate rather than softened: sessions are mainly in English, and a
        // flat claim that they ARE in English is one a Thai reader could hold
        // against the first session that switches.
        th: "เซสชันโค้ชชิ่งใช้ภาษาอังกฤษเป็นหลัก ทุกครั้งที่คุยกันจึงได้ฝึกภาษาอังกฤษสำหรับการสัมภาษณ์ไปในตัว",
      },
    ],
    image: {
      src: "/services/direction.jpg",
      alt: {
        en: "The PunProfile character climbing steps towards a signpost",
        th: "ตัวการ์ตูน PunProfile กำลังเดินขึ้นบันไดไปหาป้ายบอกทาง",
      },
    },
    answers: "mobilityReadiness",
  },
  {
    id: "profile",
    core: false,
    name: {
      en: "Getting your profile ready to apply",
      th: "ปรับโปรไฟล์ให้พร้อมสมัครงาน",
    },
    question: {
      en: "Does your profile say who you are clearly and compellingly enough?",
      th: "โปรไฟล์ของคุณสื่อสารตัวตนได้ชัดและน่าสนใจพอหรือยัง",
    },
    summary: {
      en: "This service builds the core set of documents you reuse for every application. We get the base versions ready; tailoring them to a specific role is the next service.",
      th: "บริการนี้จะช่วยสร้างชุดเอกสารหลักที่คุณนำไปใช้ต่อได้ในการสมัครทุกครั้ง เราจะทำเวอร์ชันตั้งต้นให้พร้อม ส่วนการปรับให้ตรงกับแต่ละตำแหน่งจะอยู่ในบริการถัดไป",
    },
    includes: [
      {
        en: "A master CV to use as the template every other version comes from",
        th: "CV ฉบับหลักสำหรับใช้เป็นต้นแบบของทุกฉบับ",
      },
      {
        en: "Your LinkedIn profile, from the headline, summary and experience through to the keywords recruiters actually search",
        th: "โปรไฟล์ LinkedIn ตั้งแต่พาดหัว บทสรุป และประสบการณ์ ไปจนถึงคีย์เวิร์ดที่รีครูตเตอร์ค้นหาจริง",
      },
      {
        en: "A portfolio site for non-IT fields, built from your real results and cases, not just a project list like a developer's portfolio",
        th: "เว็บพอร์ตโฟลิโอสำหรับสายงานที่ไม่ใช่ไอที สร้างจากผลงานและเคสจริงของคุณ ไม่ใช่แค่ลิสต์โปรเจกต์แบบพอร์ตสายพัฒนา",
      },
    ],
    image: {
      src: "/services/profile.jpg",
      alt: {
        en: "The PunProfile character beside a laptop showing a profile page",
        th: "ตัวการ์ตูน PunProfile ยืนข้างแล็ปท็อปที่เปิดหน้าโปรไฟล์อยู่",
      },
    },
    answers: "employability",
  },
  {
    id: "applications",
    core: false,
    name: {
      en: "Handling an application start to finish",
      th: "ดูแลการสมัครงานตั้งแต่ต้นจนจบ",
    },
    question: {
      en: "What does it actually take to run one application through every stage?",
      th: "สมัครงานหนึ่งตำแหน่งให้ครบทุกขั้นตอน ต้องทำอย่างไรบ้าง",
    },
    summary: {
      en: "We handle applications one role at a time, from finding the job through to signing the contract. The roles we shortlist are searched specifically against your profile and your goals, not one list sent to everybody.",
      th: "เราดูแลการสมัครทีละตำแหน่ง ตั้งแต่ช่วยหางานไปจนถึงเซ็นสัญญา งานที่คัดให้จะค้นหาตามโปรไฟล์และเป้าหมายของคุณโดยเฉพาะ ไม่ใช่ลิสต์เดียวที่ส่งให้ทุกคน",
    },
    includes: [
      {
        en: "Shortlisting roles that match your profile and your goals",
        th: "คัดตำแหน่งที่ตรงกับโปรไฟล์และเป้าหมายของคุณ",
      },
      {
        en: "Tailoring your CV and cover letter to each role",
        th: "ปรับ CV และจดหมายสมัครงานให้ตรงกับแต่ละตำแหน่ง",
      },
      {
        en: "Interview preparation for that specific role and that specific company",
        th: "เตรียมสัมภาษณ์ให้ตรงกับตำแหน่งและบริษัทนั้นโดยเฉพาะ",
      },
      {
        en: "Evaluating the offer, helping you negotiate, and checking the contract",
        th: "ประเมินข้อเสนอ ช่วยเจรจาต่อรอง และตรวจสัญญา",
      },
    ],
    image: {
      src: "/services/applications.jpg",
      alt: {
        en: "The PunProfile character reading a document through a magnifying glass",
        th: "ตัวการ์ตูน PunProfile กำลังส่องเอกสารด้วยแว่นขยาย",
      },
    },
    answers: "europeanMarketFit",
  },
];

/** AI runs through all three rather than being a fourth product. */
export const AI_NOTE: Copy = {
  en: "AI is part of all three services. You learn to use it yourself, for drafting, preparing and researching, and PunProfile uses it behind the scenes to work faster without lowering the quality of the thinking.",
  th: "AI เป็นส่วนหนึ่งของทั้งสามบริการ คุณจะได้เรียนรู้วิธีใช้ AI ด้วยตัวเอง ทั้งเพื่อร่างงาน เตรียมตัว และหาข้อมูล ส่วน PunProfile ก็ใช้ AI ช่วยทำงานเบื้องหลังให้เร็วขึ้น โดยไม่ลดคุณภาพของการคิด",
};

export const CORE_BADGE: Copy = { en: "Core service", th: "บริการหลัก" };

/** The result screen's lowest axis picks the card to open on. */
export function serviceForDimension(dimension: string): ServiceId {
  const hit = SERVICES.find((s) => s.answers === dimension);
  // Professional Capability has no service of its own on purpose: it is what
  // the coaching conversation reads rather than what a module fixes, so it
  // falls through to the core engagement, which is also the honest answer for
  // anything unrecognised.
  return hit?.id ?? "coaching";
}
