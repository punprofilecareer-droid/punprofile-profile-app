"use client";

/**
 * What was sold and what was delivered. `lifecycle-data-model.md` §§ 7 and 8.
 *
 * Empty for every lead today, and the empty state says why rather than showing
 * a bare "none". A panel that reads as broken gets ignored, and this one is
 * meant to be noticed the first time somebody pays.
 *
 * The rule it renders and must not blur: **a delivered service moves coverage,
 * never a score.** So a delivered row never displays a score change. What the
 * work observed lives in an `assessments` row with `source: "coach"`, and the
 * link to it is shown as exactly that: a separate record.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const stamp = (ms: number | null | undefined) =>
  ms === null || ms === undefined ? null : new Date(ms).toISOString().slice(0, 10);

const MODULE_LABEL: Record<string, string> = {
  career_coaching: "Career Coaching",
  profile_optimization: "Candidate Profile Optimization",
  job_application_lifecycle: "Job Application Lifecycle",
  bundle: "Europe-Ready bundle",
};

const KIND_LABEL: Record<string, string> = {
  base_cv: "Base CV",
  linkedin: "LinkedIn",
  portfolio: "Portfolio site",
  country_research: "Country research",
  tailored_application: "Tailored application",
  interview_prep: "Interview prep",
  mock_interview: "Mock interview",
  offer_review: "Offer review",
  contract_review: "Contract review",
  coaching_session: "Coaching session",
};

const STAGE_LABEL: Record<string, string> = {
  direction: "Stage 0, Direction",
  route: "Stage 1, Route",
  legibility: "Stage 2, Legibility",
  execution: "Stage 3, Execution",
};

export default function EngagementPanel({ leadId }: { leadId: Id<"leads"> }) {
  const engagements = useQuery(api.delivery.forLead, { leadId });

  if (engagements === undefined) {
    return <p className="text-body-medium text-on-surface-variant">Loading...</p>;
  }

  if (engagements.length === 0) {
    return (
      <p className="text-body-large text-on-surface-variant">
        Nothing sold to this person. Until 15/08/2026 the funnel had no record
        past the consultation at all, so this being empty is the normal state
        rather than missing data.
      </p>
    );
  }

  return (
    <ul className="space-y-5">
      {engagements.map((e) => (
        <li key={e._id} className="border-b border-outline-variant pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-body-large text-on-surface">{MODULE_LABEL[e.module] ?? e.module}</span>
            <span className="rounded-small border border-outline-variant px-2 py-0.5 text-body-medium text-on-surface-variant">
              {e.status}
            </span>
          </div>

          <p className="mt-1 text-body-medium text-on-surface-variant">
            {/* THB stated explicitly. `01_Project_Foundation.md` owns the pricing
                table and it is still a pilot hypothesis; this is what one person
                actually agreed, which is a different kind of fact. */}
            {e.agreedThb !== undefined
              ? `Agreed ${e.agreedThb.toLocaleString()} THB`
              : e.quotedThb !== undefined
                ? `Quoted ${e.quotedThb.toLocaleString()} THB, not yet agreed`
                : "No figure recorded"}
            {e.agreedAt ? ` · agreed ${stamp(e.agreedAt)}` : ""}
            {e.completedAt ? ` · completed ${stamp(e.completedAt)}` : ""}
          </p>

          {e.notes && <p className="mt-2 text-body-medium text-on-surface-variant">{e.notes}</p>}

          {e.deliverables.length === 0 ? (
            <p className="mt-3 text-body-medium text-on-surface-variant">No work logged against it yet.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {e.deliverables.map((d) => (
                <li key={d._id} className="flex items-baseline justify-between gap-4">
                  <span className="text-body-medium text-on-surface">
                    {KIND_LABEL[d.kind] ?? d.kind}
                    <span className="text-on-surface-variant">
                      {" "}
                      · {STAGE_LABEL[d.methodStage] ?? d.methodStage}
                    </span>
                    {/* Named as a separate record on purpose. The service did
                        not move a score; an observation did, and it is its own
                        row with its own reason. */}
                    {d.producedAssessment && (
                      <span className="text-on-surface-variant"> · produced a coach assessment</span>
                    )}
                  </span>
                  <span className="text-body-medium text-on-surface-variant">
                    {d.status === "delivered" && d.deliveredAt
                      ? stamp(d.deliveredAt)
                      : d.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
