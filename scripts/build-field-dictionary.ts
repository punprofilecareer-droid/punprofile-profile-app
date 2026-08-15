/**
 * Generates the field dictionary from `convex/schema.ts`.
 *
 * `npx tsx scripts/build-field-dictionary.ts`, or `npm run dictionary`.
 * Output: `reports/field-dictionary.md`. **Never hand-edit that file.** Edit the
 * schema annotation and regenerate, per the repo's generated-files rule.
 *
 * ## Why this exists
 *
 * The schema says what every field *means* and never said what it may
 * *contain*. Of 122 fields, 64 are `v.optional`, and Convex's `optional` only
 * says a value may be absent. It does not say what absent means, and across
 * this schema absent was silently doing three different jobs:
 *
 * - **default** — absent stands for a specific value. `leads.consentSource`
 *   absent means `"app"`, documented in a comment and enforced nowhere.
 * - **notyet** — absent is a real state. `consultations.reminderSentAt` absent
 *   *is* the reminder queue; `placements.signedAt` absent *is* unsigned.
 * - **unmeasured** — absent means we do not know. This one is load-bearing:
 *   Country Reach already had to write down that empty means unmeasured and
 *   never zero, because scoring an imported lead's unknown languages as "speaks
 *   nothing" was a real bug.
 *
 * Reading an `unmeasured` as a `default` is how a system starts asserting
 * things nobody said. This file makes each field declare which it is, and the
 * check below fails the build when one does not.
 *
 * ## The annotation
 *
 *     /** @absent unmeasured — not collected on this call *\/
 *     icpJobTitle: v.optional(v.string()),
 *
 * Kinds: `default:<value>`, `notyet`, `unmeasured`, `none`. `none` means the
 * field is simply optional and absence carries no meaning worth stating.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SCHEMA = resolve(ROOT, "convex/schema.ts");
const OUT = resolve(ROOT, "reports/field-dictionary.md");

type Field = {
  name: string;
  type: string;
  optional: boolean;
  absentKind: string | null;
  absentNote: string | null;
};
type Table = { name: string; doc: string; fields: Field[]; indexes: string[] };

const src = readFileSync(SCHEMA, "utf8");

/** Render a Convex validator as something a person can read. */
function readableType(raw: string): string {
  const s = raw.replace(/\s+/g, " ").trim();
  if (/^v\.optional\(/.test(s)) return readableType(s.slice(11, -1));
  if (/^v\.id\("(\w+)"\)/.test(s)) return `id → ${RegExp.$1}`;
  if (/^v\.string\(\)/.test(s)) return "string";
  if (/^v\.number\(\)/.test(s)) return "number";
  if (/^v\.boolean\(\)/.test(s)) return "boolean";
  if (/^v\.any\(\)/.test(s)) return "any";
  if (/^v\.record\(/.test(s)) return "record";
  if (/^v\.array\(/.test(s)) return "array";
  if (/^v\.union\(/.test(s)) {
    const lits = [...s.matchAll(/v\.literal\("([^"]+)"\)/g)].map((m) => m[1]);
    // A union of literals is an enum, and the allowed values are the single
    // most useful thing this document can carry. Joined with a middot, not a
    // pipe: this lands inside a markdown table cell and a pipe would split it.
    if (lits.length) return `enum: ${lits.join(" · ")}`;
    return "union";
  }
  if (/^v\.object\(/.test(s)) return "object";
  return s.slice(0, 40);
}

/** Pull one table's body out by brace-matching, so nested objects survive. */
function bodyAt(from: number): string {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(from, i + 1);
    }
  }
  return "";
}

const tables: Table[] = [];
const tableRe = /^ {2}(\w+): defineTable\(/gm;
let tm: RegExpExecArray | null;
while ((tm = tableRe.exec(src)) !== null) {
  const name = tm[1];
  const braceStart = src.indexOf("{", tm.index);
  const body = bodyAt(braceStart);

  // The doc block immediately above the table declaration, first sentence only.
  //
  // Anchored from the RIGHT. A lazy `/\/\*\*[\s\S]*?\*\/\s*$/` looks correct and
  // is not: JS scans left to right for a start position, so it matches from the
  // first `/**` in the file and every table inherits the file header.
  const before = src.slice(0, tm.index);
  const lastBlock = before.lastIndexOf("/**");
  const blockTail = lastBlock === -1 ? "" : before.slice(lastBlock);
  const docMatch = /^\/\*\*([\s\S]*?)\*\/\s*$/.exec(blockTail)
    ? [blockTail, /^\/\*\*([\s\S]*?)\*\//.exec(blockTail)![1]]
    : before.match(/((?:^ *\/\/.*\n)+)$/m);
  const doc = docMatch
    ? docMatch[1]
        .split("\n")
        .map((l) => l.replace(/^\s*(\*|\/\/)\s?/, "").trim())
        .filter(Boolean)
        .join(" ")
        .split(/(?<=\.)\s/)[0]
        .slice(0, 200)
    : "";

  const fields: Field[] = [];
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const fm = lines[i].match(/^ {4}(\w+): (v\..*)$/);
    if (!fm) continue;
    // A validator can span several lines; take until brace/paren balance.
    let raw = fm[2];
    let d = (raw.match(/[({]/g) ?? []).length - (raw.match(/[)}]/g) ?? []).length;
    let j = i;
    while (d > 0 && j + 1 < lines.length) {
      j++;
      raw += " " + lines[j].trim();
      d += (lines[j].match(/[({]/g) ?? []).length - (lines[j].match(/[)}]/g) ?? []).length;
    }
    const ann = lines[i - 1]?.match(/@absent\s+(\S+)(?:\s+[—-]\s+(.*?)\s*\*\/)?/);
    fields.push({
      name: fm[1],
      type: readableType(raw),
      optional: raw.startsWith("v.optional"),
      absentKind: ann ? ann[1] : null,
      absentNote: ann?.[2] ?? null,
    });
  }

  const after = src.slice(tm.index + body.length);
  const idx = [...after.slice(0, 400).matchAll(/\.index\("(\w+)"/g)].map((m) => m[1]);

  tables.push({ name, doc, fields, indexes: idx });
}

// ---- the check that makes this more than a document ----------------------
const undeclared = tables.flatMap((t) =>
  t.fields.filter((f) => f.optional && !f.absentKind).map((f) => `${t.name}.${f.name}`),
);
if (undeclared.length) {
  console.error(
    `\n${undeclared.length} optional field(s) do not declare what absence means.\n` +
      `Add an @absent annotation above each:\n\n  ` +
      undeclared.join("\n  ") +
      `\n\nKinds: default:<value> | notyet | unmeasured | none\n`,
  );
  process.exit(1);
}

const KIND_LABEL: Record<string, string> = {
  notyet: "Not yet",
  unmeasured: "Unmeasured",
  none: "—",
};
const kindOf = (f: Field) =>
  f.absentKind?.startsWith("default:")
    ? `Defaults to \`${f.absentKind.slice(8)}\``
    : (KIND_LABEL[f.absentKind ?? ""] ?? f.absentKind ?? "");

const totals = {
  fields: tables.reduce((n, t) => n + t.fields.length, 0),
  optional: tables.reduce((n, t) => n + t.fields.filter((f) => f.optional).length, 0),
};
const byKind = (k: string) =>
  tables.reduce((n, t) => n + t.fields.filter((f) => f.absentKind?.startsWith(k)).length, 0);

const out: string[] = [];
out.push("---");
out.push("status: generated, do not hand-edit");
out.push("name: Field dictionary");
out.push("description: >");
out.push("  Every field in the Convex schema with its type, whether it is required,");
out.push("  and what an absent value means. Generated from convex/schema.ts by");
out.push("  scripts/build-field-dictionary.ts; regenerate rather than editing.");
out.push("---");
out.push("");
out.push("# Field dictionary");
out.push("");
out.push(
  "**Generated from `convex/schema.ts`. Never hand-edit.** Change the `@absent`" +
    " annotation on the field and run `npm run dictionary`.",
);
out.push("");
out.push(
  `${totals.fields} fields across ${tables.length} tables, ${totals.optional} of them optional.`,
);
out.push("");
out.push("## What an absent value means");
out.push("");
out.push(
  "Convex's `v.optional` says only that a value may be missing. It does not say" +
    " what missing *means*, and across this schema it does three different jobs." +
    " Reading one as another is how a system starts asserting things nobody said.",
);
out.push("");
out.push("| Kind | Count | Meaning | Rule |");
out.push("|---|---|---|---|");
out.push(
  `| **Defaults to _x_** | ${byKind("default:")} | Absent stands for a specific value | Safe to substitute the default on read |`,
);
out.push(
  `| **Not yet** | ${byKind("notyet")} | Absence is itself a state | Never substitute anything. Absent often *is* the queue |`,
);
out.push(
  `| **Unmeasured** | ${byKind("unmeasured")} | We do not know | **Never read as zero, false or none.** Say so in any output |`,
);
out.push(
  `| **—** | ${byKind("none")} | Genuinely optional, absence carries no meaning | Nothing to infer |`,
);
out.push("");
out.push(
  "The unmeasured rule is not theoretical. Country Reach had to state that an" +
    " imported lead's empty language grid means unmeasured and never zero," +
    " because scoring it as “speaks nothing” was a real bug on real people.",
);
out.push("");

for (const t of tables) {
  out.push(`## \`${t.name}\``);
  out.push("");
  if (t.doc) out.push(`${t.doc}`);
  out.push("");
  out.push("| Field | Type | Required | If absent | Meaning |");
  out.push("|---|---|---|---|---|");
  for (const f of t.fields) {
    const req = f.optional ? "" : "**yes**";
    out.push(
      `| \`${f.name}\` | ${f.type} | ${req} | ${f.optional ? kindOf(f) : "—"} | ${f.absentNote ?? ""} |`,
    );
  }
  out.push("");
  if (t.indexes.length) out.push(`Indexes: ${t.indexes.map((i) => `\`${i}\``).join(", ")}`);
  out.push("");
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out.join("\n"));
console.log(
  `field dictionary: ${totals.fields} fields, ${totals.optional} optional, all declared. -> reports/field-dictionary.md`,
);
