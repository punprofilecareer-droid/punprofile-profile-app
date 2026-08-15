import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Data model per `docs/prd.md` § 3, plus the `assessments` snapshot table from
 * `docs/candidate-data-architecture.md` L3.
 *
 * `assessments` stores EVIDENCE, never scores: scores are a pure function of
 * responses, so a scoring fix retroactively corrects history instead of
 * contradicting it. Since 15/08/2026 `leads.scores` follows the same rule and
 * is no longer written or read; see its own note below.
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
    /** @absent unmeasured — not captured until the contact gate clears */
    firstName: v.optional(v.string()),
    /** @absent unmeasured — not captured until the contact gate clears */
    lastName: v.optional(v.string()),
    /** @absent unmeasured — composed from the two above once both exist */
    fullName: v.optional(v.string()),
    /** @absent unmeasured — not captured until the contact gate clears */
    email: v.optional(v.string()),
    /** @absent none — they gave LINE instead; one of the two is required, not both */
    phone: v.optional(v.string()),
    /** @absent none — they gave a phone number instead; one of the two is required */
    lineId: v.optional(v.string()),

    /**
     * Consent: each with its own timestamp for the PDPA audit trail.
     *
     * **Superseded 15/08/2026 by `consentEvents`, still written.** These are in
     * the middle of the same three-step retirement `leads.scores` went through:
     * dual-write now, stop reading next, clear and remove last. Every read path
     * already resolves from `consentEvents`; these remain only so a rollback
     * before the backfill is verified does not lose the grants.
     *
     * Do not add a fourth. A new channel or a new purpose is an event.
     */
    /** @absent notyet — legacy. absent means no grant recorded in the old shape */
    emailConsentAt: v.optional(v.number()),
    /** @absent notyet — legacy. absent means the channel was left blank */
    phoneConsentAt: v.optional(v.number()),
    /** @absent notyet — legacy. absent means the channel was left blank */
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
    /** @absent default:"app" — every lead predating the 10/08/2026 backfill came through the gate */
    consentSource: v.optional(v.union(v.literal("app"), v.literal("survey_import"))),

    // Relocation pathway: asked early, shapes the self-report commentary.
    /** @absent unmeasured — they have not reached question 1 yet */
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
    /** @absent default:{} — no question answered yet */
    responses: v.optional(v.record(v.string(), v.any())),

    /**
     * **Legacy. Written by nothing, read by nothing, since 15/08/2026.**
     *
     * This held the denormalised dimension scores, computed at answer time.
     * PRD § 3 justified the denormalisation as what made the chart reactive
     * without a round-trip, and that turned out not to be what it was buying:
     * recomputing inside the query is just as reactive.
     *
     * What it did buy was drift. A stored score is a number produced by
     * whichever model was running the day the candidate answered, and Country
     * Reach landing on 13/08/2026 invalidated every score computed before it
     * without anything noticing. Every read now calls `scoresFor`.
     *
     * Kept in the schema only because ~160 documents still carry the field and
     * removing it needs a migration to clear them first. The values in those
     * documents are stale by construction and must not be read.
     */
    /** @absent none — dead field. written by nothing, read by nothing since 15/08/2026 */
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
    /** @absent unmeasured — arrived without a source parameter, origin unknown */
    source: v.optional(v.string()), // e.g. "fb_pinned_post", "fb_consultation_hook"
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActivityAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status_recency", ["status", "lastActivityAt"])
    .index("by_pathway", ["pathway"]),

  /**
   * Consent as an append-only event log. Spec: `lifecycle-data-model.md` § 6.
   * Built 15/08/2026. Resolution logic is `src/lib/consent.ts`, which is where
   * the reasoning lives; this is only the shape.
   *
   * It replaces the three flat timestamps on `leads`, which could record a
   * grant and not a withdrawal, and could not tell "we may send you your
   * result" apart from "we may send you a job digest every week". Those are
   * different agreements and only the first has ever been asked for.
   *
   * Nothing here is ever patched or deleted, except by the cascade in
   * `leads.deleteLeadOnRequest`. An amended consent record is not evidence.
   */
  consentEvents: defineTable({
    leadId: v.id("leads"),
    channel: v.union(v.literal("email"), v.literal("line"), v.literal("phone")),
    /** `service` is your result and your booking. `marketing` is digests and
     *  nurture, and no one has been asked for it yet. */
    purpose: v.union(v.literal("service"), v.literal("marketing")),
    action: v.union(v.literal("opt_in"), v.literal("opt_out")),
    at: v.number(),

    /**
     * How the permission was obtained. Kept granular because a PDPA request
     * asks what someone agreed to, and "ticked a box" and "the published post
     * said submitting means they agree" are different answers.
     *
     * `public_notice` is Paul's recorded basis, 15/08/2026: the social post
     * carrying the link stated that submitting constitutes acceptance.
     * `founder_backfill` is superseded by it and is written by nothing.
     */
    basis: v.union(
      v.literal("app_tick"),
      v.literal("survey_import"),
      v.literal("public_notice"),
      v.literal("founder_backfill"),
      v.literal("coach_recorded"),
      v.literal("unsubscribe_link"),
      v.literal("reply_or_block"),
    ),

    /** The sentence actually shown at the moment of the tick, or where a
     *  withdrawal arrived. A consent record that cannot say what was agreed to
     *  is a timestamp, not evidence. */
    /** @absent unmeasured — the wording shown was not captured for this row */
    evidence: v.optional(v.string()),
    /** Which admin recorded it, when a human did. Their data, not the subject's. */
    /** @absent none — no human recorded it; it came from the gate or a migration */
    by: v.optional(v.string()),
  })
    .index("by_lead", ["leadId", "at"])
    .index("by_lead_scope", ["leadId", "channel", "purpose", "at"]),

  // One active token per lead; regenerated on each email send. Older tokens
  // are invalidated by the generating mutation, not deleted: history stays.
  magicLinks: defineTable({
    leadId: v.id("leads"),
    token: v.string(), // long random string, never the document id
    expiresAt: v.number(), // Unix ms; createdAt + 30 days
    /** @absent notyet — the link has not been followed. absent IS the unused state */
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
    /** @absent none — the coach supplied no reference */
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
      /** Optional for the same reason as `consultations`: rows written before
       *  `consentEvents` existed have no such count, and a backfilled zero
       *  would claim we checked when the table was not there to check. */
      consentEvents: v.optional(v.number()),
      /** Optional for the same reason again: rows written before these tables
       *  existed have no such count. */
      engagements: v.optional(v.number()),
      deliverables: v.optional(v.number()),
      applications: v.optional(v.number()),
      placements: v.optional(v.number()),
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
      v.literal("invited"),
      v.literal("scheduled"),
      v.literal("held"),
      v.literal("no_show"),
      v.literal("cancelled"),
      v.literal("expired"),
    ),

    /**
     * When it happened, or when it is due to. Both live in one field on purpose.
     *
     * `booking-tracking.md` specified a separate `scheduledFor`. One field
     * instead, because two would need keeping in step for no gain: a row is
     * either a slot in the future or a call in the past, never both, and the
     * outcome already says which.
     */
    heldAt: v.number(),

    // ---------------------------------------------------------- the invitation
    //
    // From `booking-tracking.md`, built 15/08/2026. Entered by hand: the free
    // Calendly tier has no webhooks, no API and no Zapier, so nothing can push
    // this in. Five seconds when the confirmation lands, and no integration to
    // maintain. It breaks silently the day it is forgotten, which is the
    // accepted cost of the free tier rather than of this design.

    /**
     * What fired the send, and the field that makes the wave 1 cut measurable.
     *
     * It records the RULE, not the person's answers, so changing the rule later
     * does not rewrite the history of what the old rule actually produced.
     */
    /** @absent unmeasured — rows written before the field existed */
    trigger: v.optional(
      v.union(
        v.literal("survey_stage_wave1"), // interviewing or negotiating
        v.literal("survey_urgent_wave2"), // within 3 months and applying or later
        v.literal("manual"), // coach judgement, no rule fired
      ),
    ),
    /** @absent notyet — no invitation sent yet */
    sentAt: v.optional(v.number()),
    /** @absent notyet — no invitation sent yet */
    sentChannel: v.optional(v.union(v.literal("line"), v.literal("email"))),
    /**
     * When they chose a slot. The gap between `sentAt` and this is the only
     * read anyone gets on whether the message worked.
     */
    /** @absent notyet — they have not chosen a slot. absent IS the not-booked state */
    bookedAt: v.optional(v.number()),
    /** Manual, because the free tier sends no reminders. Absent is the queue. */
    /** @absent notyet — absent IS the reminder queue; the free tier sends none */
    reminderSentAt: v.optional(v.number()),
    /** @absent unmeasured — not recorded */
    durationMinutes: v.optional(v.number()),
    /** @absent unmeasured — not recorded */
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
    /** @absent unmeasured — not recorded. must NOT be read as English */
    language: v.optional(v.union(v.literal("thai"), v.literal("english"), v.literal("mixed"))),

    /** Their own question, verbatim. It is what the last five minutes must answer. */
    /** @absent unmeasured — not written down */
    theirQuestion: v.optional(v.string()),
    /** The two strengths named back to them, from their own document. */
    /** @absent unmeasured — not written down */
    strengthsNamed: v.optional(v.string()),

    /** The one action given. One item, never a list; the method forbids a list. */
    /** @absent notyet — no action given yet, or the call has not happened */
    nextStep: v.optional(v.string()),
    /**
     * False when the action given differed from the app's `firstAction`.
     *
     * The skill is explicit that a disagreement between the two is a bug to
     * log rather than a thing to tell the candidate, so the log has to be able
     * to hold the disagreement.
     */
    /** @absent unmeasured — never compared. absent is NOT agreement */
    nextStepMatchesApp: v.optional(v.boolean()),

    /**
     * The salary figure with the role and the country it was quoted against.
     * Free text because a number alone cannot be classified, and the benchmark
     * is a manual coach lookup rather than a formula.
     */
    /** @absent unmeasured — salary did not come up */
    salaryQuote: v.optional(v.string()),

    /** Which module they would buy. A conclusion for the file, never said in the call. */
    /** @absent notyet — no conclusion reached yet */
    moduleFit: v.optional(v.string()),

    /**
     * The three ICP inputs, collected conversationally in the first five
     * minutes: Gate 1, Gate 2 and Investment Readiness in that order.
     *
     * **These now feed the grade**, decided 15/08/2026. Every app-native lead
     * arrived ungraded because Stage 1 asks for none of them, and a grade that
     * stays blank after you have spoken to someone for half an hour is not
     * measuring caution, it is just missing.
     *
     * They are not merged into `leads.responses`. The grade reads them from
     * here, so a coach-collected answer keeps its attribution: who recorded it,
     * on what date, in which call. Self-report and observation stay
     * distinguishable, which is the rule the whole scoring model rests on.
     *
     * Two are closed-choice for that reason: an answer that has to reach a
     * lookup cannot be free text. The job title stays free text because Gate 1
     * classifies through the Job Title Pool, which is not loaded, so nothing
     * here may classify it.
     */
    /** @absent unmeasured — not collected on this call */
    icpJobTitle: v.optional(v.string()),
    /** @absent unmeasured — not collected. never scored as a zero */
    icpExperienceYears: v.optional(
      v.union(v.literal("0-1"), v.literal("2-10"), v.literal("11-15"), v.literal("16+")),
    ),
    /** @absent unmeasured — not collected. never scored as none */
    icpPriorInvestment: v.optional(
      v.union(v.literal("none"), v.literal("unrelated"), v.literal("relevant")),
    ),

    /**
     * When the same-day Thai follow-up went out. Absent on a held call is the
     * queue: the free Calendly tier sends nothing, the follow-up is manual, and
     * it is the step most likely to be missed.
     */
    /** @absent notyet — absent on a held call IS the follow-up queue */
    followUpSentAt: v.optional(v.number()),

    /** @absent none — nothing further to record */
    notes: v.optional(v.string()),

    /** Which admin wrote the row. Their own data, not the candidate's. */
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lead_time", ["leadId", "heldAt"])
    // The follow-up and reminder queues: what is coming up, across all leads.
    .index("by_time", ["heldAt"]),

  /**
   * What was sold. Spec: `lifecycle-data-model.md` § 7, built 15/08/2026.
   *
   * The funnel had no record past the consultation: `leads` stops at
   * `completed` and `consultations` stops when the call ends, so the fact that
   * somebody paid lived nowhere but Paul's memory. A row here at `agreed` is
   * what makes a person a client; a row at `proposed` is a pipeline and not a
   * client, which is why one status field covers both.
   */
  engagements: defineTable({
    leadId: v.id("leads"),

    /** Names come from `01_Project_Foundation.md` Core Offerings and must stay
     *  in step with the module names `levers.ts` already validates. `bundle` is
     *  its own value rather than four rows, because that is how it is priced. */
    module: v.union(
      v.literal("career_coaching"),
      v.literal("profile_optimization"),
      v.literal("job_application_lifecycle"),
      v.literal("bundle"),
    ),

    status: v.union(
      v.literal("proposed"),
      v.literal("agreed"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("lapsed"),
      v.literal("refunded"),
    ),

    /** THB. A fact about this one transaction, never a copy of the pricing
     *  table, which stays owned by `01_Project_Foundation.md` and is an
     *  explicit pilot hypothesis until real leads validate it. */
    /** @absent unmeasured — no figure quoted. never zero */
    quotedThb: v.optional(v.number()),
    /** @absent notyet — nothing agreed yet, or agreed without a recorded figure */
    agreedThb: v.optional(v.number()),

    /** @absent unmeasured — rows written before the field existed */
    proposedAt: v.optional(v.number()),
    /** @absent notyet — still at proposed. absent IS the not-sold state */
    agreedAt: v.optional(v.number()),
    /** @absent notyet — agreed but not started */
    startedAt: v.optional(v.number()),
    /** @absent notyet — still running */
    completedAt: v.optional(v.number()),

    /** Which call produced the sale. `consultations.moduleFit` is the coach's
     *  pre-sale conclusion; this is what actually happened. */
    /** @absent none — no call produced it; coach judgement or inbound */
    fromConsultation: v.optional(v.id("consultations")),

    /** @absent none — nothing further to record */
    notes: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lead", ["leadId", "createdAt"])
    .index("by_status", ["status", "updatedAt"]),

  /**
   * What was actually done inside an engagement. `lifecycle-data-model.md` § 8.
   *
   * The rule that keeps this table honest: **a delivered service moves
   * coverage, never a score** (`candidate-data-architecture.md`). Doing a CV
   * review does not raise anyone's CV Quality; what the review *observed*
   * raises it, and that belongs in an `assessments` row with `source: "coach"`.
   * `producedAssessment` is the pointer between the two, so "we did the work"
   * and "here is what the work found" can never be the same record.
   */
  deliverables: defineTable({
    engagementId: v.id("engagements"),
    /** Denormalised for the per-person timeline query only. Never authoritative;
     *  the engagement owns the relationship. */
    leadId: v.id("leads"),

    kind: v.union(
      v.literal("base_cv"),
      v.literal("linkedin"),
      v.literal("portfolio"),
      v.literal("country_research"),
      v.literal("tailored_application"),
      v.literal("interview_prep"),
      v.literal("mock_interview"),
      v.literal("offer_review"),
      v.literal("contract_review"),
      v.literal("coaching_session"),
    ),

    /** From `10_Methodology.md` § 4. It labels which stage's work this was. It
     *  never decides what the candidate does next: that is the gates, and two
     *  mechanisms answering "what do I do first" is the failure
     *  `09_Decision_Log.md` already recorded once. */
    methodStage: v.union(
      v.literal("direction"),
      v.literal("route"),
      v.literal("legibility"),
      v.literal("execution"),
    ),

    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("delivered"),
    ),
    /** @absent notyet — not delivered. absent IS the outstanding state */
    deliveredAt: v.optional(v.number()),
    /** @absent none — this work produced no coach observation worth recording */
    producedAssessment: v.optional(v.id("assessments")),

    /** @absent none — nothing further to record */
    notes: v.optional(v.string()),
    by: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_engagement", ["engagementId", "createdAt"])
    .index("by_lead", ["leadId", "createdAt"]),

  /**
   * The candidate's own job list. `lifecycle-data-model.md` § 9.
   *
   * This absorbs the `savedJobs` table TASK-059 proposed rather than sitting
   * beside it: a saved job and an applied job are the same job at two statuses,
   * and two tables would need a link that is only ever one-to-one.
   *
   * TASK-059 is explicit that this is the candidate's notebook and **nothing
   * infers status**. `recordedBy` is what enforces that: a coach-entered status
   * is visibly a coach's, and no code may move a candidate's row on their
   * behalf.
   */
  applications: defineTable({
    leadId: v.id("leads"),
    /** Absent means they did this without a paid engagement, which is the
     *  common case and must stay representable. */
    /** @absent none — they did this without a paid engagement, the common case */
    engagementId: v.optional(v.id("engagements")),

    /** Set when the job came from the personalised feed, so the channel's own
     *  pipeline can be joined back to what candidates did with it. */
    /** @absent none — the job did not come from our own feed */
    jobLogId: v.optional(v.string()),
    employer: v.string(),
    roleTitle: v.string(),
    country: v.string(),
    /** @absent unmeasured — no link captured */
    jobUrl: v.optional(v.string()),

    status: v.union(
      v.literal("interested"), // saved, not applied: TASK-059's bookmark state
      v.literal("applied"),
      v.literal("screening"),
      v.literal("interviewing"),
      v.literal("offer"),
      v.literal("rejected"),
      v.literal("withdrawn"),
      v.literal("accepted"),
    ),
    recordedBy: v.union(v.literal("candidate"), v.literal("coach")),

    savedAt: v.number(),
    /** @absent notyet — saved but not applied. absent IS the bookmark state */
    appliedAt: v.optional(v.number()),
    statusChangedAt: v.number(),
    /** @absent none — nothing further to record */
    notes: v.optional(v.string()),
  })
    .index("by_lead_time", ["leadId", "savedAt"])
    .index("by_lead_status", ["leadId", "status", "statusChangedAt"]),

  /**
   * The outcome the whole business is measured on.
   * `lifecycle-data-model.md` § 9, and `01_Project_Foundation.md` Success
   * Metrics: "interviews secured, offers received, contracts signed".
   *
   * `signedAt` is the moment `10_Methodology.md` Stage 3 exits, and the moment
   * a person stops being a client and becomes a placement.
   */
  placements: defineTable({
    leadId: v.id("leads"),
    /** @absent none — not linked to a tracked application */
    applicationId: v.optional(v.id("applications")),

    employer: v.string(),
    roleTitle: v.string(),
    country: v.string(),

    /** @absent unmeasured — the offer date was not recorded */
    offerAt: v.optional(v.number()),
    /** @absent notyet — offer not signed. absent IS the unsigned state, and gates the placed lifecycle state */
    signedAt: v.optional(v.number()),
    /** @absent notyet — start date not agreed or not known */
    startAt: v.optional(v.number()),

    /** Free text carrying its own currency and period, for the same reason
     *  `consultations.salaryQuote` is: a bare number cannot be classified, and
     *  the benchmark is a manual coach lookup rather than a formula. */
    /** @absent unmeasured — not disclosed. never zero */
    salary: v.optional(v.string()),

    /** The route that actually worked. The single most valuable field here for
     *  `07_Reference.md`, because it is the only place a claimed visa route is
     *  ever confirmed against reality. */
    /** @absent unmeasured — not recorded */
    visaRoute: v.optional(v.string()),

    /**
     * Coach judgement, recorded as judgement rather than inferred.
     * `engagement` means PunProfile did the work on this application;
     * `assisted` means an engagement existed but this was not it; `self` means
     * they got there alone and told us.
     *
     * Success metrics read this field. A metric that counted rows instead would
     * claim credit for every placement anyone ever reported, which is the exact
     * shape of overstatement `01_Project_Foundation.md` Accuracy forbids.
     */
    attributedTo: v.union(
      v.literal("engagement"),
      v.literal("assisted"),
      v.literal("self"),
    ),
    /** @absent none — attributedTo is self or assisted, so there is no engagement to name */
    attributedEngagementId: v.optional(v.id("engagements")),

    /** Permission to tell their story is its own grant and is implied by
     *  nothing above. The Social Proof pillar in `Content_Strategy.md` is empty
     *  and this is the field that eventually fills it, honestly. */
    /** @absent notyet — permission to tell the story has not been given. absent means DO NOT publish */
    storyConsentAt: v.optional(v.number()),

    /** @absent none — nothing further to record */
    notes: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lead", ["leadId", "createdAt"])
    .index("by_signed", ["signedAt"]),

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

    /**
     * Why the coach changed it. Added 15/08/2026, when this table stopped being
     * written by nothing and became the correction layer.
     *
     * The reason is the point, not decoration. Candidates contradict
     * themselves, and "they said B2 on the form and could not hold a sentence
     * in English on the call" is the fact worth keeping. A corrected value with
     * no reason is just a second opinion with better formatting.
     */
    /** @absent none — no reason recorded; expected on app and import rows, a gap on coach rows */
    note: v.optional(v.string()),
    /** Which admin made the correction. Their own data, not the candidate's. */
    /** @absent none — not a human correction; it came from the app or an import */
    by: v.optional(v.string()),
  }).index("by_lead_time", ["leadId", "takenAt"]),
});
