"use client";

/**
 * The language switch in the header: a pill that opens a right-hand drawer.
 *
 * Rebuilt 25/08/2026 on `design.md`'s navigation section. It was a round flag
 * opening a 9rem menu; the shape below is the reference's, and the reasoning
 * about flags and circles that follows is unchanged and still load-bearing.
 *
 * Two shapes were tried on 14/08/2026 and rejected. `TH / EN` asked the reader
 * to decode a two-letter code before they could switch, which is the one thing
 * a language switch must not require, since the person who needs it is the
 * person who cannot read the current language. Rectangular flags side by side
 * replaced that but sat badly together: a Thai flag is 3:2 and a Union Jack is
 * 2:1, so two of them in a row are visibly different widths and heights and the
 * pair reads as a mistake.
 *
 * Circles fix that by construction. A circular crop makes every flag the same
 * shape whatever its native ratio, which is why every modern app that shows
 * more than one uses them.
 *
 * A menu rather than two buttons, because a row of flags shows a choice that
 * has already been made and asks the reader to spot which one is dimmed. The
 * closed state shows the language you are in; opening shows what else there is.
 * It also holds its shape when a third language arrives, which two side by side
 * does not.
 *
 * Flags are a compromise and worth naming as one. A flag is a country, not a
 * language, and the Union Jack stands in for English the way it does on most
 * Thai-facing sites, not because English belongs to Britain. Every accessible
 * name carries the language's own name, so a screen reader never gets a flag.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOCALES, localePath, stripLocale, type Locale } from "@/lib/locale";
import { getLocaleSwitchInPlace } from "@/lib/localeInPlace";
import { useCopy } from "./LocaleProvider";

/**
 * Both flags are drawn to fill a 60x60 box and clipped to a circle, so the
 * native aspect ratio is cropped away rather than letterboxed. Thailand's
 * bands stay horizontal and centred; the Union Jack is drawn at 2:1 and scaled
 * up so the centre of the cross lands in the centre of the circle.
 */
/**
 * Both flags are drawn at their own aspect ratio (Thailand 3:2, the Union Jack
 * 2:1) and cropped to the circle with `preserveAspectRatio="xMidYMid slice"`.
 * Fixed 14/08/2026: they were previously redrawn into a square viewBox by hand
 * with nested transforms, which put the Union Jack's cross visibly off centre.
 * Letting the browser do the centring is both correct and shorter, and it
 * means the geometry in each file is the flag's real geometry rather than a
 * hand-fitted copy of it.
 */
function FlagTh() {
  return (
    <svg
      viewBox="0 0 60 40"
      preserveAspectRatio="xMidYMid slice"
      className="size-full"
      aria-hidden
      focusable="false"
    >
      <rect width="60" height="40" fill="#A51931" />
      <rect y="6.667" width="60" height="26.666" fill="#F4F5F8" />
      <rect y="13.333" width="60" height="13.334" fill="#2D2A4A" />
    </svg>
  );
}

function FlagEn() {
  return (
    <svg
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      className="size-full"
      aria-hidden
      focusable="false"
    >
      <clipPath id="locale-uk-saltire">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath="url(#locale-uk-saltire)"
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => React.ReactElement> = { th: FlagTh, en: FlagEn };

/** Each language named in itself, so the label reads to the person switching TO it. */
const NAMES: Record<Locale, string> = { th: "ไทย", en: "English" };

/**
 * The code beside the flag in the closed state. Latin in both languages on
 * purpose: it is a label for the language you would switch TO being absent, and
 * "TH" is what every other site in this market shows a Thai reader.
 */
const CODES: Record<Locale, string> = { th: "TH", en: "EN" };

function Flag({ locale, className = "" }: { locale: Locale; className?: string }) {
  const Svg = FLAGS[locale];
  return (
    <span
      className={`block overflow-hidden rounded-full ring-1 ring-inset ring-black/10 ${className}`}
    >
      <Svg />
    </span>
  );
}

export default function LocaleToggle() {
  const { locale, setLocale, t } = useCopy();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  /**
   * Switching language now moves you to the other language's URL, and that is
   * the change the `/en` routing made necessary on 16/08/2026.
   *
   * Before, this only wrote a cookie and re-rendered in place, because both
   * languages lived at one URL. They no longer do, so setting the cookie alone
   * would leave an English reader on a Thai URL rendering English, which is the
   * exact ambiguity the routing was introduced to remove: the page would be
   * unshareable and uncitable in the language it was being read in.
   *
   * The cookie is still written. It is what sends a returning visitor to the
   * right tree when they arrive on a bare link with no prefix.
   *
   * `push`, not `replace`: switching language is a thing a person did, and the
   * back button should undo it. The query string is carried over because
   * `/services?focus=employability` is a real link and dropping its parameter
   * would land the reader on a page that no longer points at their own chart.
   *
   * `/admin` and `/login` are outside both trees, so `localePath` leaves their
   * paths alone and the toggle there behaves exactly as it always did: the
   * cookie changes and nothing navigates.
   *
   * **And a page may refuse the navigation.** 17/08/2026, after switching
   * language on the assessment's result screen restarted the assessment. The
   * two trees are separate routes under separate root layouts, so a push
   * between them unmounts the page, and a page holding unrecoverable state in
   * memory cannot survive that. `localeInPlace.ts` carries the reasoning and
   * the cost. Everything else about the switch is unchanged, including the
   * cookie, which is what matters for the next visit.
   */
  const choose = (next: Locale) => {
    setLocale(next);
    setOpen(false);

    if (getLocaleSwitchInPlace()) return;

    const query = params.toString();
    const target = localePath(stripLocale(pathname), next);
    const stays = target === pathname;
    if (!stays) router.push(query ? `${target}?${query}` : target);
  };

  // Close on an outside tap or on Escape. Both, because a phone never sends
  // Escape and a keyboard user should not have to aim at the background.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root}>
      {/*
       * The trigger is a pill, not a bare icon: 14px at 600 beside the flag, in
       * the same shape and the same padding as every other control in this bar.
       * The code is redundant to the flag on purpose, because a flag is a
       * country and this is a language.
       */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t("nav.language")}: ${NAMES[locale]}`}
        className="flex h-9 items-center gap-2 rounded-full px-3 text-body-sm-strong text-on-primary duration-[350ms] ease-nav transition-colors hover:bg-primary-pale"
      >
        <Flag locale={locale} className="size-5 shrink-0" />
        <span aria-hidden>{CODES[locale]}</span>
      </button>

      {/*
       * A right-hand drawer rather than a dropdown, on the reference's own
       * pattern and for its reason: a language switch is a decision about the
       * whole site, and a 9rem menu hanging off a corner reads as a setting for
       * whatever is under it.
       *
       * Both layers stay mounted and animate: the dimmer on opacity, the panel
       * on `translate-x`. Mounting on open would put both at their final state
       * on the first frame, which is the difference between a drawer arriving
       * and a drawer appearing. 350ms on `--ease-nav`, the same curve as the
       * menu, because they are the same gesture from the same bar.
       *
       * **Choosing applies immediately.** The reference confirms with a button
       * because it is also choosing a country; with two languages a confirm step
       * is a second tap that decides nothing.
       */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-[8px] duration-[350ms] ease-nav transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal={open}
        aria-label={t("nav.language")}
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-canvas duration-[350ms] ease-nav transition-transform ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-6">
          <p className="text-heading-sm">{t("nav.language")}</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("nav.menuClose")}
            tabIndex={open ? undefined : -1}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas-soft text-on-primary duration-[350ms] ease-nav transition-colors hover:bg-primary-pale"
          >
            <span aria-hidden>&#10005;</span>
          </button>
        </div>

        <ul className="flex flex-col gap-2 px-6">
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === l}
                onClick={() => choose(l)}
                tabIndex={open ? undefined : -1}
                className={`flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-body-md-strong duration-[350ms] ease-nav transition-colors ${
                  locale === l
                    ? "bg-primary-pale text-on-primary"
                    : "bg-canvas-soft text-on-primary hover:bg-primary-pale"
                }`}
              >
                <Flag locale={l} className="size-6 shrink-0" />
                <span>{NAMES[l]}</span>
                {locale === l && (
                  <span aria-hidden className="ml-auto">
                    &#10003;
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
