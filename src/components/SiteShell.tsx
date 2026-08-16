import Image from "next/image";
import { Fraunces, Inter, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import ConvexClientProvider from "@/app/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import JsonLd from "@/components/JsonLd";
import LocaleProvider from "@/components/LocaleProvider";
import LocaleToggle from "@/components/LocaleToggle";
import SiteMenu from "@/components/SiteMenu";
import SiteFooter from "@/components/SiteFooter";
import NavLockGate from "@/components/NavLockGate";
import { DEFAULT_LOCALE, t } from "@/lib/locale";
import type { Locale } from "@/lib/locale";
import { DISCLAIMER, FACEBOOK_PAGE } from "@/lib/content/footer";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { pick } from "@/lib/locale";

/**
 * The document, from `<html>` down. Extracted from the root layout 16/08/2026.
 *
 * There are now three root layouts, `(th)`, `(en)` and `(private)`, because Next
 * renders exactly one `<html>` per request and it comes from a root layout, and
 * `<html lang>` has to say which language the page is actually in. Three copies
 * of a hundred lines of header, glass bar, wordmark and footer would have been
 * three places for the chrome to drift, so all three call this and differ only
 * in the locale they pass.
 *
 * `locale` is a parameter rather than something read here, and that is the
 * change the whole i18n pass turns on: the tree decides the language, not the
 * cookie. `(private)` is the one caller that still passes a cookie-derived
 * value, because `/admin` and `/login` are outside both language trees and their
 * behaviour is deliberately unchanged.
 */

/**
 * The four faces the design system names: Fraunces and Inter for Latin, Noto
 * Serif Thai and Noto Sans Thai for Thai. `globals.css` composes them into one
 * stack per tier, so Thai and Latin coexist in a single string without a
 * language switch. See `design.md` in the sibling coaching repo.
 *
 * Loaded here rather than per layout: `next/font` deduplicates by call site, and
 * three call sites would be three preload sets in the head of one page.
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

export default function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
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
          {/* Who this is and what site it is, for a search or answer engine.
              In the shell so it is on every page and stated once: the two nodes
              carry stable `@id`s, and the per-page blocks on the blog reference
              those rather than restating the publisher. Same rule as everywhere
              else in this repo, one owner per fact.

              Resolved at DEFAULT_LOCALE on both trees on purpose. These two
              nodes describe the organisation, which is one organisation whatever
              page a crawler is standing on, and their `@id`s are what the blog's
              blocks point at. Two versions of `/#organization` saying different
              things in different languages is exactly the ambiguity an `@id` is
              there to prevent. */}
          <JsonLd
            data={organizationJsonLd(FACEBOOK_PAGE, pick(DISCLAIMER, DEFAULT_LOCALE))}
          />
          <JsonLd data={websiteJsonLd()} />
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
