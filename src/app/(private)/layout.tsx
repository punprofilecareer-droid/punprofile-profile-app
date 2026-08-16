import type { Metadata } from "next";
import { cookies } from "next/headers";
import "../globals.css";
import SiteShell from "@/components/SiteShell";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";
import { NOT_INDEXED, SITE_URL } from "@/lib/seo";

/**
 * `/admin` and `/login`. 16/08/2026.
 *
 * The third root layout, and the one that exists so the other two could be
 * built. These two routes stay outside both language trees, which keeps
 * `src/proxy.ts` and its `/admin(.*)` matcher untouched by the i18n work, keeps
 * every bookmark and every reference in `AGENTS.md` valid, and avoids the
 * collision a top-level `[lang]` segment would have had with `/admin`, since
 * `/admin` matches `[lang]` with `lang` set to "admin".
 *
 * **The locale still comes from the cookie here**, which is exactly what the
 * whole site did before this change. `copy.ts` says these surfaces are English
 * on purpose and only the founder reads them, so there was nothing to gain from
 * giving them a language tree and something to lose from changing how they
 * behave in the same commit that moved everything else.
 *
 * Never indexed, and both halves of that are deliberate. `robots.ts` disallows
 * the paths, which an obedient crawler reads before fetching; `NOT_INDEXED` is
 * the meta tag, which the ones that fetch first read afterwards. Neither is the
 * security boundary. `requireAdmin` in `convex/leads.ts` is.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...NOT_INDEXED,
};

export default async function PrivateRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;

  return <SiteShell locale={locale}>{children}</SiteShell>;
}
