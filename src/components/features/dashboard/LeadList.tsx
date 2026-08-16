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
  strong: "bg-secondary-container text-on-primary-container",
  moderate: "bg-primary-container text-on-surface",
  weak: "bg-surface-container text-on-surface-variant",
};


function ago(ms: number): string {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const SORTS = [
  ["fit", "Fit, best first"],
  ["ready", "Readiness, highest first"],
  ["recent", "Most recent activity"],
  ["oldest", "Oldest activity"],
  ["status", "How far they got"],
  ["rating", "Your rating, highest first"],
] as const;
type SortKey = (typeof SORTS)[number][0];

/** The dropdown that used to render these labels is gone; the labels are not.
 *  They say which direction a column sorts, which a caret cannot, so they moved
 *  into the heading's tooltip rather than being deleted with the control. */
const SORT_LABEL = Object.fromEntries(SORTS) as Record<SortKey, string>;

export default function LeadList() {
  const [includeAbandoned, setIncludeAbandoned] = useState(false);
  const [includeDisqualified, setIncludeDisqualified] = useState(false);
  // Defaults to fit, which is the order this list has always shown. The sort
  // moved to the server so that changing it changes which leads the limit
  // keeps, not just the order of the ones it already kept.
  const [sort, setSort] = useState<SortKey>("fit");
  const leads = useQuery(api.leads.listForAdmin, {
    includeAbandoned,
    includeDisqualified,
    sort,
  });

  const rows = useMemo(() => {
    if (!leads) return [];
    // Server order is authoritative. Readiness is attached for display only;
    // re-sorting here would silently override the chosen sort.
    return leads.map((l) => ({
      ...l,
      readiness: readinessScore(
        Object.values(l.scores).map((score) => ({ score: score ?? null })),
      ),
    }));
  }, [leads]);

  if (leads === undefined) return <p className="text-body-large text-on-surface-variant">Loading leads...</p>;

  const contactable = rows.filter((l) => l.lineId || l.phone).length;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-medium text-on-surface-variant">
          {rows.length} lead{rows.length === 1 ? "" : "s"}, {contactable} reachable on LINE or phone
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-body-medium text-on-surface-variant">
            <input
              type="checkbox"
              checked={includeAbandoned}
              onChange={(e) => setIncludeAbandoned(e.target.checked)}
              className="checkbox"
            />
            Include abandoned sessions
          </label>
          <label className="flex items-center gap-2 text-body-medium text-on-surface-variant">
            <input
              type="checkbox"
              checked={includeDisqualified}
              onChange={(e) => setIncludeDisqualified(e.target.checked)}
              className="checkbox"
            />
            Include judged out
          </label>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-large border border-outline-variant bg-surface px-6 py-6 text-body-large text-on-surface-variant">
          No leads yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant text-body-medium text-on-surface-variant">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>LINE / phone</Th>
                <Th
                  sortKey="fit"
                  sort={sort}
                  setSort={setSort}
                  title={`Fit: should we work with them. Investment Readiness, 0 to 3. Sorts ${SORT_LABEL.fit}.`}
                >
                  Fit
                </Th>
                <Th
                  sortKey="ready"
                  sort={sort}
                  setSort={setSort}
                  title={`Readiness: how close they are to landing a job, out of 5. Sorts ${SORT_LABEL.ready}.`}
                >
                  Ready
                </Th>
                <Th
                  sortKey="rating"
                  sort={sort}
                  setSort={setSort}
                  title={`Your own read, 1 to 5. Set it on the lead's own page. Unrated sorts last, because nobody has judged is not the same as judged and found wanting. Sorts ${SORT_LABEL.rating}.`}
                >
                  Rating
                </Th>
                <Th sortKey="status" sort={sort} setSort={setSort} title={`Sorts ${SORT_LABEL.status}.`}>
                  Status
                </Th>
                <Th title="The coach's judgement. Blank means nobody has judged, which is not the same as qualified.">Judged</Th>
                <Th sortKey="recent" sort={sort} setSort={setSort} title={`Sorts ${SORT_LABEL.recent}.`}>
                  Last
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr
                  key={l._id}
                  className={`border-b border-outline-variant align-top transition-colors hover:bg-secondary-container ${
                    l.disposition === "disqualified" ? "opacity-55" : ""
                  }`}
                >
                  <Td>
                    <Link href={`/admin/leads/${l._id}`} className="text-primary underline">
                      {l.fullName ?? "Anonymous"}
                    </Link>
                  </Td>
                  <Td>
                    {l.email ? (
                      <a href={`mailto:${l.email}`} className="break-all text-on-surface-variant underline">
                        {l.email}
                      </a>
                    ) : (
                      <span className="text-on-surface-variant">none</span>
                    )}
                  </Td>
                  <Td>
                    <span className="break-all text-on-surface-variant">
                      {l.lineId ?? ""}
                      {l.lineId && l.phone ? " · " : ""}
                      {l.phone ?? ""}
                      {!l.lineId && !l.phone && (
                        <span className="text-on-surface-variant">not reachable</span>
                      )}
                    </span>
                  </Td>
                  <Td>
                    {l.grade.tier ? (
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-body-medium ${TIER_STYLE[l.grade.tier]}`}
                        title={
                          l.grade.routingNote ??
                          (l.grade.unmeasured.length
                            ? `Unmeasured: ${l.grade.unmeasured.join("; ")}`
                            : "Both gates pass")
                        }
                      >
                        {l.grade.tier}
                        {l.grade.offeringMatch === "fail" ? " *" : ""}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant">not scored</span>
                    )}
                  </Td>
                  <Td>
                    {l.readiness === null ? (
                      <span className="text-on-surface-variant">not scored</span>
                    ) : (
                      <span className="tabular-nums text-on-surface">{l.readiness.toFixed(1)}</span>
                    )}
                  </Td>
                  <Td>
                    {l.coachRating ? (
                      <span
                        className="whitespace-nowrap text-warning"
                        title={`${l.coachRating} of 5, set by the coach`}
                        aria-label={`${l.coachRating} of 5`}
                      >
                        {"\u2605".repeat(l.coachRating)}
                        <span className="text-outline">
                          {"\u2605".repeat(5 - l.coachRating)}
                        </span>
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-outline" title="Not rated">
                        {"\u2605".repeat(5)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <span className="text-on-surface-variant">
                      {l.status === "partial" ? "abandoned" : "contact given"}
                    </span>
                  </Td>
                  <Td>
                    {l.disposition ? (
                      <span
                        title={l.dispositionReason ?? undefined}
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-body-medium ${
                          l.disposition === "disqualified"
                            ? "bg-surface-container text-on-surface-variant"
                            : "bg-primary-container text-warning"
                        }`}
                      >
                        {l.disposition === "disqualified" ? "out of scope" : "not now"}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant">&mdash;</span>
                    )}
                  </Td>
                  <Td>
                    <span className="whitespace-nowrap text-on-surface-variant">{ago(l.lastActivityAt)}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Named rather than hidden: a score that quietly stands in for a missing
          input is the failure mode this product exists to avoid. */}
      <p className="mt-4 text-body-medium text-on-surface-variant">
        Fit uses the ICP framework in <code>08_Coaching_Business.md</code>, as
        restructured 13/08/2026: two gates and one score. The badge is Investment
        Readiness, the only criterion measured to separate this pool. A{" "}
        <strong>*</strong> means the Offering Match gate failed, so they need a different
        offering rather than the standard pitch, which is a routing note and not a worse
        lead. The In Scope gate reads a CV and the CV pipeline is not built, so everyone
        passes it by default. Temperature is not shown at all: it is not what gates a
        booking, the stage question is.
      </p>
    </div>
  );
}

/**
 * A column heading, and a sort control where the column can be sorted.
 *
 * Replaced the "Order by" dropdown on 16/08/2026. Four of the eight columns
 * were sortable and the control that did it sat above the table naming them in
 * different words, so the reader had to map "Readiness, highest first" onto the
 * column marked Ready. Clicking the column says the same thing in one word.
 *
 * `aria-sort` is what makes this a sortable table to a screen reader rather
 * than a heading that happens to contain a button.
 */
function Th({
  children,
  title,
  sortKey,
  sort,
  setSort,
}: {
  children: React.ReactNode;
  title?: string;
  sortKey?: SortKey;
  sort?: SortKey;
  setSort?: (k: SortKey) => void;
}) {
  const sortable = sortKey && setSort;
  const active = sortable && sort === sortKey;
  return (
    <th
      scope="col"
      title={title}
      aria-sort={active ? "descending" : sortable ? "none" : undefined}
      className="py-2 pr-4 font-semibold"
    >
      {sortable ? (
        <button
          type="button"
          onClick={() => setSort(sortKey)}
          className={`group inline-flex items-center gap-1 rounded-small transition-colors hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-on-tertiary-container ${
            active ? "text-on-surface" : ""
          }`}
        >
          {children}
          <span
            aria-hidden="true"
            className={`text-[0.6em] leading-none transition-opacity ${
              active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
            }`}
          >
            &#9660;
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-3 pr-4 text-body-large">{children}</td>;
}
