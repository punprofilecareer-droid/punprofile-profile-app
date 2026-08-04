/**
 * Produces the ECRA columns for the Candidates Master tab, in that tab's own row
 * order, ready to paste.
 *
 * Deliberately generates values rather than Sheets formulas. A formula version
 * would be a second scoring implementation living beside `src/lib/scoring.ts`,
 * and the two would disagree the first time a lookup table changed. The sheet is
 * a read surface; the code is the source of truth. Re-run this to refresh.
 *
 *   npx tsx scripts/export-master-scores.ts <responses.json> <master.json> <out.tsv>
 *
 * Both inputs are `{ header: string[], rows: string[][] }` exports of the two
 * tabs. Rows in the master with no matching survey response emit blanks, so the
 * output always lines up with the master row-for-row and can be pasted as a
 * block without checking alignment by eye.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { scoreResponse } from "../src/lib/scoring.js";
import { mapColumns, importRow, looksShifted } from "./import-sheet.js";
import { DIMENSIONS } from "../src/lib/model.js";

const [, , responsesPath, masterPath, outPath] = process.argv;
if (!responsesPath || !masterPath || !outPath) {
  console.error("usage: export-master-scores.ts <responses.json> <master.json> <out.tsv>");
  process.exit(1);
}

const responses = JSON.parse(readFileSync(responsesPath, "utf8")) as { header: string[]; rows: string[][] };
const master = JSON.parse(readFileSync(masterPath, "utf8")) as { header: string[]; rows: string[][] };

const cols = mapColumns(responses.header);
const emailCol = cols.index.email;
if (emailCol === undefined) throw new Error("no email column in responses");

const norm = (s: string) => (s ?? "").trim().toLowerCase();

// Index responses by email. On a duplicate email the later submission wins —
// a candidate who filled the form twice meant the second one.
const byEmail = new Map<string, string[]>();
let shiftedCount = 0;
for (const row of responses.rows) {
  if (looksShifted(row, cols)) { shiftedCount++; continue; }
  const e = norm(row[emailCol] ?? "");
  if (e) byEmail.set(e, row);
}

const masterEmailCol = master.header.findIndex((h) => h.toLowerCase().trim() === "email");
if (masterEmailCol < 0) throw new Error("no Email column in master");

/**
 * Exactly five columns, to land in AC:AG.
 *
 * The master tab's ECRA block is columns AC-AF, followed by AG which carries a
 * duplicate "ECRA: European Market Fit" header, then AH "Job Title: Needs
 * Categorization?" — which holds real data. A sixth column would overwrite it.
 * So AG takes coverage (rename its header) and nothing runs past it.
 */
const HEAD = [...DIMENSIONS.map((d) => `ECRA: ${d.label}`), "ECRA: Coverage"];

const lines: string[] = [HEAD.join("\t")];
let matched = 0;
const unmatched: string[] = [];

for (const mrow of master.rows) {
  const e = norm(mrow[masterEmailCol] ?? "");
  const rrow = e ? byEmail.get(e) : undefined;
  if (!rrow) {
    if (e) unmatched.push(e);
    lines.push(new Array(HEAD.length).fill("").join("\t"));
    continue;
  }
  matched++;
  const { input } = importRow(rrow, cols);
  const p = scoreResponse(input);
  const cells = p.dimensions.map((d) => (d.score === null ? "" : d.score.toFixed(1)));
  cells.push(`${Math.round(p.overallCoverage * 100)}%`);
  lines.push(cells.join("\t"));
}

writeFileSync(outPath, lines.join("\n") + "\n", "utf8");

console.log(`survey responses: ${responses.rows.length} (${shiftedCount} skipped — answers shifted out of their columns)`);
console.log(`master rows: ${master.rows.length}`);
console.log(`matched to a survey response: ${matched}`);
console.log(`left blank (no matching response): ${master.rows.length - matched}`);
if (unmatched.length) {
  console.log(`\nmaster emails with no survey response (${unmatched.length}):`);
  for (const e of unmatched) console.log(`  ${e.replace(/^(.{3}).*(@.*)$/, "$1***$2")}`);
}
console.log(`\nwrote ${outPath} — ${lines.length - 1} data rows, ${HEAD.length} columns`);
console.log("paste the data rows (not the header) into AC2. Rename AG's header to \"ECRA: Coverage\".");

// Alignment check. The block is pasted positionally, so if the master export
// ever loses or reorders a row the scores land against the wrong candidates and
// nothing about the result looks wrong. These anchors make that visible.
const mask = (e: string) => e.replace(/^(.{3}).*(@.*)$/, "$1***$2");
const anchors = [0, Math.floor(master.rows.length / 2), master.rows.length - 1];
console.log("\nverify these line up before trusting the paste:");
for (const i of anchors) {
  const e = norm(master.rows[i]?.[masterEmailCol] ?? "");
  console.log(`  master row ${i + 2} (sheet row): ${mask(e) || "(blank)"}  ->  ${lines[i + 1].replace(/\t/g, " | ") || "(blank)"}`);
}
