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
import { NARRATIVE_COPY } from "../src/lib/content/narrative-copy.js";
import { CONSENT_COPY, CONSENT_COPY_REVIEWED } from "../src/lib/consent-copy.js";
import { MOVES } from "../src/lib/levers.js";
import type { CopyEntry } from "../src/lib/content/copy.js";

/**
 * The 15 lever actions live in `levers.ts` as data, not as keyed copy, because
 * each one carries its own scoring predicate. They are surfaced here under a
 * synthetic key so the founder sees every candidate-facing sentence in one
 * place rather than having to know which file a string lives in.
 */
const MOVE_COPY: Record<string, CopyEntry> = Object.fromEntries(
  MOVES.map((m) => [
    `move.${m.key}`,
    {
      screen: `Next-step card, shown when the priority is "${m.itemKey}"`,
      en: m.candidate.en,
      th: m.candidate.th,
    },
  ]),
);

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

const totalMissing = [
  ...Object.values(COPY),
  ...Object.values(NARRATIVE_COPY),
  ...Object.values(MOVE_COPY),
  ...Object.values(CONSENT_COPY),
].filter((e) => !e.th).length;

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

**Em dashes are allowed here**, since 15/08/2026. The house rule narrowed to what
PunProfile says to someone, meaning chat, email and social posts. App copy is
product.

**${totalMissing} strings still need Thai.**

---

${section(
  "App copy",
  "Landing, the assessment, the teaser chart. Admin and login are English on purpose and are not listed.",
  COPY,
)}
---

${section(
  "Result summary",
  "The personalized read on the result page. The engine SELECTS which of these apply from the candidate's own scores; it never writes a sentence. So each one has to make sense on its own, for the situation named in its note, without knowing which others appear alongside it. Keep `{area}` and `{count}` exactly as they are: they are filled in at render, and a Thai line that drops one renders a gap.",
  NARRATIVE_COPY,
)}
---

${section(
  "Next-step actions",
  "One per lever. The result page shows exactly one, whichever the scores make the highest-impact next move. These are the most-read sentences in the product, since every candidate sees one.",
  MOVE_COPY,
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
