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
    en: "See where you stand on your path to working in Europe.",
    th: "เช็กให้ชัดว่าตอนนี้คุณอยู่ขั้นตอนไหนบนเส้นทางสู่การทำงานในยุโรป",
  },
  "landing.subhead": {
    screen: "Landing",
    en: "An honest first read on your EU job-market readiness, in a few minutes, on your phone.",
    th: "ดูผลประเมินเบื้องต้นแบบตรงไปตรงมาว่า คุณพร้อมแค่ไหนสำหรับตลาดงานยุโรป ใช้เวลาเพียงไม่กี่นาทีบนมือถือ",
  },
  "landing.cta": {
    screen: "Landing, the main button",
    en: "Check where you stand",
    th: "เช็กว่าคุณพร้อมแค่ไหน",
  },
  "landing.reassurance": {
    screen: "Landing, under the button",
    en: "Under 2 minutes. No sign-up before you see your first result.",
    th: "ใช้เวลาไม่ถึง 2 นาที ดูผลเบื้องต้นได้เลยโดยยังไม่ต้องสมัครสมาชิก",
  },

  // ------------------------------------------------------------- assessment
  "assess.starting": {
    screen: "Assessment, while the session is created",
    en: "Starting...",
    th: "กำลังเตรียมแบบประเมิน...",
  },
  "assess.busy": {
    screen: "Assessment, when the session could not be created. Rate limit or network",
    en: "We couldn't start your assessment just now. Please try again in a moment.",
    th: "ตอนนี้ยังเริ่มแบบประเมินให้คุณไม่ได้ กรุณาลองใหม่อีกครั้งในอีกสักครู่",
  },
  "assess.retry": {
    screen: "Assessment, the retry button beside that message",
    en: "Try again",
    th: "ลองใหม่อีกครั้ง",
  },
  "assess.back": {
    screen: "Assessment, the link back to the previous question",
    en: "Back",
    th: "ย้อนกลับ",
  },
  "assess.continue": {
    screen: "Assessment, the button that moves to the next question",
    en: "Continue",
    th: "ไปต่อ",
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
    th: "ผลประเมินเบื้องต้นของคุณ",
  },
  "teaser.selfReported": {
    screen: "Teaser, under the headline. FR-007 requires this to be unmissable",
    en: "Self-reported and preliminary, from your own answers just now.",
    th: "ผลนี้เป็นการประเมินเบื้องต้นจากคำตอบของคุณ",
  },
  "teaser.hollowMarkers": {
    screen: "Teaser, under the chart",
    en: "Hollow markers mean \"not measured yet\", never zero.",
    th: "จุดวงกลมที่ยังว่างอยู่แปลว่า “ยังไม่ได้รับการประเมิน”",
  },
  "teaser.locked": {
    screen: "Teaser, the card below the chart, before the gate is opened",
    en: "The full picture, with what to work on first, opens once you tell us where to send it.",
    th: "ดูภาพรวมทั้งหมด พร้อมสิ่งที่ควรเริ่มทำก่อน เพียงบอกเราว่าจะให้ส่งผลไปที่ไหน",
  },
  "teaser.unlock": {
    screen: "Teaser, the button that opens the contact gate",
    en: "See my full result",
    th: "ดูผลประเมินฉบับเต็ม",
  },
  "teaser.captured": {
    screen: "Teaser, after contact details are given. The full result screen is TASK-028",
    en: "Thanks. Your details are saved, and the full result lands here shortly.",
    th: "ขอบคุณ ข้อมูลของคุณถูกบันทึกข้อเรียบร้อยแล้ว ผลลัพธ์จะแสดงในอีกสักครู่",
  },
  "teaser.revise": {
    screen: "Teaser, the link back to the last question",
    en: "Go back and change an answer",
    th: "กลับไปแก้ไขคำตอบ",
  },

  // --------------------------------------------------------- chart dimensions
  // Candidate-facing labels only. `model.ts` keeps its own English copies for
  // the coach report, which is a different audience, not a second source of
  // truth for this one.
  "dimension.professionalCapability": {
    screen: "Spider chart axis",
    en: "Professional Capability",
    th: "ความสามารถทางวิชาชีพ",
  },
  "dimension.employability": {
    screen: "Spider chart axis",
    en: "Employability",
    th: "ความพร้อมในการสมัครงาน",
  },
  "dimension.mobilityReadiness": {
    screen: "Spider chart axis",
    en: "Mobility Readiness",
    th: "ความพร้อมในการย้ายประเทศ",
  },
  "dimension.europeanMarketFit": {
    screen: "Spider chart axis",
    en: "European Market Fit",
    th: "ความเหมาะสมกับตลาดงานยุโรป",
  },

  // ------------------------------------------------------------ contact gate
  // FR-005. Full name, email, and at least one of LINE ID or phone.
  "gate.heading": {
    screen: "Contact gate, the heading",
    en: "See your full result",
    th: "ดูผลประเมินฉบับเต็ม",
  },
  "gate.body": {
    screen: "Contact gate, under the heading. Says what they get, not what we want",
    en: "Tell us where to send it and we'll open the full picture, with what to work on first.",
    th: "เลือกช่องทางรับผล แล้วดูผลประเมินฉบับเต็ม พร้อมคำแนะนำว่าควรเริ่มพัฒนาจากจุดไหนก่อน",
  },
  "gate.fullName": {
    screen: "Contact gate, name field label",
    en: "Full name",
    th: "ชื่อ-สกุล",
  },
  "gate.email": {
    screen: "Contact gate, email field label",
    en: "Email",
    th: "อีเมล",
  },
  "gate.channelHint": {
    screen: "Contact gate, above the LINE and phone fields. Explains why one is required",
    en: "And one way we can actually reach you. Choose whichever you check most.",
    th: "ระบุเบอร์โทรหรือ LINE ID อย่างน้อยหนึ่งช่องทาง เพื่อให้เราติดต่อคุณได้ เลือกช่องทางที่คุณใช้บ่อยที่สุด",
  },
  "gate.lineId": {
    screen: "Contact gate, LINE ID field label",
    en: "LINE ID",
    th: "LINE ไอดี",
  },
  "gate.phone": {
    screen: "Contact gate, phone field label",
    en: "Phone number",
    th: "เบอร์โทร",
  },
  "gate.submit": {
    screen: "Contact gate, the submit button",
    en: "Open my full result",
    th: "เปิดผลประเมินฉบับเต็ม",
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
    th: "กรุณากรอกชื่อและนามสกุล",
  },
  "gate.error.email_invalid": {
    screen: "Contact gate, when the email is missing or malformed",
    en: "That email doesn't look right. Please check it.",
    th: "อีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
  },
  "gate.error.channel_required": {
    screen: "Contact gate, when neither LINE nor phone was given",
    en: "Please add a LINE ID or a phone number.",
    th: "กรุณาระบุ LINE ID หรือเบอร์โทรศัพท์อย่างใดอย่างหนึ่ง",
  },
  "gate.error.consent_email": {
    screen: "Contact gate, when email consent is unticked",
    en: "We need your permission before we can send anything.",
    th: "กรุณายินยอมให้เราติดต่อคุณทางอีเมลก่อน",
  },
  "gate.error.consent_phone": {
    screen: "Contact gate, when a phone was given without consent",
    en: "Please confirm we may contact you by phone, or clear the field.",
    th: "กรุณายืนยันว่าเราสามารถติดต่อคุณทางโทรศัพท์ได้ หรือลบเบอร์โทรศัพท์ออก",
  },
  "gate.error.consent_line": {
    screen: "Contact gate, when a LINE ID was given without consent",
    en: "Please confirm we may contact you on LINE, or clear the field.",
    th: "กรุณายืนยันว่าเราสามารถติดต่อคุณทาง LINE ได้ หรือลบ LINE ID ออก",
  },
  "gate.error.unknown": {
    screen: "Contact gate, any failure with no specific cause. Network, mostly",
    en: "That didn't go through. Please try again.",
    th: "ส่งข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง",
  },

  // ------------------------------------------------------- full result screen
  "result.headline": {
    screen: "Full result, the heading",
    en: "Your full read",
    th: "ผลประเมินฉบับเต็มของคุณ",
  },
  "result.strengthsHeading": {
    screen: "Full result, above the strongest areas. Leads with what they have",
    en: "What you already have",
    th: "จุดที่คุณมีอยู่แล้ว",
  },
  "result.stepsHeading": {
    screen: "Full result, above the journey checklist",
    en: "Where you are on the path",
    th: "ตอนนี้คุณอยู่ตรงไหนของเส้นทาง",
  },
  "result.reachableHeading": {
    screen: "Full result, above the 'doing X moves Y' items",
    en: "What moves if you act",
    th: "สิ่งที่จะขยับ ถ้าคุณลงมือทำ",
  },
  "result.reachableLine": {
    screen: "Full result, one uplift. {area}, {from} and {to} are substituted",
    en: "{area}: {from} to {to}",
    th: "{area}: {from} เป็น {to}",
  },
  "result.startWith": {
    screen: "Full result, fallback next step when no specific action matches. {area} substituted",
    en: "Start with {area}.",
    th: "เริ่มจาก {area}",
  },
  "result.measured": {
    screen: "Full result, the coverage line. {count}, {total} and {more} are substituted",
    en: "Your answers measure {count} of {total} areas. A 30-minute conversation can measure {more} more, the parts no form can see.",
    th: "คำตอบของคุณประเมินได้ {count} จาก {total} ด้าน การพูดคุย 30 นาทีจะประเมินเพิ่มได้อีก {more} ด้าน ซึ่งเป็นส่วนที่แบบฟอร์มมองไม่เห็น",
  },
  "result.caveat": {
    screen: "Full result, the persistent honesty line. FR-007 requires it to be unmissable",
    en: "Everything here is self-reported and preliminary. It is a first read of where you stand, not a verdict.",
    th: "ทั้งหมดนี้เป็นผลประเมินเบื้องต้นจากข้อมูลที่คุณให้มา เป็นภาพแรกว่าคุณอยู่ตรงไหน ไม่ใช่คำตัดสิน",
  },

  // The journey checklist. Statuses are computed; these are the step names.
  "step.unanswered": {
    screen: "Full result, on a step nothing has been answered for yet",
    en: "Two quick answers and this fills in",
    th: "ตอบเพิ่มอีกไม่กี่ข้อ ส่วนนี้ก็จะแสดงผล",
  },
  "step.targetClarity": {
    screen: "Full result, journey checklist step",
    en: "Pick one target country and role",
    th: "เลือกประเทศและตำแหน่งเป้าหมายให้ชัด",
  },
  "step.cvStatus": {
    screen: "Full result, journey checklist step",
    en: "Get your CV Europe-ready",
    th: "ปรับ CV ให้พร้อมสำหรับตลาดยุโรป",
  },
  "step.linkedinStatus": {
    screen: "Full result, journey checklist step",
    en: "Make LinkedIn active and findable",
    th: "ทำให้ LinkedIn เคลื่อนไหวและถูกค้นเจอ",
  },
  "step.visaReadiness": {
    screen: "Full result, journey checklist step",
    en: "Know your visa route by name",
    th: "รู้ว่าจะใช้วีซ่าประเภทไหน",
  },
  "step.languageReadiness": {
    screen: "Full result, journey checklist step",
    en: "Keep your English moving",
    th: "ฝึกภาษาอังกฤษอย่างต่อเนื่อง",
  },
  "step.portfolioEvidence": {
    screen: "Full result, journey checklist step",
    en: "Show some work you are proud of",
    th: "มีผลงานที่แสดงให้ดูได้",
  },
  "step.applicationActivity": {
    screen: "Full result, journey checklist step",
    en: "Get applications going out",
    th: "เริ่มส่งใบสมัครออกไป",
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
    th: "ประสบการณ์ในสายงาน",
  },
  "item.learningInvestment": {
    screen: "Named when this is the candidate's strongest area",
    en: "Learning Investment",
    th: "การเรียนรู้และพัฒนาตัวเอง",
  },
  "item.searchFollowThrough": {
    screen: "Named when this is the candidate's strongest area",
    en: "Search Follow-through",
    th: "การลงมือหางานอย่างต่อเนื่อง",
  },
  "item.aiDigitalFluency": {
    screen: "Named when this is the candidate's strongest area",
    en: "AI & Digital Fluency",
    th: "ทักษะการใช้ AI และเครื่องมือดิจิทัล",
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
    th: "ผลงานที่แสดงศักยภาพ",
  },
  "item.applicationActivity": {
    screen: "Named when this is the candidate's strongest area",
    en: "Application Activity",
    th: "การลงมือสมัครงาน",
  },
  "item.visaReadiness": {
    screen: "Named when this is the candidate's strongest area",
    en: "Visa Readiness",
    th: "ความพร้อมด้านวีซ่า",
  },
  "item.languageReadiness": {
    screen: "Named when this is the candidate's strongest area",
    en: "Language Readiness",
    th: "ความพร้อมด้านภาษา",
  },
  "item.familyReadiness": {
    screen: "Named when this is the candidate's strongest area",
    en: "Family Readiness",
    th: "ความพร้อมของครอบครัวในการย้ายประเทศ",
  },
  "item.relocationTimeline": {
    screen: "Named when this is the candidate's strongest area",
    en: "Relocation Timeline",
    th: "ช่วงเวลาที่พร้อมย้ายประเทศ",
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
    th: "ความชัดเจนเรื่องเงินเดือนที่คาดหวัง",
  },
} as const satisfies Record<string, CopyEntry>;

export type CopyKey = keyof typeof COPY;
