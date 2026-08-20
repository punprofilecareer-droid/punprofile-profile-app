/**
 * Who counts as an admin, in one place.
 *
 * TASK-004 shipped a single-admin app: one `ADMIN_EMAIL`, compared in two
 * places, and the word "single" written into the comments around both. Adding
 * a second coach (20/08/2026) turns that constant into a list, and the list has
 * to be read identically by the sign-up gate in `auth.ts` and the server
 * boundary in `leads.ts`, because those two disagreeing is the failure mode
 * where an account can be created that every query then refuses.
 *
 * So both import from here and neither parses the variable itself.
 *
 * `ADMIN_EMAILS` is comma-separated. `ADMIN_EMAIL` stays readable as a
 * fallback, and that is deliberate rather than tidy: the code deploys through
 * Vercel's build step before anyone touches the Convex environment, so a
 * version that only understood `ADMIN_EMAILS` would lock Paul out of his own
 * dashboard in the window between the two. `ADMIN_EMAIL` also keeps a second,
 * unrelated job in `notify.ts` as the new-lead alert recipient; access and
 * alert routing are separate on purpose, so adding an admin never silently
 * changes who gets emailed.
 *
 * Empty list means nobody. It never means everybody.
 */

/** Every address allowed to hold an admin account, lower-cased and de-duped. */
export function adminEmails(): string[] {
  const raw = [process.env.ADMIN_EMAILS ?? "", process.env.ADMIN_EMAIL ?? ""]
    .filter((value) => value.trim().length > 0)
    .join(",");

  const seen = new Set<string>();
  for (const entry of raw.split(",")) {
    const email = entry.trim().toLowerCase();
    if (email) seen.add(email);
  }
  return [...seen];
}

/**
 * Membership test. Takes whatever the caller has, including `undefined` from a
 * user record with no email, and answers false rather than throwing.
 */
export function isAdminEmail(email: unknown): boolean {
  const candidate = String(email ?? "").trim().toLowerCase();
  if (!candidate) return false;
  return adminEmails().includes(candidate);
}
