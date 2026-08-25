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
  invited: "Link sent, nothing back yet",
  scheduled: "Scheduled",
  held: "Held",
  no_show: "No-show",
  cancelled: "Cancelled",
  expired: "Never booked, invitation aged out",
};

const TRIGGER_LABEL: Record<string, string> = {
  survey_stage_wave1: "Wave 1, interviewing or negotiating",
  survey_urgent_wave2: "Wave 2, within 3 months and applying or later",
  manual: "Manual, no rule fired",
};

const SENT_CHANNEL_LABEL: Record<string, string> = { line: "LINE", email: "Email" };

/** The bands the ICP lookups read. Free text cannot reach a lookup. */
const EXPERIENCE_LABEL: Record<string, string> = {
  "0-1": "Up to 1 year",
  "2-10": "2 to 10 years",
  "11-15": "11 to 15 years",
  "16+": "16 years or more",
};

const INVESTMENT_LABEL: Record<string, string> = {
  none: "Never paid for a course, certification or coaching",
  unrelated: "Has paid for something, relevance not established",
  relevant: "Has paid for something relevant to the target field",
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
  trigger: string;
  sentAt: string;
  sentChannel: string;
  bookedAt: string;
  reminderSent: boolean;
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
    trigger: "",
    sentAt: "",
    sentChannel: "",
    bookedAt: "",
    reminderSent: false,
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
    trigger: call.trigger ?? "",
    sentAt: call.sentAt ? toLocalInput(call.sentAt) : "",
    sentChannel: call.sentChannel ?? "",
    bookedAt: call.bookedAt ? toLocalInput(call.bookedAt) : "",
    reminderSent: call.reminderSentAt !== undefined,
  };
}

/**
 * A blank field is sent as `undefined`, not as an empty string, so the stored
 * field is removed rather than set to "". `update` writes every field on every
 * save for exactly this reason: emptying a box has to be able to mean emptying
 * the record.
 */
const text = (s: string): string | undefined => s.trim() || undefined;

/** A `datetime-local` value back to epoch ms, or undefined when left blank. */
const when = (s: string): number | undefined => {
  if (!s) return undefined;
  const ms = new Date(s).getTime();
  return Number.isFinite(ms) ? ms : undefined;
};

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
      const existingReminder = editing
        ? calls?.find((c) => c._id === editing)?.reminderSentAt
        : undefined;
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
        // Cast, not parsed: both are `<select>` values drawn from the same
        // label maps the schema's unions are built from, so the only strings
        // reachable here are the legal ones. The server revalidates anyway.
        icpExperienceYears: (draft.icpExperienceYears || undefined) as Call["icpExperienceYears"],
        icpPriorInvestment: (draft.icpPriorInvestment || undefined) as Call["icpPriorInvestment"],
        // Carried, not recomputed. Re-saving the row must not move the time
        // the follow-up actually went out.
        followUpSentAt: draft.followUpSentAt ?? undefined,
        notes: text(draft.notes),
        trigger: (draft.trigger || undefined) as Call["trigger"],
        sentAt: when(draft.sentAt),
        sentChannel: (draft.sentChannel || undefined) as Call["sentChannel"],
        bookedAt: when(draft.bookedAt),
        // Stamped when ticked. The exact minute a manual reminder went out is
        // not worth typing; whether it went out at all is the whole point.
        reminderSentAt: draft.reminderSent ? (existingReminder ?? Date.now()) : undefined,
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
      <h2 className="text-title-large">Calls and sessions</h2>

      {calls === undefined ? (
        <p className="mt-3 text-body-large text-on-surface-variant">Loading...</p>
      ) : calls.length === 0 ? (
        <p className="mt-3 text-body-large text-on-surface-variant">
          Nothing logged yet. The funnel has no record of its own last step until there is.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {calls.map((c) => (
            <li key={c._id} className="rounded-medium border border-outline-variant px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-label-large text-on-surface">
                  {TYPE_LABEL[c.type]} · {OUTCOME_LABEL[c.outcome]}
                </span>
                <span className="text-body-medium text-on-surface-variant">
                  {stamp(c.heldAt)}
                  {c.durationMinutes ? ` · ${c.durationMinutes} min` : ""}
                  {c.channel ? ` · ${CHANNEL_LABEL[c.channel]}` : ""}
                </span>
              </div>

              {c.language && (
                <p className="mt-1 text-body-medium text-on-surface-variant">
                  {LANGUAGE_LABEL[c.language]}
                  {c.language === "thai" &&
                    ". Business English was not tested, so it stays unscored."}
                </p>
              )}

              <Detail label="Their question" value={c.theirQuestion} />
              <Detail label="One action given" value={c.nextStep} />
              {c.nextStep && c.nextStepMatchesApp === false && (
                <p className="mt-1 text-body-medium text-error">
                  Differs from the app&apos;s own pick. That disagreement is a bug to chase,
                  not a second opinion to give out.
                </p>
              )}
              <Detail label="Strengths named" value={c.strengthsNamed} />
              <Detail label="Salary, with role and country" value={c.salaryQuote} />
              <Detail label="Would buy" value={c.moduleFit} />
              <Detail label="Job title" value={c.icpJobTitle} />
              <Detail
                label="Years of experience"
                value={c.icpExperienceYears && EXPERIENCE_LABEL[c.icpExperienceYears]}
              />
              <Detail
                label="Prior paid learning"
                value={c.icpPriorInvestment && INVESTMENT_LABEL[c.icpPriorInvestment]}
              />
              <Detail label="Notes" value={c.notes} />

              {(c.trigger || c.sentAt || c.bookedAt) && (
                <p className="mt-2 text-body-medium text-on-surface-variant">
                  {c.trigger ? TRIGGER_LABEL[c.trigger] : "Trigger not recorded"}
                  {c.sentAt
                    ? ` · sent ${stamp(c.sentAt)}${c.sentChannel ? ` on ${SENT_CHANNEL_LABEL[c.sentChannel]}` : ""}`
                    : ""}
                  {c.bookedAt ? ` · booked ${stamp(c.bookedAt)}` : ""}
                  {c.reminderSentAt ? " · reminder sent" : ""}
                </p>
              )}

              <p className="mt-2 text-body-medium text-on-surface-variant">
                {c.outcome === "held" &&
                  (c.followUpSentAt
                    ? `Follow-up sent ${stamp(c.followUpSentAt)}. `
                    : "Follow-up not sent. It is same-day and manual. ")}
                {c.outcome === "scheduled" && !c.reminderSentAt
                  ? "Day-before reminder not sent yet. "
                  : ""}
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
                  className="text-body-medium text-on-primary underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void removeCall({ consultationId: c._id })}
                  className="text-body-medium text-on-surface-variant underline"
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
          className="btn-tonal mt-4 h-12 px-7 text-label-large"
        >
          Log a call
        </button>
      ) : (
        <div className="mt-4 rounded-large border border-outline-variant bg-surface p-5">
          <h3 className="text-label-large text-on-surface">{editing ? "Edit this call" : "Log a call"}</h3>
          <p className="mt-1 text-body-medium text-on-surface-variant">
            Only the first three are needed to save. The rest is the write-up and can wait.
          </p>

          <div className="mt-4 grid gap-4 medium:grid-cols-2">
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
              <h4 className="mt-6 text-label-large text-on-surface-variant">What the call surfaced</h4>
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

              <h4 className="mt-6 text-label-large text-on-surface-variant">
                The three the app never asks for
              </h4>
              <p className="mt-1 text-body-medium text-on-surface-variant">
                In Scope, Offering Match and Investment Readiness. An app-native lead arrives
                ungraded because Stage 1 collects none of them, so this is where they first
                exist.
              </p>
              <div className="mt-3 grid gap-4 medium:grid-cols-3 medium:items-start">
                <Field label="Current job title">
                  <input
                    value={draft.icpJobTitle}
                    onChange={(e) => set("icpJobTitle", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Select
                  label="Years of experience"
                  value={draft.icpExperienceYears}
                  onChange={(x) => set("icpExperienceYears", x)}
                  options={Object.entries(EXPERIENCE_LABEL)}
                  allowEmpty
                />
                <Select
                  label="Paid for learning before"
                  value={draft.icpPriorInvestment}
                  onChange={(x) => set("icpPriorInvestment", x)}
                  options={Object.entries(INVESTMENT_LABEL)}
                  allowEmpty
                />
              </div>

              <h4 className="mt-6 text-label-large text-on-surface-variant">What was agreed</h4>
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

          <h4 className="mt-6 text-label-large text-on-surface-variant">The invitation</h4>
          <p className="mt-1 text-body-medium text-on-surface-variant">
            Typed in by hand, because the free Calendly tier has no webhooks and pushes
            nothing. What it buys is the only measurement of whether the booking rule is
            any good: the trigger records which rule fired, so changing the rule later
            does not rewrite what the old one produced.
          </p>
          <div className="mt-3 grid gap-4 medium:grid-cols-2 medium:items-start">
            <Select
              label="What fired the send"
              value={draft.trigger}
              onChange={(x) => set("trigger", x)}
              options={Object.entries(TRIGGER_LABEL)}
              allowEmpty
            />
            <Select
              label="Sent on"
              value={draft.sentChannel}
              onChange={(x) => set("sentChannel", x)}
              options={Object.entries(SENT_CHANNEL_LABEL)}
              allowEmpty
            />
            <Field label="Link sent at">
              <input
                type="datetime-local"
                value={draft.sentAt}
                onChange={(e) => set("sentAt", e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field
              label="They booked at"
              hint="The gap from sent to booked is the only read on whether the message worked."
            >
              <input
                type="datetime-local"
                value={draft.bookedAt}
                onChange={(e) => set("bookedAt", e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Check
              label="Day-before reminder sent"
              hint="Manual. The free tier sends none, and this is the step that breaks first."
              checked={draft.reminderSent}
              onChange={(x) => set("reminderSent", x)}
            />
          </div>

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

          {error && <p role="alert" className="field-support-error mt-3">{error}</p>}

          <div className="mt-5 flex items-center gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="btn-tonal h-12 px-7 text-label-large"
            >
              {saving ? "Saving..." : editing ? "Save changes" : "Save this call"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setEditing(null);
              }}
              className="text-label-large text-on-surface-variant underline"
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
  "field mt-1";

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
    <label className="field-label">
      {label}
      {children}
      {hint && <span className="field-support font-normal">{hint}</span>}
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
    <label className="flex gap-3 text-label-large text-on-surface-variant">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox mt-1"
      />
      <span>
        {label}
        {hint && <span className="field-support font-normal">{hint}</span>}
      </span>
    </label>
  );
}

/** One written-up field. Absent rather than blank when it was never filled in. */
function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="mt-2 text-body-large text-on-surface">
      <span className="text-body-medium text-on-surface-variant">{label}: </span>
      {value}
    </p>
  );
}
