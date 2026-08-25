import { Anuphan, Archivo, Inter } from "next/font/google";
import ConvexClientProvider from "@/app/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import JsonLd from "@/components/JsonLd";
import LocaleProvider from "@/components/LocaleProvider";
import LocaleToggle from "@/components/LocaleToggle";
import SiteMenu from "@/components/SiteMenu";
import SiteFooter from "@/components/SiteFooter";
import NavLockGate from "@/components/NavLockGate";
import BrandLockup from "@/components/BrandLockup";
import TopNav from "@/components/TopNav";
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
 * The three faces the design system names: Archivo and Inter for Latin,
 * Anuphan for Thai. `globals.css` composes them into one stack per tier, so
 * Thai and Latin coexist in a single string without a language switch. See
 * `design.md` in the sibling coaching repo.
 *
 * Loaded here rather than per layout: `next/font` deduplicates by call site, and
 * three call sites would be three preload sets in the head of one page.
 */
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });
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
 * A loopless geometric sans is what a Thai reader parses as modern and
 * professional, which is also what Archivo and Inter are doing on the Latin
 * side, so both scripts now say the same thing about the brand.
 */
const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
});

const fontVars = [archivo.variable, inter.variable, anuphan.variable].join(" ");

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
            {/* The bar from `design.md`'s navigation section: 76px, on
                `canvas`, no border and no shadow. The bar is the page rather
                than a surface above it, and what separates it from the content
                is the dimmer that appears when a menu opens, not a hairline.
                Sticky since 14/08/2026: a header the reader can reach without
                scrolling back is worth having whatever the header is made of.

                `sticky` also makes it the containing block for `TopNav`'s
                viewport, which is pinned to `top-full` and spans the window. */}
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

              {/* The content column. */}
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
            {/*
              A horizontal top bar, 23/08/2026, replacing the standard drawer.

              **The lockup is left-aligned now and no longer centred.** The
              centring existed for one reason, recorded here before: a flex row
              would have centred the wordmark on whatever space the two controls
              left over, so it shifted sideways whenever the burger hid itself
              during an assessment. Left-aligning removes that problem at the
              source rather than working around it, and a logo at the left with
              navigation to its right is what a top bar is.

              **The burger is on the right**, Paul's call the same day: easier to
              reach with a thumb. It still disappears at `expanded`, where the
              bar beside it is already showing every destination, because two
              navigations offering the same links is one of them being ignored.

              `NavLockGate` wraps both, for the reason `SiteMenu` states about
              itself: mid-assessment every link out costs the candidate their
              answers, and absence beats a disabled control that still says there
              is a way out of here.
            */}
            <header className="sticky top-0 z-40 flex h-[76px] shrink-0 items-center bg-canvas">
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
              {/* `.page-container` rather than the header's own padding: the
                  lockup has to start where a paragraph starts, and until
                  25/08/2026 it did not. `globals.css` carries the ladder. */}
              <div className="page-container flex w-full items-center justify-between gap-2">
              {/* Left: the brand and the offer, in that order and touching.
                  A reader looks at the top left first and what they should find
                  there is who this is and what it sells. */}
              <div className="flex min-w-0 items-center gap-4">
                <BrandLockup />
                <NavLockGate>
                  <TopNav slot="primary" />
                </NavLockGate>
              </div>

              {/* Right: where you go when you already have a question, and the
                  one filled control on the page. */}
              <div className="flex items-center gap-1">
                <NavLockGate>
                  <TopNav slot="secondary" />
                </NavLockGate>
                <LocaleToggle />
                <div className="expanded:hidden">
                  <SiteMenu />
                </div>
              </div>
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
