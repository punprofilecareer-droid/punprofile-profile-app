"use client";

/**
 * Frequently asked questions. TASK-087, 14/08/2026.
 *
 * Native `<details>` rather than a JS accordion: it is keyboard operable and
 * announced correctly with no code, it survives before hydration, and browser
 * find-in-page opens a closed section in current Chrome and Safari, which no
 * hand-built version does. The only cost is that the disclosure triangle needs
 * hiding, which is one line.
 *
 * Every answer is sourced. See the note at the top of `src/lib/content/faq.ts`
 * for what this page is deliberately not allowed to say.
 */

import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import { FAQ, FAQ_CLOSE, FAQ_HEADING, FAQ_INTRO } from "@/lib/content/faq";

export default function FaqPage() {
  const { pick, path } = useCopy();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-headline-large">{pick(FAQ_HEADING)}</h1>
      <p className="mt-3 text-body-large text-on-surface-variant">{pick(FAQ_INTRO)}</p>

      <div className="mt-10 flex flex-col gap-3">
        {FAQ.map((item) => (
          <details
            key={item.q.en}
            className="card-outlined group rounded-large px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body-large text-on-surface">
              {pick(item.q)}
              {/* Rotates rather than swapping glyphs, so the open and closed
                  states are the same shape moving and cannot land at different
                  optical weights between the Thai and Latin stacks. */}
              <span
                aria-hidden
                className="shrink-0 text-on-tertiary-container transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-4 flex flex-col gap-3">
              {item.a.map((p, i) => (
                <p key={i} className="text-body-large text-on-surface-variant">
                  {pick(p)}
                </p>
              ))}
              {item.link && (
                <Link
                  href={path(item.link.href)}
                  className="text-body-large text-primary underline underline-offset-2"
                >
                  {pick(item.link.label)}
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>

      <div className="card-tonal mt-12 rounded-large px-6 py-7">
        <p className="text-body-large text-on-surface">{pick(FAQ_CLOSE)}</p>
        <CallToAction page="/faq" className="mt-5" />
      </div>
    </div>
  );
}
