"use client";

/**
 * What the job pipeline has actually read, on the first read. 16/08/2026.
 *
 * Everything else in this section is a mirror: the candidate's own scores, or
 * the pool they just joined. This is the only figure on the screen about
 * PunProfile doing work, and it sits directly above the services card because
 * that is what it earns.
 *
 * **Two numbers, and a date. Rewritten 17/08/2026 on Paul's read.**
 *
 * It was a sentence with the counts inside it and a second line carrying the
 * window, the employer count and the name of the Facebook group. Four facts,
 * none of them louder than the others, and the two that matter were the two
 * buried in prose. They are now the size they deserve and the rest is gone.
 *
 * **The date stays, and it is the only part of the old footnote that survives.**
 * The numbers come from `market-snapshot.generated.ts`, produced by
 * `scripts/sync-market-snapshot.ts` from the pipeline's `job-log.json` in the
 * coaching repo, and nothing refreshes it automatically. A figure that names
 * when it was last true is honest; the same figure with no date is a boast. The
 * range's start and the employer count were the parts nobody was reading, not
 * the part that keeps it honest.
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
    <div className="card-outlined mt-4 flex h-full flex-col rounded-large px-5 py-5 text-left">
      <p className="text-label-large text-on-primary">{t("stats.market.label")}</p>

      {/* The two counts, at display size, because they are the whole point of
          the card. Two columns rather than a stack: they are one fact read
          together, how many were looked at and how many survived, and stacking
          them invites the reader to take the second on its own. */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-display-small tabular-nums text-on-primary">
            {MARKET.screened}
          </p>
          <p className="mt-1 text-body-medium text-on-surface-variant">
            {t("stats.market.screened")}
          </p>
        </div>
        <div>
          <p className="text-display-small tabular-nums text-on-primary">
            {MARKET.published}
          </p>
          <p className="mt-1 text-body-medium text-on-surface-variant">
            {t("stats.market.published")}
          </p>
        </div>
      </div>

      {/* `mt-auto` so the date sits on the card's floor however tall the card is
          grown by the one beside it. It is a footnote and it should read as one. */}
      <p className="mt-auto pt-4 text-body-medium text-on-surface-variant">
        {t("stats.market.foot", { to: MARKET.to })}
      </p>
    </div>
  );
}
