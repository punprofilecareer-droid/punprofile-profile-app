/**
 * Consent resolution, the pure half.
 *
 * Spec and reasoning: `lifecycle-data-model.md` § 6 in the sibling repo. Built
 * 15/08/2026 on Paul's decision 2a.
 *
 * **Why events replaced flat timestamps.** `leads` carried three fields,
 * `emailConsentAt`, `phoneConsentAt` and `lineConsentAt`. That shape can record
 * a grant and cannot record a withdrawal, which is why `data-inventory.md` § 7
 * lists "Withdraw consent" with "None" against it. It also cannot tell two
 * different permissions apart, and the system is about to need exactly that:
 * "we may send you your result" and "we may send you job digests every week"
 * are not the same agreement, and `data-inventory.md` § 8 records that 86 of
 * the 90 imported leads had their email consent backfilled on the founder's
 * instruction from a form carrying no consent clause at all.
 *
 * Same reasoning that killed `leads.scores` on 15/08/2026: a denormalised
 * current-state field drifts from the events that produced it, and nothing
 * notices. So the events are the record and the state is computed.
 *
 * Kept out of `convex/` for the reason `scoring.ts` is: the Convex mutations,
 * the admin surface and the subject-access export all need this answer, and
 * three copies of "is this person opted in" would eventually disagree about
 * whether it was lawful to email someone.
 */

export const CONSENT_CHANNELS = ["email", "line", "phone"] as const;
export type ConsentChannel = (typeof CONSENT_CHANNELS)[number];

/**
 * What the permission is *for*. The whole reason this module exists.
 *
 * - `service`: your result, your booking, your engagement. This is what the
 *   contact gate actually asks for today, and what every existing timestamp in
 *   the database means.
 * - `marketing`: job digests, nurture sequences, newsletters. **Nobody has ever
 *   been asked for this**, not one imported lead and not one app-native lead.
 *   TASK-060 and TASK-082 both need it and neither may assume it.
 */
export const CONSENT_PURPOSES = ["service", "marketing"] as const;
export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

export const CONSENT_ACTIONS = ["opt_in", "opt_out"] as const;
export type ConsentAction = (typeof CONSENT_ACTIONS)[number];

/**
 * How the permission was given or taken away.
 *
 * `survey_import` and `founder_backfill` are separated on purpose. Both came
 * out of the 10/08/2026 import, but they are different claims: the first is "a
 * person nominated this channel on a form", the second is "no one asked, and
 * the founder instructed us to treat it as consent". `data-inventory.md` § 8
 * makes that distinction the reviewer's most likely question, so the field has
 * to be able to answer it.
 */
export const CONSENT_BASES = [
  "app_tick",
  "survey_import",
  "founder_backfill",
  "coach_recorded",
  "unsubscribe_link",
  "reply_or_block",
] as const;
export type ConsentBasis = (typeof CONSENT_BASES)[number];

export type ConsentEvent = {
  channel: ConsentChannel;
  purpose: ConsentPurpose;
  action: ConsentAction;
  at: number;
  basis: ConsentBasis;
  evidence?: string | null;
  by?: string | null;
};

/**
 * Three states, and the third is not a rounding error.
 *
 * `never_asked` must never collapse into `opted_out`. They differ in what they
 * license *next*: you may ask someone who was never asked, and you may not
 * re-ask someone who opted out. It is also the honest answer for `marketing` on
 * every record in the database today, and "absent means unmeasured, never zero"
 * is the rule Country Reach already follows for the same imported leads.
 */
export type ConsentStatus = "opted_in" | "opted_out" | "never_asked";

export type ResolvedConsent = {
  status: ConsentStatus;
  /** When the current opt-in was given. Null unless status is `opted_in`. */
  optedInAt: number | null;
  /** When they last withdrew. Survives a later re-opt-in, because the fact that
   *  someone once opted out is part of their history, not an erased state. */
  optedOutAt: number | null;
  basis: ConsentBasis | null;
  evidence: string | null;
};

const EMPTY: ResolvedConsent = {
  status: "never_asked",
  optedInAt: null,
  optedOutAt: null,
  basis: null,
  evidence: null,
};

/**
 * Current state for one channel and one purpose.
 *
 * Last event wins, by `at`. Events arriving out of order are tolerated because
 * a coach recording a withdrawal they were told about on Tuesday may enter it
 * on Thursday, and the date they were told is the date that counts.
 *
 * Ties break toward `opt_out`. Two events on the same millisecond is a backfill
 * artefact rather than a real sequence, and refusing to send is the safe read
 * of an ambiguous record.
 */
export function resolveConsent(
  events: readonly ConsentEvent[],
  channel: ConsentChannel,
  purpose: ConsentPurpose,
): ResolvedConsent {
  const scoped = events.filter((e) => e.channel === channel && e.purpose === purpose);
  if (scoped.length === 0) return EMPTY;

  let current: ConsentEvent | null = null;
  for (const e of scoped) {
    if (current === null) {
      current = e;
      continue;
    }
    if (e.at > current.at) current = e;
    else if (e.at === current.at && e.action === "opt_out") current = e;
  }
  if (current === null) return EMPTY;

  // Kept whatever the current state is: a withdrawal is a fact about the
  // relationship, and a later re-opt-in does not unhappen it.
  const lastOptOut = scoped
    .filter((e) => e.action === "opt_out")
    .reduce<number | null>((max, e) => (max === null || e.at > max ? e.at : max), null);

  return {
    status: current.action === "opt_in" ? "opted_in" : "opted_out",
    optedInAt: current.action === "opt_in" ? current.at : null,
    optedOutAt: lastOptOut,
    basis: current.basis,
    evidence: current.evidence ?? null,
  };
}

/**
 * The only question a send path may ask.
 *
 * Deliberately not `!== "opted_out"`. The default answer for anything nobody
 * has been asked about is no, and writing it as an allowlist means a purpose
 * added later starts closed rather than open.
 */
export function maySend(
  events: readonly ConsentEvent[],
  channel: ConsentChannel,
  purpose: ConsentPurpose,
): boolean {
  return resolveConsent(events, channel, purpose).status === "opted_in";
}

/** Every channel at once, for the admin surface and the subject-access export. */
export function resolveAll(
  events: readonly ConsentEvent[],
): Record<ConsentPurpose, Record<ConsentChannel, ResolvedConsent>> {
  const out = {} as Record<ConsentPurpose, Record<ConsentChannel, ResolvedConsent>>;
  for (const purpose of CONSENT_PURPOSES) {
    out[purpose] = {} as Record<ConsentChannel, ResolvedConsent>;
    for (const channel of CONSENT_CHANNELS) {
      out[purpose][channel] = resolveConsent(events, channel, purpose);
    }
  }
  return out;
}
