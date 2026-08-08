"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { STAGE1 } from "@/lib/content/questions";
import QuestionCard from "@/components/features/assessment/QuestionCard";
import SpiderChart from "@/components/features/chart/SpiderChart";

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

export default function AssessPage() {
  const [leadId, setLeadId] = useState<Id<"leads"> | null>(null);
  const [local, setLocal] = useState<Record<string, Answer>>({});
  const [step, setStep] = useState(0); // 0..8 = questions, 9 = teaser
  // A latch, not render state: it only guards the one-shot resume below.
  const resumed = useRef(false);

  const startSession = useMutation(api.leads.startSession);
  const submitAnswer = useMutation(api.leads.submitAnswer);
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

  if (!leadId) {
    return <p className="px-6 py-24 text-center text-body text-neutral-500">Starting...</p>;
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
        prompt={q.th || q.en}
        options={q.options.map((o) => ({ value: o.value, label: o.th || o.en }))}
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

  // Teaser (TASK-021/022): chart only, no contact ask on this screen.
  return (
    <div className="mx-auto w-full max-w-md px-6 py-10 text-center">
      <h1 className="text-h3">Here&apos;s your first read</h1>
      <p className="mt-1 text-body text-slate">
        Self-reported and preliminary, from your own answers just now.
      </p>
      <div className="mt-4">
        <SpiderChart scores={scores} variant="teaser" />
      </div>
      <p className="mt-2 text-caption text-neutral-500">
        Hollow markers mean &quot;not measured yet&quot;, never zero.
      </p>
      {/* card-bordered: border-only, because it sits on white. */}
      <p className="mt-6 rounded-lg border border-neutral-300 bg-surface px-6 py-6 text-body text-slate">
        The full picture, with what to do first, unlocks by email in the next
        release (Phase 2).
      </p>
      {/* Without this the chart is a dead end, and PRD § 11 allows changing an
          answer after moving forward. Quiet, and below the chart, so it never
          competes with the reveal. */}
      <button
        type="button"
        onClick={() => setStep(STAGE1.length - 1)}
        className="mt-6 rounded-sm px-2 py-1 text-caption text-slate underline underline-offset-2 transition-colors hover:text-primary"
      >
        ย้อนกลับไปแก้คำตอบ
      </button>
    </div>
  );
}
