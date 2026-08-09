"use client";

/**
 * TASK-034, FR-012: the coach's lead table.
 *
 * English on purpose. Only the founder sees this.
 *
 * Two scores per row, and deliberately not one. Readiness answers "how close
 * are they to landing a job", and Fit answers "should we work with them".
 * `08_Coaching_Business.md` is explicit that fit and urgency must stay separate
 * axes rather than blend into a single number, and the same reasoning applies
 * here: a strong-fit lead who is early is a nurture, not a low priority.
 *
 * Sorted by fit, then readiness. The coach's question on opening this is "who
 * is worth a call today", and recency does not answer it.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { readinessScore } from "@/lib/leadGrade";
import type { FitTier } from "@/lib/leadGrade";

const TIER_STYLE: Record<FitTier, string> = {
  strong: "bg-mint-tint text-primary-deep",
  moderate: "bg-cream-wash text-ink",
  weak: "bg-neutral-100 text-neutral-500",
};

const TIER_RANK: Record<FitTier, number> = { strong: 3, moderate: 2, weak: 1 };

function ago(ms: number): string {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function LeadList() {
  const [includeAbandoned, setIncludeAbandoned] = useState(false);
  const leads = useQuery(api.leads.listForAdmin, { includeAbandoned });

  const rows = useMemo(() => {
    if (!leads) return [];
    return leads
      .map((l) => ({
        ...l,
        // Fit is graded on the server; readiness comes from the denormalised
        // scores the assessment already wrote, so nothing is recomputed twice.
        readiness: readinessScore(
          Object.values(l.scores).map((score) => ({ score: score ?? null })),
        ),
      }))
      .sort(
        (a, b) =>
          (b.grade.tier ? TIER_RANK[b.grade.tier] : 0) - (a.grade.tier ? TIER_RANK[a.grade.tier] : 0) ||
          (b.readiness ?? -1) - (a.readiness ?? -1) ||
          b.lastActivityAt - a.lastActivityAt,
      );
  }, [leads]);

  if (leads === undefined) return <p className="text-body text-neutral-500">Loading leads...</p>;

  const contactable = rows.filter((l) => l.lineId || l.phone).length;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-slate">
          {rows.length} lead{rows.length === 1 ? "" : "s"}, {contactable} reachable on LINE or phone
        </p>
        <label className="flex items-center gap-2 text-caption text-slate">
          <input
            type="checkbox"
            checked={includeAbandoned}
            onChange={(e) => setIncludeAbandoned(e.target.checked)}
            className="size-4 accent-primary"
          />
          Include abandoned sessions
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-neutral-300 bg-surface px-6 py-6 text-body text-slate">
          No leads yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-300 text-caption text-slate">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>LINE / phone</Th>
                <Th title="Fit: should we work with them. ICP score out of 10.">Fit</Th>
                <Th title="Readiness: how close they are to landing a job, out of 5.">Ready</Th>
                <Th>Status</Th>
                <Th>Last</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr
                  key={l._id}
                  className="border-b border-neutral-300 align-top transition-colors hover:bg-mint-wash"
                >
                  <Td>
                    <Link href={`/admin/leads/${l._id}`} className="text-primary underline">
                      {l.fullName ?? "Anonymous"}
                    </Link>
                  </Td>
                  <Td>
                    {l.email ? (
                      <a href={`mailto:${l.email}`} className="break-all text-slate underline">
                        {l.email}
                      </a>
                    ) : (
                      <span className="text-neutral-500">none</span>
                    )}
                  </Td>
                  <Td>
                    <span className="break-all text-slate">
                      {l.lineId ?? ""}
                      {l.lineId && l.phone ? " · " : ""}
                      {l.phone ?? ""}
                      {!l.lineId && !l.phone && (
                        <span className="text-neutral-500">not reachable</span>
                      )}
                    </span>
                  </Td>
                  <Td>
                    {l.grade.tier ? (
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-caption ${TIER_STYLE[l.grade.tier]}`}
                        title={`Role fit ${l.grade.parts.roleFit}, experience ${l.grade.parts.experience ?? "?"}, investment ${l.grade.parts.investment ?? "?"}`}
                      >
                        {l.grade.tier} {l.grade.score}
                      </span>
                    ) : (
                      <span className="text-neutral-500">not scored</span>
                    )}
                  </Td>
                  <Td>
                    {l.readiness === null ? (
                      <span className="text-neutral-500">not scored</span>
                    ) : (
                      <span className="tabular-nums text-ink">{l.readiness.toFixed(1)}</span>
                    )}
                  </Td>
                  <Td>
                    <span className="text-slate">
                      {l.status === "partial" ? "abandoned" : "contact given"}
                    </span>
                  </Td>
                  <Td>
                    <span className="whitespace-nowrap text-neutral-500">{ago(l.lastActivityAt)}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Named rather than hidden: a score that quietly stands in for a missing
          input is the failure mode this product exists to avoid. */}
      <p className="mt-4 text-caption text-neutral-500">
        Fit uses the ICP framework in <code>08_Coaching_Business.md</code>. Role/Industry
        Fit currently takes the documented fallback of 2 for everyone, because the Job
        Title Pool is not loaded, so the score varies only by experience and prior
        investment. Temperature is not shown at all: its tiers are specified but its
        per-answer points live in the response sheet&apos;s formulas (TASK-055).
      </p>
    </div>
  );
}

function Th({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <th scope="col" title={title} className="py-2 pr-4 font-semibold">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-3 pr-4 text-body">{children}</td>;
}
