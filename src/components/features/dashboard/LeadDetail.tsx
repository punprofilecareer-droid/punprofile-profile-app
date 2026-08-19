"use client";

/**
 * TASK-035, FR-013: one lead in full.
 *
 * English, coach-facing. Every field the app holds, including the raw answers,
 * the full consent history, and everything past the consultation.
 *
 * Missing data is shown explicitly as "not provided" rather than omitted. A
 * blank row and an absent row look identical on screen, and the difference
 * between "they declined to give a phone number" and "we never asked" is the
 * whole point of a PDPA audit trail. The same principle now runs through the
 * consent panel, where `never_asked` is drawn differently from `opted_out`.
 *
 * **Rebuilt 15/08/2026** for the lifecycle data model. What changed and why:
 *
 * - Consent left this file. It was three timestamps that could not express a
 *   purpose or a withdrawal, so a founder-backfilled email consent was
 *   indistinguishable on screen from a candidate ticking a box.
 * - Contact rows are actionable on resolved consent rather than on a
 *   timestamp, so a withdrawn channel stops being a live link.
 * - The header leads with the derived lifecycle state. `status` stays beside
 *   it because it answers a different question, how far through the assessment
 *   they got, and the two were being read as one thing.
 * - Engagement, delivery and outcome panels exist and are empty for everyone
 *   today. Their empty states say why, because a panel that reads as broken
 *   gets ignored.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { latestCoachIcp } from "@/lib/leadGrade";
import { applyCorrections } from "@/lib/corrections";
import LeadBriefing from "./LeadBriefing";
import CallLog from "./CallLog";
import AnswerSheet from "./AnswerSheet";
import CoachPanel from "./CoachPanel";
import ConsentPanel from "./ConsentPanel";
import EngagementPanel from "./EngagementPanel";
import OutcomePanel from "./OutcomePanel";
import { stateFor, meetsBookingGate, LIFECYCLE_LABELS } from "@/lib/lifecycle";
import { CONSENT_CHANNELS, CONSENT_PURPOSES } from "@/lib/consent";

const stamp = (ms: number | null) =>
  ms === null ? null : new Date(ms).toISOString().replace("T", " ").slice(0, 16);

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lead";

/**
 * Renders a report at click time from the lead's stored answers, opens it in a
 * tab, and lets it print itself to PDF.
 *
 * Nothing is persisted. `renderReport` is a pure function of a scored profile,
 * so the report is derived rather than stored: no HTML per candidate in the
 * database, no stale copy to invalidate when the scoring changes, and a report
 * generated a year from now reflects today's model rather than the one that
 * happened to be running when the candidate answered.
 *
 * The renderer, the scorer and the chart builder are imported dynamically, so
 * none of them are in the admin bundle until the button is actually pressed.
 *
 * **The tab is opened before the imports are awaited, and that ordering is the
 * whole reason this is not three lines shorter.** A `window.open` that happens
 * after an `await` is not attributable to the click that started it, and every
 * browser blocks it as a popup. So the tab opens empty and synchronously, and
 * the document is written into it once the renderer has loaded.
 *
 * Was a `.html` download until 17/08/2026. The candidate variant exists to be
 * sent to the candidate, and an HTML attachment is a file most of this audience
 * cannot open on the phone they read mail on.
 */
async function openReport(
  lead: { fullName: string | null; responses: Record<string, unknown>; createdAt: number },
  variant: "full" | "limited",
) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("The report opens in a new tab. Allow popups for this site and press the button again.");
    return;
  }
  // Something has to be on screen while the chunks load, or a slow connection
  // shows a blank tab that reads as a broken button.
  win.document.write("<!doctype html><title>Building…</title><p>Building the report…");

  const [{ renderReport }, { scoreResponse }, { toScoringInputForLead }] = await Promise.all([
    import("@/lib/report"),
    import("@/lib/scoring"),
    import("@/lib/content/mapping"),
  ]);

  // Same vocabulary fix as the briefing. The report is a pure function of the
  // scored profile, so an input read with the wrong mapper produced a document
  // that contradicted the database and read as finished while doing it.
  const input = toScoringInputForLead(lead.responses);
  const html = renderReport(
    scoreResponse(input),
    {
      candidate: lead.fullName ?? "Anonymous lead",
      submittedAt: new Date(lead.createdAt).toISOString().slice(0, 10),
      targetCountries: input.targetCountries,
      targetRole: input.targetRole ?? undefined,
    },
    // English, decided 17/08/2026 (Paul), and NOT because the Thai is missing:
    // every string in this document has Thai and `locale: "th"` renders it.
    //
    // The 1-1 engagement is conducted in English so the client practises the
    // language they will be interviewed in, and the document they keep is part
    // of that. A Thai report handed over before an English engagement would be
    // the one artefact working against it.
    //
    // Was the lead's own recorded locale until that turned out not to exist:
    // `convex/leads.ts` says the locale a candidate saw is not stored anywhere,
    // and inferring it from their English answer would be a guess.
    { variant, locale: "en", autoPrint: true },
  );

  win.document.open();
  win.document.write(html);
  win.document.close();
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
  // The same query `CallLog` runs. Convex dedupes identical subscriptions, so
  // this costs nothing extra and keeps the grade and the log reading one
  // source rather than two that can disagree.
  const calls = useQuery(api.consultations.listForLead, { leadId });
  const coachIcp = useMemo(() => latestCoachIcp(calls ?? []), [calls]);
  const corrections = useQuery(api.corrections.listForLead, { leadId });
  // Read for the lifecycle state in the header. The panels below subscribe to
  // the same queries; Convex dedupes identical subscriptions, so the state
  // badge and the panels can never disagree about what exists.
  const engagements = useQuery(api.delivery.forLead, { leadId });
  const outcomes = useQuery(api.outcomes.forLead, { leadId });
  const deleteLead = useMutation(api.leads.deleteLeadOnRequest);
  const setDisposition = useMutation(api.leads.setDisposition);
  const [dispReason, setDispReason] = useState("");
  // Which report is being built, so one spinner cannot appear on both buttons.
  const [building, setBuilding] = useState<"full" | "limited" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleteNote, setDeleteNote] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (lead === undefined) {
    return <p className="text-body-large text-on-surface-variant">Loading...</p>;
  }
  if (lead === null) {
    return <p className="text-body-large text-error">No lead with that id.</p>;
  }

  const corrected = applyCorrections(lead.responses, corrections ?? []);

  /**
   * Derived, never stored. Same rule as the scores: the booking gate is
   * expected to change and wave 2 is already written down, so a stored stage
   * would be silently wrong the day it moves.
   *
   * `fullyWithdrawn` reads every channel the person actually gave us. Someone
   * who withdrew email but still has a live LINE consent is not withdrawn, and
   * treating them as such would lose a channel that is still open.
   */
  const heldChannels = CONSENT_CHANNELS.filter(
    (c) => (c === "email" && lead.email) || (c === "line" && lead.lineId) || (c === "phone" && lead.phone),
  );
  const lifecycle = stateFor({
    hasContact: lead.status !== "partial",
    meetsSqlRule: meetsBookingGate(lead.responses),
    consultationsHeld: (calls ?? []).filter((c) => c.outcome === "held").length,
    engagementsAgreed: (engagements ?? []).filter((e) => e.status !== "proposed").length,
    placementsSigned: (outcomes?.placements ?? []).filter((p) => p.signedAt !== undefined).length,
    fullyWithdrawn:
      heldChannels.length > 0 &&
      heldChannels.every((c) =>
        CONSENT_PURPOSES.every((p) => lead.consent[p][c].status !== "opted_in"),
      ),
  });

  return (
    <div className="w-full space-y-8">
      <div>
        <Link href="/admin" className="text-body-medium text-primary underline">
          Back to all leads
        </Link>
        <h1 className="mt-2 text-headline-small">{lead.fullName ?? "Anonymous lead"}</h1>
        {/* The derived lifecycle state leads, because it is the question the
            coach opens this page with. `status` stays beside it rather than
            being replaced: it is a different fact, how far through the
            assessment they got, and the two were being read as one. */}
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-small border px-2 py-0.5 text-body-medium ${
              lifecycle === "withdrawn"
                ? "border-error text-error"
                : lifecycle === "placed" || lifecycle === "client"
                  ? "border-primary text-primary"
                  : "border-outline-variant text-on-surface-variant"
            }`}
          >
            {LIFECYCLE_LABELS[lifecycle]}
          </span>
          <span className="text-body-medium text-on-surface-variant">
            assessment {lead.status} · started {stamp(lead.createdAt)} · last active{" "}
            {stamp(lead.lastActivityAt)}
          </span>
          {/* Where they came from. Deliberately explicit when unknown: most
              existing rows have no attribution because the client hardcoded
              "direct" and never read the URL, and showing a confident origin
              for those would be inventing one. */}
          <span className="text-body-medium text-on-surface-variant">
            {lead.attribution
              ? `via ${lead.attribution.channel.replace(/_/g, " ")}${
                  lead.attribution.campaign ? ` · post ${lead.attribution.campaign}` : ""
                }`
              : "origin unknown"}
          </span>
        </p>

        {/* Two documents, one scored profile. The candidate one is first and is
            the filled button, because it is the one with a recipient: it gets
            sent after the call. The coach copy is preparation for that call. */}
        <button
          type="button"
          disabled={building !== null || Object.keys(corrected.effective).length === 0}
          onClick={async () => {
            setBuilding("limited");
            try {
              await openReport({ ...lead, responses: corrected.effective }, "limited");
            } finally {
              setBuilding(null);
            }
          }}
          className="mt-4 h-12 btn-filled px-7 text-label-large"
        >
          {building === "limited" ? "Building..." : "Candidate PDF (English)"}
        </button>
        <button
          type="button"
          disabled={building !== null || Object.keys(corrected.effective).length === 0}
          onClick={async () => {
            setBuilding("full");
            try {
              await openReport({ ...lead, responses: corrected.effective }, "full");
            } finally {
              setBuilding(null);
            }
          }}
          className="ml-3 mt-4 btn-outlined h-12 px-5 text-label-large hover:bg-surface-container"
        >
          {building === "full" ? "Building..." : "Full report PDF (coach)"}
        </button>

        {/* Subject-access request. Two formats: the HTML is what you send the
            person, the JSON is the portable copy if they ask for one.

            Built from `lead`, not from the corrected record: an access request
            asks what the person told us and what we hold, and their own answers
            are the first half of that. Corrections are ours, and they are
            disclosed in the conversations section rather than silently swapped
            in over the top of what they said. */}
        <button
          type="button"
          onClick={async () => {
            const { renderSubjectExportHtml } = await import("@/lib/subjectExport");
            download(
              renderSubjectExportHtml(lead, calls ?? [], lead.consentEvents ?? []),
              `punprofile-data-${slug(lead.fullName ?? "record")}.html`,
              "text/html;charset=utf-8",
            );
          }}
          className="ml-3 mt-4 btn-outlined h-12 px-5 text-label-large hover:bg-surface-container"
        >
          Export their data (readable)
        </button>
        <button
          type="button"
          onClick={async () => {
            const { buildSubjectExport } = await import("@/lib/subjectExport");
            download(
              JSON.stringify(
                buildSubjectExport(lead, calls ?? [], lead.consentEvents ?? []),
                null,
                2,
              ),
              `punprofile-data-${slug(lead.fullName ?? "record")}.json`,
              "application/json",
            );
          }}
          className="ml-3 mt-4 btn-outlined h-12 px-5 text-label-large hover:bg-surface-container"
        >
          Export (JSON)
        </button>
        {Object.keys(lead.responses).length === 0 && (
          <p className="mt-2 text-body-medium text-on-surface-variant">
            No answers yet, so there is nothing to report on.
          </p>
        )}
      </div>

      {/* Two columns: what we know on the left, what we did about it on the
          right. The coach opens this page for one of those two reasons and
          almost never both, and a single scrolling stack made every visit pass
          through the other one. Stacks on narrow screens, where there is no
          second column to be had. */}
      <div className="grid gap-x-10 gap-y-8 large:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] large:items-start">
        <div className="space-y-8">
          <Section title="Contact">
            {lead.consentSource === "survey_import" && (
              <p className="mb-3 rounded-small border border-warning bg-warning-container px-4 py-3 text-body-medium text-on-warning-container">
                Imported from the Lead Discovery Survey. That form asked how best to
                reach them but carried no consent clause, so the dates below are their
                submission date, not a per-channel grant. Judge outreach against what
                the form actually said.
              </p>
            )}
            {/* Actionable now follows the resolved SERVICE consent, not a flat
                timestamp. A withdrawn channel stops being a live link the moment
                the withdrawal is recorded, which is the whole point of building
                the mechanism. */}
            <Row
              label="Email"
              value={lead.email}
              contactable={lead.consent.service.email.status === "opted_in"}
              href={lead.email ? `mailto:${lead.email}` : null}
            />
            {/* LINE has no reliable "message this id" URL scheme, so the id is
                offered for copying rather than linked to something that may not
                open. */}
            <Row
              label="LINE ID"
              value={lead.lineId}
              contactable={lead.consent.service.line.status === "opted_in"}
              copyable
            />
            <Row
              label="Phone"
              value={lead.phone}
              contactable={lead.consent.service.phone.status === "opted_in"}
              href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : null}
            />
          </Section>

          <Section title="Consent">
            <ConsentPanel
              leadId={leadId}
              consent={lead.consent}
              events={lead.consentEvents}
            />
          </Section>

          {/* Your own triage from the survey sheet, imported 14/08/2026 alongside
              the answers. Rendered here rather than left in the data, because a
              column carried across and never shown is a column that was not really
              imported. Absent on app-native leads, which never had it. */}
          {(typeof lead.responses._entryPoint === "string" ||
            typeof lead.responses._manualCheck === "string") && (
            <Section title="From the survey sheet">
              {/* `showConsent={false}`: these are the coach's own triage columns,
                  not channels. Without it `Row` printed "No consent recorded, do
                  not contact" under the suggested entry point, which is not a
                  true statement about anything. */}
              <Row
                label="Suggested entry point"
                value={String(lead.responses._entryPoint ?? "")}
                showConsent={false}
              />
              {typeof lead.responses._manualCheck === "string" &&
                lead.responses._manualCheck.trim() !== "" && (
                  <Row
                    label="Flagged for manual check"
                    value={String(lead.responses._manualCheck)}
                    showConsent={false}
                  />
                )}
            </Section>
          )}

          <AnswerSheet leadId={leadId} responses={lead.responses} corrected={corrected} />
        </div>

        <div className="space-y-8">
          <LeadBriefing
            responses={corrected.effective}
            fullName={lead.fullName}
            coachIcp={coachIcp}
            correctedCount={corrected.byKey.size}
          />

          {/* Above the call log on purpose. The rating and the note are what a
              coach reads first when reopening a lead, and the LinkedIn is the
              thing they go looking for before a call rather than after it. */}
          <Section title="Coach">
            <CoachPanel
              leadId={leadId}
              linkedinUrl={lead.linkedinUrl}
              notes={lead.notes}
              notesAt={lead.notesAt}
              notesBy={lead.notesBy}
              coachRating={lead.coachRating}
            />
          </Section>

          <CallLog leadId={leadId} />

          {/* Right column is "what we did about it", so the commercial record
              belongs under the call log: invitation, call, sale, work, outcome,
              in the order they happen. */}
          <Section title="Engagement and delivery">
            <EngagementPanel leadId={leadId} />
          </Section>

          <Section title="Applications and outcome">
            <OutcomePanel leadId={leadId} />
          </Section>
        </div>
      </div>

      {/* The judgement, kept well away from Delete. One is about whether to
          work with someone, the other erases them, and putting them side by
          side would invite the wrong click. */}
      <Section title="Should we work with this lead">
        <p className="text-body-large text-on-surface-variant">
          Blank is the normal state and means nobody has judged. It does{" "}
          <strong>not</strong> mean qualified. Out of scope is Gate 1 from the
          qualification framework: not a white-collar or IT professional. Not
          now is the right person at the wrong moment, which is a different
          thing and should not be recorded as the first.
        </p>
        {lead.disposition ? (
          <div className="mt-3 rounded-small border border-outline-variant bg-primary-container px-4 py-3">
            <p className="text-body-large text-on-surface">
              {lead.disposition === "disqualified" ? "Out of scope" : "Not now"}
              {lead.dispositionReason ? `: ${lead.dispositionReason}` : ""}
            </p>
            <button
              type="button"
              onClick={() => void setDisposition({ leadId, disposition: null })}
              className="mt-2 text-body-medium text-primary underline"
            >
              Clear this judgement
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <label className="field-label">
              Reason, required
              <input
                value={dispReason}
                onChange={(e) => setDispReason(e.target.value)}
                placeholder="e.g. front-line role, outside the channel's scope"
                className="field mt-1"
              />
            </label>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                disabled={!dispReason.trim()}
                onClick={() =>
                  void setDisposition({
                    leadId,
                    disposition: "disqualified",
                    reason: dispReason.trim(),
                  }).then(() => setDispReason(""))
                }
                className="btn-outlined h-12 px-5 text-label-large"
              >
                Out of scope
              </button>
              <button
                type="button"
                disabled={!dispReason.trim()}
                onClick={() =>
                  void setDisposition({
                    leadId,
                    disposition: "not_now",
                    reason: dispReason.trim(),
                  }).then(() => setDispReason(""))
                }
                className="btn-outlined h-12 px-5 text-label-large"
              >
                Not now
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Delete on request">
        <p className="text-body-large text-on-surface-variant">
          Erases this person entirely: the lead, their answers, every call
          logged against them, every correction, and any saved links. This
          cannot be undone and there is no backup to restore from. A record
          that <em>a</em> deletion happened is kept, holding nothing about who
          it was.
        </p>
        <p className="mt-2 text-body-large text-on-surface-variant">
          <strong>Every session this email has</strong>, not only the one open
          here. One person can hold several rows, because each visit starts a
          new one, and deleting a single row used to leave the rest behind.
        </p>
        <label className="mt-4 block text-label-large text-on-surface-variant">
          Your reference for this request
          <input
            value={deleteNote}
            onChange={(e) => setDeleteNote(e.target.value)}
            placeholder="e.g. requested on LINE, 10/08/2026"
            className="field mt-1"
          />
          <span className="mt-1 block text-body-medium font-normal text-on-surface-variant">
            Do not paste their name or contact details here. This row outlives them.
          </span>
        </label>
        <label className="mt-4 block text-label-large text-on-surface-variant">
          Type DELETE to confirm
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="field mt-1"
          />
        </label>
        {deleteError && <p className="mt-3 text-body-large text-error">{deleteError}</p>}
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
          className="mt-4 h-12 rounded-medium bg-error px-7 text-label-large text-on-error transition-opacity hover:opacity-90 disabled:bg-surface-container-highest disabled:text-on-surface-variant"
        >
          {deleting ? "Deleting..." : "Delete this person permanently"}
        </button>
      </Section>
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

function Row({
  label,
  value,
  contactable = false,
  href,
  copyable,
  showConsent = true,
}: {
  label: string;
  value: string | null;
  /**
   * Resolved from `consentEvents` by the caller, not from a timestamp on the
   * lead. Changed 15/08/2026: the old flat field could not represent a
   * withdrawal, so a channel someone had asked us to stop using stayed a live
   * link forever.
   */
  contactable?: boolean;
  href?: string | null;
  copyable?: boolean;
  /** False for rows that are not contact channels, so no consent line is drawn. */
  showConsent?: boolean;
}) {
  // Only actionable while consent is live. A channel without it is one you must
  // not use, so it stays plain text rather than a live link that invites a
  // click.
  const actionable = !!value && contactable;

  return (
    <div className="border-b border-outline-variant py-2">
      <div className="flex justify-between gap-4">
        <span className="text-body-large text-on-surface-variant">{label}</span>
        {value === null ? (
          <span className="text-body-large text-on-surface-variant">not provided</span>
        ) : actionable && href ? (
          <a className="text-body-large text-primary underline" href={href}>
            {value}
          </a>
        ) : actionable && copyable ? (
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(value)}
            title="Copy"
            className="text-body-large text-primary underline"
          >
            {value}
          </button>
        ) : (
          <span className="text-body-large text-on-surface">{value}</span>
        )}
      </div>
      {showConsent && (
        <p className="text-body-medium text-on-surface-variant">
          {/* Dates and bases live in the Consent section below, which can show
              per purpose and can show a withdrawal. This line says only whether
              the channel may be used right now. */}
          {contactable ? "" : value ? "Do not contact on this channel" : ""}
        </p>
      )}
    </div>
  );
}
