"use client";

/**
 * The salary calculator on `/pricing`. Added 23/08/2026.
 *
 * Careersy's equivalent takes a current salary, an EXPECTED UPLIFT and a search
 * duration, and returns an ROI multiple. This one takes two numbers and both
 * come from the reader, which is the whole difference and it is not a styling
 * choice.
 *
 * PunProfile has no placed clients and the Social Proof pillar is empty by its
 * own record, so an uplift figure would be a claim about outcomes nothing here
 * supports. Careersy can default that slider to 15% because it has 300 coached
 * professionals behind it.
 *
 * Three rules, decided 23/08/2026, and they are all the same rule:
 *
 * 1. **No default target salary.** A default is a suggestion, and there is
 *    nothing to suggest from. Both fields start empty.
 * 2. **No currency conversion.** A European figure PunProfile supplied would be
 *    a market claim. The reader types both numbers in whatever they mean by
 *    them, and the arithmetic is a subtraction.
 * 3. **Nothing is stored.** The app keeps nothing identifying on the device
 *    since 10/08/2026, and a salary is the last thing to start with. This is
 *    component state and it dies with the page.
 *
 * Every number on screen therefore traces to something the reader entered or to
 * a price published further up the same page.
 */

import { useState } from "react";
import { useCopy } from "@/components/LocaleProvider";
import {
  CALC_HEADING,
  CALC_IN_TOKENS,
  CALC_NOTE,
  CALC_NOW,
  CALC_PER_MONTH,
  CALC_PER_YEAR,
  CALC_TARGET,
  PACKS,
} from "@/lib/content/pricing";

/** The flat unit price, derived from the smallest pack rather than restated. */
const THB_PER_TOKEN = PACKS[0].thb / PACKS[0].tokens;

/** Digits only, so a pasted "45,000" or "45000 บาท" still reads as a number. */
function toNumber(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  return digits === "" ? 0 : Number(digits);
}

const thb = (n: number) => n.toLocaleString("en-US");

export default function TokenCalculator() {
  const { pick } = useCopy();
  const [now, setNow] = useState("");
  const [target, setTarget] = useState("");

  const perMonth = Math.max(0, toNumber(target) - toNumber(now));
  const perYear = perMonth * 12;
  const inTokens = Math.floor(perMonth / THB_PER_TOKEN);

  // Results appear only once there is something to show. An empty form
  // displaying three zeroes reads as a broken calculator rather than an unused
  // one.
  const ready = perMonth > 0;

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    id: string,
  ) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-large text-on-surface">
        {label}
      </label>
      <input
        id={id}
        // `inputMode` rather than `type="number"`: this audience is on a phone,
        // and a numeric keypad without the spinner and scroll-wheel behaviour of
        // a number input is what is actually wanted here.
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-medium border border-outline-variant bg-surface px-4 py-3 text-body-large text-on-surface"
      />
    </div>
  );

  const row = (label: string, value: string) => (
    <div className="flex items-baseline justify-between gap-4 border-b border-outline-variant py-3 last:border-b-0">
      <span className="text-body-large text-on-surface-variant">{label}</span>
      <span className="text-title-medium text-on-surface">{value}</span>
    </div>
  );

  return (
    <section className="mt-16 rounded-large border border-outline-variant bg-surface px-6 py-8">
      <h2 className="text-title-large">{pick(CALC_HEADING)}</h2>

      <div className="mt-6 grid gap-5 large:grid-cols-2">
        {field(pick(CALC_NOW), now, setNow, "calc-now")}
        {field(pick(CALC_TARGET), target, setTarget, "calc-target")}
      </div>

      {ready && (
        <div className="mt-8">
          {row(pick(CALC_PER_MONTH), thb(perMonth))}
          {row(pick(CALC_PER_YEAR), thb(perYear))}
          {row(pick(CALC_IN_TOKENS), String(inTokens))}
        </div>
      )}

      <p className="mt-6 text-body-medium text-on-surface-variant">{pick(CALC_NOTE)}</p>
    </section>
  );
}
