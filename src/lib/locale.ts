/**
 * The TH/EN locale, and the one rule for resolving a string.
 *
 * Thai is the default because the audience is Thai. English is the fallback
 * for any string whose Thai has not been supplied yet, which is the same rule
 * `questions.ts` states for question copy: an empty `th` means "not yet
 * reviewed", never "identical in both".
 *
 * Deliberately no URL segment. Next's own guide recommends `app/[lang]/`
 * routing, but that moves every route and grows locale logic inside the Convex
 * Auth wrapper in `middleware.ts` that guards `/admin`. For a client-side
 * funnel entered from a Facebook link, a cookie buys the same thing without
 * touching the auth path. If per-locale URLs are ever needed for SEO, nothing
 * in this file or `copy.ts` has to change.
 */

import { COPY } from "./content/copy";
import type { Copy, CopyKey } from "./content/copy";

export const LOCALES = ["th", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "th";

/** Read server-side in the root layout, written client-side by the toggle. */
export const LOCALE_COOKIE = "punprofile.locale";

export const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/** Resolve any `{ en, th }` pair, including question and option copy. */
export function pick(copy: Copy, locale: Locale): string {
  return locale === "th" ? copy.th || copy.en : copy.en;
}

/**
 * Resolve a key from `COPY`. `vars` substitutes `{name}` placeholders, which
 * only the step counter uses today.
 */
export function t(
  key: CopyKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  let out = pick(COPY[key], locale);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.replaceAll(`{${name}}`, String(value));
    }
  }
  return out;
}
