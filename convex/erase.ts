/**
 * Erasing one person, in one place.
 *
 * Extracted 15/08/2026 when the retention sweep (TASK-080) needed the same
 * cascade `leads.deleteLeadOnRequest` already had. Two copies of a cascade is
 * how a table gets added to one and not the other, and the failure mode is a
 * deletion that silently leaves a person's answers behind. There is one
 * implementation and both callers use it.
 *
 * **Adding a table keyed to `leads` means adding it here, and to
 * `movePersonalRecords` in `merge.ts`.** Those two and nowhere else. A table
 * added here but not there would be deleted by a merge instead of moved, which
 * is why that function checks this one's counts and rolls the merge back.
 */

import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export type EraseCounts = {
  leads: number;
  assessments: number;
  magicLinks: number;
  consultations: number;
  consentEvents: number;
  engagements: number;
  deliverables: number;
  applications: number;
  placements: number;
};

/**
 * Whether this person may be erased at all, and why not if not.
 *
 * `null` means erasable. A string means blocked, and the string is the reason,
 * written to be read in a log by someone wondering why a record survived a
 * sweep.
 *
 * **A request from the person themselves overrides this**, which is why
 * `deleteLeadOnRequest` does not call it. Someone asking to be forgotten is not
 * refused because they are mid-engagement; the retention clock is the only
 * thing this guards.
 */
export async function retentionBlockedBecause(
  ctx: MutationCtx,
  leadId: Id<"leads">,
): Promise<string | null> {
  const engagements = await ctx.db
    .query("engagements")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();

  // The whole reason the clock was moved off the submission date: a client
  // must not expire in the middle of the work they paid for.
  const live = engagements.find((e) => e.status === "agreed" || e.status === "active");
  if (live) return `live engagement (${live.module}, ${live.status})`;

  const placements = await ctx.db
    .query("placements")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();
  // A placement is the outcome the whole business is measured on. Deleting one
  // on a timer would erase the evidence that the method works.
  if (placements.length) return "has a placement on record";

  return null;
}

/**
 * The last moment anything happened with this person, from any side.
 *
 * `leads.lastActivityAt` alone is not enough and using it alone is a real bug,
 * not a simplification: it only moves when the *candidate* does something in
 * the app. A lead who finished the assessment in January, had a call in June
 * and has been in a coaching conversation since would show a January timestamp
 * and be swept in the following January, mid-relationship.
 *
 * The consent copy promises twelve months "from the last time you were in
 * touch", and being in touch is a two-sided thing.
 */
export async function lastContactAt(ctx: MutationCtx, lead: { _id: Id<"leads">; lastActivityAt: number }): Promise<number> {
  let latest = lead.lastActivityAt;
  const bump = (n: number | undefined) => {
    if (n !== undefined && n > latest) latest = n;
  };

  const calls = await ctx.db
    .query("consultations")
    .withIndex("by_lead_time", (q) => q.eq("leadId", lead._id))
    .collect();
  for (const c of calls) {
    bump(c.heldAt);
    bump(c.sentAt);
    bump(c.followUpSentAt);
    bump(c.reminderSentAt);
  }

  const consents = await ctx.db
    .query("consentEvents")
    .withIndex("by_lead", (q) => q.eq("leadId", lead._id))
    .collect();
  for (const c of consents) bump(c.at);

  const assessments = await ctx.db
    .query("assessments")
    .withIndex("by_lead_time", (q) => q.eq("leadId", lead._id))
    .collect();
  for (const a of assessments) bump(a.takenAt);

  const deliverables = await ctx.db
    .query("deliverables")
    .withIndex("by_lead", (q) => q.eq("leadId", lead._id))
    .collect();
  for (const d of deliverables) bump(d.deliveredAt ?? d.updatedAt);

  const applications = await ctx.db
    .query("applications")
    .withIndex("by_lead_time", (q) => q.eq("leadId", lead._id))
    .collect();
  for (const a of applications) bump(a.statusChangedAt);

  return latest;
}

/**
 * Delete a person and everything keyed to them, in one transaction.
 *
 * Children first, so a failure part-way cannot orphan a row under a deleted
 * parent. Returns the counts for the `deletionLog` row, which the caller
 * writes: this function does not log, because the two callers log different
 * things about who did it and why.
 */
export async function eraseLead(ctx: MutationCtx, leadId: Id<"leads">): Promise<EraseCounts> {
  const assessments = await ctx.db
    .query("assessments")
    .withIndex("by_lead_time", (q) => q.eq("leadId", leadId))
    .collect();
  const links = await ctx.db
    .query("magicLinks")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();
  const calls = await ctx.db
    .query("consultations")
    .withIndex("by_lead_time", (q) => q.eq("leadId", leadId))
    .collect();
  const consents = await ctx.db
    .query("consentEvents")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();
  const engagements = await ctx.db
    .query("engagements")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();
  const deliverables = await ctx.db
    .query("deliverables")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();
  const applications = await ctx.db
    .query("applications")
    .withIndex("by_lead_time", (q) => q.eq("leadId", leadId))
    .collect();
  const placements = await ctx.db
    .query("placements")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();

  for (const d of deliverables) await ctx.db.delete(d._id);
  for (const p of placements) await ctx.db.delete(p._id);
  for (const a of applications) await ctx.db.delete(a._id);
  for (const e of engagements) await ctx.db.delete(e._id);
  for (const c of consents) await ctx.db.delete(c._id);
  for (const c of calls) await ctx.db.delete(c._id);
  for (const l of links) await ctx.db.delete(l._id);
  for (const a of assessments) await ctx.db.delete(a._id);
  await ctx.db.delete(leadId);

  return {
    leads: 1,
    assessments: assessments.length,
    magicLinks: links.length,
    consultations: calls.length,
    consentEvents: consents.length,
    engagements: engagements.length,
    deliverables: deliverables.length,
    applications: applications.length,
    placements: placements.length,
  };
}
