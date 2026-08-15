"use client";

/**
 * Applications and placements. `lifecycle-data-model.md` § 9.
 *
 * Two rules this renders and must not blur:
 *
 * - **Whose row is it.** TASK-059 makes the job list the candidate's own
 *   notebook, and nothing infers a status. So every row shows who moved it, and
 *   a candidate-recorded row is visibly theirs.
 * - **A placement does not claim credit by existing.** `attributedTo` is a
 *   coach's judgement. The panel prints it in words rather than showing a bare
 *   employer name that reads like a win.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const day = (ms: number | null | undefined) =>
  ms === null || ms === undefined ? null : new Date(ms).toISOString().slice(0, 10);

const ATTRIBUTION_LABEL: Record<string, string> = {
  engagement: "PunProfile did the work on this application",
  assisted: "They were in an engagement, but this was not the work",
  self: "They got here themselves and told us",
};

export default function OutcomePanel({ leadId }: { leadId: Id<"leads"> }) {
  const data = useQuery(api.outcomes.forLead, { leadId });

  if (data === undefined) {
    return <p className="text-caption text-neutral-500">Loading...</p>;
  }

  const { applications, placements } = data;

  if (applications.length === 0 && placements.length === 0) {
    return (
      <p className="text-body text-neutral-500">
        No applications and no placement recorded. The candidate-facing job list
        needs an account first, so today this fills up only when a coach enters
        something.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {placements.length > 0 && (
        <div>
          <h3 className="text-label text-slate">Placement</h3>
          <ul className="mt-2 space-y-3">
            {placements.map((p) => (
              <li key={p._id} className="border-b border-neutral-300 pb-3">
                <p className="text-body text-ink">
                  {p.roleTitle} at {p.employer}, {p.country}
                </p>
                <p className="mt-1 text-caption text-neutral-500">
                  {p.signedAt ? `Signed ${day(p.signedAt)}` : "Offer, not yet signed"}
                  {p.startAt ? ` · starts ${day(p.startAt)}` : ""}
                  {p.salary ? ` · ${p.salary}` : ""}
                </p>
                {p.visaRoute && (
                  <p className="mt-1 text-caption text-slate">
                    {/* The only place a claimed visa route is ever confirmed
                        against what actually worked. Worth reading back into
                        `07_Reference.md`. */}
                    Visa route that worked: {p.visaRoute}
                  </p>
                )}
                <p className="mt-1 text-caption text-neutral-500">
                  {ATTRIBUTION_LABEL[p.attributedTo] ?? p.attributedTo}
                </p>
                <p className="mt-1 text-caption text-neutral-500">
                  {p.storyConsentAt
                    ? `Agreed we may tell this story, ${day(p.storyConsentAt)}`
                    : "No permission to use this as a success story."}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {applications.length > 0 && (
        <div>
          <h3 className="text-label text-slate">
            Applications ({applications.filter((a) => a.status !== "interested").length} applied,{" "}
            {applications.filter((a) => a.status === "interested").length} saved)
          </h3>
          <ul className="mt-2 space-y-2">
            {applications.map((a) => (
              <li key={a._id} className="border-b border-neutral-300 pb-2">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-caption text-ink">
                    {a.roleTitle} · {a.employer} · {a.country}
                  </span>
                  <span className="text-caption text-slate">{a.status}</span>
                </div>
                <p className="text-caption text-neutral-500">
                  {a.appliedAt ? `Applied ${day(a.appliedAt)}` : `Saved ${day(a.savedAt)}`}
                  {" · "}
                  {a.recordedBy === "candidate"
                    ? "their own record"
                    : "recorded by a coach"}
                  {a.jobLogId ? " · from the job feed" : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
