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
 * Cards and not buttons, for the reason the old services section gave: six
 * filled actions on one view is six of them being ignored. Each is a link with
 * the whole card as its target, which is the tap size a phone needs.
 */

import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import { TRIAGE } from "@/lib/content/home";

export default function Triage() {
  const { pick, path } = useCopy();

  return (
    <ul className="mt-8 grid gap-4 medium:grid-cols-2">
      {TRIAGE.map((item) => (
        <li key={item.id}>
          <Link
            href={path(item.href)}
            className="card-outlined group flex h-full min-h-20 items-center justify-between gap-4 rounded-large px-6 py-5 transition-colors hover:bg-surface-container-high"
          >
            <span className="text-body-large text-on-surface">{pick(item.line)}</span>
            <span
              aria-hidden
              className="text-body-large text-primary transition-transform group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
