/**
 * Copy invariants. Run after touching copy.ts, consent-copy.ts, or any surface
 * that renders them:
 *
 *   npx tsx scripts/verify-copy.ts
 *
 * Follows `verify-content.ts`: the failure mode it guards is a string that
 * silently renders in the wrong language, or an English literal creeping back
 * into a candidate-facing file where no translation can ever reach it.
 *
 * Missing Thai is reported, not failed. It is a to-do list, and the whole point
 * of the English fallback is that the app ships while it is being worked
 * through.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { COPY } from "../src/lib/content/copy.js";
import { NARRATIVE_COPY } from "../src/lib/content/narrative-copy.js";
import { CONSENT_COPY } from "../src/lib/consent-copy.js";
import { STAGE1 } from "../src/lib/content/questions.js";
import { MOVES } from "../src/lib/levers.js";
import { assertCandidateSafe } from "../src/lib/views.js";

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error("FAIL " + msg);
};

const ALL = {
  ...COPY,
  ...NARRATIVE_COPY,
  ...CONSENT_COPY,
  ...Object.fromEntries(
    MOVES.map((m) => [
      `move.${m.key}`,
      { screen: `Next-step card for ${m.itemKey}`, en: m.candidate.en, th: m.candidate.th },
    ]),
  ),
} as Record<string, { en: string; th: string; screen: string }>;

// 1. Every key must have English. Without it the fallback has nothing to fall
// back to and the UI renders empty.
for (const [key, entry] of Object.entries(ALL)) {
  if (!entry.en.trim()) fail(`${key}: no English`);
  if (!entry.screen.trim()) fail(`${key}: no screen note, the worksheet needs it`);
}

// 2. No em dashes in user-facing copy (house rule). Code comments are exempt,
// this is not a comment.
for (const [key, entry] of Object.entries(ALL)) {
  for (const lang of ["en", "th"] as const) {
    if (entry[lang].includes("—")) fail(`${key}.${lang}: em dash in user-facing copy`);
  }
}
for (const q of STAGE1) {
  for (const lang of ["en", "th"] as const) {
    if (q[lang].includes("—")) fail(`question ${q.key}.${lang}: em dash`);
    for (const o of q.options) {
      if (o[lang].includes("—")) fail(`option ${q.key}/${o.value}.${lang}: em dash`);
    }
  }
}

// 3. Placeholders must survive translation. A Thai string that drops {step}
// renders a counter with no numbers in it.
for (const [key, entry] of Object.entries(ALL)) {
  const placeholders = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort().join(",");
  if (entry.th && placeholders(entry.en) !== placeholders(entry.th)) {
    fail(`${key}: Thai does not carry the same {placeholders} as English`);
  }
}

// 4. Every key defined is used, and every key used is defined. A dead key is a
// string the founder translates for nothing; an undefined one is a crash.
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}
const sources = walk("src")
  .filter((p) => !p.endsWith("content/copy.ts") && !p.endsWith("consent-copy.ts"))
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

for (const key of Object.keys(ALL)) {
  if (!sources.includes(`"${key}"`)) {
    // Consent copy is defined ahead of the screen that renders it (TASK-027).
    if (key.startsWith("consent.")) continue;
    // Move and narrative-band keys are selected at runtime by score, not
    // referenced literally, so a source scan cannot see them.
    if (key.startsWith("move.")) continue;
    if (/^narrative\.(opener|standing)\./.test(key)) continue;
    fail(`${key}: defined but never used`);
  }
}

// 4b. Every branch the engine can select must exist, or a real candidate hits
// an undefined key at render.
for (const p of ["job_first", "study_first", "family", "not_sure"]) {
  if (!(`narrative.opener.${p}` in ALL)) fail(`no opener for pathway "${p}"`);
}
for (const b of ["advantage", "strong", "typical", "developing", "earliest"]) {
  if (!(`narrative.standing.${b}` in ALL)) fail(`no standing line for band "${b}"`);
}

// 4c. Candidate-facing copy must not carry internal vocabulary. The same check
// `views.ts` runs on rendered output, applied to the source strings so a slip
// is caught when it is written rather than when someone reads it.
for (const [key, entry] of Object.entries(ALL)) {
  const leaks = assertCandidateSafe(`${entry.en} ${entry.th}`);
  if (leaks.length) fail(`${key}: internal vocabulary (${leaks.join(", ")})`);
}
for (const used of sources.matchAll(/\bt\(\s*"([a-z][a-zA-Z.]+)"/g)) {
  if (!(used[1] in ALL)) fail(`${used[1]}: used in code but not defined`);
}

// 5. Report what is left. Not a failure.
const missing = Object.entries(ALL).filter(([, e]) => !e.th);
const questionsMissing = STAGE1.flatMap((q) => [
  ...(q.th ? [] : [`question ${q.key}`]),
  ...q.options.filter((o) => !o.th).map((o) => `option ${q.key}/${o.value}`),
]);

if (failures) {
  console.error(`\n${failures} failures`);
  process.exit(1);
}

console.log(
  `copy OK: ${Object.keys(ALL).length} keys, all used, all with English, no em dashes, placeholders intact`,
);
if (missing.length || questionsMissing.length) {
  console.log(`\n${missing.length + questionsMissing.length} still need Thai:`);
  for (const [key] of missing) console.log(`  ${key}`);
  for (const q of questionsMissing) console.log(`  ${q}`);
  console.log("\nRun: npx tsx scripts/export-copy-worksheet.ts");
} else {
  console.log("\nEvery string has Thai.");
}
