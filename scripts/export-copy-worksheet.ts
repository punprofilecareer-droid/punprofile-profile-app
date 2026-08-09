/**
 * Generates the copy worksheet the founder fills in.
 *
 *   npx tsx scripts/export-copy-worksheet.ts [out.md]
 *
 * Generated, never hand-maintained: it cannot list a key the app does not use,
 * or miss one it does. Round-trips with `import-copy-worksheet.ts`, so Thai
 * never passes through anyone's hands as retyped text, which is the single most
 * likely way to introduce a silent error in a script nobody in the loop reads.
 *
 * Default output is the coaching repo's `ctxt-product/`, which owns
 * specifications. That folder is read-mostly: propose the regenerated file,
 * do not commit over the founder's in-progress edits.
 */

import { writeFileSync } from "node:fs";
import { COPY } from "../src/lib/content/copy.js";
import { CONSENT_COPY, CONSENT_COPY_REVIEWED } from "../src/lib/consent-copy.js";
import type { CopyEntry } from "../src/lib/content/copy.js";

const OUT =
  process.argv[2] ??
  "../punprofile-career-coaching/punprofile-context/ctxt-product/copy-worksheet.md";

const MARKER = "TODO";

function section(title: string, note: string, entries: Record<string, CopyEntry>): string {
  const keys = Object.keys(entries);
  const missing = keys.filter((k) => !entries[k].th);
  const lines = [
    `## ${title}`,
    "",
    note,
    "",
    `${keys.length} strings, **${missing.length} still need Thai**.`,
    "",
  ];

  for (const key of keys) {
    const e = entries[key];
    lines.push(
      `### \`${key}\``,
      "",
      `*${e.screen}*`,
      "",
      `> **EN:** ${e.en}`,
      `> **TH:** ${e.th || MARKER}`,
      "",
    );
  }
  return lines.join("\n");
}

const totalMissing = [...Object.values(COPY), ...Object.values(CONSENT_COPY)].filter(
  (e) => !e.th,
).length;

const doc = `---
status: generated, do not hand-maintain
name: EU Fit Check, copy worksheet
description: >
  Every candidate-facing string in the app, English above and Thai below.
  Generated from the code by scripts/export-copy-worksheet.ts and read back by
  scripts/import-copy-worksheet.ts.
---

# Copy worksheet

**How to use this.** Replace every \`${MARKER}\` with the Thai. Leave the key
line and the \`> **TH:**\` prefix exactly as they are, because the importer
matches on them. Edit nothing else: this file is generated, so anything you add
outside a TH line is lost the next time it is regenerated.

**Leaving a \`${MARKER}\` is fine.** That string falls back to English at
render, so the app keeps working and Thai can arrive key by key rather than all
at once.

**No em dashes**, per the house rule for user-facing copy. Commas or shorter
sentences.

**${totalMissing} strings still need Thai.**

---

${section(
  "App copy",
  "Landing, the assessment, the teaser chart. Admin and login are English on purpose and are not listed.",
  COPY,
)}
---

${section(
  "PDPA consent copy",
  `**Not legally reviewed.** TASK-047 is a review checkpoint and has not happened, so the English below is placeholder text describing what each string must cover, not the consent itself. Do not translate it as-is: it needs writing, by someone qualified, then translating. \`CONSENT_COPY_REVIEWED\` is currently \`${CONSENT_COPY_REVIEWED}\`.`,
  CONSENT_COPY,
)}`;

writeFileSync(OUT, doc);
console.log(`wrote ${OUT}`);
console.log(`${totalMissing} strings still need Thai`);
