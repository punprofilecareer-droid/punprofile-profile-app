/**
 * TASK-080. Enforce the retention period.
 *
 * The consent copy and `/privacy` both promise twelve months from the
 * candidate's **last contact**, not from submission, and until 15/08/2026
 * nothing deleted anything on a schedule. Deletion on request already worked
 * and covered the interim; this is the promise the app makes to every candidate
 * actually being kept.
 *
 * ## The two rules that shape this
 *
 * **The clock is last contact, and contact is two-sided.** `lastActivityAt`
 * alone only moves when the candidate does something in the app, so a client in
 * an active coaching relationship would still age out on the date of their last
 * tap. `lastContactAt` in `erase.ts` takes the latest of everything: calls,
 * follow-ups, consent events, coach corrections, deliverables, applications.
 *
 * **A live engagement is never swept.** The whole reason the basis moved off
 * the submission date was that a client must not expire mid-engagement. A
 * placement is never swept either: it is the outcome the business is measured
 * on and deleting one on a timer would erase the evidence the method works.
 *
 * Neither guard applies to `leads.deleteLeadOnRequest`. Someone asking to be
 * forgotten is not refused because they are mid-engagement.
 *
 * ## Why it is cautious
 *
 * Deletion here is unattended, cascading and irreversible, with no backup to
 * restore from. So: it runs dry by default, it caps how much one run may
 * delete, and it logs a reason for every record it leaves behind. A retention
 * job that quietly deleted more than expected is the single worst outcome
 * available in this codebase.
 */

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { eraseLead, lastContactAt, retentionBlockedBecause } from "./erase";

/** Twelve months, matching the consent copy. Not configurable by accident. */
export const RETENTION_DAYS = 365;

/**
 * Most records one unattended run may erase.
 *
 * Not a performance limit. If a sweep ever wants to delete more than this,
 * something is wrong with the clock and the right behaviour is to stop and be
 * noticed rather than to proceed efficiently. Raising it is a deliberate act.
 */
const MAX_PER_RUN = 25;

export const sweep = internalMutation({
  args: {
    /** Defaults to FALSE. A run only deletes when told to, in as many words. */
    apply: v.optional(v.boolean()),
    /** Test seam: pretend now is this. Never passed in production. */
    asOf: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apply = args.apply ?? false;
    const now = args.asOf ?? Date.now();
    const cutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;

    const leads = await ctx.db.query("leads").collect();

    const due: { id: (typeof leads)[number]["_id"]; lastContact: number }[] = [];
    const kept: Record<string, number> = {};
    const keep = (reason: string) => {
      kept[reason] = (kept[reason] ?? 0) + 1;
    };

    for (const lead of leads) {
      const lastContact = await lastContactAt(ctx, lead);
      if (lastContact >= cutoff) {
        keep("within retention period");
        continue;
      }
      const blocked = await retentionBlockedBecause(ctx, lead._id);
      if (blocked) {
        keep(blocked);
        continue;
      }
      due.push({ id: lead._id, lastContact });
    }

    // Oldest first, so a capped run always clears the most overdue rather than
    // whatever the scan happened to reach first.
    due.sort((a, b) => a.lastContact - b.lastContact);

    const overCap = due.length > MAX_PER_RUN;
    const batch = due.slice(0, MAX_PER_RUN);

    if (!apply) {
      return {
        applied: false,
        due: due.length,
        wouldErase: batch.length,
        overCap,
        kept,
        cutoff: new Date(cutoff).toISOString().slice(0, 10),
      };
    }

    if (overCap) {
      // Refuse rather than truncate silently. A sweep this large means the
      // clock is wrong, and deleting 25 of them would destroy the evidence
      // needed to work out why.
      console.error(
        `retention sweep refused: ${due.length} records are due, over the ${MAX_PER_RUN} cap. ` +
          `Nothing was deleted. Investigate the clock before raising the cap.`,
      );
      return { applied: false, due: due.length, wouldErase: 0, overCap: true, kept, refused: true };
    }

    const counts = {
      leads: 0,
      assessments: 0,
      magicLinks: 0,
      consultations: 0,
      consentEvents: 0,
      engagements: 0,
      deliverables: 0,
      applications: 0,
      placements: 0,
    };
    for (const d of batch) {
      const c = await eraseLead(ctx, d.id);
      for (const k of Object.keys(counts) as (keyof typeof counts)[]) counts[k] += c[k];
    }

    if (batch.length > 0) {
      await ctx.db.insert("deletionLog", {
        deletedAt: now,
        // Not an admin address. A person did not do this, and the log should
        // not imply one did.
        performedBy: "retention-sweep",
        note: `Automatic, ${RETENTION_DAYS} days since last contact. ${batch.length} record(s).`,
        counts,
      });
    }

    return { applied: true, due: due.length, erased: batch.length, counts, kept };
  },
});
