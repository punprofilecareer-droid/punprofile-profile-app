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
 *
 * ---------------------------------------------------------------------------
 * WORKABLE FROM THE ROW. 24/08/2026.
 * ---------------------------------------------------------------------------
 *
 * Two cells write. `CV` ticks whether a document arrived, and `Judged` sets the
 * disposition, both without opening the lead. Everything else on this screen is
 * still read-only and derived, which is the point: a coach triaging thirty rows
 * should not have to open thirty pages to record the two facts that decide
 * whether a row is worth opening at all.
 *
 * Nothing here writes a lifecycle state. `lifecycle.ts` says why: state is a
 * pure function of the rows that exist, so a hand-set stage would be the stored
 * column that file exists to refuse.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { readinessScore } from "@/lib/leadGrade";
import type { FitTier } from "@/lib/leadGrade";
import type { Id } from "../../../../convex/_generated/dataModel";
import LeadPipeline, { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from "./LeadPipeline";
import type { LeadStatus } from "./LeadPipeline";

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

/** DD/MM/YYYY, the house format. */
function dmy(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const SORTS = [
  ["fit", "Fit, best first"],
  ["ready", "Readiness, highest first"],
  ["created", "Newest first, by the date they arrived"],
  ["created_oldest", "Oldest first, by the date they arrived"],
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
  /** Set by clicking a stage in the pipeline above. Null is everyone. */
  const [stage, setStage] = useState<LeadStatus | null>(null);
  const leads = useQuery(api.leads.listForAdmin, {
    // Picking the abandoned stage implies showing abandoned sessions. Without
    // this, clicking the segment labelled 47 returns an empty table, which
    // reads as a broken filter rather than as a checkbox left unticked.
    includeAbandoned: includeAbandoned || stage === "partial",
    includeDisqualified,
    sort,
    onlyStatus: stage ?? undefined,
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
  const withCv = rows.filter((l) => l.cvReceivedAt).length;

  return (
    <div className="w-full">
      <div className="mb-5">
        <LeadPipeline active={stage} onPick={setStage} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-medium text-on-surface-variant">
          {rows.length} lead{rows.length === 1 ? "" : "s"}, {contactable} reachable on LINE or
          phone, {withCv} with a CV
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
          <table className="w-full min-w-[68rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant text-body-medium text-on-surface-variant">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>LINE / phone</Th>
                <Th title="Has this person actually sent a CV. A tick you set, not an answer they gave: their own rating of their CV is a survey question and lives on the lead's page. Feeds no score.">
                  CV
                </Th>
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
                <Th
                  sortKey="status"
                  sort={sort}
                  setSort={setSort}
                  title={`The pipeline stage, and yours to set. Changing it changes what every funnel number on this app counts, so an override is stamped and the row says so. Sorts ${SORT_LABEL.status}.`}
                >
                  Status
                </Th>
                <Th title="The coach's judgement, and the one status you set by hand. Blank means nobody has judged, which is not the same as qualified. A reason is required.">
                  Judged
                </Th>
                <Th
                  sortKey="created"
                  altKey="created_oldest"
                  sort={sort}
                  setSort={setSort}
                  title={`The date they arrived, which is not the date they last did something. Click once for ${SORT_LABEL.created.toLowerCase()}, again for ${SORT_LABEL.created_oldest.toLowerCase()}.`}
                >
                  Created
                </Th>
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
                    <Link href={`/admin/leads/${l._id}`} className="text-on-primary underline">
                      {l.fullName ?? "Anonymous"}
                    </Link>
                  </Td>
                  <Td>
                    {l.email ? (
                      <a
                        href={`mailto:${l.email}`}
                        title={l.email}
                        className="whitespace-nowrap text-body-medium text-on-surface-variant underline"
                      >
                        {l.email}
                      </a>
                    ) : (
                      <span className="text-body-medium text-on-surface-variant">none</span>
                    )}
                  </Td>
                  <Td>
                    <span className="whitespace-nowrap text-body-medium text-on-surface-variant">
                      {l.lineId ?? ""}
                      {l.lineId && l.phone ? " · " : ""}
                      {l.phone ?? ""}
                      {!l.lineId && !l.phone && (
                        <span className="text-on-surface-variant">not reachable</span>
                      )}
                    </span>
                  </Td>
                  <Td>
                    <CvCell leadId={l._id} cvReceivedAt={l.cvReceivedAt} />
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
                        {"★".repeat(l.coachRating)}
                        <span className="text-outline">
                          {"★".repeat(5 - l.coachRating)}
                        </span>
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-outline" title="Not rated">
                        {"★".repeat(5)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <StatusCell
                      leadId={l._id}
                      status={l.status}
                      statusOverrideAt={l.statusOverrideAt}
                      statusOverrideBy={l.statusOverrideBy}
                    />
                  </Td>
                  <Td>
                    <JudgedCell
                      leadId={l._id}
                      disposition={l.disposition}
                      dispositionReason={l.dispositionReason}
                    />
                  </Td>
                  <Td>
                    <span
                      className="whitespace-nowrap tabular-nums text-on-surface-variant"
                      title={new Date(l.createdAt).toLocaleString("en-GB")}
                    >
                      {dmy(l.createdAt)}
                    </span>
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
        passes it by default, and the CV column above does not change that: it records
        that a document arrived, and nothing reads it but you. Temperature is not shown at
        all: it is not what gates a booking, the stage question is.
      </p>
    </div>
  );
}

/**
 * Whether a CV has arrived, ticked from the row.
 *
 * Writes on click with no confirm step, because the mistake it can make is
 * cheap and visible: the box is right there and unticking it restores the
 * previous state. Re-ticking does not move the stored date; see the mutation.
 */
function CvCell({ leadId, cvReceivedAt }: { leadId: Id<"leads">; cvReceivedAt: number | null }) {
  const save = useMutation(api.leads.setCoachFields);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex items-center gap-2">
      <input
        type="checkbox"
        className="checkbox"
        checked={Boolean(cvReceivedAt)}
        disabled={busy}
        aria-label="CV received"
        title={cvReceivedAt ? `CV received ${dmy(cvReceivedAt)}` : "No CV received"}
        onChange={async (e) => {
          const next = e.target.checked;
          setError(null);
          setBusy(true);
          try {
            await save({ leadId, cvReceived: next });
          } catch (err) {
            setError(err instanceof Error ? err.message.replace(/^.*ConvexError:\s*/, "") : "Could not save.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {cvReceivedAt && (
        <span className="whitespace-nowrap text-body-medium text-on-surface-variant">
          {dmy(cvReceivedAt)}
        </span>
      )}
      {error && <span role="alert" className="text-body-medium text-error">{error}</span>}
    </span>
  );
}

/**
 * The pipeline stage, set from the row.
 *
 * Writes on change with no confirm step, unlike the judgement next to it, and
 * the difference is deliberate: a disposition needs a reason because it is an
 * opinion that outlives whoever formed it, while a stage is a position and the
 * evidence for it is the rest of the row.
 *
 * The stamp is shown, not just stored. A stage somebody typed and a stage the
 * funnel earned look identical in the column, and on a screen used to read the
 * funnel that difference has to be visible somewhere.
 */
function StatusCell({
  leadId,
  status,
  statusOverrideAt,
  statusOverrideBy,
}: {
  leadId: Id<"leads">;
  status: LeadStatus;
  statusOverrideAt: number | null;
  statusOverrideBy: string | null;
}) {
  const save = useMutation(api.leads.setStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-w-[9.5rem]">
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          style={{ backgroundColor: STATUS_COLOR[status] }}
          className="h-3 w-3 shrink-0 rounded-[2px]"
        />
        <select
          value={status}
          disabled={busy}
          aria-label="Pipeline stage"
          title={
            statusOverrideAt
              ? `Set by hand ${dmy(statusOverrideAt)}${statusOverrideBy ? ` by ${statusOverrideBy}` : ""}`
              : "Written by the funnel, not by hand"
          }
          className="field h-9 min-h-0 w-full px-2 text-body-medium"
          onChange={async (e) => {
            const next = e.target.value as LeadStatus;
            setError(null);
            setBusy(true);
            try {
              await save({ leadId, status: next });
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message.replace(/^.*ConvexError:\s*/, "")
                  : "Could not save.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </span>
      {statusOverrideAt && (
        <p className="mt-1 text-body-medium text-on-surface-variant">set by hand</p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-body-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const JUDGED_STYLE: Record<string, string> = {
  "": "text-on-surface-variant",
  not_now: "bg-primary-container text-warning",
  disqualified: "bg-surface-container text-on-surface-variant",
};

/**
 * The disposition, set from the row.
 *
 * **The reason is not optional and is not defaulted.** `setDisposition` refuses
 * a judgement with no reason, on the grounds that it will outlive whoever set
 * it, and a list control that quietly sent "set from the list" would be the
 * change that makes every reason in the database worthless. So picking a
 * judgement opens one field, and nothing is written until it has words in it.
 *
 * Clearing back to blank needs no reason: it restores "nobody has judged",
 * which is a real state rather than a verdict.
 */
function JudgedCell({
  leadId,
  disposition,
  dispositionReason,
}: {
  leadId: Id<"leads">;
  disposition: "disqualified" | "not_now" | null;
  dispositionReason: string | null;
}) {
  const save = useMutation(api.leads.setDisposition);
  const [pending, setPending] = useState<"disqualified" | "not_now" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit(next: "disqualified" | "not_now" | null, why?: string) {
    setError(null);
    setBusy(true);
    try {
      await save({ leadId, disposition: next, reason: why });
      setPending(null);
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message.replace(/^.*ConvexError:\s*/, "") : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  const shown = pending ?? disposition ?? "";

  return (
    <div className="min-w-[9rem]">
      <select
        value={shown}
        disabled={busy}
        aria-label="Judgement"
        title={dispositionReason ?? "Nobody has judged this lead"}
        className={`field h-9 min-h-0 w-full rounded-full px-2 text-body-medium ${JUDGED_STYLE[shown] ?? ""}`}
        onChange={(e) => {
          const next = e.target.value;
          setError(null);
          if (next === "") {
            setPending(null);
            void commit(null);
            return;
          }
          // Prefilled with the reason already on record, so changing "not now"
          // to "out of scope" is not a retyping exercise.
          setPending(next as "disqualified" | "not_now");
          setReason(dispositionReason ?? "");
        }}
      >
        <option value="">not judged</option>
        <option value="not_now">not now</option>
        <option value="disqualified">out of scope</option>
      </select>

      {pending && (
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <input
            type="text"
            autoFocus
            value={reason}
            disabled={busy}
            placeholder="Why? Required."
            className="field h-9 min-h-0 w-40 px-2 text-body-medium"
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && reason.trim()) void commit(pending, reason);
              if (e.key === "Escape") {
                setPending(null);
                setReason("");
              }
            }}
          />
          <button
            type="button"
            disabled={busy || !reason.trim()}
            onClick={() => void commit(pending, reason)}
            className="btn-filled px-3 py-1 text-body-medium"
          >
            Save
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setPending(null);
              setReason("");
              setError(null);
            }}
            className="text-body-medium text-on-surface-variant underline"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-1 text-body-medium text-error">
          {error}
        </p>
      )}
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
 * `altKey` is the second direction, for a column where both are worth having.
 * Created has one because "who just arrived" and "who has been sitting here
 * longest" are both real questions; the score columns do not, because nobody
 * works a queue worst-fit first.
 *
 * `aria-sort` is what makes this a sortable table to a screen reader rather
 * than a heading that happens to contain a button.
 */
function Th({
  children,
  title,
  sortKey,
  altKey,
  sort,
  setSort,
}: {
  children: React.ReactNode;
  title?: string;
  sortKey?: SortKey;
  altKey?: SortKey;
  sort?: SortKey;
  setSort?: (k: SortKey) => void;
}) {
  const sortable = sortKey && setSort;
  const ascending = Boolean(altKey && sort === altKey);
  const active = sortable && (sort === sortKey || ascending);
  return (
    <th
      scope="col"
      title={title}
      aria-sort={active ? (ascending ? "ascending" : "descending") : sortable ? "none" : undefined}
      className="py-2 pr-4 font-semibold"
    >
      {sortable ? (
        <button
          type="button"
          onClick={() => setSort(sort === sortKey && altKey ? altKey : sortKey)}
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
            {ascending ? "▲" : "▼"}
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
