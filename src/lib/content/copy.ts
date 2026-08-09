/**
 * Every candidate-facing string in the app, in both languages.
 *
 * Same shape as `questions.ts`: `{ en, th }` side by side rather than two
 * per-locale dictionaries, so a reviewer sees the source and the translation
 * together and cannot approve one without the other.
 *
 * **An empty `th` means "not yet supplied", not "same in both".** It falls back
 * to English at render, which is what lets Thai arrive key by key instead of in
 * one pass. `scripts/verify-copy.ts` counts and lists the empties, so what is
 * left to translate is a command rather than a hunt.
 *
 * Do not add admin, login or coach-report strings here. Those surfaces are
 * English on purpose; only the founder reads them.
 *
 * Language rules live in `03_Content_System.md` → Language Guidelines, which
 * states that they cover the app and not only posts, and names the three
 * post-only rules that do not transfer. Read them there rather than trusting a
 * summary, because they change.
 *
 * The founder fills these in through the worksheet, not by editing this file:
 *   npx tsx scripts/export-copy-worksheet.ts   # code  -> worksheet
 *   npx tsx scripts/import-copy-worksheet.ts   # worksheet -> code
 */

export interface Copy {
  en: string;
  /** Empty means "not yet supplied" and falls back to `en`. */
  th: string;
}

/**
 * `screen` is carried through to the worksheet so the founder knows where a
 * string appears without reading the code.
 */
export interface CopyEntry extends Copy {
  screen: string;
}

export const COPY = {
  // ------------------------------------------------------------------ shell
  "nav.brand": {
    screen: "Header, every screen",
    en: "PunProfile",
    // The wordmark is a fixed asset and never translated or transliterated.
    th: "PunProfile",
  },
  "nav.language": {
    screen: "Header, the TH/EN switch",
    en: "Language",
    th: "ภาษา",
  },
  "footer.brand": {
    screen: "Footer, every screen",
    en: "PunProfile Career Coaching",
    th: "PunProfile Career Coaching",
  },

  // ---------------------------------------------------------------- landing
  "landing.headline": {
    screen: "Landing",
    en: "See where you actually stand for Europe.",
    th: "รู้ให้ชัดว่าตอนนี้คุณอยู่ตรงไหนของเส้นทางไปทำงานยุโรป",
  },
  "landing.subhead": {
    screen: "Landing",
    en: "An honest first read on your EU job-market readiness, in a few minutes, on your phone.",
    th: "ประเมินความพร้อมสำหรับตลาดงานยุโรปแบบตรงไปตรงมา ใช้เวลาไม่กี่นาที ทำบนมือถือได้เลย",
  },
  "landing.cta": {
    screen: "Landing, the main button",
    en: "Check where you stand",
    th: "เช็กความพร้อมของคุณ",
  },
  "landing.reassurance": {
    screen: "Landing, under the button",
    en: "Under 2 minutes. No sign-up before you see your first result.",
    th: "ใช้เวลาไม่ถึง 2 นาที ไม่ต้องสมัครสมาชิกก่อนดูผลลัพธ์",
  },

  // ------------------------------------------------------------- assessment
  "assess.starting": {
    screen: "Assessment, while the session is created",
    en: "Starting...",
    th: "กำลังเริ่ม...",
  },
  "assess.back": {
    screen: "Assessment, the link back to the previous question",
    en: "Back",
    th: "ย้อนกลับ",
  },
  "assess.continue": {
    screen: "Assessment, the button that moves to the next question",
    en: "Continue",
    th: "ถัดไป",
  },
  "assess.progress": {
    screen: "Assessment, the step counter. {step} and {total} are substituted",
    en: "{step} / {total}",
    th: "{step} / {total}",
  },

  // ------------------------------------------------------------ teaser chart
  "teaser.headline": {
    screen: "Teaser, after the last question",
    en: "Here's your first read",
    th: "นี่คือผลประเมินเบื้องต้นของคุณ",
  },
  "teaser.selfReported": {
    screen: "Teaser, under the headline. FR-007 requires this to be unmissable",
    en: "Self-reported and preliminary, from your own answers just now.",
    th: "ผลนี้มาจากคำตอบที่คุณประเมินตัวเอง จึงเป็นภาพเบื้องต้น ไม่ใช่คำตัดสิน",
  },
  "teaser.hollowMarkers": {
    screen: "Teaser, under the chart",
    en: 'Hollow markers mean "not measured yet", never zero.',
    th: "จุดที่ยังไม่ทึบ หมายถึงยังไม่ได้วัด ไม่ได้แปลว่าได้ศูนย์",
  },
  "teaser.locked": {
    screen: "Teaser, the card below the chart, before the gate is opened",
    en: "The full picture, with what to work on first, opens once you tell us where to send it.",
    th: "ภาพเต็มพร้อมสิ่งที่ควรเริ่มทำก่อน จะเปิดให้ดูเมื่อคุณบอกช่องทางที่จะส่งให้",
  },
  "teaser.unlock": {
    screen: "Teaser, the button that opens the contact gate",
    en: "See my full result",
    th: "ดูผลแบบเต็มของฉัน",
  },
  "teaser.captured": {
    screen: "Teaser, after contact details are given. The full result screen is TASK-028",
    en: "Thanks. Your details are saved, and the full result lands here shortly.",
    th: "ขอบคุณ เราบันทึกข้อมูลของคุณแล้ว ผลแบบเต็มจะขึ้นตรงนี้เร็วๆ นี้",
  },
  "teaser.revise": {
    screen: "Teaser, the link back to the last question",
    en: "Go back and change an answer",
    th: "ย้อนกลับไปแก้คำตอบ",
  },

  // --------------------------------------------------------- chart dimensions
  // Candidate-facing labels only. `model.ts` keeps its own English copies for
  // the coach report, which is a different audience, not a second source of
  // truth for this one.
  "dimension.professionalCapability": {
    screen: "Spider chart axis",
    en: "Professional Capability",
    th: "ความสามารถในสายอาชีพ",
  },
  "dimension.employability": {
    screen: "Spider chart axis",
    en: "Employability",
    th: "ความพร้อมสมัครงาน",
  },
  "dimension.mobilityReadiness": {
    screen: "Spider chart axis",
    en: "Mobility Readiness",
    th: "ความพร้อมย้ายประเทศ",
  },
  "dimension.europeanMarketFit": {
    screen: "Spider chart axis",
    en: "European Market Fit",
    th: "ความเหมาะกับตลาดยุโรป",
  },

  // ------------------------------------------------------------ contact gate
  // FR-005. Full name, email, and at least one of LINE ID or phone.
  "gate.heading": {
    screen: "Contact gate, the heading",
    en: "See your full result",
    th: "ดูผลแบบเต็มของคุณ",
  },
  "gate.body": {
    screen: "Contact gate, under the heading. Says what they get, not what we want",
    en: "Tell us where to send it and we'll open the full picture, with what to work on first.",
    th: "บอกช่องทางที่จะส่งให้คุณ แล้วเราจะเปิดผลแบบเต็มพร้อมสิ่งที่ควรเริ่มทำก่อน",
  },
  "gate.fullName": {
    screen: "Contact gate, name field label",
    en: "Full name",
    th: "ชื่อ-นามสกุล",
  },
  "gate.email": {
    screen: "Contact gate, email field label",
    en: "Email",
    th: "อีเมล",
  },
  "gate.channelHint": {
    screen: "Contact gate, above the LINE and phone fields. Explains why one is required",
    en: "And one way we can actually reach you. Choose whichever you check most.",
    th: "และอีกหนึ่งช่องทางที่ติดต่อคุณได้จริง เลือกช่องทางที่คุณเช็กบ่อยที่สุด",
  },
  "gate.lineId": {
    screen: "Contact gate, LINE ID field label",
    en: "LINE ID",
    th: "LINE ID",
  },
  "gate.phone": {
    screen: "Contact gate, phone field label",
    en: "Phone number",
    th: "เบอร์โทร",
  },
  "gate.submit": {
    screen: "Contact gate, the submit button",
    en: "Open my full result",
    th: "เปิดผลแบบเต็ม",
  },
  "gate.working": {
    screen: "Contact gate, submit button while the write is in flight",
    en: "Working...",
    th: "กำลังบันทึก...",
  },

  // Errors. Thrown server-side as stable codes and resolved here, so a rule
  // enforced on the server can still speak the candidate's language.
  "gate.error.name_required": {
    screen: "Contact gate, when the name is empty",
    en: "Please enter your name.",
    th: "กรุณากรอกชื่อของคุณ",
  },
  "gate.error.email_invalid": {
    screen: "Contact gate, when the email is missing or malformed",
    en: "That email doesn't look right. Please check it.",
    th: "อีเมลนี้ดูไม่ถูกต้อง ลองตรวจสอบอีกครั้ง",
  },
  "gate.error.channel_required": {
    screen: "Contact gate, when neither LINE nor phone was given",
    en: "Please add a LINE ID or a phone number.",
    th: "กรุณากรอก LINE ID หรือเบอร์โทรอย่างน้อยหนึ่งอย่าง",
  },
  "gate.error.consent_email": {
    screen: "Contact gate, when email consent is unticked",
    en: "We need your permission before we can send anything.",
    th: "เราต้องได้รับอนุญาตจากคุณก่อนถึงจะส่งอะไรไปได้",
  },
  "gate.error.consent_phone": {
    screen: "Contact gate, when a phone was given without consent",
    en: "Please confirm we may contact you by phone, or clear the field.",
    th: "กรุณายืนยันว่าเราติดต่อทางโทรศัพท์ได้ หรือลบเบอร์ออก",
  },
  "gate.error.consent_line": {
    screen: "Contact gate, when a LINE ID was given without consent",
    en: "Please confirm we may contact you on LINE, or clear the field.",
    th: "กรุณายืนยันว่าเราติดต่อทาง LINE ได้ หรือลบ LINE ID ออก",
  },
  "gate.error.unknown": {
    screen: "Contact gate, any failure with no specific cause. Network, mostly",
    en: "That didn't go through. Please try again.",
    th: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  },

  // -------------------------------------------------------- competency names
  // The 15 scoreable competencies. `model.ts` names them in English for the
  // coach report; these are the candidate-facing names, used wherever one is
  // shown by name ("your strongest area is X"). Only scoreable items are here:
  // a coach-tier competency is never named to a candidate, because it has no
  // score to show.
  //
  // The "(self-declared)" suffix `model.ts` carries is deliberately dropped:
  // the whole result page already says the assessment is self-reported, and
  // repeating it inside every label reads as hedging rather than honesty.
  "item.experienceDepth": {
    screen: "Named when this is the candidate's strongest area",
    en: "Experience Depth",
    th: "ความลึกของประสบการณ์",
  },
  "item.learningInvestment": {
    screen: "Named when this is the candidate's strongest area",
    en: "Learning Investment",
    th: "การลงทุนกับการเรียนรู้",
  },
  "item.searchFollowThrough": {
    screen: "Named when this is the candidate's strongest area",
    en: "Search Follow-through",
    th: "ความต่อเนื่องในการหางาน",
  },
  "item.aiDigitalFluency": {
    screen: "Named when this is the candidate's strongest area",
    en: "AI & Digital Fluency",
    th: "ความคล่องด้าน AI และเครื่องมือดิจิทัล",
  },
  "item.cvStatus": {
    screen: "Named when this is the candidate's strongest area",
    en: "CV Status",
    th: "ความพร้อมของ CV",
  },
  "item.linkedinStatus": {
    screen: "Named when this is the candidate's strongest area",
    en: "LinkedIn Status",
    th: "ความพร้อมของ LinkedIn",
  },
  "item.portfolioEvidence": {
    screen: "Named when this is the candidate's strongest area",
    en: "Portfolio Evidence",
    th: "ผลงานที่แสดงให้ดูได้",
  },
  "item.applicationActivity": {
    screen: "Named when this is the candidate's strongest area",
    en: "Application Activity",
    th: "ความเคลื่อนไหวในการสมัครงาน",
  },
  "item.visaReadiness": {
    screen: "Named when this is the candidate's strongest area",
    en: "Visa Readiness",
    th: "ความพร้อมเรื่องวีซ่า",
  },
  "item.languageReadiness": {
    screen: "Named when this is the candidate's strongest area",
    en: "Language Readiness",
    th: "ความพร้อมด้านภาษา",
  },
  "item.familyReadiness": {
    screen: "Named when this is the candidate's strongest area",
    en: "Family Readiness",
    th: "ความพร้อมของครอบครัว",
  },
  "item.relocationTimeline": {
    screen: "Named when this is the candidate's strongest area",
    en: "Relocation Timeline",
    th: "ช่วงเวลาที่พร้อมย้าย",
  },
  "item.businessEnglish": {
    screen: "Named when this is the candidate's strongest area",
    en: "Business English",
    th: "ภาษาอังกฤษสำหรับการทำงาน",
  },
  "item.targetClarity": {
    screen: "Named when this is the candidate's strongest area",
    en: "Target Clarity",
    th: "ความชัดเจนของเป้าหมาย",
  },
  "item.salaryStated": {
    screen: "Named when this is the candidate's strongest area",
    en: "Salary Expectation Stated",
    th: "การระบุเงินเดือนที่คาดหวัง",
  },
} as const satisfies Record<string, CopyEntry>;

export type CopyKey = keyof typeof COPY;
