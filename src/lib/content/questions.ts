/**
 * TASK-051: the staged questionnaire, as data.
 *
 * Decided 04/08/2026: this app absorbs both Google instruments. Every question
 * lives here with CANONICAL answer values, the same vocabulary `ScoringInput`
 * speaks, so the app never parses free text; the fuzzy parsers in
 * `normalize.ts` serve only the historical backfill.
 *
 * Stage 1 is the pre-email set: the nine questions specified in
 * `survey-spec-template.md`, one under the 10-question cap from PRD § 1,
 * tap-only, covering both live instruments' Stage 1 topics and feeding the
 * teaser chart. Stage 2 (post-unlock) lands in Phase 2.
 *
 * Copy: every `th` string below comes from `survey-spec-template.md`, which
 * extracted them from the two published forms rather than authoring them, so
 * this is wording candidates have already seen. The two exceptions are
 * `pathway` and the multi-select framing of `targetCountries`, which have no
 * live equivalent; both were approved by the founder on 08/08/2026 ahead of
 * the consolidated native-tone pass (TASK-052). An empty `th` still means
 * "not yet reviewed" and the UI falls back to English.
 */

export interface Option {
  /** Canonical value, written verbatim into `responses` and mapped to ScoringInput. */
  value: string;
  en: string;
  th: string;
}

export interface Question {
  key: string;
  stage: 1 | 2;
  /**
   * "one" stores a string, "many" stores an array. The distinction is enforced
   * by `isValidAnswer` on the server, not just prevented in the UI.
   */
  select: "one" | "many";
  en: string;
  th: string;
  options: Option[];
}

/**
 * Values that mean "I don't know" and therefore cannot be combined with a real
 * answer in a many-select question. "Germany, Netherlands, not sure yet" is not
 * a coherent answer.
 */
// `never` joins `not_sure` on 14/08/2026, for the investment question: "I have
// not paid for any of these" cannot coexist with an item from the same list.
// A distinct value rather than reusing `none`, which several single-select
// questions already use for something that is not exclusive of anything.
export const EXCLUSIVE_VALUES = new Set(["not_sure", "never"]);

/**
 * Functions, not job titles. Rewritten 14/08/2026 on Paul's read: "it's not a
 * job title, the goal is to find out what the aspiration is in terms of
 * department or capability".
 *
 * Two things were wrong, and the list was only the second of them. The question
 * itself asked `ตำแหน่งงานหรือสายงาน`, position OR field, so it asked two
 * questions at once and a candidate could honestly answer either. And
 * `Management & Executive` sat in a list of functions while being a seniority,
 * which is what made the whole set read as titles: a marketing director had to
 * choose between their function and their level, and lost the more useful of
 * the two. Seniority is already answered by the experience question, so it is
 * gone from here.
 *
 * `Other` is gone as well, and that is what removed the pressure for a free
 * text box. It was never an answer, only a bucket that needed a text field to
 * mean anything, and the app has no free-text question type by decision
 * (13/08/2026, the In Scope gate reads the CV instead). `Still deciding` is a
 * real answer in its place, and it scores honestly as low Target Clarity,
 * which is exactly what someone who cannot yet name a field should score.
 *
 * Categories rather than titles for the original reason too: Target Clarity
 * needs "a field is named", not an essay.
 */
export const ROLE_CATEGORIES = [
  "IT & Software",
  "Engineering & Technical",
  "Data & Analytics",
  "Finance & Accounting",
  "Marketing",
  "Sales & Business Development",
  "Customer Success & Account Management",
  "HR & People",
  "Design & Creative",
  "Procurement, Supply Chain & Operations",
  "Business, Strategy & Project",
  "Education & Training",
  "Healthcare & Life Sciences",
  "Hospitality & Tourism",
  "Legal & Compliance",
  "Research & Science",
] as const;

const COUNTRIES = [
  "Germany",
  "Netherlands",
  // Added 13/08/2026. Absent by omission rather than by decision: it was the
  // third most-named country across the 90 imported survey leads, `07_Reference.md`
  // already carries its visa rules, and Country Fit already tiers it as harder.
  "United Kingdom",
  "France",
  "Denmark",
  "Sweden",
  "Norway",
  "Finland",
  "Ireland",
  "Belgium",
  "Austria",
  "Switzerland",
  "Spain",
  "Italy",
  "Portugal",
  "Poland",
  "Czech Republic",
] as const;

export const PATHWAYS = [
  { value: "job_first", en: "Find a job first, then relocate", th: "หางานก่อน แล้วค่อยย้าย" },
  { value: "study_first", en: "Study first, then find work there", th: "เรียนต่อก่อน แล้วค่อยหางานที่นั่น" },
  { value: "family", en: "Family or partner route", th: "ไปตามคู่ครองหรือครอบครัว" },
  { value: "not_sure", en: "Not sure yet, exploring", th: "ยังไม่แน่ใจ กำลังหาข้อมูลอยู่" },
] as const;

export const STAGE1: Question[] = [
  {
    // SLOT: pathway. Context and narrative only, no score: it drives the
    // opening line of the result (FR-008) and is stored on `leads.pathway`,
    // not in ScoringInput. All four routes are written to read as equally
    // legitimate.
    key: "pathway",
    stage: 1,
    select: "one",
    en: "Which route to Europe are you exploring?",
    th: "คุณกำลังมองเส้นทางไหนในการไปยุโรป",
    options: PATHWAYS.map((p) => ({ value: p.value, en: p.en, th: p.th })),
  },
  {
    // SLOT: targetCountries [proxy: Target Clarity]. Multi-select: the live
    // form was free text and produced "Netherlands Germany France" and
    // "สนใจทุกประเทศ", which no scorer can read.
    key: "targetCountries",
    stage: 1,
    select: "many",
    en: "Target country or countries in Europe (you can choose more than one)",
    th: "ประเทศในยุโรปที่คุณสนใจไปทำงาน (เลือกได้มากกว่า 1 ข้อ)",
    options: [
      ...COUNTRIES.map((c) => ({ value: c, en: c, th: c })),
      { value: "not_sure", en: "Not sure yet", th: "ยังไม่แน่ใจ" },
    ],
  },
  {
    // SLOT: targetRole [proxy: Target Clarity]. The field, not the title, since
    // 14/08/2026: see the note on ROLE_CATEGORIES above.
    key: "targetRole",
    stage: 1,
    select: "one",
    en: "Which field do you want to work in in Europe?",
    th: "สายงานที่อยากทำในยุโรป",
    options: [
      ...ROLE_CATEGORIES.map((r) => ({ value: r, en: r, th: r })),
      { value: "not_sure", en: "Still deciding", th: "ยังตัดสินใจไม่ได้" },
    ],
  },
  {
    // SLOT: experienceYears [ICP Gate 2: Offering Match]. Added 14/08/2026.
    //
    // Deliberately NOT mapped into ScoringInput. `experienceDepth` is an item
    // of Professional Capability, and Stage 1 leaves that dimension hollow on
    // purpose (PRD § 1, and `verify-content.ts` asserts both directions of it).
    // This answer reaches the coach through `toGradeInput` only, so the
    // candidate's first read is unchanged by it.
    key: "experienceYears",
    stage: 1,
    select: "one",
    en: "How many years of professional experience do you have?",
    th: "คุณมีประสบการณ์ทำงานมากี่ปีแล้ว",
    options: [
      { value: "0-1", en: "Up to 1 year", th: "ไม่เกิน 1 ปี" },
      { value: "2-10", en: "2 to 10 years", th: "2–10 ปี" },
      { value: "11-15", en: "11 to 15 years", th: "11–15 ปี" },
      { value: "16+", en: "16 years or more", th: "16 ปีขึ้นไป" },
    ],
  },
  {
    // SLOT: cv [proxy: CV Status].
    key: "cv",
    stage: 1,
    select: "one",
    en: "Do you have an updated CV?",
    th: "ตอนนี้มี CV/เรซูเม่ที่อัปเดตแล้วหรือยัง",
    options: [
      { value: "none", en: "Don't have one yet", th: "ยังไม่มี" },
      { value: "untailored", en: "Have one, not tailored for Europe", th: "มีแต่ยังไม่ปรับให้เหมาะกับยุโรป" },
      { value: "europe_ready", en: "Have one, Europe-ready", th: "มีแล้วพร้อมใช้สมัครงานยุโรป" },
    ],
  },
  {
    // SLOT: linkedin [proxy: LinkedIn Status].
    key: "linkedin",
    stage: 1,
    select: "one",
    en: "Do you have a LinkedIn profile?",
    th: "มีโปรไฟล์ LinkedIn หรือไม่",
    options: [
      { value: "none", en: "None", th: "ยังไม่มี" },
      { value: "basic", en: "Have one, rarely updated", th: "มี แต่ไม่ได้อัพเดต" },
      { value: "active", en: "Active and kept up to date", th: "มีและอัพเดทสม่ำเสมอ" },
    ],
  },
  {
    // SLOT: workAuth [ECRA: Visa Readiness]. `sponsor_route_named` has no live
    // equivalent: the framework scores "knows the specific route" a full point
    // above "knows sponsorship is needed", and no form ever asked it.
    key: "workAuth",
    stage: 1,
    select: "one",
    en: "Where do you stand on visa and the right to work in Europe?",
    th: "เรื่องวีซ่า/สิทธิ์ทำงานในยุโรป ตอนนี้คุณอยู่ตรงไหน",
    options: [
      {
        value: "eu_rights",
        en: "Already have an EU passport or work rights",
        th: "มีพาสปอร์ต EU หรือสิทธิ์ทำงานอยู่แล้ว",
      },
      {
        value: "sponsor_route_named",
        en: "Need sponsorship and know which visa route I'd use",
        th: "ต้องการสปอนเซอร์วีซ่า และรู้แล้วว่าจะใช้วีซ่าประเภทไหน",
      },
      {
        value: "sponsor_no_route",
        en: "Understand I'll need visa sponsorship",
        th: "เข้าใจว่าต้องหาบริษัทที่ช่วย sponsor วีซ่า",
      },
      { value: "unsure", en: "Not sure what's needed at all", th: "ยังไม่รู้เลยว่าต้องใช้อะไรบ้าง" },
    ],
  },
  {
    // SLOT: englishCefr [ECRA: Language Readiness + Business English]. Feeds
    // two of the four dimensions. Founder decision 08/08/2026: no test-score
    // follow-up, buttons are enough.
    //
    // Six levels since 14/08/2026, the full CEFR ladder, on Paul's call. The
    // four-button version folded A1 into A2 and B2 into B1, which cost the two
    // distinctions that matter most in this pool: a true beginner scored the
    // same as someone with school English, and B2, the level most European
    // employers actually ask for, had nowhere to land. The scale, the
    // normaliser and `parseCefr` already carried all six; only the question
    // was short.
    key: "english",
    stage: 1,
    select: "one",
    en: "Your English level",
    th: "ระดับภาษาอังกฤษของคุณ",
    options: [
      { value: "A1", en: "Beginner (A1)", th: "เริ่มต้น (A1)" },
      { value: "A2", en: "Elementary (A2)", th: "พื้นฐาน (A2)" },
      { value: "B1", en: "Conversational (B1)", th: "พอสื่อสารได้ (B1)" },
      { value: "B2", en: "Working proficiency (B2)", th: "ใช้ทำงานได้ (B2)" },
      { value: "C1", en: "Fluent (C1)", th: "คล่องแคล่ว (C1)" },
      { value: "C2", en: "Native-level (C2)", th: "ใกล้เคียงเจ้าของภาษา (C2)" },
    ],
  },
  {
    // SLOT: stage [proxy: Application Activity]. The live form's last two
    // options scored identically, so the spec merges them into `offer`.
    key: "stage",
    stage: 1,
    select: "one",
    en: "What stage are you at right now?",
    th: "ตอนนี้คุณอยู่ขั้นตอนไหนของการหางานแล้ว",
    options: [
      { value: "not_started", en: "Haven't started", th: "ยังไม่เริ่ม" },
      { value: "researching", en: "Researching", th: "กำลังหาข้อมูล" },
      { value: "applying", en: "Actively applying", th: "กำลังสมัครงาน" },
      { value: "interviewing", en: "Interviewing", th: "มีนัดสัมภาษณ์แล้ว" },
      {
        value: "offer",
        en: "Have an offer or negotiating",
        th: "ได้รับข้อเสนอแล้ว กำลังต่อรองเงินเดือนและ benefits",
      },
    ],
  },
  {
    // SLOT: timeline [proxy: Relocation Timeline].
    key: "timeline",
    stage: 1,
    select: "one",
    en: "When do you want to start working in Europe?",
    th: "อยากเริ่มงานที่ยุโรปเมื่อไหร่",
    options: [
      { value: "within_3m", en: "Within 3 months", th: "ภายใน 3 เดือน" },
      { value: "3_6m", en: "In 3 to 6 months", th: "3–6 เดือน" },
      { value: "6_12m", en: "In 6 to 12 months", th: "6–12 เดือน" },
      { value: "exploring", en: "Not sure, still exploring", th: "ยังไม่แน่ใจ กำลังศึกษาข้อมูลอยู่" },
    ],
  },
  {
    // SLOT: priorInvestment [ICP score: Investment Readiness]. Added
    // 14/08/2026, and the reason the pair was added at all: measured across
    // all 90 survey leads this was the ONLY ICP criterion that separated the
    // pool, 41% having paid for career development against 53% who had not.
    //
    // Last, exactly as the Lead Discovery Survey placed it (Q21). Revealed
    // past spend is a better willingness-to-pay signal than a hypothetical
    // budget question, and it reads as a normal closing question rather than
    // a price probe when it comes after everything else.
    //
    // **Multi-select since later the same day, on Paul's call: he wanted to
    // know WHAT they paid for, not just whether they had.** Asking the areas
    // directly answers both, so this stayed one question rather than becoming
    // a yes/no plus a follow-up. That matters more than it looks: the app has
    // no conditional question display, so a follow-up would have shown to
    // everyone including the people who just said no.
    //
    // The score does not change with the areas, and should not. The framework
    // asks about prior spend and not its aim: "having paid for anything before
    // is the signal". The areas are for the coach's call preparation, and
    // `toGradeInput` collapses them back to paid or not paid.
    //
    // The 0 band ("named money as a blocker") still cannot be reached from the
    // app, since it comes from free text nothing here collects.
    key: "priorInvestment",
    stage: 1,
    select: "many",
    en: "Have you ever paid for any of these? Choose all that apply.",
    th: "ที่ผ่านมาคุณเคยจ่ายเงินเรียนหรือพัฒนาตัวเองด้านไหนบ้าง เลือกได้มากกว่า 1 ข้อ",
    options: [
      { value: "language", en: "Learning a language", th: "เรียนภาษา" },
      {
        value: "soft_skills",
        en: "Soft skills, for example communication or leadership",
        th: "ทักษะการทำงาน เช่น การสื่อสาร ภาวะผู้นำ",
      },
      {
        value: "technical",
        en: "A technical skill or a programming language",
        th: "ทักษะเฉพาะทาง หรือเขียนโปรแกรม",
      },
      {
        value: "certification",
        en: "A professional certification or qualification",
        th: "ใบรับรองหรือคุณวุฒิวิชาชีพ",
      },
      { value: "career_coach", en: "A career coach", th: "โค้ชด้านอาชีพ" },
      { value: "never", en: "None of these yet", th: "ยังไม่เคย" },
    ],
  },
];

export const QUESTION_INDEX: Record<string, Question> = Object.fromEntries(
  STAGE1.map((q) => [q.key, q]),
);

/**
 * True when `value` is a legal answer for `questionKey`. The server calls this.
 *
 * A "one" question takes a string and rejects an array; a "many" question takes
 * a non-empty array with no duplicates, and rejects a bare string. In a "many"
 * question an exclusive value such as `not_sure` may only appear on its own.
 */
export function isValidAnswer(questionKey: string, value: unknown): boolean {
  const q = QUESTION_INDEX[questionKey];
  if (!q) return false;

  const legal = (v: unknown): boolean =>
    typeof v === "string" && q.options.some((o) => o.value === v);

  if (q.select === "one") return legal(value);

  if (!Array.isArray(value) || value.length === 0) return false;
  if (!value.every(legal)) return false;
  if (new Set(value).size !== value.length) return false;
  if (value.length > 1 && value.some((v) => EXCLUSIVE_VALUES.has(v as string))) return false;
  return true;
}
