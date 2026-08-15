/**
 * Coach corrections to a candidate's answers.
 *
 * Each write is an `assessments` row with `source: "coach"`, holding only the
 * field it changes. Nothing is edited in place and nothing is overwritten, so
 * the candidate's own answers survive intact and every correction keeps its
 * date, its author and its reason. See `src/lib/corrections.ts` for how the
 * layers combine, and `candidate-data-architecture.md` L3 for why the table is
 * shaped this way.
 *
 * Until now this table was written by nothing, which the handoff already listed
 * as a fault. It is the same fault `magicLinks` still has.
 */

import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./leads";
import { v, ConvexError } from "convex/values";

/** One candidate's corrections, oldest first. */
export const listForLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("assessments")
      .withIndex("by_lead_time", (q) => q.eq("leadId", args.leadId))
      .collect();
    return rows.filter((r) => r.source === "coach");
  },
});

export const correct = mutation({
  args: {
    leadId: v.id("leads"),
    questionKey: v.string(),
    /**
     * The corrected answer, in the same canonical vocabulary the candidate's
     * own answer uses. A string for a single-choice question, an array for a
     * multi-select, matching whatever that field already holds.
     *
     * Not validated against `isValidAnswer`, and that is deliberate: that
     * function only knows the app's own question set, while half the records
     * here are imported and keyed by scoring-field name. Validating against the
     * wrong vocabulary would reject every correction on the 90 survey leads.
     * The admin UI offers canonical choices; this is a single-operator surface
     * behind `requireAdmin`, not a public endpoint.
     */
    value: v.union(v.string(), v.array(v.string()), v.number(), v.boolean()),
    /** Why. Required, because a corrected value with no reason is just an opinion. */
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A correction needs a reason.");

    return await ctx.db.insert("assessments", {
      leadId: args.leadId,
      takenAt: Date.now(),
      source: "coach",
      responses: { [args.questionKey]: args.value },
      note: reason,
      by: adminEmail,
    });
  },
});

/**
 * Removes one correction, so the field falls back to whatever was true before
 * it: an earlier correction, or the candidate's own answer.
 *
 * This is the coach undoing their own typo, not a way to rewrite history. The
 * ordinary way to change a correction is to make another one, which leaves both
 * on the record.
 */
export const undo = mutation({
  args: { correctionId: v.id("assessments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const row = await ctx.db.get(args.correctionId);
    if (!row) throw new ConvexError("No such correction.");
    // A candidate's own snapshot is not a correction and must not be deletable
    // through this path, which is the one that has an "undo" button on it.
    if (row.source !== "coach") throw new ConvexError("That is not a coach correction.");
    await ctx.db.delete(args.correctionId);
  },
});
