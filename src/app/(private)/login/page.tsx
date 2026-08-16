"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * TASK-004: the admin sign-in screen. Deliberately quiet about what it is:
 * candidates never see a link here, and sign-up is refused server-side for any
 * email but the admin's, so the "first time" button is safe to show.
 *
 * Latin-only, so it opts into the system's body line-height of 1.5 rather than
 * the Thai-first 1.6 the app's base carries. Components follow `design.md`.
 */
export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(flow: "signIn" | "signUp", form: HTMLFormElement) {
    const data = new FormData(form);
    data.set("flow", flow);
    setBusy(true);
    setError(null);
    try {
      await signIn("password", data);
      router.push("/admin");
    } catch (err) {
      // Report the actual cause. This used to attribute every sign-up failure
      // to a wrong email, so a password one character short read as "you are
      // not the admin", which is a false statement and sends you looking in
      // the wrong place.
      const raw = err instanceof Error ? err.message : "";
      setError(reasonFor(raw, flow));
      setBusy(false);
    }
  }

  function reasonFor(raw: string, flow: "signIn" | "signUp"): string {
    if (raw.includes("Invalid password")) {
      return "That password is too short. It needs at least 8 characters.";
    }
    if (raw.includes("admin_email_unset")) {
      return "No admin email is configured on this deployment, so no account can be created. Set ADMIN_EMAIL in the Convex environment first.";
    }
    if (raw.includes("not_admin_email")) {
      return "That is not the configured admin address. Only one email can register.";
    }
    if (raw.includes("InvalidAccountId") || raw.includes("already")) {
      return "That account already exists. Use Sign in rather than the first-time button.";
    }
    return flow === "signIn"
      ? "That didn't work. Check the email and password, or use the first-time button if the account doesn't exist yet."
      : "Could not create the account. Check the browser console for the underlying error.";
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16 leading-normal">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit("signIn", e.currentTarget);
        }}
      >
        <h1 className="text-headline-small">Coach sign-in</h1>
        <label className="field-label">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="field mt-1"
          />
        </label>
        <label className="field-label">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="field mt-1"
          />
          <span className="mt-1 block text-body-medium font-normal text-on-surface-variant">
            At least 8 characters.
          </span>
        </label>
        {/* `error`, never Terracotta: a problem must not look like an action. */}
        {error && <p role="alert" className="field-support-error">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full btn-filled px-7 text-label-large"
        >
          {busy ? "Working..." : "Sign in"}
        </button>
        {/* button-secondary: matters, but must not compete with the primary. */}
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            const form = e.currentTarget.closest("form");
            if (form?.reportValidity()) void submit("signUp", form);
          }}
          className="btn-tonal h-12 w-full px-7 text-label-large"
        >
          First time: create the admin account
        </button>
      </form>
    </div>
  );
}
