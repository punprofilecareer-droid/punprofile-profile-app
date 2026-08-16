"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { STAGE1 } from "@/lib/content/questions";
import QuestionCard from "@/components/features/assessment/QuestionCard";
import { BLOCKS, blockFor } from "@/lib/content/blocks";
import BlockPanel, { type BlockImage } from "@/components/features/assessment/BlockPanel";
import SpiderChart from "@/components/features/chart/SpiderChart";
import { useCopy } from "@/components/LocaleProvider";
import ContactGate from "@/components/features/assessment/ContactGate";
import LanguageGrid from "@/components/features/assessment/LanguageGrid";
import CommunityStats from "@/components/features/assessment/CommunityStats";
import Link from "next/link";
import { setNavLocked } from "@/lib/navLock";
import { buildTeaserSummary } from "@/lib/views";
import { toScoringInput } from "@/lib/content/mapping";

/**
 * TASK-018..022: the Stage 1 flow. The nine questions from
 * `survey-spec-template.md`, pathway first, then the teaser chart, reactive off
 * `leads.getSession`, with no contact ask anywhere on screen (FR-004). Answers
 * render optimistically from local state; the server recomputes scores on every
 * write.
 *
 * Pathway is no longer special-cased in this file. It is STAGE1[0] like any
 * other question, and `submitAnswer` mirrors it onto the `leads.pathway` column
 * so the `by_pathway` index stays populated.
 *
 * No client-side storage at all: every visit is a new session. Resume exists
 * only through the magic link, which needs an email and its consent first.
 */

/**
 * The flow, as one sequence. Stage 2 was collapsed into Stage 1 on 14/08/2026.
 *
 * There had been two stages and no principle behind the split: Stage 1 was
 * whatever the retiring quiz used to ask, and Stage 2 meant "everything we did
 * not get to". The moment that was written down it stopped surviving contact
 * with the actual boundary, which is the contact step. Before it, every
 * question is a conversion cost paid by a stranger; after it, questions are
 * nearly free. A second stage on the far side of that boundary is optional by
 * construction, so nothing the business actually needs can live there, which
 * made it the wrong home for the one question that was in it.
 *
 * So there is one flow and one budget. "Which stage does this go in" becomes
 * "does this question earn its place at all", which is a question with an
 * answer.
 *
 * The language grid is a step in the sequence rather than an entry in STAGE1
 * because it is not a QuestionCard: it is one question whose follow-ups depend
 * on its own answer. `FLOW` keeps the engine index-based by holding either a
 * question or that one marker.
 */
const LANGUAGES_STEP = { custom: "languages" } as const;
type FlowStep = (typeof STAGE1)[number] | typeof LANGUAGES_STEP;

/** Straight after English, where a candidate is already thinking about language. */
const ENGLISH_AT = STAGE1.findIndex((q) => q.key === "english");
const FLOW: FlowStep[] = [
  ...STAGE1.slice(0, ENGLISH_AT + 1),
  LANGUAGES_STEP,
  ...STAGE1.slice(ENGLISH_AT + 1),
];

const TOTAL_STEPS = FLOW.length;

type Answer = string | string[];

const isAnswer = (v: unknown): v is Answer =>
  typeof v === "string" || (Array.isArray(v) && v.every((x) => typeof x === "string"));

/** Set once TASK-046 picks a booking mechanism. The CTA hides until then. */
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

export default function AssessPage() {
  const { t, pick, locale } = useCopy();
  const [leadId, setLeadId] = useState<Id<"leads"> | null>(null);
  const [local, setLocal] = useState<Record<string, Answer>>({});
  const [step, setStep] = useState(0); // 0..STAGE1.length-1 = questions, then the contact gate, then the teaser
  /** Which half of the question transition is on screen. See `commit` below. */
  const [phase, setPhase] = useState<"entering" | "leaving">("entering");

  /**
   * A deliberate floor on how fast the first question can appear, 14/08/2026.
   *
   * `startSession` usually resolves in well under 200ms, so tapping the CTA
   * swapped one screen for another with no beat in between and read as a
   * mis-tap rather than a start. The pause is doing honest work: it says a
   * session was created and something is being prepared, which is true.
   *
   * A floor, not a delay added on top. If the mutation is slow the wait is the
   * mutation's, not this; the two overlap rather than stack, so a bad
   * connection never pays twice.
   *
   * 900ms first, raised to 1500ms on Paul's read. The upper bound is the PRD
   * § 1 budget of 90 seconds from landing to first read, which this spends
   * 1.5s of, so there is room but not unlimited room.
   */
  const [minWaitDone, setMinWaitDone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinWaitDone(true), 1500);
    return () => clearTimeout(id);
  }, []);

  const startSession = useMutation(api.leads.startSession);
  const submitAnswer = useMutation(api.leads.submitAnswer);
  const captureContact = useMutation(api.leads.captureContact);
  const submitLanguages = useMutation(api.leads.submitLanguages);
  const [startFailed, setStartFailed] = useState(false);
  /** Bumping this re-runs the session effect, which is what Try again does. */
  const [attempt, setAttempt] = useState(0);
  const session = useQuery(api.leads.getSession, leadId ? { leadId } : "skip");

  // Always a new session. Nothing about the candidate is stored on their
  // device: no cookie, no localStorage, no identifier of any kind before they
  // have consented to anything.
  //
  // US-001's acceptance criteria require this in as many words: closing the tab
  // mid-flow without giving an email must leave no recoverable lead. Resume is
  // the magic link's job (FR-011), and that only exists once an email and its
  // consent do.
  useEffect(() => {
    // A rejection here is usually the rate limit (TASK-039) or a dropped
    // connection. Without this the promise fails silently and the candidate
    // watches the loading line forever, which reads as a broken app rather
    // than a busy one.
    // The landing query string, handed over verbatim and parsed server-side.
    //
    // This used to send the literal "direct" on every session and never look at
    // the URL, so every app-native lead in the database claims the same origin
    // and none of those claims mean anything. A job post link carrying
    // `?src=fb&job=<job-log id>` is now recoverable all the way back to the post
    // that produced the lead.
    //
    // Read at call time rather than from a hook: this runs once per session and
    // `useSearchParams` would opt the whole route into a Suspense boundary for
    // a value that is already sitting on `location`.
    const search = typeof window === "undefined" ? "" : window.location.search;
    void startSession({ search })
      .then(setLeadId)
      .catch(() => setStartFailed(true));
  }, [startSession, attempt]);

  /**
   * Resume position from server state on reload. Runs once: after that, local
   * state is ahead of the server and must not be overwritten by it.
   *
   * Adjusted during render rather than in an effect, 16/08/2026. The effect
   * version was a visible bug as well as a lint error: it painted question one,
   * then jumped to wherever the candidate actually was, so a returning
   * candidate saw a question they had already answered flash past.
   */
  const [resumed, setResumed] = useState(false);
  if (session && !resumed) {
    setResumed(true);
    const answers = Object.fromEntries(
      Object.entries(session.responses).filter(([, v]) => isAnswer(v)),
    ) as Record<string, Answer>;
    if (Object.keys(answers).length > 0) {
      setLocal(answers);
      const answered = STAGE1.filter((q) => answers[q.key] !== undefined).length;
      setStep(Math.min(answered, TOTAL_STEPS));
    }
  }

  /**
   * Hide the site menu for as long as leaving would cost the candidate their
   * answers, TASK-085.
   *
   * The condition is the flow's own two facts, not a route match: still inside
   * the questions, or through them but not yet past the contact step. After
   * that the session is a real lead with an email, the result is on screen, and
   * navigating away loses nothing, so the menu comes back.
   *
   * Publishing to an external store from an effect is the intended direction
   * for `useSyncExternalStore`, and the cleanup releases the lock on unmount so
   * a candidate who leaves by any other means cannot strand the menu hidden.
   */
  const navLocked = step < FLOW.length || session?.status === "partial";
  useEffect(() => {
    setNavLocked(navLocked);
    return () => setNavLocked(false);
  }, [navLocked]);

  const scores = useMemo(() => session?.scores ?? {}, [session]);

  /**
   * The lowest scored axis, which aims the services link and nothing else.
   *
   * It is a hint about which section of `/services` to open on, not a verdict:
   * the page highlights one card and shows all three regardless. Undefined
   * scores are skipped rather than treated as zero, because a hollow marker
   * means "not measured", which is the distinction the chart caption makes and
   * this must not quietly contradict.
   */
  const weakest = useMemo(() => {
    let key: string | null = null;
    let low = Infinity;
    for (const [k, v] of Object.entries(scores)) {
      if (typeof v === "number" && v < low) {
        low = v;
        key = k;
      }
    }
    return key;
  }, [scores]);

  // Selected from the sentence bank, never composed. Recomputed client-side
  // from the same responses the server scored, so the words and the chart
  // cannot disagree.
  const summary = useMemo(
    () =>
      session
        ? buildTeaserSummary(
            toScoringInput(session.responses),
            session.pathway as Parameters<typeof buildTeaserSummary>[1],
            locale,
          )
        : null,
    [session, locale],
  );

  if (!leadId || !minWaitDone) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-24 text-center">
        {startFailed ? (
          <>
            <p className="text-body text-slate">{t("assess.busy")}</p>
            <button
              type="button"
              onClick={() => {
                setStartFailed(false);
                setAttempt((n) => n + 1);
              }}
              className="mt-6 h-12 rounded-md bg-accent px-7 text-label text-on-accent transition-colors hover:bg-accent-bright"
            >
              {t("assess.retry")}
            </button>
          </>
        ) : (
          <>
            {/* Something moving, or the pause reads as a stall rather than as
                work. Ring on the brand primary, one revolution a second. */}
            <span
              aria-hidden
              className="mx-auto mb-5 block size-8 animate-spin rounded-full border-2 border-neutral-300 border-t-eufit"
            />
            <p className="text-body text-neutral-500" role="status">
              {t("assess.starting")}
            </p>
          </>
        )}
      </div>
    );
  }

  // The question sequence (TASK-019/020), now including the language grid.
  if (step < FLOW.length) {
    const item = FLOW[step];

    /**
     * The photograph for whatever the flow is showing.
     *
     * Computed here rather than inside the card, and `BlockPanel` is mounted
     * outside the keyed `QuestionCard`, so it survives every answer. The first
     * version put the panel inside the card, which the page keys on the
     * question, so it remounted on every tap and its crossfade could never run.
     */
    const panel: BlockImage | null = (() => {
      const b = blockFor("custom" in item ? "languages" : item.key);
      if (!b?.image) return null;
      return {
        src: `/assess/blocks/${b.image}`,
        // Decorative. The section it marks is already named by the question the
        // candidate is reading, so describing the photograph would put a
        // sentence between them and the question for no gain.
        alt: "",
        // Only the first block preloads. The rest are minutes away.
        priority: b.id === BLOCKS[0].id,
        blurDataURL: b.blurDataURL,
      };
    })();

    if ("custom" in item) {
      return (
        <BlockPanel image={panel}>
        <LanguageGrid
          // Skip writes an empty grid rather than nothing. "I speak no other
          // European language" is an answer, and it is a different fact from
          // "never reached this question": the first lets Country Reach stand
          // on English honestly, the second leaves it unmeasured.
          onSubmit={async (levels) => {
            await submitLanguages({ leadId, levels });
            setStep(step + 1);
          }}
          onSkip={async () => {
            await submitLanguages({ leadId, levels: {} });
            setStep(step + 1);
          }}
          step={step + 1}
          total={TOTAL_STEPS}
          onBack={() => setStep(step - 1)}
        />
        </BlockPanel>
      );
    }

    const q = item;
    /**
     * Hold, then leave, then advance.
     *
     * The write goes out immediately; only the screen waits. A candidate who
     * closes the tab during the 460ms still has their answer saved, which is
     * the whole reason the two are not sequenced together.
     *
     * Durations are read from the stylesheet rather than repeated here, so
     * `--q-hold` and `--q-out` stay the single definition and a reduced-motion
     * user gets whatever those resolve to for them.
     */
    const commit = (value: Answer) => {
      void submitAnswer({ leadId, questionKey: q.key, value });
      const css = getComputedStyle(document.documentElement);
      /**
       * Read a CSS time as milliseconds, honouring the unit.
       *
       * `parseFloat` alone was a bug and a well-hidden one. The stylesheet says
       * `260ms`; the production minifier rewrites that to the shorter `.26s`,
       * so `parseFloat` returned 0.26 and the hold became a quarter of a
       * millisecond. The transition looked broken in exactly the way Paul
       * described, "too fast, acting weird", and it worked in the source and
       * failed in the build, which is the worst place for a difference to live.
       */
      const ms = (name: string) => {
        const raw = css.getPropertyValue(name).trim();
        const n = parseFloat(raw);
        if (!Number.isFinite(n)) return 0;
        return raw.endsWith("ms") ? n : n * 1000;
      };
      setPhase("leaving");
      window.setTimeout(
        () => {
          setStep(step + 1);
          setPhase("entering");
        },
        ms("--q-hold") + ms("--q-out"),
      );
    };
    return (
      <BlockPanel image={panel}>
      <QuestionCard
        key={q.key}
        prompt={pick(q)}
        options={q.options.map((o) => ({ value: o.value, label: pick(o) }))}
        select={q.select}
        selected={local[q.key]}
        step={step + 1}
        total={TOTAL_STEPS}
        phase={phase}
        // The section's photograph, held across every question in the block, so
        // it changes six times across sixteen questions rather than sixteen.
        // Null until one is sourced, which is the norm today.
        hasPanel={Boolean(blockFor(q.key)?.image)}
        onSelect={(value) => {
          setLocal((prev) => ({ ...prev, [q.key]: value }));
          // A "many" question waits for Continue: the scorer should only ever
          // see a complete list, and a per-tap write would score a half-answer.
          if (q.select === "one") commit(value);
        }}
        onContinue={() => {
          const value = local[q.key];
          if (value !== undefined) commit(value);
        }}
        // PRD § 11: a candidate may change a prior answer after moving forward,
        // and the score recomputes rather than the update being discarded.
        // Nothing is unwound on the way back: the previous answer stays stored
        // until they actually replace it.
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
      />
      </BlockPanel>
    );
  }

  // Contact is the last step of the survey, not a gate on the result.
  //
  // Decided 10/08/2026, and it deliberately reverses PRD FR-004, which had the
  // chart render before any contact field. That mechanic optimised for people
  // finishing; this one optimises for every finisher being reachable, because
  // the full result now arrives through a human rather than a screen.
  if (session && session.status === "partial") {
    return (
      <ContactGate
        totalSteps={TOTAL_STEPS + 1}
        onSubmit={async (values) => {
          await captureContact({ leadId, ...values });
        }}
      />
    );
  }

  // Teaser (TASK-021/022): chart only, no contact ask on this screen.
  return (
    <div className="mx-auto w-full max-w-md px-6 py-10 text-center">
      <h1 className="text-h3">{t("teaser.headline")}</h1>
      <p className="mt-1 text-body text-slate">{t("teaser.selfReported")}</p>
      {/* The chart gets its own surface. The radar's grid is 1px neutral-300
          and the field's gradient moves through the same value range, so on
          the field alone the grid reads as noise rather than as structure. */}
      <div className="material mt-4 rounded-lg px-2 py-4">
        <SpiderChart scores={scores} variant="teaser" />
      </div>

      {/* The personalized read. Every sentence is selected from the bank in
          `narrative-copy.ts` by the candidate's own scores, so nothing here can
          claim more than the answers support. */}
      {summary && (
        <div className="mt-8 space-y-4 text-left">
          <p className="text-body-lg text-ink">{summary.opener}</p>
          <p className="text-body text-slate">{summary.standing}</p>
          {summary.strengthLead && (
            <p className="text-body text-slate">{summary.strengthLead}</p>
          )}
          {summary.next && (
            <div className="material-mint rounded-lg px-6 py-6">
              <p className="text-label text-eufit-deep">{summary.nextLead}</p>
              <p className="mt-2 text-body text-ink">{summary.next}</p>
            </div>
          )}
          {summary.unmeasured && (
            <p className="text-caption text-neutral-500">{summary.unmeasured}</p>
          )}
        </div>
      )}

      {/* Contact is already in by the time this renders, so this says what
          happens next rather than asking for anything. */}
      <p className="material-mint mt-6 rounded-lg px-6 py-6 text-body text-ink">
        {t("teaser.nextStep")}
      </p>

      {/* TASK-083. Two facts about everyone who has taken this and one about
          the candidate, so the screen after the queue message has something on
          it other than waiting. Renders nothing at all until each statistic
          clears its own sample floor. */}
      <CommunityStats scores={scores} />

      {/* TASK-084. The second action on this screen, and deliberately not a
          second booking button: the candidate has just been told there is a
          queue, so what they can usefully do now is read what the work is.
          Secondary treatment throughout, because when TASK-046 turns the
          booking CTA on below, that one is the revenue step and only one
          Terracotta action belongs on a view. */}
      <div className="material mt-8 rounded-lg px-6 py-7 text-left">
        <h2 className="text-h4">{t("services.cta.heading")}</h2>
        <p className="mt-2 text-body text-slate">{t("services.cta.body")}</p>
        {/* Still hand-rolled, and the one deliberate exception to the table:
            this link carries `?focus=` so the services page opens on the axis
            the candidate scored lowest, which no shared component can know.
            It is the table's `/assess-result` primary in every other respect,
            including its destination. */}
        <Link
          href={weakest ? `/services?focus=${weakest}` : "/services"}
          className="mt-5 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-body-lg font-semibold text-on-accent transition-colors hover:bg-accent-bright"
        >
          {t("services.cta.button")}
          <span aria-hidden>&rarr;</span>
        </Link>
      </div>

      {/* TASK-046. Hidden until a booking mechanism exists, rather than
          shipping a button that goes nowhere. */}
      {/* When TASK-046 turns this on, this screen will hold two Terracotta
          actions and one of them has to give way. The booking CTA wins, since
          it is the revenue step; the language offer drops to a secondary
          treatment at that point rather than both shouting. */}
      {BOOKING_URL && (
        <div className="mt-8 text-left">
          <h2 className="text-h4">{t("narrative.cta.heading")}</h2>
          <p className="mt-2 text-body text-slate">{t("narrative.cta.body")}</p>
          <a
            href={BOOKING_URL}
            className="mt-4 inline-block rounded-md bg-accent px-7 py-3.5 text-label text-on-accent transition-colors hover:bg-accent-bright"
          >
            {t("narrative.cta.button")}
          </a>
        </div>
      )}
      {/* Without this the chart is a dead end, and PRD § 11 allows changing an
          answer after moving forward. Quiet, and below the chart, so it never
          competes with the reveal. */}
      <button
        type="button"
        onClick={() => setStep(STAGE1.length - 1)}
        className="mt-6 rounded-sm px-2 py-1 text-caption text-slate underline underline-offset-2 transition-colors hover:text-eufit-deep"
      >
        {t("teaser.revise")}
      </button>
    </div>
  );
}
