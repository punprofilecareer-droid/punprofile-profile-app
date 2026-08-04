/**
 * One self-contained HTML file containing every candidate's report, with a
 * searchable sidebar.
 *
 * `generate-reports.ts` writes one file per candidate, which is right for
 * emailing a single person their result. It is wrong for the coach's own
 * lookup: 62 files named after an opaque hash means finding a candidate is a
 * grep, not a click. This builds the triage surface instead, so "where do I
 * look at X's result" has one answer that does not change as responses arrive.
 *
 *   npx tsx scripts/build-report-book.ts <responses.json> <out.html>
 *
 * The per-report stylesheet is emitted once rather than 62 times, so the book
 * is roughly the size of the individual reports combined minus the duplication.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { scoreResponse } from "../src/lib/scoring.js";
import { renderReport } from "../src/lib/report.js";
import { mapColumns, importRow, looksShifted } from "./import-sheet.js";
import { DIMENSIONS } from "../src/lib/model.js";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: build-report-book.ts <responses.json> <out.html>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(inPath, "utf8")) as { header: string[]; rows: string[][] };
const cols = mapColumns(raw.header);

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Entry {
  id: string;
  name: string;
  role: string;
  submitted: string;
  dims: (number | null)[];
  coverage: number;
  body: string;
}

const entries: Entry[] = [];
const skipped: string[] = [];
let sharedStyle = "";

for (const row of raw.rows) {
  if (looksShifted(row, cols)) {
    skipped.push((row[cols.index.name ?? 1] ?? "?").trim() || "unnamed");
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

  // Lift the stylesheet out once, and keep only the document body.
  if (!sharedStyle) {
    sharedStyle = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  }
  const body = html.match(/<main>([\s\S]*?)<\/main>/)?.[1] ?? "";

  entries.push({
    id: meta.emailHash,
    name: meta.candidate,
    role: meta.currentRole || "",
    submitted: meta.submittedAt,
    dims: profile.dimensions.map((d) => d.score),
    coverage: profile.overallCoverage,
    body,
  });
}

// Weakest first: the coach's question is who needs help, not who is doing well.
const mean = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
};
entries.sort((a, b) => mean(a.dims) - mean(b.dims));

const listItems = entries
  .map(
    (e, i) => `<li>
    <button class="pick" data-i="${i}" data-search="${esc((e.name + " " + e.role).toLowerCase())}">
      <span class="pick-name">${esc(e.name)}</span>
      <span class="pick-role">${esc(e.role)}</span>
      <span class="pick-scores">${e.dims.map((d) => (d === null ? "&ndash;" : d.toFixed(1))).join(" · ")}</span>
    </button>
  </li>`,
  )
  .join("\n");

const panels = entries
  .map((e, i) => `<article class="panel" id="panel-${i}" ${i === 0 ? "" : "hidden"}><main>${e.body}</main></article>`)
  .join("\n");

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EU Fit Check, candidate reports</title>
<style>
${sharedStyle}
  /* Book shell. The per-report styles above are unchanged. */
  body { padding: 0; }
  .book { display: grid; grid-template-columns: minmax(0,1fr); min-height: 100vh; }
  @media (min-width: 64rem) { .book { grid-template-columns: 22rem minmax(0,1fr); } }
  .side {
    border-right: 1px solid var(--border); background: var(--viz-surface);
    padding: 1rem; position: sticky; top: 0; max-height: 100vh; overflow-y: auto;
  }
  .side h1 { font-size: 1rem; margin: 0 0 .15rem; }
  .side .count { color: var(--viz-muted); font-size: .78rem; margin: 0 0 .75rem; }
  #q {
    width: 100%; padding: .5rem .6rem; margin-bottom: .5rem;
    border: 1px solid var(--border); border-radius: 6px;
    background: var(--viz-page); color: var(--ink-1);
    font: inherit; font-size: .85rem;
  }
  .side ul { list-style: none; margin: 0; padding: 0; }
  .side li { margin: 0; }
  .pick {
    display: grid; gap: .1rem; width: 100%; text-align: left; cursor: pointer;
    padding: .5rem .55rem; border: 0; border-radius: 6px;
    background: transparent; color: inherit; font: inherit;
    border-bottom: 1px solid var(--border);
  }
  .pick:hover { background: var(--viz-page); }
  .pick[aria-current="true"] { background: var(--viz-page); box-shadow: inset 3px 0 0 var(--viz-series-1); }
  .pick-name { font-size: .85rem; font-weight: 600; }
  .pick-role { font-size: .74rem; color: var(--viz-muted); }
  .pick-scores { font-size: .74rem; color: var(--ink-2); font-variant-numeric: tabular-nums; }
  .reader { padding: 0 1rem 4rem; }
  .reader main { max-width: 60rem; }
  .note { color: var(--viz-muted); font-size: .75rem; margin-top: 1rem; }
</style>
</head>
<body>
<div class="book">
  <nav class="side">
    <h1>Candidate reports</h1>
    <p class="count">${entries.length} scored, weakest first</p>
    <label class="sr" for="q" hidden>Search candidates</label>
    <input id="q" type="search" placeholder="Search name or role" autocomplete="off">
    <ul id="list">
${listItems}
    </ul>
    <p class="note">Scores are ${DIMENSIONS.map((d) => d.label.split(" ")[0]).join(" · ")}, self-reported and preliminary.${
      skipped.length
        ? ` ${skipped.length} response${skipped.length === 1 ? "" : "s"} not shown, answers shifted out of their columns in the sheet: ${esc(skipped.join(", "))}.`
        : ""
    }</p>
  </nav>
  <div class="reader">
${panels}
  </div>
</div>
<script>
  const picks = [...document.querySelectorAll('.pick')];
  const panels = [...document.querySelectorAll('.panel')];
  function show(i) {
    panels.forEach((p, k) => { p.hidden = k !== i; });
    picks.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    document.querySelector('.reader').scrollIntoView({ block: 'start' });
  }
  picks.forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.i))));
  show(0);
  document.getElementById('q').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    picks.forEach((b) => { b.parentElement.hidden = q !== '' && !b.dataset.search.includes(q); });
  });
</script>
</body>
</html>`;

writeFileSync(outPath, doc, "utf8");
console.log(`wrote ${outPath}: ${entries.length} candidates, ${(doc.length / 1024 / 1024).toFixed(2)} MB`);
if (skipped.length) console.log(`skipped (shifted rows): ${skipped.join(", ")}`);
