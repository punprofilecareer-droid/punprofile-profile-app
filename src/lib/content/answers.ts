/**
 * A lead's stored answers, resolved to the question that was asked and the
 * answer in words. Coach-facing, so English throughout.
 *
 * The admin screen used to render `Object.entries(responses)` directly, which
 * showed a raw key beside a raw value: `aiIndicatorFlags` beside
 * `true,false,false,true`, and `englishCefr` beside `C1`. Readable if you know
 * the codebase, useless three minutes before a call.
 *
 * Two vocabularies arrive here, the same split `mapping.ts` and `leadGrade.ts`
 * describe. App rows are keyed by question key and every value came from a
 * tap, so `questions.ts` already holds both halves. The 90 rows written by
 * `scripts/backfill-leads.ts` are keyed by `ScoringInput` field name and their
 * question text belongs to the Lead Discovery Survey, which
 * `08_Coaching_Business.md` owns; the English wording below is that document's,
 * Q-numbers included, so a row on this screen can be traced back to it.
 *
 * Nothing here scores, and nothing here guesses. A value this file does not
 * recognise is shown verbatim rather than dropped, because a coach seeing an
 * odd string is better off than a coach seeing nothing.
 */

import { QUESTION_INDEX, STAGE1 } from "./questions";
import { isImportedRecord } from "./mapping";
import { AI_INDICATOR_LABELS } from "../normalize";

type Responses = Record<string, unknown>;

export interface AnswerRow {
  key: string;
  /** The question as it was put to them. */
  question: string;
  /** Their answer in words, or null when the question went unanswered. */
  answer: string | null;
}

export interface AnswerSheet {
  /** Which instrument these answers came from. */
  instrument: "app" | "survey";
  /** Every question of that instrument, in the order it was asked. */
  rows: AnswerRow[];
  /** Stored keys the instrument does not account for. Shown, never hidden. */
  extras: AnswerRow[];
  /** The coach's own columns, carried across by the import. */
  sheetColumns: AnswerRow[];
  answered: number;
}

/** The label an option carries on the app's own questionnaire. */
function optionLabel(questionKey: string, value: string): string | null {
  return QUESTION_INDEX[questionKey]?.options.find((o) => o.value === value)?.en ?? null;
}

const show = (v: unknown): string =>
  Array.isArray(v) ? v.map((x) => String(x)).join(", ") : String(v);

/**
 * Indicator flags as words: what they ticked, and what they did not.
 *
 * Both halves, because the count alone is the compression and the plan needs
 * the granularity back (`candidate-data-architecture.md` L0). A coach reading
 * "2 of 4" cannot prescribe anything; a coach reading which two can.
 */
function indicators(flags: unknown, labels: readonly string[]): string | null {
  if (!Array.isArray(flags) || !flags.every((f) => typeof f === "boolean")) return null;
  const met = labels.filter((_, i) => flags[i]);
  const missing = labels.filter((_, i) => !flags[i]);
  const parts = [`${met.length} of ${labels.length}`];
  if (met.length) parts.push(`Yes: ${met.join("; ")}`);
  if (missing.length) parts.push(`No: ${missing.join("; ")}`);
  return parts.join(". ");
}

/** Family Readiness indicators, in the framework's order, labelled as the app labels them. */
const FAMILY_ORDER = ["discussed", "no_objection", "dependents_plan", "logistics"] as const;
const FAMILY_LABELS = FAMILY_ORDER.map((v) => optionLabel("family", v) ?? v);

const PRIOR_INVESTMENT_LABELS: Record<string, string> = {
  none: "No prior paid course, certification or coaching",
  unrelated: "Has paid for something before, relevance to the target field not established",
  relevant: "Has paid for something relevant to the target field",
  unclassified: "Describes real prior investment; whether it is relevant is a coach judgment",
};

/**
 * The survey questions this app stores an answer for, in the survey's own
 * order. Q-numbers and English wording from `08_Coaching_Business.md` § Lead
 * Discovery Survey. Questions that instrument asked but the import did not
 * keep (Q1 to Q5, Q9, Q19, Q20) are absent rather than shown empty: they were
 * never stored, and an empty row would read as "they declined to answer".
 */
const SURVEY_FIELDS: {
  key: string;
  question: string;
  render: (v: unknown, r: Responses) => string | null;
  /**
   * Render even when the stored value is absent. Set only where a blank has a
   * meaning of its own, which today is Q34: the framework never puts the
   * family indicators to someone moving alone, so an empty field there is an
   * answer and not a silence.
   */
  alwaysRender?: boolean;
}[] = [
  {
    key: "experienceYears",
    question: "Q6. Years of professional experience",
    render: (v) => (typeof v === "string" ? optionLabel("experienceYears", v) ?? v : show(v)),
  },
  {
    key: "targetCountries",
    question: "Q7. Target country or countries in Europe",
    render: (v) => show(v),
  },
  { key: "targetRole", question: "Q8. Target role or industry in Europe", render: (v) => show(v) },
  {
    key: "timeline",
    question: "Q10. When do you want to start?",
    render: (v) => (typeof v === "string" ? optionLabel("timeline", v) ?? v : show(v)),
  },
  {
    key: "stage",
    question: "Q11. Current stage of the job search",
    render: (v) => (typeof v === "string" ? optionLabel("stage", v) ?? v : show(v)),
  },
  {
    key: "applicationCount",
    question: "Q12. Roles applied to in Europe so far",
    render: (v) => (typeof v === "number" ? `${v}` : show(v)),
  },
  {
    key: "cv",
    question: "Q13. Do you have an updated CV?",
    render: (v) => (typeof v === "string" ? optionLabel("cv", v) ?? v : show(v)),
  },
  {
    key: "linkedin",
    question: "Q14. Do you have a LinkedIn profile?",
    render: (v) => (typeof v === "string" ? optionLabel("linkedin", v) ?? v : show(v)),
  },
  {
    key: "portfolio",
    question: "Q15. Do you have a portfolio showing results or case studies?",
    render: (v) => (typeof v === "string" ? optionLabel("portfolio", v) ?? v : show(v)),
  },
  {
    key: "englishCefr",
    question: "Q16. English level",
    render: (v) => (typeof v === "string" ? optionLabel("english", v) ?? v : show(v)),
  },
  {
    key: "otherLanguageCefr",
    // The field holds the highest level reached in ANY European language and
    // not which language it is, which is exactly what the Stage 2 grid was
    // built to replace. Said on the row rather than left to be assumed.
    question: "Q17. Other European languages, highest level reached in any of them",
    render: (v) => (typeof v === "string" ? optionLabel("english", v) ?? v : show(v)),
  },
  {
    key: "workAuth",
    question: "Q18. Work authorisation",
    render: (v) =>
      v === "no_awareness"
        ? "No awareness of what is needed"
        : typeof v === "string"
          ? optionLabel("workAuth", v) ?? v
          : show(v),
  },
  {
    key: "priorInvestment",
    question: "Q21. Have you paid for courses, certifications or coaching before?",
    render: (v) => (typeof v === "string" ? PRIOR_INVESTMENT_LABELS[v] ?? v : show(v)),
  },
  {
    key: "aiIndicatorFlags",
    question: "Q32. AI and digital fluency, indicators met",
    render: (v) => indicators(v, AI_INDICATOR_LABELS) ?? show(v),
  },
  {
    key: "hasDependents",
    question: "Q33. Does a partner or dependants relocate with you?",
    render: (v) =>
      v === true
        ? "Yes, someone would relocate with them"
        : v === false
          ? "No, they would be moving alone"
          : show(v),
  },
  {
    key: "familyIndicatorFlags",
    question: "Q34. Family readiness, indicators met",
    alwaysRender: true,
    render: (v, r) =>
      // Auto-scored rather than asked. The framework scores Family Readiness 5
      // when nobody relocates with them, so the indicators are never put to
      // that person and a blank here is not a non-answer.
      r.hasDependents === false
        ? "Not asked, nobody relocates with them"
        : indicators(v, FAMILY_LABELS),
  },
  {
    key: "salary",
    // Free text on the survey, reduced by `normalize.ts` to whether a usable
    // figure was stated. Whether the figure is realistic needs a country and
    // role benchmark and stays a coach-tier judgment, so the parsed shape is
    // the honest thing to show.
    question: "Q35. Expected salary, as parsed",
    render: (v) => {
      if (!v || typeof v !== "object" || Array.isArray(v)) return show(v);
      const s = v as Record<string, unknown>;
      const has = [s.hasFigure && "a figure", s.hasCurrency && "a currency", s.hasPeriod && "a period"].filter(
        Boolean,
      ) as string[];
      return has.length ? `They gave ${has.join(", ")}` : "No usable figure given";
    },
  },
];

/** Keys the import carries that are the coach's own columns, not the candidate's answers. */
const SHEET_COLUMN_LABELS: Record<string, string> = {
  _contactRaw: "Contact details, exactly as they wrote them",
  _entryPoint: "Suggested entry point, from the sheet",
  _manualCheck: "Flagged for manual check, from the sheet",
};

/** Fields read for scoring but not shown as their own row, so they are not "extras". */
const ACCOUNTED_FOR = new Set(["aiIndicators", "familyIndicators", "salaryText", "otherLanguages"]);

export function readAnswers(responses: Responses): AnswerSheet {
  const seen = new Set<string>();
  const rows: AnswerRow[] = [];

  const instrument: AnswerSheet["instrument"] = isImportedRecord(responses) ? "survey" : "app";

  if (instrument === "survey") {
    for (const f of SURVEY_FIELDS) {
      seen.add(f.key);
      const raw = responses[f.key];
      const answered = raw !== undefined && raw !== null && !(Array.isArray(raw) && raw.length === 0);
      rows.push({
        key: f.key,
        question: f.question,
        answer: answered || f.alwaysRender ? f.render(raw, responses) : null,
      });
    }
  } else {
    for (const q of STAGE1) {
      seen.add(q.key);
      const raw = responses[q.key];
      if (raw === undefined || raw === null) {
        rows.push({ key: q.key, question: q.en, answer: null });
        continue;
      }
      const values = Array.isArray(raw) ? raw.map(String) : [String(raw)];
      rows.push({
        key: q.key,
        question: q.en,
        answer: values.map((v) => optionLabel(q.key, v) ?? v).join(", ") || null,
      });
    }
    // Stage 2's language grid is not a `STAGE1` question and has no options to
    // look up, so it is rendered here rather than falling through to extras.
    const grid = responses.otherLanguages;
    if (grid && typeof grid === "object" && !Array.isArray(grid)) {
      const pairs = Object.entries(grid as Record<string, unknown>).map(([k, v]) => `${k} ${String(v)}`);
      rows.push({
        key: "otherLanguages",
        question: "Other European languages, by level",
        answer: pairs.length ? pairs.join(", ") : "None named",
      });
    }
  }

  const sheetColumns: AnswerRow[] = [];
  const extras: AnswerRow[] = [];
  for (const [key, value] of Object.entries(responses)) {
    if (seen.has(key) || ACCOUNTED_FOR.has(key)) continue;
    const row = { key, question: SHEET_COLUMN_LABELS[key] ?? key, answer: show(value) };
    if (key.startsWith("_")) sheetColumns.push(row);
    else extras.push(row);
  }

  return {
    instrument,
    rows,
    extras,
    sheetColumns,
    answered: rows.filter((r) => r.answer !== null).length,
  };
}
