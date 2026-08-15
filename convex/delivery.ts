/**
 * Engagements and deliverables: what was sold, and what was done.
 * Spec: `lifecycle-data-model.md` §§ 7 and 8. Built 15/08/2026.
 *
 * Coach surface entirely. Every function goes through `requireAdmin`, and none
 * of this reaches `views.ts`: a candidate's own surface shows their assessment
 * and their next step, never the commercial record behind it.
 *
 * **The rule this module must not break.** A delivered service moves coverage,
 * never a score (`candidate-data-architecture.md`). Nothing here writes to
 * `assessments`, and nothing here recomputes anything. Recording that a mock
 * interview happened is not evidence about anyone's interview skills; what the
 * mock interview *observed* is, and that goes in an `assessments` row with
 * `source: "coach"` and a `note` saying why.
 */

import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./leads";

const moduleValidator = v.union(
  v.literal("career_coaching"),
  v.literal("profile_optimization"),
  v.literal("job_application_lifecycle"),
  v.literal("bundle"),
);

const engagementStatusValidator = v.union(
  v.literal("proposed"),
  v.literal("agreed"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("lapsed"),
  v.literal("refunded"),
);

const deliverableKindValidator = v.union(
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
);

const methodStageValidator = v.union(
  v.literal("direction"),
  v.literal("route"),
  v.literal("legibility"),
  v.literal("execution"),
);

export const createEngagement = mutation({
  args: {
    leadId: v.id("leads"),
    module: moduleValidator,
    status: engagementStatusValidator,
    quotedThb: v.optional(v.number()),
    agreedThb: v.optional(v.number()),
    fromConsultation: v.optional(v.id("consultations")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    const now = Date.now();
    // The timestamp is set from the status rather than asked for, so a row can
    // never claim it was agreed on a date while sitting at `proposed`.
    return await ctx.db.insert("engagements", {
      leadId: args.leadId,
      module: args.module,
      status: args.status,
      ...(args.quotedThb !== undefined ? { quotedThb: args.quotedThb } : {}),
      ...(args.agreedThb !== undefined ? { agreedThb: args.agreedThb } : {}),
      ...(args.fromConsultation ? { fromConsultation: args.fromConsultation } : {}),
      ...(args.notes ? { notes: args.notes } : {}),
      proposedAt: now,
      ...(args.status !== "proposed" ? { agreedAt: now } : {}),
      createdBy: adminEmail,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateEngagement = mutation({
  args: {
    engagementId: v.id("engagements"),
    status: v.optional(engagementStatusValidator),
    agreedThb: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.engagementId);
    if (!row) throw new ConvexError("Engagement not found.");

    const now = Date.now();
    // Each stamp is written once, on the first transition into that status. A
    // row that goes active, lapses and revives keeps the date it really started.
    const stamps: Record<string, number> = {};
    if (args.status && args.status !== row.status) {
      if (args.status !== "proposed" && row.agreedAt === undefined) stamps.agreedAt = now;
      if (args.status === "active" && row.startedAt === undefined) stamps.startedAt = now;
      if (args.status === "completed" && row.completedAt === undefined) stamps.completedAt = now;
    }

    await ctx.db.patch(args.engagementId, {
      ...(args.status ? { status: args.status } : {}),
      ...(args.agreedThb !== undefined ? { agreedThb: args.agreedThb } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      ...stamps,
      updatedAt: now,
    });
  },
});

export const addDeliverable = mutation({
  args: {
    engagementId: v.id("engagements"),
    kind: deliverableKindValidator,
    methodStage: methodStageValidator,
    status: v.optional(
      v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("delivered")),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const engagement = await ctx.db.get(args.engagementId);
    if (!engagement) throw new ConvexError("Engagement not found.");

    const now = Date.now();
    const status = args.status ?? "not_started";
    return await ctx.db.insert("deliverables", {
      engagementId: args.engagementId,
      // Copied from the engagement, never from an argument: a caller-supplied
      // leadId could file a deliverable under a different person entirely.
      leadId: engagement.leadId,
      kind: args.kind,
      methodStage: args.methodStage,
      status,
      ...(status === "delivered" ? { deliveredAt: now } : {}),
      ...(args.notes ? { notes: args.notes } : {}),
      by: adminEmail,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    status: v.optional(
      v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("delivered")),
    ),
    /**
     * The `assessments` row this piece of work produced.
     *
     * Supplied rather than created here on purpose. Writing an assessment is a
     * claim about a person's competencies and it needs its own `note` saying
     * what was observed and why; manufacturing one as a side effect of ticking
     * "delivered" is how a service starts silently moving a score.
     */
    producedAssessment: v.optional(v.id("assessments")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.deliverableId);
    if (!row) throw new ConvexError("Deliverable not found.");

    if (args.producedAssessment) {
      const assessment = await ctx.db.get(args.producedAssessment);
      if (!assessment) throw new ConvexError("Assessment not found.");
      // A deliverable for one person may not point at another person's
      // evidence. Cheap to check, and impossible to spot later if it happens.
      if (assessment.leadId !== row.leadId) {
        throw new ConvexError("That assessment belongs to a different lead.");
      }
    }

    const now = Date.now();
    await ctx.db.patch(args.deliverableId, {
      ...(args.status ? { status: args.status } : {}),
      ...(args.status === "delivered" && row.deliveredAt === undefined
        ? { deliveredAt: now }
        : {}),
      ...(args.producedAssessment ? { producedAssessment: args.producedAssessment } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      updatedAt: now,
    });
  },
});

/** Everything sold to one person, with the work under each engagement. */
export const forLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const engagements = await ctx.db
      .query("engagements")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();

    return engagements
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((e) => ({
        ...e,
        deliverables: deliverables
          .filter((d) => d.engagementId === e._id)
          .sort((a, b) => a.createdAt - b.createdAt),
      }));
  },
});
