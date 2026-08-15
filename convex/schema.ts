import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Data model per `docs/prd.md` § 3, plus the `assessments` snapshot table from
 * `docs/candidate-data-architecture.md` L3.
 *
 * `leads.scores` stays denormalised (recomputed by `convex/scoring.ts` on every
 * answer submit, never on read) so reactive queries push chart updates with no
 * extra round-trip. `assessments` stores EVIDENCE, never scores: scores are a
 * pure function of responses, so a scoring fix retroactively corrects history
 * instead of contradicting it.
 */
export default defineSchema({
  // Convex Auth's own tables (users, sessions, accounts...). Only the single
  // admin account ever lands here; candidates are leads, not users.
  ...authTables,

  // One row per candidate session, from first partial answer onward.
  leads: defineTable({
    // Contact info: all optional until captured. Decided 08/08/2026, the unlock
    // requires a full name, an email, AND at least one of LINE ID or phone.
    // Email alone is not enough: it keeps the magic link deliverable (FR-011)
    // but Thai candidates largely do not read email, so a lead reachable only
    // there is not reachable. The live Lead Discovery Survey already asked for
    // both (`08_Coaching_Business.md` § A.1 and § A.3); the app had narrowed it
    // to email, which was a regression rather than a simplification.
    //
    // One field, not first/last: the survey asked ชื่อ-นามสกุล as a single
    // question, and a forced split produces junk for candidates who go by a
    // nickname.
    /**
     * Split since 10/08/2026. `fullName` is kept and still written, composed
     * from the two, because the 90 imported survey leads only ever had one
     * field and every read path already uses it.
     */
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    lineId: v.optional(v.string()),

    // Consent: each with its own timestamp for the PDPA audit trail.
    emailConsentAt: v.optional(v.number()),
    phoneConsentAt: v.optional(v.number()),
    lineConsentAt: v.optional(v.number()),

    /**
     * Where the consent above came from. `app` means it passed through the
     * contact gate: a per-channel tick, timestamped at the moment it was given.
     * `survey_import` means it came from the Lead Discovery Survey, which asked
     * "ช่องทางติดต่อที่สะดวกที่สุด" and carried no consent clause at all, so the
     * timestamp is the submission date and the basis is the question rather
     * than an explicit grant.
     *
     * Absent means `app`, since every lead predating the backfill came through
     * the gate. The distinction is recorded because a PDPA request asks what
     * someone agreed to, and "they told us how to reach them" and "they ticked
     * a box saying we may" are not the same answer.
     */
    consentSource: v.optional(v.union(v.literal("app"), v.literal("survey_import"))),

    // Relocation pathway: asked early, shapes the self-report commentary.
    pathway: v.optional(
      v.union(
        v.literal("job_first"),
        v.literal("study_first"),
        v.literal("family"),
        v.literal("not_sure"),
      ),
    ),

    // Raw answers keyed by question id. Deliberately loose: the question set
    // will evolve, and a rigid per-question schema would need a migration on
    // every content change. Shape is validated in application code.
    responses: v.optional(v.record(v.string(), v.any())),

    // Latest computed self-report dimension scores.
    scores: v.optional(
      v.object({
        professionalCapability: v.optional(v.number()),
        employability: v.optional(v.number()),
        mobilityReadiness: v.optional(v.number()),
        europeanMarketFit: v.optional(v.number()),
      }),
    ),

    // Lifecycle. `email_captured` keeps the PRD's vocabulary, but since
    // 08/08/2026 it means the whole contact set cleared the gate: name, email
    // and a LINE ID or phone number.
    status: v.union(
      v.literal("partial"),
      v.literal("email_captured"),
      v.literal("completed"),
    ),
    source: v.optional(v.string()), // e.g. "fb_pinned_post", "fb_consultation_hook"
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActivityAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status_recency", ["status", "lastActivityAt"])
    .index("by_pathway", ["pathway"]),

  // One active token per lead; regenerated on each email send. Older tokens
  // are invalidated by the generating mutation, not deleted: history stays.
  magicLinks: defineTable({
    leadId: v.id("leads"),
    token: v.string(), // long random string, never the document id
    expiresAt: v.number(), // Unix ms; createdAt + 30 days
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_lead", ["leadId"]),

  /**
   * Proof that a deletion happened, holding nothing about who it was.
   *
   * A deletion log that stored an email, or even a hash of one, would retain
   * data about the very person who asked to be forgotten, and a weak hash is
   * reversible enough to be the same thing. So this records the event and the
   * counts only. Tying it to a person is the coach's own record-keeping, which
   * is what `note` is for: "request received on LINE, 10/08/2026".
   */
  deletionLog: defineTable({
    deletedAt: v.number(),
    /** Which admin performed it. Their own data, not the subject's. */
    performedBy: v.string(),
    /** Free-text reference the coach supplies. Never paste the subject's details here. */
    note: v.optional(v.string()),
    counts: v.object({
      leads: v.number(),
      assessments: v.number(),
      magicLinks: v.number(),
      /**
       * Optional because rows written before `consultations` existed have no
       * such count, and backfilling a zero would claim we checked when the
       * table was not there to check.
       */
      consultations: v.optional(v.number()),
    }),
  }).index("by_time", ["deletedAt"]),

  /**
   * One row per call or session with a candidate, coach-side entirely.
   *
   * The funnel had no record of its own last step: `leads` tracked a candidate
   * from first partial answer to `completed` and stopped, so nothing stored
   * that a call happened, what it surfaced, or what was agreed. Spec and
   * reasoning in `booking-tracking.md`; the fields below come from that plus
   * the `kick-start` skill's run sheet and observation set, which is the
   * document that says what actually happens in these thirty minutes.
   *
   * A table rather than fields on `leads`, following `assessments`,
   * `magicLinks` and `deletionLog`: a candidate has more than one of these over
   * an engagement, and flat fields would overwrite the history that makes the
   * booking cut testable at all.
   *
   * Three rules this must not break, from that spec:
   *
   * - **It never enters the candidate view.** `views.ts` gains no field and
   *   `assertCandidateSafe()` should fail on this vocabulary as it does on
   *   `tier`.
   * - **An outcome never moves a score.** Services move coverage, never scores
   *   (`candidate-data-architecture.md`). A `no_show` is not evidence about
   *   anyone's employability. What the call *observed* is evidence, and its
   *   home is an `assessments` row with `source: "coach"`, not this table.
   * - **`nextStep` is the same pick as `firstAction`**, or the reason it
   *   differs is written down. Two competing answers to "what do I do first" is
   *   the failure `09_Decision_Log.md` already recorded once.
   */
  consultations: defineTable({
    leadId: v.id("leads"),

    /**
     * Kick-start is the free 30-minute first call, the only one with a run
     * sheet, and the only instrument in the funnel that reaches the
     * competencies a form cannot. The other three exist so the log does not
     * stop being usable the moment someone buys something.
     */
    type: v.union(
      v.literal("kick_start"),
      v.literal("engagement"),
      v.literal("follow_up"),
      v.literal("other"),
    ),

    outcome: v.union(
      v.literal("scheduled"),
      v.literal("held"),
      v.literal("no_show"),
      v.literal("cancelled"),
    ),

    /** When it happened, or when it is due to. Both live in one field on purpose. */
    heldAt: v.number(),
    durationMinutes: v.optional(v.number()),
    channel: v.optional(
      v.union(v.literal("line"), v.literal("meet"), v.literal("phone"), v.literal("other")),
    ),

    /**
     * Which language the call actually ran in, and it is not bookkeeping.
     *
     * The run sheet's default is English for the middle two blocks, because
     * that is the only test Business English gets: its ECRA lookup is a
     * self-report "verified where tested". A call held entirely in Thai did not
     * test it, so nobody may later promote that competency on the strength of
     * having had a call. This field is what makes that checkable afterwards.
     */
    language: v.optional(v.union(v.literal("thai"), v.literal("english"), v.literal("mixed"))),

    /** Their own question, verbatim. It is what the last five minutes must answer. */
    theirQuestion: v.optional(v.string()),
    /** The two strengths named back to them, from their own document. */
    strengthsNamed: v.optional(v.string()),

    /** The one action given. One item, never a list; the method forbids a list. */
    nextStep: v.optional(v.string()),
    /**
     * False when the action given differed from the app's `firstAction`.
     *
     * The skill is explicit that a disagreement between the two is a bug to
     * log rather than a thing to tell the candidate, so the log has to be able
     * to hold the disagreement.
     */
    nextStepMatchesApp: v.optional(v.boolean()),

    /**
     * The salary figure with the role and the country it was quoted against.
     * Free text because a number alone cannot be classified, and the benchmark
     * is a manual coach lookup rather than a formula.
     */
    salaryQuote: v.optional(v.string()),

    /** Which module they would buy. A conclusion for the file, never said in the call. */
    moduleFit: v.optional(v.string()),

    /**
     * The three ICP inputs, collected conversationally in the first five
     * minutes: Gate 1, Gate 2 and Investment Readiness in that order.
     *
     * Captured here, deliberately not applied. Every app-native lead arrives
     * ungraded because Stage 1 asks for none of them, and this is where they
     * first exist. Writing them back into the grade is a separate decision,
     * because a coach-collected answer belongs in an `assessments` row with
     * `source: "coach"` rather than being quietly merged into self-report.
     */
    icpJobTitle: v.optional(v.string()),
    icpExperienceYears: v.optional(v.string()),
    icpPriorInvestment: v.optional(v.string()),

    /**
     * When the same-day Thai follow-up went out. Absent on a held call is the
     * queue: the free Calendly tier sends nothing, the follow-up is manual, and
     * it is the step most likely to be missed.
     */
    followUpSentAt: v.optional(v.number()),

    notes: v.optional(v.string()),

    /** Which admin wrote the row. Their own data, not the candidate's. */
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lead_time", ["leadId", "heldAt"])
    // The follow-up and reminder queues: what is coming up, across all leads.
    .index("by_time", ["heldAt"]),

  // Point-in-time evidence snapshots, the trajectory layer. A delta between
  // two snapshots is what makes "get their score up" measurable, and the
  // source field carries attribution: an "app" change stays self-reported, a
  // "coach" change is verified.
  assessments: defineTable({
    leadId: v.id("leads"),
    takenAt: v.number(),
    source: v.union(
      v.literal("survey_import"), // backfilled from the Google Form era
      v.literal("app"), // the candidate's own answers in this app
      v.literal("coach"), // coach-verified corrections during an engagement
    ),
    responses: v.record(v.string(), v.any()),
  }).index("by_lead_time", ["leadId", "takenAt"]),
});
