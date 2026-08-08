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
