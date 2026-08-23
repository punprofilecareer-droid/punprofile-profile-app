/**
 * The Thai review queue, as one file you can read in Obsidian.
 *
 *   npm run review:thai            # -> the coaching repo's work folder
 *   npm run review:thai -- out.md
 *
 * **Why this exists.** The copy worksheet marks a string `TODO` when its Thai is
 * MISSING, which the app already surfaces because it falls back to English at
 * render. It has nothing to say about the other case: Thai that exists, renders,
 * looks finished, and has never been read by Paul. That Thai is the dangerous
 * kind, because nothing about it looks wrong.
 *
 * The convention for it is a `TH-UNREVIEWED` comment above the string, in use
 * since 16/08/2026. Until now the only way to act on one was to grep the code
 * and read line numbers, which is not a review anyone does. This turns the
 * convention into a queue: every unreviewed string, its English, its Thai, and
 * where it appears, in reading order, with a checkbox.
 *
 * **It covers the per-page content modules too**, which the worksheet does not.
 * `home.ts`, `footer.ts` and `services.ts` all carry unreviewed Thai and none of
 * it can reach the worksheet, because the worksheet round-trips into `copy.ts`
 * and those modules are not part of that trip. Read-only is the trade: this file
 * is a queue, not an editor. Where a string can be fixed through the worksheet
 * it says so, and where it has to be changed in code it says that instead.
 *
 * Nothing here writes to source. Regenerate it whenever, it is disposable.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { checkOverwrite, stamp } from "./lib/review-guard.js";
import { COPY } from "../src/lib/content/copy.js";
import { NARRATIVE_COPY } from "../src/lib/content/narrative-copy.js";
import { CONSENT_COPY } from "../src/lib/consent-copy.js";
import { MOVES } from "../src/lib/levers.js";
import * as coaching from "../src/lib/content/coaching.js";
import * as services from "../src/lib/content/services.js";
import * as faq from "../src/lib/content/faq.js";
import * as footer from "../src/lib/content/footer.js";
import * as home from "../src/lib/content/home.js";
import * as pricing from "../src/lib/content/pricing.js";
import * as products from "../src/lib/content/products.js";

interface Row {
  /** Dotted path, e.g. `copy.ts › report.footer` or `services.ts › SERVICES[0].includes[4]`. */
  id: string;
  file: string;
  en: string;
  th: string;
  /** Where it appears on screen, when the bank records one. */
  screen?: string;
  /** True when the worksheet round-trip can carry the fix back into the code. */
  viaWorksheet: boolean;
}

const isCopy = (v: unknown): v is { en: string; th: string; screen?: string } =>
  !!v &&
  typeof v === "object" &&
  typeof (v as { en?: unknown }).en === "string" &&
  typeof (v as { th?: unknown }).th === "string";

/**
 * Every `{ en, th }` in a module, at any depth.
 *
 * An array item is tested for being a pair BEFORE it is recursed into. Skipping
 * that test is what makes a `readonly Copy[]` invisible to a walker, and most of
 * the strings on the coaching and FAQ pages live in exactly that shape.
 */
function harvest(node: Record<string, unknown>, file: string, viaWorksheet: boolean, path = ""): Row[] {
  const out: Row[] = [];
  for (const [key, value] of Object.entries(node)) {
    const id = `${path}${key}`;
    if (isCopy(value)) {
      out.push({ id, file, en: value.en, th: value.th, screen: value.screen, viaWorksheet });
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (isCopy(item)) {
          out.push({ id: `${id}[${i}]`, file, en: item.en, th: item.th, screen: item.screen, viaWorksheet });
        } else if (item && typeof item === "object") {
          out.push(...harvest(item as Record<string, unknown>, file, viaWorksheet, `${id}[${i}].`));
        }
      });
    } else if (value && typeof value === "object") {
      out.push(...harvest(value as Record<string, unknown>, file, viaWorksheet, `${id}.`));
    }
  }
  return out;
}

const ALL: Row[] = [
  ...harvest(COPY as Record<string, unknown>, "copy.ts", true),
  ...harvest(NARRATIVE_COPY as Record<string, unknown>, "narrative-copy.ts", true),
  ...harvest(CONSENT_COPY as Record<string, unknown>, "consent-copy.ts", true),
  ...MOVES.map((m) => ({
    id: `move.${m.key}`,
    file: "levers.ts",
    en: m.candidate.en,
    th: m.candidate.th,
    screen: `Next-step card, shown when the priority is "${m.itemKey}"`,
    viaWorksheet: true,
  })),
  ...harvest(coaching as unknown as Record<string, unknown>, "coaching.ts", false),
  ...harvest(services as unknown as Record<string, unknown>, "services.ts", false),
  ...harvest(faq as unknown as Record<string, unknown>, "faq.ts", false),
  ...harvest(footer as unknown as Record<string, unknown>, "footer.ts", false),
  ...harvest(home as unknown as Record<string, unknown>, "home.ts", false),
  // Added 23/08/2026 with the pages themselves. This queue is the single place
  // unreviewed Thai is meant to surface, and the 32 strings these two modules
  // carry were invisible to it until they were listed here.
  ...harvest(pricing as unknown as Record<string, unknown>, "pricing.ts", false),
  ...harvest(products as unknown as Record<string, unknown>, "products.ts", false),
];

/**
 * The Thai strings sitting under a `TH-UNREVIEWED` comment, read out of the
 * source rather than the runtime.
 *
 * Matched by taking the first `th:` literal AFTER each marker and then looking
 * that value up in the harvested data. Matching on the value rather than parsing
 * the surrounding syntax is deliberate: these are whole sentences and collide
 * with nothing, and a value match keeps working through array items, nested
 * objects and any other shape somebody writes next, none of which a hand-rolled
 * parser would survive.
 *
 * A marker whose string cannot be resolved is REPORTED rather than dropped. A
 * review queue that quietly loses an item is worse than no queue, because it is
 * believed.
 */
const SOURCES = [
  "src/lib/content/copy.ts",
  "src/lib/content/narrative-copy.ts",
  "src/lib/consent-copy.ts",
  "src/lib/levers.ts",
  "src/lib/content/coaching.ts",
  "src/lib/content/services.ts",
  "src/lib/content/faq.ts",
  "src/lib/content/footer.ts",
  "src/lib/content/home.ts",
  // Added 23/08/2026, alongside the ALL entries above. The harvest list and this
  // list have to move together: a module in one and not the other is a module
  // whose markers are silently dropped, which is the exact failure this file's
  // header warns about.
  "src/lib/content/pricing.ts",
  "src/lib/content/products.ts",
];

const unreviewedThai = new Set<string>();
const unresolved: string[] = [];

for (const path of SOURCES) {
  let src: string;
  try {
    src = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes("TH-UNREVIEWED")) continue;
    // A marker inside backticks is the convention being DISCUSSED, not applied.
    // Both `copy.ts` and `home.ts` explain what the marker means in their file
    // headers, and both were reported as unresolved markers with no string under
    // them, which is accurate and useless: the noise would have been permanent,
    // and a report with two permanent false entries is one nobody finishes
    // reading. Added 17/08/2026, when the last real marker was cleared and the
    // only two left were these.
    if (/`TH-UNREVIEWED`/.test(lines[i])) continue;
    let found = false;
    // Ten lines is past the longest comment tail in these files and short enough
    // that a marker in a file-level doc comment cannot reach a random string.
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      const m = lines[j].match(/^\s*th:\s*"((?:[^"\\]|\\.)*)"/);
      if (m) {
        unreviewedThai.add(m[1].replace(/\\"/g, '"'));
        found = true;
        break;
      }
    }
    if (!found) unresolved.push(`${path}:${i + 1}`);
  }
}

const unreviewed = ALL.filter((r) => r.th && unreviewedThai.has(r.th));
const missing = ALL.filter((r) => !r.th);

// Every marker should land on exactly one harvested string. Fewer means a Thai
// literal the walker never saw, which is the silent-loss case above.
const matched = new Set(unreviewed.map((r) => r.th));
const unmatchedValues = [...unreviewedThai].filter((t) => !matched.has(t));

// Flags filtered out, or `--force` becomes the output path and the script
// cheerfully writes a file called "--force" into the repo root.
const OUT =
  process.argv.slice(2).find((a) => !a.startsWith("-")) ??
  "../punprofile-career-coaching/punprofile-work/work-projects/eu-fit-check/thai-review-queue.md";

const entry = (r: Row, n: number) =>
  [
    `### ${n}. \`${r.id}\``,
    "",
    `*${r.screen ?? "No screen note recorded"}* · \`${r.file}\``,
    "",
    `> **EN** ${r.en}`,
    ">",
    `> **TH** ${r.th || "*(none yet, renders the English)*"}`,
    "",
    "แก้เป็น:",
    "",
    r.viaWorksheet
      ? "Fix through the copy worksheet."
      : "**Not in the worksheet.** Page-module string, so it changes in code.",
    "",
  ].join("\n");

const checklist = (rows: Row[]) =>
  rows.map((r, i) => `- [ ] **${i + 1}.** ${r.id} — ${(r.screen ?? r.en).slice(0, 70)}`).join("\n");

const doc = `---
status: generated, disposable
name: Thai review queue
description: >
  Every Thai string in the app that you have not read back yet, plus every one
  that has no Thai at all. Generated by scripts/export-thai-review.ts.
---

# Thai review queue

**${unreviewed.length} strings are live in the app with Thai you have never
read.** They render, they look finished, and nothing on screen marks them. That
is what this file is for.

A second list at the bottom holds the ${missing.length} strings with no Thai at
all. Those are the safe kind: they fall back to English, so a reader sees English
rather than something wrong.

**How to use this.** Read the Thai under each number. If it is right, tick the
box. If it is wrong, write your version after the \`แก้เป็น:\` line under it,
the same way the page review sheet works. \`PB:\` anywhere is a note to whoever
reads this next.

Nothing here writes to the code by itself. Regenerating this file REFUSES to run
while a filled \`แก้เป็น:\` or a \`PB:\` line is still in it, so your words cannot
be overwritten before they are applied.

Where a string says "Fix through the copy worksheet", the correction can be
round-tripped with \`import-copy-worksheet.ts\`. Where it says the string is not
in the worksheet, it lives in a per-page module and has to be changed in code.

---

## Not yet read back by you (${unreviewed.length})

${checklist(unreviewed)}

---

${unreviewed.map((r, i) => entry(r, i + 1)).join("\n")}
---

## No Thai at all (${missing.length})

${missing.length === 0 ? "None. Every string has Thai.\n" : checklist(missing)}
${missing.length ? "\n---\n\n" + missing.map((r, i) => entry(r, i + 1)).join("\n") : ""}
${
  unresolved.length || unmatchedValues.length
    ? `---

## Markers this script could not resolve

Reported rather than dropped, because a queue that loses an item silently is
worse than no queue.

${unresolved.map((u) => `- \`${u}\` — no \`th:\` line within ten lines of the marker`).join("\n")}
${unmatchedValues.map((v) => `- a marked Thai string not found in any exported value: \`${v.slice(0, 60)}\``).join("\n")}
`
    : ""
}`;


const force = process.argv.includes("--force");
const guard = force ? { safe: true, reasons: [] } : checkOverwrite(OUT);
if (!guard.safe) {
  console.error(`\n${OUT}\n`);
  for (const line of guard.reasons) console.error(line);
  console.error("");
  process.exit(1);
}

writeFileSync(OUT, stamp(doc));
console.log(`wrote ${OUT}`);
console.log(`${unreviewed.length} unreviewed, ${missing.length} with no Thai, across ${ALL.length} strings`);
if (unresolved.length || unmatchedValues.length) {
  console.log(`${unresolved.length + unmatchedValues.length} marker(s) unresolved, listed in the file`);
}
