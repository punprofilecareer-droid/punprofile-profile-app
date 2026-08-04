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
 */
import { STAGE1, isValidAnswer } from "../src/lib/content/questions";
import { toScoringInput } from "../src/lib/content/mapping";
import { scoreResponse } from "../src/lib/scoring";

let failures = 0;
const fail = (msg: string) => { failures++; console.error("FAIL " + msg); };

// 1. Key uniqueness and option validity.
const keys = new Set<string>();
for (const q of STAGE1) {
  if (keys.has(q.key)) fail(`duplicate question key ${q.key}`);
  keys.add(q.key);
  for (const o of q.options) {
    if (!isValidAnswer(q.key, o.value)) fail(`${q.key}: own option ${o.value} rejected`);
  }
  if (isValidAnswer(q.key, "nonsense-value")) fail(`${q.key}: accepts unknown value`);
}

// 2. Every option value must move the profile relative to leaving the
// question unanswered, except explicit "don't know" answers.
const DONT_KNOW = new Set(["not_sure"]);
for (const q of STAGE1) {
  for (const o of q.options) {
    if (DONT_KNOW.has(o.value) && q.key !== "timeline" && q.key !== "workAuth") continue;
    const withA = scoreResponse(toScoringInput({ [q.key]: o.value }));
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
const full: Record<string, string> = {
  targetCountry: "Germany",
  targetRole: "IT & Software",
  cv: "untailored",
  linkedin: "basic",
  workAuth: "sponsor_no_route",
  english: "B1",
  stage: "applying",
  timeline: "3_6m",
};
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

if (failures) { console.error(`${failures} failures`); process.exit(1); }
console.log("content model OK: keys unique, all options scoreable, Stage 1 scores 3 dimensions and leaves Professional Capability hollow by design");
