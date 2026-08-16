"use client";

/**
 * "Let's finish this in English." 16/08/2026, Paul's call.
 *
 * A candidate who has just said their English is B1 or better is answering a
 * Thai questionnaire about whether they can work in English. Switching the flow
 * over is the product agreeing with them, and it happens immediately: the
 * questions are already in English behind this panel. The panel says so and
 * offers the way back.
 *
 * **It switches rather than asks.** An offer would put a decision in front of
 * someone mid-flow, and the answer to "can you handle this in English" was the
 * question they just answered. The revert is one tap and stays in Thai script
 * whatever the interface language is, so the way back is legible to the person
 * most likely to want it.
 *
 * **Once per session, and only downward from Thai.** It never fires for a
 * candidate already reading in English, and answering the English question a
 * second time does not fire it again, because a prompt that returns after being
 * dismissed is an argument rather than an offer.
 *
 * **Not glass.** `design.md` budgets exactly three glass surfaces and all three
 * are spent. This is a flat card with a soft shadow, on a scrim.
 */

import { useEffect, useRef } from "react";
import { useCopy } from "@/components/LocaleProvider";

export default function EnglishSwitchPrompt({
  onStay,
  onRevert,
}: {
  /** Keep English and close. */
  onStay: () => void;
  /** Put the flow back into Thai and close. */
  onRevert: () => void;
}) {
  const { t } = useCopy();
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // Escape closes it and keeps English, matching the primary action rather
      // than undoing a switch the candidate never objected to.
      if (e.key === "Escape") onStay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStay]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-6 sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="english-switch-title"
    >
      <div className="w-full max-w-sm rounded-lg bg-surface px-6 py-7 shadow-lg">
        <h2 id="english-switch-title" className="text-h4 text-eufit-deep">
          {t("english.switch.title")}
        </h2>
        <p className="mt-3 text-body text-slate">{t("english.switch.body")}</p>
        <button
          ref={primary}
          type="button"
          onClick={onStay}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 text-label text-on-accent transition-colors hover:bg-accent-bright"
        >
          {t("english.switch.stay")}
        </button>
        {/* Always in Thai script. Whoever needs this button is, by definition,
            not reading the one above it comfortably. */}
        <button
          type="button"
          onClick={onRevert}
          className="mt-3 w-full rounded-sm px-2 py-2 text-body text-slate underline underline-offset-2 transition-colors hover:text-eufit-deep"
        >
          {t("english.switch.revert")}
        </button>
      </div>
    </div>
  );
}
