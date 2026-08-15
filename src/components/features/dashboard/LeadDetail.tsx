"use client";

/**
 * TASK-035, FR-013: one lead in full.
 *
 * English, coach-facing. Every field the app holds, including the raw answers
 * and every consent timestamp.
 *
 * Missing data is shown explicitly as "not provided" rather than omitted. A
 * blank row and an absent row look identical on screen, and the difference
 * between "they declined to give a phone number" and "we never asked" is the
 * whole point of a PDPA audit trail.
 */

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { readAnswers } from "@/lib/content/answers";
import LeadBriefing from "./LeadBriefing";

const stamp = (ms: number | null) =>
  ms === null ? null : new Date(ms).toISOString().replace("T", " ").slice(0, 16);

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lead";

/**
 * Renders the report at click time from the lead's stored answers, and hands it
 * straight to the browser as a download.
 *
 * Nothing is persisted. `renderReport` is a pure function of a scored profile,
 * so the report is derived rather than stored: no HTML per candidate in the
 * database, no stale copy to invalidate when the scoring changes, and a report
 * generated a year from now reflects today's model rather than the one that
 * happened to be running when the candidate answered.
 *
 * The renderer, the scorer and the chart builder are imported dynamically, so
 * none of them are in the admin bundle until the button is actually pressed.
 */
async function downloadReport(lead: {
  fullName: string | null;
  responses: Record<string, unknown>;
  createdAt: number;
}) {
  const [{ renderReport }, { scoreResponse }, { toScoringInputForLead }] = await Promise.all([
    import("@/lib/report"),
    import("@/lib/scoring"),
    import("@/lib/content/mapping"),
  ]);

  // Same vocabulary fix as the briefing. The report is a pure function of the
  // scored profile, so an input read with the wrong mapper produced a document
  // that contradicted the database and read as finished while doing it.
  const input = toScoringInputForLead(lead.responses);
  const html = renderReport(scoreResponse(input), {
    candidate: lead.fullName ?? "Anonymous lead",
    submittedAt: new Date(lead.createdAt).toISOString().slice(0, 10),
    targetCountries: input.targetCountries,
    targetRole: input.targetRole ?? undefined,
  });

  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `eu-fit-check-${slug(lead.fullName ?? "lead")}-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  // Revoked immediately: the download has already been handed to the browser,
  // and holding the object URL would keep the whole report in memory.
  URL.revokeObjectURL(url);
}

/** Hands a generated file to the browser. Nothing is stored server-side. */
function download(contents: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadDetail({ leadId }: { leadId: Id<"leads"> }) {
  const router = useRouter();
  const lead = useQuery(api.leads.getForAdmin, { leadId });
  const deleteLead = useMutation(api.leads.deleteLeadOnRequest);
  const [building, setBuilding] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteNote, setDeleteNote] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (lead === undefined) {
    return <p className="text-body text-neutral-500">Loading...</p>;
  }
  if (lead === null) {
    return <p className="text-body text-error">No lead with that id.</p>;
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <Link href="/admin" className="text-caption text-primary underline">
          Back to all leads
        </Link>
        <h1 className="mt-2 text-h3">{lead.fullName ?? "Anonymous lead"}</h1>
        <p className="mt-1 text-caption text-slate">
          {lead.status} · started {stamp(lead.createdAt)} · last active{" "}
          {stamp(lead.lastActivityAt)}
          {lead.source ? ` · from ${lead.source}` : ""}
        </p>

        <button
          type="button"
          disabled={building || Object.keys(lead.responses).length === 0}
          onClick={async () => {
            setBuilding(true);
            try {
              await downloadReport(lead);
            } finally {
              setBuilding(false);
            }
          }}
          className="mt-4 h-12 rounded-md bg-accent px-7 text-label text-on-accent transition-colors hover:bg-accent-bright disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {building ? "Building..." : "Download report"}
        </button>

        {/* Subject-access request. Two formats: the HTML is what you send the
            person, the JSON is the portable copy if they ask for one. */}
        <button
          type="button"
          onClick={async () => {
            const { renderSubjectExportHtml } = await import("@/lib/subjectExport");
            download(
              renderSubjectExportHtml(lead),
              `punprofile-data-${slug(lead.fullName ?? "record")}.html`,
              "text/html;charset=utf-8",
            );
          }}
          className="ml-3 mt-4 h-12 rounded-md border border-neutral-300 bg-surface px-5 text-label text-slate transition-colors hover:bg-neutral-100"
        >
          Export their data (readable)
        </button>
        <button
          type="button"
          onClick={async () => {
            const { buildSubjectExport } = await import("@/lib/subjectExport");
            download(
              JSON.stringify(buildSubjectExport(lead), null, 2),
              `punprofile-data-${slug(lead.fullName ?? "record")}.json`,
              "application/json",
            );
          }}
          className="ml-3 mt-4 h-12 rounded-md border border-neutral-300 bg-surface px-5 text-label text-slate transition-colors hover:bg-neutral-100"
        >
          Export (JSON)
        </button>
        {Object.keys(lead.responses).length === 0 && (
          <p className="mt-2 text-caption text-neutral-500">
            No answers yet, so there is nothing to report on.
          </p>
        )}
      </div>

      <Section title="Contact and consent">
        {lead.consentSource === "survey_import" && (
          <p className="mb-3 rounded-sm border border-warning bg-cream-wash px-4 py-3 text-caption text-ink">
            Imported from the Lead Discovery Survey. That form asked how best to
            reach them but carried no consent clause, so the timestamps below are
            their submission date, not a per-channel grant. Judge outreach against
            what the form actually said.
          </p>
        )}
        <Row
          label="Email"
          value={lead.email}
          consentAt={lead.emailConsentAt}
          href={lead.email ? `mailto:${lead.email}` : null}
        />
        {/* LINE has no reliable "message this id" URL scheme, so the id is
            offered for copying rather than linked to something that may not
            open. */}
        <Row label="LINE ID" value={lead.lineId} consentAt={lead.lineConsentAt} copyable />
        <Row
          label="Phone"
          value={lead.phone}
          consentAt={lead.phoneConsentAt}
          href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : null}
        />
      </Section>

      {/* Your own triage from the survey sheet, imported 14/08/2026 alongside
          the answers. Rendered here rather than left in the data, because a
          column carried across and never shown is a column that was not really
          imported. Absent on app-native leads, which never had it. */}
      {(typeof lead.responses._entryPoint === "string" ||
        typeof lead.responses._manualCheck === "string") && (
        <Section title="From the survey sheet">
          {/* `showConsent={false}`: these are the coach's own triage columns, not
            channels. Without it `Row` printed "No consent recorded, do not
            contact" under the suggested entry point, which is not a true
            statement about anything. */}
          <Row
            label="Suggested entry point"
            value={String(lead.responses._entryPoint ?? "")}
            consentAt={null}
            showConsent={false}
          />
          {typeof lead.responses._manualCheck === "string" &&
            lead.responses._manualCheck.trim() !== "" && (
              <Row
                label="Flagged for manual check"
                value={String(lead.responses._manualCheck)}
                consentAt={null}
                showConsent={false}
              />
            )}
        </Section>
      )}

      {/* The briefing replaces the bare score list that used to sit here. Four
          numbers told you nothing you could open a conversation with. */}
      <LeadBriefing responses={lead.responses} fullName={lead.fullName} />

      <Section title="Delete on request">
        <p className="text-body text-slate">
          Erases this person entirely: the lead, their answers, and any saved
          links. This cannot be undone and there is no backup to restore from.
          A record that <em>a</em> deletion happened is kept, holding nothing
          about who it was.
        </p>
        <label className="mt-4 block text-label text-slate">
          Your reference for this request
          <input
            value={deleteNote}
            onChange={(e) => setDeleteNote(e.target.value)}
            placeholder="e.g. requested on LINE, 10/08/2026"
            className="mt-1 h-12 w-full rounded-sm border border-neutral-300 bg-surface px-4 text-body text-ink"
          />
          <span className="mt-1 block text-caption font-normal text-neutral-500">
            Do not paste their name or contact details here. This row outlives them.
          </span>
        </label>
        <label className="mt-4 block text-label text-slate">
          Type DELETE to confirm
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 h-12 w-full rounded-sm border border-neutral-300 bg-surface px-4 text-body text-ink"
          />
        </label>
        {deleteError && <p className="mt-3 text-body text-error">{deleteError}</p>}
        <button
          type="button"
          disabled={confirmText !== "DELETE" || deleting}
          onClick={async () => {
            setDeleting(true);
            setDeleteError(null);
            try {
              await deleteLead({ leadId, note: deleteNote.trim() || undefined });
              router.push("/admin");
            } catch (err) {
              setDeleteError(err instanceof Error ? err.message : "Deletion failed.");
              setDeleting(false);
            }
          }}
          className="mt-4 h-12 rounded-md bg-error px-7 text-label text-on-error transition-opacity hover:opacity-90 disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {deleting ? "Deleting..." : "Delete this person permanently"}
        </button>
      </Section>

      <AnswerSheetSection responses={lead.responses} />
    </div>
  );
}

/**
 * Every question this lead was asked, beside the answer they gave.
 *
 * Question and answer sit in two columns on the same row, because the coach's
 * read is "what did they say to this", and a stacked key-then-value list makes
 * that a scan down two alternating lines instead of across one.
 *
 * Unanswered questions are rendered, not omitted, for the reason the contact
 * rows already are: a blank row and an absent row look identical on screen, and
 * "they skipped it" is a different fact from "we never asked".
 *
 * `readAnswers` resolves both vocabularies, so an imported survey lead shows
 * the survey's own Q-numbers and wording from `08_Coaching_Business.md`, and an
 * app lead shows the questionnaire's.
 */
function AnswerSheetSection({ responses }: { responses: Record<string, unknown> }) {
  const sheet = readAnswers(responses);

  if (Object.keys(responses).length === 0) {
    return (
      <Section title="Questions and answers">
        <p className="text-body text-neutral-500">No answers yet.</p>
      </Section>
    );
  }

  // `_entryPoint` and `_manualCheck` already have their own section above, with
  // the framing about what that sheet did and did not ask. Repeating them here
  // would be two copies of one fact on one screen.
  const shown = new Set(["_entryPoint", "_manualCheck"]);
  const columns = sheet.sheetColumns.filter((r) => !shown.has(r.key));

  return (
    <Section title="Questions and answers">
      <p className="mb-3 text-caption text-neutral-500">
        {sheet.answered} of {sheet.rows.length} answered.{" "}
        {sheet.instrument === "survey"
          ? "From the Lead Discovery Survey, imported. Question numbers are that form's."
          : "From the app's questionnaire, in the order it was asked."}
      </p>

      {sheet.rows.map((r) => (
        <QaRow key={r.key} question={r.question} answer={r.answer} />
      ))}

      {columns.length > 0 && (
        <>
          <h3 className="mt-6 text-label text-slate">Carried across from the sheet</h3>
          {columns.map((r) => (
            <QaRow key={r.key} question={r.question} answer={r.answer} />
          ))}
        </>
      )}

      {sheet.extras.length > 0 && (
        <>
          {/* A stored key the instrument does not account for: a leftover from
              an older question set, or a field added since. Shown as its raw
              key, because hiding it would lose it silently. */}
          <h3 className="mt-6 text-label text-slate">Not part of this question set</h3>
          {sheet.extras.map((r) => (
            <QaRow key={r.key} question={r.question} answer={r.answer} />
          ))}
        </>
      )}
    </Section>
  );
}

function QaRow({ question, answer }: { question: string; answer: string | null }) {
  return (
    <div className="grid gap-x-6 border-b border-neutral-300 py-2 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <p className="text-body text-slate">{question}</p>
      {answer === null ? (
        <p className="text-body text-neutral-500">not answered</p>
      ) : (
        <p className="text-body text-ink">{answer}</p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-h4">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  consentAt,
  href,
  copyable,
  showConsent = true,
}: {
  label: string;
  value: string | null;
  consentAt: number | null;
  href?: string | null;
  copyable?: boolean;
  /** False for rows that are not contact channels, so no consent line is drawn. */
  showConsent?: boolean;
}) {
  // Only actionable once consent exists. A channel with no consent timestamp is
  // one you must not use, so it stays plain text rather than a live link that
  // invites a click.
  const actionable = !!value && consentAt !== null;

  return (
    <div className="border-b border-neutral-300 py-2">
      <div className="flex justify-between gap-4">
        <span className="text-body text-slate">{label}</span>
        {value === null ? (
          <span className="text-body text-neutral-500">not provided</span>
        ) : actionable && href ? (
          <a className="text-body text-primary underline" href={href}>
            {value}
          </a>
        ) : actionable && copyable ? (
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(value)}
            title="Copy"
            className="text-body text-primary underline"
          >
            {value}
          </button>
        ) : (
          <span className="text-body text-ink">{value}</span>
        )}
      </div>
      {showConsent && (
        <p className="text-caption text-neutral-500">
          {consentAt
            ? `Consent given ${stamp(consentAt)}`
            : value
              ? "No consent recorded, do not contact"
              : ""}
        </p>
      )}
    </div>
  );
}
