/**
 * Reads the filled worksheet back into the copy modules.
 *
 *   npx tsx scripts/import-copy-worksheet.ts [worksheet.md] [--dry]
 *
 * The point is that copy never gets retyped. A transcription slip in a script
 * nobody in the loop reads is invisible until a candidate sees it, so the
 * founder's bytes go in verbatim or not at all.
 *
 * Reads BOTH languages. The founder edits English as readily as Thai, and an
 * importer that only carried Thai back would silently discard half the review.
 *
 * It only ever rewrites the `en:` and `th:` lines of a key that already exists
 * in the source, and refuses anything it cannot place. It will not add keys,
 * reorder them, or edit a comment.
 */

import { readFileSync, writeFileSync } from "node:fs";

const IN =
  process.argv.find((a) => a.endsWith(".md")) ??
  "../punprofile-career-coaching/punprofile-context/ctxt-product/copy-worksheet.md";
const DRY = process.argv.includes("--dry");

const TARGETS = [
  { file: "src/lib/content/copy.ts", label: "app copy" },
  { file: "src/lib/content/narrative-copy.ts", label: "result summary" },
  { file: "src/lib/consent-copy.ts", label: "consent copy" },
];

const BLOCK = /^### `([^`]+)`$/;
// The leading "> " is optional. The export writes it, but editing a long Thai
// line in a wrapping editor drops it easily, and losing a founder's copy to a
// missing blockquote marker is a tooling failure, not their mistake.
const EN = /^\s*>?\s*\*\*EN:\*\* ?(.*)$/;
const TH = /^\s*>?\s*\*\*TH:\*\* ?(.*)$/;

/** The export's marker for "no Thai yet". Never a real string. */
const TODO = "TODO";

interface Pair {
  en?: string;
  th?: string;
}

const supplied = new Map<string, Pair>();
{
  let key: string | null = null;
  for (const line of readFileSync(IN, "utf8").split(/\r?\n/)) {
    const k = line.match(BLOCK);
    if (k) {
      key = k[1];
      supplied.set(key, {});
      continue;
    }
    if (!key) continue;
    const en = line.match(EN);
    if (en) {
      supplied.get(key)!.en = en[1].trim();
      continue;
    }
    const th = line.match(TH);
    if (th) {
      const v = th[1].trim();
      if (v && v !== TODO) supplied.get(key)!.th = v;
      key = null; // TH closes the block
    }
  }
}

console.log(
  `worksheet: ${supplied.size} keys, ${[...supplied.values()].filter((p) => p.th).length} carry Thai`,
);

const unplaced = new Set(supplied.keys());
let written = 0;

/** Rewrite `en:` / `th:` inside a `"key": { ... }` block. */
function applyKeyed(file: string, label: string) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  let key: string | null = null;
  let changed = 0;

  for (let i = 0; i < lines.length; i++) {
    const entry = lines[i].match(/^\s*"([^"]+)": \{$/);
    if (entry) {
      key = entry[1];
      continue;
    }
    if (!key) continue;

    for (const lang of ["en", "th"] as const) {
      // Re-serialised through JSON.stringify, so a value containing a quote or
      // a backslash cannot break the file, whichever quote style it had before.
      const m = lines[i].match(new RegExp(`^(\\s*)${lang}: (.*?)(,?)$`));
      if (!m) continue;
      const value = supplied.get(key)?.[lang];
      if (value === undefined) continue;
      unplaced.delete(key);
      const next = `${m[1]}${lang}: ${JSON.stringify(value)}${m[3]}`;
      if (next !== lines[i]) {
        lines[i] = next;
        changed++;
      }
    }
    if (/^\s*\},?$/.test(lines[i])) key = null;
  }

  if (changed && !DRY) writeFileSync(file, lines.join("\n"));
  written += changed;
  console.log(`${label}: ${changed} updated${DRY ? " (dry run)" : ""}`);
}

for (const t of TARGETS) applyKeyed(t.file, t.label);

// The lever actions are data in `levers.ts`, not keyed copy, so they need their
// own pass: find `key: "x"`, then rewrite that move's one-line `candidate` pair.
{
  const file = "src/lib/levers.ts";
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  let moveKey: string | null = null;
  let changed = 0;

  for (let i = 0; i < lines.length; i++) {
    const k = lines[i].match(/^\s*key: "([^"]+)",$/);
    if (k) {
      moveKey = k[1];
      continue;
    }
    if (!moveKey) continue;

    const c = lines[i].match(/^(\s*candidate: \{ en: )(".*?")(, th: )(".*?")( \},)$/);
    if (c) {
      const pair = supplied.get(`move.${moveKey}`);
      if (pair) {
        unplaced.delete(`move.${moveKey}`);
        const en = pair.en !== undefined ? JSON.stringify(pair.en) : c[2];
        const th = pair.th !== undefined ? JSON.stringify(pair.th) : c[4];
        const next = `${c[1]}${en}${c[3]}${th}${c[5]}`;
        if (next !== lines[i]) {
          lines[i] = next;
          changed++;
        }
      }
      moveKey = null;
    }
  }

  if (changed && !DRY) writeFileSync(file, lines.join("\n"));
  written += changed;
  console.log(`next-step actions: ${changed} updated${DRY ? " (dry run)" : ""}`);
}

if (unplaced.size) {
  console.error(
    `\nFAIL ${unplaced.size} key(s) in the worksheet match nothing in the source:\n  ` +
      [...unplaced].join("\n  ") +
      "\nRegenerate the worksheet, then reapply your edits to the new one.",
  );
  process.exit(1);
}

console.log(`\n${written} line(s) ${DRY ? "would be" : ""} written.`);
if (!DRY && written) console.log("Run: npx tsx scripts/verify-copy.ts");
