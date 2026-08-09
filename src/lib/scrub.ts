/**
 * TASK-007: PII scrubbing shared by all three Sentry runtimes.
 *
 * The assessment flow handles a full name, email, phone and LINE ID, so an
 * error thrown from inside a form can carry candidate contact data in its
 * message, its breadcrumbs or the request body. Everything here strips
 * aggressively and accepts false positives: losing a digit string from an error
 * report is cheap, leaking a candidate's phone number to a third-party service
 * is not. TASK-041 later verifies this against real assessment-flow errors, not
 * just synthetic ones.
 *
 * Names and LINE IDs have no pattern, so no regex can catch them. They are
 * covered only by the wholesale deletions below (`user`, `request.data`,
 * `extra`, breadcrumb `data`), which is where form values actually live. The
 * gap that leaves is an identity interpolated into an error string, so: never
 * put a candidate's name, LINE ID or email into a thrown message. Refer to a
 * lead by its document id.
 */

import type { ErrorEvent } from "@sentry/nextjs";

/** DSNs are client-visible by design; env var wins so a rotation needs no deploy. */
export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://88f97116f6fadca8b3b67c88ecdb82ee@o4511852989841408.ingest.de.sentry.io/4511852996919376";

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi;
// 8+ digit runs with common separators: catches Thai mobiles and EU numbers.
const PHONE = /\+?\d[\d\s().-]{6,}\d/g;

const clean = (s: string) => s.replace(EMAIL, "[email]").replace(PHONE, "[number]");

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  // Identity blocks are dropped wholesale, not cleaned.
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
  }
  delete event.extra;

  if (event.message) event.message = clean(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = clean(ex.value);
  }
  for (const b of event.breadcrumbs ?? []) {
    if (b.message) b.message = clean(b.message);
    // Breadcrumb data can carry form values (input events, fetch bodies).
    delete b.data;
  }
  return event;
}
