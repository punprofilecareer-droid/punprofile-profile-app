/**
 * PDPA consent copy, Thai-first (TASK-023, PRD FR-006).
 *
 * **Founder-signed off 14/08/2026 (TASK-047).** Paul settled the two open
 * decisions the review was waiting on: the withdrawal contact, and retention at
 * twelve months rolling from the candidate's last contact rather than twelve
 * months from submission. The purpose text was also corrected, because it
 * previously promised an emailed result and no email is sent by the system; the
 * result is delivered by a person. `CONSENT_COPY_REVIEWED` is true from that
 * sign-off.
 *
 * **The address that sign-off recorded was wrong, and was corrected 17/08/2026
 * to `punprofile.career@gmail.com`.** It had been an address on a domain
 * belonging to a different business of Paul's. See note 2 below: the sign-off
 * itself stands, only the string was wrong.
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
 * 2. ~~The withdrawal address is the other business's one.~~ **Wrong, and
 *    corrected 17/08/2026 on Paul's instruction: the address is
 *    `punprofile.career@gmail.com`.**
 *
 *    Kept rather than deleted, because the reasoning that produced the error is
 *    the useful part. His message showed a PunProfile gmail address as the link
 *    text over a `mailto:` href pointing at the other domain. That session
 *    called the gmail the paste artefact, on the grounds that the policy, the
 *    roadmap and the decision log all agreed on the other address. They did
 *    agree, and they were all wrong together: every one of them was a copy of
 *    the same original mistake, so the agreement was not evidence of anything.
 *    It was the link TEXT, the half he typed himself, that was right.
 *
 *    The old address belongs to a different business of Paul's. A PDPA
 *    withdrawal address is the one string in the product where being wrong
 *    routes a data subject's request to someone with no standing to act on it,
 *    which is why this is worth a dozen lines instead of a silent edit.
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
export const CONTACT_EMAIL = 'punprofile.career@gmail.com';

export const CONSENT_COPY = {
  "consent.statement": {
    screen: "Contact gate, beside the email field",
    en: "I agree that PunProfile may contact me about my result and career coaching by email, LINE or phone.",
    th: "ยินยอมให้ PunProfile ติดต่อกลับเกี่ยวกับผลประเมินและบริการแนะแนวอาชีพทางอีเมล LINE หรือ โทรศัพท์",
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
    en: "We use your email to send your result. If you would like us to contact you by phone or on LINE, fill in that channel and tick the consent box. We keep your information for twelve months from the last time you were in touch, and we do not pass it to anyone else. Change your mind at any point and tell us at punprofile.career@gmail.com.",
    th: "เราจะใช้อีเมลของคุณเพื่อส่งผลประเมิน หากต้องการให้เราติดต่อทางโทรศัพท์หรือ LINE ให้กรอกช่องทางนั้นและติ๊กช่องยินยอม เราจะเก็บข้อมูลของคุณไว้สิบสองเดือนนับจากการติดต่อครั้งล่าสุด และจะไม่ส่งต่อข้อมูลให้บุคคลอื่น หากคุณเปลี่ยนใจ แจ้งเราได้ทุกเมื่อที่ punprofile.career@gmail.com",
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

  /**
   * The optional second tick, and **what it asks for changed on 17/08/2026.**
   *
   * It used to say `รับอีเมลแจ้งตำแหน่งงานที่ตรงกับโปรไฟล์ของคุณ`, send me job
   * openings that match my profile. **Paul removed that: matched-job email
   * notifications are a paid feature.** `01_Project_Foundation.md` § The three
   * surfaces lists "Email Notification for jobs" under the app as
   * "free to start, paid for depth", and `AGENTS.md` puts it in Phase 4. Asking
   * for consent to send a thing nobody can receive yet, and which will cost money
   * when they can, is a promise the product cannot keep.
   *
   * It now asks for news and practical advice, in his words. That is a thing the
   * business can actually send today and does not commit it to a paid feature.
   *
   * **The tick is still a tick, and that is the part not to change.** It is a
   * second, separate, unticked box, and separate is the whole point. The
   * statement above it is `service`: we may contact you about your own result.
   * This one is `marketing`. A single tick covering both would make the marketing
   * consent unprovable, which is the failure the event log exists to prevent, and
   * PDPA wants marketing consent freely given, specific and affirmative.
   *
   * Three constraints, all still met:
   *
   * 1. **Unticked by default, and optional.** `ContactGate` holds it unticked and
   *    refusing it blocks nothing.
   * 2. **Name what gets sent.** `ข่าวสารและคำแนะนำ` is concrete enough to be the
   *    reason someone says yes, and unlike the wording it replaces it is true.
   * 3. **Say they can stop.** `แจ้งเราได้ทุกเมื่อ` is his own, from
   *    `consent.purpose` above, and the withdrawal mechanism exists.
   *
   * `ปั้นโปรไฟล์` takes the Thai form here rather than the wordmark: LR-01 says
   * lead with the Thai where the brand opens a Thai clause, and this is the one
   * consent string where the brand is the subject rather than the controller
   * being named in a legal formula.
   *
   * Paul's second line is `consent.marketingNote` below, placed under the tick
   * rather than inside its label, for the reason recorded there.
   */
  "consent.marketing": {
    screen: "Contact gate, a separate optional tick under the consent statement",
    en: "Get the latest news and practical advice from PunProfile, delivered straight to your inbox. Tell us any time if you want it to stop.",
    // Paul's wording, 17/08/2026, with his own `แจ้งเราได้ทุกเมื่อ` kept on the
    // end: it is the third constraint above and it was in the string this
    // replaces.
    th: "รับข่าวสารและคำแนะนำดี ๆ จากปั้นโปรไฟล์ ส่งตรงถึงอีเมลของคุณ หากไม่อยากรับต่อ แจ้งเราได้ทุกเมื่อ",
  },

  /**
   * The note under the marketing tick, 17/08/2026. Paul's second line.
   *
   * **It is supporting text and not the tick's label, and that distinction is
   * the whole reason it is a separate key.** He wrote it as "entering your email
   * is taken as acceptance", which is implied consent. The box above it is
   * explicit consent: unticked, optional, affirmative, timestamped in the event
   * log. Putting implied wording inside an explicit tick's label would leave the
   * screen claiming both at once, and the weaker of the two is the one a
   * regulator would read.
   *
   * So the tick still carries the consent and this sits beneath it as a notice,
   * which is what a terms-and-privacy line is everywhere else on the web.
   *
   * **Terms of Service is named and not linked, because there is no such page.**
   * `/privacy` exists; `/terms` does not. `ContactGate` links the privacy notice
   * here and leaves the terms as words until a page exists, which is the honest
   * shape: naming a document a reader cannot open is worse than not naming it,
   * and inventing one would be fabricating our own terms. When `/terms` ships,
   * link it here and delete this paragraph.
   */
  "consent.marketingNote": {
    screen: "Contact gate, directly under the optional marketing tick",
    en: "By entering your email, you agree to our Terms of Service and Privacy Policy.",
    // Paul's wording, 17/08/2026, unchanged.
    th: "การกรอกอีเมลถือว่าคุณยอมรับข้อกำหนดการใช้บริการและนโยบายความเป็นส่วนตัวของเรา",
  },
} as const satisfies Record<string, CopyEntry>;

/**
 * **True since 16/08/2026: Paul read the Thai and passed it.**
 *
 * The gate existed because the string above was machine-written and said so.
 * It was recomposed through the `thai-composer` skill against his own
 * `consent.purpose`, measured against his app copy, put in front of him and
 * passed.
 *
 * It is no longer one flag over one tick. Three surfaces read it, and they go
 * on and off together on purpose:
 *
 * - The marketing tick at the contact step, in `ContactGate`.
 * - The marketing section of the privacy notice, in `privacy.ts`.
 * - The blog's email capture, in `SignupForm`.
 *
 * One fact underneath: whether this business asks for marketing consent. Two
 * flags would allow the state that matters, a form collecting consent for a
 * purpose the published notice does not mention, and PDPA wants the notice
 * before the collection rather than after it.
 *
 * **Turning this off again is a real rollback and not a tidy-up.** Consent
 * already granted stays granted, because a live opt-in is a permission somebody
 * gave and hiding the form does not withdraw it. What stops is the asking.
 */
export const MARKETING_CONSENT_COPY_REVIEWED = true;

export type ConsentCopyKey = keyof typeof CONSENT_COPY;
