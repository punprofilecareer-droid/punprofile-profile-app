import type { FitTier } from "./leadGrade";
import type { TemperatureTier } from "./temperature";

/**
 * The CRM: one status per person, and one order to work them in.
 *
 * Spec: `crm-status-model.md` in the coaching repo. Paul's decisions,
 * 26/08/2026.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS STORED AND WHAT IS DERIVED, AND WHY THE SPLIT IS NOT ARBITRARY
 * ---------------------------------------------------------------------------
 *
 * `lifecycle.ts` next door stores nothing, on the reasoning that a stored
 * verdict is produced by whichever rule ran that day and goes silently wrong
 * when the rule moves. That reasoning holds for a *derivation* and not for a
 * *decision*.
 *
 * So the split here is by who is speaking:
 *
 * - **Quoted** and **Closed won** are facts. Quoting somebody writes a figure
 *   into `engagements`, and that row is the money record. A hand-set label
 *   could disagree with it, and the row is what decides revenue, so the label
 *   reads the row.
 * - **Nurturing**, **Not now**, **Closed lost** and **Disqualified** are Paul's
 *   decisions. A decision does not go stale when a rule changes; it is a record
 *   of what a person chose, stamped with who and when.
 * - **New** is neither. It is the absence of both: reachable, and nobody has
 *   touched them yet.
 *
 * ---------------------------------------------------------------------------
 * ENTRY: NO CONTACT IS TRAFFIC, NOT A LEAD
 * ---------------------------------------------------------------------------
 *
 * Paul, 26/08/2026: *if you do not exist, meaning no email, you never count in
 * this lifecycle. It is just traffic.*
 *
 * So `crmStatusFor` returns null for anyone who has not cleared the contact
 * gate, and the admin splits into a CRM view and a Traffic view. This is why
 * `visitor` left `LIFECYCLE_STATES`: a row with no contact has no lifecycle
 * position at all rather than the weakest one.
 *
 * The consequence to remember when reading any funnel number on this app: the
 * denominator moved from every row to every reachable person, and the two are
 * a factor of three apart.
 */

export const CRM_STATUSES = [
  "new",
  "nurturing",
  "not_now",
  "quoted",
  "closed_won",
  "closed_lost",
  "disqualified",
] as const;
export type CrmStatus = (typeof CRM_STATUSES)[number];

/** The four Paul sets by hand. The other three are read off evidence. */
export const SETTABLE_STATUSES = [
  "nurturing",
  "not_now",
  "closed_lost",
  "disqualified",
] as const;
export type SettableStatus = (typeof SETTABLE_STATUSES)[number];

/**
 * Only Disqualified demands a reason.
 *
 * Closed lost and Disqualified are both terminal and they answer different
 * questions, so they do not share a reason field's rules either. Closed lost is
 * a number about the offer: they decided, and "they went quiet" is a complete
 * answer. Disqualified is a number about who the funnel is attracting: we
 * decided, and a judgement about a person with no reason attached is an opinion
 * nobody can review later.
 */
export const REASON_REQUIRED: readonly SettableStatus[] = ["disqualified"];

export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  new: "New",
  nurturing: "Nurturing",
  not_now: "Not now",
  quoted: "Quoted",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
  disqualified: "Disqualified",
};

/** Terminal statuses stop the clock. Nothing is expected of Paul on these rows. */
export const TERMINAL_STATUSES: readonly CrmStatus[] = [
  "closed_won",
  "closed_lost",
  "disqualified",
];

export interface CrmInput {
  /** The contact gate: an email AND a LINE ID or a phone number. */
  reachable: boolean;
  /** True when every channel has been withdrawn for every purpose. */
  fullyWithdrawn: boolean;
  /** What Paul set, if anything. */
  stored: SettableStatus | null;
  /** Engagement rows at `agreed` or beyond. */
  engagementsAgreed: number;
  /** Engagement rows at `proposed`. A pipeline, not a sale. */
  engagementsProposed: number;
}

/**
 * The status shown, resolved from the strongest evidence downward.
 *
 * **Money outranks a hand-set label, and a terminal decision outranks money.**
 * The order below is deliberate and each step earns its place:
 *
 * 1. **No contact → null.** Not a lead. Not in this list at all.
 * 2. **Disqualified and Closed lost win over an engagement row.** Somebody can
 *    be quoted and then lost, and the quote does not un-lose them. The reverse
 *    reading would make every dead deal read as live pipeline forever.
 * 3. **Closed won.** An agreed engagement is the strongest positive fact here.
 * 4. **Quoted.** A proposed engagement with nothing agreed yet.
 * 5. **What Paul set**, for the two live states.
 * 6. **New.** Reachable, and nobody has done anything.
 *
 * `fullyWithdrawn` is deliberately NOT a status. Somebody exercising a data
 * right is not a sales outcome and must not be overwritable by one; it is
 * returned separately so the row can carry it as an overlay. A withdrawn person
 * still has whatever pipeline status they had, and the screen must show both.
 */
export function crmStatusFor(input: CrmInput): CrmStatus | null {
  if (!input.reachable) return null;

  if (input.stored === "disqualified") return "disqualified";
  if (input.stored === "closed_lost") return "closed_lost";

  if (input.engagementsAgreed > 0) return "closed_won";
  if (input.engagementsProposed > 0) return "quoted";

  if (input.stored === "nurturing") return "nurturing";
  if (input.stored === "not_now") return "not_now";

  return "new";
}

// ---------------------------------------------------------------- priority

export const PRIORITIES = ["now", "next", "later", "unranked"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
  unranked: "Unranked",
};

/**
 * Which order to work the list in.
 *
 * ---------------------------------------------------------------------------
 * THIS IS A SORT, NOT A SCORE, AND THE DIFFERENCE IS THE WHOLE DESIGN
 * ---------------------------------------------------------------------------
 *
 * `08_Coaching_Business.md` is explicit that Fit and Temperature stay
 * independent axes and are never combined into one number, because strong fit
 * with low urgency is a nurture and weak fit with high urgency is a
 * manage-expectations, and one blended figure says neither.
 *
 * **A two-key sort is not one number.** Temperature decides the band, Fit
 * breaks ties inside it, no information is destroyed, and both values stay
 * separately readable on the row. Nobody is ever handed a composite to reason
 * about a person with, which is what the rule exists to prevent. The list still
 * gets a top.
 *
 * **Three signals that were proposed for this dropped out**, and it is worth
 * knowing why rather than wondering where they went: reachability, finishing
 * the assessment, and having contact details all became *entry conditions* when
 * no-contact rows stopped being leads. Something every row shares cannot rank
 * the rows.
 *
 * **`now` reads the booking gate as well as the temperature band.** Somebody
 * interviewing or negotiating is being engaged with by the market and something
 * specific is going wrong, which is exactly what a call can fix. That is the
 * strongest buying signal the system has and until now it only fired a booking
 * link.
 *
 * **`unranked` is not cold.** It means the answers that would place them were
 * never given, and an input nobody has been asked about looks identical to one
 * everybody scores low on. It sorts last and it does not sort as zero.
 */
export interface PriorityInput {
  temperature: TemperatureTier | null;
  fit: FitTier | null;
  /** Interviewing, interviewing without success, or negotiating. */
  meetsBookingGate: boolean;
}

export function priorityFor(input: PriorityInput): Priority {
  if (input.meetsBookingGate || input.temperature === "ready_to_move") return "now";
  if (input.temperature === "getting_there" && input.fit === "strong") return "next";
  if (input.temperature === null) return "unranked";
  return "later";
}

/** Descending, so the sort reads "highest priority first". */
export const PRIORITY_RANK: Record<Priority, number> = {
  now: 3,
  next: 2,
  later: 1,
  unranked: 0,
};

/**
 * Fit as a tiebreak inside a priority band. Ungraded sorts last rather than as
 * zero, for the same reason `unranked` does: nobody has judged them is not the
 * same as judged and found wanting.
 */
export const FIT_RANK: Record<FitTier, number> = { strong: 3, moderate: 2, weak: 1 };
