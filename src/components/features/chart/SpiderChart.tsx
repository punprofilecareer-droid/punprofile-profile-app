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

export default function SpiderChart({ scores, variant = "teaser", axisLabels }: SpiderChartProps) {
  const { t, locale } = useCopy();

  const svg = useMemo(() => {
    const axes: RadarAxis[] = DIMS.map((d) => ({
      label: axisLabels?.[d.key] ?? t(d.copyKey),
      value: typeof scores[d.key] === "number" ? (scores[d.key] as number) : null,
    }));
    return radarSvg(axes, {
      idPrefix: variant,
      size: variant === "teaser" ? 300 : 420,
      maxLabel: variant === "teaser" ? 22 : 26,
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
