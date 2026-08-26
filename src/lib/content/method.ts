import type { Copy } from "./copy";
import type { DimensionKey } from "@/lib/model";

/**
 * `/method`. Added 26/08/2026, Paul's call.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS PAGE EXISTS, AND WHAT IT IS ALLOWED TO SAY
 * ---------------------------------------------------------------------------
 *
 * `Narrative_System.md` gives every offer a slot 7, the thing that makes it
 * checkable, and the EU Fit Check's reads: *the four gates are published
 * reasoning in `10_Methodology.md`, not a claim.* On 26/08/2026 that was found
 * to be false in the only way that matters. The document is real and it is in
 * the coaching repo, where no reader can open it, so the home page's hero had
 * been carrying Matched Jobs' pipeline count instead. A record cannot cite a
 * page the reader cannot reach. This page is what makes the citation true.
 *
 * **It publishes the bars, as of 26/08/2026.** For one day it did not. The page
 * shipped with the gates and their questions and no numbers, because
 * `10_Methodology.md` was headed "Status: draft" and called them "**Proposed**
 * bars, for the owner to set", while `model.ts` › `GATES` implemented 4.0, 4.0,
 * 3.5 and 3.0 and the app scored real candidates against them daily. Printing a
 * number the owning document called undecided would have settled it by
 * publishing, which is backwards.
 *
 * Building this page is what forced the decision, and Paul made it the same day:
 * the bars are confirmed at the values already in the code, and the owning
 * document says so. Nothing in the app changed. What changed is that the numbers
 * are now a decision rather than a habit.
 *
 * **The order is not written here.** The page walks `GATES` from `model.ts`,
 * which is the same array `firstAction()` stops at. A published method that
 * could disagree with the implemented one is worse than no published method,
 * and importing it is the only version of this page that cannot drift.
 *
 * **The gate names are not written here either.** They are
 * `dimension.mobilityReadiness` and friends in `copy.ts`, already read back and
 * already on the spider chart. A second Thai name for an axis a candidate has
 * seen on their own result is the one-string-one-place failure.
 *
 * ---------------------------------------------------------------------------
 * THAI
 * ---------------------------------------------------------------------------
 *
 * **Every Thai string in this file is a draft nobody has read back.** Each
 * carries TH-UNREVIEWED and lands in `thai-review-queue.md`. Until they are
 * read, this route is `NOT_YET_INDEXED`, the same arrangement the four `soon`
 * product pages use: linked, honest, and not offered to a crawler as finished.
 */

export const METHOD_HEADING: Copy = {
  en: "The method behind the score",
  // TH-UNREVIEWED
  th: "วิธีประเมินที่อยู่เบื้องหลังคะแนน",
};

export const METHOD_INTRO: Copy = {
  en: "Every number this site gives you comes from the same method. It is written down here so you can judge it before you decide how much to trust it.",
  // TH-UNREVIEWED
  th: "ตัวเลขทุกตัวที่คุณเห็นบนเว็บนี้มาจากวิธีเดียวกัน เราเขียนวิธีนี้ไว้ให้อ่านก่อน คุณจะได้ตัดสินใจเองว่าจะเชื่อมากแค่ไหน",
};

export const CLAIM_HEADING: Copy = {
  en: "What it rests on",
  // TH-UNREVIEWED
  th: "ข้อสมมติหลักของวิธีนี้",
};

export const CLAIM_BODY: Copy = {
  en: "Getting hired in Europe is not mostly a question of being good enough. It is a question of being legible, and legibility can be measured.",
  // TH-UNREVIEWED. The home page states the same claim from the reader's side,
  // in Paul's own approved wording; this states it as the premise of a method,
  // which is a different sentence doing a different job on a different page.
  th: "การได้งานในยุโรปไม่ได้ขึ้นอยู่กับว่าคุณเก่งพอหรือไม่เป็นหลัก แต่ขึ้นอยู่กับว่าคนที่อ่านโปรไฟล์มองเห็นสิ่งที่คุณมีหรือไม่ และสิ่งนี้วัดได้",
};

/** The two verbs, in this order. `10_Methodology.md` § 1 owns the reasoning. */
export const VERBS: readonly { name: Copy; body: Copy }[] = [
  {
    name: {
      en: "Reorganise",
      // TH-UNREVIEWED
      th: "จัดระเบียบ",
    },
    body: {
      en: "What you already have, so the market can read it. Same experience, made visible. This part is fast, and it is most of the gap.",
      // TH-UNREVIEWED
      th: "จัดสิ่งที่คุณมีอยู่แล้วให้ตลาดอ่านออก ประสบการณ์เดิม แต่มองเห็นได้ชัดขึ้น ขั้นนี้ทำได้เร็ว และเป็นช่องว่างส่วนใหญ่ที่เจอ",
    },
  },
  {
    name: {
      en: "Upskill",
      // TH-UNREVIEWED
      th: "เติมทักษะที่ยังขาด",
    },
    body: {
      en: "What you genuinely do not have. Language before anything else. This part is slow, which is the reason to start it early rather than when it becomes the thing in the way.",
      // TH-UNREVIEWED
      th: "เติมสิ่งที่ยังขาดอยู่จริง โดยเฉพาะภาษา ขั้นนี้ใช้เวลานาน จึงควรเริ่มตั้งแต่ต้น ไม่ใช่รอจนกลายเป็นอุปสรรค",
    },
  },
];

export const THRESHOLD_HEADING: Copy = {
  en: "Thresholds, not scores",
  // TH-UNREVIEWED
  th: "เกณฑ์ผ่าน ไม่ใช่แค่คะแนน",
};

export const THRESHOLD_BODY: readonly Copy[] = [
  {
    en: "A score tells you where you stand. A threshold tells you whether you are ready, and only the second one is something you can act on.",
    // TH-UNREVIEWED
    th: "คะแนนบอกว่าคุณอยู่ตรงไหน เกณฑ์ผ่านบอกว่าคุณพร้อมหรือยัง และมีเพียงอย่างหลังที่นำไปลงมือต่อได้",
  },
  {
    en: "So the method sets a bar for each dimension, and you are ready when you clear every bar rather than when the average looks respectable. The dimensions do not trade against each other: being good at the job does not give you the right to work there.",
    // TH-UNREVIEWED
    th: "วิธีนี้จึงตั้งเกณฑ์ไว้ในแต่ละด้าน คุณพร้อมเมื่อผ่านครบทุกด้าน ไม่ใช่เมื่อค่าเฉลี่ยดูดี เพราะแต่ละด้านทดแทนกันไม่ได้ ความเก่งในงานไม่ได้ทำให้คุณมีสิทธิ์ทำงานที่นั่น",
  },
];

export const GATES_HEADING: Copy = {
  en: "The four gates, in the order they are cleared",
  // TH-UNREVIEWED
  th: "สี่ด่าน เรียงตามลำดับที่ต้องผ่าน",
};

/**
 * The question each gate answers. Keyed by `DimensionKey` so the page can walk
 * `GATES` from `model.ts` and look each one up, which is what stops this list
 * and the scorer's order from ever disagreeing.
 *
 * The gate NAMES are not here. They are `dimension.*` in `copy.ts`.
 */
export const GATE_QUESTIONS: Record<DimensionKey, Copy> = {
  mobilityReadiness: {
    en: "Can you legally and practically be there?",
    // TH-UNREVIEWED
    th: "คุณไปอยู่ที่นั่นได้จริงหรือไม่ ทั้งในทางกฎหมายและในทางปฏิบัติ",
  },
  employability: {
    en: "Can you get interviews?",
    // TH-UNREVIEWED
    th: "คุณได้รับการติดต่อให้ไปสัมภาษณ์หรือไม่",
  },
  europeanMarketFit: {
    en: "Are you competitive against local candidates?",
    // TH-UNREVIEWED
    th: "คุณแข่งกับผู้สมัครในประเทศนั้นได้หรือไม่",
  },
  professionalCapability: {
    en: "Can you do the job?",
    // TH-UNREVIEWED
    th: "คุณทำงานนั้นได้หรือไม่",
  },
};

/**
 * The label beside each bar. The NUMBER is never written here: the page reads
 * it off `GATES` in `model.ts`, the same array the scorer walks, so a published
 * bar and an enforced bar cannot become two different numbers.
 */
export const GATE_BAR: Copy = {
  en: "clears at",
  // TH-UNREVIEWED
  th: "ผ่านที่",
};

export const GATES_ORDER: Copy = {
  en: "This order, and not score order. Someone with no route to work there is polishing a CV for a job they cannot legally take.",
  // TH-UNREVIEWED
  th: "เรียงตามลำดับนี้ ไม่ได้เรียงตามคะแนน คนที่ยังไม่มีทางไปทำงานที่นั่น กำลังขัดเกลา CV ให้กับงานที่ยังรับไม่ได้ตามกฎหมาย",
};

export const GATES_LOWEST: Copy = {
  en: "And the lowest gate you have not cleared is the only one that matters this month. The method does not hand you a five-item list.",
  // TH-UNREVIEWED
  th: "และด่านที่ต่ำที่สุดที่คุณยังไม่ผ่าน คือด่านเดียวที่สำคัญในเดือนนี้ วิธีนี้จะไม่ยื่นรายการห้าข้อให้คุณไปทำพร้อมกัน",
};

/**
 * Slot 6, and it comes before the ask at the foot. Two limits, and the second
 * one is `model.ts`'s own note made public: Financial Readiness is a fifth gate
 * in `10_Methodology.md` and is absent from `GATES` because its competency has
 * no survey input, so a bar would be checked against a permanently null score.
 * Flagged there, and flagged here rather than quietly dropped.
 */
export const LIMIT_HEADING: Copy = {
  en: "What it does not do",
  // TH-UNREVIEWED
  th: "สิ่งที่วิธีนี้ไม่ได้ทำ",
};

export const LIMIT_BODY: readonly Copy[] = [
  {
    en: "It measures what a form can reach. A bar you have not cleared is a sequence, not a refusal, and the method never scores something it cannot see.",
    // TH-UNREVIEWED
    th: "วิธีนี้วัดได้เท่าที่แบบสอบถามเข้าถึง ด่านที่ยังไม่ผ่านคือลำดับของสิ่งที่ต้องทำ ไม่ใช่คำปฏิเสธ และวิธีนี้จะไม่ให้คะแนนสิ่งที่มองไม่เห็น",
  },
  {
    en: "The method names a fifth gate, whether you can afford to get there and land. The check does not score it, because nothing it asks you can measure that honestly.",
    // TH-UNREVIEWED
    th: "วิธีนี้มีด่านที่ห้าคือเรื่องเงิน ว่าคุณมีทุนพอจะเดินทางไปและตั้งหลักที่นั่นหรือไม่ แบบประเมินนี้ไม่ให้คะแนนด่านนั้น เพราะคำถามที่ถามอยู่วัดเรื่องนี้อย่างตรงไปตรงมาไม่ได้",
  },
];

export const METHOD_CLOSE: Copy = {
  en: "That is the whole method. See where you stand against it.",
  // TH-UNREVIEWED
  th: "ทั้งหมดนี้คือวิธีที่เราใช้ ลองดูว่าตอนนี้คุณอยู่ตรงไหนเมื่อวัดด้วยวิธีนี้",
};

/**
 * The home page's second hero proof, and it is a link rather than a sentence.
 *
 * Slot 7 says a proof is a figure, a document or a worked example and never an
 * adjective. "Our method is published" unlinked is an adjective; the same words
 * pointing at the page are a document the reader can open, which is the whole
 * difference.
 */
export const METHOD_PROOF: Copy = {
  en: "The method is published, gate by gate",
  // TH-UNREVIEWED
  th: "เปิดวิธีประเมินให้ดูครบทุกด่าน",
};
