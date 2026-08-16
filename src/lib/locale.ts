/**
 * The TH/EN locale, and the one rule for resolving a string.
 *
 * Thai is the default because the audience is Thai. English is the fallback
 * for any string whose Thai has not been supplied yet, which is the same rule
 * `questions.ts` states for question copy: an empty `th` means "not yet
 * reviewed", never "identical in both".
 *
 * ---------------------------------------------------------------------------
 * ENGLISH GOT A URL. 16/08/2026.
 * ---------------------------------------------------------------------------
 *
 * This file used to say there was deliberately no URL segment, that a cookie
 * bought the same thing for a funnel entered from a Facebook link, and that "if
 * per-locale URLs are ever needed for SEO, nothing in this file or `copy.ts` has
 * to change". They were needed, on Paul's call, and that last sentence held:
 * `copy.ts` was not touched.
 *
 * **The shape is Thai at the root, English under `/en`.** Not `/th` and `/en`,
 * which is what Next's own guide describes, and the difference is the whole
 * design:
 *
 * - **Every published link keeps working, unchanged.** `00_Quick_Facts.md`
 *   carries the app URL with its `?src=fb&job=` attribution parameters, and it
 *   has been posted to the group daily for weeks. A `/th` prefix would have
 *   turned all of that into redirects. Redirects mostly work. Mostly is a poor
 *   trade for a benefit that is entirely about a language this audience does not
 *   read.
 * - **`/admin` and `/login` do not move**, so `src/proxy.ts` and its
 *   `/admin(.*)` matcher are untouched, and the Convex Auth wrapper never learns
 *   what a locale is. That was the stated reason this was avoided in the first
 *   place, and it is the risk this shape removes rather than manages.
 * - A top-level `[lang]` segment would also have collided with `/admin`, because
 *   `/admin` matches `[lang]` with `lang` set to "admin".
 *
 * The cost is that the English tree is a set of thin re-export files under
 * `src/app/(en)/en/`, one per page. They are two or three lines each and they
 * exist because Next allows exactly one `<html>` per render, from a root layout,
 * and `<html lang>` has to be honest about which language the page is in. The
 * three root layouts, `(th)`, `(en)` and `(private)`, are what that buys.
 *
 * The cookie did not go away. It still decides which tree a returning visitor is
 * sent to from a bare link, and the toggle still writes it. What changed is that
 * the URL now wins over it, which is what makes a page indexable in one language
 * rather than in whichever one the last reader happened to pick.
 */

import { COPY } from "./content/copy";
import type { Copy } from "./content/copy";
import { NARRATIVE_COPY } from "./content/narrative-copy";
import { CONSENT_COPY } from "./consent-copy";

/**
 * Every keyed bank, resolved through one lookup. Split across files by who
 * reviews them (UI chrome, the result narrative, PDPA text with its own legal
 * gate) rather than by how they are read.
 */
export const ALL_COPY = {
  ...COPY,
  ...NARRATIVE_COPY,
  ...CONSENT_COPY,
} as const;

export type AnyCopyKey = keyof typeof ALL_COPY;

export const LOCALES = ["th", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "th";

/** Read server-side in the root layout, written client-side by the toggle. */
export const LOCALE_COOKIE = "punprofile.locale";

/**
 * The one non-default locale's URL prefix. Thai has none, which is the point.
 *
 * Named once here and imported everywhere else, so the string "/en" appears in
 * this file and in the folder name `src/app/(en)/en/` and nowhere a third time.
 */
export const EN_PREFIX = "/en";

/**
 * A root-relative path, moved into the tree for a locale.
 *
 * Every internal link in the app is written as its Thai path, `/services`,
 * `/blog/x`, and passed through this at render. That keeps the link tables in
 * `nav.ts`, `footer.ts`, `cta.ts` and `faq.ts` free of locale entirely: a link
 * is a destination, and which language it is read in is a property of the
 * reader, not of the table.
 *
 * Query strings and fragments survive, because `/services?focus=employability`
 * is a real link the result screen builds, and losing its parameter would send
 * a candidate to a page that no longer points at their own chart.
 */
export function localePath(href: string, locale: Locale): string {
  // Anything that is not a path of ours is returned untouched: mailto, tel, a
  // LINE deep link, an absolute URL. A prefix on any of those is a broken link.
  if (locale === DEFAULT_LOCALE || !href.startsWith("/")) return href;
  return `${EN_PREFIX}${href === "/" ? "" : href}`;
}

/**
 * The inverse, for the language toggle: which Thai path is this English one.
 *
 * `/en` alone maps to `/`, and `/en/services` to `/services`. Anything already
 * unprefixed is returned as it is, so calling this twice is safe.
 */
export function stripLocale(path: string): string {
  if (path === EN_PREFIX) return "/";
  return path.startsWith(`${EN_PREFIX}/`) ? path.slice(EN_PREFIX.length) : path;
}

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
  key: AnyCopyKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  let out = pick(ALL_COPY[key], locale);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.replaceAll(`{${name}}`, String(value));
    }
  }
  return out;
}
