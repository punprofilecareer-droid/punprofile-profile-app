"use client";

/**
 * How many leads sit in each stage. 24/08/2026.
 *
 * **One stacked bar, not three gauges and not a funnel.** The question is
 * part-to-whole ("of the people in play, how many are where"), and the honest
 * form for part-to-whole is one bar divided by share. A funnel's tapering
 * trapezoid encodes the same number twice, once as width and once as the taper,
 * and the taper is drawn rather than measured.
 *
 * **The counts are printed beside the swatches, not only in the bar.** Colour is
 * never the only carrier: the legend is the table view, so the bar can be
 * ignored entirely and nothing is lost. Segments under a few percent are too
 * thin to label inside, which is exactly why no label is drawn inside one.
 *
 * The ramp is a single teal, light to dark, in funnel order. Validated against
 * the surface rather than eyeballed: three steps, monotone lightness, adjacent
 * gaps clear, light end at 2.13:1 on `#f9faef`. It is one hue because these
 * stages are an ordered scale, not four identities, and a rainbow here would
 * claim a difference in kind between abandoned and finished.
 *
 * Clicking a stage filters the list below it. The one filter row sits above
 * everything it scopes, which is the same reason the two checkboxes are up
 * there rather than inside this card.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  CRM_STATUS_COLOR,
  CRM_STATUS_LABELS,
  CRM_STATUS_ORDER,
  type CrmStatus,
} from "@/lib/crm";

/**
 * **This bar counts the Status field, since 26/08/2026.** Paul asked for a
 * pipeline that represents Status, and it had been counting the assessment's
 * own three stages: page loads, contact given, finished. That is a funnel of
 * sessions and not a pipeline of people, and it stopped belonging over a list
 * of people the day traffic left the CRM. Clicking a segment now filters the
 * list under it, which it could not honestly do before: the first segment held
 * rows the list no longer contains.
 *
 * The three assessment stages are not lost. `leads.status` still carries them,
 * `stats.community` still counts them, and they belong on a traffic screen when
 * there is one.
 */
export type LeadStatus = CrmStatus;

export const STATUS_ORDER = CRM_STATUS_ORDER;

/**
 * The stage names, for a row. What one person is.
 *
 * The list used to render this column as "abandoned" or "contact given", which
 * folded `completed` in with `email_captured` and left the app unable to say on
 * screen how many people actually finished the assessment. Three values, three
 * names.
 *
 * `partial` reads "Started, no contact" here rather than "Abandoned", the
 * wording `LIFECYCLE_LABELS.visitor` already uses for the same situation.
 * Abandoned was a verdict on a person the app has no evidence about: most of
 * these rows are a page that was opened, and opening a page is not giving up.
 */
export const STATUS_LABEL = CRM_STATUS_LABELS;

/**
 * The bar and a row now say the same word, and that is the change.
 *
 * The old split existed because one value had two honest readings: `partial`
 * was "Started, no contact" for a person and "Page loads" for a total, since a
 * reload makes a fresh row and one person could be several. A status is not
 * like that. Nurturing is nurturing whether you are counting one person or
 * forty.
 */
export const STATUS_COUNT_LABEL = CRM_STATUS_LABELS;


/** A single teal ramp, light to dark. See the module note for the validation. */
export const STATUS_COLOR = CRM_STATUS_COLOR;

export default function LeadPipeline({
  active,
  onPick,
}: {
  active: LeadStatus | null;
  onPick: (s: LeadStatus | null) => void;
}) {
  const p = useQuery(api.leads.pipeline, {});

  if (p === undefined) {
    return (
      <p className="text-body-medium text-on-surface-variant">Counting the pipeline...</p>
    );
  }

  const total = STATUS_ORDER.reduce((n, s) => n + p.counts[s], 0);
  if (total === 0) {
    return (
      <p className="rounded-large border border-outline-variant bg-surface px-6 py-4 text-body-medium text-on-surface-variant">
        Nobody has cleared the contact gate yet.
      </p>
    );
  }

  const share = (n: number) => Math.round((n / total) * 100);

  const footnotes: string[] = [];
  // Beside the bar, never inside it. A session that never gave contact has no
  // status, so counting it as one would put a number in this bar that the list
  // underneath cannot show you.
  if (p.traffic > 0) {
    footnotes.push(
      `${p.traffic} sessions never gave contact and are not counted here. A page load is one visit: nothing is stored on the candidate's device, so a reload counts again and one person can be several.`,
    );
  }
  footnotes.push(
    p.withCv === 1 ? "1 has sent a CV." : `${p.withCv} have sent a CV.`,
  );
  if (p.capped) {
    footnotes.push("More leads exist than this count scanned, so these are a floor.");
  }

  return (
    <div className="rounded-large border border-outline-variant bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-label-large">Pipeline</h3>
        <p className="text-body-medium text-on-surface-variant">
          {/* Sessions, not people. Every row here is one visit, including the
              ones that got all the way to the end. */}
          {total} {total === 1 ? "person" : "people"}
          {active ? `, showing ${STATUS_COUNT_LABEL[active].toLowerCase()} only` : ""}
        </p>
      </div>

      {/* The bar. `role="img"` with the full reading as its label, because a row
          of divs is not a figure to a screen reader and the legend below is the
          same information in text anyway. */}
      <div
        role="img"
        aria-label={STATUS_ORDER.map((s) => `${STATUS_COUNT_LABEL[s]} ${p.counts[s]}`).join(", ")}
        className="mt-4 flex h-3 w-full gap-[2px] overflow-hidden"
      >
        {STATUS_ORDER.filter((s) => p.counts[s] > 0).map((s, i, shown) => (
          <div
            key={s}
            title={`${STATUS_COUNT_LABEL[s]}: ${p.counts[s]} of ${total}, ${share(p.counts[s])}%`}
            style={{
              flexGrow: p.counts[s],
              flexBasis: 0,
              backgroundColor: STATUS_COLOR[s],
              opacity: active && active !== s ? 0.35 : 1,
              borderTopLeftRadius: i === 0 ? 4 : 0,
              borderBottomLeftRadius: i === 0 ? 4 : 0,
              borderTopRightRadius: i === shown.length - 1 ? 4 : 0,
              borderBottomRightRadius: i === shown.length - 1 ? 4 : 0,
            }}
            className="min-w-[3px] transition-opacity"
          />
        ))}
      </div>

      {/* The legend, and the table view. Every number in the bar is here in
          text, so nothing is reachable only by hovering a 3px segment. */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {STATUS_ORDER.map((s) => {
          const on = active === s;
          return (
            <li key={s}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onPick(on ? null : s)}
                title={
                  on
                    ? "Showing this status only. Click again for everyone."
                    : `Show only the people at ${STATUS_COUNT_LABEL[s].toLowerCase()}.`
                }
                className={`flex items-center gap-2 rounded-small px-2 py-1 text-left transition-colors hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-on-tertiary-container ${
                  on ? "bg-surface-container" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: STATUS_COLOR[s] }}
                  className="h-3 w-3 shrink-0 rounded-[2px]"
                />
                <span className="text-body-medium text-on-surface-variant">
                  {STATUS_COUNT_LABEL[s]}
                </span>
                <span className="text-title-medium text-on-surface">{p.counts[s]}</span>
                <span className="text-body-medium text-on-surface-variant">
                  {share(p.counts[s])}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Zero clauses are dropped rather than printed. "0 judged out" is a
          sentence about nothing, and three of them in a row read as a broken
          readout rather than as a quiet week. */}
      {footnotes.length > 0 && (
        <p className="mt-4 text-body-medium text-on-surface-variant">
          {footnotes.join(" ")}
        </p>
      )}
    </div>
  );
}
