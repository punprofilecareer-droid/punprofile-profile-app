/**
 * Raw answer text → canonical values.
 *
 * Every parser here returns `null` for anything it does not recognise. Nothing
 * guesses. An unrecognised answer drops that item out of its dimension's mean,
 * which is the honest outcome — a wrong score is worse than a missing one.
 *
 * The vocabularies below are taken from the live Google Form option sets plus
 * every free-text variant actually observed in the 63 responses received from
 * 07/07/2026 onward. See `docs/self-report-scoring.md` § Data quality notes.
 */

/** Canonical, question-keyed response. This is what `scoring.ts` consumes. */
export interface SurveyResponse {
  /** Q6 — years of professional experience, as a band. */
  experienceYears?: "0-1" | "2-10" | "11-15" | "16+" | null;
  /** Q7 — target countries in Europe, one entry per country named. */
  targetCountries?: string[];
  /** Q8 — target role or industry, free text. */
  targetRole?: string | null;
  /** Q10 — when they want to start. */
  timeline?: "within_3m" | "3_6m" | "6_12m" | "exploring" | null;
  /** Q11 — current stage of the job search. */
  stage?: "not_started" | "researching" | "applying" | "interviewing" | "offer" | "negotiating" | null;
  /** Q12 — roles applied to in Europe so far. */
  applicationCount?: number | null;
  /** Q13 — CV status. */
  cv?: "none" | "untailored" | "europe_ready" | null;
  /** Q14 — LinkedIn status. */
  linkedin?: "none" | "basic" | "active" | null;
  /** Q15 — portfolio site. */
  portfolio?: "none" | "partial" | "good" | null;
  /** Q16 — English level, resolved to CEFR. */
  englishCefr?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  /** Q17 — other European languages, highest CEFR level reached in any of them. */
  otherLanguageCefr?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  /** Q18 — work authorisation. */
  workAuth?: "eu_rights" | "sponsor_route_named" | "sponsor_no_route" | "unsure" | "no_awareness" | null;
  /**
   * Q21 — prior investment in courses, certifications or coaching.
   * `unclassified` is for the free-text era of this question (before it became a
   * dropdown): the answer describes real investment, but whether it's relevant
   * to the target field is a judgment the parser must not make.
   */
  priorInvestment?: "none" | "unrelated" | "relevant" | "unclassified" | null;
  /** Q32 — AI & digital fluency indicators ticked, 0-4. Null when unanswered. */
  aiIndicators?: number | null;
  /**
   * Q32 — WHICH indicators are met, in `AI_INDICATOR_LABELS` order. The count
   * above is what scoring compresses to; the flags are what a tactic plan needs
   * back, because "adopt indicator 3" is only prescribable if we know 3 is the
   * missing one. Evidence stays granular; scores compress.
   */
  aiIndicatorFlags?: boolean[] | null;
  /** Q33 — has a partner or dependents who would relocate. */
  hasDependents?: boolean | null;
  /** Q34 — family readiness indicators ticked, 0-4. Null when unanswered. */
  familyIndicators?: number | null;
  /** Q34 — which family indicators are met, same granularity rule as Q32. */
  familyIndicatorFlags?: boolean[] | null;
  /** Q35 — expected salary, free text. */
  salaryText?: string | null;
}

const norm = (s: unknown): string =>
  String(s ?? "")
    .replace(/\\/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** True when the cell is blank or one of the placeholder marks seen in the sheet. */
function isBlank(raw: unknown): boolean {
  const s = norm(raw);
  return s === "" || s === "-" || s === "–" || s === "n/a" || s === "na" || s === "none of these";
}

// ---------------------------------------------------------------- Q6 years

export function parseExperienceYears(raw: unknown): SurveyResponse["experienceYears"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (s.includes("16+")) return "16+";
  if (s.includes("11–15") || s.includes("11-15")) return "11-15";
  if (s.includes("2–10") || s.includes("2-10")) return "2-10";
  if (/(^|\D)0\s*[–-]\s*1(\D|$)/.test(s)) return "0-1";
  // Early responses answered this as a free-text number: "8", "5 years", "7 years +".
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n < 0 || n > 60) return null;
  if (n <= 1) return "0-1";
  if (n <= 10) return "2-10";
  if (n <= 15) return "11-15";
  return "16+";
}

// ------------------------------------------------------------ Q7 countries

const COUNTRY_ALIASES: Record<string, string> = {
  netherlands: "Netherlands", netherland: "Netherlands", nl: "Netherlands", holland: "Netherlands", dutch: "Netherlands",
  germany: "Germany", german: "Germany", de: "Germany", deutschland: "Germany",
  france: "France", french: "France",
  denmark: "Denmark", danish: "Denmark",
  sweden: "Sweden", swedish: "Sweden",
  norway: "Norway", norwegian: "Norway",
  finland: "Finland",
  spain: "Spain", spanish: "Spain",
  portugal: "Portugal",
  italy: "Italy",
  ireland: "Ireland",
  belgium: "Belgium",
  switzerland: "Switzerland",
  austria: "Austria",
  poland: "Poland",
  "czech republic": "Czech Republic", czechia: "Czech Republic",
  luxembourg: "Luxembourg",
  iceland: "Iceland",
  estonia: "Estonia", latvia: "Latvia", lithuania: "Lithuania",
  greece: "Greece", croatia: "Croatia", hungary: "Hungary", romania: "Romania",
  "united kingdom": "United Kingdom", uk: "United Kingdom", england: "United Kingdom",
  เนเธอร์แลนด์: "Netherlands", ฮอลแลนด์: "Netherlands",
  เยอรมนี: "Germany", เยอรมัน: "Germany", ฝรั่งเศส: "France",
  เดนมาร์ก: "Denmark", สวีเดน: "Sweden", นอร์เวย์: "Norway", ฟินแลนด์: "Finland",
  สเปน: "Spain", อิตาลี: "Italy", ไอร์แลนด์: "Ireland", เบลเยียม: "Belgium",
  // Spellings here are deliberately loose prefixes: real answers include
  // "สวิสแลนด์" and "ไอซ์แลน", neither of which is the dictionary form.
  สวิส: "Switzerland", สวิต: "Switzerland",
  ไอซ์แลน: "Iceland", ไอซ์แลนด์: "Iceland",
  ออสเตรีย: "Austria", โปแลนด์: "Poland", โปรตุเกส: "Portugal",
  ลักเซมเบิร์ก: "Luxembourg", สาธารณรัฐเช็ก: "Czech Republic",
};

/** "Netherlands Germany France" and "Netherland, France, Germany" both work. */
export function parseCountries(raw: unknown): string[] {
  const s = String(raw ?? "");
  if (isBlank(s)) return [];
  const found = new Set<string>();
  const hay = norm(s);
  for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) {
    // Latin aliases need word boundaries; Thai script has no \b, so match directly.
    const isThai = /[฀-๿]/.test(alias);
    const re = isThai
      ? new RegExp(alias, "u")
      : new RegExp(`(^|[^a-z])${alias}([^a-z]|$)`, "u");
    if (re.test(hay)) found.add(canonical);
  }
  // "anywhere in the EU" is a real answer but names no country — deliberately empty.
  return [...found].sort();
}

// ------------------------------------------------------------- Q10 timeline

export function parseTimeline(raw: unknown): SurveyResponse["timeline"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (s.includes("within 3") || s.includes("ภายใน 3")) return "within_3m";
  if (s.includes("3–6") || s.includes("3-6")) return "3_6m";
  if (s.includes("6–12") || s.includes("6-12")) return "6_12m";
  if (s.includes("exploring") || s.includes("ยังไม่แน่ใจ")) return "exploring";
  return null;
}

// ---------------------------------------------------------------- Q11 stage

export function parseStage(raw: unknown): SurveyResponse["stage"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (s.includes("negotiating") || s.includes("เจรจา")) return "negotiating";
  if (s.includes("has offer") || s.includes("ได้รับข้อเสนอ")) return "offer";
  if (s.includes("interviewing") || s.includes("สัมภาษณ์")) return "interviewing";
  if (s.includes("applying") || s.includes("กำลังสมัคร")) return "applying";
  if (s.includes("researching") || s.includes("หาข้อมูล")) return "researching";
  if (s.includes("haven't started") || s.includes("ยังไม่เริ่ม")) return "not_started";
  return null;
}

// -------------------------------------------------------- Q12 applications

const ZERO_EXACT = ["0", "none", "not yet", "no", "nope", "never", "ไม่มี", "ยังค่ะ", "ยังครับ"];
/** Phrases that mean "haven't applied", anywhere in a longer sentence. */
const ZERO_PHRASES = [
  "ยังไม่ได้สมัคร", "ยังไม่เคยสมัคร", "ยังไม่ได้", "ยังไม่มี", "ยังไม่เคย",
  "เพิ่งเริ่มหางาน", "กำลังเริ่มหางาน", "กำลังหางาน",
  "haven't applied", "havent applied", "haven’t applied", "not applied", "no applications",
];
const MANY_PHRASES = ["เยอะ", "หลาย", "many", "a lot", "large number", "numerous", "20 กว่า"];

export function parseApplicationCount(raw: unknown): number | null {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (ZERO_EXACT.includes(s)) return 0;
  if (ZERO_PHRASES.some((p) => s.includes(p))) return 0;
  const m = s.match(/(\d+)/);
  if (m) {
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n >= 0 && n <= 2000 ? n : null;
  }
  // "เยอะมากค่ะ" (a lot) states volume without a number — real signal, not a count.
  // Floored at 20 so it lands in the same band as any explicit high number; the
  // exact figure is unrecoverable and the band is all the scorer uses.
  if (MANY_PHRASES.some((p) => s.includes(p))) return 20;
  return null;
}

// ------------------------------------------------------ Q13/Q14/Q15 profile

export function parseCv(raw: unknown): SurveyResponse["cv"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (s.includes("europe-ready") || s.includes("พร้อมใช้สมัครงานยุโรป")) return "europe_ready";
  if (s.includes("not tailored") || s.includes("ยังไม่ปรับ")) return "untailored";
  if (s.includes("ยังไม่มี") || /^no\b/.test(s)) return "none";
  return null;
}

export function parseLinkedin(raw: unknown): SurveyResponse["linkedin"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (s.includes("active and optimized") || s.includes("อัพเดทสม่ำเสมอ")) return "active";
  if (s.includes("but basic") || s.includes("ไม่ได้อัพเดต")) return "basic";
  if (s.includes("ยังไม่มี") || s.includes("none")) return "none";
  return null;
}

export function parsePortfolio(raw: unknown): SurveyResponse["portfolio"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (s.includes("high quality") || s.includes("อยู่ในระดับที่ดี")) return "good";
  if (s.includes("partial") || s.includes("มีบางส่วน")) return "partial";
  if (s.includes("ยังไม่มี") || /(^|\W)no(\W|$)/.test(s)) return "none";
  return null;
}

// -------------------------------------------------------------- Q16/Q17 CEFR

type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
const CEFR_ORDER: Cefr[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Q16 was answered in at least five vocabularies: Thai terms, English terms,
 * bare CEFR levels, and test scores. Test scores map through the standard
 * concordances (IELTS, TOEIC listening+reading, TOEFL iBT).
 */
export function parseCefr(raw: unknown): Cefr | null {
  const s = norm(raw);
  if (isBlank(s)) return null;

  const ielts = s.match(/ielts[^\d]{0,12}(\d(?:\.\d)?)/);
  if (ielts) {
    const b = parseFloat(ielts[1]);
    if (b >= 8.5) return "C2";
    if (b >= 7.0) return "C1";
    if (b >= 5.5) return "B2";
    if (b >= 4.0) return "B1";
    return "A2";
  }
  const toeic = s.match(/toeic[^\d]{0,12}(\d{2,4})/);
  if (toeic) {
    const n = parseInt(toeic[1], 10);
    if (n >= 945) return "C1";
    if (n >= 785) return "B2";
    if (n >= 550) return "B1";
    if (n >= 225) return "A2";
    return "A1";
  }
  const toefl = s.match(/toefl[^\d]{0,20}(\d{1,3})/);
  if (toefl) {
    const n = parseInt(toefl[1], 10);
    if (n >= 110) return "C2";
    if (n >= 95) return "C1";
    if (n >= 72) return "B2";
    if (n >= 42) return "B1";
    return "A2";
  }

  // An explicit CEFR level anywhere in the answer wins over the word-based match,
  // so "Fluent (Cambridge C2)" resolves to C2 rather than C1.
  const cefr = s.toUpperCase().match(/\b([ABC][12])\b/);
  if (cefr) return cefr[1] as Cefr;

  if (s.includes("native") || s.includes("เจ้าของภาษา")) return "C2";
  if (s.includes("fluent") || s.includes("proficient") || s.includes("คล่องแคล่ว") || s.includes("คล่อง")) return "C1";
  // "Intermediate - Upper Intermediate" resolves to the lower of the two claimed
  // levels; a self-declared range is not evidence of its top end.
  if (s.includes("upper intermediate") && !s.includes("intermediate -") && !s.includes("intermediate –")) return "B2";
  if (s.includes("conversational") || s.includes("intermediate") || s.includes("สื่อสารได้") || s.includes("พอสื่อสาร")) return "B1";
  if (s.includes("basic") || s.includes("พื้นฐาน") || s.includes("เบื้องต้น")) return "A2";
  if (s.includes("beginner") || s.includes("เล็กน้อย") || s.includes("นิดหน่อย")) return "A1";
  // "Good", "OK" and similar are self-ratings against no scale — deliberately unparsed.
  return null;
}

/** Q17 is one column per language; the highest level reached in any of them wins. */
export function parseBestOtherLanguage(raws: unknown[]): Cefr | null {
  let best: Cefr | null = null;
  for (const raw of raws) {
    const c = parseCefr(raw);
    if (c && (!best || CEFR_ORDER.indexOf(c) > CEFR_ORDER.indexOf(best))) best = c;
  }
  return best;
}

// ----------------------------------------------------------- Q18 work auth

/** Existing residence or work rights in an EU/EEA state — the framework's 5. */
const HAS_RIGHTS = /eu passport|พาสปอร์ต eu|work rights|permanent resident|permesso|aufenthaltstitel|verblijfsvergunning|residence permit|settled status|dual citizen|สองสัญชาติ|มีสัญชาติ/;

/** A named, specific route to the right to work — the framework's 4. */
const NAMED_ROUTE =
  /blue card|blue-card|opportunity card|chancenkarte|highly skilled|kennismigrant|search year|zoekjaar|orientation year|eu ict|job seek(er|ing)|post ?grad(uate)? visa|graduate visa|spouse visa|marriage visa|family reunification|วีซ่าติดตาม|จะแต่งงาน|will get married|working holiday/;

export function parseWorkAuth(raw: unknown): SurveyResponse["workAuth"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (HAS_RIGHTS.test(s)) return "eu_rights";
  // A named route outranks a bare "I need sponsorship", and is checked first so
  // "need sponsorship, applying for the Blue Card" scores as the route it names.
  if (NAMED_ROUTE.test(s)) return "sponsor_route_named";
  // "สปอ[นร]" rather than the full word: the spelling varies in real answers
  // ("สปอนเซอร์", "สปอร์นเซอร์", "สปอนวีซ่า").
  if (s.includes("sponsor") || /สปอ[นร]/.test(s) || s.includes("ต้องการวีซ่า")) return "sponsor_no_route";
  if (s.includes("unsure") || s.includes("ยังไม่แน่ใจ") || s.includes("not sure")) return "unsure";
  if (s.includes("student visa") || s.includes("work permit")) return "sponsor_no_route";
  // Naming a non-EU passport answers the question: sponsorship is needed, and no
  // route was named.
  if (s.includes("พาสปอร์ตไทย") || s.includes("thai passport") || s.includes("เป็นคนไทย")) return "sponsor_no_route";
  // A bare "ไม่มี" / "No" here is ambiguous — it could mean "no work rights" or
  // "no idea what's needed", which score 3 and 1. Left unparsed rather than guessed.
  return null;
}

// ------------------------------------------------------- Q21 prior investment

const NEVER_INVESTED = /never invested|ไม่เคยลงทุน|^ไม่เคย|^never$|^no$|^no,? i have not|^nope|^ไม่มี/;

export function parsePriorInvestment(raw: unknown): SurveyResponse["priorInvestment"] {
  const s = norm(raw);
  if (isBlank(s)) return null;
  // The dropdown options, added later, are unambiguous — check them first.
  if (s.includes("but unrelated") || s.includes("ไม่เกี่ยวข้อง")) return "unrelated";
  if (s.includes("and relevant") || s.includes("เกี่ยวข้องกับสายงาน")) return "relevant";
  if (NEVER_INVESTED.test(s)) return "none";
  // Free-text era: an answer naming actual courses, certifications or a diploma
  // is real investment. Whether it's relevant to the target field is a coach
  // judgment, so it scores the neutral middle rather than being read either way.
  if (/^yes|course|cert|diploma|licen[cs]e|training|bootcamp|specialization|program|คอร์?ส|เรียน|อบรม|ศึกษา|ลงทุน|ใบรับรอง|ใบประกอบ|^เคย/.test(s)) {
    return "unclassified";
  }
  return null;
}

// ---------------------------------------------- Q32/Q33/Q34 checkbox groups

/**
 * Checkbox questions arrive as one comma-joined string. Counting commas would
 * miscount — several option texts contain commas of their own ("Slack, Teams,
 * Notion") — so each indicator is matched by its own distinctive phrase.
 */
const AI_INDICATORS = [
  /ai tools \(e\.g\. chatgpt\) for search-related tasks weekly|ค้นหาข้อมูลเป็นประจำทุกสัปดาห์/,
  /core eu workplace tools|เครื่องมือทำงานสากล/,
  /used ai to tailor|เคยใช้ ai ปรับ/,
  /on my own initiative|ด้วยตัวเอง ไม่ใช่เพราะถูกบังคับ/,
];

const FAMILY_INDICATORS = [
  /discussed the relocation with all affected|ได้พูดคุยเรื่องการย้ายกับสมาชิกครอบครัว/,
  /no unresolved objection|ไม่มีข้อคัดค้าน/,
  /plan for dependents|have a plan|มีแผนรองรับ/,
  /accounts for family logistics|คำนึงถึงเรื่องครอบครัว/,
];

function indicatorFlags(raw: unknown, patterns: RegExp[]): boolean[] | null {
  if (isBlank(raw)) return null; // unanswered is not zero
  const s = norm(raw);
  return patterns.map((re) => re.test(s));
}

/** Candidate-facing names for the Q32 indicators, index-aligned with the flags. */
export const AI_INDICATOR_LABELS = [
  "Use AI tools weekly for job-search research",
  "Get comfortable with core EU workplace tools (Slack, Teams, Notion)",
  "Use AI to tailor a CV or cover letter to a specific role",
  "Adopt one new digital tool on your own initiative",
] as const;

export const parseAiIndicatorFlags = (raw: unknown) => indicatorFlags(raw, AI_INDICATORS);
export const parseFamilyIndicatorFlags = (raw: unknown) => indicatorFlags(raw, FAMILY_INDICATORS);

const count = (f: boolean[] | null) => (f ? f.filter(Boolean).length : null);
export const parseAiIndicators = (raw: unknown) => count(parseAiIndicatorFlags(raw));
export const parseFamilyIndicators = (raw: unknown) => count(parseFamilyIndicatorFlags(raw));

export function parseHasDependents(raw: unknown): boolean | null {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (s.includes("no – i'm single") || s.includes("no - i'm single") || s.includes("ไม่มี –") || s.includes("ไม่มี -")) return false;
  if (s.includes("yes – i have") || s.includes("yes - i have") || s.includes("มี –") || s.includes("มี -")) return true;
  return null;
}

// --------------------------------------------------------------- Q35 salary

export interface SalaryShape {
  hasFigure: boolean;
  hasCurrency: boolean;
  hasPeriod: boolean;
}

/** Deliberately measures only whether a usable figure exists, never whether it's realistic. */
export function parseSalaryShape(raw: unknown): SalaryShape | null {
  const s = norm(raw);
  if (isBlank(s)) return null;
  if (/^(depends|tbc|tbd|not sure|ยังไม่แน่ใจ|แล้วแต่)/.test(s)) return { hasFigure: false, hasCurrency: false, hasPeriod: false };
  const hasFigure = /\d{3,}|\d+\s*k\b|\d+\s*,\d{3}/.test(s);
  const hasCurrency = /eur|euro|ยูโร|€|thb|baht|บาท|gbp|£|usd|\$|dkk|sek|nok|chf|pln|kr\b/.test(s);
  const hasPeriod = /month|monthly|annual|annually|year|yearly|per year|p\.a\.|ต่อเดือน|ต่อปี|\/\s*(month|year|mo|yr)/.test(s);
  return { hasFigure, hasCurrency, hasPeriod };
}
