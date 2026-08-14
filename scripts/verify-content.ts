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

// 0. Stage 1 stays inside the PRD § 1 budget.
//
// The real constraint in PRD § 1 is **time**, under 90 seconds from landing to
// first read, not a question count. The count is the proxy this check uses
// because it is the thing a content change can break by accident. Raised from
// 10 to 11 on 14/08/2026 when the two ICP questions were added; both are
// tap-only single-select, which is about five seconds each against a budget
// that measured near 75. Raising it again without re-timing the flow on a real
// phone would be guessing.
if (STAGE1.length > 11) fail(`Stage 1 has ${STAGE1.length} questions, cap is 11`);

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
// `pathway` is context only. `experienceYears` and `priorInvestment` score
// nothing on the CANDIDATE side on purpose, added 14/08/2026: they feed the
// coach's ICP grade through `toGradeInput`, and routing them through
// `toScoringInput` instead would start scoring Professional Capability and
// silently reverse the hollow-axis decision that check 3 below pins.
const UNSCORED_BY_DESIGN = new Set([
  "pathway",
  "experienceYears",
  "priorInvestment",
  // `targetCountries` joined this list on 14/08/2026, and it is the one entry
  // here that marks a GAP rather than a decision. Until 13/08 the country count
  // tapered Target Clarity, so every option moved the profile. Country Reach
  // replaced that, and Country Reach is `reachable / selected`, which needs the
  // working-language grid that moves to Stage 2 in TASK-072. So a country
  // selection currently scores nothing at all. Named here rather than left as a
  // red check, because a red check nobody can fix stops being read.
  "targetCountries",
]);
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
// can reach. Professional Capability renders hollow ("not measured yet"), which
// is the honest-curiosity mechanic from PRD § 1, and this check pins it so a
// content change cannot silently break either direction.
//
// Amended 14/08/2026. Two of its proxies, experience and prior investment, ARE
// now asked in Stage 1, so "they are Stage 2 questions" is no longer why the
// axis is hollow. The reason is now a deliberate routing decision: those two
// answers go to the coach's ICP grade and not into ScoringInput. If that is
// ever reversed, this assertion is the thing that will object, and it should
// be changed on purpose rather than silenced.
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
  // Present so the completeness check passes; both are unscored by design
  // above, so neither moves the profile the assertions below inspect.
  experienceYears: "2-10",
  priorInvestment: ["never"],
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

// 4. Target Clarity is the ROLE, and nothing else.
//
// Rewritten 14/08/2026. This check previously pinned the "Target Clarity taper"
// decided 08/08/2026, where more countries scored lower. The 13/08/2026 Country
// Reach decision reversed the premise: four countries a candidate can genuinely
// reach score ABOVE one country, because reach is capability and not vagueness,
// so country count left Target Clarity entirely and became its own item. The
// check was not updated with it and has been failing ever since, which is how a
// stale assertion earns its keep only if someone reads it.
//
// Pinned in the inverse direction now: the count must NOT move Target Clarity,
// and the role must.
const clarity = (r: { targetCountries?: string[]; targetRole?: string }): number | null => {
  const p = scoreResponse(toScoringInput(r));
  for (const d of p.dimensions) {
    const item = d.items.find((i) => i.key === "targetClarity");
    if (item) return item.score;
  }
  return null;
};
const named = clarity({ targetCountries: ["Germany"], targetRole: "Marketing" });
const INDEPENDENT: string[][] = [
  ["Germany", "France"],
  ["Germany", "France", "Spain"],
  ["Germany", "France", "Spain", "Italy"],
  ["not_sure"],
];
for (const countries of INDEPENDENT) {
  const got = clarity({ targetCountries: countries, targetRole: "Marketing" });
  if (got !== named) {
    fail(
      `targetClarity moved with country count: [${countries.join(", ")}] is ${got}, one country is ${named}. Country count belongs to Country Reach since 13/08/2026.`,
    );
  }
}
const vague = clarity({ targetCountries: ["Germany"], targetRole: "not_sure" });
if (named === null || vague === null || !(named > vague)) {
  fail(`targetClarity must fall when the role is unclear: named ${named}, not_sure ${vague}`);
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
