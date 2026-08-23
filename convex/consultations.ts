/**
 * The call log: reading and writing one candidate's consultations.
 *
 * Coach surface only. Every function here goes through `requireAdmin`, the same
 * boundary the lead queries use, because these rows hold a person's salary
 * expectation and a coach's private read of them and are the most sensitive
 * thing in the database after the contact details themselves.
 *
 * Nothing here touches a score. `booking-tracking.md` is explicit that an
 * outcome never moves one: what a call *observed* is evidence and belongs in an
 * `assessments` row with `source: "coach"`, while what a call *was* belongs
 * here. Keeping the two apart is what stops "they showed up" from quietly
 * reading as "they got better".
 */

import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./leads";
import { v, ConvexError } from "convex/values";

const TYPE = v.union(
  v.literal("kick_start"),
  v.literal("engagement"),
  v.literal("follow_up"),
  v.literal("other"),
);

const OUTCOME = v.union(
  v.literal("invited"),
  v.literal("scheduled"),
  v.literal("held"),
  v.literal("no_show"),
  v.literal("cancelled"),
  v.literal("expired"),
);

const TRIGGER = v.union(
  v.literal("survey_stage_wave1"),
  v.literal("survey_urgent_wave2"),
  v.literal("manual"),
);

/** Closed-choice because these reach the ICP lookups. See `leadGrade.ts`. */
const EXPERIENCE = v.union(
  v.literal("0-1"),
  v.literal("2-10"),
  v.literal("11-15"),
  v.literal("16+"),
);
const INVESTMENT = v.union(v.literal("none"), v.literal("unrelated"), v.literal("relevant"));

const CHANNEL = v.union(
  v.literal("line"),
  v.literal("meet"),
  v.literal("phone"),
  v.literal("other"),
);

const LANGUAGE = v.union(v.literal("thai"), v.literal("english"), v.literal("mixed"));

/**
 * The fields a coach fills in. Every one optional except the four that make a
 * row mean anything, so a call can be logged in ten seconds straight after
 * hanging up and filled in properly later. A log that demands completeness at
 * the worst moment to give it is a log that stays empty.
 */
const EDITABLE = {
  type: TYPE,
  outcome: OUTCOME,
  heldAt: v.number(),
  durationMinutes: v.optional(v.number()),
  channel: v.optional(CHANNEL),
  language: v.optional(LANGUAGE),
  theirQuestion: v.optional(v.string()),
  strengthsNamed: v.optional(v.string()),
  nextStep: v.optional(v.string()),
  nextStepMatchesApp: v.optional(v.boolean()),
  salaryQuote: v.optional(v.string()),
  moduleFit: v.optional(v.string()),
  icpJobTitle: v.optional(v.string()),
  icpExperienceYears: v.optional(EXPERIENCE),
  icpPriorInvestment: v.optional(INVESTMENT),
  followUpSentAt: v.optional(v.number()),
  notes: v.optional(v.string()),
  // The invitation, typed in by hand because the free Calendly tier pushes
  // nothing. See the schema for why there is no separate `scheduledFor`.
  trigger: v.optional(TRIGGER),
  sentAt: v.optional(v.number()),
  sentChannel: v.optional(v.union(v.literal("line"), v.literal("email"))),
  bookedAt: v.optional(v.number()),
  reminderSentAt: v.optional(v.number()),
};

/** One candidate's calls, most recent first. */
export const listForLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("consultations")
      .withIndex("by_lead_time", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
    return rows;
  },
});

export const log = mutation({
  args: { leadId: v.id("leads"), ...EDITABLE },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const { leadId, ...fields } = args;

    // A row pointing at a lead that no longer exists would survive that
    // person's deletion, which is the one thing this table must never do.
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    const now = Date.now();
    return await ctx.db.insert("consultations", {
      leadId,
      ...fields,
      createdBy: adminEmail,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Replaces the editable half of a row, rather than patching the keys that
 * happen to be present.
 *
 * A patch cannot express "clear this field": an omitted key and a key the coach
 * emptied arrive identically as `undefined`, so a partial update can only ever
 * add. Every field is therefore listed explicitly below and written every time,
 * which is what lets Convex remove the ones that came back undefined. The form
 * is always populated from the stored row, so a full replace is exactly what
 * the coach means by pressing save.
 */
export const update = mutation({
  args: { consultationId: v.id("consultations"), ...EDITABLE },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(args.consultationId);
    if (!existing) throw new ConvexError("No such consultation.");

    await ctx.db.patch(args.consultationId, {
      type: args.type,
      outcome: args.outcome,
      heldAt: args.heldAt,
      durationMinutes: args.durationMinutes,
      channel: args.channel,
      language: args.language,
      theirQuestion: args.theirQuestion,
      strengthsNamed: args.strengthsNamed,
      nextStep: args.nextStep,
      nextStepMatchesApp: args.nextStepMatchesApp,
      salaryQuote: args.salaryQuote,
      moduleFit: args.moduleFit,
      icpJobTitle: args.icpJobTitle,
      icpExperienceYears: args.icpExperienceYears,
      icpPriorInvestment: args.icpPriorInvestment,
      // Carried by the client from the stored row, so saving an edit does not
      // move the time the follow-up actually went out.
      followUpSentAt: args.followUpSentAt,
      notes: args.notes,
      trigger: args.trigger,
      sentAt: args.sentAt,
      sentChannel: args.sentChannel,
      bookedAt: args.bookedAt,
      reminderSentAt: args.reminderSentAt,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Removes a row entered by mistake.
 *
 * Not a candidate right and not a PDPA mechanism: erasing a person deletes
 * their consultations with everything else, in `leads.deleteLeadOnRequest`.
 * This is the coach correcting their own record.
 */
export const remove = mutation({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.consultationId);
  },
});

/**
 * The four queues, across every lead. `booking-tracking.md`, 22/08/2026.
 *
 * The invitation half of that spec shipped on 15/08 as fields on a row, which
 * made every step recordable and none of them findable. The reason the fields
 * exist is that the free Calendly tier sends nothing: the day-before reminder
 * and the same-day follow-up are messages a person has to remember to write,
 * and the spec is explicit that the reminder is the step that breaks first and
 * the only one whose failure costs a booked call rather than a data field.
 * Remembering was the part that had no home. A per-lead badge cannot be the
 * trigger list, because reading it means already knowing whose page to open.
 *
 * **Absence is the queue, in three of the four.** No `reminderSentAt` on a slot
 * inside the window, no `followUpSentAt` on a held call, no outcome on a slot
 * that has passed. That is why none of these are a status field: a status has
 * to be set to be true, and the whole failure mode here is the step nobody got
 * to.
 *
 * **A full scan, deliberately.** At roughly one consultation a fortnight the
 * machinery to avoid it would cost more than it saves, and every bucket except
 * the reminder spans an open-ended stretch of the past, so a time window would
 * have to be wide enough to be a scan anyway. Revisit at a few thousand rows,
 * where the fix is a `by_outcome` index rather than a narrower window.
 *
 * Nothing here reads or moves a score, per the rule this table has carried
 * since it shipped. It reports what has not been done yet, which is a fact
 * about the coach, never about the candidate.
 */
export const queues = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    /** The day-before message, with enough slack for a call booked tomorrow
     *  morning to appear tonight rather than after it has started. */
    const REMINDER_WINDOW_MS = 48 * 60 * 60 * 1000;
    /** How long an unbooked invitation waits before it is worth chasing or
     *  marking `expired`. Two weeks: shorter nags someone still deciding. */
    const STALE_INVITE_MS = 14 * 24 * 60 * 60 * 1000;

    const rows = await ctx.db.query("consultations").withIndex("by_time").collect();

    const leads = new Map<string, { name: string; lineId?: string; email?: string }>();
    for (const row of rows) {
      if (leads.has(row.leadId)) continue;
      const lead = await ctx.db.get(row.leadId);
      leads.set(row.leadId, {
        name:
          lead?.fullName ||
          [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") ||
          lead?.email ||
          "Unnamed lead",
        lineId: lead?.lineId,
        email: lead?.email,
      });
    }

    const entry = (row: (typeof rows)[number]) => ({
      consultationId: row._id,
      leadId: row.leadId,
      ...leads.get(row.leadId)!,
      type: row.type,
      outcome: row.outcome,
      heldAt: row.heldAt,
      sentAt: row.sentAt,
      trigger: row.trigger,
    });

    return {
      /** Booked, inside the window, no reminder written. Soonest first: this is
       *  the one bucket where the order is what to do next, not how late. */
      reminder: rows
        .filter(
          (r) =>
            r.outcome === "scheduled" &&
            r.reminderSentAt === undefined &&
            r.heldAt > now &&
            r.heldAt <= now + REMINDER_WINDOW_MS,
        )
        .sort((a, b) => a.heldAt - b.heldAt)
        .map(entry),

      /** Held, no same-day message. The follow-up is manual and is the step the
       *  spec names as most likely to be missed after the reminder. */
      followUp: rows
        .filter((r) => r.outcome === "held" && r.followUpSentAt === undefined)
        .sort((a, b) => a.heldAt - b.heldAt)
        .map(entry),

      /** The slot has passed and the row still says `scheduled`, so nobody has
       *  said whether they turned up. Until that is answered the wave 1 cut
       *  cannot be judged, because a trigger with no outcome measures nothing. */
      outcomeMissing: rows
        .filter((r) => r.outcome === "scheduled" && r.heldAt <= now)
        .sort((a, b) => a.heldAt - b.heldAt)
        .map(entry),

      /** Invited a fortnight ago and never booked. Chase it or mark it
       *  `expired`; leaving it as `invited` reads as still live. */
      staleInvite: rows
        .filter(
          (r) =>
            r.outcome === "invited" &&
            r.bookedAt === undefined &&
            r.sentAt !== undefined &&
            r.sentAt <= now - STALE_INVITE_MS,
        )
        .sort((a, b) => (a.sentAt ?? 0) - (b.sentAt ?? 0))
        .map(entry),
    };
  },
});

/**
 * The wave 1 cut, read back: which trigger produced what. pp-19, 22/08/2026.
 *
 * `trigger` was put on this table so that the rule which fired could be judged
 * against what happened, and until now nothing read it. `08_Coaching_Business.md`
 * says survey stage = interviewing or negotiating is the cut that earns a
 * booking link. Whether that is the right cut is an empirical question, and the
 * answer is here or nowhere.
 *
 * **Counts, never rates.** At the volume this runs at, "67% booked" means two
 * out of three and reads as a finding. Every number below is returned with the
 * denominator it came from, and the client prints both. The one derived figure,
 * the median wait between the link going out and a slot being chosen, is
 * withheld below three bookings rather than shown with a caveat: a median of
 * two numbers is not a median, it is the two numbers.
 *
 * **The denominator is rows with `sentAt`, not every row.** A consultation
 * logged with no invitation recorded was never produced by a rule, so counting
 * it would dilute exactly the thing being measured. Those rows are returned
 * separately as `noInvitation` rather than dropped, because a large number
 * there means the log, not the cut, is what needs attention.
 */
export const cut = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    /** Below this a median is two numbers wearing a statistic's clothes. */
    const MIN_FOR_MEDIAN = 3;

    const rows = await ctx.db.query("consultations").withIndex("by_time").collect();
    const invitations = rows.filter((r) => r.sentAt !== undefined);

    /** Rows whose trigger was never recorded still happened. They group under
     *  their own key rather than being folded into `manual`, which is a real
     *  answer meaning "coach judgement" and not a stand-in for "unknown". */
    const KEYS = ["survey_stage_wave1", "survey_urgent_wave2", "manual", "unrecorded"] as const;

    const byTrigger = KEYS.map((key) => {
      const group = invitations.filter((r) => (r.trigger ?? "unrecorded") === key);
      const waits = group
        .filter((r) => r.bookedAt !== undefined)
        .map((r) => r.bookedAt! - r.sentAt!)
        .sort((a, b) => a - b);

      return {
        trigger: key,
        sent: group.length,
        booked: group.filter((r) => r.bookedAt !== undefined).length,
        held: group.filter((r) => r.outcome === "held").length,
        noShow: group.filter((r) => r.outcome === "no_show").length,
        cancelled: group.filter((r) => r.outcome === "cancelled").length,
        /** Still `invited` or `expired`: sent, and no slot ever chosen. */
        neverBooked: group.filter((r) => r.outcome === "invited" || r.outcome === "expired").length,
        /** Milliseconds from link to slot chosen, or null while the sample is
         *  too small to have a middle. */
        medianWaitMs:
          waits.length >= MIN_FOR_MEDIAN
            ? waits.length % 2
              ? waits[(waits.length - 1) / 2]
              : Math.round((waits[waits.length / 2 - 1] + waits[waits.length / 2]) / 2)
            : null,
      };
    }).filter((row) => row.sent > 0);

    return {
      byTrigger,
      totalInvitations: invitations.length,
      /** Calls logged with no invitation recorded. Not a cut result. */
      noInvitation: rows.length - invitations.length,
      minForMedian: MIN_FOR_MEDIAN,
    };
  },
});
