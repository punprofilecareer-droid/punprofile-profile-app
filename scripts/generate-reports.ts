/**
 * Offline report generator.
 *
 * Reads a JSON export of the Lead Discovery Survey response sheet
 * (`{ header: string[], rows: string[][] }`), scores every row, and writes one
 * self-contained HTML report per candidate plus a coverage summary.
 *
 *   npx tsx scripts/generate-reports.ts <responses.json> <outDir> [--limit N]
 *
 * This is the manual-servicing path for leads that already came in through the
 * Google Form. The app calls the same `scoreResponse` and `renderReport`; only
 * the input adapter differs.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { scoreResponse } from "../src/lib/scoring.js";
import { renderReport } from "../src/lib/report.js";
import { mapColumns, importRow, looksShifted } from "./import-sheet.js";
import { DIMENSIONS } from "../src/lib/model.js";

const [, , inPath, outDir, ...rest] = process.argv;
if (!inPath || !outDir) {
  console.error("usage: generate-reports.ts <responses.json> <outDir> [--limit N]");
  process.exit(1);
}
const limitFlag = rest.indexOf("--limit");
const limit = limitFlag >= 0 ? parseInt(rest[limitFlag + 1], 10) : Infinity;

const raw = JSON.parse(readFileSync(inPath, "utf8")) as { header: string[]; rows: string[][] };
const cols = mapColumns(raw.header);

const unresolved = Object.keys(
  Object.fromEntries(Object.entries(cols.index).filter(([, v]) => v === undefined)),
);
if (unresolved.length) console.warn("unresolved columns:", unresolved.join(", "));

mkdirSync(outDir, { recursive: true });

interface Summary {
  file: string;
  candidate: string;
  overall: number;
  dims: (number | null)[];
  coverage: number[];
}

const summaries: Summary[] = [];
let written = 0;

const shifted: string[] = [];

for (const row of raw.rows) {
  if (written >= limit) break;
  // A row whose answers have slipped columns is skipped, not scored — see
  // `looksShifted`. Scoring it would produce a few plausible-looking but wrong
  // numbers alongside the blanks.
  if (looksShifted(row, cols)) {
    shifted.push((row[cols.index.name ?? 1] ?? "?").slice(0, 40));
    continue;
  }
  const { input, meta } = importRow(row, cols);
  const profile = scoreResponse(input);
  if (!profile.hasAnyScore) continue;

  const html = renderReport(profile, {
    candidate: meta.candidate,
    submittedAt: meta.submittedAt,
    currentRole: meta.currentRole,
    targetRole: meta.targetRole,
    targetCountries: meta.targetCountries,
  });

  const file = `report-${meta.emailHash}.html`;
  writeFileSync(join(outDir, file), html, "utf8");
  written++;

  summaries.push({
    file,
    candidate: meta.candidate,
    overall: profile.overallCoverage,
    dims: profile.dimensions.map((d) => d.score),
    coverage: profile.dimensions.map((d) => d.coverage),
  });
}

// Coverage summary — how much of the framework the survey actually reaches in
// practice, across every real response. This is the number that says whether
// the question set is worth what it costs the candidate to fill in.
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const lines: string[] = [];
lines.push(`reports written: ${written} of ${raw.rows.length} rows`);
if (shifted.length) {
  lines.push(`skipped, answers shifted out of their columns: ${shifted.length} (${shifted.join("; ")})`);
}
lines.push(`mean overall coverage: ${(avg(summaries.map((s) => s.overall)) * 100).toFixed(1)}%`);
lines.push("");
lines.push("per dimension (mean score / mean coverage / scored rows):");
DIMENSIONS.forEach((d, i) => {
  const scores = summaries.map((s) => s.dims[i]).filter((v): v is number => v !== null);
  const cov = summaries.map((s) => s.coverage[i]);
  lines.push(
    `  ${d.label.padEnd(26)} ${scores.length ? avg(scores).toFixed(2) : "  — "} / ${(avg(cov) * 100).toFixed(0).padStart(3)}% / ${scores.length}`,
  );
});

const summaryText = lines.join("\n");
writeFileSync(join(outDir, "_summary.txt"), summaryText, "utf8");
console.log(summaryText);
