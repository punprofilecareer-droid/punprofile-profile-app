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
  email: "email address",
  aiTools: "how do you use digital tools",
  dependents: "who would relocate with you",
  familyReady: "how ready is your family",
  salary: "your expected salary",
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
    },
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
