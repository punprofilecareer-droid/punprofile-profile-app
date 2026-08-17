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

/**
 * One decimal, unless there is nothing after the point. 17/08/2026, Paul's read.
 *
 * `3.0/5` is a number pretending to be a measurement: the decimal claims a
 * precision the scorer did not produce, and four of them in a grid make the
 * whole panel look like a spreadsheet. `3/5` says the same thing and reads as an
 * answer.
 *
 * Rounded first and stripped second, so 3.04 becomes `3` rather than `3.0`. The
 * question is what the reader is shown, not what the float happens to be.
 */
function format(score: number): string {
  return score.toFixed(1).replace(/\.0$/, "");
}

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
                measured ? "bg-tertiary" : "border border-outline"
              }`}
            />
            <div className="min-w-0">
              <p className={`text-body-medium ${measured ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                {t(d.copyKey)}
              </p>
              {measured ? (
                <p className="mt-0.5 text-body-large font-semibold tabular-nums text-on-surface">
                  {t("teaser.score.value", { score: format(score) })}
                </p>
              ) : (
                <p className="mt-0.5 text-body-medium italic text-on-surface-variant">
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
