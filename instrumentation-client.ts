// TASK-007, browser runtime. Loaded automatically by Next.js.
import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN, scrubEvent } from "./src/lib/scrub";

Sentry.init({
  dsn: SENTRY_DSN,
  // Error tracking only: tracing off keeps the free tier roomy and the
  // client bundle lean. PRD scope is "catch production issues", not APM.
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
