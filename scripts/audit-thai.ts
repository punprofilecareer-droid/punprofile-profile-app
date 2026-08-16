/**
 * Audits every Thai string the app ships. `npm run audit:thai`.
 *
 * Answers one question: **which Thai has a candidate seen that Paul has never
 * read?** Everything else here is secondary.
 *
 * Written 15/08/2026 on his request to recheck all shipped Thai. The mechanical
 * rules were already enforced piecemeal, by `verify-copy.ts` for structure,
 * `lint-thai.ts` for banned terms on post-shaped files, and
 * `verify-thai-register.ts` for register. None of them asked who wrote it, and
 * that turns out to be the thing that matters: a string can pass every check
 * and still be a machine's guess at his voice.
 *
 * Provenance is read from each module's own header. A file claims Paul's Thai
 * or it does not; nothing is inferred from how good the Thai looks.
 *
 * **Per-string override, added 16/08/2026.** A header claim is made once and
 * the file keeps growing under it, so a string added today rode a sign-off
 * given in August and the audit printed "0 unreviewed" while twelve strings had
 * never been read. That is the exact failure this script exists to catch,
 * committed by the script itself.
 *
 * So: a `TH-UNREVIEWED` marker in the comment directly above an entry marks
 * that one string unread, whatever the header says. Remove the marker when he
 * has read it. The marker can only ever move a string from read to unread,
 * never the other way, so the worst a stale one does is ask for a second look.
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { TERMBASE } from "../src/lib/content/termbase.generated";
import { PROVENANCE } from "./lib/provenance";

const ROOT = resolve(import.meta.dirname, "..");
const THAI = /[฀-๿]/;

/** Where each module's strings are seen, which decides the register to expect. */
const SURFACE: Record<string, string> = {
  "questions.ts": "the assessment itself, every candidate, every question",
  "copy.ts": "app chrome: buttons, errors, labels, the result screen",
  "consent-copy.ts": "the contact step, and the PDPA record",
  "privacy.ts": "the privacy page",
  "faq.ts": "the FAQ page",
  "coaching.ts": "the coaching page",
  "services.ts": "the services page",
  "footer.ts": "every page",
  "cta.ts": "every call to action",
  "narrative-copy.ts": "the result screen commentary",
  "levers.ts": "the coach view, and the candidate journey",
};

type Row = {
  file: string;
  strings: number;
  paulsOwn: boolean;
  /** Strings marked `TH-UNREVIEWED` in a file that otherwise claims his Thai. */
  pending: number;
  banned: string[];
  emDash: number;
  thaiChars: number;
};

/** The marker that overrides a file's header claim for one entry. */
const MARKER = "TH-UNREVIEWED";

/**
 * Every Thai string, each with the source text between it and the previous one.
 *
 * The window is bounded by the previous match rather than a fixed lookback so a
 * marker can never leak onto the entry below it, which would understate what
 * has been read and is the one direction of error worth engineering against.
 */
function strings(src: string): { th: string; before: string }[] {
  const out: { th: string; before: string }[] = [];
  let cursor = 0;
  for (const m of src.matchAll(/th:\s*"([^"]+)"/g)) {
    const at = m.index ?? 0;
    if (THAI.test(m[1])) out.push({ th: m[1], before: src.slice(cursor, at) });
    cursor = at + m[0].length;
  }
  return out;
}

const files = readdirSync(resolve(ROOT, "src/lib/content"))
  .filter((f: string) => f.endsWith(".ts") && !f.includes("termbase.generated"))
  .map((f: string) => `src/lib/content/${f}`)
  .concat(["src/lib/consent-copy.ts", "src/lib/levers.ts"]);

const bannedForms = TERMBASE.terms.flatMap((t) => (t.banned ?? []) as string[]);

const rows: Row[] = [];
for (const rel of files) {
  let src: string;
  try {
    src = readFileSync(resolve(ROOT, rel), "utf8");
  } catch {
    continue;
  }
  const entries = strings(src);
  if (!entries.length) continue;
  const joined = entries.map((e) => e.th).join("\n");
  // Read from the whole header block, not the first few lines: the claim sits
  // deep in `consent-copy.ts` and a shallow read misses it.
  const paulsOwn = PROVENANCE.test(src.slice(0, 4000));
  const pending = entries.filter((e) => e.before.includes(MARKER)).length;
  rows.push({
    file: rel.split("/").pop()!,
    strings: entries.length,
    paulsOwn,
    pending: paulsOwn ? pending : 0,
    banned: bannedForms.filter((b) => joined.includes(b)),
    emDash: (joined.match(/—/g) ?? []).length,
    thaiChars: (joined.match(/[฀-๿]/g) ?? []).length,
  });
}

rows.sort((a, b) => Number(a.paulsOwn) - Number(b.paulsOwn) || b.strings - a.strings);

const unread = rows.filter((r) => !r.paulsOwn);
const pendingRows = rows.filter((r) => r.pending > 0);
const pendingTotal = rows.reduce((n, r) => n + r.pending, 0);
const readTotal =
  rows.filter((r) => r.paulsOwn).reduce((n, r) => n + r.strings, 0) - pendingTotal;
const unreadTotal = unread.reduce((n, r) => n + r.strings, 0) + pendingTotal;

console.log("\nShipped Thai, by whether Paul has read it\n");
console.log(
  `  ${unreadTotal} strings unreviewed, ${readTotal} confirmed his. ` +
    `${Math.round((unreadTotal / (unreadTotal + readTotal)) * 100)}% of shipped Thai has never been read back.\n`,
);

console.log("  NEEDS A PASS");
for (const r of unread) {
  console.log(
    `    ${String(r.strings).padStart(3)} strings, ${String(r.thaiChars).padStart(5)} chars  ${r.file.padEnd(19)} ${SURFACE[r.file] ?? ""}`,
  );
}
// Added since the file's own sign-off, so they sit here rather than under a
// claim that covers everything around them.
for (const r of pendingRows) {
  console.log(
    `    ${String(r.pending).padStart(3)} strings, added since sign-off   ${r.file.padEnd(19)} ${SURFACE[r.file] ?? ""}`,
  );
}
if (!unread.length && !pendingRows.length) console.log("    nothing.");

console.log("\n  ALREADY HIS");
for (const r of rows.filter((x) => x.paulsOwn)) {
  console.log(
    `    ${String(r.strings - r.pending).padStart(3)} strings, ${String(r.thaiChars).padStart(5)} chars  ${r.file.padEnd(19)} ${SURFACE[r.file] ?? ""}`,
  );
}

const problems = rows.filter((r) => r.banned.length || r.emDash);
console.log("\n  RULE BREAKS");
if (!problems.length) {
  console.log("    none. No banned termbase form and no em dash in any shipped Thai.");
} else {
  for (const r of problems) {
    if (r.banned.length) console.log(`    ${r.file}: banned form ${r.banned.join(", ")}`);
    if (r.emDash) console.log(`    ${r.file}: ${r.emDash} em dash(es)`);
  }
}

console.log(
  "\n  Register per file: npm run verify:thai-register -- src/lib/content/<file>\n" +
    "  Provenance is read from each module's header. It is a claim about who wrote\n" +
    "  the Thai, never an inference from how good it looks.\n",
);

process.exit(problems.length ? 1 : 0);
