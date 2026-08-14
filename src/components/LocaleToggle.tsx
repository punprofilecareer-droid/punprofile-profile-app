"use client";

/**
 * The language switch in the header: a round flag that opens a small menu.
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
import { LOCALES, type Locale } from "@/lib/locale";
import { useCopy } from "./LocaleProvider";

/**
 * Both flags are drawn to fill a 60x60 box and clipped to a circle, so the
 * native aspect ratio is cropped away rather than letterboxed. Thailand's
 * bands stay horizontal and centred; the Union Jack is drawn at 2:1 and scaled
 * up so the centre of the cross lands in the centre of the circle.
 */
function FlagTh() {
  return (
    <svg viewBox="0 0 60 60" className="size-full" aria-hidden focusable="false">
      <rect width="60" height="60" fill="#A51931" />
      <rect y="10" width="60" height="40" fill="#F4F5F8" />
      <rect y="20" width="60" height="20" fill="#2D2A4A" />
    </svg>
  );
}

function FlagEn() {
  return (
    <svg viewBox="0 0 60 60" className="size-full" aria-hidden focusable="false">
      <g transform="translate(0,-15) scale(1,1)">
        <clipPath id="locale-uk-saltire">
          <path d="M45,45 h45 v45 z v45 h-45 z h-45 v-45 z v-45 h45 z" transform="translate(-15,-15)" />
        </clipPath>
        <rect y="0" width="60" height="90" fill="#012169" />
        <g transform="translate(0,15)">
          <path d="M-15,-15 L75,45 M75,-15 L-15,45" stroke="#FFFFFF" strokeWidth="12" />
          <path
            d="M-15,-15 L75,45 M75,-15 L-15,45"
            clipPath="url(#locale-uk-saltire)"
            stroke="#C8102E"
            strokeWidth="8"
          />
          <path d="M30,-15 v90 M-15,15 h90" stroke="#FFFFFF" strokeWidth="20" />
          <path d="M30,-15 v90 M-15,15 h90" stroke="#C8102E" strokeWidth="12" />
        </g>
      </g>
    </svg>
  );
}

const FLAGS: Record<Locale, () => React.ReactElement> = { th: FlagTh, en: FlagEn };

/** Each language named in itself, so the label reads to the person switching TO it. */
const NAMES: Record<Locale, string> = { th: "ไทย", en: "English" };

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
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("nav.language")}: ${NAMES[locale]}`}
        // 44px tap target around a 24px flag. The switch lives in a 72px
        // header on a phone, where a 24px hit area is a miss.
        className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-cream-wash"
      >
        <Flag locale={locale} className="size-6" />
      </button>

      {open && (
        <ul
          role="menu"
          // Glass, and one of only three surfaces in the app that gets it: a
          // menu is a control floating above content, which is exactly what
          // Apple's material is for. `overflow-hidden` has to stay, or the
          // rounded corners clip the blur into a square.
          className="glass absolute right-0 z-50 mt-1 min-w-[9rem] overflow-hidden rounded-md py-1"
        >
          {LOCALES.map((l) => (
            <li key={l} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-body transition-colors hover:bg-black/5 ${
                  locale === l ? "text-ink" : "text-slate"
                }`}
              >
                <Flag locale={l} className="size-5 shrink-0" />
                <span>{NAMES[l]}</span>
                {locale === l && (
                  <span aria-hidden className="ml-auto text-primary">
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
