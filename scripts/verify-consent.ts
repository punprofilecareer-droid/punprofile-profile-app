/**
 * Assertions over the consent resolver. `npx tsx scripts/verify-consent.ts`.
 *
 * Same shape as `audit.ts`: no test framework in this repo, so an invariant is
 * checked by a script that exits non-zero. Run it after touching
 * `src/lib/consent.ts`.
 *
 * The invariants here are the ones with a consequence attached. A resolver bug
 * does not produce a wrong number on a chart, it produces a message sent to
 * someone who did not agree to receive it.
 */

import {
  resolveConsent,
  maySend,
  resolveAll,
  type ConsentEvent,
} from "../src/lib/consent";

let failures = 0;

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}${detail ? `\n       ${detail}` : ""}`);
  }
}

const ev = (over: Partial<ConsentEvent>): ConsentEvent => ({
  channel: "email",
  purpose: "service",
  action: "opt_in",
  at: 1_000,
  basis: "app_tick",
  ...over,
});

console.log("\nconsent resolver\n");

// --- the default -----------------------------------------------------------

check(
  "no events resolves to never_asked, not opted_out",
  resolveConsent([], "email", "service").status === "never_asked",
);

check(
  "never_asked does not permit a send",
  maySend([], "email", "service") === false,
);

// --- the reason this module exists ----------------------------------------

const serviceOnly = [ev({ purpose: "service", action: "opt_in", at: 5_000 })];

check(
  "a service opt-in does NOT license marketing",
  maySend(serviceOnly, "email", "marketing") === false,
  "This is the whole point of the purpose field. If this fails, TASK-060 mails 86 people who never agreed.",
);

check(
  "a service opt-in does license service",
  maySend(serviceOnly, "email", "service") === true,
);

check(
  "consent on one channel does not leak to another",
  maySend(serviceOnly, "line", "service") === false,
);

// --- withdrawal ------------------------------------------------------------

const withdrawn = [
  ev({ action: "opt_in", at: 1_000 }),
  ev({ action: "opt_out", at: 2_000, basis: "unsubscribe_link" }),
];

check("a later opt-out wins", resolveConsent(withdrawn, "email", "service").status === "opted_out");
check("an opted-out person may not be sent to", maySend(withdrawn, "email", "service") === false);
check(
  "optedOutAt is reported",
  resolveConsent(withdrawn, "email", "service").optedOutAt === 2_000,
);
check(
  "optedInAt is null once withdrawn",
  resolveConsent(withdrawn, "email", "service").optedInAt === null,
);

// --- re-grant --------------------------------------------------------------

const regranted = [...withdrawn, ev({ action: "opt_in", at: 3_000, basis: "coach_recorded" })];
const r = resolveConsent(regranted, "email", "service");

check("a re-grant after a withdrawal restores the send right", r.status === "opted_in");
check("the re-grant's own date is reported", r.optedInAt === 3_000);
check(
  "the earlier withdrawal is NOT erased by the re-grant",
  r.optedOutAt === 2_000,
  "A withdrawal is a fact about the relationship. Losing it would hide that they once asked us to stop.",
);
check("the current basis is the re-grant's", r.basis === "coach_recorded");

// --- ordering --------------------------------------------------------------

const outOfOrder = [
  ev({ action: "opt_out", at: 9_000 }),
  ev({ action: "opt_in", at: 4_000 }),
];
check(
  "events are resolved by their own timestamp, not array order",
  resolveConsent(outOfOrder, "email", "service").status === "opted_out",
  "A coach entering a Tuesday withdrawal on Thursday must still win over an older grant.",
);

const sameMs = [
  ev({ action: "opt_in", at: 7_000 }),
  ev({ action: "opt_out", at: 7_000 }),
];
check(
  "a same-millisecond tie breaks toward opt_out",
  resolveConsent(sameMs, "email", "service").status === "opted_out",
  "Refusing to send is the safe read of an ambiguous record.",
);

const sameMsReversed = [
  ev({ action: "opt_out", at: 7_000 }),
  ev({ action: "opt_in", at: 7_000 }),
];
check(
  "the tie breaks the same way regardless of array order",
  resolveConsent(sameMsReversed, "email", "service").status === "opted_out",
);

// --- resolveAll ------------------------------------------------------------

const all = resolveAll(serviceOnly);
check(
  "resolveAll covers every channel and purpose",
  Object.keys(all).length === 2 &&
    Object.keys(all.service).length === 3 &&
    Object.keys(all.marketing).length === 3,
);
check(
  "resolveAll reports marketing as never_asked across every channel",
  (["email", "line", "phone"] as const).every((c) => all.marketing[c].status === "never_asked"),
);

// --- the state of the real database ---------------------------------------

console.log(
  "\nNote: with no screen asking for marketing consent, `marketing` is\n" +
    "`never_asked` for every lead in the database. That is the correct answer\n" +
    "and an empty marketing audience is not a bug.\n",
);

if (failures > 0) {
  console.error(`${failures} assertion(s) failed.\n`);
  process.exit(1);
}
console.log("All consent invariants hold.\n");
