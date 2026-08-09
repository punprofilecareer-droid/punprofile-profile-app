"use client";

/**
 * TASK-034, FR-012: the coach's lead list.
 *
 * English on purpose. Only the founder sees this, and putting it through the
 * copy pipeline would double the translation surface for an audience of one.
 *
 * Reactive off `leads.listForAdmin`, so a lead arriving mid-session appears
 * without a refresh. The point of the row is triage: who they are, whether you
 * can actually reach them, and how far they got. Their answers are the detail
 * view's job.
 */

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const STATUS_LABEL: Record<string, string> = {
  partial: "In progress",
  email_captured: "Contact given",
  completed: "Completed",
};

/** Relative, because "3 hours ago" is what you triage on, not a timestamp. */
function ago(ms: number): string {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function LeadList() {
  const leads = useQuery(api.leads.listForAdmin, {});

  if (leads === undefined) {
    return <p className="text-body text-neutral-500">Loading leads...</p>;
  }
  if (leads.length === 0) {
    return (
      <p className="rounded-lg border border-neutral-300 bg-surface px-6 py-6 text-body text-slate">
        No leads yet. They appear here the moment someone starts the assessment,
        before they have given any contact details.
      </p>
    );
  }

  const contactable = leads.filter((l) => l.email && (l.lineId || l.phone)).length;

  return (
    <div className="w-full">
      <p className="mb-4 text-caption text-slate">
        {leads.length} lead{leads.length === 1 ? "" : "s"}, {contactable} contactable
      </p>

      <ul className="space-y-2">
        {leads.map((l) => (
          <li key={l._id}>
            <Link
              href={`/admin/leads/${l._id}`}
              className="block rounded-md border border-neutral-300 bg-surface px-4 py-3 transition-colors hover:bg-mint-wash"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-body text-ink">
                  {l.fullName ?? <span className="text-neutral-500">Anonymous</span>}
                </span>
                <span className="shrink-0 text-caption text-neutral-500">
                  {ago(l.lastActivityAt)}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-slate">
                <span>{STATUS_LABEL[l.status] ?? l.status}</span>
                <span aria-hidden className="text-neutral-300">·</span>
                <span>{l.answered} answered</span>
                {l.pathway && (
                  <>
                    <span aria-hidden className="text-neutral-300">·</span>
                    <span>{l.pathway.replace(/_/g, " ")}</span>
                  </>
                )}
              </div>

              {/* Which channels exist, at a glance. A lead with no reachable
                  channel is the one worth noticing. */}
              <div className="mt-1 flex flex-wrap gap-2 text-caption">
                <Channel label="email" has={!!l.email} />
                <Channel label="LINE" has={!!l.lineId} />
                <Channel label="phone" has={!!l.phone} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Channel({ label, has }: { label: string; has: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 ${
        has ? "bg-mint-tint text-primary-deep" : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {has ? label : `no ${label}`}
    </span>
  );
}
