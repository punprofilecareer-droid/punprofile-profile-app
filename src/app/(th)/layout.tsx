import type { Metadata } from "next";
import "../globals.css";
import SiteShell from "@/components/SiteShell";
import { DEFAULT_LOCALE, pick, t } from "@/lib/locale";
import { HOOK_EYEBROW, HOOK_LINE_1, HOOK_LINE_2 } from "@/lib/content/coaching";
import { SITE_URL, VERIFICATION } from "@/lib/seo";

/**
 * The Thai tree, and the site's primary root layout. 16/08/2026.
 *
 * One of three root layouts, and the reason there are three is in `locale.ts`:
 * Next renders one `<html>` per request, it comes from a root layout, and
 * `<html lang>` has to be true. `(en)` is the same shell at `/en`, `(private)`
 * is `/admin` and `/login` unchanged.
 *
 * **This one carries `metadataBase` and the title template for the whole site.**
 * Metadata does not inherit across root layouts, so `(en)` and `(private)`
 * restate `metadataBase`; everything else on this file is the Thai tree's alone.
 */

/**
 * The canonical origin, for absolute URLs in metadata.
 *
 * Social crawlers do not resolve relative image paths, so `metadataBase` has to
 * be a real origin. A preview deployment inherits the production origin here on
 * purpose: a preview that advertises its own hostname to Facebook gets that
 * hostname cached in Facebook's scraper, and the preview is gone a week later.
 *
 * **Defined in `src/lib/seo.ts` since 16/08/2026** and imported back, because
 * the sitemap, `robots.txt`, `llms.txt` and every JSON-LD block need the same
 * answer, and five files each computing it from the same environment variable is
 * five places for it to stop agreeing.
 */

/**
 * The share card. Added 16/08/2026, because a link posted into the Facebook
 * group rendered as a bare URL with no image, no headline and no reason to tap.
 *
 * **Thai, not English.** A crawler arrives at this tree because this tree is the
 * Thai one, and every real reader of the post that carries the link is Thai. The
 * strings come from the copy bank rather than being retyped here, which is what
 * stops the card and the pages from drifting apart.
 *
 * **The card is PunProfile, not EU Fit Check.** Paul's call, 16/08/2026, and it
 * corrects a first version that led on the assessment. A shared link is the
 * business introducing itself, and the assessment is one feature of an app that
 * is still growing: `AGENTS.md` already names a job board, saved jobs and match
 * notifications alongside it. So the words are the coaching hook from
 * `coaching.ts` and the three service names from `services.ts`, and the artwork
 * is Teal rather than the Lavender that `design.md` reserves for the assessment.
 *
 * The image is `public/og.png`, a static 1200x630 file. Static rather than
 * generated per request: it never changes per visitor, Facebook caches it for
 * days anyway, and its Thai headline needs the real brand face rather than
 * whatever a runtime image renderer can be persuaded to load.
 * `public/README-og.md` says how it was built and how to rebuild it.
 *
 * Rebuilt 16/08/2026 onto the M3 palette: olive rather than teal, the vector
 * lockup rather than the old PNG wordmark, and Anuphan rather than Noto Serif
 * Thai. Facebook caches this aggressively, so re-scrape the production URL at
 * `developers.facebook.com/tools/debug/` or the group will keep serving the
 * teal one.
 */
const OG_TITLE = pick(HOOK_EYEBROW, DEFAULT_LOCALE);
const OG_DESCRIPTION = `${pick(HOOK_LINE_1, DEFAULT_LOCALE)} ${pick(HOOK_LINE_2, DEFAULT_LOCALE)}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Search Console and Bing ownership, inert until the tokens are set. See
  // `VERIFICATION` in `seo.ts` for why the meta tag is the only method open
  // while the site is on a vercel.app subdomain.
  verification: VERIFICATION,
  /**
   * `template` added 16/08/2026 with the rest of the SEO pass. Until then every
   * page in the app rendered the single title "PunProfile", so a search result
   * for the FAQ and one for the coaching page were indistinguishable, and there
   * was nothing on any of them for a query to match.
   *
   * `default` is the landing page's own headline, not the bare brand name. Every
   * other page sets its own title, so this string is effectively the home page's
   * and nothing else, and "PunProfile" told a searcher nothing the URL had not.
   * Not `HOOK_EYEBROW`, which reads better and is already `/coaching`'s title.
   * Two pages sharing one title is the problem this pass was fixing.
   */
  title: {
    default: `${t("landing.headline", DEFAULT_LOCALE)} | PunProfile`,
    template: "%s | PunProfile",
  },
  description: t("landing.subhead", DEFAULT_LOCALE),
  alternates: {
    canonical: "/",
    languages: { th: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    siteName: "PunProfile",
    locale: "th_TH",
    url: "/",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function ThaiRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell locale="th">{children}</SiteShell>;
}
