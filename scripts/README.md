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

## The lead snapshot, for an agent

```bash
npm run snapshot:leads                 # export both deployments, then build
npm run snapshot:leads -- --offline    # rebuild from the last raw export
```

`export-leads-snapshot.ts` writes `data/agent/leads-snapshot.json`: every lead
from **both** Convex deployments in one file, with lifecycle state, fit grade,
temperature, dimension scores and the consent grid already computed. It exists so
an agent can answer questions about the pipeline from a file instead of a query.

It decides nothing. Every derived value comes from the module that owns it,
imported and called: `lifecycle.ts`, `leadGrade.ts`, `temperature.ts`,
`convex/scoring.ts`, `consent.ts`. Re-run it after a rule changes; never edit the
output.

Three things it is careful about, and the reasons are in its own header:

- **Both deployments, tagged per row**, because the 90 imported survey leads live
  in dev and a production-only file quietly loses them. Each run reports each
  deployment's freshest activity, which is the empirical check on whether Vercel
  is writing where it should be.
- **`personId`**, a hash of the email, because the same person exists in both
  stores. Group on it before counting people.
- **It holds real contact details.** `data/` is gitignored for that reason and
  `data/agent/README.md`, which is not in git either, is the note to whoever
  opens the folder. See `data-inventory.md` in the coaching repo.
