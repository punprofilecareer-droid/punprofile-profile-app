/**
 * Generates the app's token layer from the design system.
 *
 *   npm run tokens
 *
 * `design.md` in `../punprofile-career-coaching/punprofile-context/ctxt-brand/`
 * is the source. This script emits two files, because the app has two consumers
 * that cannot share one:
 *
 *   src/app/tokens.generated.css      Tailwind v4 `@theme`, for the app itself.
 *   src/lib/design-tokens.generated.ts  A CSS string, for HTML generated outside
 *                                       Next: the candidate report, the report
 *                                       book, the two-views demo.
 *
 * Both were hand-maintained until 16/08/2026 and both carried a written warning
 * about drifting from each other. Generating them ends that class of problem:
 * there is now one definition, in the coaching repo, and two derived files that
 * are never hand-edited.
 *
 * `globals.css` still exists and is still hand-written. It holds everything that
 * is not a token: the base layer, the chart styles, the animations. It imports
 * the generated file rather than declaring tokens itself.
 *
 * ## The load-bearing alias names
 *
 * `--viz-*`, `--ink-*` and `--border` are NOT design-system names. They are the
 * names `scripts/build-report-book.ts` reads out of a rendered report's
 * stylesheet to build its own shell, and `src/lib/radar.ts` draws the chart
 * through. Renaming one silently strips the report book's sidebar, with no
 * error. They are kept, and mapped onto M3 roles in ALIASES below, so the
 * mapping is visible in one place instead of being spread through two files.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { load } from "js-yaml";

const SOURCE =
  "../punprofile-career-coaching/punprofile-context/ctxt-brand/design.md";
const CSS_OUT = "src/app/tokens.generated.css";
const TS_OUT = "src/lib/design-tokens.generated.ts";
/*
 * The slides preset in the coaching repo, which used to hand-transcribe
 * `design.md` and carried a note telling whoever changed a token to re-transcribe
 * it. Nobody did, so it was still on teal and terracotta a day after the rebrand.
 * Generated from the same source as everything else now.
 */
const DECK_TEMPLATE =
  "../punprofile-career-coaching/.claude/skills/frontend-slides/punprofile-editorial/template.html";
const DECK_OUT =
  "../punprofile-career-coaching/.claude/skills/frontend-slides/punprofile-editorial/tokens.generated.css";

interface TypeRole {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
}

interface Design {
  version: string;
  source: string;
  colors: Record<string, string>;
  "colors-dark": Record<string, string>;
  "state-layers": Record<string, number>;
  typography: Record<string, TypeRole>;
  shape: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
  elevation: Record<string, string>;
  motion: Record<string, string>;
}

/**
 * The names outside code owns, and the role each one now resolves to.
 *
 * `viz-muted` deliberately takes `on-surface-variant` rather than `outline`:
 * it carries the chart's tick labels and captions at 10 and 11px, and `outline`
 * holds only 4.27 on the ground, which is the 3:1 non-text bar rather than the
 * 4.5 that text at that size needs.
 *
 * `viz-surface` takes `surface-container-lowest` (white) rather than `surface`,
 * because the series dots are stroked in it to punch out from the fill beneath,
 * and that read depends on it being the brightest thing available.
 */
const ALIASES: Record<string, string> = {
  "viz-surface": "surface-container-lowest",
  "viz-page": "surface",
  "viz-grid": "outline-variant",
  "viz-muted": "on-surface-variant",
  // The chart belongs to the assessment, not the company, so it takes EU Fit
  // Check's colour. Decided 14/08/2026 for lavender; the role outlived the hue.
  "viz-series-1": "tertiary",
  "ink-1": "on-surface",
  "ink-2": "on-surface-variant",
  border: "outline-variant",
};

/** Roles the standalone HTML needs beyond the aliases above. */
const STANDALONE_ROLES = [
  "primary",
  "on-primary",
  "primary-container",
  "on-primary-container",
  "secondary",
  "tertiary",
  "on-tertiary",
  "tertiary-container",
  "action",
  "on-action",
  "brand-orange",
  "surface",
  "on-surface",
  "on-surface-variant",
  "outline",
  "outline-variant",
  "error",
  "on-error",
];

// ---------------------------------------------------------------- load

const raw = readFileSync(SOURCE, "utf8");
const end = raw.indexOf("\n---\n");
if (!raw.startsWith("---") || end === -1) {
  throw new Error(`${SOURCE}: expected YAML frontmatter delimited by ---`);
}
const d = load(raw.slice(3, end)) as Design;

for (const key of ["colors", "colors-dark", "typography", "shape", "spacing", "elevation", "motion", "breakpoints"] as const) {
  if (!d[key]) throw new Error(`${SOURCE}: frontmatter is missing "${key}"`);
}

/** A missing role here is a mapping bug, not a missing token. Fail loudly. */
function role(name: string): string {
  const v = d.colors[name];
  if (!v) {
    throw new Error(
      `${SOURCE}: no colour "${name}". Either the token was renamed there, or ` +
        `the mapping in scripts/build-tokens.ts is stale.`,
    );
  }
  return v.toLowerCase();
}

for (const target of Object.values(ALIASES)) role(target);
for (const r of STANDALONE_ROLES) role(r);

const BANNER = (file: string) => `/*
 * ${file}
 *
 * GENERATED by scripts/build-tokens.ts from design.md in the coaching repo.
 * Do not hand-edit. Edit the frontmatter there, run \`npm run tokens\`, commit
 * both. Source: ${d.source}
 * Design system version: ${d.version}
 */`;

// ---------------------------------------------------------------- CSS

function css(): string {
  const colours = Object.entries(d.colors)
    .map(([k, v]) => `  --color-${k}: ${v.toLowerCase()};`)
    .join("\n");

  // These are emitted OUTSIDE `@theme`, with their bare names. `radar.ts` reads
  // `var(--viz-grid)` and the report book reads `var(--border)`; neither knows
  // about Tailwind's `--color-` namespace, and putting them inside `@theme`
  // would rename them to `--color-viz-grid` and break both silently.
  const aliases = Object.entries(ALIASES)
    .map(([alias, target]) => `  --${alias}: ${role(target)};`)
    .join("\n");

  // Tailwind v4 reads `--text-<name>` plus its `--…--line-height` companions.
  const type = Object.entries(d.typography)
    .map(([name, t]) => {
      const lines = [
        `  --text-${name}: ${t.fontSize};`,
        `  --text-${name}--line-height: ${t.lineHeight};`,
        `  --text-${name}--font-weight: ${t.fontWeight};`,
      ];
      if (t.letterSpacing && t.letterSpacing !== "0") {
        lines.push(`  --text-${name}--letter-spacing: ${t.letterSpacing};`);
      }
      return lines.join("\n");
    })
    .join("\n");

  // Tailwind v4 generates a variant per `--breakpoint-*`, so declaring these
  // makes `medium:`, `expanded:`, `large:` and `xlarge:` usable as prefixes.
  // `compact` is the base and needs no variant, so it is skipped.
  const breakpoints = Object.entries(d.breakpoints)
    .filter(([k]) => k !== "compact")
    .map(([k, v]) => `  --breakpoint-${k}: ${v};`)
    .join("\n");

  const radius = Object.entries(d.shape)
    .map(([k, v]) => `  --radius-${k}: ${v};`)
    .join("\n");

  const shadow = Object.entries(d.elevation)
    .map(([k, v]) => `  --shadow-${k}: ${v};`)
    .join("\n");

  const motion = Object.entries(d.motion)
    .map(([k, v]) =>
      k.startsWith("duration-")
        ? `  --animate-${k}: ${v};`
        : `  --ease-${k}: ${v};`,
    )
    .join("\n");

  const state = Object.entries(d["state-layers"])
    .map(([k, v]) => `  --state-${k}: ${v};`)
    .join("\n");

  /*
   * The dark scheme. Emitted as a `prefers-color-scheme` block that redefines
   * the same `--color-*` names, so every utility in the app switches without a
   * single `dark:` variant anywhere. Tailwind's own `dark:` prefix is not used
   * and should not be: a component that has to name both schemes is a component
   * that can get one of them wrong.
   *
   * `color-scheme` is set alongside so form controls, scrollbars and the
   * browser's own chrome follow.
   */
  const darkVars = Object.entries(d["colors-dark"])
    .map(([k, v]) => `    --color-${k}: ${v.toLowerCase()};`)
    .join("\n");

  return `${BANNER(CSS_OUT)}

@theme {
  /* Colour roles. Every one of these comes from the Material Theme Builder
     export; none is invented here. */
${colours}

  /* Type scale. Fraunces carries display, headline and title; Inter carries
     body and label; the thai-* roles take taller line boxes because tone marks
     and vowels stack above and below the baseline. */
${type}

  /* Window size classes. M3's five, as \`medium:\`, \`expanded:\`, \`large:\`
     and \`xlarge:\` variants. Tailwind's own sm/md/lg are a different set of
     numbers and mean nothing in this system; prefer these. */
${breakpoints}

  /* Shape. Buttons are \`full\`; the no-pill rule was retired 16/08/2026. */
${radius}

  /* Elevation. Level 0 is the default for almost everything. */
${shadow}

  /* Motion. M3's set; \`--ease-settle\` was retired 16/08/2026 because mixing a
     fifth curve in from outside breaks the relationship between the four. */
${motion}

  /* State layers, applied as a translucent layer of the element's own content
     colour rather than as a separate hover colour. */
${state}
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
${darkVars}
  }
}

/*
 * High contrast. M3 defines three contrast levels and this app ships the
 * standard one, so rather than a third generated scheme this promotes the two
 * roles a high-contrast reader actually needs: the boundaries.
 *
 * \`outline-variant\` measures 1.61 on the light ground and 1.99 on the dark one.
 * That is correct for a divider and useless to somebody who has asked their
 * operating system to turn contrast up. Each boundary role moves one tier
 * darker, so \`outline\` goes 4.27 to 8.88 and \`outline-variant\` goes 1.61 to
 * 4.27, and every card edge, divider and field border becomes perceivable.
 *
 * Accents are left alone deliberately: they already clear AA, and pushing them
 * further would change the brand for a setting that asked for legibility.
 */
@media (prefers-contrast: more) {
  :root {
    --color-outline: #45483c;
    --color-outline-variant: #76786b;
  }
}

@media (prefers-contrast: more) and (prefers-color-scheme: dark) {
  :root {
    --color-outline: #c6c8b8;
    --color-outline-variant: #8d9184;
  }
}

/* The light scheme is the base, so \`color-scheme\` is declared here and
   overridden in the dark block above. Without it the browser paints form
   controls and scrollbars from the OS setting rather than from the palette. */
:root { color-scheme: light }

/* Names that code outside the design system owns. \`build-report-book.ts\` reads
   them out of a rendered stylesheet and \`radar.ts\` draws through them, so
   renaming one breaks something with no error. Bare names, outside \`@theme\`,
   because neither consumer knows about Tailwind's \`--color-\` namespace. */
:root {
${aliases}
}

@media (prefers-color-scheme: dark) {
  :root {
${Object.entries(ALIASES)
  .map(([alias, target]) => `    --${alias}: ${(d["colors-dark"][target] ?? role(target)).toLowerCase()};`)
  .join("\n")}
  }
}
`;
}

// ---------------------------------------------------------------- TS

function ts(): string {
  const vars = [
    ...Object.entries(ALIASES).map(
      ([alias, target]) => `    --${alias}: ${role(target)};`,
    ),
    "",
    ...STANDALONE_ROLES.map((r) => `    --color-${r}: ${role(r)};`),
  ].join("\n");

  const families = Array.from(
    new Set(Object.values(d.typography).map((t) => t.fontFamily)),
  );
  const query = families
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700;800;900`)
    .join("&");

  return `${BANNER(TS_OUT)}

/**
 * The brand token block for standalone HTML output: the candidate report, the
 * report book, the two-views demo. \`src/app/tokens.generated.css\` is the app's
 * copy; both come from the same source, so they cannot drift.
 *
 * **No dark block here, deliberately, and it is not the same reason as before.**
 * The app has a dark scheme since 16/08/2026. This string is for HTML generated
 * outside Next: a candidate's report, the report book, the two-views demo. Those
 * are documents a coach opens, prints and sends on, and a report that renders
 * dark because the reader's laptop is in dark mode is a report that prints
 * wrong and reads as broken when it lands in an inbox. Documents are light.
 */
export const BRAND_TOKENS_CSS = \`  :root {
    color-scheme: light;

${vars}
  }\`;

/**
 * Generated HTML cannot use \`next/font\`, so it links the families directly and
 * keeps a system fallback, which is what a report opened offline falls back to.
 */
export const BRAND_FONT_LINK = \`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${query}&display=swap">\`;

export const BRAND_FONT_STACKS = \`  --font-display: Fraunces, Anuphan, Georgia, serif;
  --font-sans: Inter, Anuphan, system-ui, -apple-system, "Segoe UI", sans-serif;\`;
`;
}

// ---------------------------------------------------------------- deck

/**
 * The slides preset's own token file.
 *
 * Its variables are bare (`--primary`, not `--color-primary`) and a deck carries
 * its own type scale, because `design.md`'s sizes are web pixels and a projected
 * 1920x1080 stage needs stage-readable type. That scale is deck-specific and is
 * preserved verbatim; everything above it comes from the same source as the app.
 *
 * A deck has no dark mode: it is projected or exported to PDF, and both are a
 * fixed surface rather than something that follows a reader's preference.
 */
function deck(): string {
  const roles = [
    "primary", "on-primary", "primary-container", "on-primary-container",
    "secondary", "on-secondary", "secondary-container", "on-secondary-container",
    "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container",
    "action", "on-action", "action-container", "on-action-container",
    "brand-orange", "on-brand-orange", "brand-lime", "on-brand-lime",
    "error", "on-error",
    "background", "surface", "on-surface", "on-surface-variant",
    "surface-container-lowest", "surface-container-low", "surface-container",
    "surface-container-high", "surface-container-highest",
    "outline", "outline-variant", "inverse-surface", "inverse-on-surface",
  ];
  const colours = roles.map((r) => `    --${r}: ${role(r)};`).join("\n");
  const shape = Object.entries(d.shape)
    .map(([k, v]) => `    --radius-${k}: ${v};`)
    .join("\n");
  const elevation = Object.entries(d.elevation)
    .map(([k, v]) => `    --elevation-${k}: ${v};`)
    .join("\n");
  const spacing = Object.entries(d.spacing)
    .map(([k, v]) => `    --${k}: ${v};`)
    .join("\n");

  return `/* ===========================================
   PUNPROFILE — GENERATED DECK TOKENS

   GENERATED by scripts/build-tokens.ts in the app repo, from
   \`design.md\` in punprofile-context/ctxt-brand/. Do not hand-edit.
   Run \`npm run tokens\` in punprofile-profile-app and commit both.

   This file used to be transcribed by hand, and was still on the
   retired teal-and-terracotta palette a day after the rebrand. That
   is why it is generated now.

   The --deck-* scale below is this file's one deck-specific addition:
   design.md's sizes are web pixels, and a fixed 1920x1080 stage needs
   stage-readable type. It is not derived and is kept verbatim.

   Design system version: ${d.version}
   =========================================== */
:root {
    /* --- Colour roles, from design.md > colors --- */
${colours}

    /* --- Typography families, from design.md > typography --- */
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Inter', system-ui, sans-serif;
    --font-thai: 'Anuphan', sans-serif;

    /* --- Deck-specific type scale. Not derived; see the note above. --- */
    --deck-display: 140px;   /* cover hero, Fraunces 900 */
    --deck-h1: 88px;         /* section headline, Fraunces 700 */
    --deck-h2: 56px;         /* primary slide headline, Fraunces 700 */
    --deck-h3: 36px;         /* sub-headline / panel title, Fraunces 600 */
    --deck-lede: 28px;       /* supporting paragraph, Inter 400 */
    --deck-body: 22px;       /* standard copy, Inter 400 */
    --deck-caption: 18px;    /* caption, Inter 400 */
    --deck-label: 16px;      /* eyebrow, Inter 600, tracked uppercase */
    --deck-stat: 72px;       /* stat-callout numeral, Fraunces 700 */

    /* --- Spacing, from design.md > spacing --- */
${spacing}

    /* --- Deck-specific companion spacing, exact matches to the core scale --- */
    --deck-pad-edge: var(--space-8);
    --deck-gap-region: var(--space-7);
    --deck-gap-card: var(--space-5);

    /* --- Shape, from design.md > shape --- */
${shape}

    /* --- Elevation, from design.md > elevation --- */
${elevation}

    /* --- Motion, from design.md > motion --- */
${Object.entries(d.motion).map(([k, v]) => (k.startsWith("duration-") ? `    --${k}: ${v};` : `    --ease-${k}: ${v};`)).join("\n")}
}
`;
}

// ---------------------------------------------------------------- write

writeFileSync(CSS_OUT, css());
writeFileSync(TS_OUT, ts());
writeFileSync(DECK_OUT, deck());

/*
 * The deck template carried its own inline copy of the palette, a fourth one.
 * A standalone HTML template does need self-contained CSS, so the block stays
 * inline and is written here between markers instead of being hand-kept.
 */
{
  const START = "/* PUNPROFILE-TOKENS-START";
  const END = "/* PUNPROFILE-TOKENS-END */";
  const tpl = readFileSync(DECK_TEMPLATE, "utf8");
  const a = tpl.indexOf(START);
  const b = tpl.indexOf(END);
  if (a === -1 || b === -1) {
    throw new Error(`${DECK_TEMPLATE}: token markers are missing`);
  }
  const body = deck()
    .slice(deck().indexOf(":root {") + ":root {".length)
    .replace(/\}\s*$/, "")
    .trimEnd();
  const header =
    `${START}\n       Generated by scripts/build-tokens.ts in the app repo from\n` +
    `       design.md. Do not hand-edit between these markers; run\n` +
    `       \`npm run tokens\`. */\n`;
  writeFileSync(DECK_TEMPLATE, tpl.slice(0, a) + header + body + "\n    " + tpl.slice(b));
}
console.log(
  `tokens <- design.md  (${Object.keys(d.colors).length} colours + ` +
    `${Object.keys(ALIASES).length} aliases, ` +
    `${Object.keys(d.typography).length} type roles)\n` +
    `  ${CSS_OUT}\n  ${TS_OUT}`,
);
