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
    // Contact info: all optional until captured; email is the "minimum contact
    // info" trigger that makes a lead real.
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    lineId: v.optional(v.string()),

    // Consent: each with its own timestamp for the PDPA audit trail.
    emailConsentAt: v.optional(v.number()),
    phoneConsentAt: v.optional(v.number()),
    lineConsentAt: v.optional(v.number()),

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

    // Lifecycle.
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
