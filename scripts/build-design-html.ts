/**
 * Renders the design system as a live style guide.
 *
 *   npx tsx scripts/build-design-html.ts
 *
 * `design.md` in `../punprofile-career-coaching/punprofile-context/ctxt-brand/`
 * is the source and the only place a token is edited. Its YAML frontmatter is
 * read here and emitted as `design.html` beside it: one self-contained page
 * that renders every token and component live, for a human to look at.
 *
 * Same contract as `sync-termbase.ts`. The generated file is never hand-edited.
 * Edit the frontmatter, re-run this, commit both.
 *
 * The colour values themselves come from `pp_material_colors.json`, a Material
 * Theme Builder export, and reach `design.md` from there. This script does not
 * invent a value; if a token is missing from the frontmatter it is missing from
 * the page, which is the intended failure.
 *
 * Contrast ratios on the page are computed here rather than copied, so the
 * guide cannot claim a number the palette does not hold.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { load } from "js-yaml";

const SOURCE =
  "../punprofile-career-coaching/punprofile-context/ctxt-brand/design.md";
const OUT =
  "../punprofile-career-coaching/punprofile-context/ctxt-brand/design.html";

interface TypeRole {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
}

interface Design {
  version: string;
  name: string;
  description: string;
  scheme: string;
  source: string;
  colors: Record<string, string>;
  "state-layers": Record<string, number>;
  typography: Record<string, TypeRole>;
  shape: Record<string, string>;
  spacing: Record<string, string>;
  elevation: Record<string, string>;
  motion: Record<string, string>;
  components: Record<string, Record<string, string>>;
}

// ---------------------------------------------------------------- contrast

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG verdict at body-text size, plus the 3:1 bar that non-text UI holds to. */
function verdict(ratio: number): string {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fail";
}

// ---------------------------------------------------------------- helpers

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The families in the frontmatter are bare names. Generated HTML cannot use
 * `next/font`, so each one needs a fallback for a page opened offline.
 */
function stack(family: string): string {
  const serif = family === "Fraunces" || family === "Noto Serif Thai";
  return `"${family}", ${serif ? "Georgia, serif" : 'system-ui, -apple-system, sans-serif'}`;
}

function typeCss(t: TypeRole): string {
  return [
    `font-family:${stack(t.fontFamily)}`,
    `font-size:${t.fontSize}`,
    `font-weight:${t.fontWeight}`,
    `line-height:${t.lineHeight}`,
    t.letterSpacing ? `letter-spacing:${t.letterSpacing}` : "",
  ]
    .filter(Boolean)
    .join(";");
}

/** `{colors.action}` and friends, as used by the component specs. */
function resolve(value: string, d: Design): string {
  const m = /^\{(\w[\w-]*)\.([\w-]+)\}$/.exec(value);
  if (!m) return value;
  const [, group, key] = m;
  const table = (d as unknown as Record<string, Record<string, unknown>>)[group];
  const hit = table?.[key];
  if (hit === undefined) return value;
  return typeof hit === "object" ? typeCss(hit as TypeRole) : String(hit);
}

// ---------------------------------------------------------------- sections

/**
 * Colour families, in the order the system reasons about them rather than
 * alphabetically. Each entry names the token's real partner, so the page can
 * measure rather than assert.
 */
interface Swatch {
  /** The token being shown. */
  token: string;
  /** The token that carries text on it, when it is a fill. */
  on?: string;
  /** The token it is drawn *on*, when it is itself a foreground. */
  against?: string;
}

const FAMILIES: Array<{ title: string; note: string; pairs: Swatch[] }> = [
  {
    title: "Primary — olive",
    note: "The colour PunProfile is known by. Full-bleed sections, brand chrome, active and selected states.",
    pairs: [
      { token: "primary", on: "on-primary" },
      { token: "primary-container", on: "on-primary-container" },
      { token: "primary-fixed", on: "on-primary-fixed" },
      { token: "primary-fixed-dim", on: "on-primary-fixed-variant" },
    ],
  },
  {
    title: "Secondary — teal",
    note: "The old brand colour, kept and demoted. Filter chips, selection states, navigation active indicators.",
    pairs: [
      { token: "secondary", on: "on-secondary" },
      { token: "secondary-container", on: "on-secondary-container" },
      { token: "secondary-fixed", on: "on-secondary-fixed" },
      { token: "secondary-fixed-dim", on: "on-secondary-fixed-variant" },
    ],
  },
  {
    title: "Tertiary — blue",
    note: "EU Fit Check's product identity. PunProfile chrome is olive; the assessment inside it is blue.",
    pairs: [
      { token: "tertiary", on: "on-tertiary" },
      { token: "tertiary-container", on: "on-tertiary-container" },
      { token: "tertiary-fixed", on: "on-tertiary-fixed" },
      { token: "tertiary-fixed-dim", on: "on-tertiary-fixed-variant" },
    ],
  },
  {
    title: "Action — rust",
    note: "An extended colour, deliberately not an M3 role. The single primary action per view, and nothing else.",
    pairs: [
      { token: "action", on: "on-action" },
      { token: "action-container", on: "on-action-container" },
    ],
  },
  {
    title: "Brand orange",
    note: "Outside the role system. Logo mark, mascot, large illustration grounds. Ink text, never white, never small. On surface it measures under 3, so it is never an icon, a border or a rule.",
    pairs: [
      { token: "brand-orange", on: "on-brand-orange" },
      { token: "brand-orange", against: "surface" },
    ],
  },
  {
    title: "Error",
    note: "Deliberately distinct from action, so a problem never looks like a button.",
    pairs: [
      { token: "error", on: "on-error" },
      { token: "error-container", on: "on-error-container" },
    ],
  },
  {
    title: "Surfaces",
    note: "Five container tiers build nesting depth without a colour change. Inverse surface is for elements that contrast against the surrounding UI, such as snackbars.",
    pairs: [
      { token: "background", on: "on-background" },
      { token: "surface", on: "on-surface" },
      { token: "surface-variant", on: "on-surface-variant" },
      { token: "surface-container-lowest", on: "on-surface" },
      { token: "surface-container-low", on: "on-surface" },
      { token: "surface-container", on: "on-surface" },
      { token: "surface-container-high", on: "on-surface" },
      { token: "surface-container-highest", on: "on-surface" },
      { token: "surface-dim", on: "on-surface" },
      { token: "surface-bright", on: "on-surface" },
      { token: "inverse-surface", on: "inverse-on-surface" },
      { token: "inverse-primary", against: "inverse-surface" },
    ],
  },
  {
    title: "Outlines",
    note: "Boundaries that must be perceived, versus decoration. Not interchangeable: outline clears the 3:1 bar for non-text UI, outline-variant does not and is for dividers only.",
    pairs: [
      { token: "outline", against: "surface" },
      { token: "outline-variant", against: "surface" },
      { token: "shadow", against: "surface" },
      { token: "scrim", against: "surface" },
    ],
  },
];

function colourSection(d: Design): string {
  const rows = FAMILIES.map((f) => {
    const swatches = f.pairs
      .filter((p) => d.colors[p.token] !== undefined)
      .map((p) => {
        // A token is either a fill carrying `on` text, or a foreground drawn
        // `against` a ground. Both are measured; neither is asserted.
        const fill = p.against ? d.colors[p.against] : d.colors[p.token];
        const ink = p.against ? d.colors[p.token] : p.on ? d.colors[p.on] : null;
        const measured = ink ? contrast(ink, fill) : 0;
        const label = p.against
          ? `${p.token} on ${p.against}`
          : `${p.on} on ${p.token}`;
        const bar = p.against
          ? `<div class="chip" style="background:${fill}"><span class="rule" style="background:${d.colors[p.token]}"></span></div>`
          : `<div class="chip" style="background:${fill};color:${ink ?? d.colors["on-surface"]}">Aa</div>`;
        return `<div class="sw">
        ${bar}
        <div class="meta">
          <code>${p.token}</code>
          <span class="hex">${d.colors[p.token].toUpperCase()}</span>
          <span class="ratio ${verdict(measured) === "fail" ? "bad" : ""}">${measured.toFixed(2)} &middot; ${verdict(measured)}<br><small>${esc(label)}</small></span>
        </div>
      </div>`;
      })
      .join("\n");
    return `<div class="family">
      <h3>${esc(f.title)}</h3>
      <p class="note">${esc(f.note)}</p>
      <div class="swatches">${swatches}</div>
    </div>`;
  }).join("\n");
  return `<section id="colour"><h2>Colour</h2>
  <p class="lead">Ratios are computed when this page is generated, not copied, so this page cannot claim a number the palette does not hold. Fills are measured against the text token that sits on them. Foreground tokens such as <code>outline</code> are shown as a rule on their real ground instead, because a solid block of a boundary colour tells you nothing about whether the boundary is visible.</p>
  ${rows}</section>`;
}

function typeSection(d: Design): string {
  const LATIN = "The candidate reads this before a word of copy is judged";
  const THAI = "ผู้สมัครอ่านสิ่งนี้ก่อนตัดสินใจ";
  const rows = Object.entries(d.typography)
    .map(([name, t]) => {
      const thai = name.startsWith("thai-");
      return `<tr>
      <td class="tok"><code>${name}</code><br><small>${esc(t.fontFamily)} ${t.fontWeight} &middot; ${t.fontSize} / ${t.lineHeight}</small></td>
      <td><div style="${typeCss(t)}">${esc(thai ? THAI : LATIN)}</div></td>
    </tr>`;
    })
    .join("\n");
  return `<section id="type"><h2>Typography</h2>
  <p class="lead">Fraunces carries display, headline and title. Inter carries body and label. Thai gets five roles mirroring the two functional tiers, with taller line boxes, because tone marks and vowels stack above and below the baseline.</p>
  <table class="type">${rows}</table></section>`;
}

function scaleSection(d: Design): string {
  const shape = Object.entries(d.shape)
    .map(
      ([k, v]) =>
        `<div class="scale-item"><div class="shape-demo" style="border-radius:${v}"></div><code>${k}</code><span>${v}</span></div>`,
    )
    .join("");
  const space = Object.entries(d.spacing)
    .map(
      ([k, v]) =>
        `<div class="scale-row"><code>${k}</code><div class="bar" style="width:${v}"></div><span>${v}</span></div>`,
    )
    .join("");
  const elev = Object.entries(d.elevation)
    .map(
      ([k, v]) =>
        `<div class="scale-item"><div class="elev-demo" style="box-shadow:${v === "none" ? "none" : v}"></div><code>${k}</code></div>`,
    )
    .join("");
  const state = Object.entries(d["state-layers"])
    .map(
      ([k, v]) =>
        `<div class="scale-item"><div class="state-demo"><span style="background:${d.colors["on-surface"]};opacity:${v}"></span></div><code>${k}</code><span>${Math.round(v * 100)}%</span></div>`,
    )
    .join("");
  const motion = Object.entries(d.motion)
    .map(([k, v]) => `<div class="scale-row"><code>${k}</code><span class="mono">${esc(v)}</span></div>`)
    .join("");
  return `<section id="scales"><h2>Shape, spacing, elevation, state, motion</h2>
  <h3>Shape</h3><p class="note">Buttons are <code>full</code>. The old no-pill rule was retired 16/08/2026, so colour and type now carry the whole separation from Thai Jobs in Europe.</p><div class="scale-grid">${shape}</div>
  <h3>Spacing</h3><div class="scale-list">${space}</div>
  <h3>Elevation</h3><p class="note">Level 0 is the default for almost everything. Only things that genuinely float take level 3 or above.</p><div class="scale-grid">${elev}</div>
  <h3>State layers</h3><p class="note">Interaction feedback is a translucent layer of the element's own content colour, not a separate hover colour.</p><div class="scale-grid">${state}</div>
  <h3>Motion</h3><div class="scale-list">${motion}</div></section>`;
}

function componentSection(d: Design): string {
  const items = Object.entries(d.components)
    .map(([name, spec]) => {
      const r = (k: string) => (spec[k] ? resolve(spec[k], d) : undefined);
      const bg = r("backgroundColor");
      const fg = r("textColor");
      const border = r("borderColor");
      const style = [
        bg && bg !== "transparent" ? `background:${bg}` : "background:transparent",
        fg ? `color:${fg}` : "",
        border ? `border:1px solid ${border}` : "",
        spec.shape ? `border-radius:${r("shape")}` : "",
        spec.padding ? `padding:${spec.padding}` : "",
        spec.height ? `min-height:${spec.height}` : "",
        spec.typography ? r("typography") : "",
        spec.elevation && r("elevation") !== "none" ? `box-shadow:${r("elevation")}` : "",
        spec.size ? `width:${spec.size};height:${spec.size}` : "",
      ]
        .filter(Boolean)
        .join(";");
      const rows = Object.entries(spec)
        .map(([k, v]) => `<tr><td><code>${k}</code></td><td class="mono">${esc(v)}</td></tr>`)
        .join("");
      return `<div class="component">
      <div class="preview"><div class="demo" style="${style}">${esc(name.replace(/-/g, " "))}</div></div>
      <div class="spec"><h3><code>${name}</code></h3><table>${rows}</table></div>
    </div>`;
    })
    .join("\n");
  return `<section id="components"><h2>Components</h2>
  <p class="lead">Rendered from the component specs in the frontmatter, so a preview cannot drift from what the file says. Chrome such as app bars and navigation is shown as a block, not a full layout.</p>
  ${items}</section>`;
}

// ---------------------------------------------------------------- page

function page(d: Design): string {
  const vars = Object.entries(d.colors)
    .map(([k, v]) => `    --color-${k}: ${v};`)
    .join("\n");
  const fonts = Array.from(
    new Set(Object.values(d.typography).map((t) => t.fontFamily)),
  );
  const families = fonts
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700;800;900`)
    .join("&");
  return `<!doctype html>
<html lang="en">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.name)} — design system</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${families}&display=swap">
<style>
  :root {
${vars}
  }
  * { box-sizing: border-box }
  body {
    margin: 0; padding: 48px 32px 96px;
    background: var(--color-background); color: var(--color-on-surface);
    font-family: ${stack("Inter")};
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1080px; margin: 0 auto }
  h1 { font-family: ${stack("Fraunces")}; font-size: 45px; font-weight: 800; margin: 0 0 8px }
  h2 { font-family: ${stack("Fraunces")}; font-size: 32px; font-weight: 700; margin: 64px 0 8px;
       padding-top: 24px; border-top: 1px solid var(--color-outline-variant) }
  h3 { font-family: ${stack("Fraunces")}; font-size: 22px; font-weight: 600; margin: 32px 0 4px }
  p { margin: 0 0 16px }
  .lead, .note { color: var(--color-on-surface-variant); font-size: 14px; line-height: 20px; max-width: 68ch }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
          color: var(--color-on-surface-variant) }
  .meta-head { display: flex; gap: 24px; flex-wrap: wrap; font-size: 12px;
               color: var(--color-on-surface-variant); margin-bottom: 40px }

  .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin: 16px 0 }
  .sw { border: 1px solid var(--color-outline-variant); border-radius: 12px; overflow: hidden;
        background: var(--color-surface-container-lowest) }
  .chip { height: 72px; display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 600 }
  /* Foreground tokens (outline, inverse-primary) are shown as a rule on their
     real ground, because a solid block of a boundary colour tells you nothing
     about whether the boundary is visible. */
  .rule { display: block; width: 60%; height: 3px; border-radius: 2px }
  .meta { padding: 10px 12px; display: grid; gap: 2px }
  .hex { font-family: ui-monospace, monospace; font-size: 11px; color: var(--color-on-surface-variant) }
  .ratio { font-size: 11px; color: var(--color-on-surface-variant); margin-top: 4px }
  .ratio.bad { color: var(--color-error); font-weight: 600 }
  .ratio small { font-size: 10px; opacity: .8 }

  table.type { width: 100%; border-collapse: collapse }
  table.type td { border-top: 1px solid var(--color-outline-variant); padding: 16px 12px 16px 0; vertical-align: middle }
  table.type td.tok { width: 220px; color: var(--color-on-surface-variant) }
  table.type small { font-size: 11px }

  .scale-grid { display: flex; flex-wrap: wrap; gap: 20px; margin: 16px 0 }
  .scale-item { text-align: center; display: grid; gap: 4px; font-size: 11px;
                color: var(--color-on-surface-variant) }
  .shape-demo, .elev-demo, .state-demo { width: 72px; height: 72px; background: var(--color-primary-container) }
  .elev-demo { background: var(--color-surface-container-lowest); border-radius: 12px }
  .state-demo { position: relative; border-radius: 12px; overflow: hidden }
  .state-demo span { position: absolute; inset: 0 }
  .scale-list { display: grid; gap: 8px; margin: 16px 0 }
  .scale-row { display: flex; align-items: center; gap: 16px; font-size: 12px }
  .scale-row code { width: 180px; flex: none }
  .bar { height: 12px; background: var(--color-secondary); border-radius: 2px }

  .component { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start;
               border-top: 1px solid var(--color-outline-variant); padding: 24px 0 }
  .preview { display: flex; align-items: center; justify-content: center; min-height: 120px;
             background: var(--color-surface); border-radius: 12px; padding: 24px }
  .demo { display: inline-flex; align-items: center; justify-content: center; text-align: center }
  .spec table { border-collapse: collapse; width: 100% }
  .spec td { padding: 3px 12px 3px 0; vertical-align: top; font-size: 12px }
  .spec h3 { margin: 0 0 8px }
</style>
<body><div class="wrap">
<h1>${esc(d.name)}</h1>
<p class="lead">${esc(d.description)}</p>
<div class="meta-head">
  <span><strong>version</strong> ${esc(d.version)}</span>
  <span><strong>scheme</strong> ${esc(d.scheme)}</span>
  <span><strong>values from</strong> <code>${esc(d.source)}</code></span>
</div>
<p class="note"><strong>Generated from <code>design.md</code> by <code>scripts/build-design-html.ts</code> in the app repo. Do not hand-edit.</strong> Edit the frontmatter, re-run, commit both. The written rules, the retirements and the reasoning live in <code>design.md</code>; this page is the tokens made visible, not a substitute for reading it.</p>
${colourSection(d)}
${typeSection(d)}
${scaleSection(d)}
${componentSection(d)}
</div></body></html>
`;
}

// ---------------------------------------------------------------- main

const raw = readFileSync(SOURCE, "utf8");
const end = raw.indexOf("\n---\n");
if (!raw.startsWith("---") || end === -1) {
  throw new Error(`${SOURCE}: expected YAML frontmatter delimited by ---`);
}
const design = load(raw.slice(3, end)) as Design;

for (const key of ["colors", "typography", "shape", "components"] as const) {
  if (!design[key]) throw new Error(`${SOURCE}: frontmatter is missing "${key}"`);
}

writeFileSync(OUT, page(design));
console.log(
  `design.html <- design.md  (${Object.keys(design.colors).length} colours, ` +
    `${Object.keys(design.typography).length} type roles, ` +
    `${Object.keys(design.components).length} components)`,
);
