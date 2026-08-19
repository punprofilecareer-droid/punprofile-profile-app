/**
 * Two rows, one person. Collapsing them, in one place.
 *
 * **Why there are two rows at all.** The app has stored no session id since
 * 10/08/2026, so every page load starts a fresh `leads` row. Someone who takes
 * the check twice, or who comes back on their phone, produces a second complete
 * record with the same email. Until 19/08/2026 the only duplicate that was ever
 * collapsed was a blog-only subscriber; a second real assessment was left
 * standing beside the first, deliberately, and both showed in the list.
 *
 * That surfaced as a bug that was not one: a deletion "did not work", because
 * the person had four rows in production and one of them had been deleted.
 * Paul's call, 19/08/2026: **replace the duplicate with the fuller record.**
 *
 * **The survivor is the row the caller names, and it ends up at least as full
 * as either input.** Answers are unioned rather than chosen, so "fuller" is not
 * a judgement anyone has to make and nothing is thrown away: the surviving row
 * keeps its own answer wherever both hold one, because that is the more recent
 * statement of the same fact, and inherits every answer only the other row had.
 *
 * The caller names the survivor because `captureContact` has to: the browser
 * holds one lead id and will keep writing to it, so erasing that row mid-flow
 * would break the session it is trying to tidy.
 *
 * **Adding a table keyed to `leads` means adding it here AND to `erase.ts`.**
 * The safety net below turns a forgotten table into a rolled-back transaction
 * rather than lost data, but it is a net, not a substitute.
 */

import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { eraseLead } from "./erase";

/** Strongest wins. A row that reached contact is a stronger record than one that did not. */
const STATUS_RANK = { partial: 0, email_captured: 1, completed: 2 } as const;

/**
 * Re-point every child of `dropId` onto `keepId`.
 *
 * `consentEvents` is the exception and is copied rather than patched, because
 * `schema.ts` says nothing in that table is ever amended: a consent record
 * carrying its original `at`, `basis` and `evidence`, written against the row
 * that is actually this person, is the same fact recorded again, not an edit.
 * The originals go with the dropped row.
 */
async function movePersonalRecords(
  ctx: MutationCtx,
  keepId: Id<"leads">,
  dropId: Id<"leads">,
): Promise<void> {
  const assessments = await ctx.db
    .query("assessments")
    .withIndex("by_lead_time", (q) => q.eq("leadId", dropId))
    .collect();
  const links = await ctx.db
    .query("magicLinks")
    .withIndex("by_lead", (q) => q.eq("leadId", dropId))
    .collect();
  const calls = await ctx.db
    .query("consultations")
    .withIndex("by_lead_time", (q) => q.eq("leadId", dropId))
    .collect();
  const engagements = await ctx.db
    .query("engagements")
    .withIndex("by_lead", (q) => q.eq("leadId", dropId))
    .collect();
  const deliverables = await ctx.db
    .query("deliverables")
    .withIndex("by_lead", (q) => q.eq("leadId", dropId))
    .collect();
  const applications = await ctx.db
    .query("applications")
    .withIndex("by_lead_time", (q) => q.eq("leadId", dropId))
    .collect();
  const placements = await ctx.db
    .query("placements")
    .withIndex("by_lead", (q) => q.eq("leadId", dropId))
    .collect();

  for (const row of [
    ...assessments,
    ...links,
    ...calls,
    ...engagements,
    ...deliverables,
    ...applications,
    ...placements,
  ]) {
    await ctx.db.patch(row._id, { leadId: keepId });
  }

  const consents = await ctx.db
    .query("consentEvents")
    .withIndex("by_lead", (q) => q.eq("leadId", dropId))
    .collect();
  for (const e of consents) {
    await ctx.db.insert("consentEvents", {
      leadId: keepId,
      channel: e.channel,
      purpose: e.purpose,
      action: e.action,
      at: e.at,
      basis: e.basis,
      ...(e.evidence ? { evidence: e.evidence } : {}),
      ...(e.by ? { by: e.by } : {}),
    });
  }
}

/**
 * What the surviving row becomes.
 *
 * Split out from the write so the backfill can report what it would do without
 * doing it, and so the rules are readable as rules rather than as a patch call.
 *
 * The three coach fields move as groups: text, its date and its author travel
 * together or not at all, because a note dated by one row and written by
 * another is a record of nothing. A group moves only when the survivor has
 * nothing in it, so a coach's own words are never overwritten by an older row's.
 */
export function mergedFields(keep: Doc<"leads">, drop: Doc<"leads">): Partial<Doc<"leads">> {
  const patch: Partial<Doc<"leads">> = {};

  // The union. The survivor's own answer wins where both answered.
  const responses = { ...(drop.responses ?? {}), ...(keep.responses ?? {}) };
  if (Object.keys(responses).length !== Object.keys(keep.responses ?? {}).length) {
    patch.responses = responses;
  }

  // Anything the survivor simply does not have.
  const fill = [
    "firstName",
    "lastName",
    "fullName",
    "email",
    "phone",
    "lineId",
    "pathway",
    "linkedinUrl",
    "source",
    "consentSource",
    "emailConsentAt",
    "phoneConsentAt",
    "lineConsentAt",
  ] as const;
  for (const key of fill) {
    if (keep[key] === undefined && drop[key] !== undefined) {
      (patch as Record<string, unknown>)[key] = drop[key];
    }
  }

  if (keep.notes === undefined && drop.notes !== undefined) {
    patch.notes = drop.notes;
    patch.notesAt = drop.notesAt;
    patch.notesBy = drop.notesBy;
  }
  if (keep.coachRating === undefined && drop.coachRating !== undefined) {
    patch.coachRating = drop.coachRating;
    patch.coachRatingAt = drop.coachRatingAt;
    patch.coachRatingBy = drop.coachRatingBy;
  }
  if (keep.disposition === undefined && drop.disposition !== undefined) {
    patch.disposition = drop.disposition;
    patch.dispositionReason = drop.dispositionReason;
    patch.dispositionAt = drop.dispositionAt;
    patch.dispositionBy = drop.dispositionBy;
  }

  // First touch wins on attribution, the rule the schema states for itself.
  if (drop.attribution && (!keep.attribution || drop.attribution.landedAt < keep.attribution.landedAt)) {
    patch.attribution = drop.attribution;
  }

  // The person started when they first started, and was last seen when they
  // were last seen, whichever row was carrying that.
  if (drop.createdAt < keep.createdAt) patch.createdAt = drop.createdAt;
  if (drop.lastActivityAt > keep.lastActivityAt) patch.lastActivityAt = drop.lastActivityAt;
  if (STATUS_RANK[drop.status] > STATUS_RANK[keep.status]) patch.status = drop.status;

  // `scores` is deliberately not carried. Nothing has read it since 15/08/2026
  // and copying a stale number forward is how it would start being read again.

  return patch;
}

/**
 * Merge `dropId` into `keepId` and delete the dropped row.
 *
 * Throws if any child record is still pointing at the dropped row when it is
 * erased, which rolls the whole mutation back. That is the net for a table
 * added to the schema and to `erase.ts` but not to `movePersonalRecords`: the
 * merge fails loudly instead of the cascade quietly deleting someone's calls.
 */
export async function mergeLeads(
  ctx: MutationCtx,
  keepId: Id<"leads">,
  dropId: Id<"leads">,
): Promise<void> {
  if (keepId === dropId) return;
  const keep = await ctx.db.get(keepId);
  const drop = await ctx.db.get(dropId);
  if (!keep || !drop) throw new ConvexError("merge: one of the rows no longer exists");

  const patch = mergedFields(keep, drop);
  if (Object.keys(patch).length) await ctx.db.patch(keepId, patch);

  await movePersonalRecords(ctx, keepId, dropId);

  const counts = await eraseLead(ctx, dropId);
  const orphaned = Object.entries(counts).filter(([table, n]) => table !== "leads" && n > 0);
  if (orphaned.length) {
    throw new ConvexError(
      `merge: ${orphaned.map(([t, n]) => `${n} ${t}`).join(", ")} still pointed at the dropped row. ` +
        `Add the table to movePersonalRecords in merge.ts. Nothing was changed.`,
    );
  }
}

/**
 * Every other row holding this email, oldest first.
 *
 * Empty when the lead has no email, which is the honest answer: rows without
 * one cannot be matched to a person at all, and guessing by name or by device
 * would merge two people who share neither.
 */
export async function duplicatesOf(
  ctx: MutationCtx,
  lead: Doc<"leads">,
): Promise<Doc<"leads">[]> {
  if (!lead.email) return [];
  const rows = await ctx.db
    .query("leads")
    .withIndex("by_email", (q) => q.eq("email", lead.email))
    .collect();
  return rows.filter((r) => r._id !== lead._id).sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Collapse the duplicates that already exist. One-off, 19/08/2026.
 *
 *   npx convex run merge:collapseDuplicates '{"dryRun":true}'
 *   npx convex run merge:collapseDuplicates '{"dryRun":true}' --prod
 *
 * `captureContact` merges duplicates as they arrive from 19/08/2026 onward.
 * The rows that predate it stay until something collapses them, and it is a
 * handful of people rather than a migration: three in production, two in
 * development, at the time this was written.
 *
 * **The fullest row survives**, measured by answers, then by status, then by
 * how recently the person was active. It matters less than it looks: answers
 * are unioned either way, so the choice decides which `_id` outlives the
 * others, not what is known about the person.
 *
 * Returns ids, never email addresses. This is read in a terminal.
 */
export const collapseDuplicates = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("leads").collect();

    const byEmail = new Map<string, Doc<"leads">[]>();
    for (const lead of all) {
      const email = lead.email?.trim().toLowerCase();
      if (!email) continue;
      const list = byEmail.get(email) ?? [];
      list.push(lead);
      byEmail.set(email, list);
    }

    const fullness = (l: Doc<"leads">) => [
      Object.keys(l.responses ?? {}).length,
      STATUS_RANK[l.status],
      l.lastActivityAt,
    ];
    const groups: { keep: Id<"leads">; drop: Id<"leads">[] }[] = [];
    for (const rows of byEmail.values()) {
      if (rows.length < 2) continue;
      const ordered = [...rows].sort((a, b) => {
        const [fa, sa, la] = fullness(a);
        const [fb, sb, lb] = fullness(b);
        return fb - fa || sb - sa || lb - la;
      });
      groups.push({ keep: ordered[0]._id, drop: ordered.slice(1).map((r) => r._id) });
    }

    if (!args.dryRun) {
      for (const group of groups) {
        for (const dropId of group.drop) await mergeLeads(ctx, group.keep, dropId);
      }
    }

    return {
      dryRun: args.dryRun ?? false,
      people: groups.length,
      rowsMerged: groups.reduce((n, g) => n + g.drop.length, 0),
      groups,
    };
  },
});
