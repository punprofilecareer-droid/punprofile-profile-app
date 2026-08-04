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
        if (!admin || email !== admin) {
          throw new ConvexError("Sign-up is not open.");
        }
        return { email };
      },
    }),
  ],
});
