/**
 * Applications and placements: what the candidate did with the work, and
 * whether it ended in a contract. Spec: `lifecycle-data-model.md` § 9.
 * Built 15/08/2026.
 *
 * Two rules carried from the specs this implements:
 *
 * - **Nothing infers an application's status.** TASK-059 is explicit that the
 *   job list is the candidate's own notebook. `recordedBy` marks whose hand
 *   moved a row, and no code path may advance one on the candidate's behalf.
 * - **A placement does not claim credit by existing.** `attributedTo` is a
 *   coach's judgement, recorded as judgement. Success metrics read that field;
 *   counting rows instead would claim every placement anyone ever reported.
 */

import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./leads";

const applicationStatusValidator = v.union(
  v.literal("interested"),
  v.literal("applied"),
  v.literal("screening"),
  v.literal("interviewing"),
  v.literal("offer"),
  v.literal("rejected"),
  v.literal("withdrawn"),
  v.literal("accepted"),
);

/**
 * Coach-entered for now. The candidate-facing half arrives with TASK-059, which
 * needs an account first (`lifecycle-data-model.md` § 10): with no login there
 * is no way for a candidate's own list to follow them to another device, and a
 * job list that vanishes is worse than none.
 */
export const recordApplication = mutation({
  args: {
    leadId: v.id("leads"),
    engagementId: v.optional(v.id("engagements")),
    jobLogId: v.optional(v.string()),
    employer: v.string(),
    roleTitle: v.string(),
    country: v.string(),
    jobUrl: v.optional(v.string()),
    status: applicationStatusValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");
    if (args.engagementId) {
      const engagement = await ctx.db.get(args.engagementId);
      if (!engagement) throw new ConvexError("Engagement not found.");
      if (engagement.leadId !== args.leadId) {
        throw new ConvexError("That engagement belongs to a different lead.");
      }
    }

    const employer = args.employer.trim();
    const roleTitle = args.roleTitle.trim();
    const country = args.country.trim();
    if (!employer) throw new ConvexError("Employer is required.");
    if (!roleTitle) throw new ConvexError("Role title is required.");
    if (!country) throw new ConvexError("Country is required.");

    const now = Date.now();
    return await ctx.db.insert("applications", {
      leadId: args.leadId,
      ...(args.engagementId ? { engagementId: args.engagementId } : {}),
      ...(args.jobLogId ? { jobLogId: args.jobLogId } : {}),
      employer,
      roleTitle,
      country,
      ...(args.jobUrl ? { jobUrl: args.jobUrl } : {}),
      status: args.status,
      recordedBy: "coach",
      savedAt: now,
      // Only when they have actually applied. `interested` is a bookmark and
      // stamping it would make the application count wrong from the first row.
      ...(args.status !== "interested" ? { appliedAt: now } : {}),
      statusChangedAt: now,
      ...(args.notes ? { notes: args.notes } : {}),
    });
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: applicationStatusValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.applicationId);
    if (!row) throw new ConvexError("Application not found.");

    // A coach may correct their own record. Overwriting one the candidate
    // entered would be the app deciding what someone's own job search is doing,
    // which is the thing TASK-059 rules out.
    if (row.recordedBy === "candidate") {
      throw new ConvexError(
        "This row is the candidate's own. A coach may add a note, not move their status.",
      );
    }

    const now = Date.now();
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      ...(args.status !== "interested" && row.appliedAt === undefined ? { appliedAt: now } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      statusChangedAt: now,
    });
  },
});

export const recordPlacement = mutation({
  args: {
    leadId: v.id("leads"),
    applicationId: v.optional(v.id("applications")),
    employer: v.string(),
    roleTitle: v.string(),
    country: v.string(),
    offerAt: v.optional(v.number()),
    signedAt: v.optional(v.number()),
    startAt: v.optional(v.number()),
    salary: v.optional(v.string()),
    visaRoute: v.optional(v.string()),
    attributedTo: v.union(v.literal("engagement"), v.literal("assisted"), v.literal("self")),
    attributedEngagementId: v.optional(v.id("engagements")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    // Attributing a placement to an engagement that does not exist, or belongs
    // to someone else, would overstate the business's own results. Checked
    // rather than trusted, because this is the number that ends up in a pitch.
    if (args.attributedTo === "engagement" && !args.attributedEngagementId) {
      throw new ConvexError("Attributing to an engagement requires naming which one.");
    }
    if (args.attributedEngagementId) {
      const engagement = await ctx.db.get(args.attributedEngagementId);
      if (!engagement) throw new ConvexError("Engagement not found.");
      if (engagement.leadId !== args.leadId) {
        throw new ConvexError("That engagement belongs to a different lead.");
      }
    }
    if (args.applicationId) {
      const application = await ctx.db.get(args.applicationId);
      if (!application) throw new ConvexError("Application not found.");
      if (application.leadId !== args.leadId) {
        throw new ConvexError("That application belongs to a different lead.");
      }
    }

    const now = Date.now();
    return await ctx.db.insert("placements", {
      leadId: args.leadId,
      ...(args.applicationId ? { applicationId: args.applicationId } : {}),
      employer: args.employer.trim(),
      roleTitle: args.roleTitle.trim(),
      country: args.country.trim(),
      ...(args.offerAt !== undefined ? { offerAt: args.offerAt } : {}),
      ...(args.signedAt !== undefined ? { signedAt: args.signedAt } : {}),
      ...(args.startAt !== undefined ? { startAt: args.startAt } : {}),
      ...(args.salary ? { salary: args.salary } : {}),
      ...(args.visaRoute ? { visaRoute: args.visaRoute } : {}),
      attributedTo: args.attributedTo,
      ...(args.attributedEngagementId
        ? { attributedEngagementId: args.attributedEngagementId }
        : {}),
      ...(args.notes ? { notes: args.notes } : {}),
      createdBy: adminEmail,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Permission to tell their story, recorded separately from everything else.
 *
 * Its own mutation rather than a field on `recordPlacement`, because it is
 * almost never given at the same moment: the contract is signed in one
 * conversation and the "may we write about this" is asked in another, often
 * months later.
 */
export const recordStoryConsent = mutation({
  args: { placementId: v.id("placements"), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.placementId);
    if (!row) throw new ConvexError("Placement not found.");
    await ctx.db.patch(args.placementId, {
      storyConsentAt: Date.now(),
      ...(args.note ? { notes: args.note } : {}),
      updatedAt: Date.now(),
    });
  },
});

export const forLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_lead_time", (q) => q.eq("leadId", args.leadId))
      .collect();
    const placements = await ctx.db
      .query("placements")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    return {
      applications: applications.sort((a, b) => b.savedAt - a.savedAt),
      placements: placements.sort((a, b) => b.createdAt - a.createdAt),
    };
  },
});

/**
 * The business's own scoreboard. `01_Project_Foundation.md` Success Metrics.
 *
 * `caused` counts only what PunProfile did the work on. The other two are
 * reported beside it rather than folded in, because a headline number that
 * quietly included placements someone got by themselves is the overstatement
 * the Accuracy principle exists to prevent.
 */
export const placementSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("placements").withIndex("by_signed").collect();
    const signed = all.filter((p) => p.signedAt !== undefined);
    return {
      signed: signed.length,
      caused: signed.filter((p) => p.attributedTo === "engagement").length,
      assisted: signed.filter((p) => p.attributedTo === "assisted").length,
      selfDirected: signed.filter((p) => p.attributedTo === "self").length,
      offersNotYetSigned: all.length - signed.length,
      storyConsented: signed.filter((p) => p.storyConsentAt !== undefined).length,
    };
  },
});
