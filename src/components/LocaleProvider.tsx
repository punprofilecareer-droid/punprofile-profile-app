"use client";

/**
 * Holds the live locale for the candidate-facing surfaces.
 *
 * The initial value comes from the server, which read the cookie during render,
 * so the first paint is already in the right language. Switching afterwards is
 * pure client state: no navigation, no server round trip, and the cookie is
 * written only so the next visit starts correctly.
 */

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, localePath, t } from "@/lib/locale";
import type { Locale } from "@/lib/locale";
import type { Copy } from "@/lib/content/copy";
import type { AnyCopyKey } from "@/lib/locale";
import { pick } from "@/lib/locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Resolve a key from COPY. */
  t: (key: AnyCopyKey, vars?: Record<string, string | number>) => string;
  /** Resolve any {en, th} pair, for question and option copy. */
  pick: (copy: Copy) => string;
  /**
   * A link, in this reader's language tree. Added 16/08/2026 with the `/en`
   * routing.
   *
   * Every link table in the app writes its Thai path and every component that
   * renders one passes it through here, so an English reader who taps FAQ stays
   * in English. Sitting on the same context as `t` and `pick` is what makes that
   * hard to forget: a component that needs the language for its words already
   * has this in the same destructure.
   */
  path: (href: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

export default function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    // Keep the document in step for screen readers and font fallback.
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => t(key, locale, vars),
      pick: (copy) => pick(copy, locale),
      path: (href) => localePath(href, locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useCopy(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  // Falling back rather than throwing keeps a component usable outside the
  // provider (a coach-facing surface, a test) instead of crashing the render.
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key, vars) => t(key, DEFAULT_LOCALE, vars),
      pick: (copy) => pick(copy, DEFAULT_LOCALE),
      path: (href) => localePath(href, DEFAULT_LOCALE),
    };
  }
  return ctx;
}
