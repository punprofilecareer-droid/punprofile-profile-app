"use client";

/**
 * What the job pipeline has actually read, on the first read. 16/08/2026.
 *
 * Everything else in this section is a mirror: the candidate's own scores, or
 * the pool they just joined. This is the only figure on the screen about
 * PunProfile doing work, and it sits directly above the services card because
 * that is what it earns.
 *
 * **A snapshot, and it says its own dates.** The numbers come from
 * `market-snapshot.generated.ts`, produced by `scripts/sync-market-snapshot.ts`
 * from the pipeline's `job-log.json` in the coaching repo. Nothing refreshes it
 * automatically, so the window is printed rather than implied: a figure from six
 * weeks ago that names the six weeks is honest, and the same figure with no
 * window is a boast.
 *
 * **No country split, deliberately.** The published set is heavily one country
 * because of the boards the pipeline sources from, which is a fact about our
 * collection rather than about Europe. The reasoning is in the sync script,
 * where anyone widening the sourcing will find it.
 */

import { useCopy } from "@/components/LocaleProvider";
import { MARKET } from "@/lib/content/market-snapshot.generated";

export default function MarketProof() {
  const { t } = useCopy();

  return (
    <div className="material mt-4 rounded-lg px-5 py-5 text-left">
      <p className="text-label text-eufit-deep">{t("stats.market.label")}</p>
      <p className="mt-2 text-body-lg text-ink">
        {t("stats.market.value", { screened: MARKET.screened, published: MARKET.published })}
      </p>
      <p className="mt-2 text-caption text-neutral-500">
        {t("stats.market.foot", {
          from: MARKET.from,
          to: MARKET.to,
          employers: MARKET.employers,
        })}
      </p>
    </div>
  );
}
