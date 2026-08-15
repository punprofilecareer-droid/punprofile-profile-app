/**
 * Consent, the Convex half. Spec: `lifecycle-data-model.md` § 6.
 *
 * Thin on purpose, like `scoring.ts`. The resolution rules live in
 * `src/lib/consent.ts` because the mutations here, the admin surface and the
 * subject-access export all need the same answer, and three copies of "is this
 * person opted in" would eventually disagree about whether it was lawful to
 * email someone.
 *
 * Built 15/08/2026. The candidate-facing half is deliberately absent: adding a
 * marketing tick to the contact gate needs Thai copy Paul writes himself
 * (`consent-copy.ts` records that the existing Thai is his own wording), and
 * the contact step is already the riskiest copy surface in the flow. So this
 * ships the record and the plumbing, and `marketing` stays `never_asked` for
 * everyone until there is a screen that asks.
 */

import { mutation, query, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./leads";
import { eventsFor, recordConsent } from "./consentDb";
import { resolveConsent, resolveAll, type ConsentChannel } from "../src/lib/consent";

const channelValidator = v.union(v.literal("email"), v.literal("line"), v.literal("phone"));
const purposeValidator = v.union(v.literal("service"), v.literal("marketing"));

/**
 * A withdrawal, recorded by the coach because there is nowhere else for it to
 * arrive from yet.
 *
 * `data-inventory.md` § 7 lists "Withdraw consent" with "None" against it and
 * points at an unresolved placeholder in the consent copy. This is the
 * mechanism that row was missing. Like access and deletion, it runs through the
 * coach: with no candidate login there is no requester to authenticate, so the
 * coach verifying the person is a procedure rather than a feature.
 *
 * Withdrawing `service` does not delete anything. Deletion is
 * `leads.deleteLeadOnRequest` and it is a different request with a different
 * consequence; conflating them would erase a record on someone who only asked
 * to stop being messaged.
 */
export const withdraw = mutation({
  args: {
    leadId: v.id("leads"),
    channel: channelValidator,
    purpose: purposeValidator,
    /** Where the request arrived. "asked on LINE, 15/08/2026" is the useful
     *  value. Never paste the subject's own message. */
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    await recordConsent(ctx, {
      leadId: args.leadId,
      channel: args.channel,
      purpose: args.purpose,
      action: "opt_out",
      at: Date.now(),
      basis: "coach_recorded",
      evidence: args.evidence,
      by: adminEmail,
    });

    return resolveConsent(await eventsFor(ctx, args.leadId), args.channel, args.purpose);
  },
});

/**
 * A grant collected in conversation rather than on a screen.
 *
 * The honest use is marketing: until the contact gate asks, the only way anyone
 * is opted in to a digest is by saying so on a call, and a coach writing that
 * down is a better record than assuming it from a service consent.
 */
export const recordFromCoach = mutation({
  args: {
    leadId: v.id("leads"),
    channel: channelValidator,
    purpose: purposeValidator,
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    await recordConsent(ctx, {
      leadId: args.leadId,
      channel: args.channel,
      purpose: args.purpose,
      action: "opt_in",
      at: Date.now(),
      basis: "coach_recorded",
      evidence: args.evidence,
      by: adminEmail,
    });

    return resolveConsent(await eventsFor(ctx, args.leadId), args.channel, args.purpose);
  },
});

/** The admin surface: current state per channel per purpose, plus the raw log. */
export const forLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const events = await eventsFor(ctx, args.leadId);
    return {
      resolved: resolveAll(events),
      // Oldest first. A withdrawal followed by a re-grant is a story, and the
      // order is the story.
      events: [...events].sort((a, b) => a.at - b.at),
    };
  },
});

/**
 * Who may actually be sent a marketing message. The query TASK-060 and
 * TASK-082 must both call before they send anything.
 *
 * It returns the empty list today and that is the correct answer, not a bug: no
 * screen asks for marketing consent, so nobody has given it. A digest built on
 * `emailConsentAt` instead would mail 86 people whose consent
 * `data-inventory.md` § 8 records as founder-backfilled from a form that
 * carried no consent clause.
 */
export const marketingAudience = query({
  args: { channel: channelValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const leads = await ctx.db.query("leads").collect();
    const out: Array<{ leadId: Id<"leads">; fullName: string | null; optedInAt: number }> = [];
    for (const lead of leads) {
      const state = resolveConsent(await eventsFor(ctx, lead._id), args.channel, "marketing");
      if (state.status === "opted_in" && state.optedInAt !== null) {
        out.push({ leadId: lead._id, fullName: lead.fullName ?? null, optedInAt: state.optedInAt });
      }
    }
    return out;
  },
});

/**
 * One-off backfill of the flat timestamps into events. Idempotent: a lead that
 * already has a `service` event for a channel is skipped, so a re-run after a
 * partial failure resumes rather than doubling.
 *
 * Three rules it must not break, from `lifecycle-data-model.md` § 6:
 *
 * 1. Every event is `purpose: "service"`. These timestamps mean "we may contact
 *    you about your result", which is what the gate asked for and all it asked.
 * 2. **No marketing event is created for anyone.** Not one. The state stays
 *    `never_asked` until a screen asks, and that is the whole point of the
 *    migration.
 * 3. The imported leads whose email was never nominated get `public_notice`,
 *    not `survey_import`. **Changed 15/08/2026 on Paul's decision**: the social
 *    post carrying the link stated that submitting constitutes acceptance of
 *    PunProfile's consent terms, so those consents rest on a published notice
 *    rather than on nothing. The distinction from `survey_import` is kept
 *    because they are still different answers to "what did they agree to": one
 *    person nominated a channel, the other is covered by a notice.
 *
 * **On reconstructing that third rule.** The timestamps cannot tell those two
 * apart: `importLeads.ts` sets `createdAt: at` and `backfillEmailConsent` sets
 * `emailConsentAt: lead.createdAt`, so both cases land on the submission date
 * and comparing them would mark all 90 as founder-backfilled, including the few
 * who really did type an address.
 *
 * What does carry it is `responses._contactRaw`, the candidate's own answer to
 * "ช่องทางติดต่อที่สะดวกที่สุด", stored verbatim by the import. `import-sheet.ts`
 * derived `emailNominated` by matching an address in exactly that string, so
 * applying the same match here reproduces the original decision rather than
 * approximating it. A lead with no `_contactRaw` cannot be classified and is
 * counted separately in `unclassifiableEmail`; it takes `founder_backfill`,
 * which is the claim that assumes less.
 */
const NOMINATED_EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
export const backfillFromFlatTimestamps = internalMutation({
  args: {
    /** Report what would happen and write nothing. Run this first. */
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    const leads = await ctx.db.query("leads").collect();

    let written = 0;
    let skipped = 0;
    let unclassifiableEmail = 0;
    const byBasis: Record<string, number> = {};

    for (const lead of leads) {
      const existing = await ctx.db
        .query("consentEvents")
        .withIndex("by_lead", (q) => q.eq("leadId", lead._id))
        .collect();

      const pairs: Array<{ channel: ConsentChannel; at: number | undefined }> = [
        { channel: "email", at: lead.emailConsentAt },
        { channel: "line", at: lead.lineConsentAt },
        { channel: "phone", at: lead.phoneConsentAt },
      ];

      for (const { channel, at } of pairs) {
        if (at === undefined) continue;
        const already = existing.some((e) => e.channel === channel && e.purpose === "service");
        if (already) {
          skipped += 1;
          continue;
        }

        const imported = lead.consentSource === "survey_import";
        let basis: "app_tick" | "survey_import" | "public_notice";
        if (!imported) {
          basis = "app_tick";
        } else if (channel !== "email") {
          // A phone number or LINE ID in the contact answer is a channel the
          // person chose. Those are the grants the form genuinely produced.
          basis = "survey_import";
        } else {
          const raw = lead.responses?._contactRaw;
          if (typeof raw !== "string") {
            unclassifiableEmail += 1;
            basis = "public_notice";
          } else {
            // An address typed into the contact answer is a channel they chose.
            // Anything else rests on the published notice, which is a basis in
            // its own right rather than an absence of one.
            basis = NOMINATED_EMAIL.test(raw) ? "survey_import" : "public_notice";
          }
        }

        byBasis[basis] = (byBasis[basis] ?? 0) + 1;
        written += 1;

        if (!dryRun) {
          await recordConsent(ctx, {
            leadId: lead._id,
            channel,
            purpose: "service",
            action: "opt_in",
            at,
            basis,
            evidence:
              basis === "public_notice"
                ? "The published post carrying the link stated that submitting constitutes acceptance of PunProfile's consent terms. Recorded as the basis on Paul's decision, 15/08/2026. The address came from the Google account used to submit."
                : basis === "survey_import"
                  ? "Lead Discovery Survey, question 'ช่องทางติดต่อที่สะดวกที่สุด'. The candidate nominated this channel themselves; the timestamp is their submission date."
                  : "Contact gate, consent.statement as shown on the date recorded.",
          });
        }
      }
    }

    return {
      dryRun,
      leadsScanned: leads.length,
      eventsWritten: written,
      alreadyPresent: skipped,
      byBasis,
      /** Imported leads with no `_contactRaw` to classify. Recorded rather than
       *  hidden: they took the conservative basis, and if this is non-zero the
       *  number is worth knowing before quoting the founder-backfill count. */
      unclassifiableEmail,
      marketingEventsCreated: 0,
    };
  },
});

/**
 * Relabel the `founder_backfill` rows to `public_notice`.
 *
 * This table is append-only and that rule is not being relaxed. What is being
 * corrected is a **migration's own output**: every one of these rows was
 * written by `backfillFromFlatTimestamps` earlier on 15/08/2026, from a premise
 * that turned out to be wrong. None of them records anything a candidate did;
 * they record what a script concluded. Correcting a script's conclusion is not
 * editing evidence.
 *
 * A real consent event, one where a person ticked something or asked to stop,
 * is never touched by this and there is no function that could.
 *
 * Safe to run more than once: it selects only the superseded basis, so a second
 * run finds nothing.
 */
export const relabelFounderBackfill = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    const all = await ctx.db.query("consentEvents").collect();
    const stale = all.filter((e) => e.basis === "founder_backfill");

    if (!dryRun) {
      for (const row of stale) {
        await ctx.db.patch(row._id, {
          basis: "public_notice",
          evidence:
            "The published post carrying the link stated that submitting constitutes acceptance of PunProfile's consent terms. Recorded as the basis on Paul's decision, 15/08/2026. The address came from the Google account used to submit.",
        });
      }
    }

    return { dryRun, relabelled: stale.length, totalEvents: all.length };
  },
});
