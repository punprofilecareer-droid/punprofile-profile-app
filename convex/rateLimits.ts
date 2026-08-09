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
 * out real candidates too. That is acceptable here only because of the volume.
 * The 90-day target is roughly 300 starts in total, so 120 per hour is about
 * two orders of magnitude above real traffic while still stopping a script
 * dead. Revisit the number if the funnel ever gets busy, and note that true
 * per-IP limiting belongs at the edge (Next middleware or the host), not here.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  /**
   * New anonymous sessions, globally. `capacity` allows a burst, so a class of
   * students opening the link together is not refused, while a script still
   * exhausts the hour's budget in seconds and then waits.
   */
  startSession: { kind: "token bucket", rate: 120, period: HOUR, capacity: 20 },

  /**
   * Contact submissions per lead. Generous enough to absorb a genuine retry
   * after a validation error, tight enough that one session cannot be used to
   * hammer the endpoint.
   */
  captureContact: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 5 },
});
