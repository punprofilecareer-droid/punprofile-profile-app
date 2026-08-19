/**
 * **Thai wording passed by Paul, 15/08/2026.** Twenty-nine strings across
 * fourteen questions were rewritten in his own words during a review of all
 * shipped Thai. That makes this file his for the wording; the option *values*
 * are unchanged and the additions he proposed are held as decisions, because
 * several of them move scoring, the ICP grade or the booking gate.
 *
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
export const EXCLUSIVE_VALUES = new Set(["not_sure", "never", "none", "not_yet"]);

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
    th: "คุณกำลังมองเส้นทางไหนในการย้ายไปทำงานยุโรป",
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
      { value: "not_sure", en: "Not sure yet", th: "ยังไม่แน่ใจ" },
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
    th: "ตอนนี้มี CV/เรซูเม่ที่อัปเดตพร้อมใช้แล้วหรือยัง",
    options: [
      { value: "none", en: "Don't have one yet", th: "ยังไม่มี" },
      { value: "untailored", en: "Have one, not tailored for Europe", th: "มีแต่ยังไม่ปรับให้เหมาะกับยุโรป" },
      { value: "out_dated", en: "Have one, but outdated", th: "มีแล้วแต่ไม่ได้อัพเดทมานาน" },
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
      { value: "utilized", en: "Active and posts regularly", th: "มี อัพเดท และโพสอย่างสม่ำเสมอ" },
    ],
  },
  {
    // SLOT: portfolio [proxy: Portfolio Evidence]. Added 14/08/2026, one of
    // five questions carried over from the Google Form before it retires.
    //
    // Worth knowing what the answers look like: 44 of the first 63 survey
    // respondents said no, which scores the floor, and that is precisely why
    // the lowest-score-wins picker used to nominate "build a portfolio" as
    // almost everyone's next action. The funnel-ordered picker handles it now.
    key: "portfolio",
    stage: 1,
    select: "one",
    en: "Do you have a portfolio or work samples showing your results?",
    th: "มี portfolio ผลงานหรือตัวอย่างงานที่แสดงผลลัพธ์ของงานไหม",
    options: [
      { value: "none", en: "Not yet", th: "ยังไม่มี" },
      { value: "partial", en: "Some pieces, not organised", th: "มีบางส่วน ยังไม่ได้จัดรวม" },
      // `good` is retired from the question and still scores, because ~160
      // existing records hold it. See `scorePortfolio`.
      { value: "good_physical", en: "Yes, on paper", th: "มีแล้ว ในรูปแบบกระดาษ" },
      { value: "good_digital", en: "Yes, digital or online", th: "มีแล้ว ในรูปแบบ digital หรือ online" },
    ],
  },
  {
    // SLOT: aiTools [ECRA: AI & Digital Fluency]. Added 14/08/2026.
    //
    // This is one of only FIVE competencies out of ECRA's 34 that self-report
    // can honestly score, so losing it with the Google Form would have taken
    // the app from five real scores to four. The framework's formula is
    // literally `1 + indicators met`, which is why the options are the
    // indicators themselves rather than a satisfaction scale.
    //
    // The flags are stored as well as the count: "adopt indicator 3" is only
    // prescribable if we know 3 is the missing one. Evidence stays granular,
    // scores compress.
    key: "aiTools",
    stage: 1,
    select: "many",
    en: "Which of these are true about how you work? Choose all that apply.",
    th: "ข้อไหนตรงกับวิธีการใช้ tool ในการทำงานของคุณ เลือกได้มากกว่า 1 ข้อ",
    options: [
      {
        value: "ai_weekly",
        en: "I use AI tools like ChatGPT for work or job-search tasks most weeks",
        th: "ใช้ AI เช่น ChatGPT หางาน หรือช่วยทำงาน เกือบทุกสัปดาห์",
      },
      {
        value: "eu_tools",
        en: "I am comfortable with the tools European teams run on, for example Slack, Notion, Jira, CRM, PM Tool",
        th: "ใช้เครื่องมือที่ทีมในยุโรปใช้กันได้ เช่น Slack, Notion, Jira, CRM, PM Tool",
      },
      {
        value: "ai_tailor",
        en: "I have used AI to tailor a CV or an application",
        th: "เคยใช้ AI ปรับ CV หรือใบสมัครงาน",
      },
      {
        value: "self_taught",
        en: "I picked these up on my own, not because a job required it",
        th: "เรียนรู้เองด้วยตัวเอง ไม่ใช่เพราะงานบังคับให้ทำ",
      },
      { value: "never", en: "None of these yet", th: "ยังไม่มีข้อไหนตรง" },
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
    en: "Your English level (CEFR)",
    th: "ระดับภาษาอังกฤษของคุณ (CEFR)",
    options: [
      { value: "A1", en: "Beginner (A1)", th: "เริ่มต้น (A1)" },
      { value: "A2", en: "Elementary (A2)", th: "พื้นฐาน (A2)" },
      { value: "B1", en: "Conversational (B1)", th: "พอสื่อสารได้ (B1)" },
      { value: "B2", en: "Working proficiency (B2)", th: "ใช้ทำงานได้ / พรีเซนต์งานได้ / ขายสินค้าได้ (B2)" },
      { value: "C1", en: "Fluent (C1)", th: "ใช้งานได้คล่อง / สื่อสารเชิงอาชีพได้ดี (C1)" },
      { value: "C2", en: "Native-level (C2)", th: "ใกล้เคียงเจ้าของภาษา / ใช้ได้ระดับมืออาชีพ (C2)" },
    ],
  },
  {
    // SLOT: stage [proxy: Application Activity].
    //
    // **Unmerged 15/08/2026.** `survey-spec-template.md` merged the live form's
    // last two options into one because they score identically, and they still
    // do: both return 5 from `scoreApplicationActivity`. But the score was
    // never the only reader. `08_Coaching_Business.md` gates the booking link
    // on stage = interviewing or negotiating, which puts one of the two merged
    // options inside the cut and the other outside it, and the negotiation
    // module and its own LINE message variant exist for that value alone. So
    // the merge made the negotiation conversation unreachable for every
    // app-native lead.
    //
    // This is the same fault as the dead `already have an offer` string
    // recorded in `08_Coaching_Business.md`, which made the quiz's negotiation
    // floor unreachable for the whole life of that form. Fixing it costs one
    // tap and moves no score.
    //
    // Thai is the live form's own wording for the two options, quoted in that
    // document's Q11 list, not new copy.
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
        value: "interviewing_unsuccessful",
        en: "Interviewing but not getting through",
        th: "มีนัดสัมภาษณ์แล้ว แต่ยังไม่เข้ารอบ",
      },
      { value: "offer", en: "Have an offer", th: "ได้รับข้อเสนองานแล้ว" },
      { value: "negotiating", en: "Negotiating a contract", th: "กำลังเจรจาสัญญา" },
    ],
  },
  {
    // SLOT: applications [proxy: Application Activity with Q11, and Search
    // Follow-through]. Added 14/08/2026.
    //
    // Bands, not a number: the scorer only ever asks "none / under five / five
    // or more", so a free number would collect a precision nothing reads. The
    // fourth band exists for the coach rather than the score, which is a fair
    // trade at one tap.
    key: "applications",
    stage: 1,
    select: "one",
    en: "How many roles in Europe have you applied to so far?",
    th: "สมัครงานในยุโรปไปแล้วกี่ application",
    options: [
      { value: "0", en: "None yet", th: "ยังไม่ได้สมัคร" },
      { value: "1-4", en: "1 to 4", th: "1–4" },
      { value: "5-20", en: "5 to 20", th: "5–20" },
      { value: "21-50", en: "21 to 50", th: "21–50" },
      { value: "51-100", en: "51 to 100", th: "51–100" },
      { value: "100+", en: "More than 100", th: "มากกว่า 100" },
      // `20+` is retired from the question, superseded by the three bands
      // above on Paul's pass 15/08/2026. It still maps in `mapping.ts` because
      // existing records hold it.
    ],
  },
  {
    // SLOT: none. This question scores nothing and is the only one that does
    // not, added 19/08/2026 for Temperature alone (TASK-055 follow-up).
    //
    // It is the retired Europe Readiness Check's Q4, which is the ONLY input of
    // the five Temperature weights that this app could not measure. That quiz
    // asked how many roles and whether anyone replied in one breath; the count
    // half is already `applications` above, so only the reply half is asked
    // here. Its two "applied" options are that form's own Thai, quoted from
    // `europe-readiness-check-quiz.md`, so they are wording candidates have
    // already seen; the stem is new and reviewed separately.
    //
    // **A separate question rather than a follow-up, because the app has no
    // conditional question display** (see `family` below for the same
    // constraint solved a different way). So "haven't applied yet" is an option
    // rather than a reason to skip: it is the quiz's own 0-point answer, and it
    // keeps the question coherent for the person who has not applied.
    //
    // It can contradict `applications`. Someone can answer "None yet" there and
    // "got some responses" here. Nothing resolves that automatically, on
    // purpose: this answer is the one Temperature reads, because it is the one
    // the weights were written against.
    key: "applicationResponse",
    stage: 1,
    select: "one",
    en: "Have you heard back from any of them?",
    th: "จากที่สมัครไป มีคนติดต่อกลับมาบ้างไหม",
    options: [
      { value: "not_applied", en: "Haven't applied yet", th: "ยังไม่เคยสมัครเลย" },
      {
        value: "no_replies",
        en: "Applied to several, almost no response",
        th: "สมัครไปหลายที่แล้ว แต่แทบไม่มีใครติดต่อกลับ",
      },
      {
        value: "some_replies",
        en: "Applied, and got some responses",
        th: "สมัครไปแล้ว และมีคนติดต่อกลับมาบ้าง",
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
    // SLOT: family [ECRA: Family Readiness]. Added 14/08/2026, and the fifth
    // of the five real ECRA competencies self-report can reach.
    //
    // One question, not two, for the same reason Q11 is one: the app has no
    // conditional question display, so a follow-up about family logistics
    // would have shown to every single person with no partner and no children.
    // The exclusive "no partner or dependents" option carries `hasDependents:
    // false`, which the framework auto-scores 5, and the four indicator
    // options carry `true` plus their own flag.
    //
    // `not_yet` exists so that having dependents and having done none of this
    // is expressible. Without it, someone with a family and no plan would have
    // had to either lie or leave the question, and those score very
    // differently.
    //
    // Family Readiness is scored but never offered as a next action: it is a
    // life circumstance, not a task, and the funnel picker excludes it.
    key: "family",
    stage: 1,
    select: "many",
    en: "If you moved, who moves with you? Choose all that apply.",
    th: "ถ้าคุณย้ายไปยุโรป มีใครต้องย้ายตามไปด้วยไหม เลือกได้มากกว่า 1 ข้อ",
    options: [
      {
        value: "none",
        en: "Nobody, I would be moving alone",
        th: "ไม่มี ย้ายไปคนเดียว",
      },
      {
        value: "discussed",
        en: "I have talked the move through with everyone it affects",
        th: "คุยเรื่องการย้ายกับทุกคนที่เกี่ยวข้องแล้ว",
      },
      {
        value: "no_objection",
        en: "Nobody close to me is against it",
        th: "คนใกล้ชิดไม่มีใครคัดค้าน",
      },
      {
        value: "dependents_plan",
        en: "We have a plan for school or care for the people who depend on me",
        th: "วางแผนเรื่องโรงเรียนหรือการดูแลผู้สูงอายุในความรับผิดชอบไว้แล้ว",
      },
      {
        value: "logistics",
        en: "We have thought through the practical side, visas, housing, my partner's work",
        th: "คิดเรื่องวีซ่า ที่พัก และงานของคู่ครองไว้แล้ว",
      },
      {
        value: "not_yet",
        en: "Someone would move with me, but we have not worked any of this out",
        th: "มีคนจะย้ายไปด้วย แต่ยังไม่ได้วางแผนเรื่องเหล่านี้",
      },
    ],
  },
  {
    // SLOT: salary [proxy: Salary Expectation Stated]. Added 14/08/2026.
    //
    // The proxy is named for what it measures: whether a usable figure exists,
    // never whether the figure is realistic. Classifying it would need a
    // country and role market benchmark, and `salaryExpectations` stays a
    // coach-tier item for exactly that reason.
    //
    // Bands rather than free text, which the app has no input type for anyway,
    // and which here is an improvement: a band guarantees a figure, a currency
    // and a period, where the survey's free text produced "depends" often
    // enough to need its own parser branch. Every band scores the same 3 on
    // purpose. The band itself is for the call.
    key: "salary",
    stage: 1,
    select: "one",
    en: "What monthly salary would you be aiming for in Europe, before tax?",
    th: "เงินเดือนที่คุณตั้งเป้าในยุโรป ก่อนหักภาษี ประมาณเท่าไหร่",
    options: [
      { value: "under_2500", en: "Under €2,500 a month", th: "ต่ำกว่า 2,500 ยูโรต่อเดือน" },
      { value: "2500_3500", en: "€2,500 to €3,500 a month", th: "2,500–3,500 ยูโรต่อเดือน" },
      { value: "3500_5000", en: "€3,500 to €5,000 a month", th: "3,500–5,000 ยูโรต่อเดือน" },
      { value: "over_5000", en: "Over €5,000 a month", th: "มากกว่า 5,000 ยูโรต่อเดือน" },
      { value: "not_sure", en: "I have not worked that out yet", th: "ยังไม่ได้คิดเรื่องนี้" },
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
    th: "ที่ผ่านมา คุณเคยจ่ายเงินเพื่อเรียนรู้หรือพัฒนาตัวเองในด้านใดบ้าง เลือกได้มากกว่า 1 ข้อ",
    options: [
      { value: "language", en: "Learning a language", th: "เรียนภาษา" },
      {
        value: "soft_skills",
        en: "Soft skills, for example communication or leadership",
        th: "ทักษะการทำงาน เช่น การสื่อสาร หรือ ภาวะผู้นำ",
      },
      {
        value: "technical",
        en: "A technical skill or a programming language",
        th: "เรียนทักษะเฉพาะทางหรือภาษาโปรแกรมมิ่ง",
      },
      {
        value: "certification",
        en: "A professional certification or qualification",
        th: "เรียนหลักสูตรเพื่อรับใบรับรองหรือคุณวุฒิวิชาชีพ",
      },
      {
        // Added 14/08/2026 on Paul's call: portfolio had to be one of the
        // subjects. It is the highest-signal option in the list for this
        // business, because it is the only one that names something PunProfile
        // itself sells: someone who has already paid to have a CV or a
        // LinkedIn profile written has priced this category of work before,
        // and their objection on a call is never "why would anyone pay for
        // that".
        //
        // The score is unaffected, as with every other area here. The
        // framework asks about prior spend and not its aim, so `toGradeInput`
        // collapses any paid area to the same band. This is for the call.
        value: "profile_docs",
        en: "Having a CV, LinkedIn profile or portfolio written or reviewed",
        th: "จ้างเขียนหรือรีวิว CV, โปรไฟล์ LinkedIn หรือพอร์ตโฟลิโอ",
      },
      { value: "career_coach", en: "A career coach", th: "ใช้บริการโค้ชชิ่งด้านอาชีพ" },
      { value: "never", en: "None of these yet", th: "ยังไม่เคยจ่ายเงินกับเรื่องเหล่านี้" },
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
