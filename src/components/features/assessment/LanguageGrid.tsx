"use client";

/**
 * Stage 2, question one: the per-language grid. TASK-072, built 14/08/2026.
 *
 * This is the input Country Reach has been missing since it was designed.
 * Until now reach was computed on English alone, which meant Italy, Poland,
 * Spain and every other local-language market scored zero no matter what the
 * candidate spoke, and the report had to say so. A candidate with German at B2
 * and one with Italian at B2 were the same row in the data.
 *
 * **Not a QuestionCard.** The generic engine renders one prompt and a flat list
 * of options, and this is one question whose follow-ups depend on its own
 * answer. Generalising the engine to handle that would have touched every
 * question in Stage 1 to serve one screen, so this is a custom screen instead,
 * which is also why it lives in Stage 2 rather than inside the main flow.
 *
 * The level pickers appear inline under each language as it is picked rather
 * than on a following screen. A candidate who speaks three languages would
 * otherwise face four screens for one question, and the whole reason this sits
 * after the first read is that the assessment had no room left before it.
 *
 * Everything here is optional. The candidate has already given their contact
 * details and seen their chart; this is extra accuracy they are volunteering,
 * so the skip is a real button and not a small grey link.
 */

import { useState } from "react";
import { useCopy } from "@/components/LocaleProvider";
import { EUROPEAN_LANGUAGES } from "@/lib/country-english";
import ActionBar, { ActionBarSpacer } from "./ActionBar";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];

/** Language names are proper nouns; Thai uses the same names in Thai script. */
const LANGUAGE_TH: Record<string, string> = {
  German: "เยอรมัน",
  French: "ฝรั่งเศส",
  Spanish: "สเปน",
  Italian: "อิตาลี",
  Dutch: "ดัตช์",
  Portuguese: "โปรตุเกส",
  Polish: "โปแลนด์",
  Swedish: "สวีเดน",
  Danish: "เดนมาร์ก",
  Norwegian: "นอร์เวย์",
  Finnish: "ฟินแลนด์",
  Czech: "เช็ก",
  Other: "ภาษาอื่น",
};

export default function LanguageGrid({
  onSubmit,
  onSkip,
}: {
  onSubmit: (levels: Record<string, Level>) => Promise<void>;
  onSkip: () => void;
}) {
  const { t, locale } = useCopy();
  const [levels, setLevels] = useState<Record<string, Level>>({});
  const [busy, setBusy] = useState(false);

  const label = (lang: string) => (locale === "th" ? LANGUAGE_TH[lang] ?? lang : lang);
  const picked = (lang: string) => lang in levels;

  function toggle(lang: string) {
    setLevels((prev) => {
      const next = { ...prev };
      if (lang in next) delete next[lang];
      // B1 as the opening guess, not A1: it is the middle of the ladder, so a
      // candidate is equally likely to move it either way. Defaulting to A1
      // would make understating effortless and overstating deliberate.
      else next[lang] = "B1";
      return next;
    });
  }

  async function submit() {
    setBusy(true);
    // `Other` is collected for the coach but matches no country, so it never
    // reaches the scorer. Dropping it here keeps that true in one place.
    const scored = Object.fromEntries(
      Object.entries(levels).filter(([lang]) => lang !== "Other"),
    );
    await onSubmit(scored as Record<string, Level>);
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-8">
      <div className="material rounded-lg px-5 py-6">
        <h2 className="text-h4">{t("lang.heading")}</h2>
        <p className="mt-2 text-body text-slate">{t("lang.body")}</p>

        <div className="mt-5 flex flex-col gap-2">
          {EUROPEAN_LANGUAGES.map((lang) => {
            const on = picked(lang);
            return (
              <div key={lang}>
                <button
                  type="button"
                  onClick={() => toggle(lang)}
                  aria-pressed={on}
                  className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-body transition-colors ${
                    on
                      ? "border-eufit-deep bg-eufit-deep text-on-eufit"
                      : "border-neutral-300 bg-surface hover:border-eufit hover:bg-lavender-wash"
                  }`}
                >
                  <span>{label(lang)}</span>
                  <span
                    aria-hidden
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      on ? "border-on-eufit" : "border-neutral-300"
                    }`}
                  >
                    {on && <span className="block size-2.5 rounded-full bg-on-eufit" />}
                  </span>
                </button>

                {on && (
                  <div
                    className="mt-2 mb-1 flex gap-1.5 pl-1"
                    role="group"
                    aria-label={`${label(lang)} ${t("lang.levelLabel")}`}
                  >
                    {LEVELS.map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => setLevels((prev) => ({ ...prev, [lang]: lv }))}
                        aria-pressed={levels[lang] === lv}
                        className={`min-h-11 flex-1 rounded-sm border text-caption transition-colors ${
                          levels[lang] === lv
                            ? "border-eufit bg-eufit text-on-eufit"
                            : "border-neutral-300 bg-surface text-slate hover:border-eufit"
                        }`}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-caption text-neutral-500">{t("lang.scale")}</p>
      </div>

      <ActionBarSpacer />
      <ActionBar>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="min-h-14 rounded-md border border-neutral-300 bg-surface px-5 text-body text-slate transition-colors hover:bg-neutral-100"
          >
            {t("lang.skip")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || Object.keys(levels).length === 0}
            className="min-h-14 flex-1 rounded-md bg-accent px-7 py-4 text-body-lg font-semibold text-on-accent transition-colors hover:bg-accent-bright disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            <span className="flex items-center justify-center gap-2">
              {busy ? t("gate.working") : t("lang.submit")}
              {!busy && <span aria-hidden>&rarr;</span>}
            </span>
          </button>
        </div>
      </ActionBar>
    </div>
  );
}
