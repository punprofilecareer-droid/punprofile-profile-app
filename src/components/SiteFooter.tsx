import Image from "next/image";
import Link from "next/link";
import { localePath, pick, t } from "@/lib/locale";
import type { Locale } from "@/lib/locale";
import {
  DISCLAIMER,
  FACEBOOK_PAGE,
  EYEBROW,
  FOOTER_COLUMNS,
} from "@/lib/content/footer";

/**
 * The site footer. TASK-091, 14/08/2026.
 *
 * A server component on purpose. Nothing here is interactive, the locale is
 * already resolved in the layout, and a footer that ships client JS to render
 * eleven links is paying for nothing.
 *
 * **The footer is a quiet band, not a dark one, 25/08/2026.**
 *
 * It was `inverse-surface`, the only dark surface in the app, on the reasoning
 * that a footer needs two tiers of text and a ground that only just clears AA
 * for the first leaves nothing for the second. The reasoning was right and the
 * ground was wrong: the reference this design comes from ends on its quiet tint
 * with the lockup in near-black, and it was measured rather than remembered.
 *
 * `canvas-soft` gives the same headroom the dark ground was chosen for.
 * `ink-deep` holds 12.01 on it, `body` holds 8.09, and the lockup at 16.58, so
 * there are three usable tiers rather than two.
 *
 * **Not rendered during an assessment.** `NavLockGate` in the layout removes
 * it, on the same signal and for the same reason as the menu. An earlier note
 * here argued the opposite, that the privacy link should live in the footer
 * BECAUSE the footer renders during the check when the menu does not. That was
 * wrong on the facts as of 14/08/2026: the contact step carries its own privacy
 * link inside the consent copy, which is the screen where it is actually needed
 * and the only screen in the flow that collects anything.
 */
export default function SiteFooter({ locale }: { locale: Locale }) {
  const th = locale === "th";

  /*
   * The top hairline is ours and not the reference's. Its pages end on white,
   * so a soft footer separates itself. Two of ours end on a soft band, and
   * without the rule the footer and the last section merge into one field.
   */
  return (
    <footer className="mt-auto border-t border-line bg-canvas-soft py-14 text-on-primary">
      {/* The same container as the header and every band. */}
      <div className="page-container">
      <div className="w-full">
        {/* Columns first and full width. The lockup used to share this row and
            now closes the footer instead, which is the order the reference
            uses: what you might still want, then who this was. */}
        <nav className="grid grid-cols-2 gap-8 medium:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading.en}>
              <h2 className={`text-ink ${EYEBROW(locale)}`}>{pick(col.heading, locale)}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links
                  // An unset destination renders as absent rather than as a
                  // dead link, the same rule the contact page follows. Today
                  // nothing is unset; this is what keeps that true.
                  .filter((l) => l.href !== "")
                  .map((l) => (
                    <li key={l.href}>
                      {l.external ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body-large underline-offset-4 duration-[350ms] ease-nav transition-colors hover:underline"
                        >
                          {pick(l.label, locale)}
                        </a>
                      ) : (
                        <Link
                          href={localePath(l.href, locale)}
                          className="text-body-large underline-offset-4 duration-[350ms] ease-nav transition-colors hover:underline"
                        >
                          {pick(l.label, locale)}
                        </Link>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        <hr className="mt-14 border-line" />

        {/* The closing row: the lockup at one end, where to find us at the
            other. Both in the same ink, which is what makes it read as a
            signature rather than as another block of navigation. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
          {/*
            One asset, one colour.

            The mark was `#E7703A`, the last of the retired palette on this
            surface. `punprofile-logo-mono-black.svg` is the same vector with the
            mark taking the wordmark's own colour, so the lockup reads as one
            shape; it measures 16.58 here. Generating a light twin is one
            substitution on the reversed asset if a dark ground ever needs one.

            The two-asset swap went with the dark ground. This footer used to
            render both wordmarks and let `globals.css` pick, because
            `inverse-surface` flipped between schemes. It does not sit on that
            role now, and `canvas-soft` is light in both.
          */}
          <Image
            src="/punprofile-logo-mono-black.svg"
            alt={t("nav.brand", locale)}
            width={2421}
            height={657}
            className="h-10 w-auto"
          />

          <a
            href={FACEBOOK_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-line-strong px-5 text-body-md-strong duration-[350ms] ease-nav transition-colors hover:bg-primary-pale"
          >
            {/* Facebook's mark, drawn rather than fetched: one path, no
                network request, and it inherits the text colour so it can
                never fall out of step with the border. */}
            <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0" fill="currentColor">
              <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
            </svg>
            {/* The label stays on the button rather than becoming a heading
                above it. `FOLLOW_EYEBROW` was that heading and has no place in
                a single closing row; the button already says where it goes. */}
            {th ? "เพจ Facebook ของเรา" : "Our Facebook page"}
          </a>
        </div>

        {/* What PunProfile is not. Long on purpose: every clause is already
            said somewhere the reader can check, so none of it is a surprise. */}
        <p className="mt-10 max-w-4xl text-body-medium leading-relaxed text-body">
          {pick(DISCLAIMER, locale)}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-body-medium text-body">
          {/* The exact wording Paul specified on 14/08/2026, kept in the copy
              bank rather than retyped here. It is the same string in both
              languages by his decision: a Thai transliteration of a legal
              formula reads as a mistake rather than as a courtesy. */}
          <span>{t("footer.brand", locale)}</span>
          <Link
            href={localePath("/privacy", locale)}
            className="underline underline-offset-4 duration-[350ms] ease-nav transition-colors hover:text-on-primary"
          >
            {t("consent.privacyLink", locale)}
          </Link>
        </div>
      </div>
      </div>
    </footer>
  );
}
