/**
 * Spider/radar chart as a standalone SVG string.
 *
 * Written as a pure string builder rather than against a chart library so the
 * same function serves the offline report, a server-rendered email, and (via
 * `dangerouslySetInnerHTML` or a trivial JSX port) the app's chart component —
 * `prd.md` § 12 leaves the library choice open, and
 * this commits to nothing.
 *
 * Colour roles come from CSS custom properties, never hard-coded hex, so the
 * light/dark values swap in one place and a real design system can override
 * them without touching this file.
 *
 * One series per chart, so there is no legend — the title names it. Axes the
 * survey cannot score are drawn in muted ink with a hollow marker at the rim:
 * identity is carried by shape and label, never by colour alone.
 */

export interface RadarAxis {
  label: string;
  /** 1-5, or null for "not scored". */
  value: number | null;
  /** Rendered as a small superscript marker beside the label. */
  tag?: string;
}

export interface RadarOptions {
  /** Height of the viewBox. Width is derived — see `WIDTH_RATIO`. */
  size?: number;
  max?: number;
  /** Shown centred under the chart. */
  caption?: string;
  idPrefix: string;
  /** Axis labels longer than this are truncated. */
  maxLabel?: number;
}

/**
 * The viewBox is wider than it is tall, and the plot radius is a fraction of the
 * height, so the left and right axis labels have room to sit inside the box.
 * Without this the labels render outside the viewBox and — because the SVG needs
 * `overflow: visible` for them — spill across whatever sits beside the chart.
 */
const WIDTH_RATIO = 1.6;
const RADIUS_RATIO = 0.35;

const MARK = { line: 2, dot: 8 };

function polar(cx: number, cy: number, r: number, i: number, n: number) {
  const a = (Math.PI * 2 * i) / n - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function radarSvg(axes: RadarAxis[], opts: RadarOptions): string {
  const size = opts.size ?? 460;
  const max = opts.max ?? 5;
  const W = Math.round(size * WIDTH_RATIO);
  const cx = W / 2;
  const cy = size / 2 - 4;
  const R = size * RADIUS_RATIO;
  const maxLabel = opts.maxLabel ?? 24;
  const n = axes.length;
  if (n < 3) return `<p class="viz-empty">Needs at least three axes to draw.</p>`;

  const parts: string[] = [];

  // Recessive grid: hairline rings at each integer step, plus one spoke per axis.
  for (let ring = 1; ring <= max; ring++) {
    const r = (R * ring) / max;
    const pts = Array.from({ length: n }, (_, i) => {
      const p = polar(cx, cy, r, i, n);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");
    parts.push(
      `<polygon points="${pts}" fill="none" stroke="var(--viz-grid)" stroke-width="1" ${ring === max ? 'stroke-opacity="0.9"' : 'stroke-opacity="0.55"'} />`,
    );
  }
  for (let i = 0; i < n; i++) {
    const p = polar(cx, cy, R, i, n);
    parts.push(`<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="var(--viz-grid)" stroke-width="1" stroke-opacity="0.55" />`);
  }

  // Scale ticks on the upward spoke only — one set of numbers, not n sets.
  for (let ring = 1; ring <= max; ring++) {
    const r = (R * ring) / max;
    parts.push(
      `<text x="${cx + 4}" y="${(cy - r + 3).toFixed(1)}" class="viz-tick">${ring}</text>`,
    );
  }

  // The scored polygon. Unscored axes collapse to the centre, which would drag
  // the shape inward and read as a zero — so the path is drawn only across
  // consecutive scored axes, and unscored ones break it.
  const scored = axes.map((a) => a.value !== null && Number.isFinite(a.value as number));
  const segs: string[][] = [];
  let cur: string[] = [];
  for (let i = 0; i < n; i++) {
    if (scored[i]) {
      const p = polar(cx, cy, (R * (axes[i].value as number)) / max, i, n);
      cur.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    } else if (cur.length) {
      segs.push(cur);
      cur = [];
    }
  }
  if (cur.length) segs.push(cur);

  const allScored = scored.every(Boolean);
  if (allScored && segs.length === 1) {
    parts.push(`<polygon points="${segs[0].join(" ")}" fill="var(--viz-series-1)" fill-opacity="0.16" stroke="var(--viz-series-1)" stroke-width="${MARK.line}" stroke-linejoin="round" />`);
  } else {
    // Wrap the last segment into the first when both ends are scored, so a full
    // ring that merely started mid-array still closes.
    if (segs.length > 1 && scored[0] && scored[n - 1]) {
      const last = segs.pop() as string[];
      segs[0] = [...last, ...segs[0]];
    }
    for (const seg of segs) {
      if (seg.length === 1) continue; // a lone point needs no line; its dot carries it
      parts.push(`<polyline points="${seg.join(" ")}" fill="none" stroke="var(--viz-series-1)" stroke-width="${MARK.line}" stroke-linejoin="round" stroke-linecap="round" />`);
    }
  }

  // Markers and labels.
  for (let i = 0; i < n; i++) {
    const a = axes[i];
    const outer = polar(cx, cy, R + 18, i, n);
    const anchor = Math.abs(outer.x - cx) < 6 ? "middle" : outer.x > cx ? "start" : "end";
    const labelText = a.label.length > maxLabel ? a.label.slice(0, maxLabel - 1) + "…" : a.label;

    if (scored[i]) {
      const p = polar(cx, cy, (R * (a.value as number)) / max, i, n);
      // 2px surface ring keeps the dot legible where it sits on the stroke.
      parts.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${MARK.dot / 2}" fill="var(--viz-series-1)" stroke="var(--viz-surface)" stroke-width="2" />`);
      parts.push(
        `<text x="${outer.x.toFixed(1)}" y="${outer.y.toFixed(1)}" text-anchor="${anchor}" class="viz-axis-label"><tspan>${esc(labelText)}</tspan><tspan class="viz-axis-value" dx="4">${(a.value as number).toFixed(1)}</tspan></text>`,
      );
    } else {
      // Hollow marker at the rim: "we didn't measure this", not "you scored zero".
      const rim = polar(cx, cy, R, i, n);
      parts.push(`<circle cx="${rim.x.toFixed(1)}" cy="${rim.y.toFixed(1)}" r="${MARK.dot / 2}" fill="var(--viz-surface)" stroke="var(--viz-muted)" stroke-width="1.5" stroke-dasharray="2 2" />`);
      parts.push(
        `<text x="${outer.x.toFixed(1)}" y="${outer.y.toFixed(1)}" text-anchor="${anchor}" class="viz-axis-label viz-axis-unscored"><tspan>${esc(labelText)}</tspan><tspan class="viz-axis-value" dx="4">—</tspan></text>`,
      );
    }
  }

  const caption = opts.caption
    ? `<text x="${cx}" y="${size - 6}" text-anchor="middle" class="viz-caption">${esc(opts.caption)}</text>`
    : "";

  const desc = axes
    .map((a) => `${a.label}: ${a.value === null ? "not scored" : a.value.toFixed(1) + " of " + max}`)
    .join("; ");

  return `<svg viewBox="0 0 ${W} ${size}" width="100%" role="img" aria-labelledby="${opts.idPrefix}-t ${opts.idPrefix}-d" class="viz-radar">
  <title id="${opts.idPrefix}-t">${esc(opts.caption ?? "Readiness chart")}</title>
  <desc id="${opts.idPrefix}-d">${esc(desc)}</desc>
  ${parts.join("\n  ")}
  ${caption}
</svg>`;
}
