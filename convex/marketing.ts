import { v, ConvexError } from "convex/values";
import { internalQuery, internalMutation, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { recordConsent, eventsFor } from "./consentDb";
import { resolveConsent } from "../src/lib/consent";

/**
 * Sending marketing email, and stopping it. 16/08/2026.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS BUILT HERE AND WHAT IS STILL MISSING
 * ---------------------------------------------------------------------------
 *
 * Built: the consent gate every send must pass, the recipient list, and the
 * one-click opt-out that marketing email is not lawful without.
 *
 * **Missing, and neither is code.** A Resend API key on the deployment, and a
 * domain PunProfile owns with Resend's DNS records on it. The second is the
 * real blocker and it is worth being exact about why: `notify.ts` sends from
 * `onboarding@resend.dev`, Resend's shared sender, which can only deliver to
 * the address that owns the account. That is fine for a coach alert addressed
 * to Paul and it physically cannot reach a subscriber. Until a verified sender
 * exists, `send` will refuse and say so in the logs.
 *
 * Also missing on purpose: any content. `send` takes a subject and a body
 * rather than composing one, because what PunProfile says to a list is an
 * editorial decision that belongs to `03_Content_System.md` and the drafts in
 * the coaching repo, not to a function in the app.
 *
 * ---------------------------------------------------------------------------
 * THE GATE
 * ---------------------------------------------------------------------------
 *
 * Nothing sends without a live `marketing` opt-in on the `email` channel,
 * resolved from the event log by the same `resolveConsent` the rest of the app
 * uses. `verify-consent` already pins the rule this depends on: a `service`
 * opt-in does not license marketing, and it never has.
 *
 * `never_asked` and `opted_out` both refuse. They are different states and
 * neither is a permission.
 */

/**
 * Everyone who may currently be sent a marketing email.
 *
 * A full scan, which is correct at this size and stated rather than assumed: at
 * a few hundred leads this reads the table once, and a per-lead consent lookup
 * would be the more expensive mistake. Revisit alongside `listForAdmin`, which
 * carries the same note and the same threshold.
 */
export const recipients = internalQuery({
  args: {},
  handler: async (ctx) => {
    const out: { leadId: Id<"leads">; email: string }[] = [];
    for (const lead of await ctx.db.query("leads").collect()) {
      if (!lead.email) continue;
      const events = await eventsFor(ctx, lead._id);
      if (resolveConsent(events, "email", "marketing").status !== "opted_in") continue;
      out.push({ leadId: lead._id, email: lead.email });
    }
    return out;
  },
});

/**
 * This person's opt-out token, generated once and then reused forever.
 *
 * Reused rather than rotated per send, so a link in an email from March still
 * works in December. Somebody who unsubscribes from an old email means it.
 */
export const ensureUnsubscribeToken = internalMutation({
  args: { leadId: v.id("leads") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("lead_not_found");
    if (lead.unsubscribeToken) return lead.unsubscribeToken;

    // `crypto.randomUUID` is available in the Convex runtime and is seeded per
    // execution, so this is deterministic on replay as a mutation must be.
    // Two of them, because a single UUID is 122 bits of entropy and this value
    // sits in plain text in an email that gets forwarded.
    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
    await ctx.db.patch(args.leadId, { unsubscribeToken: token });
    return token;
  },
});

/**
 * Following the unsubscribe link. Public, unauthenticated, and idempotent.
 *
 * Unauthenticated because the alternative is asking somebody to log in to stop
 * receiving email they never asked to receive, and there is no login to offer
 * them in any case. The token is the authorisation and it can do exactly one
 * thing.
 *
 * **Withdrawing is not deleting**, which `data-inventory.md` states as its own
 * rule: they are separate requests with separate consequences, and conflating
 * them would erase someone who only asked to stop being messaged. This records
 * an `opt_out` event and touches nothing else. Their record, their result and
 * their `service` consent are all untouched, so PunProfile may still answer
 * them about their own assessment.
 *
 * An already-withdrawn token reports success and writes nothing. A second
 * `opt_out` records only that a link was clicked twice, and an append-only log
 * should record what changed.
 */
export const unsubscribe = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_unsubscribe_token", (q) => q.eq("unsubscribeToken", args.token))
      .first();
    // A bad token is not distinguished from a good one in the response. There
    // is nothing to enumerate here, and telling a caller which tokens exist is
    // a courtesy owed to nobody.
    if (!lead) return null;

    const events = await eventsFor(ctx, lead._id);
    if (resolveConsent(events, "email", "marketing").status !== "opted_in") return null;

    await recordConsent(ctx, {
      leadId: lead._id,
      channel: "email",
      purpose: "marketing",
      action: "opt_out",
      at: Date.now(),
      basis: "unsubscribe_link",
      evidence: "Followed the unsubscribe link in a marketing email.",
    });
    return null;
  },
});
