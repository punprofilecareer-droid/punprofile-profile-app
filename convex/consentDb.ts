/**
 * Consent database helpers. No Convex functions here, only plain helpers over
 * `ctx.db`.
 *
 * Split from `consent.ts` for one boring reason worth stating so nobody merges
 * them back: `consent.ts` imports `requireAdmin` from `leads.ts`, and `leads.ts`
 * needs to write consent events when the contact gate clears. Putting the
 * helpers in a third module keeps that from being an import cycle.
 *
 * Rules live in `src/lib/consent.ts`. This file only reads and appends.
 */

import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { maySend, type ConsentEvent, type ConsentChannel, type ConsentPurpose } from "../src/lib/consent";

/** Every event for one lead. The input to every resolver call. */
export async function eventsFor(
  ctx: QueryCtx | MutationCtx,
  leadId: Id<"leads">,
): Promise<ConsentEvent[]> {
  const rows = await ctx.db
    .query("consentEvents")
    .withIndex("by_lead", (q) => q.eq("leadId", leadId))
    .collect();
  return rows.map((r) => ({
    channel: r.channel,
    purpose: r.purpose,
    action: r.action,
    at: r.at,
    basis: r.basis,
    evidence: r.evidence ?? null,
    by: r.by ?? null,
  }));
}

/**
 * The gate every send path calls. Nothing may email, LINE or phone a candidate
 * without this returning true first.
 *
 * Server-side only, never exposed as a query: a client that can ask "may I
 * contact this person" can enumerate who is contactable.
 */
export async function mayContact(
  ctx: QueryCtx | MutationCtx,
  leadId: Id<"leads">,
  channel: ConsentChannel,
  purpose: ConsentPurpose,
): Promise<boolean> {
  return maySend(await eventsFor(ctx, leadId), channel, purpose);
}

/**
 * Append one event. The only way anything enters this table.
 *
 * Not exposed as a mutation of its own: consent is always a side effect of
 * something else happening, a contact gate clearing or a coach being told
 * something, and a bare "write a consent record" endpoint is an invitation to
 * manufacture one.
 */
export async function recordConsent(
  ctx: MutationCtx,
  args: {
    leadId: Id<"leads">;
    channel: ConsentChannel;
    purpose: ConsentPurpose;
    action: "opt_in" | "opt_out";
    at: number;
    basis: ConsentEvent["basis"];
    evidence?: string;
    by?: string;
  },
): Promise<void> {
  await ctx.db.insert("consentEvents", {
    leadId: args.leadId,
    channel: args.channel,
    purpose: args.purpose,
    action: args.action,
    at: args.at,
    basis: args.basis,
    ...(args.evidence ? { evidence: args.evidence } : {}),
    ...(args.by ? { by: args.by } : {}),
  });
}
