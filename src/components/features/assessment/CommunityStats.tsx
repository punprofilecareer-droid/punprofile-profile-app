"use client";

/**
 * The three community lines under the first read. TASK-083, 14/08/2026.
 *
 * Two facts about the pool and one about the candidate, in that order. The
 * order is the point: a stranger reads the countries line, recognises their own
 * shortlist in it, and only then meets a sentence about themselves, which lands
 * differently than it would as the opening claim.
 *
 * Every number comes from `convex/stats.ts`, which returns aggregates and
 * quantile boundaries only. Nothing in this component can name another
 * candidate because nothing that reaches it describes one.
 *
 * The whole section is optional at every level. The query is reactive and
 * arrives after first paint, each statistic is independently null below its own
 * sample floor, and a null renders nothing rather than a skeleton or a dash.
 * On an empty database this component is invisible, which is the correct
 * behaviour for a section whose entire content is "here is what other people
 * said" when nobody has said anything.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCopy } from "@/components/LocaleProvider";
import type { AnyCopyKey } from "@/lib/locale";

type Scores = Record<string, number | undefined>;

/**
 * Where a score falls against the 21 boundaries the query returns.
 *
 * `boundaries[i]` is the (5i)th percentile, so counting the ones strictly below
 * a score and stepping back one gives the percentage beneath it. Nearest-rank
 * and rounded down at every step, which means the number is understated when
 * scores tie rather than overstated. Understating is the right direction: this
 * sentence is shown to the candidate as a fact about them, and the failure that
 * matters is claiming more than the data holds.
 *
 * Caps at 95 by construction, because the top boundary is somebody's actual
 * score and "higher than 100% of them" is never true of a member of the pool.
 */
function percentBelow(score: number, boundaries: number[]): number {
  const under = boundaries.filter((b) => b < score).length;
  return Math.max(0, (under - 1) * 5);
}

/** Only these four, and only the ones the query had enough of to rank. */
const DIMENSIONS = [
  "professionalCapability",
  "employability",
  "mobilityReadiness",
  "europeanMarketFit",
] as const;

/** Suppressed below this rather than printed. See `best` below. */
const MIN_INTERESTING = 10;

export default function CommunityStats({ scores }: { scores: Scores }) {
  const stats = useQuery(api.stats.community);
  const { t } = useCopy();

  if (!stats) return null;

  /**
   * The candidate's strongest standing, not a fixed axis and not all four.
   *
   * All four would be a second chart in prose, and a fixed axis would tell
   * whoever is weakest on it exactly that, in a comparison to strangers,
   * immediately after being told there is a queue. The narrative bank above
   * this section already leads on a strength for the same reason, so this
   * follows the screen it sits on rather than inventing a second posture.
   *
   * It is one labelled dimension and it says which, so it is a true statement
   * about a real axis, not a summary the candidate could mistake for a rank.
   */
  const best = DIMENSIONS.reduce<{ key: string; pct: number } | null>((top, key) => {
    const score = scores[key];
    const boundaries = stats.distribution[key];
    if (typeof score !== "number" || !boundaries) return top;
    const pct = percentBelow(score, boundaries);
    return !top || pct > top.pct ? { key, pct } : top;
  }, null);

  const hasAny =
    stats.topCountries !== null || stats.mostLanguages !== null || (best && best.pct >= MIN_INTERESTING);
  if (!hasAny) return null;

  return (
    <section className="mt-10 text-left">
      <h2 className="text-label text-slate">{t("stats.heading")}</h2>

      <div className="mt-3 flex flex-col gap-4">
        {stats.topCountries && (
          <div className="material rounded-lg px-6 py-6">
            <p className="text-label text-eufit-deep">{t("stats.countries.label")}</p>
            <ol className="mt-4 flex flex-col gap-3">
              {stats.topCountries.map((c, i) => (
                <li key={c.country} className="flex items-center gap-3">
                  <span aria-hidden className="w-4 shrink-0 text-caption text-neutral-500">
                    {i + 1}
                  </span>
                  {/* Country names are not translated anywhere in this app:
                      the question's own options carry the English name in both
                      locales, and a Thai transliteration here would print a
                      different word than the one the candidate tapped. */}
                  <span className="w-32 shrink-0 text-body text-ink">{c.country}</span>
                  {/* The bar is scaled to the leader, not to 100. At a share of
                      around a third the whole set would otherwise sit in the
                      left third of the card and read as an error. */}
                  <span
                    aria-hidden
                    className="h-2 rounded-full bg-eufit"
                    style={{
                      width: `${Math.max(
                        6,
                        (c.share / stats.topCountries![0].share) * 100,
                      )}%`,
                      maxWidth: "100%",
                    }}
                  />
                  <span className="ml-auto shrink-0 text-caption text-slate">{c.share}%</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-caption text-neutral-500">
              {t("stats.countries.foot")}
            </p>
          </div>
        )}

        {stats.mostLanguages !== null && (
          <div className="material rounded-lg px-6 py-6">
            <p className="text-label text-eufit-deep">{t("stats.languages.label")}</p>
            <p className="mt-2 text-h3 text-ink">
              {t("stats.languages.value", { max: stats.mostLanguages })}
            </p>
            <p className="mt-2 text-caption text-neutral-500">{t("stats.languages.foot")}</p>
          </div>
        )}

        {best && best.pct >= MIN_INTERESTING && (
          <div className="material-mint rounded-lg px-6 py-6">
            <p className="text-body-lg text-ink">
              {t("stats.percentile", {
                dimension: t(`dimension.${best.key}` as AnyCopyKey),
                n: best.pct,
              })}
            </p>
            <p className="mt-2 text-caption text-neutral-500">{t("stats.percentile.foot")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
