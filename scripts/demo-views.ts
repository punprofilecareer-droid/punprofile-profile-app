/**
 * Renders the two projections side by side for one candidate, as the concrete
 * check that the architecture in `docs/candidate-data-architecture.md` holds:
 * one assessment, a coach playbook on the left, a candidate journey on the
 * right, and a hard failure if internal vocabulary leaks into the right pane.
 *
 *   npx tsx scripts/demo-views.ts <responses.json> <name-or-email-substring> <out.html>
 */

import { readFileSync, writeFileSync } from "node:fs";
import { mapColumns, importRow, looksShifted } from "./import-sheet.js";
import { buildCoachView, buildCandidateJourney, assertCandidateSafe } from "../src/lib/views.js";
import { validateCatalog } from "../src/lib/levers.js";
import {
  BRAND_FONT_LINK,
  BRAND_FONT_STACKS,
  BRAND_TOKENS_CSS,
} from "../src/lib/design-tokens.js";

const [, , inPath, who, outPath] = process.argv;
if (!inPath || !who || !outPath) {
  console.error("usage: demo-views.ts <responses.json> <name-or-email-substring> <out.html>");
  process.exit(1);
}

const catalogProblems = validateCatalog();
if (catalogProblems.length) {
  console.error("catalog invalid:\n  " + catalogProblems.join("\n  "));
  process.exit(1);
}

const raw = JSON.parse(readFileSync(inPath, "utf8")) as { header: string[]; rows: string[][] };
const cols = mapColumns(raw.header);
const needle = who.toLowerCase();

const row = raw.rows.find((r) => !looksShifted(r, cols) && r.join("|").toLowerCase().includes(needle));
if (!row) { console.error(`no candidate matching "${who}"`); process.exit(1); }

const { input, meta } = importRow(row, cols);
const coach = buildCoachView(input, meta.candidate);
const journey = buildCandidateJourney(input, meta.candidate);

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const n1 = (v: number | null) => (v === null ? "–" : v.toFixed(1));
const pct = (v: number) => `${Math.round(v * 100)}%`;

const coachPane = `
<h2>Coach view</h2>
<p class="sub">${esc(coach.candidate)}</p>
<table>
  <tr>${coach.dims.map((d) => `<th>${esc(d.label.split(" ")[0])}</th>`).join("")}</tr>
  <tr>${coach.dims.map((d) => `<td><strong>${n1(d.score)}</strong> <span class="mut">${pct(d.coverage)} ${esc(d.band)}</span></td>`).join("")}</tr>
</table>

<h3>Employability levers (goal 1.1)</h3>
<table>
  <tr><th>Move</th><th>Item</th><th>Employability</th></tr>
${coach.employabilityLevers.map((x) => {
  const c = x.changes.find((k) => k.dimension === "employability");
  return `  <tr><td>${esc(x.move.coach)}</td><td class="num">${n1(x.itemFrom)} &rarr; ${n1(x.itemTo)}</td><td class="num">${n1(c?.from ?? null)} &rarr; <strong>${n1(c?.to ?? null)}</strong> (+${(c?.delta ?? 0).toFixed(2)})</td></tr>`;
}).join("\n")}
</table>

<h3>Best moves overall</h3>
<table>
  <tr><th>Move</th><th>Module</th><th>Horizon</th><th>Effect</th></tr>
${coach.topLevers.map((x) => `  <tr><td>${esc(x.move.coach)}</td><td>${esc(x.move.module)}</td><td>${esc(x.move.horizon)}</td><td class="num">${
  x.changes.length
    ? x.changes.map((c) => `${esc(c.label)} ${n1(c.from)}&rarr;${n1(c.to)}`).join("<br>")
    : `coverage +${pct(x.coverageDelta)}`
}</td></tr>`).join("\n")}
</table>

<h3>AI toolstack (goal 1.2)</h3>
<p>State: <strong>${esc(coach.aiPlan.state)}</strong>${coach.aiPlan.metCount !== null ? `, ${coach.aiPlan.metCount}/4 indicators met` : ", Q32 never answered (pre-12/07 respondent)"}</p>
<ul>${coach.aiPlan.missing.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>

<h3>What an engagement unlocks</h3>
<p>Measured ${coach.unlock.measuredNow} of ${coach.unlock.totalItems} items now (${pct(coach.unlock.coverageNow)} coverage). Full engagement: ${coach.unlock.measuredAfter} of ${coach.unlock.totalItems} (${pct(coach.unlock.coverageAfter)}).</p>
<ul>${coach.unlock.services.map((s) => `<li>${esc(s.label)}: ${s.count} items</li>`).join("")}</ul>
`;

const journeyPane = `
<h2>Candidate view</h2>
<p class="sub">${esc(journey.candidate)}</p>

<h3>Where you're already strong</h3>
<ul>${journey.strengths.map((s) => `<li><strong>${esc(s.label)}</strong> &middot; ${s.score.toFixed(1)}/5 &middot; ${esc(s.area)}</li>`).join("")}</ul>

${journey.next ? `<div class="card"><h3>Your next step</h3><p><strong>${esc(journey.next.title)}</strong></p><p class="mut">${esc(journey.next.why)}</p></div>` : ""}

<h3>Your journey</h3>
<ul class="steps">${journey.steps.map((s) => {
  const mark = s.status === "done" ? "&#10003;" : s.status === "next" ? "&rarr;" : s.status === "unanswered" ? "?" : "&middot;";
  return `<li class="s-${s.status}"><span class="mark">${mark}</span> ${esc(s.label)}${s.detail ? ` <span class="mut">(${esc(s.detail)})</span>` : ""}</li>`;
}).join("")}</ul>

<h3>AI habits that speed this up</h3>
<ul class="steps">${journey.aiHabits.map((h) => `<li><span class="mark">${h.done === true ? "&#10003;" : h.done === false ? "&middot;" : "?"}</span> ${esc(h.label)}</li>`).join("")}</ul>

<h3>Within reach</h3>
<ul>${journey.reachable.map((r) => `<li>${esc(r.action)} <span class="mut">Your self-assessed ${esc(r.area)} would move from ${n1(r.from)} to ${n1(r.to)}.</span></li>`).join("")}</ul>

<p>${esc(journey.measured.line)}</p>
<p class="mut">${esc(journey.caveat)}</p>
`;

const leaks = assertCandidateSafe(journeyPane);
if (leaks.length) {
  console.error("CANDIDATE PANE LEAKS INTERNAL VOCABULARY: " + leaks.join(", "));
  process.exit(1);
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Two views, ${esc(meta.candidate)}</title>
${BRAND_FONT_LINK}
<style>
${BRAND_TOKENS_CSS.replace(/\n  \}$/, `\n${BRAND_FONT_STACKS}\n  }`)}
  body { margin:0; padding:1.5rem; background:var(--viz-page); color:var(--ink-1);
    font-family:var(--font-sans); font-size:.9rem; line-height:1.5; }
  .cols { display:grid; gap:1.5rem; grid-template-columns:1fr; max-width:80rem; margin:0 auto; }
  @media (min-width:64rem) { .cols { grid-template-columns:1fr 1fr; } }
  .pane { background:var(--viz-surface); border:1px solid var(--border); border-radius:16px; padding:1.25rem 1.5rem; }
  .pane.candidate { border-top:3px solid var(--color-primary); }
  h2,h3 { font-family:var(--font-display); }
  h2 { margin:0; font-size:1.1rem; } h3 { font-size:.95rem; margin:1.4rem 0 .4rem; }
  .sub { color:var(--ink-2); margin:.15rem 0 0; }
  table { border-collapse:collapse; width:100%; font-size:.84rem; }
  th,td { text-align:left; padding:.35rem .5rem; border-bottom:1px solid var(--border); vertical-align:top; }
  th { color:var(--ink-2); font-weight:600; }
  .num { font-variant-numeric:tabular-nums; white-space:nowrap; }
  .mut { color:var(--viz-muted); font-size:.8rem; }
  ul { padding-left:1.2rem; margin:.4rem 0; } ul.steps { list-style:none; padding-left:0; }
  ul.steps li { padding:.25rem 0; border-bottom:1px solid var(--border); }
  .mark { display:inline-block; width:1.3rem; color:var(--color-primary); font-weight:700; }
  .s-done { color:var(--ink-2); } .s-next { font-weight:600; }
  .card { border:1px solid var(--border); border-left:3px solid var(--color-primary); border-radius:10px; padding:.75rem 1rem; margin:.75rem 0; }
  .card h3 { margin:0 0 .3rem; }
</style></head><body>
<div class="cols">
  <section class="pane">${coachPane}</section>
  <section class="pane candidate">${journeyPane}</section>
</div>
</body></html>`;

writeFileSync(outPath, html, "utf8");
console.log(`wrote ${outPath} for ${meta.candidate}`);
console.log("catalog: valid. candidate pane: no internal vocabulary.");
