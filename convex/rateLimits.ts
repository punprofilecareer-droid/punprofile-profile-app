import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * TASK-039, PRD § 7 Security: throttle the two endpoints that let an anonymous
 * caller write to the database.
 *
 * **What can and cannot be keyed.** A Convex mutation has no request context,
 * so there is no client IP to key on, and a client-supplied fingerprint is
 * trivially forged. That leaves:
 *
 *   - `startSession` has no session yet, by definition, so it can only be
 *     limited globally.
 *   - `captureContact` has a `leadId` the server issued, so it can be limited
 *     per lead.
 *
 * A global limit trades an abuse problem for an availability one: a flood locks
 * out real candidates too. Sizing it is therefore about page loads, not
 * completions, and since 10/08/2026 the client stores nothing on the device, so
 * every visit and every refresh starts a new session. One curious person
 * hitting reload must not be able to lock out a Facebook post's worth of
 * traffic.
 *
 * **This makes per-IP limiting at the edge more necessary, not less.** A global
 * bucket loose enough to be safe for real users is also loose enough for a
 * script to sit under. The backstop below bounds the damage; it does not
 * prevent it, and Next middleware or the host is where the real fix belongs.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  /**
   * New anonymous sessions, globally. Deliberately generous: a post landing a
   * hundred visitors in an hour is a good day, not an attack, and refusing them
   * would cost more than the junk rows a script would write.
   */
  startSession: { kind: "token bucket", rate: 600, period: HOUR, capacity: 100 },

  /**
   * Contact submissions per lead. Generous enough to absorb a genuine retry
   * after a validation error, tight enough that one session cannot be used to
   * hammer the endpoint.
   */
  captureContact: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 5 },
});
