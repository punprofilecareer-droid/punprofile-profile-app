import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { adminEmails, isAdminEmail } from "./adminEmails";

/**
 * TASK-004: coach authentication, allowlisted.
 *
 * Password sign-in, with account creation gated to the admin allowlist. The
 * gate lives in `profile`, which runs when an account would be created, so
 * there is no public sign-up path at all rather than a hidden one. Candidates
 * are never users; they are `leads` reached by magic link (Phase 2), which is
 * a separate mechanism on purpose.
 *
 * The allowlist is `ADMIN_EMAILS`, a Convex deployment env var set by
 * `scripts/setup-auth.mjs`. It is read through `adminEmails.ts` rather than
 * here, so this gate and `requireAdmin` in `leads.ts` can never disagree about
 * who is allowed in. Two admins as of 20/08/2026; the shape does not care how
 * many.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        // Distinct causes, distinct errors. These previously shared one
        // message, so a deployment with no admin address set was
        // indistinguishable from someone typing the wrong one, and both were
        // reported by the UI as the latter.
        if (adminEmails().length === 0) throw new ConvexError("admin_email_unset");
        if (!isAdminEmail(email)) throw new ConvexError("not_admin_email");
        return { email };
      },
    }),
  ],
});
