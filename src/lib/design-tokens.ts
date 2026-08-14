/**
 * The brand token block for standalone HTML output.
 *
 * `src/app/globals.css` is the app's copy and has to be hand-written, because
 * CSS cannot import TypeScript. This is the copy for everything generated
 * outside Next: the candidate report, the report book, the two-views demo.
 * Between them that is two definitions of the palette rather than the four
 * that existed before.
 *
 * Values come from `design.md` in the sibling coaching repo. Do not invent a
 * token here and do not let this file and `globals.css` drift.
 *
 * The variable NAMES are load-bearing. `scripts/build-report-book.ts` lifts the
 * emitted <style> block out of a rendered report and writes its own shell CSS
 * against `--viz-*`, `--ink-*` and `--border`. Renaming one silently strips the
 * report book's sidebar.
 *
 * There is no dark block. The system defines no dark palette; its base is white
 * with full-bleed colour washes.
 */

export const BRAND_TOKENS_CSS = `  :root {
    color-scheme: light;

    /* Chart roles, consumed by radar.ts through these names only. The series
       is EU Fit Check's own Lavender (14/08/2026), not the company Teal that
       replaced the original placeholder blue: the chart belongs to the
       assessment, and a coach report and the candidate's own screen have to
       show the same chart in the same colour. */
    --viz-series-1: #6b63c7;
    --viz-grid: #d9d8dc;
    --viz-muted: #8d8997;
    --viz-surface: #ffffff;
    --viz-page: #f5f5f5;

    --ink-1: #242425;
    --ink-2: #413b51;
    --border: #d9d8dc;

    --primary: #068376;
    --primary-deep: #04524a;
    --eufit: #6b63c7;
    --eufit-deep: #4a3f9e;
    --accent: #cc3f00;
    --accent-bright: #ff4f00;
    --error: #b3261e;
  }`;

/**
 * Fraunces + Inter + the two Noto Thai faces. Generated HTML cannot use
 * `next/font`, so it links the families directly and keeps a system fallback,
 * which is what a report opened offline falls back to. Weights match the
 * rendered spec in `design.html`.
 */
export const BRAND_FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=Noto+Serif+Thai:wght@600;700&family=Noto+Sans+Thai:wght@400;500&display=swap">`;

export const BRAND_FONT_STACKS = `  --font-display: Fraunces, "Noto Serif Thai", Georgia, serif;
  --font-sans: Inter, "Noto Sans Thai", system-ui, -apple-system, "Segoe UI", sans-serif;`;
