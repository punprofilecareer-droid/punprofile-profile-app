/**
 * Runs `lint-thai` over the per-page content modules.
 *
 *   npm run verify:pages
 *
 * **Written 17/08/2026 because nothing was checking them.** `verify-copy.ts`
 * lints `copy.ts`, `narrative-copy.ts`, `consent-copy.ts`, the question bank and
 * the privacy notice, and that is where the Thai rules have been enforced since
 * 15/08/2026. Every other candidate-facing string in the app lives in a per-page
 * module, `coaching.ts`, `services.ts`, `faq.ts`, `footer.ts` and now `home.ts`,
 * and none of them was ever passed to the lint.
 *
 * That was invisible rather than deliberate. The page modules were written from
 * Paul's own supplied Thai, so nobody thought of them as needing a check, and
 * `audit-thai.ts` files them under ALREADY HIS for the same reason. The first
 * run of this script found a real LR-04 failure in `footer.ts`, in a string that
 * has been shipped since 15/08/2026.
 *
 * **It is in the pre-push list in `AGENTS.md`**, added on Paul's call the same
 * day, once the LR-04 finding it opened with was resolved.
 *
 * Modules are named explicitly rather than globbed. A glob would pull in
 * `blog.ts` and `privacy.ts`, and the second of those is already linted by
 * `verify-copy.ts` at the `system` surface, which is the right surface for it
 * and not the one this script uses.
 */

import { lintThai, type LintTarget } from "./lint-thai.js";
import { walkCopy } from "./lib/copy-walk.js";
import * as home from "../src/lib/content/home.js";
// Added 23/08/2026. Both shipped that day and neither was reachable by any
// check: this list is hardcoded, so 44 product strings and 39 pricing strings
// passed a green run without being looked at once.
import * as pricing from "../src/lib/content/pricing.js";
import * as products from "../src/lib/content/products.js";
import * as coaching from "../src/lib/content/coaching.js";
import * as services from "../src/lib/content/services.js";
import * as faq from "../src/lib/content/faq.js";
import * as footer from "../src/lib/content/footer.js";

const MODULES: Record<string, Record<string, unknown>> = {
  pricing,
  products,
  home,
  coaching,
  services,
  faq,
  footer,
};

/*
 * The walk lives in `lib/copy-walk.ts`, not here.
 *
 * It was here, and its array arm recursed into `Copy` items instead of
 * collecting them, so 62 of 153 strings were skipped and this script reported
 * "no findings". `copy-walk.ts` carries that history and the reason there is now
 * one implementation: the identical hole turned up in `export-page-review.ts`
 * the same day.
 */

/**
 * Per-module floors, so an undercount fails instead of reading as a clean run.
 *
 * Added 17/08/2026 with the array fix above, and it is the actual lesson of that
 * bug: the check reported "91 strings, no findings" for a day and the number was
 * the only evidence anything was wrong. Nobody reads a count they have nothing to
 * compare against.
 *
 * These are floors rather than exact counts on purpose. Copy gets added, and a
 * module that grows should not fail; a module that SHRINKS by more than a string
 * or two has almost certainly lost coverage rather than lost content, and that is
 * the case worth stopping on. Raise a floor when a module gains strings for good.
 */
const FLOORS: Record<string, number> = {
  home: 20,
  coaching: 53,
  services: 28,
  faq: 36,
  footer: 12,
};

const perModule = Object.fromEntries(
  Object.entries(MODULES).map(([name, mod]) => [
    name,
    walkCopy(mod).map(
      ({ path, copy }): LintTarget => ({
        id: `${name}:${path}`,
        th: copy.th,
        en: copy.en,
        surface: "app",
      }),
    ),
  ]),
);
const targets = Object.values(perModule).flat();
const findings = lintThai(targets);
const failures = findings.filter((f) => f.level === "fail");

console.log(`\n${targets.length} strings across ${Object.keys(MODULES).length} page modules`);
for (const [name, list] of Object.entries(perModule)) {
  const floor = FLOORS[name];
  const short = floor !== undefined && list.length < floor;
  console.log(
    `  ${name.padEnd(10)} ${String(list.length).padStart(3)}` +
      (short ? `   BELOW FLOOR of ${floor}, coverage has been lost` : ""),
  );
  if (short) {
    console.error(
      `FAIL ${name}: ${list.length} strings harvested, floor is ${floor}. ` +
        `Either the walker stopped seeing something or copy was deleted; check which.`,
    );
    failures.push({ rule: "coverage", target: name, message: "below floor", level: "fail" });
  }
}

if (findings.length === 0) {
  console.log("no findings\n");
} else {
  console.log("");
  for (const f of findings) {
    console.log(`  [${f.level.toUpperCase()}] [${f.rule}] ${f.target}`);
    console.log(`          ${f.message}`);
  }
  console.log("");
}

// Exits non-zero because this is in the pre-push list, so a failure has to stop
// a push rather than scroll past in a terminal.
if (failures.length) {
  console.error(`${failures.length} failure(s).`);
  process.exit(1);
}
