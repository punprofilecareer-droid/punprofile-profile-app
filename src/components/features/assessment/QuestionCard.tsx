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

import { EXCLUSIVE_VALUES } from "@/lib/content/questions";

export interface CardOption {
  value: string;
  label: string;
}

export default function QuestionCard({
  prompt,
  options,
  select = "one",
  selected,
  onSelect,
  onContinue,
  continueLabel = "Continue",
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
  continueLabel?: string;
  step: number;
  total: number;
}) {
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
      <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
        {step} / {total}
      </p>
      <div
        className="mb-5 h-1 w-full overflow-hidden rounded bg-black/[.08] dark:bg-white/[.12]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
      >
        <div
          className="h-full rounded bg-black transition-all dark:bg-white"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <h2 id={`q-${step}`} className="mb-4 text-lg font-semibold tracking-tight">
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
            className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
              isChosen(o.value)
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/[.15] hover:bg-black/[.04] dark:border-white/[.2] dark:hover:bg-white/[.08]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {select === "many" && (
        <button
          onClick={onContinue}
          disabled={chosen.length === 0}
          className="mt-5 min-h-12 w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {continueLabel}
        </button>
      )}
    </div>
  );
}
