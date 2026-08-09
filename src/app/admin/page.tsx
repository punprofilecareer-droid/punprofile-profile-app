"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import LeadList from "@/components/features/dashboard/LeadList";

/**
 * TASK-004/034: the authenticated admin shell and the lead list.
 *
 * Middleware redirects anonymous visitors to /login before this renders, and
 * the Unauthenticated branch is the belt-and-braces fallback for a stale
 * session. Neither is the security boundary: `requireAdmin` in
 * `convex/leads.ts` is, because a direct call to a Convex query never passes
 * through either of them.
 */
export default function AdminPage() {
  const { signOut } = useAuthActions();
  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-6 py-16 text-center leading-normal">
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
        <div className="w-full max-w-3xl text-left">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-h2">Coach dashboard</h1>
            <button
              onClick={() => void signOut()}
              className="shrink-0 rounded-md border border-neutral-300 bg-surface px-5 py-2.5 text-label text-slate transition-colors hover:bg-neutral-100"
            >
              Sign out
            </button>
          </div>
          <div className="mt-8">
            <LeadList />
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
