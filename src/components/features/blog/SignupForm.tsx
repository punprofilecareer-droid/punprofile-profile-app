"use client";

/**
 * The blog's email capture. 16/08/2026.
 *
 * Asked for after a look at the reference blog, and it is the one thing on that
 * page the first build deliberately refused. `convex/subscribe.ts` carries the
 * reasoning for why it is buildable now and was not on 14/08/2026. In short:
 * the consent log records a `marketing` purpose, withdrawal exists, and the
 * privacy notice covers it.
 *
 * **It renders only when `MARKETING_CONSENT_COPY_REVIEWED` is true**, which is
 * the same gate the contact step's tick sits behind and the same gate the
 * privacy notice's marketing section sits behind. One flag, one fact: whether
 * Paul has read the Thai. Nothing collects an address until he has.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS NOT COPIED FROM THE REFERENCE
 * ---------------------------------------------------------------------------
 *
 * **The cadence promise.** Theirs says "One insight a week". There is no send
 * schedule and no `RESEND_API_KEY` on either deployment, so a weekly promise is
 * the one thing on this page that would be a lie rather than a plan. The line
 * under the button names the payload and the limit instead.
 *
 * **The colour.** Theirs is a black button with yellow type on cream. Terracotta
 * is this system's single primary action per view and it is already spent at
 * the foot of the page by `CallToAction`, so this button is `primary` Teal,
 * which `design.md` reserves for "everything else that needs emphasis". Two
 * Terracotta buttons on one page is the exact failure that rule exists to stop.
 *
 * ---------------------------------------------------------------------------
 * THE STATES
 * ---------------------------------------------------------------------------
 *
 * Four, and the success state replaces the form rather than sitting under it. A
 * form still standing after a successful submit invites a second one, and the
 * mutation deliberately does nothing on a repeat, so the second press would
 * report success and change nothing. Better not to offer it.
 *
 * The consent sentence sits ABOVE the button, not below it. What someone is
 * agreeing to has to be readable before the act that agrees to it, and a
 * sentence under a button is read after the tap or not at all.
 */

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import { useCopy } from "@/components/LocaleProvider";
import { CONSENT_COPY, MARKETING_CONSENT_COPY_REVIEWED } from "@/lib/consent-copy";
import {
  SIGNUP_BAD_EMAIL,
  SIGNUP_BUSY,
  SIGNUP_BUTTON,
  SIGNUP_CONSENT,
  SIGNUP_DONE,
  SIGNUP_LABEL,
  SIGNUP_NOTE,
  SIGNUP_PLACEHOLDER,
} from "@/lib/content/blog";

type State = "idle" | "sending" | "done" | "bad_email" | "busy";

export default function SignupForm() {
  const { pick, path } = useCopy();
  const subscribe = useMutation(api.subscribe.subscribe);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  if (!MARKETING_CONSENT_COPY_REVIEWED) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      await subscribe({ email });
      setState("done");
    } catch (err) {
      // `email_invalid` is the one the reader can fix, so it gets its own
      // message. Everything else, rate limit or network, gets the same "try
      // again" line: the difference between them is not actionable and naming
      // it would only tell a script which wall it hit.
      const code = err instanceof ConvexError ? String(err.data) : "";
      setState(code === "email_invalid" ? "bad_email" : "busy");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-8 max-w-xl text-body-large text-on-primary-container">{pick(SIGNUP_DONE)}</p>
    );
  }

  return (
    <div className="mt-8 max-w-xl">
      <p className="text-body-medium text-on-surface-variant">
        {pick(SIGNUP_CONSENT)}{" "}
        <Link
          href={path("/privacy")}
          className="text-primary underline underline-offset-2"
        >
          {pick(CONSENT_COPY["consent.privacyLink"])}
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="blog-signup-email">
          {pick(SIGNUP_LABEL)}
        </label>
        <input
          id="blog-signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "bad_email" || state === "busy") setState("idle");
          }}
          placeholder={SIGNUP_PLACEHOLDER}
          aria-invalid={state === "bad_email"}
          aria-describedby="blog-signup-note"
          // `input` from `design.md`: 48px, `rounded.sm`, and the focus ring is
          // the accent one the base layer already puts on every focusable.
          className="field min-w-0 flex-1"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          // `btn-contrast` because this form sits on the brand lime hero, a fixed
          // ground outside the role system. A tonal button measures 1.08 there
          // and its shape disappears; `inverse-surface` measures 11.06.
          className="btn-contrast inline-flex h-12 shrink-0 items-center justify-center px-7 text-label-large"
        >
          {pick(SIGNUP_BUTTON)}
        </button>
      </form>

      <p id="blog-signup-note" className="mt-3 text-body-medium text-on-surface-variant">
        {pick(SIGNUP_NOTE)}
      </p>

      {(state === "bad_email" || state === "busy") && (
        <p role="alert" className="field-support-error mt-3">
          {pick(state === "bad_email" ? SIGNUP_BAD_EMAIL : SIGNUP_BUSY)}
        </p>
      )}
    </div>
  );
}
