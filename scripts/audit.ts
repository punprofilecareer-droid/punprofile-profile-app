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
import { COUNTRY_ENGLISH } from "../src/lib/country-english.js";

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

/**
 * Target Clarity must be independent of how many countries a candidate names.
 *
 * Decided 13/08/2026 (`09_Decision_Log.md`): country count is reach, not
 * clarity. A rule that survives in an if-statement long after the document says
 * it is gone is worse than one nobody agreed to, so this asserts the property
 * behaviourally rather than trusting the code to have been changed. Renaming a
 * variable does not get past it: it holds the role constant, varies only the
 * country list, and requires the score not to move.
 *
 * The source scan underneath catches a dormant branch that today's inputs
 * happen not to reach.
 */
console.log("\n=== target clarity independence (13/08/2026 decision) ===");
{
  const roleHeld = { targetRole: "Marketing Manager" } as Parameters<typeof scoreResponse>[0];
  const sets: string[][] = [
    ["Netherlands"],
    ["Netherlands", "Germany"],
    ["Germany", "Austria", "Switzerland"],
    ["Netherlands", "Germany", "France", "Denmark"],
    ["Germany", "Netherlands", "France", "Denmark", "Sweden", "Norway", "Finland",
     "Ireland", "Belgium", "Austria", "Switzerland", "Spain", "Italy", "Portugal",
     "Poland", "Czech Republic"],
  ];
  const scoreFor = (countries: string[]) => {
    const p = scoreResponse({ ...roleHeld, targetCountries: countries });
    const emf = p.dimensions.find((d) => d.key === "europeanMarketFit");
    return emf?.items.find((i) => i.key === "targetClarity")?.score ?? null;
  };
  const observed = sets.map(scoreFor);
  const distinct = [...new Set(observed.map((v) => String(v)))];
  if (distinct.length === 1) {
    console.log(`  holds: every country set scores ${distinct[0]} with the role held constant`);
  } else {
    violations++;
    console.log(`  VIOLATION: Target Clarity moved with country count -> ${observed.join(", ")}`);
    console.log("  Country count is reach, not clarity. Score reach in Country Reach (TASK-073).");
  }

  const src = readFileSync(new URL("../src/lib/scoring.ts", import.meta.url), "utf8");
  const fn = src.slice(src.indexOf("function scoreTargetClarity"));
  const body = fn.slice(0, fn.indexOf("\n}") + 2);
  if (/targetCountries|countries\s*\.\s*length/.test(body)) {
    violations++;
    console.log("  VIOLATION: scoreTargetClarity still references targetCountries.");
  } else {
    console.log("  holds: scoreTargetClarity does not reference targetCountries");
  }
}

/**
 * Country Reach must reward breadth a candidate can actually use, and must not
 * collapse into a third copy of the English score.
 *
 * Both properties were broken in the first draft and found by running the real
 * leads, so they are asserted rather than trusted.
 */
console.log("\n=== country reach (13/08/2026 decision) ===");
{
  const reachFor = (targetCountries: string[], englishCefr: string) => {
    const p = scoreResponse({ targetCountries, englishCefr } as Parameters<typeof scoreResponse>[0]);
    return p.dimensions.find((d) => d.key === "europeanMarketFit")
      ?.items.find((i) => i.key === "countryReach")?.score ?? null;
  };

  // Four reachable countries must score ABOVE one. This is the whole decision.
  const four = reachFor(["Netherlands", "Denmark", "Sweden", "Norway"], "C1");
  const one = reachFor(["Netherlands"], "C1");
  if (four !== null && one !== null && four >= one) {
    console.log(`  holds: four reachable countries ${four} >= one country ${one}`);
  } else {
    violations++;
    console.log(`  VIOLATION: four reachable countries ${four} scored below one country ${one}`);
  }

  // A scattergun must score low without any count rule in the code.
  const scatter = reachFor(
    ["Germany", "Netherlands", "France", "Denmark", "Sweden", "Norway", "Finland",
     "Ireland", "Belgium", "Austria", "Switzerland", "Spain", "Italy", "Portugal",
     "Poland", "Czech Republic"], "B1");
  if (scatter !== null && scatter <= 2) {
    console.log(`  holds: sixteen countries at B1 scores ${scatter}`);
  } else {
    violations++;
    console.log(`  VIOLATION: scattergun scored ${scatter}, expected 2 or less`);
  }

  // Reach must separate candidates who share an English level, or it is just
  // measuring English, which two other items already do.
  const nl = reachFor(["Netherlands"], "B1");
  const fr = reachFor(["France"], "B1");
  if (nl !== null && fr !== null && nl > fr) {
    console.log(`  holds: at B1, Netherlands ${nl} > France ${fr}`);
  } else {
    violations++;
    console.log(`  VIOLATION: at B1, Netherlands ${nl} did not beat France ${fr}. Country Reach is measuring English, not reach.`);
  }

  // Every country the data actually contains needs a band, including the ones
  // the app's own list omits. The UK was the third most-named in the backfill.
  const missing = ["United Kingdom", "Iceland", "Luxembourg", "Greece"]
    .filter((c) => COUNTRY_ENGLISH[c] === undefined);
  if (missing.length) {
    violations++;
    console.log(`  VIOLATION: no English band for ${missing.join(", ")}`);
  } else {
    console.log("  holds: every backfill country has a band");
  }
}

if (violations > 0) process.exitCode = 1;
