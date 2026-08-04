// TASK-007, Node runtime. Imported by instrumentation.ts.
import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN, scrubEvent } from "./src/lib/scrub";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubEvent,
});
