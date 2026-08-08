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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center leading-normal">
      <AuthLoading>
        <p className="text-body text-neutral-500">Checking session...</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-body text-slate">
          Not signed in.{" "}
          <Link className="text-primary underline" href="/login">
            Go to sign-in
          </Link>
        </p>
      </Unauthenticated>
      <Authenticated>
        <h1 className="text-h2">Coach dashboard</h1>
        <p className="max-w-md text-body text-slate">
          Signed in. The lead list and detail views land here in Phase 2
          (TASK-034, TASK-035).
        </p>
        <button
          onClick={() => void signOut()}
          className="rounded-md border border-neutral-300 bg-surface px-5 py-2.5 text-label text-slate transition-colors hover:bg-neutral-100"
        >
          Sign out
        </button>
      </Authenticated>
    </div>
  );
}
