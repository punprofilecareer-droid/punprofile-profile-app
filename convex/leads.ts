import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { computeScores } from "./scoring";
import { toScoringInput } from "../src/lib/content/mapping";
import { isValidAnswer } from "../src/lib/content/questions";

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
    fullName: v.string(),
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

    const fullName = args.fullName.trim();
    const email = args.email.trim();
    const phone = args.phone?.trim() || undefined;
    const lineId = args.lineId?.trim() || undefined;

    // Stable codes, not sentences. These reach a candidate's screen, so the
    // wording has to come from the copy module and be translatable; an English
    // string thrown from here would be untranslatable by construction.
    if (!fullName) throw new ConvexError("name_required");
    if (!looksLikeEmail(email)) throw new ConvexError("email_invalid");
    if (!phone && !lineId) throw new ConvexError("channel_required");

    // PDPA: consent is per channel and only counts for a channel actually
    // given. Ticking a box for a field left blank grants nothing.
    if (!args.emailConsent) throw new ConvexError("consent_email");
    if (phone && !args.phoneConsent) throw new ConvexError("consent_phone");
    if (lineId && !args.lineConsent) throw new ConvexError("consent_line");

    const now = Date.now();
    await ctx.db.patch(args.leadId, {
      fullName,
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
