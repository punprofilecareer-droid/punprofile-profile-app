/**
 * Converts a Google Forms CSV export into the `{ header, rows }` JSON the rest
 * of the offline pipeline expects.
 *
 *   npx tsx scripts/csv-to-responses.ts <export.csv> <responses.json>
 *
 * Deliberately dumb: it parses CSV and nothing else. No trimming, no coercion,
 * no dropping of columns. `normalize.ts` owns every interpretation of what a
 * cell means, and a converter that quietly tidied values would hide exactly the
 * mess `scripts/audit.ts` exists to measure.
 *
 * The output contains real contact details. It is written wherever you point
 * it; `/reports` and `/data` are gitignored, the repo root is not.
 */

import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: csv-to-responses.ts <export.csv> <responses.json>");
  process.exit(1);
}

/**
 * RFC 4180 enough for Google's exports: quoted fields, doubled quotes to
 * escape, and newlines inside quotes, which Google emits freely because the
 * survey has free-text answers people press Enter in.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // swallow; the \n that follows ends the row
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const raw = readFileSync(inPath, "utf8").replace(/^﻿/, "");
const all = parseCsv(raw);
const header = all[0];
const rows = all.slice(1).filter((r) => r.some((c) => c.trim() !== ""));

writeFileSync(outPath, JSON.stringify({ header, rows }, null, 2));
console.log(`${rows.length} rows, ${header.length} columns -> ${outPath}`);
