"use client";

/**
 * Every question this lead was asked, the answer they gave, and what the coach
 * recorded instead where the two differ.
 *
 * Question and answer sit in two columns on the same row, because the coach's
 * read is "what did they say to this", and a stacked key-then-value list makes
 * that a scan down two alternating lines instead of across one.
 *
 * Unanswered questions are rendered, not omitted, for the reason the contact
 * rows already are: a blank row and an absent row look identical on screen, and
 * "they skipped it" is a different fact from "we never asked".
 *
 * **A correction never hides the original.** The candidate's own answer stays on
 * screen with the coach's value beside it, the reason underneath, and the date
 * and author attached. The whole point of the layer is that someone reading
 * this in three months can tell which of the two came from the person and which
 * came from us.
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { readAnswers } from "@/lib/content/answers";
import type { AnswerRow } from "@/lib/content/answers";
import type { CorrectedRecord, FieldCorrection } from "@/lib/corrections";

const stamp = (ms: number) => new Date(ms).toLocaleDateString("en-GB");

export default function AnswerSheet({
  leadId,
  responses,
  corrected,
}: {
  leadId: Id<"leads">;
  /** The candidate's own answers, uncorrected. */
  responses: Record<string, unknown>;
  corrected: CorrectedRecord;
}) {
  // Read from the candidate's own record, so every row shows the question and
  // the answer THEY gave. The correction is rendered beside it, never in place
  // of it.
  const sheet = readAnswers(responses);
  const [editing, setEditing] = useState<string | null>(null);

  if (Object.keys(responses).length === 0 && corrected.byKey.size === 0) {
    return (
      <Section title="Questions and answers">
        <p className="text-body-large text-on-surface-variant">No answers yet.</p>
      </Section>
    );
  }

  const shown = new Set(["_entryPoint", "_manualCheck"]);
  const columns = sheet.sheetColumns.filter((r) => !shown.has(r.key));

  return (
    <Section title="Questions and answers">
      <p className="mb-3 text-body-medium text-on-surface-variant">
        {sheet.answered} of {sheet.rows.length} answered.{" "}
        {sheet.instrument === "survey"
          ? "From the Lead Discovery Survey, imported. Question numbers are that form's."
          : "From the app's questionnaire, in the order it was asked."}
        {corrected.byKey.size > 0 && (
          <>
            {" "}
            <span className="text-on-primary-container">
              {corrected.changed.length} corrected, {corrected.filled.length} filled in by you.
            </span>
          </>
        )}
      </p>

      {sheet.rows.map((r) => (
        <QaRow
          key={r.key}
          leadId={leadId}
          row={r}
          correction={corrected.byKey.get(r.key)}
          open={editing === r.key}
          onOpen={() => setEditing(editing === r.key ? null : r.key)}
          onDone={() => setEditing(null)}
        />
      ))}

      {columns.length > 0 && (
        <>
          <h3 className="mt-6 text-label-large text-on-surface-variant">Carried across from the sheet</h3>
          {columns.map((r) => (
            <QaRow key={r.key} leadId={leadId} row={r} />
          ))}
        </>
      )}

      {sheet.extras.length > 0 && (
        <>
          {/* A stored key the instrument does not account for: a leftover from
              an older question set, or a field added since. Shown as its raw
              key, because hiding it would lose it silently. */}
          <h3 className="mt-6 text-label-large text-on-surface-variant">Not part of this question set</h3>
          {sheet.extras.map((r) => (
            <QaRow key={r.key} leadId={leadId} row={r} />
          ))}
        </>
      )}
    </Section>
  );
}

function QaRow({
  leadId,
  row,
  correction,
  open,
  onOpen,
  onDone,
}: {
  leadId: Id<"leads">;
  row: AnswerRow;
  correction?: FieldCorrection;
  open?: boolean;
  onOpen?: () => void;
  onDone?: () => void;
}) {
  const undo = useMutation(api.corrections.undo);
  const label = (v: unknown) =>
    row.options?.find((o) => o.value === String(v))?.label ?? String(v);

  const correctedText = correction
    ? Array.isArray(correction.value)
      ? correction.value.map(label).join(", ")
      : label(correction.value)
    : null;

  return (
    <div className="border-b border-outline-variant py-2">
      <div className="grid gap-x-6 medium:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <p className="text-body-large text-on-surface-variant">{row.question}</p>
        <div>
          {/* The candidate's own answer, struck through only when a correction
              replaced it. A field they never answered has nothing to strike. */}
          {row.answer === null ? (
            <p className="text-body-large text-on-surface-variant">not answered</p>
          ) : (
            <p className={`text-body-large ${correctedText ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
              {row.answer}
            </p>
          )}

          {correctedText && (
            <p className="text-body-large text-on-surface">
              {correctedText}
              <span className="ml-2 rounded-full bg-secondary-container px-2 py-0.5 text-body-medium text-on-primary-container">
                yours
              </span>
            </p>
          )}

          {correction && (
            <p className="mt-1 text-body-medium text-on-surface-variant">
              {correction.note}
              {correction.by ? ` — ${correction.by}` : ""}, {stamp(correction.at)}{" "}
              <button
                type="button"
                onClick={() => void undo({ correctionId: correction.correctionId as Id<"assessments"> })}
                className="underline"
              >
                undo
              </button>
            </p>
          )}

          {row.options && onOpen && (
            <button type="button" onClick={onOpen} className="mt-1 text-body-medium text-on-primary underline">
              {open ? "Cancel" : correction ? "Correct again" : row.answer === null ? "Fill in" : "Correct"}
            </button>
          )}
        </div>
      </div>

      {open && row.options && onDone && (
        <CorrectionForm leadId={leadId} row={row} onDone={onDone} />
      )}
    </div>
  );
}

function CorrectionForm({
  leadId,
  row,
  onDone,
}: {
  leadId: Id<"leads">;
  row: AnswerRow;
  onDone: () => void;
}) {
  const correct = useMutation(api.corrections.correct);
  const [value, setValue] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = row.options ?? [];

  return (
    <div className="mt-3 rounded-medium border border-outline-variant bg-secondary-container p-4">
      <label className="field-label">
        {row.multi ? "What is true, all that apply" : "What is actually true"}
        <select
          multiple={row.multi}
          value={row.multi ? value : (value[0] ?? "")}
          onChange={(e) =>
            setValue(
              row.multi
                ? Array.from(e.target.selectedOptions, (o) => o.value)
                : [e.target.value],
            )
          }
          size={row.multi ? Math.min(options.length, 6) : undefined}
          className="field mt-1"
        >
          {!row.multi && <option value="">Choose</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label mt-3">
        Why
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. said B2 on the form, could not sustain it on the call"
          className="field mt-1"
        />
        <span className="mt-1 block text-body-medium font-normal text-on-surface-variant">
          Required. A corrected value with no reason is a second opinion with better
          formatting, and this record outlives the memory of the call.
        </span>
      </label>

      {error && <p role="alert" className="field-support-error mt-2">{error}</p>}

      <button
        type="button"
        disabled={saving || value.length === 0 || !reason.trim()}
        onClick={async () => {
          setSaving(true);
          setError(null);
          try {
            await correct({
              leadId,
              questionKey: row.key,
              value: row.multi ? value : value[0],
              reason: reason.trim(),
            });
            onDone();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save.");
            setSaving(false);
          }
        }}
        className="btn-tonal mt-4 h-12 px-6 text-label-large"
      >
        {saving ? "Saving..." : "Record this"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-title-large">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
