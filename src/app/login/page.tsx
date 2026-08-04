"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * TASK-004: the admin sign-in screen. Deliberately plain (design.md is a
 * PENDING stub) and deliberately quiet about what it is: candidates never see
 * a link here, and sign-up is refused server-side for any email but the
 * admin's, so the "first time" button is safe to show.
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
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit("signIn", e.currentTarget);
        }}
      >
        <h1 className="text-xl font-semibold">Coach sign-in</h1>
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded border border-black/[.15] bg-transparent px-3 py-2 dark:border-white/[.2]"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-black/[.15] bg-transparent px-3 py-2 dark:border-white/[.2]"
          />
        </label>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {busy ? "Working..." : "Sign in"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            const form = e.currentTarget.closest("form");
            if (form?.reportValidity()) void submit("signUp", form);
          }}
          className="w-full rounded border border-black/[.15] px-3 py-2 text-sm disabled:opacity-50 dark:border-white/[.2]"
        >
          First time: create the admin account
        </button>
      </form>
    </div>
  );
}
