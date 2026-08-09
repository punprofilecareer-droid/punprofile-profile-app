/**
 * Reads the filled worksheet back into `copy.ts` and `consent-copy.ts`.
 *
 *   npx tsx scripts/import-copy-worksheet.ts [worksheet.md] [--dry]
 *
 * The point is that Thai never gets retyped. A transcription slip in a script
 * nobody in the loop reads is invisible until a candidate sees it, so the
 * founder's bytes go in verbatim or not at all.
 *
 * It only ever rewrites the `th:` line of a key that already exists in the
 * source file, and it refuses anything it cannot place. It will not add keys,
 * reorder them, touch `en`, or edit a comment.
 */

import { readFileSync, writeFileSync } from "node:fs";

const IN =
  process.argv.find((a) => a.endsWith(".md")) ??
  "../punprofile-career-coaching/punprofile-context/ctxt-product/copy-worksheet.md";
const DRY = process.argv.includes("--dry");

const TARGETS = [
  { file: "src/lib/content/copy.ts", label: "app copy" },
  { file: "src/lib/consent-copy.ts", label: "consent copy" },
];

// ### `key`  ...  > **TH:** value
const BLOCK = /^### `([^`]+)`$/;
const TH = /^> \*\*TH:\*\* ?(.*)$/;

const worksheet = readFileSync(IN, "utf8").split(/\r?\n/);

const supplied = new Map<string, string>();
let current: string | null = null;
for (const line of worksheet) {
  const k = line.match(BLOCK);
  if (k) {
    current = k[1];
    continue;
  }
  const th = line.match(TH);
  if (th && current) {
    const value = th[1].trim();
    // TODO is the export's placeholder for "not supplied yet", not a string.
    if (value && value !== "TODO") supplied.set(current, value);
    current = null;
  }
}

console.log(`worksheet: ${supplied.size} keys carry Thai`);

const unplaced = new Set(supplied.keys());
let written = 0;

for (const target of TARGETS) {
  const src = readFileSync(target.file, "utf8");
  const lines = src.split(/\r?\n/);
  let key: string | null = null;
  let changed = 0;

  for (let i = 0; i < lines.length; i++) {
    const entry = lines[i].match(/^\s*"([^"]+)": \{$/);
    if (entry) {
      key = entry[1];
      continue;
    }
    if (!key) continue;

    const th = lines[i].match(/^(\s*)th: (".*"|"")(,?)$/);
    if (th) {
      const value = supplied.get(key);
      if (value !== undefined) {
        unplaced.delete(key);
        const next = `${th[1]}th: ${JSON.stringify(value)}${th[3]}`;
        if (next !== lines[i]) {
          lines[i] = next;
          changed++;
        }
      }
      key = null;
    }
  }

  if (changed && !DRY) writeFileSync(target.file, lines.join("\n"));
  written += changed;
  console.log(`${target.label}: ${changed} updated${DRY ? " (dry run)" : ""}`);
}

if (unplaced.size) {
  console.error(
    `\nFAIL ${unplaced.size} key(s) in the worksheet match nothing in the source:\n  ` +
      [...unplaced].join("\n  ") +
      "\nRegenerate the worksheet, then reapply your edits to the new one.",
  );
  process.exit(1);
}

console.log(`\n${written} string(s) ${DRY ? "would be" : ""} written.`);
if (!DRY && written) console.log("Run: npx tsx scripts/verify-copy.ts");
