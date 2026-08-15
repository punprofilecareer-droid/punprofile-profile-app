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
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from "../src/lib/content/privacy.js";
import { STAGE1 } from "../src/lib/content/questions.js";
import { MOVES } from "../src/lib/levers.js";
import { DIMENSIONS } from "../src/lib/model.js";
import { assertCandidateSafe } from "../src/lib/views.js";
import { DESTINATIONS } from "../src/lib/content/cta.js";
import { lintThai, type LintTarget } from "./lint-thai.js";
import { readSource, hashOf } from "./sync-termbase.js";
import { TERMBASE } from "../src/lib/content/termbase.generated.js";

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

// 2. Em dashes: no longer checked here, narrowed 15/08/2026.
//
// The house rule was a blanket ban and this enforced it over the questionnaire,
// the copy module and the privacy notice. It now covers only what PunProfile
// SAYS to someone, chat and LINE, email and social posts, none of which this
// script sees. The app's own copy is product and may use them.
//
// The ban still binds where those messages are written: the `daily-jobs` and
// `candidate-pitch` skills, and the message templates in
// `consultation-booking.md`. Nothing automated checks those, which is worth
// knowing rather than assuming.

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
    if (key.startsWith("item.")) continue;
    if (key.startsWith("gate.error.")) continue;
    // Journey step labels are looked up as `step.${itemKey}` from the STEPS
    // table, so a literal source scan cannot see them.
    if (key.startsWith("step.")) continue;
    if (/^narrative\.(opener|standing)\./.test(key)) continue;
    fail(`${key}: defined but never used`);
  }
}

// 4a-quater. Every journey step needs a label, or the checklist renders a row
// with no name on it.
{
  const views = readFileSync("src/lib/views.ts", "utf8");
  const table = views.match(/const STEPS[\s\S]*?\n\];/)?.[0] ?? "";
  for (const m of table.matchAll(/itemKey: "([a-zA-Z]+)"/g)) {
    if (!(`step.${m[1]}` in ALL)) fail(`step.${m[1]}: in the STEPS table but has no label`);
  }
}

// 4a-bis. Every error code the server can throw must have candidate-facing
// copy. `captureContact` throws stable codes precisely so the wording is
// translatable; a code with no key would surface as a raw identifier.
{
  const server = readFileSync("convex/leads.ts", "utf8");
  for (const m of server.matchAll(/new ConvexError\("([a-z_]+)"\)/g)) {
    if (!(`gate.error.${m[1]}` in ALL)) {
      fail(`gate.error.${m[1]}: thrown by convex/leads.ts but has no copy`);
    }
  }
}

// 4a. Every competency a candidate can be shown by name needs a candidate-facing
// name. Without one the model's English label drops into the middle of a Thai
// sentence, which is how "จุดแข็งที่สุดของคุณคือ Language Readiness" happens.
for (const d of DIMENSIONS) {
  for (const item of d.items) {
    if (item.tier === "coach") continue; // never named to a candidate
    if (!(`item.${item.key}` in ALL)) fail(`item.${item.key}: scoreable but has no candidate-facing name`);
  }
}

// 4a-ter. No two consent strings may be identical. PDPA consent has to be
// specific to the channel it grants, so a LINE checkbox carrying the phone
// sentence is not a typo, it is consent that does not cover what it collects.
// Duplication here is almost always a copy-paste that survived review.
{
  const consent = Object.entries(ALL).filter(([k]) => k.startsWith("consent."));
  for (const lang of ["en", "th"] as const) {
    const seen = new Map<string, string>();
    for (const [key, entry] of consent) {
      const text = entry[lang].trim();
      if (!text) continue;
      const first = seen.get(text);
      if (first) fail(`${key}.${lang} is identical to ${first}.${lang}`);
      else seen.set(text, key);
    }
  }
}

// 4d. The privacy notice, held to the same rules as everything else. It is
// long-form prose in its own module rather than keyed strings, so none of the
// checks above reach it, and it is the one candidate-facing surface where an
// untranslated paragraph reads as evasion rather than as a to-do.
{
  const paras = [
    { where: "intro", copy: PRIVACY_INTRO },
    ...PRIVACY_SECTIONS.flatMap((sec, i) => [
      { where: `section ${i + 1} heading`, copy: sec.heading },
      ...sec.body.map((b, j) => ({ where: `section ${i + 1} para ${j + 1}`, copy: b })),
    ]),
  ];
  for (const { where, copy } of paras) {
    if (!copy.en.trim()) fail(`privacy ${where}: no English`);
    if (!copy.th.trim()) fail(`privacy ${where}: no Thai`);
    // A list marker that survives in one language and not the other renders as
    // a bullet in Thai and a sentence in English, or the reverse.
    if (copy.en.startsWith("- ") !== copy.th.startsWith("- ")) {
      fail(`privacy ${where}: list marker present in one language only`);
    }
  }
  // Unresolved placeholders are allowed, but they must be visible in the run
  // rather than discovered by a candidate.
  const todos = paras.filter((p) => /TODO/.test(p.copy.en) || /TODO/.test(p.copy.th));
  if (todos.length) {
    console.log(`\nPrivacy notice has ${todos.length} unresolved placeholder(s):`);
    for (const t of todos) console.log(`  ${t.where}`);
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

// 4e. The termbase, and the Thai rules that hang off it.
//
// Until 15/08/2026 this file checked everything about a Thai string except
// whether the Thai was any good: em dashes, placeholders, dead keys, all of it
// language-blind. The rules existed, in prose, in the coaching repo, enforced by
// a model reading a checklist about work it had just written. LR-08 is here
// because three different wordings of one button survived that arrangement.
{
  // The generated termbase must match the YAML it came from. A stale copy is a
  // rule that silently stopped being enforced, which is worse than no rule.
  const { yaml, missing } = readSource();
  if (missing) {
    console.log(
      "\nNote: the coaching repo is not beside this one, so the termbase could not be" +
        "\nchecked for staleness. The generated copy was still used.",
    );
  } else if (hashOf(yaml) !== TERMBASE.sourceHash) {
    fail("termbase.generated.ts is stale. Run: npx tsx scripts/sync-termbase.ts");
  }

  /**
   * Strings whose wording was decided and must not be paraphrased. The binding
   * is explicit rather than inferred from the English, because the drift LR-08
   * was written from had different English on both sides too.
   */
  const BINDINGS: Record<string, string> = {
    "nav.brand": "brand-name",
    "nav.assess": "product-eu-fit-check",
    "nav.coaching": "coaching-1-1",
    "nav.services": "our-services",
    "footer.brand": "footer-legal",
    "cta.assess": "cta-start-assessment",
    "cta.contact": "contact-talk-to-me",
  };

  // Consent, errors and the privacy notice are `system`: plain before they are
  // warm, and not subject to the voice rules that govern a landing page.
  const surfaceOf = (key: string): LintTarget["surface"] =>
    /^(consent\.|gate\.error\.)/.test(key) ? "system" : "app";

  const targets: LintTarget[] = [
    ...Object.entries(ALL).map(([key, e]) => ({
      id: key,
      th: e.th,
      en: e.en,
      surface: surfaceOf(key),
      binding: BINDINGS[key],
    })),
    // The action labels. `cta.ts` owns every button on every page and is where
    // the landing CTA actually comes from, so a check that skipped it would miss
    // the one string this rule exists for.
    ...Object.entries(DESTINATIONS).map(([id, d]) => ({
      id: `cta.${id}`,
      th: d.label.th,
      en: d.label.en,
      surface: "app" as const,
      binding: BINDINGS[`cta.${id}`],
    })),
    // LR-02: these two option sets are data, not interface. Their values stay
    // English so they are comparable across candidates and matchable against a
    // posting. `not_sure` is the exception in both, because "still deciding" is
    // a meta-answer rather than a country or a role.
    ...STAGE1.flatMap((q) => {
      const isValueSet = q.key === "targetCountries" || q.key === "targetRole";
      return [
        { id: `question ${q.key}`, th: q.th, en: q.en, surface: "survey" as const },
        ...q.options.map((o) => ({
          id: `option ${q.key}/${o.value}`,
          th: o.th,
          en: o.en,
          surface:
            isValueSet && o.value !== "not_sure" && o.value !== "other"
              ? ("value" as const)
              : ("survey" as const),
        })),
      ];
    }),
    ...PRIVACY_SECTIONS.flatMap((sec, i) => [
      { id: `privacy ${i + 1} heading`, th: sec.heading.th, en: sec.heading.en, surface: "system" as const },
      ...sec.body.map((b, j) => ({
        id: `privacy ${i + 1}.${j + 1}`,
        th: b.th,
        en: b.en,
        surface: "system" as const,
      })),
    ]),
    { id: "privacy intro", th: PRIVACY_INTRO.th, en: PRIVACY_INTRO.en, surface: "system" as const },
  ];

  const findings = lintThai(targets);
  for (const f of findings.filter((f) => f.level === "fail")) {
    fail(`[${f.rule}] ${f.target}: ${f.message}`);
  }
  const open = findings.filter((f) => f.level === "warn");
  if (open.length) {
    console.log(`\n${open.length} language decision(s) waiting on Paul:`);
    for (const f of open) console.log(`  [${f.rule}] ${f.target}: ${f.message}`);
  }
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
  `copy OK: ${Object.keys(ALL).length} keys, all used, all with English, placeholders intact`,
);
if (missing.length || questionsMissing.length) {
  console.log(`\n${missing.length + questionsMissing.length} still need Thai:`);
  for (const [key] of missing) console.log(`  ${key}`);
  for (const q of questionsMissing) console.log(`  ${q}`);
  console.log("\nRun: npx tsx scripts/export-copy-worksheet.ts");
} else {
  console.log("\nEvery string has Thai.");
}
