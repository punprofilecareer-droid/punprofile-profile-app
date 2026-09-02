"use client";

/**
 * `/method`. Added 26/08/2026.
 *
 * The page walks `GATES` from `model.ts` rather than a list of its own, so the
 * published order and the published bars are the implemented ones by
 * construction. See the header of `src/lib/content/method.ts` for why this page
 * exists, and for the one day it carried the gates without their bars.
 *
 * Blocks, per `Narrative_System.md`: B1 carries the claim and the ask, B6 the
 * gates as spec rows, B10 the limit, B8 the ask again. The limit band is above
 * the closing panel and not below it, which is the one rule `verify:narrative`
 * enforces about page order.
 */

import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import Band from "@/components/Band";
import { HERO_HEADING, SECTION_HEADING } from "@/lib/content/footer";
import { GATES } from "@/lib/model";
import {
  CLAIM_BODY,
  CLAIM_HEADING,
  GATES_HEADING,
  GATES_LOWEST,
  GATES_ORDER,
  GATE_BAR,
  GATE_QUESTIONS,
  LIMIT_BODY,
  LIMIT_HEADING,
  METHOD_CLOSE,
  METHOD_HEADING,
  METHOD_INTRO,
  THRESHOLD_BODY,
  THRESHOLD_HEADING,
  VERBS,
} from "@/lib/content/method";

export default function MethodPage() {
  const { pick, t, locale } = useCopy();

  return (
    <div className="w-full">
      <Band block="B1" ground="canvas">
        <h1 className={HERO_HEADING(locale)}>{pick(METHOD_HEADING)}</h1>
        <p className="mt-4 max-w-2xl text-body-large text-on-surface-variant">
          {pick(METHOD_INTRO)}
        </p>
      </Band>

      <Band block="B6" ground="soft">
        <h2 className={SECTION_HEADING(locale)}>{pick(CLAIM_HEADING)}</h2>
        <p className="mt-4 max-w-2xl text-body-large text-on-surface">{pick(CLAIM_BODY)}</p>

        <div className="mt-10 grid gap-6 medium:grid-cols-2">
          {VERBS.map((verb) => (
            <div key={verb.name.en} className="card-plain px-6 py-6">
              <p className="text-heading-md text-ink-deep">{pick(verb.name)}</p>
              <p className="mt-3 text-body-large text-on-surface-variant">{pick(verb.body)}</p>
            </div>
          ))}
        </div>

        <hr className="mt-12 border-line" />

        <h2 className={`mt-12 ${SECTION_HEADING(locale)}`}>{pick(THRESHOLD_HEADING)}</h2>
        <div className="mt-4 flex max-w-2xl flex-col gap-3">
          {THRESHOLD_BODY.map((p, i) => (
            <p key={i} className="text-body-large text-on-surface-variant">
              {pick(p)}
            </p>
          ))}
        </div>

        <h2 className={`mt-12 ${SECTION_HEADING(locale)}`}>{pick(GATES_HEADING)}</h2>
        {/*
          One row per gate, numbered by its position in `GATES`. The name comes
          from `copy.ts`, which is where the spider chart's axes already come
          from, so a candidate reads the same words here and on their own result.
        */}
        <ol className="mt-6 flex flex-col">
          {GATES.map((gate, i) => (
            <li
              key={gate.key}
              className="flex items-baseline gap-5 border-b border-line py-5 last:border-b-0"
            >
              <span aria-hidden className="text-display-sm text-on-tertiary-container">
                {i + 1}
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="text-heading-md text-ink-deep">
                    {t(`dimension.${gate.key}`)}
                  </span>
                  {/* The bar, published 26/08/2026 once Paul confirmed it. The
                      number is read off `GATES`, never written in the content
                      module, so the published bar and the enforced bar are the
                      same value by construction. */}
                  <span className="text-body-md-strong text-on-tertiary-container">
                    {pick(GATE_BAR)} {gate.bar.toFixed(1)}
                  </span>
                </span>
                <span className="mt-1 block text-body-large text-on-surface-variant">
                  {pick(GATE_QUESTIONS[gate.key])}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-2xl text-body-large text-on-surface-variant">
          {pick(GATES_ORDER)}
        </p>
        <p className="mt-3 max-w-2xl text-body-large text-on-surface-variant">
          {pick(GATES_LOWEST)}
        </p>
      </Band>

      <Band block="B10" ground="canvas">
        <h2 className={SECTION_HEADING(locale)}>{pick(LIMIT_HEADING)}</h2>
        <div className="mt-4 flex max-w-2xl flex-col gap-3">
          {LIMIT_BODY.map((p, i) => (
            <p key={i} className="text-body-large text-on-surface-variant">
              {pick(p)}
            </p>
          ))}
        </div>
      </Band>

      <Band block="B8" ground="dark" align="center" className="text-center">
        <p className={SECTION_HEADING(locale)}>{pick(METHOD_CLOSE)}</p>
        <CallToAction page="/method" className="mt-8" align="center" show="primary" />
      </Band>
    </div>
  );
}
