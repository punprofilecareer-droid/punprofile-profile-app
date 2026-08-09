"use client";

/**
 * The TH/EN switch in the header.
 *
 * Deliberately quiet: navigation chrome should never compete with page content
 * for colour attention (`design.md` → Components), and changing language is not
 * the action any screen is asking for. The active side is Ink, the other is
 * Neutral 500, with no fill on either.
 */

import { LOCALES } from "@/lib/locale";
import { useCopy } from "./LocaleProvider";

export default function LocaleToggle() {
  const { locale, setLocale, t } = useCopy();

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t("nav.language")}>
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-neutral-300">/</span>}
          <button
            type="button"
            onClick={() => setLocale(l)}
            aria-current={locale === l}
            className={`rounded-sm px-1.5 py-1 text-label uppercase transition-colors ${
              locale === l ? "text-ink" : "text-neutral-500 hover:text-primary"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
