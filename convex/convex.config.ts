import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

/**
 * TASK-039. The rate limiter is a component rather than a counter table on
 * purpose: hand-rolled window scans race under concurrency and lose quota when
 * the calling mutation fails, per the Convex guidelines.
 */
const app = defineApp();
app.use(rateLimiter);

export default app;
