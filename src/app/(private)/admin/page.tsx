"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import AdminGate, { DEV_ADMIN_BYPASS } from "@/components/AdminGate";
import LeadList from "@/components/features/dashboard/LeadList";

/**
 * TASK-004/034: the authenticated admin shell and the lead list.
 *
 * Proxy redirects anonymous visitors to /login before this renders, and
 * `AdminGate` is the belt-and-braces fallback for a stale session. Neither is
 * the security boundary: `requireAdmin` in `convex/leads.ts` is, because a
 * direct call to a Convex query never passes through either of them.
 */
export default function AdminPage() {
  const { signOut } = useAuthActions();
  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-6 py-16 text-center leading-normal">
      <div className="w-full max-w-3xl text-left">
        <AdminGate>
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-headline-large">Coach dashboard</h1>
            {/* Nothing to sign out of when the session was never required. */}
            {!DEV_ADMIN_BYPASS && (
              <button
                onClick={() => void signOut()}
                className="btn-outlined shrink-0 px-5 py-2.5 text-label-large hover:bg-surface-container"
              >
                Sign out
              </button>
            )}
          </div>
          <div className="mt-8">
            <LeadList />
          </div>
        </AdminGate>
      </div>
    </div>
  );
}
