"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { STAGE1 } from "@/lib/content/questions";
import QuestionCard from "@/components/features/assessment/QuestionCard";
import SpiderChart from "@/components/features/chart/SpiderChart";
import { useCopy } from "@/components/LocaleProvider";
import ContactGate from "@/components/features/assessment/ContactGate";
import LanguageGrid from "@/components/features/assessment/LanguageGrid";
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

const TOTAL_STEPS = STAGE1.length;

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
  // A latch, not render state: it only guards the one-shot resume below.
  const resumed = useRef(false);

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

  /**
   * Stage 2 opens from the first read rather than replacing it (TASK-072,
   * 14/08/2026). The candidate has their chart and their contact details are
   * in; this is extra accuracy they choose to give, so it is behind a button
   * and the grid itself carries a real Skip.
   */
  const [showGrid, setShowGrid] = useState(false);
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
    void startSession({ source: "direct" })
      .then(setLeadId)
      .catch(() => setStartFailed(true));
  }, [startSession, attempt]);

  // Resume position from server state on reload. Runs once: after that, local
  // state is ahead of the server and must not be overwritten by it.
  useEffect(() => {
    if (!session || resumed.current) return;
    resumed.current = true;
    const answers = Object.fromEntries(
      Object.entries(session.responses).filter(([, v]) => isAnswer(v)),
    ) as Record<string, Answer>;
    if (Object.keys(answers).length === 0) return;
    setLocal(answers);
    const answered = STAGE1.filter((q) => answers[q.key] !== undefined).length;
    setStep(Math.min(answered, TOTAL_STEPS));
  }, [session]);

  const scores = useMemo(() => session?.scores ?? {}, [session]);
  const hasLanguages = Boolean(
    session?.responses &&
      typeof session.responses.otherLanguages === "object" &&
      session.responses.otherLanguages !== null &&
      Object.keys(session.responses.otherLanguages as Record<string, unknown>).length > 0,
  );

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

  // Steps 0..8: the nine Stage 1 questions (TASK-019/020).
  if (step < STAGE1.length) {
    const q = STAGE1[step];
    const commit = (value: Answer) => {
      void submitAnswer({ leadId, questionKey: q.key, value });
      setStep(step + 1);
    };
    return (
      <QuestionCard
        key={q.key}
        prompt={pick(q)}
        options={q.options.map((o) => ({ value: o.value, label: pick(o) }))}
        select={q.select}
        selected={local[q.key]}
        step={step + 1}
        total={TOTAL_STEPS}
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

  if (showGrid) {
    return (
      <LanguageGrid
        onSubmit={async (levels) => {
          await submitLanguages({ leadId, levels });
          setShowGrid(false);
        }}
        onSkip={() => setShowGrid(false)}
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
      <p className="mt-2 text-caption text-neutral-500">{t("teaser.hollowMarkers")}</p>

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

      {/* Stage 2's one question, offered rather than imposed. Country Reach is
          computed on English alone until this is answered, which is a real gap
          in the chart above it, so the offer names what it buys instead of
          asking for more answers in the abstract. Hidden once answered: a
          candidate who has filled it in is being asked for nothing. */}
      {!hasLanguages && (
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          className="material mt-8 flex w-full items-center justify-between gap-3 rounded-lg px-6 py-5 text-left transition-colors hover:border-eufit"
        >
          <span>
            <span className="block text-label text-eufit-deep">{t("lang.offerLead")}</span>
            <span className="mt-1 block text-body text-slate">{t("lang.offerBody")}</span>
          </span>
          <span aria-hidden className="text-eufit-deep">&rarr;</span>
        </button>
      )}

      {/* Contact is already in by the time this renders, so this says what
          happens next rather than asking for anything. */}
      <p className="material-mint mt-6 rounded-lg px-6 py-6 text-body text-ink">
        {t("teaser.nextStep")}
      </p>

      {/* TASK-046. Hidden until a booking mechanism exists, rather than
          shipping a button that goes nowhere. */}
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
