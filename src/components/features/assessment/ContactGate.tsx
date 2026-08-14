"use client";

/**
 * TASK-025/027: the contact step, and the last question of the survey.
 *
 * First name, last name, email, and at least one of LINE ID or phone. Email
 * keeps the magic link deliverable (FR-011); LINE or phone keeps the lead
 * actually reachable, because Thai candidates largely do not read email.
 *
 * **This runs BEFORE the result, reversing FR-004** (decided 10/08/2026). The
 * spec had the chart render with no contact field on screen, optimising for
 * people finishing. This optimises for every finisher being reachable, because
 * the full result now arrives through a conversation rather than a screen. It
 * carries the step counter and a full progress bar so it reads as the last
 * question rather than as a wall in front of the answer.
 *
 * FR-006 wants a separate consent per channel, each timestamped. A consent
 * checkbox appears next to a channel only once that channel has something in
 * it: asking permission to use a field the candidate left blank is noise, and
 * the server refuses a timestamp for an empty channel anyway.
 *
 * The client validates for immediate feedback only. `leads.captureContact` is
 * the authority, and it throws stable codes rather than sentences so the copy
 * stays translatable.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import ActionBar, { ActionBarSpacer } from "./ActionBar";
import { useCopy } from "@/components/LocaleProvider";
import { CONSENT_COPY, CONSENT_COPY_REVIEWED } from "@/lib/consent-copy";
import type { CopyKey } from "@/lib/content/copy";

const ERROR_KEYS = [
  "first_name_required",
  "last_name_required",
  "email_invalid",
  "channel_required",
  "consent_email",
  "consent_phone",
  "consent_line",
] as const;

export default function ContactGate({
  onSubmit,
  totalSteps,
}: {
  totalSteps: number;
  onSubmit: (values: {
    firstName: string;
    lastName: string;
    email: string;
    emailConsent: boolean;
    phone?: string;
    phoneConsent?: boolean;
    lineId?: string;
    lineConsent?: boolean;
  }) => Promise<void>;
}) {
  const { t, pick } = useCopy();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [lineId, setLineId] = useState("");
  const [phone, setPhone] = useState("");
  /**
   * One tick, not three. It still grants per channel: see `consent-copy.ts`
   * for why the field is the granular control and the checkbox is not.
   */
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<CopyKey | null>(null);
  const [busy, setBusy] = useState(false);

  // Same reason as QuestionCard: the last question can leave the window
  // scrolled down, and this screen opening mid-form hides the one thing it has
  // to explain, which is what the contact details are for.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Solid inputs on the panel, not translucent. From the 14/08/2026 design
  // pass: a form field is where someone is about to type, and a translucent
  // box with a gradient moving behind the caret is the one place in the app
  // where the material actively gets in the way.
  const field =
    "mt-1 h-12 w-full rounded-md border border-neutral-300 bg-surface px-4 text-body text-ink transition-colors focus:border-eufit focus:outline-none focus:ring-2 focus:ring-eufit/25";
  const labelText = "block text-caption text-neutral-500";

  const consentLabel = pick(CONSENT_COPY["consent.statement"]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Consent is checked here as well as on the server. Added 14/08/2026: it
    // was server-only, so a candidate who filled in a phone number and missed
    // the tick made a round trip to be told. The server checks stay exactly as
    // they are; this is the same rule stated earlier, not instead of.
    //
    // A consent tied to a filled field is NOT optional. The choice is whether
    // to give us the number at all; the tick is what makes holding it lawful.
    // So "phone entered, box unticked" is not a preference to respect, it is
    // an incomplete form.
    if (!consent) {
      setError("gate.error.consent_email");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        firstName,
        lastName,
        email,
        // The single tick fans back out to the per-channel flags. The server
        // contract and the per-channel timestamps are untouched: a channel that
        // was not filled in still sends `undefined` and still grants nothing.
        emailConsent: consent,
        phone: phone.trim() || undefined,
        phoneConsent: phone.trim() ? consent : undefined,
        lineId: lineId.trim() || undefined,
        lineConsent: lineId.trim() ? consent : undefined,
      });
    } catch (err) {
      // The server's code, mapped to translatable copy. Anything unrecognised
      // is a network or platform failure, not a rule the candidate broke.
      const code = err instanceof Error ? err.message : "";
      const matched = ERROR_KEYS.find((k) => code.includes(k));
      setError(`gate.error.${matched ?? "unknown"}` as CopyKey);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-md px-6 py-10">
      <div className="material rounded-lg px-5 py-6">
      <p className="mb-1 text-caption text-neutral-500">
        {t("assess.progress", { step: totalSteps, total: totalSteps })}
      </p>
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-neutral-300">
        <div className="h-full w-full rounded-full bg-eufit" />
      </div>
      <h1 className="text-h3">{t("gate.heading")}</h1>
      <p className="mt-2 text-body text-slate">{t("gate.body")}</p>

      {!CONSENT_COPY_REVIEWED && (
        <p className="mt-4 rounded-sm border border-warning bg-cream-wash px-4 py-3 text-caption text-ink">
          Consent copy below has not been legally reviewed (TASK-047), and still
          contains unresolved placeholders. Not for production.
        </p>
      )}

      <p className="mt-6 text-caption text-neutral-500">
        {pick(CONSENT_COPY["consent.purpose"])}{" "}
        <Link href="/privacy" className="text-eufit-deep underline">
          {pick(CONSENT_COPY["consent.privacyLink"])}
        </Link>
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className={labelText}>
          {t("gate.firstName")}
          <input
            className={field}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
          />
        </label>
        <label className={labelText}>
          {t("gate.lastName")}
          <input
            className={field}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            required
          />
        </label>
      </div>

      <label className={`mt-4 ${labelText}`}>
        {t("gate.email")}
        <input
          className={field}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <p className="mt-8 text-body text-slate">{t("gate.channelHint")}</p>

      <label className={`mt-4 ${labelText}`}>
        {t("gate.lineId")}
        <input
          className={field}
          value={lineId}
          onChange={(e) => setLineId(e.target.value)}
        />
      </label>

      <label className={`mt-4 ${labelText}`}>
        {t("gate.phone")}
        <input
          className={field}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </label>

      {/* One consent, after both channel fields so it can name what was
          actually filled in. Before them it would have to speak in
          hypotheticals, which is the wording that made three boxes feel
          necessary in the first place. */}
      <Consent checked={consent} onChange={setConsent} label={consentLabel} required />

      {/* `error`, never Terracotta: a problem must not look like an action. */}
      {error && (
        <p role="alert" className="mt-6 text-body text-error">
          {t(error)}
        </p>
      )}

      </div>

      <ActionBarSpacer />
      <ActionBar>
        <button
          type="submit"
          disabled={busy}
          className="min-h-14 w-full rounded-md bg-accent px-7 py-4 text-body-lg font-semibold text-on-accent transition-colors hover:bg-accent-bright disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          <span className="flex items-center justify-center gap-2">
            {busy ? t("gate.working") : t("gate.submit")}
            {!busy && <span aria-hidden>&rarr;</span>}
          </span>
        </button>
      </ActionBar>
    </form>
  );
}

/**
 * `required` is passed rather than assumed: the email consent is always
 * required, while phone and LINE become required only once their field has
 * something in it. The native attribute gives the browser's own blocking and
 * its own message in the user's language, before any of our validation runs.
 */
function Consent({
  checked,
  onChange,
  label,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="mt-2 flex items-start gap-3 text-caption text-slate">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-eufit"
      />
      <span>{label}</span>
    </label>
  );
}
