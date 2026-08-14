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
 * **One consent, not three, 14/08/2026 (Paul).** "Why are you duplicating it?
 * It's bad for customer experience." He is right about the experience: a
 * candidate who filled in both channels met three separate boxes saying almost
 * the same sentence.
 *
 * What had to survive the collapse is granularity, which is a PDPA property
 * and not a UI one. It survives because **the field is the granular control,
 * not the checkbox**. A candidate consents to a channel by giving us that
 * channel; leaving LINE blank is a refusal of LINE, and no wording is needed
 * for it. So a single statement names the channels and the one tick still
 * writes a separate timestamp per channel in `convex/leads.ts`, only ever for
 * a channel the candidate actually filled in. The audit trail is unchanged:
 * what was consented to, per channel, and when.
 *
 * The statement interpolated only the filled channels at first. Paul replaced
 * it on 14/08/2026 with all three named outright. It reads better and it stays
 * accurate, because naming a channel in the sentence grants nothing on its
 * own: an empty phone field sends `undefined` and no phone timestamp is ever
 * written.
 *
 * The thing genuinely given up: a candidate can no longer give us a phone
 * number while withholding permission to use it. That combination existed on
 * the old screen and, on the evidence of the form it replaced, was never a
 * thing anyone wanted; someone who does not want a call does not type a number.
 *
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

/**
 * The one address PunProfile publishes, exported 14/08/2026 for the contact
 * page. It lives here rather than in a generic constants file because this is
 * the document that settled it: it is the PDPA withdrawal contact first, and a
 * general enquiries address second. Anything that changes it has to change the
 * consent copy and the privacy notice in the same breath, which is easier to
 * remember when they share a file.
 *
 * The copy strings below still spell it out inline. That is deliberate: they
 * are reviewed as sentences, and a template hole in a consent clause is a
 * sentence nobody actually read.
 */
export const CONTACT_EMAIL = 'hi@agentsiam.com';

export const CONSENT_COPY = {
  "consent.statement": {
    screen: "Contact gate, beside the email field",
    en: "I agree that PunProfile may contact me about my result and career coaching by email, LINE or phone.",
    th: "ยินยอมให้ PunProfile ติดต่อกลับเกี่ยวกับผลประเมินและบริการแนะแนวอาชีพทางอีเมล ไลน์ หรือ โทรศัพท์",
  },
  "consent.channel.phone": {
    screen: "Contact gate, beside the phone field",
    en: "phone",
    th: "โทรศัพท์",
  },
  "consent.channel.line": {
    screen: "Contact gate, beside the LINE ID field",
    en: "LINE",
    th: "LINE",
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
  "consent.channel.email": {
    screen: "Contact gate, inside the consent statement",
    en: "email",
    th: "อีเมล",
  },

  /**
   * The joiner between channel names. A separate entry because Thai does not
   * take a comma-and list the way English does, and hardcoding " and " here
   * would produce "อีเมล and LINE" on the screen that matters most.
   */
  "consent.channelJoin": {
    screen: "Contact gate, between channel names",
    en: " and ",
    th: " และ ",
  },

  "consent.privacyLink": {
    screen: "Contact gate, under the purpose paragraph",
    en: "Read our Privacy Policy",
    th: "อ่านนโยบายความเป็นส่วนตัว",
  },
} as const satisfies Record<string, CopyEntry>;

export type ConsentCopyKey = keyof typeof CONSENT_COPY;
