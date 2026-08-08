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
    } catch {
      setError(
        flow === "signIn"
          ? "That didn't work. Check the email and password, or use the first-time button if the account doesn't exist yet."
          : "Could not create the account. Only the configured admin email can register.",
      );
      setBusy(false);
    }
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
        <h1 className="text-h3">Coach sign-in</h1>
        <label className="block text-label text-slate">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 h-12 w-full rounded-sm border border-neutral-300 bg-surface px-4 py-3 text-body text-ink"
          />
        </label>
        <label className="block text-label text-slate">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 h-12 w-full rounded-sm border border-neutral-300 bg-surface px-4 py-3 text-body text-ink"
          />
        </label>
        {/* `error`, never Terracotta: a problem must not look like an action. */}
        {error && <p className="text-body text-error">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-md bg-accent px-7 text-label text-on-accent transition-colors hover:bg-accent-bright disabled:bg-neutral-300 disabled:text-neutral-500"
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
          className="h-12 w-full rounded-md bg-primary px-7 text-label text-on-primary transition-colors hover:bg-primary-deep disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          First time: create the admin account
        </button>
      </form>
    </div>
  );
}
