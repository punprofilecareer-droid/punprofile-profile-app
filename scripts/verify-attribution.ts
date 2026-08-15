/**
 * Assertions over URL attribution parsing. `npm run verify:attribution`.
 *
 * The invariants that matter here are about honesty rather than correctness:
 * the failure mode is not a crash, it is a number in a report that reads as a
 * finding when it was actually a default.
 */

import { parseAttribution, attributionFromLegacySource } from "../src/lib/attribution";

let failures = 0;
const T = 1_700_000_000_000;

function check(name: string, cond: boolean, detail?: string) {
  if (cond) console.log(`  ok   ${name}`);
  else {
    failures += 1;
    console.error(`  FAIL ${name}${detail ? `\n       ${detail}` : ""}`);
  }
}

console.log("\nattribution parsing\n");

// --- the job-post case, which is the reason this exists -------------------

const jobPost = parseAttribution("?src=fb&job=2026-08-14-nl-analyst", T);
check("a job post link resolves to the group channel", jobPost.channel === "fb_group_post");
check(
  "the job-log id is carried as the campaign",
  jobPost.campaign === "2026-08-14-nl-analyst",
  "This is the join that makes 'which posts bring leads' answerable at all.",
);
check("the original parameter is kept verbatim", jobPost.raw === "fb");

// --- spellings a human actually types ------------------------------------

for (const [q, expected] of [
  ["?src=facebook", "fb_group_post"],
  ["?src=FB", "fb_group_post"],
  ["?src=Pinned", "fb_pinned_post"],
  ["?utm_source=line", "line_oa"],
  ["?source=ref", "referral"],
] as const) {
  check(`${q} → ${expected}`, parseAttribution(q, T).channel === expected);
}

// --- the honesty invariants ----------------------------------------------

const unknown = parseAttribution("?src=tiktok", T);
check("an unrecognised source becomes other, not direct", unknown.channel === "other");
check(
  "and keeps its text so the channel is recoverable later",
  unknown.raw === "tiktok",
  "Collapsing an unknown channel into direct would silently inflate organic traffic.",
);

const bare = parseAttribution("", T);
check("no parameters is direct", bare.channel === "direct");
check(
  "a direct visit carries NO raw, which is how it is told from a stripped link",
  bare.raw === undefined,
  "direct with no raw is an assumption; direct with a raw would be an observation.",
);

const campaignOnly = parseAttribution("?job=2026-08-01-de-pm", T);
check(
  "a job id with no source still attributes to a job post",
  campaignOnly.channel === "fb_group_post" && campaignOnly.campaign === "2026-08-01-de-pm",
  "A job id only ever appears on a job post link.",
);

// --- the legacy backfill, where the real trap is -------------------------

check(
  "legacy 'direct' converts to NOTHING",
  attributionFromLegacySource("direct", T) === null,
  "The client sent 'direct' unconditionally. Writing it as attribution would launder a hardcoded value into a finding.",
);
check(
  "legacy 'survey_import' converts to nothing",
  attributionFromLegacySource("survey_import", T) === null,
);
check("an absent legacy source converts to nothing", attributionFromLegacySource(undefined, T) === null);
check(
  "a real legacy value does convert",
  attributionFromLegacySource("fb_pinned_post", T)?.channel === "fb_pinned_post",
);

// --- input hardening ------------------------------------------------------

const long = parseAttribution(`?src=${"x".repeat(500)}&job=${"y".repeat(500)}`, T);
check("an oversized source is truncated", (long.raw ?? "").length <= 80);
check("an oversized campaign is truncated", (long.campaign ?? "").length <= 80);
check("an oversized unknown source still becomes other", long.channel === "other");

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.\n`);
  process.exit(1);
}
console.log("\nAll attribution invariants hold.\n");
