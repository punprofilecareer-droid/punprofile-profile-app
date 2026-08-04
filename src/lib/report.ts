/**
 * Candidate report as a self-contained HTML document.
 *
 * Structure follows `08_Coaching_Business.md` → ECRA "Candidate Report
 * Structure": executive summary, one spider chart per assessment, top
 * strengths, development priorities, readiness summary.
 *
 * Styling is deliberately minimal and token-driven. `docs/design.md` is a
 * PENDING stub and `product-roadmap.md` TASK-006 set the rule for this repo:
 * plain defaults as placeholder styling, never an invented palette. The chart
 * colours come from the validated brand-neutral default in the dataviz
 * reference palette and are declared once as custom properties, so swapping in
 * real brand tokens later is a one-block edit.
 *
 * Every score in the document carries its tier, and a table view mirrors every
 * chart — `prd.md` § 7 requires the non-visual form, and FR-007 requires the
 * self-reported labelling to be impossible to miss.
 */

import { radarSvg } from "./radar.js";
import type { RadarAxis } from "./radar.js";
import { buildNarrative } from "./narrative.js";
import type { ProfileScore } from "./scoring.js";
import type { Tier } from "./model.js";

export interface ReportMeta {
  /** Display name or a pseudonymous reference. */
  candidate: string;
  submittedAt?: string;
  targetCountries?: string[];
  targetRole?: string;
  currentRole?: string;
}

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TIER_BADGE: Record<Tier, { text: string; title: string }> = {
  ecra: { text: "measured", title: "The survey collects this competency's own defined inputs. This is the real framework score." },
  proxy: { text: "proxy", title: "The survey evidences part of the picture. Named as its own observable thing, not as the competency it gestures at." },
  coach: { text: "needs a coach", title: "No survey evidence exists for this. Left blank rather than estimated." },
};

export function renderReport(profile: ProfileScore, meta: ReportMeta): string {
  const n = buildNarrative(profile);

  const overviewAxes: RadarAxis[] = profile.dimensions.map((d) => ({ label: d.label, value: d.score }));
  const overview = radarSvg(overviewAxes, { idPrefix: "overview", size: 460, caption: "Four dimensions, self-reported" });

  const dimSections = profile.dimensions
    .map((d, idx) => {
      const axes: RadarAxis[] = d.items.map((i) => ({ label: i.label, value: i.score }));
      const svg = radarSvg(axes, { idPrefix: `dim${idx}`, size: 500, caption: `${d.label} — ${d.scoredCount} of ${d.totalCount} scored` });
      const rows = d.items
        .map(
          (i) => `<tr class="${i.score === null ? "is-unscored" : ""}">
        <th scope="row">${esc(i.label)}</th>
        <td class="num">${i.score === null ? "—" : i.score.toFixed(1)}</td>
        <td><span class="badge badge-${i.tier}" title="${esc(TIER_BADGE[i.tier].title)}">${TIER_BADGE[i.tier].text}</span></td>
        <td class="note">${esc(i.note ?? "")}</td>
      </tr>`,
        )
        .join("\n");

      return `<section class="dim" id="${d.key}">
  <header class="dim-head">
    <h2>${esc(d.label)}</h2>
    <p class="dim-q">${esc(d.question)}</p>
    <p class="dim-score">${d.score === null ? "Not scored" : `<strong>${d.score.toFixed(1)}</strong> / 5`}
      <span class="dim-cov">· ${Math.round(d.coverage * 100)}% coverage · ${esc(d.band)}</span></p>
  </header>
  <div class="dim-body">
    <figure class="chart">${svg}</figure>
    <div class="dim-text">
      <p>${esc(n.perDimension[idx].text)}</p>
      <table class="scores">
        <caption>Every competency in ${esc(d.label)}, and where its number came from</caption>
        <thead><tr><th scope="col">Competency</th><th scope="col">Score</th><th scope="col">Evidence</th><th scope="col">Why blank</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
  </div>
</section>`;
    })
    .join("\n");

  const listOf = (items: { label: string; score: number; dimension: string; tier: Tier }[]) =>
    items.length
      ? `<ol class="highlights">${items
          .map(
            (h) =>
              `<li><span class="h-score">${h.score.toFixed(1)}</span><span class="h-label">${esc(h.label)}</span><span class="h-dim">${esc(h.dimension)}</span><span class="badge badge-${h.tier}">${TIER_BADGE[h.tier].text}</span></li>`,
          )
          .join("")}</ol>`
      : `<p class="muted">Not enough scored answers yet.</p>`;

  const metaBits = [
    meta.currentRole ? `Currently ${esc(meta.currentRole)}` : "",
    meta.targetRole ? `Targeting ${esc(meta.targetRole)}` : "",
    meta.targetCountries?.length ? esc(meta.targetCountries.join(", ")) : "",
    meta.submittedAt ? `Submitted ${esc(meta.submittedAt)}` : "",
  ].filter(Boolean);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EU Fit Check — ${esc(meta.candidate)}</title>
<style>
  :root {
    color-scheme: light dark;
    --viz-surface: #fcfcfb;
    --viz-page: #f9f9f7;
    --viz-series-1: #2a78d6;
    --viz-grid: #e1e0d9;
    --viz-muted: #898781;
    --ink-1: #0b0b0b;
    --ink-2: #52514e;
    --border: rgba(11,11,11,0.10);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --viz-surface: #1a1a19;
      --viz-page: #0d0d0d;
      --viz-series-1: #3987e5;
      --viz-grid: #2c2c2a;
      --viz-muted: #898781;
      --ink-1: #ffffff;
      --ink-2: #c3c2b7;
      --border: rgba(255,255,255,0.10);
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0 1rem 4rem;
    background: var(--viz-page); color: var(--ink-1);
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.55;
  }
  main { max-width: 60rem; margin: 0 auto; }
  header.top { padding: 2.5rem 0 1.25rem; border-bottom: 1px solid var(--border); }
  h1 { font-size: 1.6rem; margin: 0 0 .25rem; letter-spacing: -0.01em; }
  .sub { color: var(--ink-2); margin: 0; font-size: .9rem; }
  .banner {
    margin: 1.25rem 0 0; padding: .75rem 1rem;
    border: 1px solid var(--border); border-left: 3px solid var(--viz-series-1);
    background: var(--viz-surface); border-radius: 6px;
    font-size: .88rem; color: var(--ink-2);
  }
  .banner strong { color: var(--ink-1); }
  section { margin: 2.5rem 0 0; }
  h2 { font-size: 1.15rem; margin: 0 0 .15rem; letter-spacing: -0.01em; }
  .lede { font-size: 1.05rem; margin: .75rem 0 0; }
  .dim { background: var(--viz-surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem 1.35rem 1.5rem; }
  .dim-head { border-bottom: 1px solid var(--border); padding-bottom: .75rem; margin-bottom: 1rem; }
  .dim-q { margin: 0; color: var(--ink-2); font-size: .88rem; }
  .dim-score { margin: .5rem 0 0; font-size: 1.05rem; }
  .dim-score strong { font-size: 1.5rem; }
  .dim-cov { color: var(--ink-2); font-size: .82rem; }
  .dim-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.25rem; }
  @media (min-width: 60rem) { .dim-body { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: start; } }
  figure.chart { margin: 0; background: var(--viz-surface); min-width: 0; }
  .viz-radar { display: block; }
  .viz-axis-label { font: 500 11px system-ui, -apple-system, sans-serif; fill: var(--ink-2); }
  .viz-axis-unscored { fill: var(--viz-muted); }
  .viz-axis-value { font-weight: 700; fill: var(--ink-1); font-variant-numeric: tabular-nums; }
  .viz-axis-unscored .viz-axis-value { fill: var(--viz-muted); font-weight: 500; }
  .viz-tick { font: 10px system-ui, sans-serif; fill: var(--viz-muted); font-variant-numeric: tabular-nums; }
  .viz-caption { font: 11px system-ui, sans-serif; fill: var(--viz-muted); }
  table.scores { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: .84rem; }
  table.scores caption { text-align: left; color: var(--ink-2); font-size: .8rem; padding-bottom: .4rem; }
  table.scores th, table.scores td { text-align: left; padding: .4rem .5rem; border-bottom: 1px solid var(--border); vertical-align: top; }
  table.scores thead th { color: var(--ink-2); font-weight: 600; font-size: .78rem; }
  table.scores th[scope="row"] { font-weight: 500; }
  .num { font-variant-numeric: tabular-nums; font-weight: 700; width: 3.5rem; }
  .is-unscored th[scope="row"], .is-unscored .num { color: var(--viz-muted); font-weight: 500; }
  .note { color: var(--viz-muted); font-size: .78rem; }
  .badge { display: inline-block; padding: .05rem .4rem; border-radius: 999px; font-size: .68rem; font-weight: 600; border: 1px solid var(--border); white-space: nowrap; }
  .badge-ecra { color: var(--viz-series-1); border-color: currentColor; }
  .badge-proxy { color: var(--ink-2); }
  .badge-coach { color: var(--viz-muted); }
  ol.highlights { list-style: none; margin: .5rem 0 0; padding: 0; }
  ol.highlights li { display: grid; grid-template-columns: 2.5rem minmax(0,1fr) auto auto; gap: .6rem; align-items: baseline; padding: .45rem 0; border-bottom: 1px solid var(--border); }
  .h-score { font-variant-numeric: tabular-nums; font-weight: 700; font-size: 1.05rem; }
  .h-dim { color: var(--viz-muted); font-size: .78rem; }
  .cols { display: grid; grid-template-columns: minmax(0,1fr); gap: 1.5rem; }
  @media (min-width: 48rem) { .cols { grid-template-columns: 1fr 1fr; } }
  .muted { color: var(--viz-muted); }
  .next { background: var(--viz-surface); border: 1px solid var(--border); border-left: 3px solid var(--viz-series-1); border-radius: 8px; padding: 1rem 1.15rem; }
  footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--viz-muted); font-size: .78rem; }
</style>
</head>
<body>
<main>
  <header class="top">
    <h1>EU Fit Check — ${esc(meta.candidate)}</h1>
    <p class="sub">${metaBits.join(" · ")}</p>
    <p class="banner"><strong>Self-reported and preliminary.</strong> ${esc(n.caveat)}</p>
  </header>

  <section id="summary">
    <h2>Executive summary</h2>
    <p class="lede">${esc(n.headline)}</p>
    <figure class="chart" style="max-width:34rem">${overview}</figure>
  </section>

${dimSections}

  <section class="cols">
    <div>
      <h2>Top strengths</h2>
      ${listOf(n.strengths)}
    </div>
    <div>
      <h2>Development priorities</h2>
      ${listOf(n.priorities)}
    </div>
  </section>

  <section>
    <h2>What to do first</h2>
    <p class="next">${esc(n.nextStep)}</p>
  </section>

  <footer>
    Scored by the mapping in <code>docs/self-report-scoring.md</code> against the ECRA framework
    owned by <code>08_Coaching_Business.md</code>. Scores marked “measured” use the framework's own
    formula; “proxy” scores measure a related observable and are named for what they actually
    measure; “needs a coach” items are left blank rather than estimated.
  </footer>
</main>
</body>
</html>`;
}
