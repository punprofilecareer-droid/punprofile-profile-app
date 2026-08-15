import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import { scoresFor } from "./scoring";
import { isValidAnswer } from "../src/lib/content/questions";
import { EUROPEAN_LANGUAGES } from "../src/lib/country-english";
import { rateLimiter } from "./rateLimits";
import { gradeLead, toGradeInput, latestCoachIcp } from "../src/lib/leadGrade";
import { eventsFor, recordConsent } from "./consentDb";
import { resolveAll } from "../src/lib/consent";
import { CONSENT_COPY } from "../src/lib/consent-copy";

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

    // `scores` is deliberately not written. Every read recomputes from
    // `responses` (`scoresFor`), decided 15/08/2026, so storing a second copy
    // would only create something to go stale.
    await ctx.db.patch(args.leadId, {
      ...pathway,
      responses,
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
    /**
     * The separate, optional marketing tick. Job digests and nurture, not the
     * result. Absent means the question was never put to them, which is
     * `never_asked` and not a refusal.
     *
     * Optional in the validator rather than defaulted to false, because the
     * screen only shows this tick once its Thai exists, and a defaulted false
     * would write nothing anyway; keeping it undefined means the log stays
     * silent about a question nobody was asked.
     */
    marketingConsent: v.optional(v.boolean()),
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

    // The same grants, as events. Dual-written during the `consentEvents`
    // migration (schema note on the flat fields); the events are what every
    // read path resolves from, the timestamps above are the rollback.
    //
    // `service` only. The gate asks whether PunProfile may contact this person
    // about their result and coaching, and nothing on this screen asks about
    // digests or nurture, so writing a `marketing` event here would be
    // inventing an agreement nobody gave.
    //
    // The English statement is stored as the evidence rather than the rendered
    // Thai, because the locale the candidate saw is not recorded anywhere and a
    // guess about which string they read is worse than the canonical one.
    const consentEvidence = CONSENT_COPY["consent.statement"].en;
    for (const channel of ["email", "phone", "line"] as const) {
      // Same rule as the timestamps: only for a channel actually filled in.
      if (channel === "phone" && !phone) continue;
      if (channel === "line" && !lineId) continue;
      await recordConsent(ctx, {
        leadId: args.leadId,
        channel,
        purpose: "service",
        action: "opt_in",
        at: now,
        basis: "app_tick",
        evidence: consentEvidence,
      });
    }

    // Marketing, only if the tick was shown and ticked. An absent argument
    // writes nothing at all: the person was never asked, and `never_asked` is
    // the honest state. A `false` writes nothing either, because declining a
    // box you were shown is the same as never having held the permission, and
    // an `opt_out` event would claim they withdrew something they never had.
    if (args.marketingConsent === true) {
      await recordConsent(ctx, {
        leadId: args.leadId,
        channel: "email",
        purpose: "marketing",
        action: "opt_in",
        at: now,
        basis: "app_tick",
        evidence: CONSENT_COPY["consent.marketing"].en,
      });
    }

    // Tell the coach, with no candidate details in the message. Scheduled
    // rather than awaited: the candidate's next screen must not wait on an
    // outbound HTTP call, and a notification that fails must not fail a
    // contact capture that has already committed. See `notify.ts`.
    const grade = gradeLead(toGradeInput(lead.responses ?? {}));
    const stage = typeof lead.responses?.stage === "string" ? lead.responses.stage : null;
    await ctx.scheduler.runAfter(0, internal.notify.newLead, {
      tier: grade.tier,
      stage,
      // The booking gate decided 14/08/2026, and the only rule in the whole
      // framework that decides whether someone gets a link rather than what to
      // say to them.
      //
      // `offer` dropped out of it on 15/08/2026, when the question stopped
      // merging "has an offer" with "negotiating". The rule in
      // `08_Coaching_Business.md` names interviewing and negotiating, and while
      // the two were one option the merged value had to be included. Now that
      // they are separate, including `offer` would widen a cut the owning
      // document has not widened.
      sqlGate: stage === "interviewing" || stage === "negotiating",
      routingNote: grade.routingNote,
    });
  },
});

/**
 * TASK-072, Stage 2: the per-language grid.
 *
 * Its own mutation rather than another `submitAnswer` key, because the shape
 * is different in a way the validator cannot absorb. Every Stage 1 answer is a
 * string or a list of strings drawn from a fixed option set, and
 * `isValidAnswer` checks membership against `QUESTION_INDEX`. This is a map of
 * language to level, so it needs its own vocabulary check, and widening
 * `submitAnswer` to accept a record would weaken the guarantee that protects
 * eleven questions in order to serve one.
 *
 * Validated against both lists rather than trusted: a client that can post an
 * arbitrary key into `responses` can put anything into the scorer's input.
 */
export const submitLanguages = mutation({
  args: {
    leadId: v.id("leads"),
    levels: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Session not found.");

    const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
    const clean: Record<string, string> = {};
    for (const [lang, level] of Object.entries(args.levels)) {
      if (!(EUROPEAN_LANGUAGES as readonly string[]).includes(lang)) continue;
      if (!LEVELS.has(level)) continue;
      clean[lang] = level;
    }

    const responses = { ...(lead.responses ?? {}), otherLanguages: clean };
    const now = Date.now();
    await ctx.db.patch(args.leadId, {
      responses,
      // No `scores` write: Country Reach changes with this grid, which is the
      // entire reason the question exists, and every read now recomputes.
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
/**
 * The development bypass, and the reason it is shaped this way.
 *
 * Signing in to look at a lead locally is real friction, and friction on the
 * one screen the coach actually uses is worth removing. But this is the app's
 * only real access boundary, so a plain `DEV_BYPASS=true` is not good enough:
 * an environment variable set once tends to get copied, and the failure mode is
 * every candidate's contact details, salary expectation and call notes served
 * to anyone who visits `/admin`.
 *
 * So the switch is **self-scoping**. Its value must be the name of the
 * deployment it is allowed on, and it is compared against the deployment the
 * code is actually running in. Setting `DEV_ADMIN_BYPASS=quiet-mule-251` on
 * production does nothing at all, because production is not called that. There
 * is no value that turns it on everywhere.
 *
 * It fails closed: unset, malformed, or unable to tell where it is running, and
 * the answer is no bypass.
 */
function devBypassEmail(): string | null {
  const allowedOn = (process.env.DEV_ADMIN_BYPASS ?? "").trim();
  if (!allowedOn) return null;

  // `CONVEX_SITE_URL` is a system variable the runtime sets, already relied on
  // by `auth.config.ts`. The subdomain is the deployment name.
  const url = process.env.CONVEX_SITE_URL ?? process.env.CONVEX_CLOUD_URL ?? "";
  const here = url.replace(/^https?:\/\//, "").split(".")[0];
  if (!here || here !== allowedOn) return null;

  return (process.env.ADMIN_EMAIL ?? "dev-bypass@localhost").trim().toLowerCase();
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
  const bypass = devBypassEmail();
  if (bypass) return bypass;

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
  // Returned so a write path can record who acted without re-reading the user.
  return email;
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

    /**
     * Coach-collected ICP answers, for the leads that have been spoken to.
     *
     * One scan of the whole table rather than a lookup per lead: at roughly one
     * call a fortnight this is a handful of rows, and 100 index reads to render
     * a badge would be the more expensive mistake. Revisit if the log ever runs
     * to thousands.
     */
    const byLead = new Map<string, Doc<"consultations">[]>();
    for (const c of await ctx.db.query("consultations").collect()) {
      const list = byLead.get(c.leadId) ?? [];
      list.push(c);
      byLead.set(c.leadId, list);
    }

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
        scores: scoresFor(l.responses),
        // Graded here rather than in the browser, so the list does not have to
        // ship every candidate's full answer set to render a badge.
        // `toGradeInput`, not `toScoringInput`: the grade reads the raw record
        // so imported survey leads grade too, and so the two ICP answers never
        // reach the candidate's chart. See `leadGrade.ts`.
        //
        // The second argument is what a call collected. It fills only what the
        // form left empty, which is most app-native leads, every one of which
        // used to sit here ungraded.
        grade: gradeLead(
          toGradeInput(l.responses ?? {}),
          latestCoachIcp(byLead.get(l._id) ?? []),
        ),
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
    const consentEvents = await eventsFor(ctx, args.leadId);
    return {
      _id: lead._id,
      // Both the split fields and the composed one. `fullName` is what every
      // screen reads; the split pair is what a subject-access export needs,
      // since a person asking what is held should see the fields as stored.
      firstName: lead.firstName ?? null,
      lastName: lead.lastName ?? null,
      fullName: lead.fullName ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      lineId: lead.lineId ?? null,
      // Timestamps, not booleans. "Consented" is a fact with a date attached,
      // and the date is the part a PDPA request actually asks for.
      //
      // Kept during the `consentEvents` migration so the admin screen and the
      // subject-access export do not change shape in the same commit that
      // changes the storage. `consent` below is the field to read.
      emailConsentAt: lead.emailConsentAt ?? null,
      phoneConsentAt: lead.phoneConsentAt ?? null,
      lineConsentAt: lead.lineConsentAt ?? null,
      consentSource: lead.consentSource ?? "app",
      /**
       * Resolved from `consentEvents`, per channel and per purpose. This is the
       * only field that can answer "may we send them a job digest", and today
       * it answers `never_asked` for every lead in the database, which is
       * correct: no screen has ever asked.
       */
      consent: resolveAll(consentEvents),
      /** The raw log, oldest first, for the subject-access export. A person
       *  asking what is held about them is entitled to the withdrawals too, not
       *  just the grants that survived. */
      consentEvents: [...consentEvents].sort((a, b) => a.at - b.at),
      pathway: lead.pathway ?? null,
      status: lead.status,
      source: lead.source ?? null,
      responses: lead.responses ?? {},
      scores: scoresFor(lead.responses),
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      lastActivityAt: lead.lastActivityAt,
    };
  },
});

/**
 * Erase one person, on request.
 *
 * There is no candidate login, so a request arrives by LINE, phone or email and
 * the coach acts on it here. Admin-guarded like every other admin path.
 *
 * Cascades deliberately. Deleting the lead alone would leave their answers
 * behind in `assessments` and a live token in `magicLinks`, which is a deletion
 * that did not delete. Everything keyed to the lead goes in one transaction, so
 * a failure halfway cannot leave a half-erased person.
 *
 * What survives is a row in `deletionLog` recording that a deletion happened,
 * how much went, and who did it. It holds nothing about the subject, not even a
 * hashed address: retaining an identifier for the person who asked to be
 * forgotten is the thing being avoided, and a weak hash is reversible enough to
 * count as retaining it.
 *
 * The rate limiter keeps a throttling entry keyed on the lead's id. It holds no
 * personal data, only a counter against an id that no longer resolves to
 * anything, and it ages out on its own.
 */
export const deleteLeadOnRequest = mutation({
  args: {
    leadId: v.id("leads"),
    /** The coach's own reference. Never the subject's details. */
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_lead_time", (q) => q.eq("leadId", args.leadId))
      .collect();
    for (const a of assessments) await ctx.db.delete(a._id);

    const links = await ctx.db
      .query("magicLinks")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    for (const l of links) await ctx.db.delete(l._id);

    // Call records go with them. These hold a coach's written read of a named
    // person, their salary expectation and their own question in their own
    // words, so a deletion that left them behind would erase the tidy half of
    // the file and keep the revealing half.
    const calls = await ctx.db
      .query("consultations")
      .withIndex("by_lead_time", (q) => q.eq("leadId", args.leadId))
      .collect();
    for (const c of calls) await ctx.db.delete(c._id);

    // The consent log goes too. It is a record *about* this person, holding
    // what they agreed to and when, so keeping it would be retaining data on
    // someone who asked to be erased. The `deletionLog` row below is what
    // survives, and it holds no identity by design.
    const consents = await ctx.db
      .query("consentEvents")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    for (const c of consents) await ctx.db.delete(c._id);

    // The commercial record goes with them too. It is tempting to argue that an
    // engagement is PunProfile's own business record rather than the subject's,
    // and for the money that is arguable; but these rows name a person, say what
    // they were sold, what was written about their CV and which jobs they
    // applied for, and a "deletion" that kept all of that would be a deletion in
    // name only. If a retained financial record is ever legally required, it
    // belongs in a separate table holding no identity, the same shape as
    // `deletionLog` itself.
    const engagements = await ctx.db
      .query("engagements")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_lead_time", (q) => q.eq("leadId", args.leadId))
      .collect();
    const placements = await ctx.db
      .query("placements")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    // Children first, so a failure part-way cannot orphan a deliverable under a
    // deleted engagement.
    for (const d of deliverables) await ctx.db.delete(d._id);
    for (const p of placements) await ctx.db.delete(p._id);
    for (const a of applications) await ctx.db.delete(a._id);
    for (const e of engagements) await ctx.db.delete(e._id);

    await ctx.db.delete(args.leadId);

    await ctx.db.insert("deletionLog", {
      deletedAt: Date.now(),
      performedBy: adminEmail,
      note: args.note,
      counts: {
        leads: 1,
        assessments: assessments.length,
        magicLinks: links.length,
        consultations: calls.length,
        consentEvents: consents.length,
        engagements: engagements.length,
        deliverables: deliverables.length,
        applications: applications.length,
        placements: placements.length,
      },
    });

    return {
      assessments: assessments.length,
      magicLinks: links.length,
      consultations: calls.length,
      consentEvents: consents.length,
      engagements: engagements.length,
      deliverables: deliverables.length,
      applications: applications.length,
      placements: placements.length,
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
      scores: scoresFor(lead.responses),
      status: lead.status,
      pathway: lead.pathway ?? null,
    };
  },
});
