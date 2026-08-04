/**
 * Server-side score computation — `prd.md` § 2 Repository Structure.
 *
 * Deliberately thin. The scoring logic itself lives in `src/lib/scoring.ts`
 * because three callers need it and only one of them is Convex: the mutation
 * below, the client's optimistic teaser render, and the offline report
 * generator in `scripts/`. Duplicating it here would guarantee the app and the
 * reports eventually disagree about what a candidate scored.
 *
 * `leads.submitAnswer` (TASK-015) calls `computeScores` after merging an answer
 * into `responses`, and writes the result to the lead's denormalised `scores`
 * field in the same write — per PRD § 3, that denormalisation is what lets
 * Convex's reactive queries push updated chart data with no extra round-trip.
 */

import { scoreResponse } from "../src/lib/scoring.js";
import type { ScoringInput } from "../src/lib/scoring.js";
import type { DimensionKey } from "../src/lib/model.js";

/** The shape stored on `leads.scores`, matching the schema in `prd.md` § 3. */
export type StoredScores = Partial<Record<DimensionKey, number>>;

/**
 * Reduces a full profile to the four dimension means the schema stores.
 *
 * The per-competency detail is intentionally not persisted: it is a pure
 * function of `responses`, so storing it would create a second source of truth
 * that goes stale the moment a lookup table changes. The full result screen and
 * the admin lead detail both recompute it on read via `scoreResponse`.
 */
export function computeScores(response: ScoringInput): StoredScores {
  const profile = scoreResponse(response);
  const out: StoredScores = {};
  for (const d of profile.dimensions) {
    if (d.score !== null) out[d.key] = d.score;
  }
  return out;
}

/**
 * Coverage per dimension, 0-1. Not stored — the result screen needs it to render
 * the confidence band beside each score, and it is cheap to recompute.
 */
export function computeCoverage(response: ScoringInput): Record<DimensionKey, number> {
  const profile = scoreResponse(response);
  return Object.fromEntries(profile.dimensions.map((d) => [d.key, d.coverage])) as Record<DimensionKey, number>;
}

export { scoreResponse };
export type { ScoringInput };
