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
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { QUESTION_INDEX } from "@/lib/content/questions";

const stamp = (ms: number | null) =>
  ms === null ? null : new Date(ms).toISOString().replace("T", " ").slice(0, 16);

export default function LeadDetail({ leadId }: { leadId: Id<"leads"> }) {
  const lead = useQuery(api.leads.getForAdmin, { leadId });

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
      </div>

      <Section title="Contact and consent">
        <Row label="Email" value={lead.email} consentAt={lead.emailConsentAt} />
        <Row label="LINE ID" value={lead.lineId} consentAt={lead.lineConsentAt} />
        <Row label="Phone" value={lead.phone} consentAt={lead.phoneConsentAt} />
      </Section>

      <Section title="Scores">
        {Object.keys(lead.scores).length === 0 ? (
          <p className="text-body text-neutral-500">Nothing scored yet.</p>
        ) : (
          Object.entries(lead.scores).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-neutral-300 py-2">
              <span className="text-body text-slate">{k}</span>
              <span className="tabular-nums text-body text-ink">
                {typeof v === "number" ? v.toFixed(1) : "not scored"}
              </span>
            </div>
          ))
        )}
      </Section>

      <Section title="Answers">
        {/* Raw responses, resolved to the question text where the content model
            knows it. A key with no question is a leftover from an older
            question set, and showing the key is more useful than hiding it. */}
        {Object.keys(lead.responses).length === 0 ? (
          <p className="text-body text-neutral-500">No answers yet.</p>
        ) : (
          Object.entries(lead.responses).map(([key, value]) => (
            <div key={key} className="border-b border-neutral-300 py-2">
              <p className="text-caption text-neutral-500">
                {QUESTION_INDEX[key]?.en ?? key}
              </p>
              <p className="text-body text-ink">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </p>
            </div>
          ))
        )}
      </Section>
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
}: {
  label: string;
  value: string | null;
  consentAt: number | null;
}) {
  return (
    <div className="border-b border-neutral-300 py-2">
      <div className="flex justify-between gap-4">
        <span className="text-body text-slate">{label}</span>
        <span className="text-body text-ink">
          {value ?? <span className="text-neutral-500">not provided</span>}
        </span>
      </div>
      <p className="text-caption text-neutral-500">
        {consentAt
          ? `Consent given ${stamp(consentAt)}`
          : value
            ? "No consent recorded, do not contact"
            : ""}
      </p>
    </div>
  );
}
