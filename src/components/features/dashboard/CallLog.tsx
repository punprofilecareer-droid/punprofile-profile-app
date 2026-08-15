"use client";

/**
 * The call log for one candidate: every consultation, and the form to add one.
 *
 * Coach-facing, English, and the fields are not arbitrary. They come from the
 * `kick-start` skill's run sheet and observation set, which is the document
 * that says what actually happens in the thirty minutes, plus the
 * `booking-tracking.md` spec. Four of them are load-bearing rather than
 * bookkeeping and carry a line saying why, because a field whose purpose is
 * invisible gets filled in carelessly or not at all:
 *
 * - **Language** decides whether Business English may ever be promoted. Its
 *   ECRA lookup is a self-report "verified where tested", and a call held in
 *   Thai did not test it.
 * - **The one action** must be the same pick the app makes. Where it differs,
 *   the difference is a bug to log rather than a second opinion to hand out.
 * - **The salary figure** is worthless without the role and country it was
 *   quoted against, because the benchmark is per role and per country.
 * - **The three ICP inputs** are the only place those answers exist for an
 *   app-native lead, which arrives ungraded because Stage 1 asks for none of
 *   them.
 *
 * Nothing here writes a score. What a call observed is evidence and belongs in
 * an `assessments` row with `source: "coach"`; what a call was belongs here.
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

type Call = Doc<"consultations">;

const TYPE_LABEL: Record<Call["type"], string> = {
  kick_start: "Kick-start, free 30 min",
  engagement: "Engagement session",
  follow_up: "Follow-up",
  other: "Other",
};

const OUTCOME_LABEL: Record<Call["outcome"], string> = {
  scheduled: "Scheduled",
  held: "Held",
  no_show: "No-show",
  cancelled: "Cancelled",
};

const CHANNEL_LABEL: Record<string, string> = {
  line: "LINE",
  meet: "Google Meet",
  phone: "Phone",
  other: "Other",
};

const LANGUAGE_LABEL: Record<string, string> = {
  thai: "Thai throughout",
  english: "English throughout",
  mixed: "Mixed, English for the middle blocks",
};

/** Epoch ms to the value a `datetime-local` input wants, in local time. */
function toLocalInput(ms: number): string {
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

/**
 * Local time, DD/MM/YYYY, per the house date rule.
 *
 * Not the ISO stamp the rest of this screen uses for system timestamps. A call
 * time is typed by the coach, and rendering it back in UTC showed 08:03 for a
 * call entered as 10:03, which reads as the form having lost the answer.
 */
const stamp = (ms: number) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Draft {
  type: Call["type"];
  outcome: Call["outcome"];
  heldAt: string;
  durationMinutes: string;
  channel: string;
  language: string;
  theirQuestion: string;
  strengthsNamed: string;
  nextStep: string;
  nextStepMatchesApp: boolean;
  salaryQuote: string;
  moduleFit: string;
  icpJobTitle: string;
  icpExperienceYears: string;
  icpPriorInvestment: string;
  /**
   * The stored moment, carried rather than recomputed. Ticking the box stamps
   * now; saving an edit must not move a time that already happened.
   */
  followUpSentAt: number | null;
  notes: string;
}

function emptyDraft(): Draft {
  return {
    type: "kick_start",
    outcome: "held",
    heldAt: toLocalInput(Date.now()),
    durationMinutes: "",
    channel: "",
    language: "",
    theirQuestion: "",
    strengthsNamed: "",
    nextStep: "",
    nextStepMatchesApp: true,
    salaryQuote: "",
    moduleFit: "",
    icpJobTitle: "",
    icpExperienceYears: "",
    icpPriorInvestment: "",
    followUpSentAt: null,
    notes: "",
  };
}

function draftFrom(call: Call): Draft {
  return {
    type: call.type,
    outcome: call.outcome,
    heldAt: toLocalInput(call.heldAt),
    durationMinutes: call.durationMinutes?.toString() ?? "",
    channel: call.channel ?? "",
    language: call.language ?? "",
    theirQuestion: call.theirQuestion ?? "",
    strengthsNamed: call.strengthsNamed ?? "",
    nextStep: call.nextStep ?? "",
    nextStepMatchesApp: call.nextStepMatchesApp ?? true,
    salaryQuote: call.salaryQuote ?? "",
    moduleFit: call.moduleFit ?? "",
    icpJobTitle: call.icpJobTitle ?? "",
    icpExperienceYears: call.icpExperienceYears ?? "",
    icpPriorInvestment: call.icpPriorInvestment ?? "",
    followUpSentAt: call.followUpSentAt ?? null,
    notes: call.notes ?? "",
  };
}

/**
 * A blank field is sent as `undefined`, not as an empty string, so the stored
 * field is removed rather than set to "". `update` writes every field on every
 * save for exactly this reason: emptying a box has to be able to mean emptying
 * the record.
 */
const text = (s: string): string | undefined => s.trim() || undefined;

export default function CallLog({ leadId }: { leadId: Id<"leads"> }) {
  const calls = useQuery(api.consultations.listForLead, { leadId });
  const logCall = useMutation(api.consultations.log);
  const updateCall = useMutation(api.consultations.update);
  const removeCall = useMutation(api.consultations.remove);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Id<"consultations"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const duration = Number.parseInt(draft.durationMinutes, 10);
      const fields = {
        type: draft.type,
        outcome: draft.outcome,
        heldAt: new Date(draft.heldAt).getTime(),
        durationMinutes: Number.isFinite(duration) ? duration : undefined,
        channel: (draft.channel || undefined) as Call["channel"],
        language: (draft.language || undefined) as Call["language"],
        theirQuestion: text(draft.theirQuestion),
        strengthsNamed: text(draft.strengthsNamed),
        nextStep: text(draft.nextStep),
        nextStepMatchesApp: draft.nextStepMatchesApp,
        salaryQuote: text(draft.salaryQuote),
        moduleFit: text(draft.moduleFit),
        icpJobTitle: text(draft.icpJobTitle),
        icpExperienceYears: text(draft.icpExperienceYears),
        icpPriorInvestment: text(draft.icpPriorInvestment),
        // Carried, not recomputed. Re-saving the row must not move the time
        // the follow-up actually went out.
        followUpSentAt: draft.followUpSentAt ?? undefined,
        notes: text(draft.notes),
      };
      if (editing) {
        await updateCall({ consultationId: editing, ...fields });
      } else {
        await logCall({ leadId, ...fields });
      }
      setDraft(null);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="text-h4">Calls and sessions</h2>

      {calls === undefined ? (
        <p className="mt-3 text-body text-neutral-500">Loading...</p>
      ) : calls.length === 0 ? (
        <p className="mt-3 text-body text-neutral-500">
          Nothing logged yet. The funnel has no record of its own last step until there is.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {calls.map((c) => (
            <li key={c._id} className="rounded-md border border-neutral-300 px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-label text-ink">
                  {TYPE_LABEL[c.type]} · {OUTCOME_LABEL[c.outcome]}
                </span>
                <span className="text-caption text-neutral-500">
                  {stamp(c.heldAt)}
                  {c.durationMinutes ? ` · ${c.durationMinutes} min` : ""}
                  {c.channel ? ` · ${CHANNEL_LABEL[c.channel]}` : ""}
                </span>
              </div>

              {c.language && (
                <p className="mt-1 text-caption text-neutral-500">
                  {LANGUAGE_LABEL[c.language]}
                  {c.language === "thai" &&
                    ". Business English was not tested, so it stays unscored."}
                </p>
              )}

              <Detail label="Their question" value={c.theirQuestion} />
              <Detail label="One action given" value={c.nextStep} />
              {c.nextStep && c.nextStepMatchesApp === false && (
                <p className="mt-1 text-caption text-error">
                  Differs from the app&apos;s own pick. That disagreement is a bug to chase,
                  not a second opinion to give out.
                </p>
              )}
              <Detail label="Strengths named" value={c.strengthsNamed} />
              <Detail label="Salary, with role and country" value={c.salaryQuote} />
              <Detail label="Would buy" value={c.moduleFit} />
              <Detail label="Job title" value={c.icpJobTitle} />
              <Detail label="Years of experience" value={c.icpExperienceYears} />
              <Detail label="Prior paid learning" value={c.icpPriorInvestment} />
              <Detail label="Notes" value={c.notes} />

              <p className="mt-2 text-caption text-neutral-500">
                {c.outcome === "held" &&
                  (c.followUpSentAt
                    ? `Follow-up sent ${stamp(c.followUpSentAt)}. `
                    : "Follow-up not sent. It is same-day and manual. ")}
                Logged by {c.createdBy}
              </p>

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(draftFrom(c));
                    setEditing(c._id);
                    setError(null);
                  }}
                  className="text-caption text-primary underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void removeCall({ consultationId: c._id })}
                  className="text-caption text-neutral-500 underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft === null ? (
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft());
            setEditing(null);
            setError(null);
          }}
          className="mt-4 h-12 rounded-md bg-primary px-7 text-label text-on-primary transition-colors hover:bg-primary-deep"
        >
          Log a call
        </button>
      ) : (
        <div className="mt-4 rounded-lg border border-neutral-300 bg-surface p-5">
          <h3 className="text-label text-ink">{editing ? "Edit this call" : "Log a call"}</h3>
          <p className="mt-1 text-caption text-neutral-500">
            Only the first three are needed to save. The rest is the write-up and can wait.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              value={draft.type}
              onChange={(x) => set("type", x as Call["type"])}
              options={Object.entries(TYPE_LABEL)}
            />
            <Select
              label="Outcome"
              value={draft.outcome}
              onChange={(x) => set("outcome", x as Call["outcome"])}
              options={Object.entries(OUTCOME_LABEL)}
            />
            <Field label="Date and time">
              <input
                type="datetime-local"
                value={draft.heldAt}
                onChange={(e) => set("heldAt", e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Duration, minutes">
              <input
                type="number"
                min={0}
                value={draft.durationMinutes}
                onChange={(e) => set("durationMinutes", e.target.value)}
                className={INPUT}
              />
            </Field>
            <Select
              label="Channel"
              value={draft.channel}
              onChange={(x) => set("channel", x)}
              options={Object.entries(CHANNEL_LABEL)}
              allowEmpty
            />
            <Select
              label="Language it ran in"
              hint="Business English is only scoreable if the call actually tested it."
              value={draft.language}
              onChange={(x) => set("language", x)}
              options={Object.entries(LANGUAGE_LABEL)}
              allowEmpty
            />
          </div>

          {draft.outcome === "held" && (
            <>
              <h4 className="mt-6 text-label text-slate">What the call surfaced</h4>
              <div className="mt-3 space-y-4">
                <Field
                  label="Their question, in their words"
                  hint="Asked first, answered last. It is what the final five minutes owe them."
                >
                  <textarea
                    rows={2}
                    value={draft.theirQuestion}
                    onChange={(e) => set("theirQuestion", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Two strengths named, from their own document">
                  <textarea
                    rows={2}
                    value={draft.strengthsNamed}
                    onChange={(e) => set("strengthsNamed", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field
                  label="Salary they are aiming for"
                  hint="With the role and the country attached. A figure alone cannot be benchmarked."
                >
                  <input
                    value={draft.salaryQuote}
                    onChange={(e) => set("salaryQuote", e.target.value)}
                    placeholder="e.g. 3,500 EUR a month, operations coordinator, Netherlands"
                    className={INPUT}
                  />
                </Field>
                <Field
                  label="Which module they would buy"
                  hint="A conclusion for this file. Never a sentence said in the call."
                >
                  <input
                    value={draft.moduleFit}
                    onChange={(e) => set("moduleFit", e.target.value)}
                    className={INPUT}
                  />
                </Field>
              </div>

              <h4 className="mt-6 text-label text-slate">
                The three the app never asks for
              </h4>
              <p className="mt-1 text-caption text-neutral-500">
                In Scope, Offering Match and Investment Readiness. An app-native lead arrives
                ungraded because Stage 1 collects none of them, so this is where they first
                exist.
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <Field label="Current job title">
                  <input
                    value={draft.icpJobTitle}
                    onChange={(e) => set("icpJobTitle", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Years of experience">
                  <input
                    value={draft.icpExperienceYears}
                    onChange={(e) => set("icpExperienceYears", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label="Paid for learning before">
                  <input
                    value={draft.icpPriorInvestment}
                    onChange={(e) => set("icpPriorInvestment", e.target.value)}
                    className={INPUT}
                  />
                </Field>
              </div>

              <h4 className="mt-6 text-label text-slate">What was agreed</h4>
              <div className="mt-3 space-y-4">
                <Field
                  label="The one action for this week"
                  hint="One item, never a list. The method forbids handing over a five-item plan."
                >
                  <textarea
                    rows={2}
                    value={draft.nextStep}
                    onChange={(e) => set("nextStep", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Check
                  label="This is the same action the app picks"
                  hint="Untick if it differs. A disagreement is a bug to chase, not a second opinion."
                  checked={draft.nextStepMatchesApp}
                  onChange={(x) => set("nextStepMatchesApp", x)}
                />
                <Check
                  label="Same-day Thai follow-up sent"
                  hint="Manual, because the free Calendly tier sends nothing."
                  checked={draft.followUpSentAt !== null}
                  onChange={(x) => set("followUpSentAt", x ? (draft.followUpSentAt ?? Date.now()) : null)}
                />
              </div>
            </>
          )}

          <div className="mt-6">
            <Field label="Notes">
              <textarea
                rows={4}
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>

          {error && <p className="mt-3 text-body text-error">{error}</p>}

          <div className="mt-5 flex items-center gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="h-12 rounded-md bg-primary px-7 text-label text-on-primary transition-colors hover:bg-primary-deep disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              {saving ? "Saving..." : editing ? "Save changes" : "Save this call"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setEditing(null);
              }}
              className="text-label text-slate underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const INPUT =
  "mt-1 w-full rounded-sm border border-neutral-300 bg-surface px-4 py-3 text-body text-ink";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-label text-slate">
      {label}
      {children}
      {hint && <span className="mt-1 block text-caption font-normal text-neutral-500">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  hint,
  value,
  onChange,
  options,
  allowEmpty,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  allowEmpty?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT}>
        {allowEmpty && <option value="">Not recorded</option>}
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Check({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex gap-3 text-label text-slate">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-primary"
      />
      <span>
        {label}
        {hint && <span className="mt-1 block text-caption font-normal text-neutral-500">{hint}</span>}
      </span>
    </label>
  );
}

/** One written-up field. Absent rather than blank when it was never filled in. */
function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="mt-2 text-body text-ink">
      <span className="text-caption text-neutral-500">{label}: </span>
      {value}
    </p>
  );
}
