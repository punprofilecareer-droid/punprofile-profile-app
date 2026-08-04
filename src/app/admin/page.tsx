"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";

/**
 * TASK-004: the authenticated admin shell. Middleware redirects anonymous
 * visitors to /login before this renders; the Unauthenticated branch is the
 * belt-and-braces fallback for a stale session. The actual lead dashboard
 * lands here with TASK-034.
 */
export default function AdminPage() {
  const { signOut } = useAuthActions();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <AuthLoading>
        <p className="text-sm text-zinc-500">Checking session...</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-sm">
          Not signed in. <Link className="underline" href="/login">Go to sign-in</Link>
        </p>
      </Unauthenticated>
      <Authenticated>
        <h1 className="text-2xl font-semibold tracking-tight">Coach dashboard</h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Signed in. The lead list and detail views land here in Phase 2
          (TASK-034, TASK-035).
        </p>
        <button
          onClick={() => void signOut()}
          className="rounded border border-black/[.15] px-3 py-1.5 text-sm dark:border-white/[.2]"
        >
          Sign out
        </button>
      </Authenticated>
    </div>
  );
}
