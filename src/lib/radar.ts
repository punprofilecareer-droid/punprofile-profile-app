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
  /**
   * Path data in a `0 0 24 24` box, drawn in a ring at the end of this axis.
   *
   * Added 17/08/2026, on Paul's read: the four-axis chart's labels were too small
   * to read and an icon carries the axis faster than a Thai noun phrase does.
   * Stroked, never filled, and it inherits `currentColor` so it dims with its
   * label when the axis is unscored. No colour enters this file, which is the
   * rule `AGENTS.md` states about it.
   *
   * **Optional per axis rather than required**, because the eleven-axis
   * competency charts in the coach report would be a wall of eleven glyphs. Four
   * axes get icons; eleven do not.
   */
  icon?: string;
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
  /**
   * Wrap each axis label onto at most two lines, breaking at the space nearest
   * the middle. Default off.
   *
   * Added 17/08/2026 with the icons, and it is what buys the label its size back.
   * A Thai axis name like `ความสอดคล้องกับตลาดยุโรป` on one line forced the
   * viewBox wide enough that the drawn radar shrank to fit around it; over two
   * lines it takes half the width and the plot keeps its radius.
   *
   * Two lines and not three: at three the labels on the left and right start
   * colliding with the ones above and below them.
   */
  wrapLabels?: boolean;
  /**
   * Print each axis's number beside its label. Default true.
   *
   * Off where something else on the screen already carries the four numbers.
   * The first read's legend does, from 16/08/2026, and printing them twice cost
   * more than the repetition: label plus value is wide enough that the longest
   * Thai axis name ran off the edge of the card it sits in.
   *
   * The `<desc>` is unaffected either way, so a screen reader still gets every
   * value from the chart itself whatever this is set to.
   */
  values?: boolean;
  /**
   * How much wider than tall the viewBox is. Default `WIDTH_RATIO`.
   *
   * The side labels sit outside the plot, so this is the only control over
   * whether they fit. Raised for the teaser on 16/08/2026, where the Thai axis
   * names are twice the length of the English ones and the longest ran off the
   * card. A wider box shrinks the drawn radar, which is the trade: the shape
   * loses a little size, the labels stop being cut off.
   */
  widthRatio?: number;
}

/**
 * The viewBox is wider than it is tall, and the plot radius is a fraction of the
 * height, so the left and right axis labels have room to sit inside the box.
 * Without this the labels render outside the viewBox and — because the SVG needs
 * `overflow: visible` for them — spill across whatever sits beside the chart.
 */
const WIDTH_RATIO = 1.6;
const RADIUS_RATIO = 0.35;
/** One line of `viz-axis-label` at 13px, for the space calculation below. */
const LINE_H = 16;

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
  const W = Math.round(size * (opts.widthRatio ?? WIDTH_RATIO));
  const cx = W / 2;
  const cy = size / 2 - 4;
  const maxLabel = opts.maxLabel ?? 24;
  const showValues = opts.values ?? true;
  const wrap = opts.wrapLabels ?? false;
  const hasIcons = axes.some((a) => a.icon);
  /** Where the icon ring sits, and how far past it the label starts. */
  const ICON = { gap: 20, r: 15, scale: 0.62 };
  /**
   * Past the FAR edge of the ring, not past its centre.
   *
   * Corrected 17/08/2026 after Paul screenshotted the top label sitting inside
   * its own icon. The ring spans `gap` to `gap + 2r` from the rim, so a label
   * placed at `gap + r + 13` is 2px short of the ring's centre. It has to clear
   * `gap + 2r` and then some.
   */
  const labelGap = hasIcons ? ICON.gap + ICON.r * 2 + 10 : 18;
  /*
   * The plot radius, capped so the icon ring and two lines of label fit inside
   * the viewBox rather than outside it.
   *
   * Added 17/08/2026 after Paul screenshotted the top label cut off by the top of
   * the box. `RADIUS_RATIO` alone put the rim at 0.35 of the height, which leaves
   * 0.15 for everything outside it: fine for an 18px label gap, not for a 15px
   * ring sitting 20px out with two lines of text past it.
   *
   * The cap is derived rather than tuned, so raising `size` gives the shape its
   * radius back instead of needing a new number here.
   */
  const R = Math.min(size * RADIUS_RATIO, size / 2 - (labelGap + LINE_H * 2));
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

  /**
   * One label as up to two `<tspan>` lines, broken at the space nearest the
   * middle so the two halves are close to even.
   *
   * Thai is written without spaces between words, so a Thai label often has one
   * space or none and comes back as a single line. That is correct rather than a
   * failure: breaking Thai at an arbitrary character would split a cluster of a
   * base character and its vowels, which is the same reason the footer does not
   * letter-space Thai.
   */
  const lines = (text: string): string[] => {
    if (!wrap || text.length < 12) return [text];
    const mid = text.length / 2;

    // A space is always the best break, and Latin labels have them.
    const spaces: number[] = [];
    for (let k = 1; k < text.length - 1; k++) if (text[k] === " ") spaces.push(k);
    if (spaces.length) {
      const at = spaces.reduce((b, k) => (Math.abs(k - mid) < Math.abs(b - mid) ? k : b), spaces[0]);
      return [text.slice(0, at), text.slice(at + 1)];
    }

    /*
     * **Thai is written without spaces, so the space rule found nothing and the
     * labels stayed one line.** That shipped on 17/08/2026 and Paul screenshotted
     * it: the labels were the same length as before, pushed 30px further out by
     * the new icons, and clipped by the viewBox on three sides.
     *
     * Thai cannot be broken anywhere. Two constraints, and both are about not
     * splitting a cluster:
     *
     * - **Never before a combining mark.** Upper and lower vowels and tone marks
     *   (U+0E31, U+0E34-U+0E3A, U+0E47-U+0E4E) render on the consonant before
     *   them. Orphaning one puts a floating accent at the start of line two.
     * - **Never after a leading vowel.** เ แ โ ใ ไ (U+0E40-U+0E44) are written
     *   before the consonant they are pronounced after, so the pair is one unit.
     *
     * This is not a line-breaking algorithm and does not pretend to be: proper
     * Thai wrapping needs a dictionary, which is why browsers ship one and an SVG
     * `<text>` cannot use it. It picks the safest character nearest the middle,
     * which puts the break inside a word about as often as not. That is visible
     * and acceptable; a clipped label is neither.
     */
    // **Thai text only.** Without this guard "Employability", which is one word
    // with no space, fell through to the character rule and rendered as
    // "Employ / ability". A Latin word that does not fit stays on one line; a
    // mid-word break with no hyphen is worse than a long label.
    if (!/[\u0E00-\u0E7F]/.test(text)) return [text];

    /*
     * Prefer a break immediately before a common Thai function word.
     *
     * Added 17/08/2026 after looking at the four real axis labels. The
     * safest-character rule below got three of them right by luck of where the
     * midpoint fell, and split the fourth as `ความพร้อมในก / ารย้ายประเทศ`,
     * cutting `การ` in half. Every one of these labels is a compound built from a
     * handful of function words, so looking for those first fixes the whole class
     * rather than that one string.
     *
     * Not a dictionary and not trying to be. It is the nine words that actually
     * start segments in this product's Thai, and it fails over to the character
     * rule when none of them lands near the middle.
     */
    const STARTS = ["การ", "ความ", "ใน", "และ", "ของ", "ที่", "กับ", "จาก", "เพื่อ"];
    const wordStarts: number[] = [];
    for (const w of STARTS) {
      let from = 1;
      for (;;) {
        const k = text.indexOf(w, from);
        if (k < 0 || k > text.length - 3) break;
        if (k >= 3) wordStarts.push(k);
        from = k + 1;
      }
    }
    if (wordStarts.length) {
      const at = wordStarts.reduce((b, k) => (Math.abs(k - mid) < Math.abs(b - mid) ? k : b), wordStarts[0]);
      return [text.slice(0, at), text.slice(at)];
    }

    const isMark = (c: string) => /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(c);
    const isLeadVowel = (c: string) => /[\u0E40-\u0E44]/.test(c);
    const safe: number[] = [];
    for (let k = 4; k < text.length - 3; k++) {
      if (isMark(text[k]) || isLeadVowel(text[k - 1])) continue;
      safe.push(k);
    }
    if (!safe.length) return [text];
    const at = safe.reduce((b, k) => (Math.abs(k - mid) < Math.abs(b - mid) ? k : b), safe[0]);
    return [text.slice(0, at), text.slice(at)];
  };

  // Markers and labels.
  for (let i = 0; i < n; i++) {
    const a = axes[i];
    const outer = polar(cx, cy, R + labelGap, i, n);
    const anchor = Math.abs(outer.x - cx) < 6 ? "middle" : outer.x > cx ? "start" : "end";
    const labelText = a.label.length > maxLabel ? a.label.slice(0, maxLabel - 1) + "…" : a.label;
    const rows = lines(labelText);
    // Two lines are centred on the anchor point rather than hanging below it, so
    // the label's optical centre still sits on the axis.
    const dy0 = rows.length > 1 ? -0.35 : 0;

    if (a.icon) {
      const c = polar(cx, cy, R + ICON.gap + ICON.r, i, n);
      const off = -12 * ICON.scale;
      parts.push(
        `<g class="viz-axis-icon${scored[i] ? "" : " viz-axis-unscored"}">` +
          `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${ICON.r}" fill="var(--viz-surface)" stroke="currentColor" stroke-width="1.25" stroke-opacity="0.45" />` +
          `<g transform="translate(${(c.x + off).toFixed(1)} ${(c.y + off).toFixed(1)}) scale(${ICON.scale})" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${a.icon}</g>` +
          `</g>`,
      );
    }

    const labelTspans = rows
      .map((row, r) => `<tspan x="${outer.x.toFixed(1)}" dy="${r === 0 ? dy0 : 1.15}em">${esc(row)}</tspan>`)
      .join("");

    if (scored[i]) {
      const p = polar(cx, cy, (R * (a.value as number)) / max, i, n);
      // 2px surface ring keeps the dot legible where it sits on the stroke.
      parts.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${MARK.dot / 2}" fill="var(--viz-series-1)" stroke="var(--viz-surface)" stroke-width="2" />`);
      parts.push(
        `<text x="${outer.x.toFixed(1)}" y="${outer.y.toFixed(1)}" text-anchor="${anchor}" class="viz-axis-label">${labelTspans}${showValues ? `<tspan class="viz-axis-value" dx="4">${(a.value as number).toFixed(1)}</tspan>` : ""}</text>`,
      );
    } else {
      // Hollow marker at the rim: "we didn't measure this", not "you scored zero".
      const rim = polar(cx, cy, R, i, n);
      parts.push(`<circle cx="${rim.x.toFixed(1)}" cy="${rim.y.toFixed(1)}" r="${MARK.dot / 2}" fill="var(--viz-surface)" stroke="var(--viz-muted)" stroke-width="1.5" stroke-dasharray="2 2" />`);
      parts.push(
        `<text x="${outer.x.toFixed(1)}" y="${outer.y.toFixed(1)}" text-anchor="${anchor}" class="viz-axis-label viz-axis-unscored">${labelTspans}${showValues ? `<tspan class="viz-axis-value" dx="4">—</tspan>` : ""}</text>`,
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
