import type { Metadata } from "next";
import "../globals.css";
import SiteShell from "@/components/SiteShell";
import { pick, t } from "@/lib/locale";
import { HOOK_EYEBROW, HOOK_LINE_1, HOOK_LINE_2 } from "@/lib/content/coaching";
import { SITE_URL, VERIFICATION } from "@/lib/seo";

/**
 * The English tree, at `/en`. 16/08/2026.
 *
 * A root layout rather than a nested one, and that is the whole reason this
 * group exists: `<html lang>` comes from a root layout and there is one per
 * request, so an English page cannot be served from the Thai tree's `<html>`
 * without lying about what language it is in. `locale.ts` carries the full
 * reasoning, including why English is the prefixed one.
 *
 * Everything visible is `SiteShell`, shared with the other two roots. The
 * difference between the trees is one argument.
 *
 * **`metadataBase` is restated here.** Metadata does not inherit across root
 * layouts, so without it every relative image URL on the English tree would
 * resolve against nothing and the share card would break. Same for the title
 * template.
 */

const OG_TITLE = pick(HOOK_EYEBROW, "en");
const OG_DESCRIPTION = `${pick(HOOK_LINE_1, "en")} ${pick(HOOK_LINE_2, "en")}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Search Console and Bing ownership, inert until the tokens are set. See
  // `VERIFICATION` in `seo.ts` for why the meta tag is the only method open
  // while the site is on a vercel.app subdomain.
  verification: VERIFICATION,
  title: {
    default: `${t("landing.headline", "en")} | PunProfile`,
    template: "%s | PunProfile",
  },
  description: t("landing.subhead", "en"),
  alternates: {
    canonical: "/en",
    languages: { th: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    siteName: "PunProfile",
    locale: "en_GB",
    url: "/en",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    // The same card as the Thai tree, and its headline is in Thai. Deliberate:
    // `og.png` is a rendered image with Thai type baked into it, and an English
    // one does not exist. A card in the wrong language is a smaller problem than
    // no card at all, which is what a missing file gives Facebook. Replace this
    // when `public/README-og.md`'s recipe has been run a second time in English.
    images: [{ url: "/og.png", width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
