import { v, ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { rateLimiter } from "./rateLimits";
import { recordConsent } from "./consentDb";
import { SIGNUP_CONSENT } from "../src/lib/content/blog";

/**
 * The blog's email capture. 16/08/2026.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS NOW AND DID NOT BEFORE
 * ---------------------------------------------------------------------------
 *
 * `footer.ts` refused the same field on 14/08/2026, in these words: "a field
 * that collects an email address under PDPA without a lawful basis is a
 * compliance problem rather than a design flourish". Three of the four things
 * that were missing then now exist. The consent log records a `marketing`
 * purpose per channel, withdrawal is a real mechanism the coach can perform,
 * and the privacy notice covers the purpose.
 *
 * The fourth is Paul's read of the Thai, which is why the form that calls this
 * renders only when `MARKETING_CONSENT_COPY_REVIEWED` is true, and why this
 * mutation is unreachable from the UI until it is.
 *
 * **There is still no send path.** `RESEND_API_KEY` is unset on both
 * deployments (`nurture-flow.md` § 5). This records a permission; it does not
 * promise a delivery, and nothing here says a first email is imminent.
 *
 * ---------------------------------------------------------------------------
 * WHERE A SUBSCRIBER LIVES, AND WHY IT IS A LEAD
 * ---------------------------------------------------------------------------
 *
 * In `leads`, with `status: "partial"`, and not in a table of its own.
 *
 * A `subscribers` table would have needed its own consent columns, because
 * `consentEvents.leadId` is an id into `leads`. `schema.ts` says the thing that
 * settles it: "Do not add a fourth. A new channel or a new purpose is an
 * event." A second consent mechanism beside the log is exactly the shape the
 * log replaced, and a PDPA request that has to be answered from two places is
 * answered wrong eventually.
 *
 * `partial` is the honest status. It means someone exists and has not completed
 * an assessment, which is true of a person who never started one.
 *
 * **`attribution` is `other` with `raw: "blog_signup"`**, using the escape
 * hatch the schema documents for itself: `raw` is kept "so a channel added
 * later is recoverable rather than lost to `other`". Adding a literal to that
 * union is a data-model decision that belongs to `lifecycle-data-model.md`, not
 * to this file.
 *
 * ---------------------------------------------------------------------------
 * AN EXISTING EMAIL IS NOT A NEW PERSON
 * ---------------------------------------------------------------------------
 *
 * Someone who took the check and then subscribes from the blog is one person.
 * The `by_email` index finds them, and the consent event is attached to the
 * lead they already have. Writing a second row would split their consent
 * history across two records, and the first subject-access request would
 * produce half an answer.
 *
 * Re-subscribing when a live opt-in already exists writes nothing. An
 * append-only log should record what changed, and a second identical `opt_in`
 * records only that a button was pressed twice.
 */

/**
 * The `attribution.raw` marker a blog subscriber carries.
 *
 * Named here and imported by `leads.ts` rather than written twice, because it
 * is what the admin list filters on and a typo in either copy would silently
 * put subscribers back in the coach's queue.
 */
export const BLOG_SIGNUP = "blog_signup";

/**
 * Someone who gave an email on the blog and has not taken the assessment.
 *
 * Both halves matter. The marker alone would keep hiding them forever, and
 * Paul's rule on 16/08/2026 is that they appear once they complete the check.
 * `responses` is the test for that rather than `status`, because a lead row is
 * created the moment someone lands on `/assess` and a status can move before
 * a single question is answered.
 */
export const isBlogOnlySubscriber = (lead: {
  attribution?: { raw?: string };
  responses?: Record<string, unknown>;
}): boolean =>
  lead.attribution?.raw === BLOG_SIGNUP &&
  Object.keys(lead.responses ?? {}).length === 0;

const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export const subscribe = mutation({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Keyed globally rather than per lead, because there is no session here and
    // nothing to key on before the address is trusted. `subscribe` has its own
    // bucket so a script hammering this cannot spend the assessment's.
    await rateLimiter.limit(ctx, "subscribe", { throws: true });

    const email = args.email.trim().toLowerCase();
    if (!looksLikeEmail(email)) throw new ConvexError("email_invalid");

    const now = Date.now();

    // The English sentence, from the server's own copy of the module, never
    // from the client. Same rule and same reason as `captureContact`: what was
    // agreed to is not something the person agreeing gets to describe.
    const evidence = SIGNUP_CONSENT.en;

    const existing = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      const live = await ctx.db
        .query("consentEvents")
        .withIndex("by_lead_scope", (q) =>
          q.eq("leadId", existing._id).eq("channel", "email").eq("purpose", "marketing"),
        )
        .order("desc")
        .first();
      // Already opted in and not since withdrawn: nothing changed, so nothing
      // is recorded. Reported to the caller as success, because from the
      // subscriber's side it is.
      if (live?.action === "opt_in") return null;

      await ctx.db.patch(existing._id, { updatedAt: now, lastActivityAt: now });
      await recordConsent(ctx, {
        leadId: existing._id,
        channel: "email",
        purpose: "marketing",
        action: "opt_in",
        at: now,
        basis: "app_tick",
        evidence,
      });
      return null;
    }

    const leadId = await ctx.db.insert("leads", {
      email,
      status: "partial",
      attribution: { channel: "other", landedAt: now, raw: BLOG_SIGNUP },
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });

    await recordConsent(ctx, {
      leadId,
      channel: "email",
      purpose: "marketing",
      action: "opt_in",
      at: now,
      basis: "app_tick",
      evidence,
    });

    return null;
  },
});
