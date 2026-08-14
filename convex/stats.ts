import { query } from "./_generated/server";

/**
 * Community aggregates for the result screen. TASK-083, 14/08/2026.
 *
 * Three numbers a candidate cannot get anywhere else: which countries this pool
 * is actually aiming at, the most languages any one of them speaks, and where
 * their own scores sit against everyone else's. They exist because the first
 * read used to end on a single sentence about being contacted, which gives
 * someone who just spent two minutes answering nothing to do and nothing to
 * talk about.
 *
 * **Public on purpose, and aggregate by construction.** This is the only
 * unauthenticated query in the app that reads across leads, so the rule it
 * follows is absolute: nothing leaves this file that describes one person. No
 * ids, no contact fields, no per-row objects, no arrays whose length equals the
 * number of leads. Counts and quantile boundaries only. `getSession` may return
 * a candidate their own row; this may never return anyone anyone else's.
 *
 * **A floor, per statistic, not one for the page.** A "top 5 countries" drawn
 * from eight people is not a fact about the market, it is a fact about eight
 * people, and printing it next to a chart that says "self-reported and
 * preliminary" would be the one unhedged claim on the screen. Each statistic
 * carries its own denominator because they do not share one: countries come
 * from every lead including the survey backfill, the language grid only exists
 * for leads who came through the app, and a dimension is only scored for people
 * whose answers reached it. Below the floor the field is null and the section
 * does not render. It is not an error state and there is no placeholder: a
 * statistic that cannot be true yet should be absent, not greyed out.
 *
 * **A full scan, deliberately.** At the low hundreds of leads this is cheaper
 * than the machinery that would avoid it. It stops being true somewhere in the
 * low tens of thousands, at which point the fix is a counters table written on
 * submit rather than an index, since none of these are lookups.
 */

/** Below this a statistic is withheld rather than shown with a caveat. */
const MIN_SAMPLE = 25;

/** "Speaks" means can hold a working conversation, not has met the alphabet. */
const SPEAKS_FROM: readonly string[] = ["B1", "B2", "C1", "C2"];

/**
 * The share facts, TASK-089, 14/08/2026.
 *
 * Each is "of the people who answered THIS question, how many said one of
 * these". Written as a table rather than as five hand-rolled counters so the
 * denominator rule is applied identically to all of them and is visible in one
 * place: a lead who never reached the question is in neither the numerator nor
 * the denominator, so a share never silently means "of everybody, including
 * those we never asked".
 *
 * They exist for the coaching page, which follows a sales-page shape whose
 * proof slot is normally filled with client logos and placement rates. There
 * are none of those on record, so the slot is filled with the only numbers this
 * business can actually stand behind: what the people who took the check said
 * about themselves. It is weaker as a boast and much stronger as an argument,
 * because the reader is one of them.
 */
const SHARES: Record<
  string,
  {
    /**
     * Keys to try, in order. Two names for the same fact is the normal case,
     * not an edge case: the app writes a question key (`english`) and the
     * survey backfill writes the scorer's field name (`englishCefr`), and the
     * value shape can differ with it.
     */
    keys: readonly string[];
    /** String answers that count as a hit. */
    hit: readonly string[];
    /** For a key whose imported shape is a number rather than a band. */
    numericHit?: (n: number) => boolean;
  }
> = {
  /** Aiming at Europe and has not applied to anything yet. */
  appliedNone: {
    keys: ["applications", "applicationCount"],
    hit: ["0"],
    numericHit: (n) => n === 0,
  },
  /**
   * Has started applying at all.
   *
   * Replaced `appliedMany` (five or more) on 14/08/2026, after seeing the live
   * figure. Five-or-more came out at 22%, which read as an argument AGAINST the
   * heading it sat under: "the problem is not that people are not trying" is
   * not supported by "about a fifth of them have applied much". Any-versus-none
   * is the honest version of the same claim and a far larger number, because
   * the point being made is that these people are already in motion, not that
   * they are prolific.
   */
  appliedAny: {
    keys: ["applications", "applicationCount"],
    hit: ["1-4", "5-20", "20+"],
    numericHit: (n) => n >= 1,
  },
  /** Kept for the coach's view; not currently on any page. */
  appliedMany: {
    keys: ["applications", "applicationCount"],
    hit: ["5-20", "20+"],
    numericHit: (n) => n >= 5,
  },
  /** No evidence of results anyone can look at. */
  noPortfolio: { keys: ["portfolio"], hit: ["none"] },
  /** A CV that exists but was never rewritten for this market. */
  cvNotForEurope: { keys: ["cv"], hit: ["none", "untailored"] },
  /** At or above the level European job adverts actually name. */
  englishB2: { keys: ["english", "englishCefr"], hit: ["B2", "C1", "C2"] },
  /** Does not yet know which visa route applies to them. */
  visaUnclear: { keys: ["workAuth"], hit: ["unsure", "sponsor_no_route"] },
};

const DIMENSIONS = [
  "professionalCapability",
  "employability",
  "mobilityReadiness",
  "europeanMarketFit",
] as const;

/**
 * Twenty-one boundaries: the 0th, 5th, ... 100th percentile of one dimension.
 *
 * The shape matters more than the maths. Returning the scores themselves would
 * be a per-row export dressed as a statistic, and returning a single percentile
 * would mean this query knowing which candidate is asking. Boundaries are
 * neither: the client places its own score against them and learns one number
 * about itself, and the payload is twenty-one numbers whatever the pool size.
 *
 * Nearest-rank, not interpolated, because these are bounded scores on a small
 * pool and an interpolated boundary is a value nobody scored.
 */
function quantiles(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  return Array.from({ length: 21 }, (_, i) => {
    const rank = Math.min(sorted.length - 1, Math.round((i / 20) * (sorted.length - 1)));
    return Math.round(sorted[rank] * 100) / 100;
  });
}

export const community = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query("leads").collect();

    // ---- Countries. Every lead that named at least one, survey imports too.
    const countryCounts = new Map<string, number>();
    let countryRespondents = 0;
    // ---- Languages. Only leads who reached the grid, which is app leads only.
    let languageRespondents = 0;
    let mostLanguages = 0;
    // ---- Score distribution, per dimension, over leads that dimension scored.
    const samples: Record<string, number[]> = {};
    for (const d of DIMENSIONS) samples[d] = [];
    // ---- Share facts, each with its own numerator and denominator.
    const shareHits: Record<string, number> = {};
    const shareTotals: Record<string, number> = {};
    for (const name of Object.keys(SHARES)) {
      shareHits[name] = 0;
      shareTotals[name] = 0;
    }

    for (const lead of leads) {
      const responses = (lead.responses ?? {}) as Record<string, unknown>;

      const targets = responses.targetCountries;
      if (Array.isArray(targets)) {
        // `not_sure` is an answer, and a real one, but it is not a country and
        // must not appear in a ranking of countries. A lead who chose only
        // `not_sure` is not a respondent to this statistic either: counting
        // them in the denominator would quietly shrink every percentage.
        const named = targets.filter((c): c is string => typeof c === "string" && c !== "not_sure");
        if (named.length) {
          countryRespondents += 1;
          // A set, because a duplicate in one lead's answer is a data artefact,
          // never a second vote.
          for (const c of new Set(named)) countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
        }
      }

      const grid = responses.otherLanguages;
      if (grid && typeof grid === "object" && !Array.isArray(grid)) {
        languageRespondents += 1;
        let spoken = Object.values(grid as Record<string, unknown>).filter(
          (lv) => typeof lv === "string" && SPEAKS_FROM.includes(lv),
        ).length;
        // English counts, and only from B1, on the same rule as the rest. It is
        // asked separately from the grid because every candidate answers it, not
        // because it is a different kind of language.
        if (typeof responses.english === "string" && SPEAKS_FROM.includes(responses.english)) {
          spoken += 1;
        }
        if (spoken > mostLanguages) mostLanguages = spoken;
      }

      for (const [name, rule] of Object.entries(SHARES)) {
        /**
         * First key that carries a usable value wins. A lead has one or the
         * other, never both, because a row is either an app session or a survey
         * import.
         *
         * This is the bug that made the coaching page's proof panel show one
         * statistic instead of three on 14/08/2026: the rules named only the
         * app's question keys, so the hundred imported survey leads were
         * invisible to every share whose imported field had been renamed by the
         * scorer. `cv` and `portfolio` kept their names and worked; `english`
         * and `applications` did not and silently reported a sample too small
         * to print. The same class of mistake as `toScoringInput` versus
         * `toGradeInput` in the admin grader.
         */
        let hit: boolean | null = null;
        for (const key of rule.keys) {
          const answer = responses[key];
          if (typeof answer === "string" && answer !== "") {
            hit = rule.hit.includes(answer);
            break;
          }
          // The imported shape for a band is often a raw number.
          if (typeof answer === "number" && Number.isFinite(answer) && rule.numericHit) {
            hit = rule.numericHit(answer);
            break;
          }
        }
        // Never answered, by either name: out of the numerator AND the
        // denominator, so a share never quietly means "of everybody".
        if (hit === null) continue;
        shareTotals[name] += 1;
        if (hit) shareHits[name] += 1;
      }

      const scores = lead.scores ?? {};
      for (const d of DIMENSIONS) {
        const v = scores[d];
        if (typeof v === "number" && Number.isFinite(v)) samples[d].push(v);
      }
    }

    const topCountries =
      countryRespondents >= MIN_SAMPLE
        ? [...countryCounts.entries()]
            // Count first, then name, so a tie orders the same way on every
            // read. Convex's scan order is not a promise, and a leaderboard
            // that reshuffles between two visits reads as broken.
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, 5)
            .map(([country, count]) => ({
              country,
              // The percentage and never the count. Two separate reasons now:
              // "38% are aiming at Germany" is the fact a reader wants, and the
              // absolute number is commercially sensitive. See the note on the
              // return value below.
              share: Math.round((count / countryRespondents) * 100),
            }))
        : null;

    const distribution: Record<string, number[] | null> = {};
    for (const d of DIMENSIONS) {
      distribution[d] = samples[d].length >= MIN_SAMPLE ? quantiles(samples[d]) : null;
    }

    const shares: Record<string, { pct: number } | null> = {};
    for (const name of Object.keys(SHARES)) {
      shares[name] =
        shareTotals[name] >= MIN_SAMPLE
          // The percentage alone. The denominator decides whether this renders
          // at all and then stays on the server, per the note on the return.
          ? { pct: Math.round((shareHits[name] / shareTotals[name]) * 100) }
          : null;
    }

    /**
     * **No sample sizes leave this function.** Paul's call, 14/08/2026: how
     * many people have taken the check is PunProfile's own information, and a
     * public query that publishes it hands a competitor the one number they
     * cannot otherwise get. It was previously returned so a footnote could say
     * "from 99 people", and that footnote is gone with it.
     *
     * This costs something real and it is worth naming rather than pretending
     * otherwise: a percentage with a stated denominator is a checkable claim,
     * and the same percentage without one is an assertion. The mitigation is
     * that the floors below are unchanged, so nothing is ever published off a
     * thin sample; the reader simply has to take the size on trust instead of
     * seeing it. The footnotes still say WHO was counted, which is the part
     * that stops a share being mistaken for a claim about Europe.
     *
     * The counts are still computed. They just stay on the server, where the
     * floors use them.
     */
    return {
      shares,
      topCountries,
      // Zero is withheld as well as a thin pool. "The most languages anyone
      // speaks is 0" is arithmetically true and useless, and it only happens
      // while the grid is new. This one IS a real figure rather than a sample
      // size: it describes a person in the pool, not how many people are in it.
      mostLanguages:
        languageRespondents >= MIN_SAMPLE && mostLanguages > 0 ? mostLanguages : null,
      distribution,
    };
  },
});
