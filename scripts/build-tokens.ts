/**
 * Generates the app's token layer from the design system.
 *
 *   npm run tokens
 *
 * `design.md` in `../punprofile-career-coaching/punprofile-context/ctxt-brand/`
 * is the source. This script emits three files, because there are three
 * consumers that cannot share one:
 *
 *   src/app/tokens.generated.css        Tailwind v4 `@theme`, for the app.
 *   src/lib/design-tokens.generated.ts  A CSS string, for HTML generated outside
 *                                       Next: the candidate report, the report
 *                                       book, the two-views demo.
 *   ...frontend-slides/…/tokens.generated.css   The deck preset.
 *
 * There is one definition and three derived files, none of which is ever
 * hand-edited.
 *
 * ## Three kinds of name
 *
 * 1. **Roles.** `primary`, `ink`, `canvas-soft`, `mute-strong`. The system.
 *    Everything written from now on uses these.
 *
 * 2. **Aliases.** The names existing screens and generators are written in.
 *    `design.md > aliases` maps each onto a role and this script emits it as a
 *    real value, so a screen that has not been rebuilt yet renders in the new
 *    colours without being touched. An alias leaves the map when nothing
 *    references it. The type, shape and spacing equivalents are mechanical
 *    rather than semantic, so their maps live below rather than in `design.md`.
 *
 * 3. **Bare names.** `--viz-*`, `--ink-*` and `--border` are read out of a
 *    rendered stylesheet by `scripts/build-report-book.ts` and drawn through by
 *    `src/lib/radar.ts`. Neither knows about Tailwind's `--color-` namespace, so
 *    these are emitted outside `@theme` with their bare names. Renaming one
 *    silently strips the report book's sidebar, with no error.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { load } from "js-yaml";

const SOURCE =
  "../punprofile-career-coaching/punprofile-context/ctxt-brand/design.md";
const CSS_OUT = "src/app/tokens.generated.css";
const TS_OUT = "src/lib/design-tokens.generated.ts";
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
  "colors-contrast": Record<string, string>;
  "colors-contrast-dark": Record<string, string>;
  /** Retired colour names, each pointing at a role above. See the header. */
  aliases: Record<string, string>;
  "state-layers": Record<string, number>;
  typography: Record<string, TypeRole>;
  shape: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
  elevation: Record<string, string>;
  motion: Record<string, string>;
}

/** Bare names outside code owns, and the role each resolves to. */
const BARE: Record<string, string> = {
  // The chart's ground is the brightest surface available, because the series
  // dots are stroked in it to punch out from the fill beneath.
  "viz-surface": "canvas",
  "viz-page": "canvas-soft",
  "viz-grid": "line",
  // Tick labels and captions sit at 10 and 11px, which is below the size `mute`
  // is safe at, so the chart takes the AA-rated grey instead.
  "viz-muted": "mute-strong",
  "viz-series-1": "accent-cyan",
  "ink-1": "ink",
  "ink-2": "body",
  border: "line",
};

/** Retired type roles. The utilities (`text-title-medium`) come from these. */
const LEGACY_TYPE: Record<string, string> = {
  "display-large": "display-lg",
  "display-medium": "headline-lg",
  "display-small": "headline-md",
  "display-sm": "headline-md",
  "display-xs": "headline-sm",
  "headline-large": "headline-md",
  "headline-medium": "headline-sm",
  "headline-small": "headline-sm",
  "title-large": "heading-sm",
  "title-medium": "heading-xs",
  "title-small": "body-sm-strong",
  "body-large": "body-lg",
  "body-medium": "body-md",
  "body-small": "body-sm",
  "label-large": "body-sm-strong",
  "label-medium": "caption-strong",
  "label-small": "caption-strong",
};

/** Retired radius names. `extra-large` was 28px and is now the 30px card. */
const LEGACY_SHAPE: Record<string, string> = {
  none: "none",
  "extra-small": "sm",
  small: "sm",
  medium: "md",
  large: "2xl",
  "extra-large": "3xl",
  full: "full",
};

/** Retired spacing names. Every one is an exact match on the new scale. */
const LEGACY_SPACE: Record<string, string> = {
  "space-1": "xs",
  "space-2": "sm",
  "space-3": "lg",
  "space-4": "xl",
  "space-5": "2xl",
  "space-6": "3xl",
  "space-7": "4xl",
  "space-8": "5xl",
};

// ---------------------------------------------------------------- load

const raw = readFileSync(SOURCE, "utf8");
const end = raw.indexOf("\n---\n");
if (!raw.startsWith("---") || end === -1) {
  throw new Error(`${SOURCE}: expected YAML frontmatter delimited by ---`);
}
const d = load(raw.slice(3, end)) as Design;

for (const key of [
  "colors", "colors-dark", "aliases", "typography", "shape",
  "spacing", "elevation", "motion", "breakpoints", "state-layers",
] as const) {
  if (!d[key]) throw new Error(`${SOURCE}: frontmatter is missing "${key}"`);
}

/** A missing role here is a mapping bug, not a missing token. Fail loudly. */
function role(name: string, scheme: "light" | "dark" = "light"): string {
  const table = scheme === "dark" ? d["colors-dark"] : d.colors;
  const v = table[name] ?? d.colors[name];
  if (!v) {
    throw new Error(
      `${SOURCE}: no colour "${name}". Either the role was renamed there, or ` +
        `a mapping in scripts/build-tokens.ts is stale.`,
    );
  }
  return v.toLowerCase();
}

for (const target of Object.values(BARE)) role(target);
for (const [alias, target] of Object.entries(d.aliases)) {
  if (!d.colors[target]) {
    throw new Error(`${SOURCE}: alias "${alias}" points at unknown role "${target}"`);
  }
  if (alias in d.colors && alias !== target) {
    throw new Error(
      `${SOURCE}: alias "${alias}" is also a role, and points at "${target}". ` +
        `One name cannot be two colours.`,
    );
  }
}

/** An alias whose name is already a role is emitted once, by the role. */
const aliasEntries = Object.entries(d.aliases).filter(([alias]) => !(alias in d.colors));
const shapeAliases = Object.entries(LEGACY_SHAPE).filter(([alias]) => !(alias in d.shape));
const typeAliases = Object.entries(LEGACY_TYPE).filter(([alias]) => !(alias in d.typography));
const spaceAliases = Object.entries(LEGACY_SPACE).filter(([alias]) => !(alias in d.spacing));
for (const [alias, target] of Object.entries(LEGACY_TYPE)) {
  if (!d.typography[target]) {
    throw new Error(`scripts/build-tokens.ts: type alias "${alias}" points at unknown role "${target}"`);
  }
}
for (const [alias, target] of Object.entries(LEGACY_SHAPE)) {
  if (!d.shape[target]) {
    throw new Error(`scripts/build-tokens.ts: shape alias "${alias}" points at unknown step "${target}"`);
  }
}
for (const [alias, target] of Object.entries(LEGACY_SPACE)) {
  if (!d.spacing[target]) {
    throw new Error(`scripts/build-tokens.ts: spacing alias "${alias}" points at unknown step "${target}"`);
  }
}

const BANNER = (file: string) => `/*
 * ${file}
 *
 * GENERATED by scripts/build-tokens.ts from design.md in the coaching repo.
 * Do not hand-edit. Edit the frontmatter there, run \`npm run tokens\`, commit
 * both. Source: ${d.source}
 * Design system version: ${d.version}
 */`;

// ---------------------------------------------------------------- helpers

const typeBlock = (name: string, t: TypeRole, indent = "  ") => {
  const lines = [
    `${indent}--text-${name}: ${t.fontSize};`,
    `${indent}--text-${name}--line-height: ${t.lineHeight};`,
    `${indent}--text-${name}--font-weight: ${t.fontWeight};`,
  ];
  if (t.letterSpacing && t.letterSpacing !== "0") {
    lines.push(`${indent}--text-${name}--letter-spacing: ${t.letterSpacing};`);
  }
  return lines.join("\n");
};

const colourVars = (
  table: Record<string, string>,
  indent: string,
  withAliases = true,
) => {
  const roles = Object.entries(table).map(
    ([k, v]) => `${indent}--color-${k}: ${v.toLowerCase()};`,
  );
  if (!withAliases) return roles.join("\n");
  const aliases = aliasEntries.map(
    ([alias, target]) =>
      `${indent}--color-${alias}: ${(table[target] ?? role(target)).toLowerCase()};`,
  );
  return [...roles, "", ...aliases].join("\n");
};

/** The contrast blocks move the boundaries; every alias onto a moved role moves with them. */
const contrastVars = (table: Record<string, string>, indent: string) => {
  const roles = Object.entries(table).map(
    ([k, v]) => `${indent}--color-${k}: ${v.toLowerCase()};`,
  );
  const aliases = aliasEntries
    .filter(([, target]) => target in table)
    .map(([alias, target]) => `${indent}--color-${alias}: ${table[target].toLowerCase()};`);
  const bare = Object.entries(BARE)
    .filter(([, target]) => target in table)
    .map(([name, target]) => `${indent}--${name}: ${table[target].toLowerCase()};`);
  return [...roles, ...aliases, ...bare].join("\n");
};

// ---------------------------------------------------------------- CSS

function css(): string {
  const type = [
    ...Object.entries(d.typography).map(([name, t]) => typeBlock(name, t)),
    "",
    ...typeAliases.map(([alias, target]) => typeBlock(alias, d.typography[target])),
  ].join("\n");

  const breakpoints = Object.entries(d.breakpoints)
    .filter(([k]) => k !== "compact")
    .map(([k, v]) => `  --breakpoint-${k}: ${v};`)
    .join("\n");

  const radius = [
    ...Object.entries(d.shape).map(([k, v]) => `  --radius-${k}: ${v};`),
    ...shapeAliases.map(([alias, target]) => `  --radius-${alias}: ${d.shape[target]};`),
  ].join("\n");

  const shadow = Object.entries(d.elevation)
    .map(([k, v]) => `  --shadow-${k}: ${v};`)
    .join("\n");

  const motion = Object.entries(d.motion)
    .map(([k, v]) =>
      k.startsWith("duration-") ? `  --animate-${k}: ${v};` : `  --ease-${k}: ${v};`,
    )
    .join("\n");

  const state = Object.entries(d["state-layers"])
    .map(([k, v]) => `  --state-${k}: ${v};`)
    .join("\n");

  const bare = (scheme: "light" | "dark", indent: string) =>
    Object.entries(BARE)
      .map(([name, target]) => `${indent}--${name}: ${role(target, scheme)};`)
      .join("\n");

  return `${BANNER(CSS_OUT)}

@theme {
  /* Colour. The roles first, then the aliases retired screens still name; both
     are real values, so an un-rebuilt screen renders in this system's colours. */
${colourVars(d.colors, "  ")}

  /* Type scale. Archivo 900 carries \`display-*\`, Inter 600 carries
     \`headline-*\` and \`heading-*\`, Inter carries copy, and Anuphan carries all
     Thai on a much taller line box. */
${type}

  /* Window size classes, as \`medium:\`, \`expanded:\`, \`large:\` and \`xlarge:\`
     variants. \`compact\` is the base and needs no variant. */
${breakpoints}

  /* Shape. 24px (\`xl\`) is the signature: a card and a button share it. */
${radius}

  /* Elevation. \`level-0\` is correct for almost everything; a white card on a
     sage ground already separates. */
${shadow}

  /* Motion. */
${motion}

  /* State layers, applied as a translucent layer of the element's own content
     colour rather than as a separate hover colour. */
${state}
}

/*
 * Dark. The same names redefined, so every utility in the app switches without a
 * single \`dark:\` variant anywhere: a component that has to name both schemes is
 * a component that can get one of them wrong. \`color-scheme\` follows so form
 * controls, scrollbars and the browser's own chrome switch with it.
 */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
${colourVars(d["colors-dark"], "    ")}
  }
}

/*
 * High contrast. The boundaries are promoted and the accents are left alone:
 * they already clear AA, and pushing them further would change the brand for a
 * setting that asked for legibility.
 */
@media (prefers-contrast: more) {
  :root {
${contrastVars(d["colors-contrast"], "    ")}
  }
}

@media (prefers-contrast: more) and (prefers-color-scheme: dark) {
  :root {
${contrastVars(d["colors-contrast-dark"], "    ")}
  }
}

/* Light is the base, so \`color-scheme\` is declared here and overridden above. */
:root { color-scheme: light }

/* Names that code outside the design system owns. \`build-report-book.ts\` reads
   them out of a rendered stylesheet and \`radar.ts\` draws through them, so
   renaming one breaks something with no error. Bare names, outside \`@theme\`,
   because neither consumer knows about Tailwind's \`--color-\` namespace. */
:root {
${bare("light", "  ")}
}

@media (prefers-color-scheme: dark) {
  :root {
${bare("dark", "    ")}
  }
}
`;
}

// ---------------------------------------------------------------- TS

function ts(): string {
  const vars = [
    ...Object.entries(BARE).map(([name, target]) => `    --${name}: ${role(target)};`),
    "",
    ...colourVars(d.colors, "    ").split("\n"),
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
 * **No dark block here, deliberately.** This string is for HTML generated
 * outside Next: a candidate's report, the report book, the two-views demo.
 * Those are documents a coach opens, prints and sends on, and a report that
 * renders dark because the reader's laptop is in dark mode is a report that
 * prints wrong and reads as broken when it lands in an inbox. Documents are
 * light.
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

export const BRAND_FONT_STACKS = \`  --font-display: Archivo, Anuphan, system-ui, sans-serif;
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
  const colours = [
    ...Object.keys(d.colors).map((r) => `    --${r}: ${role(r)};`),
    ...aliasEntries.map(([alias, target]) => `    --${alias}: ${role(target)};`),
  ].join("\n");
  const shape = [
    ...Object.entries(d.shape).map(([k, v]) => `    --radius-${k}: ${v};`),
    ...shapeAliases.map(([alias, target]) => `    --radius-${alias}: ${d.shape[target]};`),
  ].join("\n");
  const elevation = Object.entries(d.elevation)
    .map(([k, v]) => `    --elevation-${k}: ${v};`)
    .join("\n");
  const spacing = [
    ...Object.entries(d.spacing).map(([k, v]) => `    --space-${k}: ${v};`),
    ...spaceAliases.map(([alias, target]) => `    --${alias}: ${d.spacing[target]};`),
  ].join("\n");

  return `/* ===========================================
   PUNPROFILE — GENERATED DECK TOKENS

   GENERATED by scripts/build-tokens.ts in the app repo, from
   \`design.md\` in punprofile-context/ctxt-brand/. Do not hand-edit.
   Run \`npm run tokens\` in punprofile-profile-app and commit both.

   The --deck-* scale below is this file's one deck-specific addition:
   design.md's sizes are web pixels, and a fixed 1920x1080 stage needs
   stage-readable type. It is not derived and is kept verbatim.

   Design system version: ${d.version}
   =========================================== */
:root {
    /* --- Colour roles, from design.md > colors, then > aliases --- */
${colours}

    /* --- Typography families, from design.md > typography --- */
    --font-display: 'Archivo', system-ui, sans-serif;
    --font-body: 'Inter', system-ui, sans-serif;
    --font-thai: 'Anuphan', sans-serif;

    /* --- Deck-specific type scale. Not derived; see the note above. --- */
    --deck-display: 140px;   /* cover hero, Archivo 900 */
    --deck-h1: 88px;         /* section headline, Archivo 900 */
    --deck-h2: 56px;         /* primary slide headline, Inter 600, -3% */
    --deck-h3: 36px;         /* sub-headline / panel title, Inter 600 */
    --deck-lede: 28px;       /* supporting paragraph, Inter 400 */
    --deck-body: 22px;       /* standard copy, Inter 400 */
    --deck-caption: 18px;    /* caption, Inter 400 */
    --deck-label: 16px;      /* eyebrow, Inter 600, tracked uppercase */
    --deck-stat: 72px;       /* stat-callout numeral, Archivo 900 */

    /* --- Spacing, from design.md > spacing --- */
${spacing}

    /* --- Deck-specific companion spacing, exact matches to the core scale --- */
    --deck-pad-edge: var(--space-5xl);
    --deck-gap-region: var(--space-4xl);
    --deck-gap-card: var(--space-2xl);

    /* --- Shape, from design.md > shape --- */
${shape}

    /* --- Elevation, from design.md > elevation --- */
${elevation}

    /* --- Motion, from design.md > motion --- */
${Object.entries(d.motion)
  .map(([k, v]) => (k.startsWith("duration-") ? `    --${k}: ${v};` : `    --ease-${k}: ${v};`))
  .join("\n")}
}
`;
}

// ---------------------------------------------------------------- write

writeFileSync(CSS_OUT, css());
writeFileSync(TS_OUT, ts());
writeFileSync(DECK_OUT, deck());

/*
 * The deck template carries an inline copy of the palette, because a standalone
 * HTML template needs self-contained CSS. The block stays inline and is written
 * here between markers instead of being hand-kept.
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
  const generated = deck();
  const body = generated
    .slice(generated.indexOf(":root {") + ":root {".length)
    .replace(/\}\s*$/, "")
    .trimEnd();
  const header =
    `${START}\n       Generated by scripts/build-tokens.ts in the app repo from\n` +
    `       design.md. Do not hand-edit between these markers; run\n` +
    `       \`npm run tokens\`. */\n`;
  writeFileSync(DECK_TEMPLATE, tpl.slice(0, a) + header + body + "\n    " + tpl.slice(b));
}

console.log(
  `tokens <- design.md  (${Object.keys(d.colors).length} roles + ` +
    `${Object.keys(d.aliases).length} aliases + ${Object.keys(BARE).length} bare, ` +
    `${Object.keys(d.typography).length} type roles + ${Object.keys(LEGACY_TYPE).length} aliased)\n` +
    `  ${CSS_OUT}\n  ${TS_OUT}\n  ${DECK_OUT}`,
);
