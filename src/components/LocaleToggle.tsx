"use client";

/**
 * The language switch in the header.
 *
 * Flags rather than `TH / EN` since 14/08/2026. The letters asked the reader to
 * decode a two-letter code before they could switch, which is the one thing a
 * language switch must not require: the person who needs it is the person who
 * cannot read the current language.
 *
 * Flags are a compromise and worth naming as one. A flag is a country, not a
 * language, and the Union Jack stands in for English here the way it does on
 * most Thai-facing sites, not because English belongs to Britain. The
 * `aria-label` and the visually hidden text still carry the real language name,
 * so a screen reader never gets the flag.
 *
 * Drawn inline rather than loaded as assets. Two small shapes cost less as
 * markup than as two network requests in a 72px header, and emoji flags were
 * the other option but Windows Chrome renders them as the letters TH and GB,
 * which is the failure this change exists to fix.
 *
 * Deliberately quiet otherwise: navigation chrome should never compete with
 * page content for colour attention (`design.md` → Components). The inactive
 * flag is dimmed and desaturated, the active one is full colour with a ring.
 */

import { LOCALES, type Locale } from "@/lib/locale";
import { useCopy } from "./LocaleProvider";

/** Thailand. Five bands, 1:1:2:1:1, the middle one double height. */
function FlagTh() {
  return (
    <svg viewBox="0 0 60 40" className="h-full w-full" aria-hidden focusable="false">
      <rect width="60" height="40" fill="#A51931" />
      <rect y="6.667" width="60" height="26.666" fill="#F4F5F8" />
      <rect y="13.333" width="60" height="13.334" fill="#2D2A4A" />
    </svg>
  );
}

/** Union Jack. The saltire's red diagonals are offset, hence the clip path. */
function FlagEn() {
  return (
    <svg viewBox="0 0 60 30" className="h-full w-full" aria-hidden focusable="false">
      <clipPath id="locale-toggle-uk-saltire">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath="url(#locale-toggle-uk-saltire)"
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => React.ReactElement> = { th: FlagTh, en: FlagEn };

/** The language's own name, so the label is readable to the person switching to it. */
const NAMES: Record<Locale, string> = { th: "ไทย", en: "English" };

export default function LocaleToggle() {
  const { locale, setLocale, t } = useCopy();

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t("nav.language")}>
      {LOCALES.map((l) => {
        const Flag = FLAGS[l];
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-current={active}
            // 44px tap target around a 24px flag: the switch sits in a 72px
            // header on a phone, and a 24px hit area there is a miss.
            className="flex size-11 items-center justify-center rounded-sm transition-opacity"
          >
            <span
              className={`block h-4 w-6 overflow-hidden rounded-[2px] ring-1 transition-all ${
                active
                  ? "opacity-100 ring-neutral-500"
                  : "opacity-40 grayscale ring-neutral-300 hover:opacity-70 hover:grayscale-0"
              }`}
            >
              <Flag />
            </span>
            <span className="sr-only">{NAMES[l]}</span>
          </button>
        );
      })}
    </div>
  );
}
