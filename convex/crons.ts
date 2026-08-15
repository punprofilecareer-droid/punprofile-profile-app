/**
 * Scheduled jobs. TASK-080.
 *
 * One job, and it is the retention sweep. Runs daily rather than monthly so a
 * record is never much more than a day past its promised expiry, and so a
 * problem surfaces the next morning rather than four weeks later.
 *
 * **It runs with `apply: true`, which is the whole point**, and the safety is
 * inside `retention.sweep`: it refuses outright rather than truncating if more
 * records are due than the per-run cap, it never touches a live engagement or a
 * placement, and it writes a `deletionLog` row for every run that deletes
 * anything.
 *
 * Nothing falls due until July 2027 on current data, so this will do nothing at
 * all for a long time. That is the correct behaviour for a promise being kept
 * rather than a job being useful.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "retention sweep",
  // Early morning Europe/Berlin, which is the middle of the night in Thailand.
  // Nothing a candidate does should race a deletion.
  { hourUTC: 2, minuteUTC: 15 },
  internal.retention.sweep,
  { apply: true },
);

export default crons;
