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
import FullResult from "@/components/features/assessment/FullResult";
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
 * The session id lives in localStorage so a closed tab resumes mid-flow on the
 * same device; cross-device resume is the magic link (Phase 2).
 */

const STORAGE_KEY = "eufit.leadId";
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
  const [step, setStep] = useState(0); // 0..8 = questions, 9 = teaser
  // A latch, not render state: it only guards the one-shot resume below.
  const resumed = useRef(false);

  const startSession = useMutation(api.leads.startSession);
  const submitAnswer = useMutation(api.leads.submitAnswer);
  const captureContact = useMutation(api.leads.captureContact);
  // Shown only when the candidate asks for it. FR-004 keeps the teaser free of
  // any contact field, so the gate is a step they choose to take, not one that
  // appears over the chart.
  const [gateOpen, setGateOpen] = useState(false);
  const session = useQuery(api.leads.getSession, leadId ? { leadId } : "skip");

  // Create or resume the session.
  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY) as Id<"leads"> | null;
    if (existing) {
      setLeadId(existing);
      return;
    }
    void startSession({ source: "direct" }).then((id) => {
      window.localStorage.setItem(STORAGE_KEY, id);
      setLeadId(id);
    });
  }, [startSession]);

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

  if (!leadId) {
    return (
      <p className="px-6 py-24 text-center text-body text-neutral-500">
        {t("assess.starting")}
      </p>
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

  // The full result, once contact details are in (TASK-028). This is what the
  // gate unlocks, so it replaces the teaser entirely rather than sitting under
  // it: showing both would leave the candidate scrolling past the summary they
  // just paid for with their details.
  if (session?.status !== "partial" && session) {
    return (
      <FullResult
        responses={session.responses}
        pathway={session.pathway as Parameters<typeof buildTeaserSummary>[1]}
        scores={scores}
      />
    );
  }

  // The gate, once they choose to open it (TASK-025/027).
  if (gateOpen && session?.status === "partial") {
    return (
      <ContactGate
        onSubmit={async (values) => {
          await captureContact({ leadId, ...values });
          setGateOpen(false);
        }}
      />
    );
  }

  // Teaser (TASK-021/022): chart only, no contact ask on this screen.
  return (
    <div className="mx-auto w-full max-w-md px-6 py-10 text-center">
      <h1 className="text-h3">{t("teaser.headline")}</h1>
      <p className="mt-1 text-body text-slate">{t("teaser.selfReported")}</p>
      <div className="mt-4">
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
            <div className="rounded-lg border border-neutral-300 bg-mint-wash px-6 py-6">
              <p className="text-label text-primary-deep">{summary.nextLead}</p>
              <p className="mt-2 text-body text-ink">{summary.next}</p>
            </div>
          )}
          {summary.unmeasured && (
            <p className="text-caption text-neutral-500">{summary.unmeasured}</p>
          )}
        </div>
      )}

      {/* card-bordered: border-only, because it sits on white. The gate is
          reached by choice from here; FR-004 forbids a contact field appearing
          on the teaser itself. */}
      {session?.status === "partial" ? (
        <div className="mt-6 rounded-lg border border-neutral-300 bg-surface px-6 py-6">
          <p className="text-body text-slate">{t("teaser.locked")}</p>
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            className="mt-4 h-12 w-full rounded-md bg-accent px-7 text-label text-on-accent transition-colors hover:bg-accent-bright"
          >
            {t("teaser.unlock")}
          </button>
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-neutral-300 bg-mint-wash px-6 py-6 text-body text-ink">
          {t("teaser.captured")}
        </p>
      )}

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
        className="mt-6 rounded-sm px-2 py-1 text-caption text-slate underline underline-offset-2 transition-colors hover:text-primary"
      >
        {t("teaser.revise")}
      </button>
    </div>
  );
}
