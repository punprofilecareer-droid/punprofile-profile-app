/**
 * PDPA consent copy, Thai-first (TASK-023, PRD FR-006).
 *
 * **Founder-signed off 14/08/2026 (TASK-047).** Paul settled the two open
 * decisions the review was waiting on: the withdrawal contact is
 * `hi@agentsiam.com`, and retention is twelve months rolling from the
 * candidate's last contact rather than twelve months from submission. The
 * purpose text was also corrected, because it previously promised an emailed
 * result and no email is sent by the system; the result is delivered by a
 * person. `CONSENT_COPY_REVIEWED` is true from that sign-off.
 *
 * This is a founder sign-off, not an external legal opinion. Thailand's PDPA
 * requires consent that is specific, informed and freely given. If a lawyer
 * reviews this later, their wording replaces these strings wholesale rather
 * than being merged into them.
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

/** TASK-047 cleared on Paul's sign-off, 14/08/2026. */
export const CONSENT_COPY_REVIEWED = true;

export const CONSENT_COPY = {
  "consent.email": {
    screen: "Contact gate, beside the email field",
    en: "Email is required so PunProfile can send you your result and follow up about it.",
    th: "จำเป็นต้องระบุอีเมลเพื่อให้ PunProfile ส่งผลการประเมินและติดต่อกลับเกี่ยวกับผลนั้น",
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
    en: "PunProfile uses your required email address to send you your assessment result and to follow up about it. To be contacted about career coaching on another channel, provide a phone number or LINE ID and select the corresponding optional consent. We keep your information for twelve months from your last contact with us and do not share it with third parties. You may withdraw your phone or LINE consent at any time by emailing hi@agentsiam.com.",
    th: "PunProfile ใช้อีเมลที่จำเป็นต้องระบุเพื่อส่งผลการประเมินให้คุณและติดต่อกลับเกี่ยวกับผลนั้น หากต้องการให้ติดต่อกลับเกี่ยวกับบริการแนะแนวอาชีพทางช่องทางอื่น โปรดระบุหมายเลขโทรศัพท์หรือ LINE ID และเลือกให้ความยินยอมสำหรับช่องทางนั้น เราจะเก็บข้อมูลไว้สิบสองเดือนนับจากการติดต่อครั้งล่าสุดของคุณ และไม่เปิดเผยต่อบุคคลที่สาม คุณสามารถถอนความยินยอมสำหรับการติดต่อทางโทรศัพท์หรือ LINE ได้ทุกเมื่อโดยส่งอีเมลถึง hi@agentsiam.com",
  },
  /**
   * Rendered as a link to `/privacy`, which is why it is its own key: an
   * anchor buried inside `consent.purpose` would mean splitting a translated
   * sentence on a substring, and that breaks the moment the Thai word order
   * differs from the English.
   */
  "consent.privacyLink": {
    screen: "Contact gate, under the purpose paragraph",
    en: "Read our Privacy Notice",
    th: "อ่านประกาศความเป็นส่วนตัว",
  },
} as const satisfies Record<string, CopyEntry>;

export type ConsentCopyKey = keyof typeof CONSENT_COPY;
