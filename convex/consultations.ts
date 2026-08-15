/**
 * The call log: reading and writing one candidate's consultations.
 *
 * Coach surface only. Every function here goes through `requireAdmin`, the same
 * boundary the lead queries use, because these rows hold a person's salary
 * expectation and a coach's private read of them and are the most sensitive
 * thing in the database after the contact details themselves.
 *
 * Nothing here touches a score. `booking-tracking.md` is explicit that an
 * outcome never moves one: what a call *observed* is evidence and belongs in an
 * `assessments` row with `source: "coach"`, while what a call *was* belongs
 * here. Keeping the two apart is what stops "they showed up" from quietly
 * reading as "they got better".
 */

import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./leads";
import { v, ConvexError } from "convex/values";

const TYPE = v.union(
  v.literal("kick_start"),
  v.literal("engagement"),
  v.literal("follow_up"),
  v.literal("other"),
);

const OUTCOME = v.union(
  v.literal("scheduled"),
  v.literal("held"),
  v.literal("no_show"),
  v.literal("cancelled"),
);

const CHANNEL = v.union(
  v.literal("line"),
  v.literal("meet"),
  v.literal("phone"),
  v.literal("other"),
);

const LANGUAGE = v.union(v.literal("thai"), v.literal("english"), v.literal("mixed"));

/**
 * The fields a coach fills in. Every one optional except the four that make a
 * row mean anything, so a call can be logged in ten seconds straight after
 * hanging up and filled in properly later. A log that demands completeness at
 * the worst moment to give it is a log that stays empty.
 */
const EDITABLE = {
  type: TYPE,
  outcome: OUTCOME,
  heldAt: v.number(),
  durationMinutes: v.optional(v.number()),
  channel: v.optional(CHANNEL),
  language: v.optional(LANGUAGE),
  theirQuestion: v.optional(v.string()),
  strengthsNamed: v.optional(v.string()),
  nextStep: v.optional(v.string()),
  nextStepMatchesApp: v.optional(v.boolean()),
  salaryQuote: v.optional(v.string()),
  moduleFit: v.optional(v.string()),
  icpJobTitle: v.optional(v.string()),
  icpExperienceYears: v.optional(v.string()),
  icpPriorInvestment: v.optional(v.string()),
  followUpSentAt: v.optional(v.number()),
  notes: v.optional(v.string()),
};

/** One candidate's calls, most recent first. */
export const listForLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("consultations")
      .withIndex("by_lead_time", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
    return rows;
  },
});

export const log = mutation({
  args: { leadId: v.id("leads"), ...EDITABLE },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const { leadId, ...fields } = args;

    // A row pointing at a lead that no longer exists would survive that
    // person's deletion, which is the one thing this table must never do.
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    const now = Date.now();
    return await ctx.db.insert("consultations", {
      leadId,
      ...fields,
      createdBy: adminEmail,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Replaces the editable half of a row, rather than patching the keys that
 * happen to be present.
 *
 * A patch cannot express "clear this field": an omitted key and a key the coach
 * emptied arrive identically as `undefined`, so a partial update can only ever
 * add. Every field is therefore listed explicitly below and written every time,
 * which is what lets Convex remove the ones that came back undefined. The form
 * is always populated from the stored row, so a full replace is exactly what
 * the coach means by pressing save.
 */
export const update = mutation({
  args: { consultationId: v.id("consultations"), ...EDITABLE },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(args.consultationId);
    if (!existing) throw new ConvexError("No such consultation.");

    await ctx.db.patch(args.consultationId, {
      type: args.type,
      outcome: args.outcome,
      heldAt: args.heldAt,
      durationMinutes: args.durationMinutes,
      channel: args.channel,
      language: args.language,
      theirQuestion: args.theirQuestion,
      strengthsNamed: args.strengthsNamed,
      nextStep: args.nextStep,
      nextStepMatchesApp: args.nextStepMatchesApp,
      salaryQuote: args.salaryQuote,
      moduleFit: args.moduleFit,
      icpJobTitle: args.icpJobTitle,
      icpExperienceYears: args.icpExperienceYears,
      icpPriorInvestment: args.icpPriorInvestment,
      // Carried by the client from the stored row, so saving an edit does not
      // move the time the follow-up actually went out.
      followUpSentAt: args.followUpSentAt,
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Removes a row entered by mistake.
 *
 * Not a candidate right and not a PDPA mechanism: erasing a person deletes
 * their consultations with everything else, in `leads.deleteLeadOnRequest`.
 * This is the coach correcting their own record.
 */
export const remove = mutation({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.consultationId);
  },
});
