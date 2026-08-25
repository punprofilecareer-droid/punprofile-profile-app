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
import Band from "@/components/Band";
import { HERO_HEADING, SECTION_HEADING } from "@/lib/content/footer";
import { FAQ, FAQ_CLOSE, FAQ_HEADING, FAQ_INTRO } from "@/lib/content/faq";

export default function FaqPage() {
  const { pick, path, locale } = useCopy();

  return (
    <div className="w-full">
      <Band block="B1" ground="canvas">
        <h1 className={HERO_HEADING(locale)}>{pick(FAQ_HEADING)}</h1>
        <p className="mt-4 text-body-large text-on-surface-variant">{pick(FAQ_INTRO)}</p>
      </Band>

      <Band block="B5" ground="soft">
      <div className="flex flex-col gap-3">
        {FAQ.map((item) => (
          <details
            key={item.q.en}
            className="card-plain group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
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
                  className="text-body-large text-on-primary underline underline-offset-2"
                >
                  {pick(item.link.label)}
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>
      </Band>

      <Band block="B8" ground="dark" align="center" className="text-center">
        <p className={SECTION_HEADING(locale)}>{pick(FAQ_CLOSE)}</p>
        <CallToAction page="/faq" className="mt-8" align="center" show="primary" />
      </Band>
    </div>
  );
}
