import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

/**
 * TASK-004: single-admin authentication.
 *
 * Password sign-in, with account creation gated to ADMIN_EMAIL. The gate lives
 * in `profile`, which runs when an account would be created, so there is no
 * public sign-up path at all rather than a hidden one. Candidates are never
 * users; they are `leads` reached by magic link (Phase 2), which is a separate
 * mechanism on purpose.
 *
 * ADMIN_EMAIL is a Convex deployment env var, set by `scripts/setup-auth.mjs`.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        const admin = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
        // Distinct causes, distinct errors. These previously shared one
        // message, so a deployment with no ADMIN_EMAIL set was indistinguishable
        // from someone typing the wrong address, and both were reported by the
        // UI as the latter.
        if (!admin) throw new ConvexError("admin_email_unset");
        if (email !== admin) throw new ConvexError("not_admin_email");
        return { email };
      },
    }),
  ],
});
