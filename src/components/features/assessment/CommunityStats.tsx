"use client";

/**
 * What everyone else who took this said, under the first read. TASK-083,
 * 14/08/2026, restructured 16/08/2026.
 *
 * Facts about the pool first, then one about the candidate. The order is the
 * point: a stranger reads the countries, recognises their own shortlist, meets
 * the group's readiness gaps as company rather than as an accusation, and only
 * then meets a sentence about themselves, which lands differently than it would
 * as the opening claim.
 *
 * **What changed on 16/08/2026 and why.** The most-languages figure came off.
 * It was the weakest of the three: a maximum rather than a share, describing one
 * person nobody can identify, and it said nothing a candidate could act on or
 * repeat. In its place go the three readiness shares, which all point the same
 * way and together make the argument the coaching page makes: the gap between
 * this group and a European shortlist is presentation, not ability. The query
 * still computes languages, because deleting a statistic to change a layout
 * would make this screen the source of truth for `stats.ts`.
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
import type { CopyKey } from "@/lib/content/copy";

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

/**
 * The readiness bars, in the order a recruiter meets them: the document, the
 * evidence behind it, the profile they search for afterwards.
 */
const READINESS: { share: string; copyKey: CopyKey }[] = [
  { share: "cvNotForEurope", copyKey: "stats.readiness.cv" },
  { share: "noPortfolio", copyKey: "stats.readiness.portfolio" },
  { share: "linkedinThin", copyKey: "stats.readiness.linkedin" },
];

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

  // A bar group of one is not a group, and the sentence under it claims three
  // things point the same way. Below three, the card does not render.
  const readiness = READINESS.map((r) => ({ ...r, pct: stats.shares[r.share]?.pct ?? null })).filter(
    (r): r is typeof r & { pct: number } => r.pct !== null,
  );
  const showReadiness = readiness.length === READINESS.length;

  const waiting = stats.shares.notApplyingYet?.pct ?? null;
  const soon = stats.shares.soonWithin3m?.pct ?? null;

  const hasAny =
    stats.topCountries !== null || showReadiness || (best && best.pct >= MIN_INTERESTING);
  if (!hasAny) return null;

  return (
    <section className="mt-10 text-left">
      <h2 className="text-label-large text-on-surface-variant">{t("stats.heading")}</h2>

      {/* One column on a phone, three across on a desktop. The three are
          independent facts of similar weight, so a row is honest here in a way
          it would not be for the narrative above, where the order is an
          argument. Each is `h-full` so a short card does not leave the row
          ragged. */}
      <div className="mt-3 flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-6">
        {stats.topCountries && (
          <div className="card-outlined h-full rounded-large px-5 py-5">
            <p className="text-label-large text-on-tertiary-container">{t("stats.countries.label")}</p>
            <ol className="mt-4 flex flex-col gap-3">
              {stats.topCountries.map((c, i) => (
                <li key={c.country} className="flex items-center gap-3">
                  <span aria-hidden className="w-4 shrink-0 text-body-medium text-on-surface-variant">
                    {i + 1}
                  </span>
                  {/* Country names are not translated anywhere in this app:
                      the question's own options carry the English name in both
                      locales, and a Thai transliteration here would print a
                      different word than the one the candidate tapped. */}
                  <span className="w-28 shrink-0 text-body-large text-on-surface">{c.country}</span>
                  {/* The bar is scaled to the leader, not to 100. At a share of
                      around a third the whole set would otherwise sit in the
                      left third of the card and read as an error. */}
                  <span
                    aria-hidden
                    className="h-2 rounded-full bg-tertiary"
                    style={{
                      width: `${Math.max(
                        6,
                        (c.share / stats.topCountries![0].share) * 100,
                      )}%`,
                      maxWidth: "100%",
                    }}
                  />
                  <span className="ml-auto shrink-0 text-body-medium text-on-surface-variant">{c.share}%</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-body-medium text-on-surface-variant">
              {t("stats.countries.foot")}
            </p>
          </div>
        )}

        {/* The readiness stack. Three shares of the same pool, so the bars are
            scaled to 100 rather than to the leader: here the absolute height IS
            the claim, unlike the countries above where the ranking is. */}
        {showReadiness && (
          <div className="card-outlined h-full rounded-large px-5 py-5">
            <p className="text-label-large text-on-tertiary-container">{t("stats.readiness.label")}</p>
            <ul className="mt-4 flex flex-col gap-4">
              {readiness.map((r) => (
                <li key={r.share}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-body-large text-on-surface">{t(r.copyKey)}</span>
                    <span className="shrink-0 text-body-large font-semibold tabular-nums text-on-tertiary-container">
                      {r.pct}%
                    </span>
                  </div>
                  <div aria-hidden className="mt-2 h-2 w-full rounded-full bg-surface-container">
                    <span
                      className="block h-2 rounded-full bg-tertiary"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {waiting !== null && soon !== null && (
              <p className="mt-5 text-body-large text-on-surface-variant">
                {t("stats.timing", { waiting, soon })}
              </p>
            )}
            <p className="mt-3 text-body-medium text-on-surface-variant">{t("stats.readiness.foot")}</p>
          </div>
        )}

        {/* The one sentence here about the candidate rather than the pool, so it
            goes last and it gets the only coloured panel in the section.

            **Terracotta, on Paul's call 16/08/2026**, which reverses what this
            component shipped with a few hours earlier. `design.md` reserves
            Terracotta for the single action on a view and warns against two
            things competing to be pressed, so this block was built in
            `eufit-deep`. He looked at both and took the mockup: the block is
            the loudest thing on the page and he wants the number to be it. The
            services button below drops to Teal in the same change, so the rule
            behind the guidance still holds even though the colour moved.

            White on `accent` measures 4.89:1, which is AA at body size and
            above. That is why the caption here is full white rather than the
            faded variant a caption would normally take. */}
        {best && best.pct >= MIN_INTERESTING && (
          <div className="h-full rounded-large bg-action px-6 py-7 text-on-action">
            <p className="text-display-large leading-none tabular-nums">{best.pct}%</p>
            <p className="mt-3 text-body-large">
              {t("stats.percentile", {
                dimension: t(`dimension.${best.key}` as AnyCopyKey),
              })}
            </p>
            <p className="mt-2 text-body-medium text-on-action">{t("stats.percentile.foot")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
