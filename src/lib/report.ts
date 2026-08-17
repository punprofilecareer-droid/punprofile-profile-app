/**
 * The assessment as a document, in two variants, built for print.
 *
 * Structure follows `08_Coaching_Business.md` → ECRA "Candidate Report
 * Structure": executive summary, one spider chart per assessment, top
 * strengths, development priorities, readiness summary.
 *
 * Styling is token-driven, from the brand system in `design.md`. The tokens
 * themselves live in `design-tokens.ts`, shared with the report book and the
 * two-views demo, so a palette change is one edit rather than three. Report
 * HTML is standalone and cannot use `next/font`, hence the font <link>.
 *
 * Every score in the document carries its tier, and a table view mirrors every
 * chart — `prd.md` § 7 requires the non-visual form, and FR-007 requires the
 * self-reported labelling to be impossible to miss.
 *
 * ---------------------------------------------------------------------------
 * PDF, AND WHY THERE IS NO PDF LIBRARY HERE. 17/08/2026.
 * ---------------------------------------------------------------------------
 *
 * The coach sends this to the candidate, so it had to become a PDF rather than
 * an HTML file that arrives in an inbox as an attachment nobody opens on a
 * phone. It is produced by printing this document from the browser, and the
 * whole PDF layer is the `@page` block and the `@media print` rules below.
 *
 * **The alternative was a PDF library, and Thai rules it out.** Thai does not
 * put spaces between words, so correct line breaking needs a dictionary.
 * Chrome ships ICU and does it. `@react-pdf/renderer` and jsPDF break on
 * whitespace, which turns a Thai paragraph into one unbreakable line running
 * off the page. The limited variant is the Thai one, so that is not a
 * trade-off, it is a wall.
 *
 * A headless-Chrome route would return a real `.pdf` in one click and remains
 * open as a later step: it would render THIS html, so nothing here is thrown
 * away by starting with the print dialog. It is not worth ~50MB of Chromium in
 * a serverless function while a person is in the loop anyway.
 *
 * Two consequences worth knowing rather than discovering:
 *
 * - **Fonts must be loaded before `print()` fires**, or the PDF is set in the
 *   fallback stack. `PRINT_BOOTSTRAP` waits on `document.fonts.ready`.
 * - **Chrome ignores `@page` margin boxes**, so there are no automatic page
 *   numbers. Each section carries its own footing instead.
 *
 * ---------------------------------------------------------------------------
 * TWO VARIANTS
 * ---------------------------------------------------------------------------
 *
 * `full` is the coach's copy. English, every competency, tier badges, and the
 * reason each unscored item is blank.
 *
 * `limited` is what the candidate is sent, and is the same document with the
 * internals taken out: no tier badges, no why-blank column, no raw coverage
 * percentage, and no rows for competencies the survey cannot reach. It is
 * localised, and it is checked by `assertCandidateSafe` before it is returned,
 * so an internal word reaching a candidate is a thrown error rather than a
 * document already sent.
 *
 * The unscored ROWS go too, which is one step past "hide the internal
 * columns". With the why-blank column removed their only remaining content was
 * an em dash, and twenty-nine of those read as twenty-nine failures rather
 * than as twenty-nine things a form cannot see. The honest version of that
 * information is the count line under the table, which is kept.
 */

import { radarSvg } from "./radar";
import { BRAND_FONT_LINK, BRAND_FONT_STACKS, BRAND_TOKENS_CSS } from "./design-tokens";
import type { RadarAxis } from "./radar";
import { buildNarrative } from "./narrative";
import { assertCandidateSafe, itemName, dimensionName, dimensionNameByLabel } from "./views";
import { t, type Locale } from "./locale";
import { BAND_COPY } from "./model";
import { topStrengths, developmentPriorities } from "./scoring";
import { projectUnlock } from "./levers";
import type { ProfileScore } from "./scoring";
import type { Tier } from "./model";

export interface ReportMeta {
  /** Display name or a pseudonymous reference. */
  candidate: string;
  submittedAt?: string;
  targetCountries?: string[];
  targetRole?: string;
  currentRole?: string;
}

export type ReportVariant = "full" | "limited";

export interface ReportOptions {
  /** Defaults to `full`, so the two offline scripts need no argument. */
  variant?: ReportVariant;
  /**
   * Only read by the `limited` variant. The full report is coach-facing and
   * English on purpose; `copy.ts` says so at the top of the file.
   */
  locale?: Locale;
  /**
   * Emit the script that waits for fonts and opens the print dialog.
   *
   * Off by default. The offline scripts write these to disk for reading, and a
   * file that prints itself on open is a file nobody opens twice.
   */
  autoPrint?: boolean;
}

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * DD/MM/YYYY, the house format, from whatever the caller had.
 *
 * The app passes an ISO date; the offline scripts pass the Google Form's own
 * `7/8/2026 1:14:46`, which is ambiguous between two date orders and carries a
 * timestamp nobody needs on a printed report. Anything unrecognised is returned
 * as it came, because a submission date that cannot be parsed is still better
 * shown than silently dropped.
 */
function ddmmyyyy(raw: string): string {
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  // The sheet export is D/M/YYYY, matching the locale the form was filled in.
  const sheet = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (sheet) return `${sheet[1].padStart(2, "0")}/${sheet[2].padStart(2, "0")}/${sheet[3]}`;
  return raw;
}

const TIER_BADGE: Record<Tier, { text: string; title: string }> = {
  ecra: { text: "measured", title: "The survey collects this competency's own defined inputs. This is the real framework score." },
  proxy: { text: "proxy", title: "The survey evidences part of the picture. Named as its own observable thing, not as the competency it gestures at." },
  coach: { text: "needs a coach", title: "No survey evidence exists for this. Left blank rather than estimated." },
};

/**
 * Waits for the webfonts, then prints.
 *
 * `document.title` is what Chrome seeds the PDF filename with, so the title is
 * set to the filename stem rather than to a sentence. The 300ms is for the SVG
 * charts: fonts.ready resolves before the axis labels have been laid out
 * against the newly-swapped family, and printing into that gap clips the
 * longest Thai label.
 *
 * The dialog is opened once. A coach who wants a second copy uses the button,
 * which is why the button exists rather than being a duplicate of this.
 */
const PRINT_BOOTSTRAP = `<script>
(function () {
  var go = function () { setTimeout(function () { window.print(); }, 300); };
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); }
  else { window.addEventListener("load", go); }
})();
</script>`;

/**
 * The whole stylesheet, screen and print.
 *
 * Kept as one `<style>` block because `scripts/build-report-book.ts` lifts the
 * first one out of a rendered report by regex and writes its own shell CSS
 * against the `--viz-*`, `--ink-*` and `--border` names in it. A second block
 * would silently give the book half a stylesheet.
 */
const STYLES = `${BRAND_TOKENS_CSS.replace(/\n  \}$/, `\n${BRAND_FONT_STACKS}\n  }`)}
  * { box-sizing: border-box; }

  /* Tonal surfaces carry meaning here — the banner, the badges, the score
     strip. Chrome drops backgrounds when printing unless told not to, which
     would print the honesty banner as unstyled body text. */
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  body {
    margin: 0; padding: 0 1rem 4rem;
    background: var(--viz-page); color: var(--ink-1);
    font-family: var(--font-sans);
    line-height: 1.55;
  }
  main { max-width: 58rem; margin: 0 auto; }
  h1, h2, h3 { font-family: var(--font-display); }

  /* ------------------------------------------------------------- masthead */
  header.top { padding: 2.5rem 0 1.25rem; border-bottom: 2px solid var(--ink-1); }
  .eyebrow {
    margin: 0 0 .5rem; font-size: .7rem; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase; color: var(--viz-series-1);
  }
  h1 { font-size: 1.9rem; margin: 0 0 .3rem; letter-spacing: -0.015em; line-height: 1.15; }
  .sub { color: var(--ink-2); margin: 0; font-size: .88rem; }
  .banner {
    margin: 1.25rem 0 0; padding: .8rem 1rem;
    border: 1px solid var(--border); border-left: 3px solid var(--viz-series-1);
    background: var(--viz-surface); border-radius: 6px;
    font-size: .86rem; color: var(--ink-2);
  }
  .banner strong { color: var(--ink-1); }

  /* -------------------------------------------------------- the print button */
  .toolbar { max-width: 58rem; margin: 1.25rem auto -1rem; text-align: right; }
  .print-btn {
    font: 600 .85rem/1 var(--font-sans); color: var(--viz-surface);
    background: var(--ink-1); border: 0; border-radius: 999px;
    padding: .7rem 1.4rem; cursor: pointer;
  }

  /* ------------------------------------------------------------ score strip */
  .strip {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px;
    background: var(--border); border: 1px solid var(--border);
    border-radius: 10px; overflow: hidden; margin: 1.5rem 0 0;
  }
  @media (min-width: 44rem) { .strip { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  .strip-cell { background: var(--viz-surface); padding: .85rem .9rem 1rem; }
  .strip-label { margin: 0; font-size: .72rem; font-weight: 600; color: var(--ink-2); line-height: 1.3; }
  .strip-score { margin: .3rem 0 0; font-size: 1.85rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
  .strip-score .of { font-size: .8rem; font-weight: 500; color: var(--viz-muted); }
  .strip-score.is-none { font-size: .82rem; font-weight: 600; color: var(--viz-muted); letter-spacing: 0; }
  .strip-band { margin: .2rem 0 0; font-size: .68rem; color: var(--viz-muted); line-height: 1.35; }

  /* -------------------------------------------------------------- sections */
  section { margin: 2.5rem 0 0; }
  h2 { font-size: 1.2rem; margin: 0 0 .15rem; letter-spacing: -0.01em; }
  .lede { font-size: 1.05rem; margin: .75rem 0 0; }
  .dim { background: var(--viz-surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem 1.35rem 1.5rem; }
  .dim-head { border-bottom: 1px solid var(--border); padding-bottom: .75rem; margin-bottom: 1rem; }
  .dim-q { margin: 0; color: var(--ink-2); font-size: .86rem; }
  .dim-score { margin: .5rem 0 0; font-size: 1.05rem; }
  .dim-score strong { font-size: 1.5rem; }
  .dim-cov { color: var(--ink-2); font-size: .82rem; }
  .dim-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.25rem; }
  @media (min-width: 60rem) { .dim-body { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: start; } }
  figure.chart { margin: 0; background: var(--viz-surface); min-width: 0; }
  .viz-radar { display: block; }
  .viz-axis-label { font: 500 11px var(--font-sans); fill: var(--ink-2); }
  .viz-axis-unscored { fill: var(--viz-muted); }
  .viz-axis-value { font-weight: 700; fill: var(--ink-1); font-variant-numeric: tabular-nums; }
  .viz-axis-unscored .viz-axis-value { fill: var(--viz-muted); font-weight: 500; }
  .viz-tick { font: 10px system-ui, sans-serif; fill: var(--viz-muted); font-variant-numeric: tabular-nums; }
  .viz-caption { font: 11px var(--font-sans); fill: var(--viz-muted); }

  /* ---------------------------------------------------------------- tables */
  table.scores { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: .84rem; }
  table.scores caption { text-align: left; color: var(--ink-2); font-size: .8rem; padding-bottom: .4rem; }
  table.scores th, table.scores td { text-align: left; padding: .4rem .5rem; border-bottom: 1px solid var(--border); vertical-align: top; }
  table.scores thead th { color: var(--ink-2); font-weight: 600; font-size: .78rem; }
  table.scores th[scope="row"] { font-weight: 500; }
  .num { font-variant-numeric: tabular-nums; font-weight: 700; width: 3.5rem; }
  .is-unscored th[scope="row"], .is-unscored .num { color: var(--viz-muted); font-weight: 500; }
  .note { color: var(--viz-muted); font-size: .78rem; }
  .unmeasured { margin: .6rem 0 0; color: var(--viz-muted); font-size: .78rem; }
  .badge { display: inline-block; padding: .05rem .4rem; border-radius: 999px; font-size: .68rem; font-weight: 600; border: 1px solid var(--border); white-space: nowrap; }
  .badge-ecra { color: var(--viz-series-1); border-color: currentColor; }
  .badge-proxy { color: var(--ink-2); }
  .badge-coach { color: var(--viz-muted); }

  /* ------------------------------------------------------------ highlights */
  ol.highlights { list-style: none; margin: .5rem 0 0; padding: 0; }
  ol.highlights li { display: grid; grid-template-columns: 2.5rem minmax(0,1fr) auto auto; gap: .6rem; align-items: baseline; padding: .45rem 0; border-bottom: 1px solid var(--border); }
  .h-score { font-variant-numeric: tabular-nums; font-weight: 700; font-size: 1.05rem; }
  .h-dim { color: var(--viz-muted); font-size: .78rem; }
  .cols { display: grid; grid-template-columns: minmax(0,1fr); gap: 1.5rem; }
  @media (min-width: 48rem) { .cols { grid-template-columns: 1fr 1fr; } }

  /* The candidate variant drops the tier badge, so its rows are three cells and
     not four. Left on the coach's grid the fourth track still claimed width and
     squeezed the competency name into a two-line column beside empty space. */
  .is-limited ol.highlights li { grid-template-columns: 2.5rem minmax(0,1fr) auto; }

  /* A dimension with fewer than three scored items gets no radar, because two
     axes are a line rather than a shape. Without this the table stays in the
     chart's column and prints against half a page of nothing. */
  .dim-body.is-solo { grid-template-columns: minmax(0, 1fr) !important; }
  .muted { color: var(--viz-muted); }
  .next { background: var(--viz-surface); border: 1px solid var(--border); border-left: 3px solid var(--viz-series-1); border-radius: 8px; padding: 1rem 1.15rem; }
  footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--viz-muted); font-size: .78rem; }

  /* ===================================================================== */
  /* PRINT                                                                  */
  /* ===================================================================== */
  @page { size: A4; margin: 14mm 13mm 12mm; }

  @media print {
    /* The page tint is a screen surface. On paper it is 400 sheets of pale
       green and a document that reads as a photocopy. */
    body { background: #fff; padding: 0; font-size: 10pt; line-height: 1.5; }
    main { max-width: none; }
    .no-print { display: none !important; }

    header.top { padding-top: 0; }
    h1 { font-size: 18pt; }
    h2 { font-size: 12.5pt; }
    .lede { font-size: 11pt; }

    /* A4's content column is ~184mm, which is narrower than the 60rem the
       screen layout switches at, so both grids would collapse to one column
       and every chart would print at full width with its table underneath.
       Print sets them explicitly instead of inheriting a screen breakpoint. */
    .strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .dim-body { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); align-items: start; gap: 1rem; }
    .cols { grid-template-columns: 1fr 1fr; }

    /* Nothing that reads as one object may be split across a fold: a heading
       orphaned at the foot of a page, a chart cut in half, a strength split
       from its score. */
    .next, .strip, figure.chart, ol.highlights li, .banner, .dim-head, .dim-body { break-inside: avoid; }
    h2, h3 { break-after: avoid; }
    p { orphans: 3; widows: 3; }

    /* The full report's tables run to twelve rows and a card can legitimately
       be taller than a page, so the table is ALLOWED to break and the header
       repeats on the far side. Forbidding the break instead pushes a
       half-empty page ahead of it and then breaks it anyway. Rows stay whole. */
    table.scores thead { display: table-header-group; }
    table.scores tr { break-inside: avoid; }
    .is-limited .dim { break-inside: avoid; }

    /* One dimension per page in the full report. Each is a 500px chart plus a
       table of every competency in it, so two never share a page anyway and
       letting them try produces a fold through the middle of the second. The
       limited variant carries far less and is allowed to flow. */
    .is-full .dim { break-before: page; }

    /* Borders and tonal fills survive, shadows and rounding do not read on
       paper. Keeping the radius costs nothing and keeps the two media
       recognisably the same document. */
    .dim { border-color: var(--border); }

    footer { margin-top: 1.5rem; break-inside: avoid; }
    a { color: inherit; text-decoration: none; }
  }`;

/** The four-cell readout above the charts. Numbers before shapes. */
function scoreStrip(
  profile: ProfileScore,
  label: (key: string, fallback: string) => string,
  bandCopy: (band: string) => string,
  notMeasured: string,
): string {
  const cells = profile.dimensions
    .map(
      (d) => `<div class="strip-cell">
      <p class="strip-label">${esc(label(d.key, d.label))}</p>
      ${
        d.score === null
          ? `<p class="strip-score is-none">${esc(notMeasured)}</p>`
          : `<p class="strip-score">${d.score.toFixed(1)}<span class="of"> / 5</span></p>`
      }
      <p class="strip-band">${esc(bandCopy(d.band))}</p>
    </div>`,
    )
    .join("\n");
  return `<div class="strip">\n${cells}\n  </div>`;
}

/**
 * The document shell. One `<style>`, one `<main>`, and the print script
 * outside both, because the report book's regexes depend on all three.
 */
function document_(args: {
  lang: string;
  title: string;
  variant: ReportVariant;
  printLabel: string;
  body: string;
  autoPrint: boolean;
}): string {
  return `<!doctype html>
<html lang="${args.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(args.title)}</title>
${BRAND_FONT_LINK}
<style>
${STYLES}
</style>
</head>
<body class="is-${args.variant}">
<div class="toolbar no-print"><button type="button" class="print-btn" onclick="window.print()">${esc(args.printLabel)}</button></div>
<main>
${args.body}
</main>
${args.autoPrint ? PRINT_BOOTSTRAP : ""}
</body>
</html>`;
}

/**
 * The coach's copy. English, every competency, every tier, every reason a
 * score is blank.
 */
export function renderReport(profile: ProfileScore, meta: ReportMeta, opts: ReportOptions = {}): string {
  if (opts.variant === "limited") return renderCandidateReport(profile, meta, opts);

  const n = buildNarrative(profile);

  const overviewAxes: RadarAxis[] = profile.dimensions.map((d) => ({ label: d.label, value: d.score }));
  const overview = radarSvg(overviewAxes, {
    idPrefix: "overview",
    size: 320,
    widthRatio: 1.9,
    caption: "Four dimensions, self-reported",
  });

  const dimSections = profile.dimensions
    .map((d, idx) => {
      const axes: RadarAxis[] = d.items.map((i) => ({ label: i.label, value: i.score }));
      // Sized so the axis labels land near their nominal 11px on paper rather
      // than at the 4px an A4 column scaled them to. The wide ratio is for the
      // English competency names, which are the longest labels in the document.
      const svg = radarSvg(axes, {
        idPrefix: `dim${idx}`,
        size: 250,
        widthRatio: 2.1,
        maxLabel: 30,
        caption: `${d.label} — ${d.scoredCount} of ${d.totalCount} scored`,
      });
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
    </div>
  </div>
  <table class="scores">
    <caption>Every competency in ${esc(d.label)}, and where its number came from</caption>
    <thead><tr><th scope="col">Competency</th><th scope="col">Score</th><th scope="col">Evidence</th><th scope="col">Why blank</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
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
    meta.submittedAt ? `Submitted ${esc(ddmmyyyy(meta.submittedAt))}` : "",
  ].filter(Boolean);

  const body = `  <header class="top">
    <p class="eyebrow">PunProfile · EU Fit Check · Coach copy</p>
    <h1>${esc(meta.candidate)}</h1>
    <p class="sub">${metaBits.join(" · ")}</p>
    <p class="banner"><strong>Self-reported and preliminary.</strong> ${esc(n.caveat)}</p>
  </header>

  <section id="summary">
    <h2>Executive summary</h2>
    <p class="lede">${esc(n.headline)}</p>
    ${scoreStrip(profile, (_k, fallback) => fallback, (band) => BAND_COPY[band as keyof typeof BAND_COPY] ?? band, "Not scored")}
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
  </footer>`;

  return document_({
    lang: "en",
    // Chrome seeds the PDF filename from the title, so this is a filename stem
    // and not a sentence.
    title: `EU Fit Check — ${meta.candidate} — coach copy`,
    variant: "full",
    printLabel: "Save as PDF",
    body,
    autoPrint: opts.autoPrint ?? false,
  });
}

/**
 * What the candidate is sent.
 *
 * Same document, internals removed. See the variant note at the top of this
 * file for what "internals" covers and why the unscored rows are part of it.
 *
 * Every candidate-visible string resolves through `copy.ts`, so a key with no
 * Thai yet renders its English rather than a machine translation, which is the
 * rule `locale.ts` states and `narrative.ts` refuses to break.
 */
export function renderCandidateReport(
  profile: ProfileScore,
  meta: ReportMeta,
  opts: ReportOptions = {},
): string {
  const locale: Locale = opts.locale ?? "th";
  const s = (key: Parameters<typeof t>[0], vars?: Record<string, string | number>) => t(key, locale, vars);

  const dimLabel = (key: string, fallback: string) => dimensionName(key, fallback, locale);
  const notMeasured = s("teaser.score.none");
  // `BAND_COPY` is the coach report's English. The candidate's copy of the same
  // three sentences is keyed, so it can be reviewed in Thai like every other
  // string they read.
  //
  // Written out rather than composed as `band.${d.band}`, because `verify-copy`
  // greps the source for each key to prove it is reachable, and a key it cannot
  // see is a key it reports as dead.
  const bandCopy = (band: string) =>
    band === "moderate"
      ? s("band.moderate")
      : band === "limited"
        ? s("band.limited")
        : s("band.indicative");

  const overviewAxes: RadarAxis[] = profile.dimensions.map((d) => ({
    label: dimLabel(d.key, d.label),
    value: d.score,
  }));
  // Values off and the box widened, for the same reason the first read does it:
  // a Thai axis name plus its number is wider than the plot leaves room for.
  //
  // `size` is the viewBox height, and the axis labels are 11px IN THAT BOX, so
  // the only thing that decides how big they land on paper is the ratio between
  // the box and the width it is drawn into. The coach report's 460 renders into
  // a 544px figure at 1.9 wide, which is a 0.6 scale and a 6px label: legible on
  // a laptop, gone in print. These are sized to land near 1:1.
  const overview = radarSvg(overviewAxes, {
    idPrefix: "overview",
    size: 300,
    values: false,
    maxLabel: 40,
    widthRatio: 2.1,
    caption: s("teaser.chart.heading"),
  });

  const dimSections = profile.dimensions
    .map((d, idx) => {
      const scored = d.items.filter((i) => i.score !== null);
      const unmeasured = d.totalCount - d.scoredCount;

      const axes: RadarAxis[] = scored.map((i) => ({ label: itemName(i.key, i.label, locale), value: i.score }));
      // A radar needs three axes to be a shape. Below that it is a line or a
      // dot and says less than the table under it, so the table stands alone.
      const svg =
        axes.length >= 3
          ? radarSvg(axes, {
              idPrefix: `dim${idx}`,
              size: 240,
              values: false,
              // Thai competency names run past the 24-character default and got
              // an ellipsis mid-word, which reads as a rendering fault rather
              // than as a shortened label. The wider box is what pays for it.
              maxLabel: 40,
              widthRatio: 2.3,
            })
          : "";

      const rows = scored
        .map(
          (i) => `<tr>
        <th scope="row">${esc(itemName(i.key, i.label, locale))}</th>
        <td class="num">${(i.score as number).toFixed(1)}</td>
      </tr>`,
        )
        .join("\n");

      const table = rows
        ? `<table class="scores">
        <thead><tr><th scope="col">${esc(s("report.competency"))}</th><th scope="col">${esc(s("report.score"))}</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>`
        : "";

      return `<section class="dim" id="${d.key}">
  <header class="dim-head">
    <h2>${esc(dimLabel(d.key, d.label))}</h2>
    <p class="dim-score">${
      d.score === null
        ? esc(notMeasured)
        : `<strong>${d.score.toFixed(1)}</strong> / 5 <span class="dim-cov">· ${esc(bandCopy(d.band))}</span>`
    }</p>
  </header>
  <div class="dim-body${svg ? "" : " is-solo"}">
    ${svg ? `<figure class="chart">${svg}</figure>` : ""}
    <div class="dim-text">
      ${table}
      ${unmeasured > 0 ? `<p class="unmeasured">${esc(s("report.unmeasured", { count: unmeasured }))}</p>` : ""}
    </div>
  </div>
</section>`;
    })
    .join("\n");

  const strengths = topStrengths(profile, 3);
  const priorities = developmentPriorities(profile, 3);

  const listOf = (items: { key: string; label: string; score: number; dimension: string }[]) =>
    items.length
      ? `<ol class="highlights">${items
          .map(
            (h) =>
              `<li><span class="h-score">${h.score.toFixed(1)}</span><span class="h-label">${esc(itemName(h.key, h.label, locale))}</span><span class="h-dim">${esc(dimensionNameByLabel(h.dimension, locale))}</span></li>`,
          )
          .join("")}</ol>`
      : `<p class="muted">${esc(notMeasured)}</p>`;

  const metaBits = [
    meta.targetRole ? esc(meta.targetRole) : "",
    meta.targetCountries?.length ? esc(meta.targetCountries.join(", ")) : "",
    meta.submittedAt ? esc(ddmmyyyy(meta.submittedAt)) : "",
  ].filter(Boolean);

  // The same projection the result screen shows, not a second count of the same
  // thing. `more` is what an engagement unlocks, which is a smaller number than
  // "everything unmeasured" and is the one the copy key was written against.
  const unlock = projectUnlock(profile);

  const body = `  <header class="top">
    <p class="eyebrow">PunProfile · EU Fit Check</p>
    <h1>${esc(meta.candidate)}</h1>
    <p class="sub">${metaBits.join(" · ")}</p>
    <p class="banner"><strong>${esc(s("teaser.selfReported"))}</strong> ${esc(s("result.caveat"))}</p>
  </header>

  <section id="summary">
    <h2>${esc(s("teaser.headline"))}</h2>
    ${scoreStrip(profile, dimLabel, bandCopy, notMeasured)}
    <figure class="chart" style="max-width:34rem">${overview}</figure>
    <p class="unmeasured">${esc(
      s("result.measured", {
        count: unlock.measuredNow,
        total: unlock.totalItems,
        more: unlock.measuredAfter - unlock.measuredNow,
      }),
    )}</p>
  </section>

${dimSections}

  <section class="cols">
    <div>
      <h2>${esc(s("report.strengths"))}</h2>
      ${listOf(strengths)}
    </div>
    <div>
      <h2>${esc(s("report.priorities"))}</h2>
      ${listOf(priorities)}
    </div>
  </section>

  <section>
    <h2>${esc(s("report.next"))}</h2>
    <p class="next">${esc(s("teaser.nextStep"))}</p>
  </section>

  <footer>
    ${esc(s("report.footer"))}
  </footer>`;

  const html = document_({
    lang: locale,
    title: `EU Fit Check — ${meta.candidate}`,
    variant: "limited",
    printLabel: s("report.savePdf"),
    body,
    autoPrint: opts.autoPrint ?? false,
  });

  // The check that makes the whitelist rule enforceable rather than aspirational.
  // Run against the rendered document, so a word hard-coded into a template here
  // is caught as well as one that arrives through the data.
  const leaks = assertCandidateSafe(stripMarkup(html));
  if (leaks.length) {
    throw new Error(
      `renderCandidateReport: internal vocabulary reached a candidate document (${leaks.join(", ")}). ` +
        `See the naming rule in 08_Coaching_Business.md.`,
    );
  }
  return html;
}

/**
 * Text content only, for the safety check.
 *
 * The markup itself carries `class="highlights"` and an `id` per dimension, and
 * a check run over raw HTML would fail on a CSS class name rather than on
 * anything a candidate can read.
 */
function stripMarkup(html: string): string {
  return html
    .replace(/<style>[\s\S]*?<\/style>/g, " ")
    .replace(/<script>[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ");
}
