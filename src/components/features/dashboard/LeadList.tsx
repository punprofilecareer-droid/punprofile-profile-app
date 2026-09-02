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
 * crmStatus, both without opening the lead. Everything else on this screen is
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
import {
  CRM_STATUS_LABELS,
  PRIORITY_LABELS,
  REASON_REQUIRED,
  SETTABLE_STATUSES,
  type CrmStatus,
  type Priority,
  type SettableStatus,
} from "@/lib/crm";
import type { Id } from "../../../../convex/_generated/dataModel";
import LeadPipeline from "./LeadPipeline";
import type { LeadStatus } from "./LeadPipeline";



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
  ["priority", "Priority, most urgent first"],
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
  /**
   * Defaults to priority since 26/08/2026, which is the whole point of the
   * column: the list opens on who to work next rather than on who arrived last.
   * It sorted by fit before, and fit is now the tiebreak inside a priority
   * band rather than the key.
   *
   * The sort runs on the server so that changing it changes which leads the
   * limit keeps, not just the order of the ones it already kept.
   */
  const [sort, setSort] = useState<SortKey>("priority");

  /** Set by clicking a stage in the pipeline above. Null is everyone. */
  const [stage, setStage] = useState<LeadStatus | null>(null);
  const leads = useQuery(api.leads.listForAdmin, {
    includeAbandoned,
    // Picking Disqualified in the bar implies showing them. Without this,
    // clicking the segment labelled 3 returns an empty table, which reads as a
    // broken filter rather than as a checkbox left unticked.
    includeDisqualified: includeDisqualified || stage === "disqualified",
    sort,
    /**
     * Always the CRM. Paul, 26/08/2026: take traffic out of the CRM. A session
     * that never gave contact has no status, no priority and no name, so it is
     * not a row on a screen for working people. `listForAdmin` still accepts
     * `traffic`, because the funnel numbers above this list are counted from
     * it and a traffic screen would ask for exactly that.
     */
    view: "crm" as const,
    onlyCrmStatus: stage ?? undefined,
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
          {rows.length} {rows.length === 1 ? "person" : "people"}, {contactable} reachable on
          LINE or phone, {withCv} with a CV
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
          Nobody has cleared the contact gate yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[68rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant text-body-medium text-on-surface-variant">
                <Th>Name</Th>
                <Th title="Every person here cleared the contact gate, so this says which channels they gave rather than whether they can be reached at all.">
                  Reachable on
                </Th>
                <Th title="Has this person actually sent a CV. A tick you set, not an answer they gave: their own rating of their CV is a survey question and lives on the lead's page. Feeds no score.">
                  CV
                </Th>
                <Th
                  sortKey="priority"
                  sort={sort}
                  setSort={setSort}
                  title={`Who to work next. Urgency picks the band, Fit breaks ties inside it, and both stay readable in their own columns: this is a sort, never a blended score. Now means interviewing, negotiating, or ready to move. Unranked means the answers that would place them were never given, which is not the same as cold. Sorts ${SORT_LABEL.priority}.`}
                >
                  Priority
                </Th>

                <Th
                  sortKey="rating"
                  sort={sort}
                  setSort={setSort}
                  title={`Your own read, 1 to 5. Set it on the lead's own page. Unrated sorts last, because nobody has judged is not the same as judged and found wanting. Sorts ${SORT_LABEL.rating}.`}
                >
                  Rating
                </Th>
                <Th title="Where this person is with you. New means nobody has worked them yet, which is not the same as qualified. Quoted and Closed won are read off the engagement row and cannot be picked here, because that row carries the figure. Disqualified asks for a reason.">
                  Status
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
                    l.crmStatus === "disqualified" ? "opacity-55" : ""
                  }`}
                >
                  <Td>
                    <Link href={`/admin/leads/${l._id}`} className="text-ink-deep underline">
                      {l.fullName ?? "Anonymous"}
                    </Link>
                  </Td>
                  {/*
                    One cell, since everyone here cleared the contact gate and
                    "can I reach them" is answered by their being on this list
                    at all. What is left worth seeing is WHICH channels, because
                    most of this audience does not read email. The address is
                    the mail link's title rather than the row's width.
                  */}
                  <Td>
                    <span className="whitespace-nowrap text-body-medium text-on-surface-variant">
                      {l.email && (
                        <a href={`mailto:${l.email}`} title={l.email} className="underline">
                          email
                        </a>
                      )}
                      {l.email && (l.lineId || l.phone) ? " · " : ""}
                      {l.lineId ? <span title={l.lineId}>LINE</span> : ""}
                      {l.lineId && l.phone ? " · " : ""}
                      {l.phone ? <span title={l.phone}>phone</span> : ""}
                    </span>
                  </Td>
                  <Td>
                    <CvCell leadId={l._id} cvReceivedAt={l.cvReceivedAt} />
                  </Td>
                  {/*
                    The band and the two values that produced it, in one cell.
                    Urgency and Fit had columns of their own for an afternoon
                    and Paul's read was that five numbers per row is
                    unreadable. They are the workings, not separate decisions:
                    Priority IS urgency and fit put in an order, so the answer
                    and its reason belong in the same place. Both are still on
                    the lead's own page in full.
                  */}
                  <Td>
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-body-medium ${PRIORITY_STYLE[l.priority]}`}
                    >
                      {PRIORITY_LABELS[l.priority]}
                    </span>
                    <span className="mt-1 block whitespace-nowrap text-body-medium text-on-surface-variant">
                      {priorityReason(l.temperature, l.grade.tier)}
                    </span>
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
                    <JudgedCell
                      leadId={l._id}
                      crmStatus={l.crmStatus}
                      crmStatusReason={l.crmStatusReason}
                      derived={l.crmResolved}
                    />
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
 * One style per status. The three terminal ones recede rather than shout: a
 * closed row is not a warning, it is a row with nothing left to do on it.
 */
/**
 * `now` is the only one that carries colour. Four coloured bands is a rainbow
 * and says everything matters; one says where to start, which is what the
 * column is for. `unranked` is quiet rather than red: nobody asked them.
 */
/**
 * The one line under a Priority band that says why it is that band.
 *
 * Urgency first because it picks the band, fit second because it only breaks
 * ties. Both say "not asked" rather than a number when the answers are
 * missing: an input nobody has been asked about looks identical to one
 * everybody scores low on, and the row must not blur the two.
 */
function priorityReason(
  temperature: { tier: string | null; score: number | null; measuredMax: number },
  fit: FitTier | null,
): string {
  const urgency = temperature.tier
    ? `${temperature.tier.replace(/_/g, " ")} ${temperature.score ?? "?"}/${temperature.measuredMax}`
    : "urgency not asked";
  return `${urgency} · ${fit ? `${fit} fit` : "fit not asked"}`;
}

const PRIORITY_STYLE: Record<Priority, string> = {
  // `bg-canvas-brand`, not `bg-primary`, and this is the trap the design system
  // warns about from the other side. `.ground-fixed` REMAPS `--color-primary`
  // to the dark green, because on a lime ground the lime is the ground and the
  // button on it is the dark pill. So `bg-primary` inside `.ground-fixed`
  // paints #163300, and `text-on-primary` is the same #163300: dark on dark,
  // which is exactly what it rendered as. `canvas-brand` is the lime and
  // `.ground-fixed` leaves it alone, and `ink` is what that class pins for text
  // on it, measured at 9.45.
  now: "ground-fixed bg-canvas-brand text-ink",
  next: "bg-primary-container text-on-primary-container",
  later: "text-on-surface-variant",
  unranked: "text-mute-strong",
};

const STATUS_STYLE: Record<string, string> = {
  "": "text-on-surface-variant",
  nurturing: "bg-primary-container text-on-primary-container",
  quoted: "bg-primary-container text-on-primary-container",
  closed_won: "bg-primary-container text-on-primary-container",
  not_now: "bg-primary-container text-warning",
  closed_lost: "bg-surface-container text-on-surface-variant",
  disqualified: "bg-surface-container text-on-surface-variant",
};

/**
 * The crmStatus, set from the row.
 *
 * **The reason is not optional and is not defaulted.** `setCrmStatus` refuses
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
  crmStatus,
  crmStatusReason,
  derived,
}: {
  leadId: Id<"leads">;
  crmStatus: SettableStatus | null;
  crmStatusReason: string | null;
  /** What `crmStatusFor` resolved to, which may be a Quote sent or Closed won
   *  read off an engagement row rather than set by hand. The control shows it
   *  so the row does not read as New, and picking anything writes it. */
  derived: CrmStatus | null;
}) {
  const save = useMutation(api.leads.setCrmStatus);
  const [pending, setPending] = useState<SettableStatus | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit(next: SettableStatus | null, why?: string) {
    setError(null);
    setBusy(true);
    try {
      await save({ leadId, crmStatus: next, reason: why });
      setPending(null);
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message.replace(/^.*ConvexError:\s*/, "") : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  // The resolved status, not just the stored one, so a Quote sent that came
  // from an engagement row shows in the control rather than reading as New.
  // Picking anything writes it, which is what makes his choice win from then on.
  const shown = pending ?? crmStatus ?? (derived && derived !== "new" ? derived : "");

  return (
    <div className="min-w-[9rem]">
      <select
        value={shown}
        disabled={busy}
        aria-label="Status"
        data-derived={derived ?? undefined}
        title={crmStatusReason ?? "New. Nobody has worked this lead yet"}
        className={`field h-9 min-h-0 w-full rounded-full px-2 text-body-medium ${STATUS_STYLE[shown] ?? ""}`}
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
          const chosen = next as SettableStatus;
          // Only Disqualified stops for a reason. The rest are working states
          // and a form in front of every one of them would make the control
          // cost more than it is worth.
          if (!REASON_REQUIRED.includes(chosen)) {
            setPending(null);
            void commit(chosen);
            return;
          }
          setPending(chosen);
          setReason(crmStatusReason ?? "");
        }}
      >
        <option value="">{CRM_STATUS_LABELS.new}</option>
        {SETTABLE_STATUSES.map((v) => (
          <option key={v} value={v}>
            {CRM_STATUS_LABELS[v]}
          </option>
        ))}
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
