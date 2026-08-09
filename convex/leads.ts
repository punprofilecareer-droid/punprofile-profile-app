import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import { computeScores } from "./scoring";
import { toScoringInput } from "../src/lib/content/mapping";
import { isValidAnswer } from "../src/lib/content/questions";
import { rateLimiter } from "./rateLimits";
import { gradeLead } from "../src/lib/leadGrade";

/**
 * TASK-012/013/015/016: the candidate session lifecycle, per PRD § 4.
 *
 * All candidate-facing writes validate their arguments server-side; answer
 * values are checked against the content module's own option sets, so a
 * hand-crafted request cannot write vocabulary the scorer doesn't speak.
 * `scores` is recomputed and denormalised on every answer write, which is what
 * makes the teaser chart reactive with no polling (PRD § 3 field notes).
 */

export const startSession = mutation({
  args: { source: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // TASK-039. Global, because a session that does not exist yet has nothing
    // to key on. See `rateLimits.ts` for why that is the honest ceiling here.
    await rateLimiter.limit(ctx, "startSession", { throws: true });

    const now = Date.now();
    return await ctx.db.insert("leads", {
      status: "partial",
      source: args.source,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });
  },
});

export const setPathway = mutation({
  args: {
    leadId: v.id("leads"),
    pathway: v.union(
      v.literal("job_first"),
      v.literal("study_first"),
      v.literal("family"),
      v.literal("not_sure"),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.leadId, {
      pathway: args.pathway,
      updatedAt: now,
      lastActivityAt: now,
    });
  },
});

const PATHWAY_VALUES = ["job_first", "study_first", "family", "not_sure"] as const;
type Pathway = (typeof PATHWAY_VALUES)[number];

export const submitAnswer = mutation({
  args: {
    leadId: v.id("leads"),
    questionKey: v.string(),
    // A "many" question (target countries) sends a list; everything else sends
    // a string. `isValidAnswer` enforces which shape each key accepts.
    value: v.union(v.string(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (!isValidAnswer(args.questionKey, args.value)) {
      throw new ConvexError("Unknown question or answer value.");
    }
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Session not found.");

    const responses = { ...(lead.responses ?? {}), [args.questionKey]: args.value };
    const scores = computeScores(toScoringInput(responses));
    const now = Date.now();

    // Pathway is a first-class column as well as a response, because
    // `by_pathway` indexes it for the admin surface. Mirroring it here keeps
    // the assessment flow to one round trip per answer.
    const pathway =
      args.questionKey === "pathway" &&
      typeof args.value === "string" &&
      (PATHWAY_VALUES as readonly string[]).includes(args.value)
        ? { pathway: args.value as Pathway }
        : {};

    await ctx.db.patch(args.leadId, {
      ...pathway,
      responses,
      scores,
      updatedAt: now,
      lastActivityAt: now,
    });
  },
});

/**
 * Deliberately permissive. The job is to reject what is obviously not an email,
 * not to adjudicate RFC 5322: a regex strict enough to be "correct" rejects
 * real addresses, and the magic link is what actually proves an address works.
 */
const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/**
 * TASK-025/027, PRD FR-005. The gate: full name, email, and at least one of
 * LINE ID or phone.
 *
 * Email alone is not enough. It keeps the magic link deliverable (FR-011), but
 * Thai candidates largely do not read email, so a lead reachable only there is
 * not reachable. Decided 08/08/2026, see `09_Decision_Log.md`.
 *
 * Every rule here is enforced server-side. The form checks the same things for
 * immediate feedback, but a hand-crafted request must not be able to create a
 * lead nobody can contact, or a consent timestamp for a channel the candidate
 * never gave.
 */
export const captureContact = mutation({
  args: {
    leadId: v.id("leads"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    emailConsent: v.boolean(),
    phone: v.optional(v.string()),
    phoneConsent: v.optional(v.boolean()),
    lineId: v.optional(v.string()),
    lineConsent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Session not found.");

    // Keyed on the lead, which the server issued, so it cannot be forged the
    // way a client-supplied key could. Checked after the lead exists, so a
    // random id cannot burn a real session's quota.
    await rateLimiter.limit(ctx, "captureContact", {
      key: args.leadId,
      throws: true,
    });

    const firstName = args.firstName.trim();
    const lastName = args.lastName.trim();
    const email = args.email.trim();
    const phone = args.phone?.trim() || undefined;
    const lineId = args.lineId?.trim() || undefined;

    // Stable codes, not sentences. These reach a candidate's screen, so the
    // wording has to come from the copy module and be translatable; an English
    // string thrown from here would be untranslatable by construction.
    if (!firstName) throw new ConvexError("first_name_required");
    if (!lastName) throw new ConvexError("last_name_required");
    if (!looksLikeEmail(email)) throw new ConvexError("email_invalid");
    if (!phone && !lineId) throw new ConvexError("channel_required");

    // PDPA: consent is per channel and only counts for a channel actually
    // given. Ticking a box for a field left blank grants nothing.
    if (!args.emailConsent) throw new ConvexError("consent_email");
    if (phone && !args.phoneConsent) throw new ConvexError("consent_phone");
    if (lineId && !args.lineConsent) throw new ConvexError("consent_line");

    const now = Date.now();
    await ctx.db.patch(args.leadId, {
      firstName,
      lastName,
      // Composed as well as split, so every existing read path keeps working
      // and the imported leads stay comparable.
      fullName: `${firstName} ${lastName}`,
      email,
      emailConsentAt: now,
      // Each timestamp is written only alongside its own value, so the audit
      // trail can never claim consent for a channel that was left empty.
      ...(phone ? { phone, phoneConsentAt: now } : {}),
      ...(lineId ? { lineId, lineConsentAt: now } : {}),
      status: "email_captured",
      updatedAt: now,
      lastActivityAt: now,
    });
  },
});

/**
 * TASK-032. The real access boundary for every admin read.
 *
 * `src/proxy.ts` redirects an anonymous visitor away from /admin, but that is a
 * UI convenience: it does not run for a direct call to a Convex function.
 * PRD § 7 Security calls out broken access control specifically, so the check
 * is here, and every admin query goes through it rather than repeating the
 * comparison.
 *
 * Throws rather than returning null. An admin query that quietly returns
 * nothing to an attacker looks identical to one returning nothing because
 * there is no data, and that difference matters when reading logs.
 */
async function requireAdmin(ctx: QueryCtx) {
  // The email comes from the user record, NOT from the token. Convex Auth mints
  // a JWT carrying only sub, iss, aud, iat and exp, so `identity.email` is
  // always undefined and comparing against it rejects everyone, including the
  // real admin. `getAuthUserId` resolves the user id out of the `sub` claim,
  // which is the supported way to get from a session to a user.
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Not authorised.");

  const user = await ctx.db.get(userId);
  const admin = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const email = String(user?.email ?? "").trim().toLowerCase();
  if (!admin || email !== admin) throw new ConvexError("Not authorised.");
}

/**
 * FR-012: the coach's lead list, newest activity first.
 *
 * Returns enough to triage without opening a row: who they are, which channels
 * they consented to, how far they got. Not their answers, which is what the
 * detail view is for.
 */
export const listForAdmin = query({
  args: { limit: v.optional(v.number()), includeAbandoned: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 100, 500);

    // FR-010 and FR-012: a session that never reached contact capture is noise,
    // not a lead, and stays out of the default view. That matters more since
    // the client stopped storing a session id: every page load now starts a
    // fresh session, so abandoned rows are the common case rather than the rare
    // one. They are still queryable, because "how many start and never finish"
    // is the funnel's most important number.
    const statuses = args.includeAbandoned
      ? (["email_captured", "completed", "partial"] as const)
      : (["email_captured", "completed"] as const);

    const rows = (
      await Promise.all(
        statuses.map((status) =>
          ctx.db
            .query("leads")
            .withIndex("by_status_recency", (q) => q.eq("status", status))
            .order("desc")
            .take(limit),
        ),
      )
    ).flat();

    // Sorted across statuses here, because the index orders within one status,
    // which is not the same thing as "what happened most recently".
    return rows
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt)
      .slice(0, limit)
      .map((l) => ({
        _id: l._id,
        fullName: l.fullName ?? null,
        firstName: l.firstName ?? null,
        email: l.email ?? null,
        phone: l.phone ?? null,
        lineId: l.lineId ?? null,
        pathway: l.pathway ?? null,
        status: l.status,
        source: l.source ?? null,
        scores: l.scores ?? {},
        // Graded here rather than in the browser, so the list does not have to
        // ship every candidate's full answer set to render a badge.
        grade: gradeLead(toScoringInput(l.responses ?? {})),
        answered: Object.keys(l.responses ?? {}).length,
        createdAt: l.createdAt,
        lastActivityAt: l.lastActivityAt,
      }));
  },
});

/** FR-013: one lead in full, including every consent timestamp. */
export const getForAdmin = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) return null;
    return {
      _id: lead._id,
      fullName: lead.fullName ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      lineId: lead.lineId ?? null,
      // Timestamps, not booleans. "Consented" is a fact with a date attached,
      // and the date is the part a PDPA request actually asks for.
      emailConsentAt: lead.emailConsentAt ?? null,
      phoneConsentAt: lead.phoneConsentAt ?? null,
      lineConsentAt: lead.lineConsentAt ?? null,
      consentSource: lead.consentSource ?? "app",
      pathway: lead.pathway ?? null,
      status: lead.status,
      source: lead.source ?? null,
      responses: lead.responses ?? {},
      scores: lead.scores ?? {},
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      lastActivityAt: lead.lastActivityAt,
    };
  },
});

export const getSession = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) return null;
    // Candidate-facing subset only; contact and consent fields stay server-side.
    return {
      responses: lead.responses ?? {},
      scores: lead.scores ?? {},
      status: lead.status,
      pathway: lead.pathway ?? null,
    };
  },
});
