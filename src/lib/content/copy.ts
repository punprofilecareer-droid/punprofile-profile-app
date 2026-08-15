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
 * Language rules live in `Language_System.md`, LR-01 to LR-08, with the decided
 * terms in `termbase.yml` beside it. Read them there rather than trusting a
 * summary, because they change. `scripts/lint-thai.ts` enforces the mechanical
 * ones against every string in this file on each `verify-copy` run, so a banned
 * term or a paraphrased fixed string fails rather than ships.
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
  // ------------------------------------------------------------- site menu
  // The burger's destinations. `nav.brand` is not among them: the wordmark is
  // centred and inert, so nothing here is a second way to say "home" except
  // the one entry that says it.
  "nav.menu": {
    screen: "Header, the burger button's accessible name",
    en: "Menu",
    th: "เมนู",
  },
  "nav.menuClose": {
    screen: "Header, the open menu's close button",
    en: "Close menu",
    th: "ปิดเมนู",
  },
  "nav.assess": {
    screen: "Site menu, the one action in the list",
    en: "EU Fit Check",
    th: "EU Fit Check",
  },
  "nav.services": {
    screen: "Site menu",
    // "Our Services", not "Services". The possessive is doing work in Thai:
    // บริการ alone reads as a section label on any website, บริการของเรา reads
    // as this business telling you what it offers.
    en: "Our Services",
    th: "บริการของเรา",
  },
  "nav.coaching": {
    screen: "Site menu",
    // Not "About". The page sells the coaching and introduces Paul at the end,
    // so the label names what the reader gets rather than who wrote it.
    //
    // Identical in both languages, on Paul's call. "Coaching 1:1" is already
    // how this is said in Thai professional contexts, and โค้ชชิ่งตัวต่อตัว is
    // the longest item in a menu whose other entries are two words.
    en: "Coaching 1:1",
    th: "Coaching 1:1",
  },
  "nav.faq": {
    screen: "Site menu",
    en: "FAQ",
    th: "คำถามที่พบบ่อย",
  },
  "nav.contact": {
    screen: "Site menu",
    en: "Contact",
    th: "ติดต่อเรา",
  },
  "nav.language": {
    screen: "Header, the TH/EN switch",
    en: "Language",
    th: "ภาษา",
  },
  "footer.brand": {
    screen: "Footer, every screen",
    // Not translated. The brand name, the year and a rights line read the same
    // to both audiences, and a Thai transliteration of a legal formula reads
    // as a mistake rather than as a courtesy.
    en: "PunProfile Career Coaching | 2026 | All Rights Reserved",
    th: "PunProfile Career Coaching | 2026 | All Rights Reserved",
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
  // No `landing.cta` here. The landing button's label comes from the table in
  // `cta.ts`, which owns every action on every page. A second definition of the
  // same button is a second wording of it, which is the failure this file's
  // one-string-one-place rule exists to prevent.
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
  // ---- Stage 2, question one: the per-language grid (TASK-072, 14/08/2026).
  // Placed after the first read on purpose: Stage 1 had no room left inside
  // the 90-second budget, and this is accuracy a candidate volunteers rather
  // than something the first read depends on.
  "lang.heading": {
    screen: "Stage 2, language grid",
    en: "Do you speak any other European languages?",
    th: "คุณพูดภาษายุโรปอื่นได้บ้างไหม",
  },
  "lang.body": {
    screen: "Stage 2, language grid",
    en: "This changes which countries are genuinely open to you.",
    th: "ข้อนี้เปลี่ยนว่าประเทศไหนเปิดรับคุณได้จริง",
  },
  "lang.levelLabel": {
    screen: "Stage 2, language grid",
    en: "level",
    th: "ระดับ",
  },
  "lang.scale": {
    screen: "Stage 2, language grid",
    en: "A1 beginner, B2 able to work in it, C2 native-level.",
    th: "A1 เริ่มต้น, B2 ใช้ทำงานได้, C2 ใกล้เคียงเจ้าของภาษา",
  },
  "lang.submit": {
    screen: "Stage 2, language grid",
    en: "Continue",
    th: "ไปต่อ",
  },
  "lang.skip": {
    screen: "Stage 2, language grid",
    en: "I don't speak another",
    th: "ไม่ได้พูดภาษาอื่น",
  },

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
  "teaser.nextStep": {
    screen: "First read, the closing card. What happens after this screen",
    // Paul's wording, 14/08/2026, and a deliberate downgrade of the promise.
    // The line before it said the team would be in touch, full stop, which is
    // a commitment made to every single finisher by a team of one. Naming the
    // queue costs nothing and buys the thing a promise cannot: a candidate who
    // waits a week has been told a week is normal, rather than concluding they
    // were the one who did not qualify.
    en: "We are getting a lot of enquiries at the moment, so the team may not reach you until your turn comes round.",
    th: "เนื่องจากมีผู้ติดต่อเข้ามาเป็นจำนวนมาก ทีมงานอาจไม่ได้ติดต่อกลับไปจนกว่าจะถึงคิวของคุณ",
  },
  "teaser.revise": {
    screen: "Teaser, the link back to the last question",
    en: "Go back and change an answer",
    th: "กลับไปแก้ไขคำตอบ",
  },

  // ------------------------------------------------------- community stats
  // The three lines under the first read, TASK-083. Their job is to give a
  // candidate something to hold and something to repeat: the countries line is
  // the one that gets screenshotted, the language line is the one that gets
  // quoted, and the percentile is the only sentence on the screen about them
  // in relation to anyone else.
  //
  // Placeholders are substituted at render, never composed here. `{n}`, `{max}`
  // and `{dimension}` appear in both languages and Thai puts them in a
  // different place, which is exactly why the whole sentence is a copy entry
  // rather than three fragments joined in a component.
  "stats.heading": {
    screen: "First read, above the community stats",
    en: "From everyone who has taken this",
    th: "จากผู้ที่ทำแบบประเมินนี้ทั้งหมด",
  },
  "stats.countries.label": {
    screen: "First read, the top-countries stat",
    en: "The five countries this group is aiming at",
    th: "5 ประเทศที่คนกลุ่มนี้ตั้งเป้าไว้มากที่สุด",
  },
  "stats.countries.foot": {
    screen: "First read, under the top-countries list",
    // No sample size, on Paul's call 14/08/2026: the number of people who have
    // taken the check is PunProfile's own information. What survives is WHO
    // was counted, which is the part that stops a ranking being read as a
    // claim about Europe rather than about this group.
    en: "From people who took the EU Fit Check and named a target country.",
    th: "จากผู้ที่ทำ EU Fit Check และระบุประเทศเป้าหมาย",
  },
  "stats.languages.label": {
    screen: "First read, the most-languages stat",
    en: "The most languages any one person here speaks",
    th: "จำนวนภาษาที่คนคนเดียวในกลุ่มนี้พูดได้มากที่สุด",
  },
  "stats.languages.value": {
    screen: "First read, the most-languages figure. {max} is the number",
    en: "{max} languages",
    th: "{max} ภาษา",
  },
  "stats.languages.foot": {
    screen: "First read, under the most-languages stat",
    // Says which bar was used, because "speaks" is the whole disagreement. A
    // count that included A1 would be a bigger, less true number.
    en: "Counting English and European languages at conversational level or above.",
    th: "นับภาษาอังกฤษและภาษายุโรปที่สื่อสารได้ (B1) ขึ้นไป",
  },
  "stats.percentile": {
    screen: "First read, the personal comparison. {dimension} and {n}",
    // The one sentence on this screen that is about the candidate rather than
    // the pool, which is why it sits with the stats rather than in the
    // narrative: the narrative is selected from a bank and cannot say this.
    en: "Your {dimension} is higher than {n}% of them.",
    th: "คะแนน{dimension}ของคุณสูงกว่า {n}% ของคนกลุ่มนี้",
  },
  "stats.percentile.foot": {
    screen: "First read, under the percentile line",
    en: "Compared on self-reported answers, the same as yours.",
    th: "เทียบจากคำตอบที่แต่ละคนกรอกเอง เช่นเดียวกับของคุณ",
  },

  // ------------------------------------------------------------- services CTA
  "services.cta.heading": {
    screen: "First read, the secondary CTA to /services",
    en: "While you wait",
    th: "ระหว่างรอ",
  },
  "services.cta.body": {
    screen: "First read, the secondary CTA to /services",
    // Pitched at the wait, not at the sale. The candidate has just been told
    // there is a queue; the honest offer is something to read, and a page that
    // explains what the coaching actually is does more for a later call than a
    // second booking button on the same screen.
    en: "Here is what working with PunProfile actually involves, and which part of it your result points at.",
    th: "ดูว่าการทำงานร่วมกับ PunProfile เป็นอย่างไร และผลของคุณชี้ไปที่บริการไหน",
  },
  "services.cta.button": {
    screen: "First read, the secondary CTA to /services",
    en: "See what PunProfile does",
    th: "ดูบริการของ PunProfile",
  },

  // --------------------------------------------------------- chart dimensions
  // Candidate-facing labels only. `model.ts` keeps its own English copies for
  // the coach report, which is a different audience, not a second source of
  // truth for this one.
  "dimension.professionalCapability": {
    screen: "Spider chart axis",
    en: "Professional Capability",
    th: "ฝีมือในสายงาน",
  },
  "dimension.employability": {
    screen: "Spider chart axis",
    en: "Employability",
    th: "การสมัครงาน",
  },
  "dimension.mobilityReadiness": {
    screen: "Spider chart axis",
    en: "Mobility Readiness",
    th: "การย้ายประเทศ",
  },
  "dimension.europeanMarketFit": {
    screen: "Spider chart axis",
    en: "European Market Fit",
    th: "ความสอดคล้องกับตลาดยุโรป",
  },

  // ------------------------------------------------------------ contact gate
  // FR-005. Full name, email, and at least one of LINE ID or phone.
  "gate.heading": {
    screen: "Contact step, the heading. Last step of the survey",
    en: "Last step",
    th: "ขั้นตอนสุดท้าย",
  },
  "gate.body": {
    screen: "Contact step, under the heading. Says what happens next",
    en: "Your name, and whichever channel suits you for us to get back to you.",
    th: "กรอกชื่อและช่องทางที่คุณสะดวกให้เราติดต่อกลับ",
  },
  "gate.firstName": {
    screen: "Contact step, first name field label",
    en: "First name",
    th: "ชื่อ",
  },
  "gate.lastName": {
    screen: "Contact step, last name field label",
    en: "Last name",
    th: "นามสกุล",
  },
  "gate.email": {
    screen: "Contact gate, email field label",
    en: "Email",
    th: "อีเมล",
  },
  "gate.channelHint": {
    screen: "Contact gate, above the LINE and phone fields. Explains why one is required",
    en: "Choose at least one channel so the team can reach you.",
    th: "เลือกอย่างน้อยหนึ่งช่องทางให้ทีมติดต่อกลับได้",
  },
  "gate.lineId": {
    screen: "Contact gate, LINE ID field label",
    en: "LINE ID",
    th: "Line ID",
  },
  "gate.phone": {
    screen: "Contact gate, phone field label",
    en: "Phone number",
    th: "เบอร์โทร",
  },
  "gate.submit": {
    screen: "Contact step, the submit button",
    en: "See my first read",
    th: "รู้ผลเบื้องต้นเลย",
  },
  "gate.working": {
    screen: "Contact gate, submit button while the write is in flight",
    en: "Working...",
    th: "กำลังบันทึก...",
  },

  // Errors. Thrown server-side as stable codes and resolved here, so a rule
  // enforced on the server can still speak the candidate's language.
  "gate.error.first_name_required": {
    screen: "Contact step, when the first name is empty",
    en: "Please enter your first name.",
    th: "กรุณากรอกชื่อ",
  },
  "gate.error.last_name_required": {
    screen: "Contact step, when the last name is empty",
    en: "Please enter your last name.",
    th: "กรุณากรอกนามสกุล",
  },
  "gate.error.email_invalid": {
    screen: "Contact gate, when the email is missing or malformed",
    en: "That email doesn't look right. Please check it.",
    th: "อีเมลดูไม่ถูก ลองเช็กอีกครั้ง",
  },
  "gate.error.channel_required": {
    screen: "Contact gate, when neither LINE nor phone was given",
    en: "Please add a LINE ID or a phone number.",
    th: "กรอก Line ID หรือเบอร์โทรอย่างน้อยหนึ่งช่อง",
  },
  "gate.error.consent_email": {
    screen: "Contact gate, when email consent is unticked",
    en: "We need your permission before we can send anything.",
    th: "ติ๊กยินยอมให้ส่งผลทางอีเมลก่อน",
  },
  "gate.error.consent_phone": {
    screen: "Contact gate, when a phone was given without consent",
    en: "Tick the consent for phone, or clear the number.",
    th: "ติ๊กยินยอมให้โทรหาคุณด้วย หรือลบเบอร์ออกก็ได้",
  },
  "gate.error.consent_line": {
    screen: "Contact gate, when a LINE ID was given without consent",
    en: "Tick the consent for LINE, or clear the ID.",
    th: "ติ๊กยินยอมให้ทัก Line หาคุณด้วย หรือลบ Line ID ออกก็ได้",
  },
  "gate.error.unknown": {
    screen: "Contact gate, any failure with no specific cause. Network, mostly",
    en: "That didn't go through. Please try again.",
    th: "ส่งข้อมูลไม่สำเร็จ ลองอีกครั้ง",
  },

  // ------------------------------------------------------- full result screen
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
    th: "ครอบครัวพร้อมย้าย",
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
  "item.countryReach": {
    screen: "Named when this is the candidate's strongest or weakest area",
    en: "Country Reach",
    // Draft, 13/08/2026, for Paul to correct. "Countries you can actually work
    // in", rather than a literal rendering of "reach", which has no natural Thai
    // noun here. Deliberately says ทำงาน rather than ไป: the item is about being
    // employable there, not about being able to travel there.
    th: "ประเทศเป้าหมายที่ทำงานได้จริง",
  },
  "item.salaryStated": {
    screen: "Named when this is the candidate's strongest area",
    en: "Salary Expectation Stated",
    th: "ความชัดเจนเรื่องเงินเดือนที่คาดหวัง",
  },
} as const satisfies Record<string, CopyEntry>;

export type CopyKey = keyof typeof COPY;
