"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PATHWAYS, STAGE1 } from "@/lib/content/questions";
import QuestionCard from "@/components/features/assessment/QuestionCard";
import SpiderChart from "@/components/features/chart/SpiderChart";

/**
 * TASK-018..022: the Stage 1 flow. Pathway first, then the eight readiness
 * questions, then the teaser chart, reactive off `leads.getSession`, with no
 * contact ask anywhere on screen (FR-004). Answers render optimistically from
 * local state; the server recomputes scores on every write.
 *
 * The session id lives in localStorage so a closed tab resumes mid-flow on the
 * same device; cross-device resume is the magic link (Phase 2).
 */

const STORAGE_KEY = "eufit.leadId";
const TOTAL_STEPS = STAGE1.length + 1; // pathway + 8

export default function AssessPage() {
  const [leadId, setLeadId] = useState<Id<"leads"> | null>(null);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [pathway, setPathway] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0 = pathway, 1..8 = questions, 9 = teaser

  const startSession = useMutation(api.leads.startSession);
  const setPathwayMut = useMutation(api.leads.setPathway);
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

  // Resume position from server state on reload.
  useEffect(() => {
    if (!session || step !== 0 || pathway !== null) return;
    if (session.pathway) {
      setPathway(session.pathway);
      const answered = STAGE1.filter((q) => session.responses[q.key] !== undefined).length;
      setLocal(
        Object.fromEntries(
          Object.entries(session.responses).filter(([, v]) => typeof v === "string"),
        ) as Record<string, string>,
      );
      setStep(Math.min(answered + 1, TOTAL_STEPS));
    }
  }, [session, step, pathway]);

  const scores = useMemo(() => session?.scores ?? {}, [session]);

  if (!leadId) {
    return <p className="px-6 py-24 text-center text-sm text-zinc-500">Starting...</p>;
  }

  // Step 0: pathway (TASK-019). Four equally-weighted options, no default.
  if (step === 0) {
    return (
      <QuestionCard
        prompt="Which route to Europe are you exploring?"
        options={PATHWAYS.map((p) => ({ value: p.value, label: p.th || p.en }))}
        selected={pathway ?? undefined}
        step={1}
        total={TOTAL_STEPS}
        onSelect={(value) => {
          setPathway(value);
          void setPathwayMut({
            leadId,
            pathway: value as "job_first" | "study_first" | "family" | "not_sure",
          });
          setStep(1);
        }}
      />
    );
  }

  // Steps 1..8: the readiness questions (TASK-020).
  if (step <= STAGE1.length) {
    const q = STAGE1[step - 1];
    return (
      <QuestionCard
        prompt={q.th || q.en}
        options={q.options.map((o) => ({ value: o.value, label: o.th || o.en }))}
        selected={local[q.key]}
        step={step + 1}
        total={TOTAL_STEPS}
        onSelect={(value) => {
          setLocal((prev) => ({ ...prev, [q.key]: value }));
          void submitAnswer({ leadId, questionKey: q.key, value });
          setStep(step + 1);
        }}
      />
    );
  }

  // Teaser (TASK-021/022): chart only, no contact ask on this screen.
  return (
    <div className="mx-auto w-full max-w-md px-6 py-10 text-center">
      <h1 className="text-xl font-semibold tracking-tight">
        Here's your first read
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Self-reported and preliminary, from your own answers just now.
      </p>
      <div className="mt-4">
        <SpiderChart scores={scores} variant="teaser" />
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Hollow markers mean "not measured yet", never zero.
      </p>
      <p className="mt-6 rounded-lg border border-black/[.1] px-4 py-3 text-sm text-zinc-600 dark:border-white/[.15] dark:text-zinc-400">
        The full picture, with what to do first, unlocks by email in the next
        release (Phase 2).
      </p>
    </div>
  );
}
