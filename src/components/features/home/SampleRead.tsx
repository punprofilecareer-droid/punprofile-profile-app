"use client";

/**
 * A sample first read, on the home page. Added 24/08/2026, Paul's call.
 *
 * **The reference product does this and it is the best idea on its page**: it
 * shows a real scored output, low on purpose, under the heading "you can't fix
 * what nobody will tell you". A tool willing to tell you something uncomfortable
 * is more credible than one that promises an outcome, and this product's whole
 * argument is that the problem is legibility rather than capability.
 *
 * ---------------------------------------------------------------------------
 * THE NUMBERS ARE INVENTED AND THE PAGE SAYS SO, TWICE
 * ---------------------------------------------------------------------------
 *
 * `SAMPLE_LABEL` renders as a chip above the card and `SAMPLE_NOTE` under it.
 * That is not belt and braces for its own sake. This is the ONLY fabricated
 * thing on the site: the Social Proof pillar is empty, there are no placed
 * clients, and `RESULTS` in `home.ts` is deliberately an empty array for
 * exactly that reason.
 *
 * It is publishable because it illustrates a FORMAT rather than asserting a
 * RESULT, which is the same test `/pricing`'s calculator disclaimer had to pass.
 * If this ever grows a name, a job title or an outcome, it stops passing that
 * test and becomes the fabricated testimonial the results section refuses to be.
 *
 * **The profile is uneven and one axis is unmeasured on purpose.** A sample
 * where everything scores well teaches a reader nothing about the instrument,
 * and the not-measured state is the part of this product most worth showing:
 * `teaser.score.none` says the honest thing rather than printing a zero, and a
 * reader who sees that on the landing page knows what kind of tool this is
 * before they start.
 *
 * Labels come from the `dimension.*` keys in `copy.ts`, never restated here, so
 * the sample cannot drift from the real chart.
 */

import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import { SAMPLE_AXES, SAMPLE_LABEL, SAMPLE_NOTE } from "@/lib/content/home";
import { DESTINATIONS } from "@/lib/content/cta";

/** The scale the first read uses. One place, so the bar and the number agree. */
const MAX = 5;

export default function SampleRead() {
  const { t, pick, path } = useCopy();

  return (
    <div>
      <p className="text-label-large uppercase tracking-wide text-on-surface-variant">
        {pick(SAMPLE_LABEL)}
      </p>

      <div className="card-outlined mt-3 rounded-large px-6 py-7">
        <h3 className="text-title-large">{t("teaser.chart.heading")}</h3>

        <dl className="mt-6 flex flex-col gap-5">
          {SAMPLE_AXES.map((axis) => {
            const measured = axis.score !== null;
            return (
              <div key={axis.label}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <dt className="text-body-large text-on-surface">{t(axis.label)}</dt>
                  {/* `teaser.score.none` rather than a dash or a zero. A dash
                      reads as a broken field and a zero is a claim; this says
                      the honest thing, which is that it was not measured. */}
                  <dd
                    className={`text-body-medium ${
                      measured ? "text-on-surface-variant" : "text-on-surface-variant italic"
                    }`}
                  >
                    {measured
                      ? t("teaser.score.value").replace("{score}", axis.score!.toFixed(1))
                      : t("teaser.score.none")}
                  </dd>
                </div>
                {/* The track is always drawn, so an unmeasured axis reads as a
                    gap in the picture rather than as a missing row. */}
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
                  role="presentation"
                >
                  {measured && (
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(axis.score! / MAX) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      <p className="mt-3 text-body-medium text-on-surface-variant">{pick(SAMPLE_NOTE)}</p>

      {/* A text link, not a button. `design.md` allows one filled action per
          view and the hero already spent it on this same destination. */}
      <Link
        href={path(DESTINATIONS.assess.href)}
        className="mt-5 inline-block text-body-large text-primary underline underline-offset-2"
      >
        {pick(DESTINATIONS.assess.label)}
      </Link>
    </div>
  );
}
