"use client";

/**
 * What the coach knows that the assessment does not: a LinkedIn address, a
 * running note, and a gut rating.
 *
 * Added 16/08/2026, after a coach found a candidate's LinkedIn by reading her
 * email domain and phone prefix and had nowhere to put it.
 *
 * All three are **coach-entered and coach-owned**. Nothing here is derived from
 * an answer, nothing here feeds a score, and that separation is the reason the
 * panel exists rather than these being three fields scattered across the page:
 *
 * - `linkedin` in `responses` is the candidate's own rating of their profile.
 *   `linkedinUrl` is where the profile is. A screen that showed one under the
 *   other's label would be lying.
 * - `grade` and `scores` are computed from evidence and can be re-derived.
 *   `coachRating` cannot, and its whole value is that it is a judgement made
 *   after talking to someone.
 * - `disposition` answers whether to work with them. The rating answers how
 *   promising they feel. A lead can be a 5 and still be `not_now`.
 *
 * The note is one editable field, not a log, which is what was asked for and is
 * right for a scratchpad. **There is no history**, so an overwrite loses what
 * was there. Anything tied to a specific call belongs in `consultations.notes`,
 * which is already append-only.
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type Props = {
  leadId: Id<"leads">;
  linkedinUrl: string | null;
  notes: string | null;
  notesAt: number | null;
  notesBy: string | null;
  coachRating: number | null;
};

const RATING_MEANING = [
  "",
  "Not a fit, but worth keeping warm",
  "Some signal, nothing to act on yet",
  "Worth a call",
  "Strong, would take them on",
  "Drop everything",
];

export default function CoachPanel({
  leadId,
  linkedinUrl,
  notes,
  notesAt,
  notesBy,
  coachRating,
}: Props) {
  const save = useMutation(api.leads.setCoachFields);

  const [url, setUrl] = useState(linkedinUrl ?? "");
  const [text, setText] = useState(notes ?? "");
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Convex pushes the value back after a write, and again if someone else edits
   * the same lead. Without this the textarea keeps showing a stale draft over
   * fresher data.
   *
   * Adjusted during render against the last server value seen, rather than in
   * an effect. The effect version renders once with the old text and then again
   * with the new, and the lint rule that flags it is right: this is the case
   * React documents for setting state while rendering.
   */
  const [serverUrl, setServerUrl] = useState(linkedinUrl);
  const [serverNotes, setServerNotes] = useState(notes);
  if (linkedinUrl !== serverUrl) {
    setServerUrl(linkedinUrl);
    setUrl(linkedinUrl ?? "");
  }
  if (notes !== serverNotes) {
    setServerNotes(notes);
    setText(notes ?? "");
  }

  const dirty = url.trim() !== (linkedinUrl ?? "") || text.trim() !== (notes ?? "");

  async function commit(patch: Parameters<typeof save>[0]) {
    setError(null);
    setState("saving");
    try {
      await save(patch);
      setState("saved");
      window.setTimeout(() => setState("idle"), 1600);
    } catch (e) {
      setState("idle");
      setError(e instanceof Error ? e.message.replace(/^.*ConvexError:\s*/, "") : "Could not save.");
    }
  }

  return (
    <div className="rounded-large border border-outline-variant bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-label-large">What the coach knows</h3>
        <span
          className="text-body-medium text-on-surface-variant"
          aria-live="polite"
          // Announced rather than shown as a toast: the coach is looking at the
          // field they just changed, not at the corner of the screen.
        >
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : ""}
        </span>
      </div>

      {/* --- rating ------------------------------------------------------- */}
      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-body-medium text-on-surface-variant">
          Your own read, after talking to them. Not a score, and it feeds nothing.
        </legend>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex" onMouseLeave={() => setHoverStar(null)}>
            {[1, 2, 3, 4, 5].map((n) => {
              const lit = (hoverStar ?? coachRating ?? 0) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} of 5: ${RATING_MEANING[n]}`}
                  aria-pressed={coachRating === n}
                  onMouseEnter={() => setHoverStar(n)}
                  onFocus={() => setHoverStar(n)}
                  onBlur={() => setHoverStar(null)}
                  // Clicking the current rating clears it. Nobody has judged is
                  // a real state and must stay reachable without a second
                  // control.
                  onClick={() => commit({ leadId, coachRating: coachRating === n ? null : n })}
                  className="rounded-small p-0.5 transition-transform duration-100 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-on-tertiary-container"
                >
                  <Star filled={lit} />
                </button>
              );
            })}
          </div>
          <span className="text-body-medium text-on-surface-variant">
            {hoverStar
              ? RATING_MEANING[hoverStar]
              : coachRating
                ? RATING_MEANING[coachRating]
                : "Not rated"}
          </span>
        </div>
      </fieldset>

      {/* --- linkedin ----------------------------------------------------- */}
      <div className="mt-5">
        <label htmlFor="coach-linkedin" className="text-body-medium text-on-surface-variant">
          LinkedIn profile
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            id="coach-linkedin"
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="linkedin.com/in/…"
            className="field min-w-0 flex-1"
          />
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="self-center whitespace-nowrap text-body-medium text-primary underline"
            >
              Open
            </a>
          )}
        </div>
        <p className="mt-1 text-body-medium text-on-surface-variant">
          Paste it however you copied it. The query string is stripped before saving, because
          LinkedIn appends parameters that identify whoever did the looking.
        </p>
      </div>

      {/* --- notes -------------------------------------------------------- */}
      <div className="mt-5">
        <label htmlFor="coach-notes" className="text-body-medium text-on-surface-variant">
          Notes
        </label>
        <textarea
          id="coach-notes"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Anything the answers do not say."
          className="field mt-1"
        />
        <p className="mt-1 text-body-medium text-on-surface-variant">
          One field, overwritten each time, so there is no history. Notes about a specific call go
          in the call log instead.
          {notesAt && (
            <>
              {" "}
              Last edited {new Date(notesAt).toLocaleDateString("en-GB")}
              {notesBy ? ` by ${notesBy}` : ""}.
            </>
          )}
        </p>
      </div>

      {error && <p role="alert" className="field-support-error mt-3">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={!dirty || state === "saving"}
          onClick={() =>
            commit({
              leadId,
              linkedinUrl: url.trim() || null,
              notes: text.trim() || null,
            })
          }
          className="btn-filled px-5 py-2 text-label-large"
        >
          Save
        </button>
        {dirty && <span className="text-body-medium text-on-surface-variant">Unsaved changes</span>}
      </div>
    </div>
  );
}

/** The rating star. Filled uses `warning`, the palette's amber, because the
 *  semantic colours are the only warm accent that is not Terracotta, and
 *  Terracotta is reserved for the one action per view. */
function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? "var(--color-warning)" : "none"}
      stroke={filled ? "var(--color-warning)" : "currentColor"}
      strokeWidth="1.6"
      strokeLinejoin="round"
      className={filled ? "" : "text-outline"}
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  );
}
