"use client";

/**
 * "You do not need to know which service you need". Added 24/08/2026.
 *
 * The reference product's strongest section, and the one this page most needed:
 * a reader arriving from a job post does not know what a Fit Report is and
 * should not have to. They know what is happening to them. This lets them point
 * at it and be routed.
 *
 * **Five of the six lines are answer options out of `questions.ts`**, which is
 * Thai Paul reviewed long ago, expanded only far enough to stand up outside the
 * question they belong to. `home.ts` records which option each one came from.
 * That is what makes the section honest rather than a set of invented personas:
 * these are the answers real candidates actually pick, taken from the instrument
 * they pick them in.
 *
 * **One card holding rows, not six cards**, since 25/08/2026 and the block
 * library. Six separate cards in a two-column grid read as six offers competing
 * with each other; the reference states the same idea as one white card with a
 * row per answer, hairlines between them and an arrow chip at the end of each.
 * The whole row is still the tap target, which is the size a phone needs.
 */

import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import { TRIAGE } from "@/lib/content/home";

export default function Triage() {
  const { pick, path } = useCopy();

  return (
    <ul className="card-plain mt-8 overflow-hidden border border-line">
      {TRIAGE.map((item) => (
        <li key={item.id} className="border-b border-line last:border-b-0">
          <Link
            href={path(item.href)}
            className="group flex min-h-20 items-center justify-between gap-4 px-6 py-5 duration-[350ms] ease-nav transition-colors hover:bg-canvas-soft"
          >
            <span className="min-w-0">
              <span className="block text-body-md-strong text-ink-deep">{pick(item.line)}</span>
              {/* The reference's row carries a line of body under its title:
                  the title is the situation, the body says what happens if you
                  press it. We have never written those, so each is a slot. */}
              <span className="mt-1 block">
                <span className="text-body-md text-body">{pick(item.body)}</span>
              </span>
            </span>
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-pale text-on-primary-pale duration-[350ms] ease-nav transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
