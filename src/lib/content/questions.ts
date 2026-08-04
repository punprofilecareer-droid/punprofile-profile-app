/**
 * TASK-051: the staged questionnaire, as data.
 *
 * Decided 04/08/2026: this app absorbs both Google instruments. Every question
 * lives here with CANONICAL answer values, the same vocabulary `ScoringInput`
 * speaks, so the app never parses free text; the fuzzy parsers in
 * `normalize.ts` serve only the historical backfill.
 *
 * Stage 1 is the pre-email set: 9 questions including pathway, under the
 * 10-question cap from PRD § 1, tap-only, covering the old quiz's six topics
 * and feeding the teaser chart. Stage 2 (post-unlock) lands in Phase 2.
 *
 * Copy: `en` is the working draft. `th` ships ONLY after the consolidated
 * native-tone pass (TASK-052) against `03_Content_System.md`; empty string
 * means "not yet reviewed", and the UI falls back to English.
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
  en: string;
  th: string;
  options: Option[];
}

/**
 * Role categories come from the Job Title Pool in `08_Coaching_Business.md`,
 * as observed in the live Candidates Master lookup tab. Categories, not free
 * text: Target Clarity needs "a role is named", not an essay.
 */
export const ROLE_CATEGORIES = [
  "IT & Software",
  "Engineering & Technical",
  "Business, Strategy & Project",
  "Marketing",
  "Sales & Business Development",
  "Customer Success & Account Management",
  "Procurement, Supply Chain & Operations",
  "Management & Executive",
  "Other",
] as const;

const COUNTRIES = [
  "Germany",
  "Netherlands",
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
  { value: "job_first", en: "Find a job first, then relocate", th: "" },
  { value: "study_first", en: "Study first, then find work there", th: "" },
  { value: "family", en: "Family or partner route", th: "" },
  { value: "not_sure", en: "Not sure yet, exploring", th: "" },
] as const;

export const STAGE1: Question[] = [
  {
    key: "targetCountry",
    stage: 1,
    en: "Which country in Europe are you aiming for first?",
    th: "",
    options: [
      ...COUNTRIES.map((c) => ({ value: c, en: c, th: "" })),
      { value: "not_sure", en: "Not sure yet", th: "" },
    ],
  },
  {
    key: "targetRole",
    stage: 1,
    en: "What kind of role are you aiming for?",
    th: "",
    options: [
      ...ROLE_CATEGORIES.map((r) => ({ value: r, en: r, th: "" })),
      { value: "not_sure", en: "Not sure yet", th: "" },
    ],
  },
  {
    key: "cv",
    stage: 1,
    en: "Where is your CV right now?",
    th: "",
    options: [
      { value: "none", en: "Don't have an updated one", th: "" },
      { value: "untailored", en: "Have one, but not tailored for Europe", th: "" },
      { value: "europe_ready", en: "Have one, and it's Europe-ready", th: "" },
    ],
  },
  {
    key: "linkedin",
    stage: 1,
    en: "And your LinkedIn?",
    th: "",
    options: [
      { value: "none", en: "Don't have one", th: "" },
      { value: "basic", en: "Have one, rarely updated", th: "" },
      { value: "active", en: "Active and kept up to date", th: "" },
    ],
  },
  {
    key: "workAuth",
    stage: 1,
    en: "Where do you stand on the right to work in Europe?",
    th: "",
    options: [
      { value: "eu_rights", en: "I already have an EU passport or work rights", th: "" },
      { value: "sponsor_route_named", en: "I need sponsorship and know which visa route I'd use", th: "" },
      { value: "sponsor_no_route", en: "I know I'll need visa sponsorship", th: "" },
      { value: "unsure", en: "Not sure what's needed yet", th: "" },
    ],
  },
  {
    key: "english",
    stage: 1,
    en: "How is your English?",
    th: "",
    options: [
      { value: "A2", en: "Basic", th: "" },
      { value: "B1", en: "Conversational", th: "" },
      { value: "C1", en: "Fluent", th: "" },
      { value: "C2", en: "Native-level", th: "" },
    ],
  },
  {
    key: "stage",
    stage: 1,
    en: "Where are you in the job search right now?",
    th: "",
    options: [
      { value: "not_started", en: "Haven't started", th: "" },
      { value: "researching", en: "Researching", th: "" },
      { value: "applying", en: "Actively applying", th: "" },
      { value: "interviewing", en: "Interviewing", th: "" },
      { value: "offer", en: "Have an offer or negotiating", th: "" },
    ],
  },
  {
    key: "timeline",
    stage: 1,
    en: "When do you want to start working in Europe?",
    th: "",
    options: [
      { value: "within_3m", en: "Within 3 months", th: "" },
      { value: "3_6m", en: "In 3 to 6 months", th: "" },
      { value: "6_12m", en: "In 6 to 12 months", th: "" },
      { value: "exploring", en: "Not sure, still exploring", th: "" },
    ],
  },
];

export const QUESTION_INDEX: Record<string, Question> = Object.fromEntries(
  STAGE1.map((q) => [q.key, q]),
);

/** True when `value` is a legal answer for `questionKey`. The server calls this. */
export function isValidAnswer(questionKey: string, value: unknown): boolean {
  const q = QUESTION_INDEX[questionKey];
  if (!q || typeof value !== "string") return false;
  return q.options.some((o) => o.value === value);
}
