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

export const LIFECYCLE_STATES = [
  "visitor",
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
export function stateFor(input: LifecycleInput): LifecycleState {
  // Checked first and not last: someone who has asked to be left alone is that,
  // whatever else their record says, and a report that still called them a live
  // client would be the report that got them contacted again.
  if (input.fullyWithdrawn) return "withdrawn";

  if (input.placementsSigned > 0) return "placed";
  if (input.engagementsAgreed > 0) return "client";
  if (input.consultationsHeld > 0) return "consulted";
  if (input.meetsSqlRule && input.hasContact) return "sql";
  if (input.hasContact) return "lead";
  return "visitor";
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
  return stage === "interviewing" || stage === "negotiating";
}

/** Ops-facing labels. Never candidate-facing; see the module note. */
export const LIFECYCLE_LABELS: Record<LifecycleState, string> = {
  visitor: "Started, no contact",
  lead: "Contactable",
  sql: "Meets the booking rule",
  consulted: "Call held",
  client: "Paid engagement",
  placed: "Signed a contract",
  withdrawn: "Asked us to stop",
};
