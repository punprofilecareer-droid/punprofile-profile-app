/**
 * Google Sheet row → canonical `ScoringInput`.
 *
 * The Lead Discovery Survey's response sheet is column-positional, and its
 * shape has changed twice (Q32-Q35 added 12/07/2026, Q17 split into one column
 * per language). Columns are resolved by header text, not index, so a future
 * question insert doesn't silently shift every downstream answer.
 */

import * as N from "../src/lib/normalize.js";
import type { ScoringInput } from "../src/lib/scoring.js";

/** Substring matched against the sheet's header row, case-insensitive. */
export const COLUMN_MATCHERS = {
  timestamp: "timestamp",
  name: "full name",
  location: "current location",
  jobTitle: "current job title",
  industry: "current industry",
  experience: "years of professional experience",
  countries: "target country/countries",
  targetRole: "target role or industry",
  timeline: "when do you want to start",
  stage: "current stage",
  applications: "how many roles have you applied",
  cv: "do you have an updated cv",
  linkedin: "do you have a linkedin profile",
  portfolio: "portfolio site",
  english: "english level",
  workAuth: "work authorization",
  priorInvestment: "have you invested in any courses",
  /**
   * Google captures the respondent's account address in a column called
   * "Username". The form itself never asked for an email: its contact question
   * offers Facebook, LinkedIn, LINE ID or phone. So this is an address we hold,
   * not a channel anyone nominated, which is why the import records no email
   * consent.
   */
  email: "username",
  /** The channel they actually chose. Free text, and gloriously varied. */
  contact: "best way",
  aiTools: "how do you use digital tools",
  dependents: "who would relocate with you",
  familyReady: "how ready is your family",
  salary: "your expected salary",
  /**
   * Paul's own two columns at the far right of the sheet, added to the importer
   * 14/08/2026 on his instruction to bring every column across.
   *
   * Neither is a form question: they are triage the coach did on the sheet, so
   * they are evidence about the LEAD rather than answers from the candidate.
   * That distinction is why they travel as `_`-prefixed keys inside `responses`
   * and never as `ScoringInput` fields. Nothing in `toScoringInput` reads a
   * key beginning with an underscore, so a suggested entry point cannot leak
   * into a score, which would be circular: the suggestion was made by reading
   * the answers the score is computed from.
   */
  entryPoint: "auto-suggested entry point",
  manualCheck: "manual check needed",
} as const;

export type ColumnKey = keyof typeof COLUMN_MATCHERS;

export interface ColumnMap {
  index: Partial<Record<ColumnKey, number>>;
  /** Q17 is one column per language; all of them are collected. */
  otherLanguages: number[];
}

export function mapColumns(header: string[]): ColumnMap {
  const lower = header.map((h) => h.toLowerCase());
  const index: Partial<Record<ColumnKey, number>> = {};
  for (const [key, needle] of Object.entries(COLUMN_MATCHERS) as [ColumnKey, string][]) {
    const i = lower.findIndex((h) => h.includes(needle));
    if (i >= 0) index[key] = i;
  }

  /**
   * The address column has two names depending on how the sheet was exported.
   * A Google Sheets add-on export calls it "Username"; a plain CSV export of
   * the same sheet calls it "Email Address". Found 14/08/2026 pulling the form
   * one last time before retiring it: the CSV had no "Username" at all, so
   * every one of the hundred rows would have imported with no address, which
   * `looksShifted` cannot catch because a genuinely blank cell is treated as
   * unanswered rather than broken.
   */
  if (index.email === undefined) {
    const i = lower.findIndex((h) => h.includes("email address"));
    if (i >= 0) index.email = i;
  }
  const otherLanguages = lower
    .map((h, i) => (h.includes("other european languages") ? i : -1))
    .filter((i) => i >= 0);
  return { index, otherLanguages };
}

const at = (row: string[], i: number | undefined): string => (i === undefined ? "" : (row[i] ?? ""));

export interface ImportedRow {
  input: ScoringInput;
  meta: {
    candidate: string;
    submittedAt: string;
    currentRole: string;
    targetRole: string;
    targetCountries: string[];
    emailHash: string;
    /** Paul's suggested service entry point for this lead, verbatim. */
    entryPoint: string;
    /** His flag that the row needs a human look. Empty means it does not. */
    manualCheck: string;
  };
  /**
   * Real contact details, added for the TASK-053 backfill. The offline scoring
   * tools only ever wanted `emailHash`; a CRM needs to be able to reach people.
   */
  contact: Contact;
}

export interface Contact {
  /** The address Google captured. Held, but never nominated as a channel. */
  email: string | null;
  /** An address they typed as their chosen channel, if any. */
  emailNominated: string | null;
  phone: string | null;
  lineId: string | null;
  /**
   * The contact answer verbatim. Kept because the parse below is lossy by
   * necessity: a Facebook or LinkedIn URL has nowhere to go in the schema, and
   * a lead you cannot reach because a regex did not recognise their format is
   * worse than one with an unparsed string attached.
   */
  raw: string;
}

/** Thai mobiles are 0X XXXX XXXX; +66 replaces the leading zero. */
const PHONE = /(?:\+66[\s-]?|0)(\d[\s-]?){8,9}\d/;

function parseContact(username: string, best: string): Contact {
  const raw = best.trim();
  const emailMatch = username.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);

  const phoneMatch = raw.replace(/[()]/g, "").match(PHONE);
  const phone = phoneMatch ? phoneMatch[0].replace(/[\s-]/g, "") : null;

  // A LINE id is whatever follows a "line"/"ไลน์"/"id" label. Failing a label,
  // a bare token that is not a URL and not the phone we just took is far more
  // often a LINE id than anything else, which is what the shape of the answers
  // says: two thirds name LINE, and the rest give a number or a profile link.
  let lineId: string | null = null;
  const labelled = raw.match(/(?:line|ไลน์|ไอดี|id)\s*(?:id)?\s*[:：]?\s*([^\s,/|]+)/i);
  if (labelled && !/^https?:/i.test(labelled[1])) lineId = labelled[1];

  // An "@name" token is a LINE id, not an address. Official LINE ids carry the
  // prefix, and treating every "@" as an email loses them: it was the single
  // biggest cause of unreachable rows on the first pass.
  if (!lineId) {
    const at = raw.match(/@[\w.-]{2,}/);
    const isEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(raw);
    if (at && !isEmail) lineId = at[0];
  }

  if (!lineId && !/https?:|@/i.test(raw)) {
    const bare = raw.split(/[\s,]+/).find((t) => t && t !== phone && !/^\d+$/.test(t));
    if (bare) lineId = bare;
  }
  // A label can capture the word "id" itself when the answer is "LINE ID : x".
  if (lineId && /^(id|line|ไลน์)$/i.test(lineId)) lineId = null;

  // An address typed into the contact answer is a channel they chose. The one
  // Google captured in Username is not: the form never offered email as a way
  // to be reached. Only the former carries a consent basis, so the two are
  // recorded separately rather than collapsed into "we have their email".
  const nominatedEmail = raw.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);

  return {
    email: emailMatch ? emailMatch[0].toLowerCase() : null,
    emailNominated: nominatedEmail ? nominatedEmail[0].toLowerCase() : null,
    phone,
    lineId,
    raw,
  };
}

export function importRow(row: string[], cols: ColumnMap): ImportedRow {
  const g = (k: ColumnKey) => at(row, cols.index[k]);

  const countries = N.parseCountries(g("countries"));
  const targetRole = g("targetRole").trim();

  const input: ScoringInput = {
    experienceYears: N.parseExperienceYears(g("experience")),
    targetCountries: countries,
    targetRole: targetRole || null,
    timeline: N.parseTimeline(g("timeline")),
    stage: N.parseStage(g("stage")),
    applicationCount: N.parseApplicationCount(g("applications")),
    cv: N.parseCv(g("cv")),
    linkedin: N.parseLinkedin(g("linkedin")),
    portfolio: N.parsePortfolio(g("portfolio")),
    englishCefr: N.parseCefr(g("english")),
    otherLanguageCefr: N.parseBestOtherLanguage(cols.otherLanguages.map((i) => row[i] ?? "")),
    workAuth: N.parseWorkAuth(g("workAuth")),
    priorInvestment: N.parsePriorInvestment(g("priorInvestment")),
    aiIndicators: N.parseAiIndicators(g("aiTools")),
    aiIndicatorFlags: N.parseAiIndicatorFlags(g("aiTools")),
    hasDependents: N.parseHasDependents(g("dependents")),
    familyIndicators: N.parseFamilyIndicators(g("familyReady")),
    familyIndicatorFlags: N.parseFamilyIndicatorFlags(g("familyReady")),
    salary: N.parseSalaryShape(g("salary")),
  };

  return {
    input,
    meta: {
      candidate: g("name").trim() || "Unnamed respondent",
      submittedAt: g("timestamp").trim(),
      currentRole: g("jobTitle").trim(),
      targetRole,
      targetCountries: countries,
      emailHash: hash(g("email").trim().toLowerCase()),
      /** Coach triage from the sheet, not candidate answers. See COLUMN_MATCHERS. */
      entryPoint: g("entryPoint").trim(),
      manualCheck: g("manualCheck").trim(),
    },
    contact: parseContact(g("email"), g("contact")),
  };
}

/**
 * True when a row's answers have slipped out of their own columns.
 *
 * Seen in the live export: a candidate whose free-text answer contained line
 * breaks had every later answer shifted three columns right, so the timeline
 * answer sat in the CV field, the CV answer in the English field, and the email
 * ended up eight columns past where it belongs. Individual parsers already
 * reject out-of-vocabulary values, so a shifted row scores mostly blanks rather
 * than scoring wrongly — but a row that is shifted at all should not be scored
 * or exported, because the handful of values that happen to land in a
 * plausible-looking column would be silently wrong.
 *
 * The email column is the detector: it is the one field with a shape that can be
 * checked without knowing the answer.
 */
export function looksShifted(row: string[], cols: ColumnMap): boolean {
  const i = cols.index.email;
  if (i === undefined) return false;
  const cell = (row[i] ?? "").trim();
  if (!cell) return false; // genuinely blank is unanswered, not shifted
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cell.replace(/\\/g, ""));
}

/** Short non-reversible handle, so a row can be referenced in logs without the address. */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36).padStart(7, "0").slice(0, 7);
}
