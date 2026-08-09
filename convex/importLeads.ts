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
/**
 * Records email consent for imported leads that have an address but no
 * timestamp, dated to their form submission.
 *
 * **Dated to submission, not to now, and that is a deliberate change from what
 * was asked.** A consent timestamp answers "when did this person agree". Every
 * one of these people did hand over their address, on the day they submitted
 * the form; none of them did anything at all today. Stamping today's date would
 * put an event in the audit trail that never happened, which is the one failure
 * mode a consent log cannot survive: if the record is ever challenged, a
 * fabricated date is worse evidence than an absent one.
 *
 * Submission is also consistent with the phone and LINE consents already
 * written by the import, so the whole record reads as one coherent event rather
 * than a real one plus a backfilled one.
 *
 * Only touches `survey_import` rows. An app-native lead without email consent
 * declined it at the gate, and that is a real answer to leave alone.
 */
export const backfillEmailConsent = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("leads").collect();
    let updated = 0;
    let skippedNoEmail = 0;

    for (const lead of all) {
      if (lead.consentSource !== "survey_import") continue;
      if (lead.emailConsentAt) continue;
      if (!lead.email) {
        skippedNoEmail++;
        continue;
      }
      await ctx.db.patch(lead._id, {
        emailConsentAt: lead.createdAt,
        updatedAt: Date.now(),
      });
      updated++;
    }
    return { updated, skippedNoEmail };
  },
});

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
