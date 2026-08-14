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

/**
 * **The Thai on this screen is Paul's own wording, 14/08/2026**, given after he
 * read the live page. Two edits were made to what he sent and both are visible
 * changes to his text rather than tidying:
 *
 * 1. `นับจากการติดต่อครั้งล่าสุด` was added back to the retention sentence. His
 *    version said twelve months with no basis, and `/privacy` says twelve
 *    months from last contact. A consent screen that promises something
 *    narrower than the policy it links to is the one inconsistency in here
 *    that could actually matter.
 * 2. The withdrawal address is `hi@agentsiam.com`. His message showed
 *    `punprofile@gmail.com` as the link text over a `mailto:hi@agentsiam.com`
 *    href, and the policy, the roadmap and the decision log all say
 *    hi@agentsiam.com. Treated as a paste artefact, flagged, not guessed at
 *    silently.
 *
 * Original note, from the pass his wording replaced. Rewritten the same day on
 * his read of the live screen:
 * "you have to review all the Thai translations because it is very stiff." The
 * facts did not move, the register did. Two substantive changes went with it:
 * "(Optional)" is gone from both channel consents, because the choice is
 * whether to give us the number at all and the tick is what makes holding it
 * lawful, so a filled field with an unticked box is an incomplete form rather
 * than a preference; and the email consent now reads as a consent rather than
 * as a statement about the field, which is what a checkbox beside it implies.
 *
 * **The Thai is a draft.** It has not been read back by Paul.
 */

/** TASK-047 cleared on Paul's sign-off, 14/08/2026. */
export const CONSENT_COPY_REVIEWED = true;

export const CONSENT_COPY = {
  "consent.email": {
    screen: "Contact gate, beside the email field",
    en: "I agree that PunProfile may email me my result and follow up about it.",
    th: "ยินยอมให้ PunProfile ส่งผลประเมินและติดต่อกลับทางอีเมล",
  },
  "consent.phone": {
    screen: "Contact gate, beside the phone field",
    en: "I agree that PunProfile may call me about career coaching.",
    th: "ยินยอมให้ PunProfile โทรหาคุณเรื่องบริการแนะแนวอาชีพ",
  },
  "consent.line": {
    screen: "Contact gate, beside the LINE ID field",
    en: "I agree that PunProfile may message me on LINE about career coaching.",
    th: "ยินยอมให้ PunProfile ทัก LINE หาคุณเรื่องบริการแนะแนวอาชีพ",
  },
  "consent.purpose": {
    screen: "Contact gate, above the fields: what the data is for",
    en: "We use your email to send your result. If you would like us to contact you by phone or on LINE, fill in that channel and tick the consent box. We keep your information for twelve months from the last time you were in touch, and we do not pass it to anyone else. Change your mind at any point and tell us at hi@agentsiam.com.",
    th: "เราจะใช้อีเมลของคุณเพื่อส่งผลประเมิน หากต้องการให้เราติดต่อทางโทรศัพท์หรือ LINE ให้กรอกช่องทางนั้นและติ๊กช่องยินยอม เราจะเก็บข้อมูลของคุณไว้สิบสองเดือนนับจากการติดต่อครั้งล่าสุด และจะไม่ส่งต่อข้อมูลให้บุคคลอื่น หากคุณเปลี่ยนใจ แจ้งเราได้ทุกเมื่อที่ hi@agentsiam.com",
  },
  /**
   * Rendered as a link to `/privacy`, which is why it is its own key: an
   * anchor buried inside `consent.purpose` would mean splitting a translated
   * sentence on a substring, and that breaks the moment the Thai word order
   * differs from the English.
   */
  "consent.privacyLink": {
    screen: "Contact gate, under the purpose paragraph",
    en: "Read our Privacy Policy",
    th: "อ่านนโยบายความเป็นส่วนตัว",
  },
} as const satisfies Record<string, CopyEntry>;

export type ConsentCopyKey = keyof typeof CONSENT_COPY;
