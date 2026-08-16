"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Annotated rather than inferred, and the annotations are load-bearing.
 * `ctx.runQuery` and `ctx.runMutation` reach back through the generated API
 * into this module, so TypeScript cannot infer a type for a handler that
 * depends on itself. Naming the shapes breaks the cycle.
 */
type Recipient = { leadId: Id<"leads">; email: string };
type SendResult = { attempted: number; sent: number; failed: number };

/**
 * The send itself. 16/08/2026. Node runtime, because it makes a network call.
 *
 * Split from `marketing.ts` for the same reason `notify.ts` is its own file:
 * `"use node"` applies to a whole module, and putting the queries and the
 * mutation behind it would move the consent gate into a runtime it does not
 * need.
 *
 * **Content is an argument, not a template.** What PunProfile says to a list is
 * an editorial decision owned by `03_Content_System.md` and drafted in the
 * coaching repo. A function that composed its own marketing copy would be the
 * app deciding what the business says, which is the thing the two-repo split
 * exists to prevent.
 *
 * **It is meant to be refusing right now.** Paul's call, 16/08/2026, asked
 * which of three: get a domain and wire it, borrow a sender from a domain he
 * already owns, or leave it refusing until there is something to send. He chose
 * the third. So this is a deliberate hold rather than an unfinished job, and a
 * future session should not read the warning below as a bug to close. What
 * unblocks it is content and a domain, in that order, and neither is here.
 *
 * **It refuses rather than half-sends.** Two things have to be true before a
 * single email leaves: a `RESEND_API_KEY` on the deployment, and a `MAIL_FROM`
 * naming a sender on a domain Resend has verified. Without the second, Resend's
 * shared `onboarding@resend.dev` can only deliver to the account owner, so a
 * run would look successful and reach nobody. Failing loudly in the log is the
 * whole reason this check is separate from the key check.
 *
 * The consent gate is not here. It is in `marketing.recipients`, which resolves
 * every address from the event log before this ever sees one, so there is no
 * path from this file to an address that has not opted in.
 */
export const send = internalAction({
  args: {
    subject: v.string(),
    /** Plain text. The audience reads on a phone and a template is not content. */
    body: v.string(),
    /** Log what would happen and send nothing. The default, deliberately. */
    dryRun: v.optional(v.boolean()),
  },
  returns: v.object({ attempted: v.number(), sent: v.number(), failed: v.number() }),
  handler: async (ctx, args): Promise<SendResult> => {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    const site = process.env.SITE_URL ?? "https://punprofile.vercel.app";

    const list: Recipient[] = await ctx.runQuery(internal.marketing.recipients, {});
    const dryRun = args.dryRun ?? true;

    if (!key || !from) {
      console.warn(
        `marketing.send refused: ${!key ? "RESEND_API_KEY" : "MAIL_FROM"} is not set on this deployment. ` +
          `${list.length} recipient(s) hold a live opt-in and none were emailed. ` +
          `MAIL_FROM must name a sender on a domain verified in Resend: the shared ` +
          `onboarding@resend.dev sender only delivers to the account owner.`,
      );
      return { attempted: list.length, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const r of list) {
      const token: string = await ctx.runMutation(
        internal.marketing.ensureUnsubscribeToken,
        { leadId: r.leadId },
      );
      const stop = `${site}/unsubscribe/${token}`;

      if (dryRun) {
        console.log(`marketing.send dry run: would send to a recipient, stop link ${stop}`);
        sent++;
        continue;
      }

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [r.email],
            subject: args.subject,
            text: `${args.body}\n\n---\nหยุดรับอีเมลนี้: ${stop}\nStop these emails: ${stop}`,
            // The header every mail client reads to offer its own one-click
            // stop. A list that only offers a link at the bottom is a list
            // people report as spam instead of leaving.
            headers: {
              "List-Unsubscribe": `<${stop}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          }),
        });
        if (res.ok) sent++;
        else {
          failed++;
          console.error(`marketing.send failed for one recipient: ${res.status}`);
        }
      } catch (err) {
        failed++;
        console.error("marketing.send threw for one recipient", err);
      }
    }

    console.log(`marketing.send: attempted ${list.length}, sent ${sent}, failed ${failed}, dryRun ${dryRun}`);
    return { attempted: list.length, sent, failed };
  },
});
