"use client";

/**
 * Which trigger produced what. pp-19, 22/08/2026.
 *
 * `08_Coaching_Business.md` says survey stage = interviewing or negotiating is
 * the cut that earns a booking link, and `trigger` was put on the consultation
 * row so that claim could be checked rather than believed. This is the screen
 * that checks it.
 *
 * **Counts, with their denominator, and no percentages anywhere.** Two out of
 * three is 67% and 67% reads as a finding, which at this volume it is not. The
 * table prints what happened and lets the reader see how few rows it happened
 * to. The median wait is the only derived number and it is withheld, not
 * caveated, until three bookings exist.
 *
 * A row per trigger that has ever fired. Triggers that have not fired do not
 * appear: an empty row would invite reading a zero as evidence about the rule
 * rather than as evidence that the rule has never been used.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const TRIGGER_LABEL: Record<string, string> = {
  survey_stage_wave1: "Wave 1, interviewing or negotiating",
  survey_urgent_wave2: "Wave 2, within 3 months and applying or later",
  manual: "Manual, coach judgement",
  unrecorded: "Trigger not recorded",
};

/** Days and hours, because a wait of 40 hours is a different fact from two days. */
function wait(ms: number): string {
  const hours = Math.round(ms / 3600000);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)} days`;
}

export default function BookingCutReadout() {
  const readout = useQuery(api.consultations.cut, {});

  if (readout === undefined) return null;

  return (
    <section className="rounded-large border border-outline-variant bg-surface px-6 py-5">
      <h2 className="text-title-medium text-on-surface">The booking cut, read back</h2>

      {readout.totalInvitations === 0 ? (
        <p className="mt-2 text-body-medium text-on-surface-variant">
          No invitation recorded yet, so there is nothing to read. A consultation row gets a
          trigger and a sent date when the link goes out; until then this table has no
          denominator.
        </p>
      ) : (
        <>
          <p className="mt-1 text-body-medium text-on-surface-variant">
            {readout.totalInvitations} invitation{readout.totalInvitations === 1 ? "" : "s"} sent.
            Counts, not rates: at this many rows a percentage would read as a finding.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant text-body-medium text-on-surface-variant">
                  <th className="py-2 pr-4 font-normal">Trigger</th>
                  <th className="py-2 pr-4 font-normal">Sent</th>
                  <th className="py-2 pr-4 font-normal">Booked</th>
                  <th className="py-2 pr-4 font-normal">Held</th>
                  <th className="py-2 pr-4 font-normal">No-show</th>
                  <th className="py-2 pr-4 font-normal">Never booked</th>
                  <th className="py-2 font-normal">Median wait</th>
                </tr>
              </thead>
              <tbody>
                {readout.byTrigger.map((row) => (
                  <tr key={row.trigger} className="border-b border-outline-variant text-body-medium">
                    <td className="py-2 pr-4 text-on-surface">{TRIGGER_LABEL[row.trigger]}</td>
                    <td className="py-2 pr-4">{row.sent}</td>
                    <td className="py-2 pr-4">{row.booked}</td>
                    <td className="py-2 pr-4">{row.held}</td>
                    <td className="py-2 pr-4">{row.noShow}</td>
                    <td className="py-2 pr-4">{row.neverBooked}</td>
                    <td className="py-2 text-on-surface-variant">
                      {row.medianWaitMs === null
                        ? `under ${readout.minForMedian} bookings`
                        : wait(row.medianWaitMs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {readout.noInvitation > 0 && (
            <p className="mt-3 text-body-medium text-on-surface-variant">
              {readout.noInvitation} consultation{readout.noInvitation === 1 ? "" : "s"} logged with
              no invitation recorded, so outside this table. A large number here means the log needs
              attention, not the cut.
            </p>
          )}
        </>
      )}
    </section>
  );
}
