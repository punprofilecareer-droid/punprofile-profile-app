/**
 * TASK-053: prepares the historical survey responses for import into Convex.
 *
 *   npx tsx scripts/backfill-leads.ts data/responses.json data/backfill.json
 *   npx convex run importLeads:importLegacyLeads "$(cat data/backfill.json)"
 *
 * Two steps on purpose. This script does the parsing and scoring and writes a
 * file you can inspect before anything touches the database, and the mutation
 * it feeds is `internal`, so the import cannot be triggered by anything but
 * someone at a terminal with deployment access.
 *
 * Scores are computed with the same `scoreResponse` the app uses. A backfilled
 * lead and an app-native one are scored by one implementation, never two.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { mapColumns, importRow, looksShifted } from "./import-sheet.js";
import { scoreResponse } from "../src/lib/scoring.js";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: backfill-leads.ts <responses.json> <backfill.json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(inPath, "utf8")) as { header: string[]; rows: string[][] };
const cols = mapColumns(raw.header);

const leads: unknown[] = [];
let skipped = 0;
const noChannel: string[] = [];

for (const row of raw.rows) {
  // A shifted row means the sheet's columns moved under us. Importing one
  // writes another candidate's answers onto this person's record, so it stops
  // rather than guessing.
  if (looksShifted(row, cols)) {
    console.error("SHIFTED ROW detected. Refusing to prepare an import from this export.");
    process.exit(1);
  }

  const { input, meta, contact } = importRow(row, cols);
  if (!contact.email) {
    skipped++;
    continue;
  }
  if (!contact.phone && !contact.lineId && !contact.emailNominated) {
    noChannel.push(meta.candidate);
  }

  const profile = scoreResponse(input);
  const scores: Record<string, number> = {};
  for (const d of profile.dimensions) if (d.score !== null) scores[d.key] = d.score;

  leads.push({
    fullName: meta.candidate,
    email: contact.email,
    ...(contact.phone ? { phone: contact.phone } : {}),
    ...(contact.lineId ? { lineId: contact.lineId } : {}),
    emailNominated: contact.emailNominated !== null,
    contactRaw: contact.raw,
    submittedAt: Date.parse(meta.submittedAt) || Date.now(),
    responses: input,
    scores,
  });
}

writeFileSync(outPath, JSON.stringify({ leads }));
console.log(`prepared ${leads.length} leads -> ${outPath}`);
if (skipped) console.log(`skipped ${skipped} with no email at all`);
if (noChannel.length) {
  console.log(
    `\n${noChannel.length} nominated a Facebook or LinkedIn link rather than a phone or LINE id.` +
      "\nThe answer is preserved verbatim in responses._contactRaw, but no consented" +
      "\nchannel exists on those records and the detail view will say so.",
  );
}
