import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { Fraunces, Inter, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import LocaleProvider from "@/components/LocaleProvider";
import LocaleToggle from "@/components/LocaleToggle";
import SiteMenu from "@/components/SiteMenu";
import SiteFooter from "@/components/SiteFooter";
import NavLockGate from "@/components/NavLockGate";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, pick, t } from "@/lib/locale";
import { HOOK_EYEBROW, HOOK_LINE_1, HOOK_LINE_2 } from "@/lib/content/coaching";

/**
 * The four faces the design system names: Fraunces and Inter for Latin, Noto
 * Serif Thai and Noto Sans Thai for Thai. `globals.css` composes them into one
 * stack per tier, so Thai and Latin coexist in a single string without a
 * language switch. See `design.md` in the sibling coaching repo.
 */
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-noto-serif-thai",
  subsets: ["thai", "latin"],
});
const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
});

const fontVars = [
  fraunces.variable,
  inter.variable,
  notoSerifThai.variable,
  notoSansThai.variable,
].join(" ");

/**
 * The canonical origin, for absolute URLs in metadata.
 *
 * Social crawlers do not resolve relative image paths, so `metadataBase` has to
 * be a real origin. `SITE_URL` is the same variable `convex/notify.ts` reads and
 * `scripts/launch-prod.sh` sets; the fallback is the domain claimed 14/08/2026.
 * A preview deployment inherits the production origin here on purpose: a preview
 * that advertises its own hostname to Facebook gets that hostname cached in
 * Facebook's scraper, and the preview is gone a week later.
 */
const SITE_URL = process.env.SITE_URL ?? "https://punprofile.vercel.app";

/**
 * The share card. Added 16/08/2026, because a link posted into the Facebook
 * group rendered as a bare URL with no image, no headline and no reason to tap.
 *
 * **Thai, not English.** A crawler arrives with no locale cookie, so it would
 * otherwise get the English fallback while every real reader of that post is
 * Thai. `DEFAULT_LOCALE` is Thai and the strings come from the copy bank rather
 * than being retyped here, which is what stops the card and the pages from
 * drifting apart.
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
 * days anyway, and its Thai headline needs the real Noto Serif Thai rather than
 * whatever a runtime image renderer can be persuaded to load.
 * `public/README-og.md` says how it was built and how to rebuild it.
 */
const OG_TITLE = pick(HOOK_EYEBROW, DEFAULT_LOCALE);
const OG_DESCRIPTION = `${pick(HOOK_LINE_1, DEFAULT_LOCALE)} ${pick(HOOK_LINE_2, DEFAULT_LOCALE)}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PunProfile",
  description:
    "An honest, coach-informed first read on your EU job-market readiness.",
  openGraph: {
    type: "website",
    siteName: "PunProfile",
    locale: "th_TH",
    url: "/",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: OG_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read on the server so the first paint is already in the right language and
  // <html lang> is honest. `cookies()` is async here, and cannot be written
  // during render: the toggle writes it client-side instead.
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;

  return (
    <ConvexAuthNextjsServerProvider>
      {/* Browser extensions stamp attributes onto <html> before React hydrates
          (LanguageTool's `data-lt-installed`, password managers, translators),
          which reads as a hydration mismatch in dev. This suppresses attribute
          mismatches on this element only, so it cannot mask a real one in a
          component. */}
      <html
        lang={locale}
        suppressHydrationWarning
        className={`${fontVars} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {/* Capability gate for the glass material, before first paint so the
              bar never renders blurred and then snaps solid. `deviceMemory`
              and `hardwareConcurrency` are Chrome-only, which is exactly the
              browser this audience is on. A device that reports nothing is
              treated as capable, because the common no-report case is desktop
              Safari and Firefox. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{var n=navigator,m=n.deviceMemory,c=n.hardwareConcurrency;" +
                "if((m&&m<=4)||(c&&c<=4))document.documentElement.dataset.perf='low';}catch(e){}",
            }}
          />
          <LocaleProvider initial={locale}>
            {/* nav-header, Liquid Glass. Sticky rather than static since
                14/08/2026: a material whose whole effect is bending the
                content behind it does nothing at all if content never passes
                underneath. Apple's rule is that glass is for the functional
                layer above content, and this bar plus the language menu plus
                the bottom action bar are the only three surfaces in the app
                that qualify. */}
            {/* Three columns, not a flex row with the logo in the middle:
                the wordmark is centred on the SCREEN, and a flex row would
                centre it on whatever space the two controls left over, so it
                would shift sideways whenever the menu hides itself during an
                assessment. The outer columns are the same fixed width and the
                centre takes the rest, which keeps it still. */}
            <header className="glass-bar sticky top-0 z-40 grid h-[72px] shrink-0 grid-cols-[3rem_1fr_3rem] items-center gap-2 px-4 sm:px-6">
              <div className="flex justify-start">
                <SiteMenu />
              </div>
              {/* The wordmark, not the word. Still deliberately not a link,
                  and more deliberately now that it is centred and looks like
                  one: the header sits above a running assessment, and a logo
                  that navigates home is a one-tap way to lose ten answers.
                  Navigation has its own control on the left. `nav.brand` stays
                  as the alt text, which is the only place the string is still
                  needed. */}
              <div className="flex justify-center">
                <Image
                  src="/punprofile-wordmark.png"
                  alt={t("nav.brand", locale)}
                  width={594}
                  height={96}
                  priority
                  className="h-6 w-auto"
                />
              </div>
              <div className="flex justify-end">
                <LocaleToggle />
              </div>
            </header>
            <ConvexClientProvider>
              <main className="flex flex-1 flex-col">{children}</main>
            </ConvexClientProvider>
            {/* Hidden for the same reason and by the same signal as the
                menu: during the check, every link out costs the candidate
                their answers. */}
            <NavLockGate>
              <SiteFooter locale={locale} />
            </NavLockGate>
          </LocaleProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
