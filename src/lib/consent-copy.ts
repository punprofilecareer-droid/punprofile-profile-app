/**
 * PDPA consent copy, Thai-first (TASK-023, PRD FR-006).
 *
 * **Nothing here has been reviewed. Do not ship it to a real candidate.**
 * TASK-047 is a legal-review checkpoint and it has not happened. Every string
 * below is a placeholder written to define the shape of the consent flow, not
 * to be the consent itself. Thailand's PDPA requires consent that is specific,
 * informed and freely given, and an LLM's paraphrase of that is not a legal
 * instrument.
 *
 * Separate from `copy.ts` on purpose, even though the shape is identical and
 * both flow through the same worksheet. Mixing them would blur which strings
 * carry the review obligation, and that distinction is the reason this file
 * exists rather than a `consent.*` prefix in the main copy module.
 *
 * PRD FR-006: every contact field gets its OWN consent checkbox, and every
 * grant is timestamped separately on the lead record (`emailConsentAt`,
 * `phoneConsentAt`, `lineConsentAt`). One blanket tick does not satisfy this.
 */

import type { CopyEntry } from "./content/copy";

/** Flipped to true only after TASK-047 clears, and not by an agent. */
export const CONSENT_COPY_REVIEWED = false;

export const CONSENT_COPY = {
  "consent.email": {
    screen: "Contact gate, beside the email field",
    en: "Email is required so PunProfile can send you your assessment result.",
    th: "จำเป็นต้องระบุอีเมลเพื่อให้ PunProfile ส่งผลการประเมินให้คุณ",
  },
  "consent.phone": {
    screen: "Contact gate, beside the phone field",
    en: "I consent to PunProfile contacting me by phone about career coaching. (Optional)",
    th: "ยินยอมให้ PunProfile ติดต่อทางโทรศัพท์เกี่ยวกับบริการแนะแนวอาชีพ (ไม่บังคับ)",
  },
  "consent.line": {
    screen: "Contact gate, beside the LINE ID field",
    en: "I consent to PunProfile contacting me on LINE about career coaching. (Optional)",
    th: "ยินยอมให้ PunProfile ติดต่อทาง LINE เกี่ยวกับบริการแนะแนวอาชีพ (ไม่บังคับ)",
  },
  "consent.purpose": {
    screen: "Contact gate, above the fields: what the data is for",
    en: "PunProfile uses your required email address to send your assessment result. To request career-coaching follow-up, provide a phone number or LINE ID and select the corresponding optional consent. We retain your information for 12 months and do not share it with third parties. You may withdraw your phone or LINE consent at any time through [contact method TODO]. See our [Privacy Notice TODO] for details.",
    th: "PunProfile ใช้อีเมลที่จำเป็นต้องระบุเพื่อส่งผลการประเมินให้คุณ หากต้องการให้ติดต่อกลับเกี่ยวกับบริการแนะแนวอาชีพ โปรดระบุหมายเลขโทรศัพท์หรือ LINE ID และเลือกให้ความยินยอมสำหรับช่องทางนั้น เราจะเก็บข้อมูลไว้เป็นเวลา 12 เดือนและไม่เปิดเผยต่อบุคคลที่สาม คุณสามารถถอนความยินยอมสำหรับการติดต่อทางโทรศัพท์หรือ LINE ได้ทุกเมื่อผ่าน [ช่องทางติดต่อ TODO] ดูรายละเอียดเพิ่มเติมใน [ประกาศความเป็นส่วนตัว TODO]",
  },
} as const satisfies Record<string, CopyEntry>;

export type ConsentCopyKey = keyof typeof CONSENT_COPY;
