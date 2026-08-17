/**
 * **Thai wording passed by Paul, 15/08/2026.** Fifty-one strings rewritten in
 * his own words during the review of all shipped Thai, forty-six applied
 * directly. Five navigation items are held rather than applied: his edit put
 * English in the Thai column for `nav.menu`, `nav.menuClose`, `nav.services`,
 * `nav.faq` and `nav.contact`, and one of those, `บริการของเรา`, is a fixed
 * termbase term. Whether Thai navigation should be in English is a decision
 * and not a typo, so it waits for one.
 *
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
    th: "Menu",
  },
  "nav.menuClose": {
    screen: "Header, the open menu's close button",
    en: "Close menu",
    th: "Close menu",
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
    th: "Our Services",
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
  "nav.blog": {
    screen: "Site menu",
    // English in both columns, on Paul's call 16/08/2026, joining the five nav
    // items decided the same way on 15/08/2026. It was drafted as บทความ, which
    // is correct Thai and was the wrong answer: it would have made this the one
    // item in the menu that translates, and a menu that is English except for
    // one word reads as an oversight rather than as a choice.
    //
    // `nav-blog` in `termbase.yml` is what records that, and it is not optional
    // bookkeeping. Without the entry, `lint-thai.ts` fails this string under
    // LR-01, and it is right to: an English word in the Thai column is a decided
    // passthrough or an untranslated key, and the termbase is the only thing
    // that can tell those apart.
    en: "Blog",
    th: "Blog",
  },
  "nav.faq": {
    screen: "Site menu",
    en: "FAQ",
    th: "FAQ",
  },
  "nav.contact": {
    screen: "Site menu",
    en: "Contact",
    th: "Contact",
  },
  /*
   * The menu's promotional card, at the foot of the drawer. Added 16/08/2026.
   *
   * Only the headline lives here. The card's action reuses the assessment's own
   * label from the table in `cta.ts`, for the same reason `landing.cta` does not
   * exist: a second definition of the same button is a second wording of it.
   *
   * The Thai is built from phrasing already in the approved corpus rather than
   * translated from the English. "ไม่รู้จะเริ่มตรงไหน" is the daily-jobs drafts'
   * own construction, so the card sounds like the group's posts rather than like
   * a website.
   */
  "menu.promo": {
    screen: "Site menu, the card at the foot of the drawer",
    en: "Not sure where to start?",
    th: "ยังไม่รู้ว่าจะเริ่มตรงไหน",
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
  /*
   * Rewritten 17/08/2026, when the home page stopped being an EU Fit Check
   * pitch. All three of the old strings were about the assessment, which was
   * right while it was the only thing the app did and wrong from 04/08/2026,
   * when `AGENTS.md` named the app as the product and the assessment as one
   * feature of it. Paul made the same correction to the share card on
   * 16/08/2026; the page the card points at had not caught up.
   *
   * These four stay here rather than moving to `home.ts` with the rest of the
   * page, and the split is not arbitrary. `verify-copy.ts` runs `lint-thai`
   * over this file and not over the per-page content modules, and the headline
   * and subhead are also the site's default `<title>` and meta description in
   * `(th)/layout.tsx`. The strings carrying the most weight stay where the lint
   * can see them.
   *
   * Reasoning for the page itself is `home-page.md` in the coaching repo's
   * `work-projects/eu-fit-check/`.
   */
  "landing.eyebrow": {
    screen: "Landing, above the headline",
    // Names the business, not the assessment. Same phrasing as the footer's
    // Coaching column heading, which is Paul's.
    en: "Career coaching for Thai professionals heading to Europe",
    // **Paul's wording, 17/08/2026**, from the review sheet. He took
    // `แคเรียร์` off the front: `โค้ชชิ่งด้านอาชีพ` reads as the category, and
    // `แคเรียร์โค้ชชิ่ง` is the service name, which belongs on the card in
    // section 3 rather than in the line that says who this site is for.
    th: "โค้ชชิ่งด้านอาชีพสำหรับคนไทยที่มุ่งสู่การทำงานในยุโรป",
  },
  "landing.headline": {
    screen: "Landing, and the site's default page title",
    // `01_Project_Foundation.md` states the mission as helping Thai
    // professionals go from "I want to work in Europe" to "I have a signed
    // contract". This is that sentence turned to face the reader.
    en: "From the day you thought “I want to work in Europe” to the day you sign a real contract.",
    // **Paul's wording, 17/08/2026.** Two changes, and both are the same move:
    // `จากวันที่คิดว่า` rather than a bare `จาก`, and `สู่วันที่` rather than
    // `ถึงวันที่`, so the sentence runs day to day rather than phrase to day.
    // The reader is placed at a moment they can remember having, which is what
    // the quoted thought was always for.
    //
    // He also put `ที่ยุโรป` back inside the quotation marks, where my revision
    // had corrected it to `ในยุโรป` on the evidence of his own prose. That was
    // the wrong correction to make: the quote is someone thinking out loud, and
    // it should sound like speech rather than like the page around it.
    th: "จากวันที่คิดว่า “อยากไปทำงานที่ยุโรป” สู่วันที่ได้เซ็นสัญญาจ้างจริง",
  },
  "landing.subhead": {
    screen: "Landing, and the site's default meta description",
    en: "PunProfile works alongside Thai professionals who have decided on the European job market, from setting the career direction and reworking the profile through to applying one role at a time.",
    // First mention of the brand in running Thai, so it takes the gloss:
    // LR-01, ปั้นโปรไฟล์ (PunProfile) first, PunProfile alone afterwards.
    //
    // **Paul's wording, 17/08/2026.** `ทำงานร่วมกับ` rather than `ทำงานกับ`,
    // which is the difference between working with someone and working
    // alongside them. `ตลาดงานยุโรป` rather than `ยุโรป`: the decision a reader
    // has made is about a job market, not about a continent. And
    // `การสมัครงานทีละตำแหน่ง` rather than `การลงมือสมัครแต่ละตำแหน่ง`, which
    // says the same thing in three fewer syllables.
    th: "ปั้นโปรไฟล์ (PunProfile) ทำงานร่วมกับคนไทยที่ตัดสินใจแล้วว่าจะมุ่งสู่ตลาดงานยุโรป ตั้งแต่การวางทิศทางอาชีพและปรับโปรไฟล์ ไปจนถึงการสมัครงานทีละตำแหน่ง",
  },
  // No `landing.cta` here. The landing button's label comes from the table in
  // `cta.ts`, which owns every action on every page. A second definition of the
  // same button is a second wording of it, which is the failure this file's
  // one-string-one-place rule exists to prevent.
  "landing.reassurance": {
    screen: "Landing, under the button",
    en: "Under 2 minutes. Your first read straight away, with no sign-up.",
    // Revised by Paul 17/08/2026, from his own 15/08 wording. Three clauses
    // instead of one sentence with a trailing `โดย`, which is the shape the rest
    // of this hero now has.
    th: "ใช้เวลาไม่ถึง 2 นาที รู้ผลเบื้องต้นทันที ไม่ต้องสมัครสมาชิก",
  },

  // ------------------------------------------------------------- assessment
  "assess.starting": {
    screen: "Assessment, while the session is created",
    en: "Starting...",
    th: "กำลังเตรียมข้อมูล...",
  },
  "assess.busy": {
    screen: "Assessment, when the session could not be created. Rate limit or network",
    en: "We couldn't start your assessment just now. Please try again in a moment.",
    th: "ยังเริ่ม EU Fit Check ไม่ได้ในตอนนี้ โปรดลองอีกครั้งในอีกสักครู่",
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
    th: "นอกจากภาษาอังกฤษแล้ว คุณใช้ภาษายุโรปภาษาอื่นได้ไหม",
  },
  "lang.body": {
    screen: "Stage 2, language grid",
    en: "This changes which countries are genuinely open to you.",
    th: "คำตอบนี้มีผลต่อประเทศและตำแหน่งงานที่เปิดรับคุณ",
  },
  "lang.levelLabel": {
    screen: "Stage 2, language grid",
    en: "level",
    th: "ระดับภาษา",
  },
  "lang.scale": {
    screen: "Stage 2, language grid",
    en: "A1 beginner, B2 able to work in it, C2 native-level.",
    th: "A1 ระดับเริ่มต้น, B2 ใช้ในการทำงานได้, C2 เชี่ยวชาญใกล้เคียงเจ้าของภาษา",
  },
  "lang.submit": {
    screen: "Stage 2, language grid",
    en: "Continue",
    th: "ไปต่อ",
  },
  "lang.skip": {
    screen: "Stage 2, language grid",
    en: "I don't speak another",
    th: "ยังพูดภาษาอื่นไม่ได้",
  },

  "teaser.headline": {
    screen: "Teaser, after the last question",
    en: "Here's your first read",
    th: "ผลประเมินความพร้อมเบื้องต้นของคุณ",
  },
  "teaser.selfReported": {
    screen: "Teaser, under the headline. FR-007 requires this to be unmissable",
    en: "Self-reported and preliminary, from your own answers just now.",
    th: "ผลประเมินนี้อ้างอิงจากคำตอบที่คุณให้ไว้",
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
    th: "ขณะนี้มีผู้ติดต่อเข้ามาจำนวนมาก ทีมงานอาจใช้เวลาสักระยะ และจะติดต่อกลับเมื่อถึงคิวของคุณ",
  },
  "teaser.revise": {
    screen: "Teaser, the link back to the last question",
    en: "Go back and change an answer",
    th: "กลับไปแก้ไขคำตอบ",
  },

  // -------------------------------------- the English switch prompt, 16/08/2026
  // Fires once, mid-flow, when a candidate reading in Thai says their English is
  // B1 or better. The flow is already in English by the time this renders, so
  // the Thai column here is only reached if the switch is ever changed back to
  // an offer. Keep it correct anyway; a string that is wrong in the branch
  // nobody takes is wrong on the day somebody takes it.
  "english.switch.title": {
    screen: "Assessment, the panel after the English question is answered B1 or above",
    en: "Let's finish this in English!",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "ทำแบบประเมินต่อเป็นภาษาอังกฤษกันเลย",
  },
  "english.switch.body": {
    screen: "Assessment, the English switch panel",
    en: "You said your English is B1 or better, so we switched the questions over. You can go back to Thai whenever you like.",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "คุณระบุว่าใช้ภาษาอังกฤษได้ระดับ B1 ขึ้นไป เราเลยเปลี่ยนคำถามเป็นภาษาอังกฤษให้ และเปลี่ยนกลับเป็นภาษาไทยได้ทุกเมื่อ",
  },
  "english.switch.stay": {
    screen: "Assessment, the English switch panel, the primary button",
    en: "Continue in English",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "ทำต่อเป็นภาษาอังกฤษ",
  },
  "english.switch.revert": {
    screen: "Assessment, the English switch panel, the way back",
    // The English column carries the Thai too, because this is the one button
    // whose reader is by definition the person not reading the English around
    // it. An identical-in-both-columns passthrough would have said the same
    // thing more cleanly and needs a termbase entry to be allowed, which is
    // Paul's to decide rather than mine to add.
    en: "Back to Thai (ภาษาไทย)",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "กลับไปใช้ภาษาไทย",
  },

  // ------------------------------------------------- the chart card, 16/08/2026
  // The radar used to sit on a bare surface with nothing naming it and nothing
  // stating the four numbers. A radar is a shape, not a reading: two axes an
  // eyeball apart can be 0.4 apart, and a screen reader gets nothing at all
  // from the polygon. The legend under it is the accessible form PRD § 7 asks
  // for and the thing a candidate can actually quote to someone.
  "teaser.chart.heading": {
    screen: "First read, the title of the card the chart sits in",
    en: "Skills and readiness",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "ทักษะและความพร้อม",
  },
  "teaser.score.value": {
    screen: "First read, one dimension's score in the legend. {score} is one decimal, the scale is not",
    en: "{score}/5",
    th: "{score}/5",
  },
  "teaser.score.none": {
    screen: "First read, the legend entry for a dimension the answers could not reach",
    // Never a zero and never a dash. A dash reads as a broken field; a zero is
    // a claim. This says the honest thing, which is that we did not measure it.
    en: "Not measured yet",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "ยังไม่สามารถประเมินได้",
  },

  // --------------------------------------------- the readiness stack, 16/08/2026
  // Three shares that all point the same way, shown together because that is
  // the whole argument: what separates this group from a European shortlist is
  // presentation, not ability. One of them alone is an anecdote.
  "stats.readiness.label": {
    screen: "First read, the title of the readiness card",
    en: "Where this group stands on the three things a recruiter checks first",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "ความพร้อม 3 อย่างแรกที่ผู้จ้างงานดู",
  },
  "stats.readiness.cv": {
    screen: "First read, readiness bar 1",
    en: "CV not yet written for the European market",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "เรซูเม่ยังไม่ได้ปรับให้ตรงกับตลาดยุโรป",
  },
  "stats.readiness.portfolio": {
    screen: "First read, readiness bar 2",
    en: "No portfolio or work anyone can look at",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "ยังไม่มีผลงานให้ผู้จ้างงานดู",
  },
  "stats.readiness.linkedin": {
    screen: "First read, readiness bar 3",
    en: "LinkedIn empty or barely filled in",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "โปรไฟล์ LinkedIn ยังไม่สมบูรณ์",
  },
  "stats.readiness.foot": {
    screen: "First read, under the readiness bars",
    // Same rule as every other share in `stats.ts`: the denominator is the
    // people who answered that question, not everyone.
    en: "From the people who answered each question.",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "อ้างอิงจากผู้ที่ตอบคำถามแต่ละข้อ",
  },
  "stats.timing": {
    screen: "First read, the timing sentence. {waiting} and {soon} are percentages",
    // The two halves are only worth saying together. Separately they are
    // demographics; together they name the tension the product sits inside.
    en: "{waiting}% have not started applying yet, and {soon}% want to be in Europe within three months.",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "{waiting}% ยังไม่ได้เริ่มสมัครงาน และ {soon}% ตั้งใจไปยุโรปภายใน 3 เดือน",
  },

  // ------------------------------------------- the job pipeline proof, 16/08/2026
  // The only figure on this screen that is about PunProfile doing work rather
  // than about the candidate or the crowd. Numbers come from a dated snapshot
  // of `job-log.json`, and the date is printed because a screening figure with
  // no window is a boast.
  "stats.market.label": {
    screen: "First read, the title of the job-pipeline card",
    en: "Jobs we screened for this group",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "งานที่เราคัดกรองให้กลุ่มนี้",
  },
  "stats.market.screened": {
    screen: "First read, the label under the count of roles read",
    en: "roles read",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul. The words are
    // lifted from the sentence this replaced rather than composed fresh.
    th: "ประกาศงานที่อ่าน",
  },
  "stats.market.published": {
    screen: "First read, the label under the count that cleared the sponsorship bar",
    en: "cleared the visa-sponsorship bar",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "ผ่านเกณฑ์สปอนเซอร์วีซ่า",
  },
  "stats.market.foot": {
    screen: "First read, under the job-pipeline figures. {to} is the snapshot date",
    en: "Last updated {to}",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "อัปเดตล่าสุด {to}",
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
    th: "ข้อมูลจากผู้ที่ทำแบบประเมินนี้ทั้งหมด",
  },
  "stats.countries.label": {
    screen: "First read, the top-countries stat",
    en: "The five countries this group is aiming at",
    th: "5 ประเทศเป้าหมายยอดนิยม",
  },
  "stats.countries.foot": {
    screen: "First read, under the top-countries list",
    // No sample size, on Paul's call 14/08/2026: the number of people who have
    // taken the check is PunProfile's own information. What survives is WHO
    // was counted, which is the part that stops a ranking being read as a
    // claim about Europe rather than about this group.
    en: "From people who took the EU Fit Check and named a target country.",
    th: "อ้างอิงจากผู้ที่ทำ EU Fit Check และระบุประเทศเป้าหมาย",
  },
  // The three `stats.languages.*` strings were removed on 16/08/2026 with the
  // card they belonged to. `verify-copy.ts` fails on a defined-but-unused key,
  // which is what forced the choice rather than letting them rot here. The
  // query still computes `mostLanguages`; if the figure ever earns a place back,
  // the wording is in this file's git history.
  "stats.percentile": {
    screen: "First read, the personal comparison. Completes the big percentage above it",
    // The one sentence on this screen that is about the candidate rather than
    // the pool, which is why it sits with the stats rather than in the
    // narrative: the narrative is selected from a bank and cannot say this.
    //
    // **Rewritten 16/08/2026 for the redesign, and it needs Paul's read.** The
    // figure is now set large on its own line, so the sentence completes it
    // instead of containing it. Printing the old string under a big "55%" would
    // have shown the same number twice in three words of each other. `{n}` is
    // gone from the text for that reason; `{dimension}` stays.
    en: "of the people here score lower than you on {dimension}.",
    // TH-UNREVIEWED: added 16/08/2026, not yet read back by Paul.
    th: "ของผู้ทำแบบประเมินกลุ่มนี้ มีคะแนนด้าน {dimension} ต่ำกว่าคุณ",
  },
  "stats.percentile.foot": {
    screen: "First read, under the percentile line",
    en: "Compared on self-reported answers, the same as yours.",
    th: "อ้างอิงจากข้อมูลที่ผู้ทำแบบประเมินทั้งหมด",
  },

  // ------------------------------------------------------------- services CTA
  "services.cta.heading": {
    screen: "First read, the secondary CTA to /services",
    en: "While you wait",
    th: "ในระหว่างรอการติดต่อกลับจากเรา",
  },
  "services.cta.body": {
    screen: "First read, the secondary CTA to /services",
    // Pitched at the wait, not at the sale. The candidate has just been told
    // there is a queue; the honest offer is something to read, and a page that
    // explains what the coaching actually is does more for a later call than a
    // second booking button on the same screen.
    en: "Here is what working with PunProfile actually involves, and which part of it your result points at.",
    th: "ทำความรู้จักแนวทางการทำงานของปั้นโปรไฟล์ และดูว่าบริการไหนเหมาะกับเป้าหมายของคุณ",
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
    th: "ทักษะในสายงาน",
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
    th: "ดูผลเบื้องต้นได้เลย",
  },
  "gate.working": {
    screen: "Contact gate, submit button while the write is in flight",
    en: "Working...",
    th: "กำลังบันทึกข้อมูล...",
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
    th: "อีเมลไม่ถูกต้อง",
  },
  "gate.error.channel_required": {
    screen: "Contact gate, when neither LINE nor phone was given",
    en: "Please add a LINE ID or a phone number.",
    th: "กรอก Line ID หรือหมายเลขโทรศัพท์อย่างน้อย 1 ช่องทาง",
  },
  "gate.error.consent_email": {
    screen: "Contact gate, when email consent is unticked",
    en: "We need your permission before we can send anything.",
    th: "ติ๊กยินยอมให้ส่งผลทางอีเมลก่อน",
  },
  "gate.error.consent_phone": {
    screen: "Contact gate, when a phone was given without consent",
    en: "Tick the consent for phone, or clear the number.",
    th: "ติ๊กยินยอมให้โทรหาคุณ",
  },
  "gate.error.consent_line": {
    screen: "Contact gate, when a LINE ID was given without consent",
    en: "Tick the consent for LINE, or clear the ID.",
    th: "ติ๊กยินยอมให้ทัก Line หาคุณ",
  },
  "gate.error.unknown": {
    screen: "Contact gate, any failure with no specific cause. Network, mostly",
    en: "That didn't go through. Please try again.",
    th: "ส่งข้อมูลไม่สำเร็จ โปรดลองอีกครั้ง",
  },

  // ------------------------------------------------------- full result screen
  "result.startWith": {
    screen: "Full result, fallback next step when no specific action matches. {area} substituted",
    en: "Start with {area}.",
    th: "เรื่องที่ควรให้ความสำคัญก่อน: {area}",
  },
  "result.measured": {
    screen: "Full result, the coverage line. {count}, {total} and {more} are substituted",
    en: "Your answers measure {count} of {total} areas. A 30-minute conversation can measure {more} more, the parts no form can see.",
    th: "จากคำตอบของคุณ เราประเมินได้ {count} จาก {total} ด้าน การพูดคุย 30 นาทีจะช่วยประเมินเพิ่มได้อีก {more} ด้าน รวมถึงรายละเอียดที่แบบฟอร์มนี้ยังสะท้อนไม่ได้",
  },
  "result.caveat": {
    screen: "Full result, the persistent honesty line. FR-007 requires it to be unmissable",
    en: "Everything here is self-reported and preliminary. It is a first read of where you stand, not a verdict.",
    th: "นี่คือผลประเมินเบื้องต้นจากข้อมูลที่คุณให้มา เพื่อช่วยให้เห็นว่าตอนนี้คุณอยู่ตรงไหน ไม่ใช่ข้อสรุปตายตัว",
  },

  // The journey checklist. Statuses are computed; these are the step names.
  "step.unanswered": {
    screen: "Full result, on a step nothing has been answered for yet",
    en: "Two quick answers and this fills in",
    th: "ตอบเพิ่มอีกไม่กี่ข้อเพื่อดูผลในส่วนนี้",
  },
  "step.targetClarity": {
    screen: "Full result, journey checklist step",
    en: "Pick one target country and role",
    th: "กำหนดประเทศและตำแหน่งงานเป้าหมายให้ชัดเจน",
  },
  "step.cvStatus": {
    screen: "Full result, journey checklist step",
    en: "Get your CV Europe-ready",
    th: "ปรับ CV ให้พร้อมสมัครงานในตลาดยุโรป",
  },
  "step.linkedinStatus": {
    screen: "Full result, journey checklist step",
    en: "Make LinkedIn active and findable",
    th: "อัปเดต LinkedIn ให้เป็นปัจจุบันมีความเคลื่อนไหว และค้นเจอง่าย",
  },
  "step.visaReadiness": {
    screen: "Full result, journey checklist step",
    en: "Know your visa route by name",
    th: "ตรวจสอบว่าเส้นทางวีซ่าแบบใดเหมาะกับคุณ",
  },
  "step.languageReadiness": {
    screen: "Full result, journey checklist step",
    en: "Keep your English moving",
    th: "ฝึกใช้ภาษาอังกฤษอย่างต่อเนื่อง",
  },
  "step.portfolioEvidence": {
    screen: "Full result, journey checklist step",
    en: "Show some work you are proud of",
    th: "เตรียมผลงานที่แสดงทักษะและประสบการณ์ได้",
  },
  "step.applicationActivity": {
    screen: "Full result, journey checklist step",
    en: "Get applications going out",
    th: "เริ่มส่งใบสมัคร",
  },

  // ---------------------------------------------- the candidate's PDF, 17/08/2026
  // The report the coach sends after the call. It is the same document as the
  // coach's own copy with the internals taken out, so most of what it says is
  // already keyed above: the honesty line, the coverage line, the step names,
  // the competency and dimension names. What is here is only what the printed
  // document adds — its section headings, its table headers, and its footing.
  //
  // These belong in this file and not beside the coach report, because they are
  // the one part of that document a candidate reads. The rule at the top of the
  // file still holds for everything else in it: coach-report strings are English
  // on purpose and stay out of here.
  "report.competency": {
    screen: "Candidate PDF, the score table's first column header",
    en: "What we looked at",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "หัวข้อที่ประเมิน",
  },
  "report.score": {
    screen: "Candidate PDF, the score table's second column header",
    en: "Score",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "คะแนน",
  },
  "report.unmeasured": {
    screen: "Candidate PDF, under a dimension's table. {count} is substituted",
    // Says what is missing and why, in the candidate's own terms. The coach's
    // copy names each blank item individually; this names the number, which is
    // the honest form of the same fact without listing things they cannot act on.
    en: "{count} more things in this area need a conversation rather than a form, so they are left blank rather than guessed at.",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "ในด้านนี้ยังมีอีก {count} หัวข้อที่ต้องใช้การพูดคุยจึงจะประเมินได้ เราจึงเว้นไว้แทนการเดา",
  },
  "report.strengths": {
    screen: "Candidate PDF, section heading over the strengths list",
    en: "What you already have",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "จุดแข็งของคุณ",
  },
  "report.priorities": {
    screen: "Candidate PDF, section heading over the development list",
    en: "Where the gains are",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "สิ่งที่ควรพัฒนาต่อ",
  },
  "report.next": {
    screen: "Candidate PDF, section heading over the closing card",
    en: "What happens next",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "ขั้นตอนต่อไป",
  },
  "report.footer": {
    screen: "Candidate PDF, the footing on the last page",
    en: "Prepared by PunProfile Career Coaching from the answers you gave. A 30-minute conversation covers the parts a form cannot see.",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "จัดทำโดย PunProfile Career Coaching จากคำตอบที่คุณให้ไว้ การพูดคุย 30 นาทีจะช่วยประเมินในส่วนที่แบบฟอร์มยังสะท้อนไม่ได้",
  },
  "report.savePdf": {
    screen: "Candidate PDF, the button that reopens the print dialog. Screen only, never printed",
    en: "Save as PDF",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "บันทึกเป็น PDF",
  },

  // ------------------------------------------------ confidence bands, 17/08/2026
  // `model.ts` carries these three sentences in English for the coach report.
  // The candidate's PDF says the same thing to a different reader, so it reads
  // them from here instead. Two wordings of one fact, which is allowed because
  // the audiences differ; the BAND itself is computed once, in `bandFor`.
  "band.moderate": {
    screen: "Candidate PDF, under a dimension score, when coverage is 45% or better",
    en: "reasonably well covered by what you told us",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "ประเมินได้ค่อนข้างครบจากคำตอบของคุณ",
  },
  "band.limited": {
    screen: "Candidate PDF, under a dimension score, when coverage is 25% to 45%",
    en: "a partial read, several areas are still unmeasured",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "ประเมินได้บางส่วน ยังมีอีกหลายหัวข้อที่ยังประเมินไม่ได้",
  },
  "band.indicative": {
    screen: "Candidate PDF, under a dimension score, when coverage is under 25%",
    en: "an early indication only, most of this needs a real conversation",
    // TH-UNREVIEWED: added 17/08/2026, not yet read back by Paul.
    th: "เป็นเพียงภาพเบื้องต้น ส่วนใหญ่ยังต้องใช้การพูดคุยเพิ่มเติม",
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
    th: "การเรียนรู้และพัฒนาทักษะ",
  },
  "item.searchFollowThrough": {
    screen: "Named when this is the candidate's strongest area",
    en: "Search Follow-through",
    th: "การลงมือหางานอย่างต่อเนื่อง",
  },
  "item.aiDigitalFluency": {
    screen: "Named when this is the candidate's strongest area",
    en: "AI & Digital Fluency",
    th: "ทักษะการใช้ AI และเครื่องมือ Digital",
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
    th: "ความพร้อมของ Portfolio",
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
