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
import {
  CONSENT_COPY,
  CONSENT_COPY_REVIEWED,
  MARKETING_CONSENT_COPY_REVIEWED,
} from "@/lib/consent-copy";
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
    /** Absent means the question was never put to them, which is not the same
     *  as a no and must not be recorded as one. */
    marketingConsent?: boolean;
  }) => Promise<void>;
}) {
  const { t, pick, path } = useCopy();
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
  /**
   * The second, separate tick: job digests and nurture, not "your result".
   *
   * Unticked by default and never required. Refusing it does not block the
   * form, which is what makes it consent rather than a second gate, and it is a
   * different question from the one above: `consent-copy.ts` explains why a
   * single tick covering both would make this unprovable.
   *
   * Rendered only when its Thai has been written and read back. Until then the
   * flag is false, the tick does not exist, and nobody is opted in to anything.
   */
  const [marketingConsent, setMarketingConsent] = useState(false);
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
  const field = "field mt-1";

  /*
   * Which field each error is about. Added 16/08/2026 after the audit found the
   * message rendering correctly and no field being marked at all: a screen
   * reader was told "please enter your name" with nothing to say which box, and
   * a sighted reader got a line of red under a form of five identical inputs.
   *
   * `channel_required` maps to both Line and phone deliberately. The rule is
   * "one of these two", so marking either one alone would be a lie about which
   * is wrong.
   */
  const ERROR_FIELD: Partial<Record<string, readonly string[]>> = {
    "gate.error.first_name_required": ["first"],
    "gate.error.last_name_required": ["last"],
    "gate.error.email_invalid": ["email"],
    "gate.error.channel_required": ["line", "phone"],
  };
  const invalid = (name: string) =>
    error && (ERROR_FIELD[error] ?? []).includes(name) ? true : undefined;
  /* One id, so every marked field points at the single live message. */
  const ERROR_ID = "gate-error";
  const labelText = "field-label";

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
    // Every rule the server enforces, checked here too and in the same order,
    // so the message is translated and nobody pays a round trip to be told
    // their name is blank. The server checks stay exactly as they are; these
    // are the same rules stated earlier, never instead of.
    if (!firstName.trim()) {
      setError("gate.error.first_name_required");
      return;
    }
    if (!lastName.trim()) {
      setError("gate.error.last_name_required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("gate.error.email_invalid");
      return;
    }
    if (!phone.trim() && !lineId.trim()) {
      setError("gate.error.channel_required");
      return;
    }
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
        // Only ever true when the tick was actually shown. If the copy gate is
        // closed the state is stuck at its initial false, so this cannot send a
        // grant for a question nobody was asked.
        marketingConsent: MARKETING_CONSENT_COPY_REVIEWED ? marketingConsent : undefined,
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
    // `noValidate` on purpose. The browser's own validation fires before this
    // form's handler and renders its own bubble, in the browser's language
    // rather than the candidate's: a Thai reader ticking nothing saw "Please
    // check this box if you want to proceed." Every rule below has a
    // translated message in the copy module, so the native layer can only
    // overwrite a correct message with an untranslatable one.
    <form
      onSubmit={submit}
      noValidate
      className="mx-auto w-full max-w-md px-6 py-10 large:max-w-4xl large:px-8 large:py-14"
    >
      <div className="card-outlined rounded-large px-5 py-6 large:px-8 large:py-9">
      <p className="mb-1 text-body-medium text-on-surface-variant">
        {t("assess.progress", { step: totalSteps, total: totalSteps })}
      </p>
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div className="h-full w-full rounded-full bg-tertiary" />
      </div>

      {/* Two columns from `lg`: what we are asking for and why on the left, the
          fields on the right. 16/08/2026, and it is the same argument as the
          first read's desktop layout. This is the highest-stakes screen in the
          flow, the one place a stranger hands over a phone number, and a 448px
          column of inputs floating in a 1440px window undercuts exactly the
          credibility the consent paragraph is trying to earn.

          It collapses to the phone order precisely: heading, why, then fields.
          Nothing is reordered, only placed. */}
      <div className="large:grid large:grid-cols-2 large:gap-10">
      <div>
      <h1 className="text-headline-small">{t("gate.heading")}</h1>
      <p className="mt-2 text-body-large text-on-surface-variant">{t("gate.body")}</p>

      {!CONSENT_COPY_REVIEWED && (
        <p className="mt-4 rounded-small border border-warning bg-warning-container px-4 py-3 text-body-medium text-on-warning-container">
          Consent copy below has not been legally reviewed (TASK-047), and still
          contains unresolved placeholders. Not for production.
        </p>
      )}

      <p className="mt-6 text-body-medium text-on-surface-variant">
        {pick(CONSENT_COPY["consent.purpose"])}{" "}
        <Link href={path("/privacy")} className="text-on-tertiary-container underline">
          {pick(CONSENT_COPY["consent.privacyLink"])}
        </Link>
      </p>
      </div>

      <div>
      <div className="mt-6 grid gap-4 medium:grid-cols-2 large:mt-0">
        <label className={labelText}>
          {t("gate.firstName")}
          <input
            className={field}
            aria-invalid={invalid("first")}
            aria-describedby={invalid("first") ? ERROR_ID : undefined}
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
            aria-invalid={invalid("last")}
            aria-describedby={invalid("last") ? ERROR_ID : undefined}
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
          aria-invalid={invalid("email")}
          aria-describedby={invalid("email") ? ERROR_ID : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <p className="mt-8 text-body-large text-on-surface-variant">{t("gate.channelHint")}</p>

      <label className={`mt-4 ${labelText}`}>
        {t("gate.lineId")}
        <input
          className={field}
          aria-invalid={invalid("line")}
          aria-describedby={invalid("line") ? ERROR_ID : undefined}
          value={lineId}
          onChange={(e) => setLineId(e.target.value)}
        />
      </label>

      <label className={`mt-4 ${labelText}`}>
        {t("gate.phone")}
        <input
          className={field}
          type="tel"
          aria-invalid={invalid("phone")}
          aria-describedby={invalid("phone") ? ERROR_ID : undefined}
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

      {/* The optional marketing tick. Hidden until its Thai exists: the copy in
          `consent-copy.ts` is machine-written and marked not for release, and a
          consent screen is the last place a placeholder should be able to
          appear by accident. Flipping `MARKETING_CONSENT_COPY_REVIEWED` is the
          only thing that turns it on. */}
      {MARKETING_CONSENT_COPY_REVIEWED && (
        <Consent
          checked={marketingConsent}
          onChange={setMarketingConsent}
          label={pick(CONSENT_COPY["consent.marketing"])}
        />
      )}

      {/* `error`, never Terracotta: a problem must not look like an action. */}
      {error && (
        <p id={ERROR_ID} role="alert" className="field-support-error mt-6">
          {t(error)}
        </p>
      )}
      </div>
      </div>

      </div>

      <ActionBarSpacer />
      <ActionBar>
        <button
          type="submit"
          disabled={busy}
          className="min-h-14 w-full btn-filled px-7 py-4 text-body-large font-semibold"
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
    <label className="mt-2 flex items-start gap-3 text-body-medium text-on-surface-variant">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox mt-0.5"
      />
      <span>{label}</span>
    </label>
  );
}
