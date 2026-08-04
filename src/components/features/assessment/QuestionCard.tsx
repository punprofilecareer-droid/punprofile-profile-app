"use client";

/**
 * TASK-020: one tap-only question per screen. No free text anywhere in Stage 1
 * (PRD § 1 Magic Moment), and the selected state is optimistic: it never
 * flickers while the mutation is in flight (§ 11 Edge Cases).
 */

export interface CardOption {
  value: string;
  label: string;
}

export default function QuestionCard({
  prompt,
  options,
  selected,
  onSelect,
  step,
  total,
}: {
  prompt: string;
  options: CardOption[];
  selected?: string;
  onSelect: (value: string) => void;
  step: number;
  total: number;
}) {
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
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{prompt}</h2>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            aria-pressed={selected === o.value}
            className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
              selected === o.value
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/[.15] hover:bg-black/[.04] dark:border-white/[.2] dark:hover:bg-white/[.08]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
