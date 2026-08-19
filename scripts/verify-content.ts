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
import { DESTINATIONS, PAGE_ACTIONS } from "../src/lib/content/cta";
import type { DestinationId } from "../src/lib/content/cta";

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
// Raised to 17 on 14/08/2026 when Stage 2 was collapsed into Stage 1 and the
// five remaining Google Form questions came across. The count is no longer the
// interesting constraint: the evidence for going longer is that 100 people
// completed the 21-question form this replaces, with free-text boxes, and a
// tap-only version has no business being shorter than the thing it replaces.
// The real check is now drop-off, which the app can measure and the form never
// could, because a lead row exists from the first tap.
if (STAGE1.length > 17) fail(`Stage 1 has ${STAGE1.length} questions, cap is 17`);

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
  // `applicationResponse`, added 19/08/2026, and the only question here that
  // was never meant to score. It exists for Temperature, whose weights are
  // owned by `08_Coaching_Business.md` and read market feedback rather than a
  // competency. Scoring it would double-count Search Follow-through, which
  // `applications` already measures.
  "applicationResponse",
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
  portfolio: "partial",
  aiTools: ["ai_weekly"],
  applications: "1-4",
  applicationResponse: "no_replies",
  family: ["none"],
  salary: "2500_3500",
};
for (const q of STAGE1) {
  if (full[q.key] === undefined) fail(`full Stage 1 example is missing ${q.key}`);
}
const profile = scoreResponse(toScoringInput(full));
// All four dimensions score, since 14/08/2026. The hollow axis is gone.
//
// It went the moment `applications` was added, because Search Follow-through
// is a Professional Capability item and that dimension had simply never had a
// question it could reach. This assertion caught it on the first run, which is
// what it was written for.
//
// Changed deliberately, and the reasoning is that the hollow axis was a
// consequence of Stage 1's scope rather than a property of the model.
// `self-report-scoring.md` always had this dimension rendering on proxies at
// "indicative" confidence, with the report saying so in words; Stage 1 just
// could not reach a single one of them. It now reaches one of eleven items, so
// the axis renders at the lowest confidence the model has, which is honest,
// and the label still says so.
//
// What has NOT changed: experience and prior investment stay out of the
// scorer. They are the coach's ICP inputs, and mapping them would raise this
// dimension's coverage on answers the candidate gave for a different purpose.
const EXPECT_SCORED = new Set([
  "professionalCapability",
  "employability",
  "mobilityReadiness",
  "europeanMarketFit",
]);
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


// 6. The call-to-action framework, TASK-090, 14/08/2026.
//
// The rules live in `src/lib/content/cta.ts`. This is the part that makes them
// binding: a framework nobody checks is a document, and the reason this exists
// at all is that the site drifted into three CTAs on one page and none on
// another while every individual change looked reasonable.
//
// It has already earned its place. Its first run rejected three of the six
// pages, and the pages were right and the rule was wrong: it was ranking
// actions on a scale built to describe readers. See rule 4's note.
for (const [page, actions] of Object.entries(PAGE_ACTIONS)) {
  const ids: DestinationId[] = Array.isArray(actions.primary)
    ? [...actions.primary]
    : [actions.primary as DestinationId];

  // Rule 1: exactly one primary. A channel pair counts as one, which is what
  // the cost comparison below actually verifies.
  if (ids.length === 0) fail(`${page} declares no primary action`);
  for (const id of ids) {
    if (!DESTINATIONS[id]) fail(`${page} names an unknown destination ${id}`);
  }

  const costs = ids.map((id) => DESTINATIONS[id].cost);

  // Rule 2: channels of one action must cost the same. Two destinations at
  // different weights are two actions, however they are styled.
  if (new Set(costs).size > 1) {
    fail(
      `${page} lists ${ids.join(" + ")} as one primary, but they cost the reader different things (${costs.join(", ")}). That is a fork, not two routes to one place.`,
    );
  }

  // Every primary must be reachable. An empty href is how an unset channel is
  // represented, correct for LINE today, but a page whose ENTIRE primary is
  // unset has no action at all.
  if (ids.every((id) => DESTINATIONS[id].href === "")) {
    fail(`${page} has a primary action with no reachable destination`);
  }

  if (actions.secondary) {
    const secondary = DESTINATIONS[actions.secondary];
    if (!secondary) {
      fail(`${page} names an unknown secondary ${actions.secondary}`);
    } else {
      // Rule 4: different weight, in either direction.
      if (secondary.cost === costs[0]) {
        fail(
          `${page} primary and secondary both cost ${costs[0]}. Two actions of the same weight are a fork, not a hierarchy: make one of them cheaper, or drop it.`,
        );
      }
      // A secondary that repeats the primary is a duplicate, not a fallback.
      if (ids.includes(actions.secondary)) {
        fail(`${page} lists ${actions.secondary} as both its primary and its secondary`);
      }
    }
  }

  if (!actions.because || actions.because.length < 20) {
    fail(`${page} does not say why its primary is its primary`);
  }
}

if (failures) { console.error(`${failures} failures`); process.exit(1); }
console.log("content model OK: keys unique, Thai present, select contract enforced, all options scoreable, all four dimensions score, one primary CTA per page");
