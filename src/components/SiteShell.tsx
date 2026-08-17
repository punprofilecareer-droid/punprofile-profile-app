import { Anuphan, Fraunces, Inter } from "next/font/google";
import ConvexClientProvider from "@/app/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import JsonLd from "@/components/JsonLd";
import LocaleProvider from "@/components/LocaleProvider";
import LocaleToggle from "@/components/LocaleToggle";
import SiteMenu from "@/components/SiteMenu";
import SiteFooter from "@/components/SiteFooter";
import NavLockGate from "@/components/NavLockGate";
import BrandLockup from "@/components/BrandLockup";
import SideNav from "@/components/SideNav";
import { DEFAULT_LOCALE } from "@/lib/locale";
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
 * of a hundred lines of header, app bar, wordmark and footer would have been
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
 * The three faces the design system names: Fraunces and Inter for Latin,
 * Anuphan for Thai. `globals.css` composes them into one stack per tier, so
 * Thai and Latin coexist in a single string without a language switch. See
 * `design.md` in the sibling coaching repo.
 *
 * Loaded here rather than per layout: `next/font` deduplicates by call site, and
 * three call sites would be three preload sets in the head of one page.
 */
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
/**
 * Thai, one family for both tiers. Changed 16/08/2026 from Noto Serif Thai plus
 * Noto Sans Thai.
 *
 * **Anuphan is variable**, so weight 700 carries the display tier and 400 the
 * body tier out of a single file. Two static Thai families were two downloads
 * on the mid-range Android over mobile data that is this product's actual
 * audience, and the second one existed only to make Thai headlines a serif.
 *
 * That serif is not missed, and this is the part worth writing down. In Latin a
 * serif reads as researched and editorial, which is the whole reason Fraunces is
 * here. Thai does not carry the same association: a Thai serif reads closer to a
 * government form or a school textbook, and a loopless geometric sans is what a
 * Thai reader parses as modern and professional. Keeping a serif for Thai
 * headlines was importing a Latin convention into a script that means something
 * else by it.
 *
 * Fraunces still sets every Latin headline, so the editorial register is intact
 * where it works and absent where it did not.
 */
const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
});

const fontVars = [fraunces.variable, inter.variable, anuphan.variable].join(" ");

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
          {/* The `data-perf` capability gate that used to live here is gone with
              the glass it existed to switch off, 16/08/2026. It probed
              `deviceMemory` and `hardwareConcurrency` before first paint so a
              mid-range phone never rendered a blurred bar. Nothing in the app
              is now expensive enough to need the probe, and an inline script
              in the document head is not something to keep on the chance a
              future feature wants it. */}
          <LocaleProvider initial={locale}>
            {/* `top-app-bar` from `design.md`: `surface`, elevation level 0, a
                hairline underneath. Sticky since 14/08/2026. That was decided
                alongside the glass and outlived it, because it was a navigation
                decision rather than a property of the material: a header the
                reader can reach without scrolling back is worth having whatever
                the header is made of. */}
            {/*
              From `expanded` (840px) up the page is a two-column shell: a
              standard navigation drawer on the left, everything else beside it.
              Below that it is a single column with the modal drawer behind the
              burger. Added 16/08/2026; M3 selects navigation by destination
              count and six destinations means a standard drawer at this width.

              The drawer is inside `NavLockGate` for the same reason the modal
              one is: mid-assessment, every link out costs the candidate their
              answers.
            */}
            <div className="flex min-h-dvh flex-1">
              <NavLockGate>
                <SideNav />
              </NavLockGate>

              <div className="flex min-w-0 flex-1 flex-col">
            {/* Three columns, not a flex row with the logo in the middle:
                the wordmark is centred on the SCREEN, and a flex row would
                centre it on whatever space the two controls left over, so it
                would shift sideways whenever the menu hides itself during an
                assessment. The outer columns are the same fixed width and the
                centre takes the rest, which keeps it still.

                The burger disappears at `expanded`, where the drawer beside it
                is already showing every destination. Two navigations offering
                the same six links is one of them being ignored. */}
            <header className="sticky top-0 z-40 grid h-[72px] shrink-0 grid-cols-[3rem_1fr_3rem] items-center gap-2 border-b border-outline-variant bg-surface px-4 medium:px-6">
              <div className="flex justify-start expanded:invisible">
                <SiteMenu />
              </div>
              {/* The lockup, not the word. Still deliberately not a link, and
                  more deliberately now that it is centred and looks like one:
                  the header sits above a running assessment, and a logo that
                  navigates home is a one-tap way to lose ten answers.
                  Navigation has its own control on the left. `nav.brand` stays
                  as the alt text, which is the only place the string is still
                  needed.

                  Vector since 16/08/2026, replacing the 594x96 PNG. Taller than
                  the old one at `h-9` because this lockup carries the COACHING
                  descriptor under the wordmark, so the same optical size needs
                  more box. */}
              <div className="flex justify-center">
                <BrandLockup />
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
              </div>
            </div>
          </LocaleProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
