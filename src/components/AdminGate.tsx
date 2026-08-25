"use client";

/**
 * The sign-in gate on the admin screens, with a development bypass.
 *
 * Neither this nor the proxy redirect is the security boundary. `requireAdmin`
 * in `convex/leads.ts` is, because a direct call to a Convex function passes
 * through neither. That is what makes this component safe to short-circuit: if
 * `NEXT_PUBLIC_DEV_ADMIN_BYPASS` were ever set on a production build, the page
 * shell would render and then every query on it would throw "Not authorised",
 * because the server switch is separate and is scoped to a named deployment.
 *
 * Two variables rather than one is the point. Opening this up takes deliberate
 * action in two places, and getting only one of them wrong fails safe: the
 * server alone leaves the UI asking for a login, the client alone leaves an
 * empty screen full of errors.
 */

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";

export const DEV_ADMIN_BYPASS = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === "1";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  if (DEV_ADMIN_BYPASS) {
    return (
      <>
        {/* Loud on purpose. A bypass you cannot see is one you forget is on,
            and this screen looks identical either way. */}
        <p className="mb-6 rounded-small border border-warning bg-warning-container px-4 py-3 text-body-medium text-on-warning-container">
          Sign-in bypassed for local development. This is not a production
          configuration, and the server still refuses every query unless
          <code className="mx-1">DEV_ADMIN_BYPASS</code> names this exact
          deployment.
        </p>
        {children}
      </>
    );
  }

  return (
    <>
      <AuthLoading>
        <p className="text-body-large text-on-surface-variant">Checking session...</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-body-large text-on-surface-variant">
          Not signed in.{" "}
          <Link className="text-on-primary underline" href="/login">
            Go to sign-in
          </Link>
        </p>
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}
