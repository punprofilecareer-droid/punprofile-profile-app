"use client";

import { useMemo } from "react";
import { radarSvg } from "@/lib/radar";
import type { RadarAxis } from "@/lib/radar";
import { useCopy } from "@/components/LocaleProvider";
import type { CopyKey } from "@/lib/content/copy";

/**
 * TASK-021: React wrapper over the dependency-free SVG builder in
 * `src/lib/radar.ts`. One renderer serves the app, the offline reports and
 * future result emails; this component only adapts scores to axes and injects
 * the markup. Unscored dimensions render as hollow "not yet answered" markers,
 * never as zero, and the self-reported label is part of the surrounding
 * component, persistent per FR-007.
 */

export interface SpiderChartProps {
  scores: {
    professionalCapability?: number;
    employability?: number;
    mobilityReadiness?: number;
    europeanMarketFit?: number;
  };
  /** Teaser renders smaller with tighter labels. */
  variant?: "teaser" | "full";
  /**
   * Axis labels, overriding the candidate copy below.
   *
   * The admin screens declare themselves English and coach-facing, but the
   * chart read COPY at the viewer's locale, so the founder browsing the site in
   * Thai got a Thai-labelled chart sitting directly above the same four
   * dimensions named in English. One page, two names for each axis.
   *
   * The coach's names are `model.ts`'s, which that file already keeps for the
   * report. Passing them in rather than teaching this component about
   * audiences keeps the candidate path exactly as it was.
   */
  axisLabels?: Partial<Record<keyof SpiderChartProps["scores"], string>>;
}

// Labels come from COPY because the axis text is candidate-facing. `model.ts`
// keeps its own English for the coach report: a different audience, not a
// second source of truth for this one.
const DIMS: { key: keyof SpiderChartProps["scores"]; copyKey: CopyKey }[] = [
  { key: "professionalCapability", copyKey: "dimension.professionalCapability" },
  { key: "employability", copyKey: "dimension.employability" },
  { key: "mobilityReadiness", copyKey: "dimension.mobilityReadiness" },
  { key: "europeanMarketFit", copyKey: "dimension.europeanMarketFit" },
];

/**
 * One glyph per dimension, `0 0 24 24`, stroked and never filled.
 *
 * Added 17/08/2026 on Paul's read, from a reference that put a circled icon at
 * the end of every axis. The reason it works is not decoration: a Thai axis name
 * is a noun phrase of twenty-odd characters and the icon is recognised before the
 * phrase is read, so the chart becomes scannable at a glance rather than only
 * legible on inspection.
 *
 * Drawn here rather than in `radar.ts`, which is a geometry builder and holds no
 * content, and inline rather than as assets, because four short paths cost less
 * than four network requests and cannot 404.
 *
 * Each one is the plainest thing that reads at 19px:
 *
 * - **Professional Capability** — a toolbox. What you can do.
 * - **Employability** — a document with lines. The CV and the profile.
 * - **Mobility Readiness** — a paper plane. Leaving.
 * - **European Market Fit** — a target. Hitting what the market asks for.
 */
const ICONS: Record<string, string> = {
  professionalCapability:
    '<path d="M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M3 13h18"/>',
  employability:
    '<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h4"/><path d="M8 13h7M8 17h5"/>',
  mobilityReadiness: '<path d="M21 3 3 10l6 3 3 8 9-18Z"/><path d="M9 13l12-10"/>',
  europeanMarketFit:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
};

export default function SpiderChart({ scores, variant = "teaser", axisLabels }: SpiderChartProps) {
  const { t, locale } = useCopy();

  const svg = useMemo(() => {
    const axes: RadarAxis[] = DIMS.map((d) => ({
      label: axisLabels?.[d.key] ?? t(d.copyKey),
      value: typeof scores[d.key] === "number" ? (scores[d.key] as number) : null,
      icon: ICONS[d.key],
    }));
    return radarSvg(axes, {
      idPrefix: variant,
      // Both grew on 17/08/2026 with the icons and the bigger labels: the ring at
      // the end of every axis needs the room the plot used to have, and shrinking
      // the plot to make space would have undone the point of the change.
      // Raised again on 17/08/2026. `radar.ts` now caps the plot radius so the
      // icon ring and two lines of label fit inside the box, which means a small
      // `size` buys a small radar rather than a clipped one. These give the shape
      // back the radius it had before the icons, with the rings inside the box.
      size: variant === "teaser" ? 470 : 560,
      // No truncation on the teaser: the widened box below holds the longest
      // Thai name whole, and a name cut to "ความพร้อมในการ…" is indistinguishable
      // from the axis next to it.
      maxLabel: variant === "teaser" ? 40 : 26,
      // Two lines per label, 17/08/2026, and it is what pays for the bigger type
      // in `globals.css`. English axis names have spaces and split evenly; Thai
      // names mostly have none and come back as one line, which is correct
      // rather than a failure. See the note in `radar.ts`.
      wrapLabels: true,
      // The teaser is the only variant with a `ScoreLegend` under it, and the
      // legend carries all four numbers in full. Leaving them on the axes too
      // printed each one twice and pushed the longest Thai label off the card.
      values: variant !== "teaser",
      // Widened only when the labels actually need it. Thai axis names run to
      // twice the length of the English ones and sit outside the plot, so Thai
      // needs the room; applying the same ratio to English shrank the radar for
      // no reason, which was visible as soon as the desktop layout gave the
      // chart a card of its own. Measured off the longest label rather than off
      // the locale, so a future language gets the right box without a rule.
      /*
       * Raised again on 17/08/2026, after being lowered the same day and clipping
       * three of the four Thai labels.
       *
       * The lowering assumed two-line labels take half the width. They do, and it
       * was still wrong on two counts: the wrap did nothing for Thai until the
       * break rule in `radar.ts` was fixed, and the icons push every label 40px
       * further from the centre, which the ratio has to pay for whether or not the
       * label wrapped.
       *
       * So it is measured rather than guessed. At `size` 360 the plot radius is
       * 126, the label anchor sits 60 past it, and the longest Thai axis name over
       * two lines needs about 90 more. That is 276 of half-width against 270 at
       * ratio 1.5, which is why it was clipping by a hair on the widest label and
       * badly on the unwrapped one.
       */
      widthRatio:
        variant === "teaser"
          ? Math.max(...axes.map((a) => a.label.length)) > 16
            ? 1.95
            : 1.7
          : undefined,
    });
    // `locale` is the real dependency; `t` is rebuilt whenever it changes.
  }, [scores, variant, t, locale, axisLabels]);

  return (
    <div
      className="viz-root w-full"
      // Trusted markup: generated locally by radarSvg from numeric scores,
      // with all labels escaped inside the builder.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
