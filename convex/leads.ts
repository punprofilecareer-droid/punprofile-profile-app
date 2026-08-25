import { mutation, query, internalMutation } from "./_generated/server";
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
import { isBlogOnlySubscriber } from "./subscribe";
import { resolveAll, ynGrid } from "../src/lib/consent";
import { meetsBookingGate } from "../src/lib/lifecycle";
import { parseAttribution, attributionFromLegacySource } from "../src/lib/attribution";
import { eraseLead } from "./erase";
import type { EraseCounts } from "./erase";
import { mergeLeads, duplicatesOf } from "./merge";
import { CONSENT_COPY } from "../src/lib/consent-copy";
import { adminEmails, isAdminEmail } from "./adminEmails";

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
  args: {
    source: v.optional(v.string()),
    /**
     * The landing page's query string, verbatim. Parsed server-side rather than
     * on the client so one implementation decides what a URL means, and so a
     * hand-crafted request cannot write a channel that does not exist.
     */
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TASK-039. Global, because a session that does not exist yet has nothing
    // to key on. See `rateLimits.ts` for why that is the honest ceiling here.
    await rateLimiter.limit(ctx, "startSession", { throws: true });

    const now = Date.now();
    const attribution = parseAttribution(args.search ?? "", now);
    return await ctx.db.insert("leads", {
      status: "partial",
      // Dual-written while `source` retires. It carries the channel so the old
      // field stays readable, not the literal "direct" the client used to send
      // on every session regardless of where anyone came from.
      source: attribution.raw ?? attribution.channel,
      attribution,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });
  },
});

/**
 * Backfill `attribution` from the legacy `source` string. Idempotent.
 *
 * **Most rows get nothing, and that is the point.** `"direct"` was what the
 * client sent unconditionally on every session, so it is a default the code
 * chose rather than anything observed about a person. Converting it into an
 * attribution would launder a hardcoded value into a finding, and the honest
 * record for those leads is that their origin is unknown.
 *
 * `survey_import` is skipped for the same reason in reverse: those leads came
 * from a Google Form, and `consentSource` already says so.
 */
export const backfillAttribution = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    const leads = await ctx.db.query("leads").collect();
    let written = 0;
    let alreadyHad = 0;
    let noInformation = 0;

    for (const lead of leads) {
      if (lead.attribution) {
        alreadyHad += 1;
        continue;
      }
      const attribution = attributionFromLegacySource(lead.source, lead.createdAt);
      if (!attribution) {
        noInformation += 1;
        continue;
      }
      written += 1;
      if (!dryRun) await ctx.db.patch(lead._id, { attribution });
    }

    return { dryRun, leadsScanned: leads.length, written, alreadyHad, noInformation };
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

    /**
     * Fold in every other row that turns out to be this person. 16/08/2026,
     * widened to all duplicates 19/08/2026.
     *
     * `subscribe` writes a lead row keyed only by email. `startSession` writes
     * one before any email is known, and writes a NEW one on every page load,
     * because the app has stored no session id since 10/08/2026. So one person
     * arrives here with a blog signup from March, a session they abandoned on
     * their phone last week, and the one they are finishing now.
     *
     * Until 19/08/2026 only the blog subscriber was folded in. The rest were
     * left standing, which is how a production lead came to have four rows and
     * how deleting one of them looked like a delete that did not work. Paul's
     * call: replace the duplicate with the fuller record.
     *
     * **The session row survives**, because the client is holding its id and is
     * about to keep using it. It is not "the winner": `mergeLeads` unions the
     * answers, so what survives is at least as full as anything it absorbed.
     */
    for (const duplicate of await duplicatesOf(ctx, { ...lead, email })) {
      await mergeLeads(ctx, args.leadId, duplicate._id);
    }

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
      // The booking gate. Moved to `lifecycle.ts` on 15/08/2026 with its
      // reasoning, because the admin surface needs the same answer and two
      // copies would drift the day wave 2 opens.
      sqlGate: meetsBookingGate(lead.responses),
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

  // The first name on the allowlist, so a bypassed local session still records
  // a real address on anything it writes rather than a placeholder that would
  // then have to be explained in the audit trail.
  return adminEmails()[0] ?? "dev-bypass@localhost";
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
  const email = String(user?.email ?? "").trim().toLowerCase();
  // Checked against the allowlist on every call, not at sign-up. Removing an
  // address from `ADMIN_EMAILS` therefore revokes access immediately, even
  // though the user row and its live sessions still exist.
  if (!isAdminEmail(email)) throw new ConvexError("Not authorised.");
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
  args: {
    limit: v.optional(v.number()),
    includeAbandoned: v.optional(v.boolean()),
    /**
     * Sort key. `recent` is the default and the one the dashboard was built
     * around; the others exist because a coach working a queue wants a
     * different order from a coach scanning what just happened.
     *
     * `created` and `created_oldest` sort on `createdAt`, which is NOT what
     * `recent` and `oldest` do: those read `lastActivityAt`, so an old lead who
     * came back yesterday sorts as recent. Added 24/08/2026 because "who
     * arrived this week" and "who did something this week" are different
     * questions and only the second had an answer.
     */
    sort: v.optional(
      v.union(
        v.literal("recent"),
        v.literal("oldest"),
        v.literal("created"),
        v.literal("created_oldest"),
        v.literal("status"),
        v.literal("fit"),
        v.literal("ready"),
        v.literal("rating"),
      ),
    ),
    /** Hidden by default: a judged-out lead is noise in a working queue. */
    includeDisqualified: v.optional(v.boolean()),
    /**
     * One pipeline stage only. Applied before the display limit, so picking a
     * stage with two hundred people in it returns that stage's first hundred
     * and not whatever survived a limit taken across all three.
     */
    onlyStatus: v.optional(
      v.union(v.literal("partial"), v.literal("email_captured"), v.literal("completed")),
    ),
  },
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

    /**
     * The scan window, deliberately independent of the display limit.
     *
     * `.take(limit)` truncates by recency **before** the sort below runs, so
     * fetching only `limit` rows means "fit, best first" can never surface an
     * older lead with a better fit: it only reorders the most recent handful.
     * Caught 15/08/2026 by asking five sorts for three rows each and getting
     * the same three people back.
     *
     * So the window is fixed and generous, the sort runs over all of it, and
     * the display limit is applied last. At a few hundred leads this reads the
     * table; revisit at tens of thousands, when a real cursor is needed anyway.
     */
    const SCAN = 1000;
    const rows = (
      await Promise.all(
        statuses.map((status) =>
          ctx.db
            .query("leads")
            .withIndex("by_status_recency", (q) => q.eq("status", status))
            .order("desc")
            .take(SCAN),
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
    //
    // Ordering is applied to the whole scan window before the display limit, so
    // changing the sort changes which leads you see and not merely their order.
    // That only holds because the window above is not the limit; see its note.
    const STATUS_RANK = { completed: 0, email_captured: 1, partial: 2 } as const;
    const sort = args.sort ?? "recent";

    /**
     * Blog subscribers are out of this view until they take the check.
     *
     * Paul's rule, 16/08/2026: they share the lead record and the consent log,
     * which is what makes one person one row and one consent history, and they
     * are not leads yet. Someone who handed over an email to read job openings
     * has not asked to be coached and should not sit in a queue of people who
     * have.
     *
     * **Not covered by the status filter above**, which is why this is here.
     * `partial` is already hidden by default, so this changes nothing in the
     * everyday view; it matters under `includeAbandoned`, where the question
     * being asked is "how many start the check and never finish" and a
     * subscriber is not an answer to it, having never started.
     *
     * It reverses on its own. The moment they answer a question the predicate
     * stops matching and they appear, which is the rule as stated rather than
     * a job somebody has to remember to run.
     */
    const leadsOnly = rows.filter((l) => !isBlogOnlySubscriber(l));

    const inStage = args.onlyStatus
      ? leadsOnly.filter((l) => l.status === args.onlyStatus)
      : leadsOnly;

    const visible = args.includeDisqualified
      ? inStage
      : inStage.filter((l) => l.disposition !== "disqualified");

    const ordered = visible.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.lastActivityAt - b.lastActivityAt;
        case "created":
          return b.createdAt - a.createdAt;
        case "created_oldest":
          return a.createdAt - b.createdAt;
        case "status":
          return (
            STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
            b.lastActivityAt - a.lastActivityAt
          );
        case "fit": {
          // Ungraded sorts last rather than as zero. A blank grade means the
          // inputs are missing, not that the person scored badly.
          const av = gradeLead(toGradeInput(a.responses ?? {}), latestCoachIcp(byLead.get(a._id) ?? [])).score;
          const bv = gradeLead(toGradeInput(b.responses ?? {}), latestCoachIcp(byLead.get(b._id) ?? [])).score;
          return (bv ?? -1) - (av ?? -1) || b.lastActivityAt - a.lastActivityAt;
        }
        case "ready": {
          const mean = (r: Record<string, unknown> | undefined) => {
            const s = scoresFor(r);
            const vals = Object.values(s).filter((n): n is number => typeof n === "number");
            return vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : -1;
          };
          return mean(b.responses) - mean(a.responses) || b.lastActivityAt - a.lastActivityAt;
        }
        case "rating":
          // Unrated sorts last rather than as a zero. Nobody has judged them is
          // not the same claim as judged and found wanting, which is the same
          // distinction `grade.tier` already makes for the Judged column.
          return (
            (b.coachRating ?? -1) - (a.coachRating ?? -1) || b.lastActivityAt - a.lastActivityAt
          );
        default:
          return b.lastActivityAt - a.lastActivityAt;
      }
    });

    return ordered
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
        disposition: l.disposition ?? null,
        dispositionReason: l.dispositionReason ?? null,
        // Coach-entered, 16/08/2026. The rating is a column in the list; the
        // LinkedIn is here so the list can show whether one has been found
        // without a second query per row.
        coachRating: l.coachRating ?? null,
        linkedinUrl: l.linkedinUrl ?? null,
        hasNotes: Boolean(l.notes),
        // A tick, not an answer. See the schema note: `responses.cv` is the
        // candidate's rating of their own CV and this is whether a document
        // actually arrived.
        cvReceivedAt: l.cvReceivedAt ?? null,
        // So the row can say the stage was set by hand rather than earned.
        statusOverrideAt: l.statusOverrideAt ?? null,
        statusOverrideBy: l.statusOverrideBy ?? null,
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
      disposition: lead.disposition ?? null,
      dispositionReason: lead.dispositionReason ?? null,
      dispositionAt: lead.dispositionAt ?? null,
      // Coach-entered, 16/08/2026. `linkedin` in `responses` is the candidate's
      // own rating of their profile; this is where it lives. Different fields,
      // and a screen that showed one as the other would be lying.
      linkedinUrl: lead.linkedinUrl ?? null,
      notes: lead.notes ?? null,
      notesAt: lead.notesAt ?? null,
      notesBy: lead.notesBy ?? null,
      coachRating: lead.coachRating ?? null,
      coachRatingAt: lead.coachRatingAt ?? null,
      coachRatingBy: lead.coachRatingBy ?? null,
      cvReceivedAt: lead.cvReceivedAt ?? null,
      cvReceivedBy: lead.cvReceivedBy ?? null,
      /**
       * Resolved from `consentEvents`, per channel and per purpose. This is the
       * only field that can answer "may we send them a job digest", and today
       * it answers `never_asked` for every lead in the database, which is
       * correct: no screen has ever asked.
       */
      consent: resolveAll(consentEvents),
      /**
       * The same answer as a y/n column: "Y", "N", or empty for never asked.
       * Keyed `<purpose>.<channel>`. Derived on read like everything else here;
       * it exists because an export and a column view want one short value.
       */
      consentYN: ynGrid(consentEvents),
      /** The raw log, oldest first, for the subject-access export. A person
       *  asking what is held about them is entitled to the withdrawals too, not
       *  just the grants that survived. */
      consentEvents: [...consentEvents].sort((a, b) => a.at - b.at),
      pathway: lead.pathway ?? null,
      status: lead.status,
      source: lead.source ?? null,
      attribution: lead.attribution ?? null,
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

    /**
     * **Every row this person has, not the one that was open.** Widened
     * 19/08/2026, after a deletion appeared not to work: the person had four
     * rows in production, one was erased, and their name stayed in the list.
     * The button has always said "Delete this person permanently" and this is
     * what makes that sentence true.
     *
     * Duplicates are matched on email and nothing else. Rows with no email
     * cannot be attributed to a person at all, and matching on a name or a
     * device would risk erasing somebody else, which is the one mistake this
     * screen must never make.
     *
     * `captureContact` now merges duplicates as they arrive, so this should
     * find one row for anyone who signed up after 19/08/2026. It stays because
     * the rows that predate that merge exist, and because a second row can
     * still be created by a session that never reaches the contact gate.
     */
    const rows = [lead, ...(await duplicatesOf(ctx, lead))];

    // The cascade lives in `erase.ts` and is shared with the retention sweep.
    // Two copies is how a table gets added to one and not the other, and the
    // failure mode is a deletion that leaves a person's answers behind.
    //
    // **`retentionBlockedBecause` is deliberately not called here.** A live
    // engagement stops the clock from erasing someone; it does not stop the
    // person themselves from asking. Someone requesting erasure is not refused
    // because they are mid-engagement.
    //
    // One log row per lead row erased, rather than one per request. The log is
    // the count of what was destroyed and it should not start summing rows
    // together, but the note ties them: they carry the same one.
    const total: EraseCounts = {
      leads: 0,
      assessments: 0,
      magicLinks: 0,
      consultations: 0,
      consentEvents: 0,
      engagements: 0,
      deliverables: 0,
      applications: 0,
      placements: 0,
    };
    const at = Date.now();
    for (const row of rows) {
      const counts = await eraseLead(ctx, row._id);
      await ctx.db.insert("deletionLog", {
        deletedAt: at,
        performedBy: adminEmail,
        note: args.note,
        counts,
      });
      for (const key of Object.keys(total) as (keyof EraseCounts)[]) total[key] += counts[key];
    }

    return total;
  },
});

/**
 * Record, or clear, the coach's judgement about working this lead.
 *
 * A reason is required. A disposition with no reason is an opinion nobody can
 * review later, and this field will outlive whoever set it.
 *
 * Clearing is `disposition: null`, which is a real action rather than an
 * absence: it restores "nobody has judged", not "judged and passed".
 */
export const setDisposition = mutation({
  args: {
    leadId: v.id("leads"),
    disposition: v.union(v.literal("disqualified"), v.literal("not_now"), v.null()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    if (args.disposition === null) {
      await ctx.db.patch(args.leadId, {
        disposition: undefined,
        dispositionReason: undefined,
        dispositionAt: undefined,
        dispositionBy: undefined,
        updatedAt: Date.now(),
      });
      return;
    }

    const reason = args.reason?.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    await ctx.db.patch(args.leadId, {
      disposition: args.disposition,
      dispositionReason: reason,
      dispositionAt: Date.now(),
      dispositionBy: adminEmail,
      updatedAt: Date.now(),
    });
  },
});

/**
 * How many leads sit in each pipeline stage. Added 24/08/2026.
 *
 * **Counted over everyone, not over the list.** The list hides abandoned
 * sessions and judged-out leads by default, so counting what it returns would
 * make the abandoned stage read zero on the one screen whose job is to say how
 * many were abandoned. Same population as `listForAdmin` otherwise: blog-only
 * subscribers are excluded, because someone who gave an email to read job
 * openings has not entered this pipeline.
 *
 * Judged-out leads are reported beside the stages rather than inside them. A
 * disposition is a side exit, not a rung, and adding it as a fourth segment
 * would make the three shares mean something other than "of the people still in
 * play, this many are here".
 */
export const pipeline = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const SCAN = 1000;
    const rows = (
      await Promise.all(
        (["partial", "email_captured", "completed"] as const).map((status) =>
          ctx.db
            .query("leads")
            .withIndex("by_status_recency", (q) => q.eq("status", status))
            .order("desc")
            .take(SCAN),
        ),
      )
    ).flat();

    const leadsOnly = rows.filter((l) => !isBlogOnlySubscriber(l));

    const counts = { partial: 0, email_captured: 0, completed: 0 };
    let judgedOut = 0;
    let notNow = 0;
    let withCv = 0;
    let handSet = 0;

    for (const l of leadsOnly) {
      // Counted and then skipped: a judged-out lead is out of the pipeline, and
      // the stage it was in when the judgement landed is not where it is now.
      if (l.disposition === "disqualified") {
        judgedOut++;
        continue;
      }
      if (l.disposition === "not_now") notNow++;
      counts[l.status]++;
      if (l.cvReceivedAt) withCv++;
      if (l.statusOverrideAt) handSet++;
    }

    return {
      counts,
      judgedOut,
      notNow,
      withCv,
      /** How many of the stages above were set by hand rather than earned. */
      handSet,
      /** True when a status hit the scan ceiling, so the counts are a floor.
       *  Named rather than hidden: a truncated count that looks exact is the
       *  failure this file already avoids once, in `listForAdmin`. */
      capped: rows.length >= SCAN * 3,
    };
  },
});

/**
 * Move a lead to a pipeline stage by hand.
 *
 * **This writes the funnel's own column, and that is the point and the cost.**
 * Paul asked for it on 24/08/2026 having been told what it does: `status` is
 * what `stats.community` counts, what the abandoned-versus-finished split
 * reads, and what the booking cut divides by, so a hand-set stage moves those
 * numbers exactly as a real one would. `statusOverrideAt` is what keeps the
 * measured answer recoverable; see the schema note.
 *
 * The one refusal is a stage that would make the row incoherent rather than
 * merely optimistic. `email_captured` means the contact gate cleared, and a
 * lead with no email in it cannot be contacted whatever the column says, so
 * that combination is rejected instead of stored.
 */
export const setStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("partial"),
      v.literal("email_captured"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    if (args.status !== "partial" && !lead.email) {
      throw new ConvexError(
        "That stage means we have their contact details, and this lead has no email.",
      );
    }

    if (lead.status === args.status) return;

    const now = Date.now();
    await ctx.db.patch(args.leadId, {
      status: args.status,
      statusOverrideAt: now,
      statusOverrideBy: adminEmail,
      updatedAt: now,
      // Deliberately not touched. `lastActivityAt` is the candidate's activity
      // and the Last column reads it; a coach reclassifying a row is not the
      // candidate coming back, and writing it here would make a dead lead look
      // alive on the one column that says whether it is.
    });
  },
});

/**
 * Coach-entered fields on a lead: LinkedIn, the running note, the rating, and
 * whether a CV has arrived.
 *
 * One mutation for all of them because the first three are one form in the UI
 * and a partial save of a form is a worse bug than a chatty API. Each field is
 * only written when the caller sends it, so saving a note does not silently
 * clear a rating, and the lead list can tick `cvReceived` from a row without
 * touching anything else.
 *
 * Added 16/08/2026, after a coach found a candidate's LinkedIn by hand and had
 * nowhere to put it. `cvReceived` joined it 24/08/2026.
 */
export const setCoachFields = mutation({
  args: {
    leadId: v.id("leads"),
    /** Absent leaves it alone. Null clears it. */
    linkedinUrl: v.optional(v.union(v.string(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
    /** 1 to 5, or null to clear. */
    coachRating: v.optional(v.union(v.number(), v.null())),
    /** True stamps now. False clears it back to never-received. */
    cvReceived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const adminEmail = await requireAdmin(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new ConvexError("Lead not found.");

    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };

    if (args.linkedinUrl !== undefined) {
      const raw = args.linkedinUrl?.trim();
      if (!raw) {
        patch.linkedinUrl = undefined;
      } else {
        // Accept what a coach actually pastes. A bare `linkedin.com/in/x` and a
        // full URL with a tracking query are the same profile, and rejecting
        // the first would mean the field is only usable by someone who knows it
        // wants a scheme.
        const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        let parsed: URL;
        try {
          parsed = new URL(url);
        } catch {
          throw new ConvexError("That does not look like a URL.");
        }
        if (!/(^|\.)linkedin\.com$/i.test(parsed.hostname)) {
          throw new ConvexError("That is not a linkedin.com address.");
        }
        // Drop the query. LinkedIn appends tracking parameters that identify
        // the account that did the looking, and storing those puts the coach's
        // browsing in the candidate's record.
        parsed.search = "";
        patch.linkedinUrl = parsed.toString();
      }
    }

    if (args.notes !== undefined) {
      const text = args.notes?.trim();
      if (!text) {
        patch.notes = undefined;
        patch.notesAt = undefined;
        patch.notesBy = undefined;
      } else {
        patch.notes = text;
        patch.notesAt = now;
        patch.notesBy = adminEmail;
      }
    }

    if (args.cvReceived !== undefined) {
      if (args.cvReceived) {
        // Re-ticking an already-ticked lead keeps the original date. The field
        // answers "since when do we have it", and overwriting that on a stray
        // click would quietly move the date the follow-up clock is read from.
        if (!lead.cvReceivedAt) {
          patch.cvReceivedAt = now;
          patch.cvReceivedBy = adminEmail;
        }
      } else {
        patch.cvReceivedAt = undefined;
        patch.cvReceivedBy = undefined;
      }
    }

    if (args.coachRating !== undefined) {
      if (args.coachRating === null) {
        patch.coachRating = undefined;
        patch.coachRatingAt = undefined;
        patch.coachRatingBy = undefined;
      } else {
        const n = Math.round(args.coachRating);
        if (n < 1 || n > 5) throw new ConvexError("A rating is 1 to 5.");
        patch.coachRating = n;
        patch.coachRatingAt = now;
        patch.coachRatingBy = adminEmail;
      }
    }

    await ctx.db.patch(args.leadId, patch);
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
