"use client";

import { useMemo } from "react";
import { radarSvg } from "@/lib/radar";
import type { RadarAxis } from "@/lib/radar";

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
}

const DIMS: { key: keyof SpiderChartProps["scores"]; label: string }[] = [
  { key: "professionalCapability", label: "Professional Capability" },
  { key: "employability", label: "Employability" },
  { key: "mobilityReadiness", label: "Mobility Readiness" },
  { key: "europeanMarketFit", label: "European Market Fit" },
];

export default function SpiderChart({ scores, variant = "teaser" }: SpiderChartProps) {
  const svg = useMemo(() => {
    const axes: RadarAxis[] = DIMS.map((d) => ({
      label: d.label,
      value: typeof scores[d.key] === "number" ? (scores[d.key] as number) : null,
    }));
    return radarSvg(axes, {
      idPrefix: variant,
      size: variant === "teaser" ? 300 : 420,
      maxLabel: variant === "teaser" ? 22 : 26,
    });
  }, [scores, variant]);

  return (
    <div
      className="viz-root w-full"
      // Trusted markup: generated locally by radarSvg from numeric scores,
      // with all labels escaped inside the builder.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
