/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as consent from "../consent.js";
import type * as consentDb from "../consentDb.js";
import type * as consultations from "../consultations.js";
import type * as corrections from "../corrections.js";
import type * as crons from "../crons.js";
import type * as delivery from "../delivery.js";
import type * as erase from "../erase.js";
import type * as http from "../http.js";
import type * as importLeads from "../importLeads.js";
import type * as leads from "../leads.js";
import type * as marketing from "../marketing.js";
import type * as marketingSend from "../marketingSend.js";
import type * as notify from "../notify.js";
import type * as outcomes from "../outcomes.js";
import type * as rateLimits from "../rateLimits.js";
import type * as retention from "../retention.js";
import type * as scoring from "../scoring.js";
import type * as stats from "../stats.js";
import type * as subscribe from "../subscribe.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  consent: typeof consent;
  consentDb: typeof consentDb;
  consultations: typeof consultations;
  corrections: typeof corrections;
  crons: typeof crons;
  delivery: typeof delivery;
  erase: typeof erase;
  http: typeof http;
  importLeads: typeof importLeads;
  leads: typeof leads;
  marketing: typeof marketing;
  marketingSend: typeof marketingSend;
  notify: typeof notify;
  outcomes: typeof outcomes;
  rateLimits: typeof rateLimits;
  retention: typeof retention;
  scoring: typeof scoring;
  stats: typeof stats;
  subscribe: typeof subscribe;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
