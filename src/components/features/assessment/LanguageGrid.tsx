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
 * The skip is a real button rather than a grey link, and it WRITES rather than
 * passing through: "I speak no other European language" is an answer, and a
 * different fact from "never reached this question". The first lets Country
 * Reach stand on English honestly; the second leaves it unmeasured. Those two
 * must never look the same, which is the rule the whole product rests on.
 */

import { useEffect, useState } from "react";
import { useCopy } from "@/components/LocaleProvider";
import { EUROPEAN_LANGUAGES } from "@/lib/country-english";
import ActionBar, { ActionBarSpacer } from "./ActionBar";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];

/**
 * A language to its copy key. The names themselves live in `copy.ts` since
 * 25/08/2026; see the note there for why they stopped being treated as proper
 * nouns that live in a component.
 */
const LANGUAGE_KEY = {
  German: "lang.name.german",
  French: "lang.name.french",
  Spanish: "lang.name.spanish",
  Italian: "lang.name.italian",
  Dutch: "lang.name.dutch",
  Portuguese: "lang.name.portuguese",
  Polish: "lang.name.polish",
  Swedish: "lang.name.swedish",
  Danish: "lang.name.danish",
  Norwegian: "lang.name.norwegian",
  Finnish: "lang.name.finnish",
  Czech: "lang.name.czech",
} as const;

export default function LanguageGrid({
  onSubmit,
  onSkip,
  step,
  total,
  onBack,
  hasPanel = false,
}: {
  onSubmit: (levels: Record<string, Level>) => Promise<void>;
  onSkip: () => Promise<void> | void;
  step: number;
  total: number;
  onBack?: () => void;
  /** Whether a block photograph occupies the left half, so the bar stops at the
   *  middle rather than running under the picture. The language grid sits in the
   *  same block as the English question, so it has one. */
  hasPanel?: boolean;
}) {
  const { t } = useCopy();
  const [levels, setLevels] = useState<Record<string, Level>>({});
  const [busy, setBusy] = useState(false);

  const label = (lang: string) =>
    lang in LANGUAGE_KEY ? t(LANGUAGE_KEY[lang as keyof typeof LANGUAGE_KEY]) : lang;
  const picked = (lang: string) => lang in levels;

  function toggle(lang: string) {
    setLevels((prev) => {
      const next = { ...prev };
      if (lang in next) delete next[lang];
      // A1, the floor. Paul, 16/08/2026, reversing the B1 default set on
      // 14/08/2026.
      //
      // The old reasoning was that B1 sits in the middle of the ladder, so a
      // candidate is equally likely to move it either way, where A1 would make
      // understating effortless. That reads well and it ignores what the field
      // is for. This grid feeds Country Reach, so a default nobody touches is
      // scored, and B1 credited someone with a working level they never
      // claimed. A1 is the only default that is true of everyone who has ticked
      // the language and said nothing else about it.
      //
      // Overstating should be deliberate. Understating costs the candidate a
      // point they can correct in one tap; overstating costs them a
      // recommendation built on a language they cannot work in.
      else next[lang] = "A1";
      return next;
    });
  }

  async function skip() {
    setBusy(true);
    await onSkip();
  }

  /**
   * Enter goes forward here too, on the same rule as `QuestionCard`. A step of
   * the sequence that answers a key differently from the sixteen around it is a
   * step that feels broken rather than special; that file carries the reasoning
   * and the pointer-versus-keyboard distinction.
   *
   * Submit rather than skip, and only once something is picked: Enter must never
   * be the key that files an empty answer, because here an empty grid is a real
   * claim, "I speak no other European language", rather than a blank.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (busy || Object.keys(levels).length === 0) return;
      const el = document.activeElement;
      if (el instanceof HTMLElement && el.closest(".tile")) return;
      e.preventDefault();
      void submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // No dependency array on purpose. `submit` and `levels` are rebuilt every
    // render, so re-subscribing each time is what keeps the handler from closing
    // over a stale grid. Adding and removing one listener is cheaper than the
    // bug where Enter files the languages the candidate had picked two taps ago.
  });

  async function submit() {
    setBusy(true);
    // Every entry is a named language now, so there is nothing to drop before
    // scoring. The filter that used to sit here removed `Other`, which left
    // this list on 25/08/2026; `country-english.ts` carries why.
    await onSubmit(levels);
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-8">
      <div className="card-plain border border-line px-5 py-6">
        {/* The same header a QuestionCard shows, because since 14/08/2026 this
            IS one of the questions rather than a bonus round after the result.
            A step in a sequence that hides the counter reads as an
            interruption. */}
        <div className="mb-1 flex min-h-6 items-center justify-between">
          <p className="text-body-medium text-on-surface-variant">
            {t("assess.progress", { step, total })}
          </p>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="-mr-2 flex items-center gap-1 rounded-small px-2 py-1 text-body-medium text-on-surface-variant transition-colors hover:text-on-primary"
            >
              <span aria-hidden>&larr;</span>
              {t("assess.back")}
            </button>
          )}
        </div>
        <div
          className="mb-5 h-1 w-full overflow-hidden rounded-full bg-canvas-soft"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <h2 className="text-title-large">{t("lang.heading")}</h2>
        <p className="mt-2 text-body-large text-on-surface-variant">{t("lang.body")}</p>

        <div className="mt-5 flex flex-col gap-2">
          {EUROPEAN_LANGUAGES.map((lang) => {
            const on = picked(lang);
            return (
              <div key={lang}>
                <button
                  type="button"
                  // Hands focus back after a pointer click, so Enter reaches the
                  // Continue handler below rather than un-picking this language.
                  // `QuestionCard` carries the reasoning and does the same.
                  onClick={(e) => {
                    toggle(lang);
                    if (e.detail > 0) e.currentTarget.blur();
                  }}
                  aria-pressed={on}
                  className="tile"
                >
                  <span>{label(lang)}</span>
                  <span
                    aria-hidden className="tile-mark">
                    {on && <span />}
                  </span>
                </button>

                {on && (
                  <div
                    className="mt-2 mb-1 flex pl-1"
                    role="group"
                    aria-label={`${label(lang)} ${t("lang.levelLabel")}`}
                  >
                    {LEVELS.map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => setLevels((prev) => ({ ...prev, [lang]: lv }))}
                        aria-pressed={levels[lang] === lv}
                        className="segment"
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

        <p className="mt-4 text-body-medium text-on-surface-variant">{t("lang.scale")}</p>
      </div>

      <ActionBarSpacer />
      <ActionBar half={hasPanel}>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={skip}
            disabled={busy}
            className="btn-outlined min-h-14 px-5 text-body-large hover:bg-surface-container"
          >
            {t("lang.skip")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || Object.keys(levels).length === 0}
            className="min-h-14 flex-1 btn-filled px-7 py-4 text-body-large font-semibold"
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
