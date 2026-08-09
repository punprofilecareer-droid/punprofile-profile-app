/**
 * Parser audit: for every survey question, how many of the 63 real responses
 * the normaliser resolves, and what it fails on.
 *
 * A parser that silently returns null on 40% of a column looks identical to a
 * question nobody answered. This separates the two.
 */

import { readFileSync } from "node:fs";
import { mapColumns, importRow, COLUMN_MATCHERS } from "./import-sheet.js";
import type { ColumnKey } from "./import-sheet.js";
import { scoreResponse } from "../src/lib/scoring.js";

const raw = JSON.parse(readFileSync(process.argv[2], "utf8")) as { header: string[]; rows: string[][] };
const cols = mapColumns(raw.header);

console.log("=== column resolution ===");
for (const k of Object.keys(COLUMN_MATCHERS) as ColumnKey[]) {
  const i = cols.index[k];
  console.log(`  ${i === undefined ? "MISSING" : String(i).padStart(2)}  ${k}`);
}
console.log(`  Q17 language columns: ${cols.otherLanguages.length}`);

const FIELDS = [
  "experienceYears", "timeline", "stage", "applicationCount", "cv", "linkedin",
  "portfolio", "englishCefr", "otherLanguageCefr", "workAuth", "priorInvestment",
  "aiIndicators", "hasDependents", "familyIndicators",
] as const;

const stats: Record<string, { blank: number; parsed: number; failed: string[] }> = {};
for (const f of FIELDS) stats[f] = { blank: 0, parsed: 0, failed: [] };
stats["targetCountries"] = { blank: 0, parsed: 0, failed: [] };
stats["salary"] = { blank: 0, parsed: 0, failed: [] };

const SRC: Record<string, ColumnKey> = {
  experienceYears: "experience", timeline: "timeline", stage: "stage",
  applicationCount: "applications", cv: "cv", linkedin: "linkedin",
  portfolio: "portfolio", englishCefr: "english", workAuth: "workAuth",
  priorInvestment: "priorInvestment", aiIndicators: "aiTools",
  hasDependents: "dependents", familyIndicators: "familyReady",
  targetCountries: "countries", salary: "salary",
};

/** Blank, a placeholder mark, or an explicit "none" — all mean "no value to parse". */
const isBlankCell = (s: string) => {
  const t = (s ?? "").trim().toLowerCase();
  return !t || ["-", "–", "\\-", "n/a", "na", "none", "no"].includes(t) || t.includes("ไม่พูดเลย");
};

for (const row of raw.rows) {
  const { input } = importRow(row, cols);
  for (const f of Object.keys(stats)) {
    const srcKey = SRC[f];
    const cell = srcKey !== undefined && cols.index[srcKey] !== undefined ? (row[cols.index[srcKey] as number] ?? "") : "";
    const v = (input as Record<string, unknown>)[f];
    const empty = f === "targetCountries" ? (v as string[]).length === 0 : v === null || v === undefined;
    if (f === "otherLanguageCefr") {
      const anyCell = cols.otherLanguages.some((i) => !isBlankCell(row[i] ?? ""));
      if (!anyCell) stats[f].blank++;
      else if (empty) stats[f].failed.push("(language cells present, none parsed)");
      else stats[f].parsed++;
      continue;
    }
    if (isBlankCell(cell)) stats[f].blank++;
    else if (empty) stats[f].failed.push(cell.slice(0, 70));
    else stats[f].parsed++;
  }
}

console.log(`\n=== parser coverage (of ${raw.rows.length} rows) ===`);
console.log("field                 parsed  blank  unparsed");
for (const [f, s] of Object.entries(stats)) {
  const flag = s.failed.length > 0 ? "  <-- check" : "";
  console.log(`${f.padEnd(20)} ${String(s.parsed).padStart(6)} ${String(s.blank).padStart(6)} ${String(s.failed.length).padStart(9)}${flag}`);
}

console.log("\n=== unparsed values ===");
for (const [f, s] of Object.entries(stats)) {
  if (!s.failed.length) continue;
  console.log(`\n${f}:`);
  for (const v of [...new Set(s.failed)]) console.log(`   ${JSON.stringify(v)}`);
}

// Range check: no score may fall outside 1-5, and no dimension mean outside its items.
console.log("\n=== invariant check ===");
let violations = 0;
for (const row of raw.rows) {
  const { input, meta } = importRow(row, cols);
  const p = scoreResponse(input);
  for (const d of p.dimensions) {
    const scored = d.items.filter((i) => i.score !== null).map((i) => i.score as number);
    for (const s of scored) {
      if (s < 1 || s > 5 || !Number.isFinite(s)) { console.log(`  OUT OF RANGE ${meta.emailHash} ${d.key} ${s}`); violations++; }
    }
    if (d.score !== null) {
      const lo = Math.min(...scored), hi = Math.max(...scored);
      if (d.score < lo - 0.06 || d.score > hi + 0.06) { console.log(`  MEAN OUTSIDE RANGE ${meta.emailHash} ${d.key} ${d.score} not in [${lo},${hi}]`); violations++; }
    }
    // A coach-tier item must never carry a score.
    for (const i of d.items) if (i.tier === "coach" && i.score !== null) { console.log(`  COACH ITEM SCORED ${meta.emailHash} ${i.key}`); violations++; }
    if (d.coverage < 0 || d.coverage > 1) { console.log(`  COVERAGE OUT OF RANGE ${meta.emailHash} ${d.key} ${d.coverage}`); violations++; }
  }
}
console.log(violations === 0 ? `  all invariants hold across ${raw.rows.length} rows` : `  ${violations} violations`);
