"use client";

/**
 * TASK-020: one tap-only question per screen. No free text anywhere in Stage 1
 * (PRD § 1 Magic Moment), and the selected state is optimistic: it never
 * flickers while the mutation is in flight (§ 11 Edge Cases).
 *
 * Two modes. A "one" question commits on tap and the parent advances. A "many"
 * question toggles and cannot auto-advance, so it carries its own Continue
 * button and commits once, with the full list, when that is pressed.
 */

import { useEffect } from "react";
import ActionBar, { ActionBarSpacer } from "./ActionBar";
import { EXCLUSIVE_VALUES } from "@/lib/content/questions";
import { useCopy } from "@/components/LocaleProvider";

export interface CardOption {
  value: string;
  label: string;
}

/**
 * Every question starts at the top of the page. Added 14/08/2026: the long
 * option lists (target countries, target role) leave the window scrolled down,
 * and the next question then opened halfway through itself with its prompt off
 * screen, which reads as a broken page rather than a long one.
 *
 * A mount effect is enough because the parent passes `key={q.key}`, so this
 * component is remounted on every step. That covers forward, back, and the
 * resume path without the parent knowing anything about scrolling.
 *
 * `instant`, not smooth: a scroll animation on top of a content swap is two
 * motions competing, and the content has already changed by the time it runs.
 */
function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
}

export default function QuestionCard({
  prompt,
  options,
  select = "one",
  selected,
  onSelect,
  onContinue,
  onBack,
  step,
  total,
  phase = "entering",
}: {
  prompt: string;
  options: CardOption[];
  select?: "one" | "many";
  /** A string in "one" mode, a list in "many" mode. */
  selected?: string | string[];
  onSelect: (value: string | string[]) => void;
  /**
   * Which half of the question transition this card is in. The page holds the
   * card in `leaving` for the exit before it swaps the step, which is what
   * gives the candidate time to see their own answer register.
   */
  phase?: "entering" | "leaving";
  /** Required in "many" mode: the only way forward. */
  onContinue?: () => void;
  /** Omitted on the first question, where there is nothing to go back to. */
  onBack?: () => void;
  step: number;
  total: number;
}) {
  const { t } = useCopy();
  useScrollToTop();
  const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const isChosen = (value: string) => chosen.includes(value);

  function handleTap(value: string) {
    if (select === "one") {
      onSelect(value);
      return;
    }
    // An exclusive answer ("not sure yet") replaces everything; picking a real
    // answer drops it. Enforced again server-side in isValidAnswer.
    if (EXCLUSIVE_VALUES.has(value)) {
      onSelect(isChosen(value) ? [] : [value]);
      return;
    }
    const kept = chosen.filter((v) => !EXCLUSIVE_VALUES.has(v));
    onSelect(isChosen(value) ? kept.filter((v) => v !== value) : [...kept, value]);
  }

  return (
    <div
      className={`mx-auto w-full max-w-md px-6 py-8 ${
        phase === "leaving" ? "q-leaving" : "q-entering"
      }`}
    >
      {/* A panel, not a bare column. From the 14/08/2026 design pass: on the
          lavender field, content with no surface under it floated with nothing
          holding it together, and the option rows in particular read as four
          unrelated boxes rather than one set to choose from. */}
      <div className="material rounded-lg px-5 py-6">
        <div className="mb-1 flex min-h-6 items-center justify-between">
          <p className="text-caption text-neutral-500">
            {t("assess.progress", { step, total })}
          </p>
          {/* Quiet on purpose: revising an answer is allowed (PRD § 11) but it
              is not the action the screen is asking for. The arrow earns its
              place by making a small underlined string read as a direction
              rather than as a link to somewhere new. */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="-mr-2 flex items-center gap-1 rounded-sm px-2 py-1 text-caption text-slate transition-colors hover:text-eufit-deep"
            >
              <span aria-hidden>&larr;</span>
              {t("assess.back")}
            </button>
          )}
        </div>
        <div
          className="mb-5 h-1 w-full overflow-hidden rounded-full bg-neutral-300"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step}
        >
          {/* Lavender, not Terracotta: progress is feedback, not the action. */}
          <div
            className="h-full rounded-full bg-eufit transition-all"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <h2 id={`q-${step}`} className="mb-4 text-h4">
          {prompt}
        </h2>
        <div
          className="q-stagger flex flex-col gap-2"
          role="group"
          aria-labelledby={`q-${step}`}
        >
          {options.map((o) => {
            const on = isChosen(o.value);
            return (
              <button
                key={o.value}
                onClick={() => handleTap(o.value)}
                aria-pressed={on}
                className={`flex min-h-12 items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-body transition-colors ${
                  on
                    ? "border-eufit-deep bg-eufit-deep text-on-eufit"
                    : "border-neutral-300 bg-surface hover:border-eufit hover:bg-lavender-wash"
                }`}
              >
                <span>{o.label}</span>
                {/* The ring is the affordance. Without it a row is a box with
                    text in it, and nothing on the screen says these are
                    choices rather than headings until one is already tapped,
                    which is one tap too late. */}
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    on ? "border-on-eufit" : "border-neutral-300"
                  }`}
                >
                  {on && <span className="block size-2.5 rounded-full bg-on-eufit" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* A "many" question always needs this, since tapping toggles rather than
          commits. A "one" question grows it only when an answer is already
          there, which means the candidate came back to look: without it their
          only way forward would be to re-tap an option they had not come to
          change. */}
      {(select === "many" || chosen.length > 0) && (
        <>
          <ActionBarSpacer />
          <ActionBar>
            <button
              onClick={onContinue}
              disabled={chosen.length === 0}
              className="min-h-14 w-full rounded-md bg-accent px-7 py-4 text-body-lg font-semibold text-on-accent transition-colors hover:bg-accent-bright disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              <span className="flex items-center justify-center gap-2">
                {t("assess.continue")}
                <span aria-hidden>&rarr;</span>
              </span>
            </button>
          </ActionBar>
        </>
      )}
    </div>
  );
}
