/**
 * Workplace English viability per country, and the rule turning a band plus a
 * candidate's English level into "can they realistically work there".
 *
 * Owned by `07_Reference.md`; this file implements it. Decided 13/08/2026, see
 * `09_Decision_Log.md` and `english-usage-bands.md`.
 *
 * **These are workplace bands, not population proficiency.** EF EPI measures the
 * second and the two disagree. EF scores Germany 598 ("High"), above Switzerland
 * at 550, while German workplaces outside international and tech firms run in
 * German. Austria at 600 and Portugal at 605 are the same trap: high population
 * proficiency, local-language workplaces. EF is one input, not the answer.
 *
 * **Known limitation, stated rather than solved.** A band is country-level and
 * the real threshold is role-level. English is enough for a Berlin software role
 * and not for a resort operations role in the same country. TASK-076 adds city
 * depth as narrative, which is the honest first refinement; making the band
 * role-dependent is a larger change and is not attempted here.
 */

export type EnglishBand = "native" | "very_high" | "high" | "moderate" | "lower";

/**
 * Every country in `questions.ts` → COUNTRIES, plus the ones the free-text era of
 * the survey produced. The United Kingdom is not on the app's list but was the
 * third most-named country across the 90 imported leads, so omitting it silently
 * scored 25 country-mentions as unreachable.
 */
export const COUNTRY_ENGLISH: Record<string, EnglishBand> = {
  Ireland: "native",
  "United Kingdom": "native", // not on the app's list; 25 mentions in the backfill

  Netherlands: "very_high",
  Denmark: "very_high",
  Sweden: "very_high",
  Norway: "very_high",
  Iceland: "very_high", // backfill only

  Finland: "high",
  Belgium: "high", // carried by Brussels; Flanders and Wallonia are weaker
  Switzerland: "high", // international firms in Zurich, Geneva, Basel
  Luxembourg: "high", // backfill only; trilingual and heavily international

  Germany: "moderate", // international and tech firms yes, Mittelstand and public sector no
  Austria: "moderate", // mirrors Germany, concentrated in Vienna
  Poland: "moderate", // shared services and IT in Kraków, Warsaw, Wrocław
  "Czech Republic": "moderate", // same pattern, concentrated in Prague
  Portugal: "moderate", // tech and shared services in Lisbon and Porto

  France: "lower",
  Italy: "lower",
  Spain: "lower",
  Greece: "lower", // backfill only
};

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Cefr = (typeof CEFR_ORDER)[number];

const atLeast = (level: Cefr | null | undefined, floor: Cefr): boolean =>
  !!level && CEFR_ORDER.indexOf(level) >= CEFR_ORDER.indexOf(floor);

/**
 * How much one country contributes to the reach ratio.
 *
 * **Two half-credit rules, both there to stop this item collapsing into a third
 * copy of the English score.**
 *
 * *Moderate at C1 counts half*, decided 13/08/2026. In Germany, Austria, Poland,
 * Czechia and Portugal an English-only candidate has a real but narrow path
 * through international employers. Neither "open" nor "closed" is true, and half
 * is the only honest answer available at country level.
 *
 * *One band below the bar counts half.* Found by running the 90 real leads: with
 * a hard floor, all 29 B1 candidates scored 1 no matter which countries they
 * named, because very_high needed B2 and everything else needed C1. That is not
 * reach, it is English level, which Language Readiness and Business English
 * already score twice. Half-credit restores the distinction between a B1
 * candidate targeting the Netherlands, which is narrow but real, and a B1
 * candidate targeting France, which is not. Within the B1 group alone the item
 * now spreads across scores 1, 2 and 3, which is the test that it measures reach
 * rather than proficiency.
 *
 * "lower" stays zero on English alone, not because the country is closed, but
 * because reaching it needs the local language, which this function cannot see.
 */
export function countryWeight(country: string, english: Cefr | null | undefined): number {
  const band = COUNTRY_ENGLISH[country];
  if (!band) return 0; // unknown country: never guessed reachable
  switch (band) {
    case "native":
    case "very_high":
      return atLeast(english, "B2") ? 1 : atLeast(english, "B1") ? 0.5 : 0;
    case "high":
      return atLeast(english, "C1") ? 1 : atLeast(english, "B2") ? 0.5 : 0;
    case "moderate":
      return atLeast(english, "C1") ? 0.5 : 0;
    case "lower":
      return 0;
  }
}

/**
 * Why a local language cannot be read yet.
 *
 * `SurveyResponse.otherLanguageCefr` stores the highest level reached in ANY
 * European language, not which language it is, so it cannot be matched to a
 * country. A candidate with German at B2 and one with Italian at B2 are
 * identical in the data. Guessing which country the level belongs to would
 * invent evidence, so reach is computed on English alone until TASK-072 lands
 * the per-language grid in the app's Stage 2, and the report says so.
 */
export const REACH_IS_ENGLISH_ONLY = true;
