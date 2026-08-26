/**
 * Lifecycle state, derived. Spec: `lifecycle-data-model.md` § 2.
 *
 * **Nothing writes a `lifecycleStage` column, deliberately.** The same reason
 * `leads.scores` was removed on 15/08/2026: a stored state is produced by
 * whichever rule ran that day, and the SQL rule in particular is expected to
 * change (wave 2 of the booking gate is written down and held). A stored stage
 * would be silently wrong the day the rule moved, exactly as every score
 * computed before Country Reach was.
 *
 * So state is a pure function of the rows that exist, the same shape as
 * `scoresFor`. Recomputing is cheap and always current.
 *
 * **Naming.** `client` and `placed`, not "candidate" and "employee". In this
 * system "candidate" already means every person in the app and is one of the
 * few words safe to show one; reusing it for the paid state would make
 * `candidate-data-architecture.md` ambiguous on every page. And they become an
 * employee of someone else, whereas `placed` is what PunProfile actually
 * measures (`01_Project_Foundation.md` Success Metrics).
 *
 * **None of these names may reach a candidate surface.** They are ops
 * vocabulary and `assertCandidateSafe()` should reject them alongside `tier`
 * and `qualification`.
 */

/**
 * **`visitor` left on 26/08/2026, on Paul's call:** *if you do not exist,
 * meaning no email, you never count in this lifecycle. It is just traffic.*
 *
 * A row with no contact now has no lifecycle position at all rather than the
 * weakest one, `stateFor` returns null for it, and the admin splits into a CRM
 * view and a Traffic view. The consequence to carry into every funnel number on
 * this app: the denominator moved from every row to every reachable person, and
 * the two are roughly a factor of three apart.
 */
export const LIFECYCLE_STATES = [
  "lead",
  "sql",
  "consulted",
  "client",
  "placed",
  "withdrawn",
] as const;
export type LifecycleState = (typeof LIFECYCLE_STATES)[number];

/**
 * `graded` from the spec's table is absent on purpose. Grading is an
 * independent axis, not a rung: `08_Coaching_Business.md` keeps Fit and
 * Temperature as separate axes precisely so they are not collapsed into one
 * number, and an app-native lead is ungraded today for want of inputs rather
 * than for want of progress. Read the grade from `leadGrade.ts` beside this,
 * never through it.
 */
export type LifecycleInput = {
  hasContact: boolean;
  /** The wave 1 booking rule, already evaluated. Passed in rather than computed
   *  here so the rule keeps exactly one home. */
  meetsSqlRule: boolean;
  consultationsHeld: number;
  /** Engagements at `agreed` or beyond. `proposed` is a pipeline, not a sale. */
  engagementsAgreed: number;
  placementsSigned: number;
  /** True when every channel they gave has been withdrawn for every purpose. */
  fullyWithdrawn: boolean;
};

/**
 * The highest state reached, not a position on a track.
 *
 * States are not a ladder anyone must climb in order. A lead can reach `client`
 * without ever being `sql` (`consultations.trigger: "manual"` exists for that),
 * and `placed` without being `client` at all (they got the job themselves and
 * told us). So this reads downward from the strongest evidence rather than
 * checking each rung.
 */
export function stateFor(input: LifecycleInput): LifecycleState | null {
  // Checked first and not last: someone who has asked to be left alone is that,
  // whatever else their record says, and a report that still called them a live
  // client would be the report that got them contacted again.
  if (input.fullyWithdrawn) return "withdrawn";

  if (input.placementsSigned > 0) return "placed";
  if (input.engagementsAgreed > 0) return "client";
  if (input.consultationsHeld > 0) return "consulted";
  if (input.meetsSqlRule && input.hasContact) return "sql";
  if (input.hasContact) return "lead";
  // Not a state. See the note on LIFECYCLE_STATES: without contact this is
  // traffic, and traffic has no position in a lifecycle.
  return null;
}

/**
 * The wave 1 booking gate, and the only rule in the whole framework that
 * decides whether someone gets a link rather than what to say to them. Decided
 * 14/08/2026, owned by `08_Coaching_Business.md`.
 *
 * Lifted out of `convex/leads.ts` on 15/08/2026 when the admin surface needed
 * the same answer. One rule, one home: a second copy would drift the day wave 2
 * opens, and wave 2 is already written down and deliberately held.
 *
 * `offer` is excluded. It dropped out on 15/08/2026 when the question stopped
 * merging "has an offer" with "negotiating"; while the two were one option the
 * merged value had to be included, and including it now would widen a cut the
 * owning document has not widened.
 */
export function meetsBookingGate(responses: Record<string, unknown> | undefined): boolean {
  const stage = typeof responses?.stage === "string" ? responses.stage : null;
  return (
    stage === "interviewing" ||
    // Added 15/08/2026 on Paul's call. Someone interviewing and not getting
    // through clears the gate: the market is engaging with them and something
    // specific is going wrong, which is exactly what a thirty-minute call can
    // find. Excluding them would have sent the link to everyone doing well and
    // nobody who was stuck, on a question whose whole job is to find the stuck.
    stage === "interviewing_unsuccessful" ||
    stage === "negotiating"
  );
}

/**
 * Reachable, in the sense the contact gate means it.
 *
 * The rule is enforced at write time in `leads.captureContact` (an email AND at
 * least one of LINE or phone, decided 08/08/2026 because Thai candidates
 * largely do not read email). This reads the same condition off a stored row,
 * which the mutation cannot do for the 90 leads imported before it existed.
 * If the two ever disagree, the mutation wins: it is what actually gates.
 */
export function hasContact(lead: {
  email?: string;
  phone?: string;
  lineId?: string;
}): boolean {
  return Boolean(lead.email) && Boolean(lead.phone || lead.lineId);
}

/** Ops-facing labels. Never candidate-facing; see the module note. */
export const LIFECYCLE_LABELS: Record<LifecycleState, string> = {
  lead: "Contactable",
  sql: "Meets the booking rule",
  consulted: "Call held",
  client: "Paid engagement",
  placed: "Signed a contract",
  withdrawn: "Asked us to stop",
};
