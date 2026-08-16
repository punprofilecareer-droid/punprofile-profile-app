"use client";

/**
 * The four dimensions as numbers, under the radar. 16/08/2026.
 *
 * The radar alone is a shape rather than a reading. Two axes that look an
 * eyeball apart can be 0.4 apart, an unscored axis and a low one both read as
 * "short", and a screen reader gets nothing at all out of a polygon. PRD § 7
 * Accessibility asks for the chart's data in a non-visual form and this is it,
 * doubling as the thing a candidate can quote to somebody else.
 *
 * **An unmeasured dimension is named, not hidden.** It keeps its row, loses its
 * number, and says why in words. Dropping it would leave a chart with a missing
 * arm and no explanation on the screen for it.
 */

import { useCopy } from "@/components/LocaleProvider";
import type { CopyKey } from "@/lib/content/copy";

const DIMS: { key: string; copyKey: CopyKey }[] = [
  { key: "professionalCapability", copyKey: "dimension.professionalCapability" },
  { key: "employability", copyKey: "dimension.employability" },
  { key: "mobilityReadiness", copyKey: "dimension.mobilityReadiness" },
  { key: "europeanMarketFit", copyKey: "dimension.europeanMarketFit" },
];

export default function ScoreLegend({ scores }: { scores: Record<string, number | undefined> }) {
  const { t } = useCopy();

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-5 text-left">
      {DIMS.map((d) => {
        const score = scores[d.key];
        const measured = typeof score === "number" && Number.isFinite(score);
        return (
          <li key={d.key} className="flex gap-2.5">
            {/* Filled for a scored axis, hollow for one we could not reach, which
                is the same distinction the radar's own markers draw. */}
            <span
              aria-hidden
              className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                measured ? "bg-eufit" : "border border-neutral-500"
              }`}
            />
            <div className="min-w-0">
              <p className={`text-caption ${measured ? "text-slate" : "text-neutral-500"}`}>
                {t(d.copyKey)}
              </p>
              {measured ? (
                <p className="mt-0.5 text-body-lg font-semibold tabular-nums text-ink">
                  {t("teaser.score.value", { score: score.toFixed(1) })}
                </p>
              ) : (
                <p className="mt-0.5 text-caption italic text-neutral-500">
                  {t("teaser.score.none")}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
