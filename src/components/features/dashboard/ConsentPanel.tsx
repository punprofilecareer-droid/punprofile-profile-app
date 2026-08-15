"use client";

/**
 * Consent on the lead 360 view, per channel AND per purpose.
 *
 * What this replaces: three bare timestamps that could not say which permission
 * had been granted. On that display a founder-backfilled email consent, from a
 * form which never offered email as a channel and carried no consent clause,
 * looked identical to a candidate ticking a box. The basis is the whole point,
 * so it is on the screen.
 *
 * Three states, and `never_asked` is drawn differently from `opted_out` on
 * purpose: you may ask someone who was never asked, and you may not re-ask
 * someone who declined. Collapsing them into one grey "no" would lose the only
 * distinction the coach actually acts on.
 *
 * Rules in `src/lib/consent.ts`. This renders them and never re-derives them.
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  CONSENT_CHANNELS,
  CONSENT_PURPOSES,
  type ConsentChannel,
  type ConsentPurpose,
  type ResolvedConsent,
} from "@/lib/consent";

const stamp = (ms: number | null) =>
  ms === null ? null : new Date(ms).toISOString().replace("T", " ").slice(0, 16);

const CHANNEL_LABEL: Record<ConsentChannel, string> = {
  email: "Email",
  line: "LINE",
  phone: "Phone",
};

const PURPOSE_LABEL: Record<ConsentPurpose, string> = {
  service: "Their result and coaching",
  marketing: "Job digests and nurture",
};

/**
 * Plain English for the basis. The stored codes are for the database; a coach
 * deciding whether to message someone needs the sentence, and
 * `founder_backfill` in particular means something a code cannot convey.
 */
const BASIS_LABEL: Record<string, string> = {
  app_tick: "Ticked the box on the contact step",
  survey_import: "Nominated this channel on the survey. The date is their submission date",
  founder_backfill:
    "NOT GIVEN BY THEM. The survey never offered email; the address came from their Google account and was treated as permission",
  coach_recorded: "Recorded by a coach from a conversation",
  unsubscribe_link: "Used an unsubscribe link",
  reply_or_block: "Asked to stop, or blocked the channel",
};

type Resolved = Record<ConsentPurpose, Record<ConsentChannel, ResolvedConsent>>;

type EventRow = {
  channel: string;
  purpose: string;
  action: string;
  at: number;
  basis: string;
  evidence?: string | null;
  by?: string | null;
};

export default function ConsentPanel({
  leadId,
  consent,
  events,
}: {
  leadId: Id<"leads">;
  consent: Resolved;
  events: EventRow[];
}) {
  const withdraw = useMutation(api.consent.withdraw);
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  // Nothing has ever asked for marketing consent, so this is true for every
  // lead today. Said once at the top rather than repeated as three identical
  // "never asked" cells that read like a data problem.
  const noMarketingAnywhere = CONSENT_CHANNELS.every(
    (c) => consent.marketing[c].status === "never_asked",
  );

  return (
    <div>
      {CONSENT_PURPOSES.map((purpose) => (
        <div key={purpose} className="mb-5">
          <h3 className="text-label text-slate">{PURPOSE_LABEL[purpose]}</h3>

          {purpose === "marketing" && noMarketingAnywhere ? (
            <p className="mt-2 rounded-sm border border-neutral-300 bg-cream-wash px-4 py-3 text-caption text-ink">
              Never asked, on any channel. No screen has ever requested this, so
              nobody in the database holds it. That is the correct state, not a
              gap: do not send a digest or a nurture message to this person.
            </p>
          ) : (
            CONSENT_CHANNELS.map((channel) => {
              const state = consent[purpose][channel];
              const key = `${purpose}:${channel}`;
              return (
                <div key={key} className="border-b border-neutral-300 py-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-body text-slate">{CHANNEL_LABEL[channel]}</span>
                    <StatusPill status={state.status} />
                  </div>

                  {state.status !== "never_asked" && (
                    <p className="mt-1 text-caption text-neutral-500">
                      {state.status === "opted_in"
                        ? `Given ${stamp(state.optedInAt)}`
                        : `Withdrawn ${stamp(state.optedOutAt)}`}
                      {state.basis ? ` · ${BASIS_LABEL[state.basis] ?? state.basis}` : ""}
                    </p>
                  )}

                  {/* A re-grant after a withdrawal keeps the withdrawal
                      visible. Someone who once asked us to stop is worth
                      knowing about even after they came back. */}
                  {state.status === "opted_in" && state.optedOutAt !== null && (
                    <p className="mt-1 text-caption text-warning">
                      Previously withdrew this on {stamp(state.optedOutAt)}.
                    </p>
                  )}

                  {state.status === "opted_in" &&
                    (pending === key ? (
                      <div className="mt-3 rounded-sm border border-neutral-300 bg-cream-wash p-3">
                        <label className="block text-label text-slate">
                          Where did the request arrive?
                          <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. asked on LINE, 15/08/2026"
                            className="mt-1 h-12 w-full rounded-sm border border-neutral-300 bg-surface px-4 text-body text-ink"
                          />
                          <span className="mt-1 block text-caption font-normal text-neutral-500">
                            Do not paste their own message. This is your reference, not a
                            copy of what they wrote.
                          </span>
                        </label>
                        <p className="mt-3 text-caption text-slate">
                          This stops future contact on this channel for this purpose. It
                          does <strong>not</strong> delete anything: deletion is a
                          different request, at the bottom of this page.
                        </p>
                        {error && <p className="mt-2 text-body text-error">{error}</p>}
                        <div className="mt-3 flex gap-3">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setError(null);
                              try {
                                await withdraw({
                                  leadId,
                                  channel,
                                  purpose,
                                  evidence: note.trim() || undefined,
                                });
                                setPending(null);
                                setNote("");
                              } catch (err) {
                                setError(
                                  err instanceof Error ? err.message : "Could not record it.",
                                );
                              } finally {
                                setBusy(false);
                              }
                            }}
                            className="h-12 rounded-md bg-error px-5 text-label text-on-error transition-opacity hover:opacity-90 disabled:bg-neutral-300 disabled:text-neutral-500"
                          >
                            {busy ? "Recording..." : "Record the withdrawal"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPending(null);
                              setError(null);
                            }}
                            className="h-12 rounded-md border border-neutral-300 bg-surface px-5 text-label text-slate"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPending(key)}
                        className="mt-1 text-caption text-primary underline"
                      >
                        They asked us to stop
                      </button>
                    ))}
                </div>
              );
            })
          )}
        </div>
      ))}

      {events.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowLog((s) => !s)}
            className="text-caption text-primary underline"
          >
            {showLog ? "Hide" : "Show"} the full log ({events.length}{" "}
            {events.length === 1 ? "event" : "events"})
          </button>
          {showLog && (
            <ul className="mt-3 space-y-2">
              {events.map((e, i) => (
                <li key={i} className="border-b border-neutral-300 pb-2 text-caption">
                  <span className="text-ink">
                    {stamp(e.at)} · {CHANNEL_LABEL[e.channel as ConsentChannel] ?? e.channel} ·{" "}
                    {e.purpose} ·{" "}
                    <strong>{e.action === "opt_in" ? "given" : "withdrawn"}</strong>
                  </span>
                  <span className="block text-neutral-500">
                    {BASIS_LABEL[e.basis] ?? e.basis}
                    {e.by ? ` · recorded by ${e.by}` : ""}
                  </span>
                  {e.evidence && (
                    <span className="block text-neutral-500">&ldquo;{e.evidence}&rdquo;</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: ResolvedConsent["status"] }) {
  // Three visually distinct states. `never_asked` is not a muted `opted_out`:
  // one is an opportunity and the other is an instruction.
  const style =
    status === "opted_in"
      ? "border-primary text-primary"
      : status === "opted_out"
        ? "border-error text-error"
        : "border-neutral-300 text-neutral-500";
  const label =
    status === "opted_in" ? "May contact" : status === "opted_out" ? "Withdrawn" : "Never asked";
  return (
    <span className={`rounded-sm border px-2 py-0.5 text-caption ${style}`}>{label}</span>
  );
}
