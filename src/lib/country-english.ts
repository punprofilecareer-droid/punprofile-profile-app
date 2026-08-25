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
 * The working language of each country on the list. TASK-072, 14/08/2026.
 *
 * "Working language" means the language a workplace outside the international
 * and tech bubble actually runs in, which is the same standard the English
 * bands above use. Countries with more than one are listed with all of them and
 * any single one counts, because a candidate needs one language to work in, not
 * the set.
 *
 * Ireland and the United Kingdom are deliberately absent: their working
 * language is English, which `countryWeight` already scores through the band,
 * and listing it twice would let a candidate score the same evidence twice.
 */
export const COUNTRY_LANGUAGE: Record<string, readonly string[]> = {
  Germany: ["German"],
  Austria: ["German"],
  Switzerland: ["German", "French", "Italian"],
  Netherlands: ["Dutch"],
  Belgium: ["Dutch", "French"],
  France: ["French"],
  Spain: ["Spanish"],
  Italy: ["Italian"],
  Portugal: ["Portuguese"],
  Poland: ["Polish"],
  "Czech Republic": ["Czech"],
  Denmark: ["Danish"],
  Sweden: ["Swedish"],
  Norway: ["Norwegian"],
  Finland: ["Finnish"],
};

/** The grid's options. `Other` is collected but never matches a country. */
/*
 * `Other` left this list on 25/08/2026, Paul's call after reading the step.
 *
 * It was a thirteenth option meaning "a European language not on this list".
 * Selecting it stored exactly what skipping stored, because it matches no
 * country and the grid dropped it before submitting, so a candidate who ticked
 * it had answered and been recorded as having answered nothing. It also asked
 * for a level on a language it never asked the name of.
 *
 * It comes back when the screen can capture a name AND a level, and not before.
 * `convex/leads.ts` whitelists incoming language keys against this array, so
 * removing it here also stops an `Other` arriving from anywhere else.
 */
export const EUROPEAN_LANGUAGES = [
  "German",
  "French",
  "Spanish",
  "Italian",
  "Dutch",
  "Portuguese",
  "Polish",
  "Swedish",
  "Danish",
  "Norwegian",
  "Finnish",
  "Czech",
] as const;

/**
 * A local working language at B2 or above opens a country on its own.
 *
 * B2, not C1: B2 is the level European employers name in job adverts, and it is
 * the same threshold `countryWeight` already uses for a native or very-high
 * English country. Below B2 the language contributes nothing rather than a
 * fraction, because a half-credit for A2 German would say a candidate is
 * halfway into a German-speaking workplace, and they are not.
 *
 * This is what `REACH_IS_ENGLISH_ONLY` existed to flag. A "lower" band country
 * such as Italy or Poland scored zero on English alone no matter what, which
 * was correct while the data could not say which language a level belonged to,
 * and wrong the moment it could.
 */
export function localLanguageOpens(
  country: string,
  languages: Readonly<Record<string, string>> | null | undefined,
): boolean {
  if (!languages) return false;
  const needed = COUNTRY_LANGUAGE[country];
  if (!needed) return false;
  return needed.some((lang) => atLeast(languages[lang] as Cefr | undefined, "B2"));
}

/**
 * Reach, counting the local language when the grid has been filled in.
 *
 * A country is worth 1 if the local language clears B2, otherwise it falls back
 * to the English-only weight. Never the sum of both: two routes into one
 * country is still one country, and adding them would score a bilingual
 * candidate above a full-credit monolingual one on an item that is measured
 * out of 1.
 */
export function countryWeightWithLanguages(
  country: string,
  english: Cefr | null | undefined,
  languages: Readonly<Record<string, string>> | null | undefined,
): number {
  if (localLanguageOpens(country, languages)) return 1;
  return countryWeight(country, english);
}

/**
 * True while a candidate has no language grid. Was a module-level constant
 * asserting reach could never see a local language; it is now a per-candidate
 * question, because for anyone who fills the grid in the answer is no.
 *
 * The report reads this to decide whether to say so, which is the whole point:
 * a score computed on English alone and a score computed on English plus a
 * language are different claims and must not look identical.
 */
export function reachIsEnglishOnly(
  languages: Readonly<Record<string, string>> | null | undefined,
): boolean {
  return !languages || Object.keys(languages).length === 0;
}
