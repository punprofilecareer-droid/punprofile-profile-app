/**
 * TASK-051 invariant check. Run after touching questions.ts, mapping.ts or the
 * scorers:
 *
 *   npx tsx scripts/verify-content.ts
 *
 * Asserts that every Stage 1 option value survives the round trip
 * (responses -> ScoringInput -> a real item score), that a completed Stage 1
 * scores every dimension, and that no question key collides. A canonical value
 * the scorer silently ignores would otherwise look identical to an unanswered
 * question, the same failure mode audit.ts guards in the backfill path.
 *
 * Since 08/08/2026 it also pins the single/multi select contract and the
 * presence of Thai copy, because both are enforced server-side and a silent
 * regression in either is invisible until a candidate hits it.
 */
import { STAGE1, isValidAnswer, EXCLUSIVE_VALUES } from "../src/lib/content/questions";
import type { Question } from "../src/lib/content/questions";
import { toScoringInput } from "../src/lib/content/mapping";
import { scoreResponse } from "../src/lib/scoring";

let failures = 0;
const fail = (msg: string) => { failures++; console.error("FAIL " + msg); };

/** The wire shape a single option takes for this question. */
const asAnswer = (q: Question, value: string): string | string[] =>
  q.select === "many" ? [value] : value;

// 0. Stage 1 stays under the PRD § 1 cap.
if (STAGE1.length > 10) fail(`Stage 1 has ${STAGE1.length} questions, cap is 10`);

// 1. Key uniqueness, option validity, and the select-mode contract.
const keys = new Set<string>();
for (const q of STAGE1) {
  if (keys.has(q.key)) fail(`duplicate question key ${q.key}`);
  keys.add(q.key);

  if (!q.th) fail(`${q.key}: prompt has no Thai`);
  for (const o of q.options) {
    if (!o.th) fail(`${q.key}: option ${o.value} has no Thai`);
    if (!isValidAnswer(q.key, asAnswer(q, o.value))) {
      fail(`${q.key}: own option ${o.value} rejected`);
    }
  }
  if (isValidAnswer(q.key, asAnswer(q, "nonsense-value"))) {
    fail(`${q.key}: accepts unknown value`);
  }

  const first = q.options[0].value;
  if (q.select === "many") {
    // Rejects the wrong shape, empties, duplicates, and a "don't know" mixed
    // in with a real answer.
    if (isValidAnswer(q.key, first)) fail(`${q.key}: many-select accepts a bare string`);
    if (isValidAnswer(q.key, [])) fail(`${q.key}: many-select accepts an empty list`);
    if (isValidAnswer(q.key, [first, first])) fail(`${q.key}: many-select accepts duplicates`);
    for (const x of EXCLUSIVE_VALUES) {
      if (!q.options.some((o) => o.value === x)) continue;
      if (isValidAnswer(q.key, [first, x])) {
        fail(`${q.key}: accepts "${x}" alongside a real answer`);
      }
      if (!isValidAnswer(q.key, [x])) fail(`${q.key}: rejects "${x}" on its own`);
    }
  } else {
    if (isValidAnswer(q.key, [first])) fail(`${q.key}: one-select accepts an array`);
  }
}

// 2. Every option value must move the profile relative to leaving the
// question unanswered, except explicit "don't know" answers and questions that
// deliberately score nothing.
const DONT_KNOW = new Set(["not_sure"]);
const UNSCORED_BY_DESIGN = new Set(["pathway"]); // SLOT: pathway, context only
for (const q of STAGE1) {
  if (UNSCORED_BY_DESIGN.has(q.key)) continue;
  for (const o of q.options) {
    if (DONT_KNOW.has(o.value) && q.key !== "timeline" && q.key !== "workAuth") continue;
    const withA = scoreResponse(toScoringInput({ [q.key]: asAnswer(q, o.value) }));
    const without = scoreResponse(toScoringInput({}));
    const changed =
      JSON.stringify(withA.dimensions.map((d) => [d.score, d.coverage])) !==
      JSON.stringify(without.dimensions.map((d) => [d.score, d.coverage]));
    if (!changed) fail(`${q.key}=${o.value} has no scoring effect`);
  }
}

// 3. A full Stage 1 answers set scores exactly the three dimensions Stage 1
// can reach. Professional Capability's proxies (experience, prior investment,
// applications) are Stage 2 questions BY DESIGN: the teaser renders its axis
// hollow ("not measured yet"), which is the honest-curiosity mechanic from
// PRD § 1, and the check pins that so a content change can't silently break
// either direction.
const full: Record<string, string | string[]> = {
  pathway: "job_first",
  targetCountries: ["Germany"],
  targetRole: "IT & Software",
  cv: "untailored",
  linkedin: "basic",
  workAuth: "sponsor_no_route",
  english: "B1",
  stage: "applying",
  timeline: "3_6m",
};
for (const q of STAGE1) {
  if (full[q.key] === undefined) fail(`full Stage 1 example is missing ${q.key}`);
}
const profile = scoreResponse(toScoringInput(full));
const EXPECT_SCORED = new Set(["employability", "mobilityReadiness", "europeanMarketFit"]);
for (const d of profile.dimensions) {
  if (EXPECT_SCORED.has(d.key) && d.score === null) fail(`full Stage 1 leaves ${d.key} unscored`);
  if (!EXPECT_SCORED.has(d.key) && d.score !== null)
    fail(`${d.key} unexpectedly scored by Stage 1; update the teaser expectation deliberately`);
}
console.log(
  "full Stage 1 example:",
  profile.dimensions.map((d) => `${d.key}=${d.score}`).join(" "),
);

// 4. The Target Clarity taper (decided 08/08/2026). Pinned because the whole
// point of the multi-select is that breadth and focus score differently.
const clarity = (countries: string[]): number | null => {
  const p = scoreResponse(toScoringInput({ targetCountries: countries, targetRole: "Marketing" }));
  for (const d of p.dimensions) {
    const item = d.items.find((i) => i.key === "targetClarity");
    if (item) return item.score;
  }
  return null;
};
const TAPER: [string[], number | null][] = [
  [["Germany"], 4],
  [["Germany", "France"], 3.5],
  [["Germany", "France", "Spain"], 3.5],
  [["Germany", "France", "Spain", "Italy"], 3],
  [["not_sure"], 2],
];
for (const [countries, expected] of TAPER) {
  const got = clarity(countries);
  if (got !== expected) {
    fail(`targetClarity for [${countries.join(", ")}] is ${got}, expected ${expected}`);
  }
}

// 5. The legacy singular key must still score, so rows written before the
// multi-select change are not silently dropped.
const legacy = scoreResponse(toScoringInput({ targetCountry: "Germany", targetRole: "Marketing" }));
if (JSON.stringify(legacy) !== JSON.stringify(
  scoreResponse(toScoringInput({ targetCountries: ["Germany"], targetRole: "Marketing" })),
)) {
  fail("legacy targetCountry key no longer scores like targetCountries");
}

if (failures) { console.error(`${failures} failures`); process.exit(1); }
console.log("content model OK: keys unique, Thai present, select contract enforced, all options scoreable, Stage 1 scores 3 dimensions and leaves Professional Capability hollow by design");
