import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * TASK-053: backfill the historical Lead Discovery Survey responses.
 *
 * `internalMutation`, so it is unreachable from any client and can only be run
 * from the CLI by someone already holding deployment access.
 *
 * **Idempotent on `email`.** Re-running updates the matching lead rather than
 * creating a second one, because an import that duplicates on retry is worse
 * than one that fails: you find out about a failure, and you do not find out
 * about ninety silent duplicates until the coach starts calling people twice.
 *
 * Consent is written only for channels the respondent actually nominated in
 * "ช่องทางติดต่อที่สะดวกที่สุด". The Google account address is stored but carries
 * no timestamp, because the form never offered email as a way to be reached and
 * a timestamp there would assert a consent nobody gave.
 */
const leadArg = v.object({
  fullName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  lineId: v.optional(v.string()),
  /** True only when they typed an address as their chosen channel. */
  emailNominated: v.boolean(),
  /** The contact answer verbatim, so a Facebook or LinkedIn link survives. */
  contactRaw: v.string(),
  /** Their submission time, which is the basis date for consent. */
  submittedAt: v.number(),
  responses: v.record(v.string(), v.any()),
  scores: v.object({
    professionalCapability: v.optional(v.number()),
    employability: v.optional(v.number()),
    mobilityReadiness: v.optional(v.number()),
    europeanMarketFit: v.optional(v.number()),
  }),
});

/**
 * Batched, because the whole backfill then lands in ONE transaction. Ninety
 * separate calls can fail halfway and leave the table half-migrated, with no
 * clean way to tell which rows made it.
 */
export const importLegacyLeads = internalMutation({
  args: { leads: v.array(leadArg) },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const lead of args.leads) {
      const existing = lead.email
        ? await ctx.db
            .query("leads")
            .withIndex("by_email", (q) => q.eq("email", lead.email))
            .first()
        : null;

      const at = lead.submittedAt;
      const fields = {
        fullName: lead.fullName,
        ...(lead.email ? { email: lead.email } : {}),
        ...(lead.phone ? { phone: lead.phone, phoneConsentAt: at } : {}),
        ...(lead.lineId ? { lineId: lead.lineId, lineConsentAt: at } : {}),
        ...(lead.emailNominated && lead.email ? { emailConsentAt: at } : {}),
        consentSource: "survey_import" as const,
        // The raw answer rides along with the responses so nothing the
        // candidate wrote is lost to a parser that did not know its shape.
        responses: { ...lead.responses, _contactRaw: lead.contactRaw },
        scores: lead.scores,
        status: "email_captured" as const,
        source: "survey_import",
        updatedAt: Date.now(),
        lastActivityAt: at,
      };

      if (existing) {
        await ctx.db.patch(existing._id, fields);
        updated++;
      } else {
        await ctx.db.insert("leads", { ...fields, createdAt: at });
        inserted++;
      }
    }
    return { inserted, updated };
  },
});
