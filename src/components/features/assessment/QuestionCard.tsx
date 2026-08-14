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
}: {
  prompt: string;
  options: CardOption[];
  select?: "one" | "many";
  /** A string in "one" mode, a list in "many" mode. */
  selected?: string | string[];
  onSelect: (value: string | string[]) => void;
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
    <div className="mx-auto w-full max-w-md px-6 py-8">
      <div className="mb-1 flex min-h-6 items-center justify-between">
        <p className="text-caption text-neutral-500">
          {t("assess.progress", { step, total })}
        </p>
        {/* Quiet on purpose: revising an answer is allowed (PRD § 11) but it is
            not the action the screen is asking for. */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="-mr-2 rounded-sm px-2 py-1 text-caption text-slate underline underline-offset-2 transition-colors hover:text-primary"
          >
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
        {/* Teal, not Terracotta: progress is feedback, not the view's action. */}
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <h2 id={`q-${step}`} className="mb-4 text-h4">
        {prompt}
      </h2>
      <div
        className="flex flex-col gap-2"
        role="group"
        aria-labelledby={`q-${step}`}
      >
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => handleTap(o.value)}
            aria-pressed={isChosen(o.value)}
            className={`min-h-12 rounded-md border px-4 py-3 text-left text-body transition-colors ${
              isChosen(o.value)
                ? "border-primary bg-primary text-on-primary"
                : "border-neutral-300 bg-surface hover:bg-mint-wash"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {/* A "many" question always needs this, since tapping toggles rather than
          commits. A "one" question grows it only when an answer is already
          there, which means the candidate came back to look: without it their
          only way forward would be to re-tap an option they had not come to
          change. */}
      {(select === "many" || chosen.length > 0) && (
        <button
          onClick={onContinue}
          disabled={chosen.length === 0}
          className="mt-5 min-h-12 w-full rounded-md bg-accent px-7 py-3.5 text-label text-on-accent transition-colors hover:bg-accent-bright disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {t("assess.continue")}
        </button>
      )}
    </div>
  );
}
