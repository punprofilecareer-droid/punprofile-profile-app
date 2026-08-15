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
  banned: string[];
  emDash: number;
  thaiChars: number;
};

function strings(src: string): string[] {
  return [...src.matchAll(/th:\s*"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((t) => THAI.test(t));
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
  const th = strings(src);
  if (!th.length) continue;
  const joined = th.join("\n");
  rows.push({
    file: rel.split("/").pop()!,
    strings: th.length,
    // Read from the whole header block, not the first few lines: the claim sits
    // deep in `consent-copy.ts` and a shallow read misses it.
    paulsOwn: PROVENANCE.test(src.slice(0, 4000)),
    banned: bannedForms.filter((b) => joined.includes(b)),
    emDash: (joined.match(/—/g) ?? []).length,
    thaiChars: (joined.match(/[฀-๿]/g) ?? []).length,
  });
}

rows.sort((a, b) => Number(a.paulsOwn) - Number(b.paulsOwn) || b.strings - a.strings);

const unread = rows.filter((r) => !r.paulsOwn);
const readTotal = rows.filter((r) => r.paulsOwn).reduce((n, r) => n + r.strings, 0);
const unreadTotal = unread.reduce((n, r) => n + r.strings, 0);

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

console.log("\n  ALREADY HIS");
for (const r of rows.filter((x) => x.paulsOwn)) {
  console.log(
    `    ${String(r.strings).padStart(3)} strings, ${String(r.thaiChars).padStart(5)} chars  ${r.file.padEnd(19)} ${SURFACE[r.file] ?? ""}`,
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
