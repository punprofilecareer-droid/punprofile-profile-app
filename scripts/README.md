# Offline scoring scripts

The manual-servicing path for leads that already came in through the Google Form,
before the app replaces it. Both scripts run on a JSON export of the Lead Discovery
Survey response sheet, shaped `{ "header": string[], "rows": string[][] }`.

```bash
npx tsx scripts/generate-reports.ts responses.json out      # one HTML report per candidate
npx tsx scripts/audit.ts responses.json                     # parser coverage + invariant check
```

`generate-reports.ts` also writes `out/_summary.txt`: how much of the ECRA framework
the survey actually reaches across every real response. That number is what says
whether the question set earns what it costs the candidate to fill in.

`audit.ts` is the one to run after touching `normalize.ts`. It reports, per question,
how many responses parsed, how many were blank, and prints every value the parser
rejected, a parser silently nulling 40% of a column otherwise looks identical to a
question nobody answered. It also asserts the scoring invariants: no score outside
1–5, no dimension mean outside its own items' range, no coach-tier item ever carrying
a score, no coverage outside 0–1.

These scripts import from `src/lib/`, the same modules the app uses. There is one
scoring implementation, not two.
