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

export type LeadStatus = "partial" | "email_captured" | "completed";

/** Funnel order, and the order every stage list on this screen uses. */
export const STATUS_ORDER: readonly LeadStatus[] = ["partial", "email_captured", "completed"] as const;

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
export const STATUS_LABEL: Record<LeadStatus, string> = {
  partial: "Started, no contact",
  email_captured: "Contact given",
  completed: "Completed",
};

/**
 * The same three stages, counted. What a pile of rows is.
 *
 * **`partial` is "Page loads" here, and the difference from the row label is
 * the point.** 24/08/2026, Paul: the count read as 212 people who gave up, and
 * it is not that. `startSession` inserts a row when someone lands on
 * `/efc-assessment`, before a question is answered, because nothing may be
 * stored on the candidate's device (US-001). So the client cannot recognise a
 * returning visitor, every load is a fresh row, and a reload counts again.
 *
 * One value, two readings, deliberately not one word: "Page loads" is a true
 * name for a total and a meaningless one for a single human, which is why the
 * dropdown on a row uses the map above.
 */
export const STATUS_COUNT_LABEL: Record<LeadStatus, string> = {
  partial: "Page loads",
  email_captured: "Contact given",
  completed: "Completed",
};

/** A single teal ramp, light to dark. See the module note for the validation. */
export const STATUS_COLOR: Record<LeadStatus, string> = {
  partial: "#5cbdb0",
  email_captured: "#268e82",
  completed: "#004d47",
};

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
        Nobody in the pipeline yet.
      </p>
    );
  }

  const share = (n: number) => Math.round((n / total) * 100);

  const footnotes: string[] = [
    // First, because it is the biggest number on the card and the one that
    // reads wrong without it. Nothing on this screen should need a person to
    // remember what a column means.
    "A page load is one visit to the assessment. Nothing is stored on the candidate's device, so a reload counts again and one person can be several.",
  ];
  if (p.judgedOut > 0) footnotes.push(`${p.judgedOut} judged out and not counted above.`);
  if (p.notNow > 0) footnotes.push(`${p.notNow} marked not now, still counted.`);
  footnotes.push(
    p.withCv === 1 ? "1 has sent a CV." : `${p.withCv} have sent a CV.`,
  );
  if (p.handSet > 0) {
    footnotes.push(
      p.handSet === 1
        ? "1 of these stages was set by hand rather than earned."
        : `${p.handSet} of these stages were set by hand rather than earned.`,
    );
  }
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
          {total} sessions
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
                    ? "Showing this stage only. Click again for everyone."
                    : s === "partial"
                      ? "Show only the sessions that never gave contact details."
                      : `Show only the ${STATUS_COUNT_LABEL[s].toLowerCase()} leads.`
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

      {/* Beside the stages, never inside them. A judged-out lead has left the
          pipeline and a "not now" has not, which is why only one of the two is
          subtracted from the shares above.
          Zero clauses are dropped rather than printed. "0 judged out" is a
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
