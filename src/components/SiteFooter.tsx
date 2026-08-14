import Image from "next/image";
import Link from "next/link";
import { pick, t } from "@/lib/locale";
import type { Locale } from "@/lib/locale";
import {
  DISCLAIMER,
  FACEBOOK_PAGE,
  FOLLOW_BODY,
  EYEBROW,
  FOLLOW_EYEBROW,
  FOOTER_COLUMNS,
} from "@/lib/content/footer";

/**
 * The site footer. TASK-091, 14/08/2026.
 *
 * A server component on purpose. Nothing here is interactive, the locale is
 * already resolved in the layout, and a footer that ships client JS to render
 * eleven links is paying for nothing.
 *
 * **Why `primary-deep` and not white.** `design.md` says two things about this
 * element that do not agree: one passage puts the footer on plain `surface`
 * with ink text so navigation chrome never competes with content, and another
 * says the header, footer, sign-in screen and dashboard all stay `primary`.
 * This follows the second, one stop down its own ramp, and the reason is
 * measured rather than aesthetic. On `primary` (#068376) white body text holds
 * 4.71:1, which passes AA and leaves nothing for a second tier, so a muted
 * heading or a caption would have to fail. On `primary-deep` (#04524a) white
 * holds 8.97:1 and `accent-tint` holds 5.37:1, which buys a real eyebrow colour
 * at AA. The competitor footer this is modelled on gets its structure from
 * exactly that headroom, and the light version cannot have it.
 *
 * It is also the only dark surface in the app, which is the point: it ends the
 * page rather than trailing off, and it does so without touching the dark mode
 * that is still deferred.
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

  return (
    <footer className="mt-auto bg-primary-deep px-6 py-14 text-on-primary">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* The left block. Where the newsletter capture would be on the page
              this is modelled on, and is not, because there is no newsletter.
              See the note in `footer.ts`. */}
          <div>
            <Image
              src="/punprofile-wordmark-reversed.png"
              alt={t("nav.brand", locale)}
              width={594}
              height={96}
              className="h-7 w-auto"
            />
            <p className={`mt-8 text-accent-tint ${EYEBROW(locale)}`}>
              {pick(FOLLOW_EYEBROW, locale)}
            </p>
            <p className="mt-3 max-w-sm text-body">{pick(FOLLOW_BODY, locale)}</p>
            <a
              href={FACEBOOK_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-on-primary/40 px-5 text-body transition-colors hover:bg-on-primary/10"
            >
              {/* Facebook's mark, drawn rather than fetched: one path, no
                  network request, and it inherits the text colour so it can
                  never fall out of step with the border. */}
              <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0" fill="currentColor">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
              </svg>
              {th ? "เพจ Facebook ของเรา" : "Our Facebook page"}
            </a>
          </div>

          {/* Columns grouped by what a reader came for. */}
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading.en}>
                <h2 className={`text-accent-tint ${EYEBROW(locale)}`}>
                  {pick(col.heading, locale)}
                </h2>
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
                            className="text-body text-on-primary/90 underline-offset-4 transition-colors hover:text-on-primary hover:underline"
                          >
                            {pick(l.label, locale)}
                          </a>
                        ) : (
                          <Link
                            href={l.href}
                            className="text-body text-on-primary/90 underline-offset-4 transition-colors hover:text-on-primary hover:underline"
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
        </div>

        <hr className="mt-14 border-on-primary/20" />

        {/* What PunProfile is not. Long on purpose: every clause is already
            said somewhere the reader can check, so none of it is a surprise. */}
        <p className="mt-8 max-w-4xl text-caption leading-relaxed text-on-primary/75">
          {pick(DISCLAIMER, locale)}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-caption text-on-primary/75">
          {/* The exact wording Paul specified on 14/08/2026, kept in the copy
              bank rather than retyped here. It is the same string in both
              languages by his decision: a Thai transliteration of a legal
              formula reads as a mistake rather than as a courtesy. */}
          <span>{t("footer.brand", locale)}</span>
          <Link
            href="/privacy"
            className="underline underline-offset-4 transition-colors hover:text-on-primary"
          >
            {t("consent.privacyLink", locale)}
          </Link>
        </div>
      </div>
    </footer>
  );
}
