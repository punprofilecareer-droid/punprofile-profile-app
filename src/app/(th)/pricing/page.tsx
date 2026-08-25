"use client";

/**
 * `/pricing`. Added 23/08/2026.
 *
 * **Its shape is Careersy's, read off the real page rather than the idea of it,
 * and the thing worth carrying over is what its cards are.** Careersy's four
 * cards are Lite, Starter, Pro and Power: they are PLANS, not products, and its
 * own subhead says every plan has every feature. So nothing on that page
 * duplicates a product page.
 *
 * That is why this page does not carry a card per product. Products have their
 * own pages under the Products menu; a card repeating a product's photo, title
 * and paragraph one click from the page that does it properly is the duplication
 * Paul caught. The cards here are token packs.
 *
 * **Free sits above the packs and not among them**, for the same reason Careersy
 * explains free credits separately rather than as a fifth card: a free card
 * standing beside a paid pack invites a comparison between things that are not
 * alternatives.
 *
 * **This page prints the only prices on the site.** Every product page carries
 * none, decided 23/08/2026, because a number repeated across six marketing pages
 * is six places for it to drift.
 */

import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import TokenCalculator from "@/components/features/pricing/TokenCalculator";
import {
  FREE_HEADING,
  FREE_ITEMS,
  INCLUDES,
  INCLUDES_HEADING,
  NOTHING_FOUND,
  PACKS,
  PACKS_HEADING,
  PRICING_QUESTIONS,
  RECOMMENDED_BADGE,
  TOKEN_BODY,
  TOKEN_EXAMPLES,
  TOKEN_HEADING,
  PRICING_HEADING,
  PRICING_INTRO,
} from "@/lib/content/pricing";
import Band from "@/components/Band";
import { HERO_HEADING, SECTION_HEADING } from "@/lib/content/footer";

export default function PricingPage() {
  const { pick, locale } = useCopy();

  return (
    <div className="w-full">
      <Band ground="canvas" width="wide">
        <h1 className={HERO_HEADING(locale)}>{pick(PRICING_HEADING)}</h1>
        <p className="mt-4 max-w-2xl text-body-large text-on-surface-variant">
          {pick(PRICING_INTRO)}
        </p>
      </Band>

      {/* ------------------------------------------------------------ free */}
      <Band ground="soft" width="wide">
        <h2 className={SECTION_HEADING(locale)}>{pick(FREE_HEADING)}</h2>
        <div className="mt-5 grid gap-4 large:grid-cols-2">
          {FREE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="card-plain px-6 py-5"
            >
              <h3 className="text-heading-sm">{pick(item.name)}</h3>
              <p className="mt-2 text-body-large text-on-surface-variant">{pick(item.body)}</p>
            </div>
          ))}
        </div>
      </Band>

      {/* ----------------------------------------------------------- packs */}
      <Band ground="canvas" width="wide">
        <h2 className={SECTION_HEADING(locale)}>{pick(PACKS_HEADING)}</h2>

        {/* No `items-start`: the default stretch makes the three cards share
            the tallest, and the card is `flex flex-col` with an `mt-auto`
            action, so the extra height lands in the text rather than above the
            button. Same reasoning as the services grid, 17/08/2026. */}
        <div className="mt-6 grid gap-6 large:grid-cols-3">
          {PACKS.map((pack) => (
            <section
              key={pack.id}
              className={`flex flex-col rounded-large border px-6 py-7 ${
                pack.recommended
                  ? "border-tertiary bg-tertiary-container"
                  : "border-outline-variant bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-title-large">{pick(pack.name)}</h3>
                {pack.recommended && (
                  <span className="rounded-full bg-action-container px-2.5 py-0.5 text-body-medium text-on-primary">
                    {pick(RECOMMENDED_BADGE)}
                  </span>
                )}
              </div>

              <p className="mt-1 text-body-large text-on-surface-variant">{pick(pack.tagline)}</p>

              <p className="mt-5 text-headline-small text-on-surface">
                {pack.thb.toLocaleString("en-US")}
                {/* The unit is spelled out rather than abbreviated, and it is
                    the only place THB appears on a card. */}
                <span className="ml-1 text-body-large text-on-surface-variant">THB</span>
              </p>
              <p className="mt-1 text-body-large text-on-surface-variant">
                {pack.tokens} tokens
              </p>

              <p className="mt-5 flex-1 text-body-large text-on-surface-variant">{pick(pack.who)}</p>

              {/* All three buttons are the same action to the same place, which
                  is rule 1 in `cta.ts`: one action may repeat once per card,
                  because a reader finishes reading at a different card than the
                  person beside them. Three buttons to three different places
                  would be three actions and would break it. Payment is a bank
                  transfer arranged one to one, so one destination is also just
                  true. */}
              <CallToAction page="/pricing" className="mt-auto pt-7" show="primary" />
            </section>
          ))}
        </div>
      </Band>

      {/* -------------------------------------------------------- includes */}
      <Band ground="soft" width="wide">
        <h2 className={SECTION_HEADING(locale)}>{pick(INCLUDES_HEADING)}</h2>
        <ul className="mt-5 flex flex-col gap-2.5">
          {INCLUDES.map((item, i) => (
            <li key={i} className="flex gap-3 text-body-large text-on-surface">
              <span aria-hidden className="mt-2 block size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{pick(item)}</span>
            </li>
          ))}
        </ul>
      </Band>

      {/* ----------------------------------------------- what a token buys */}
      <Band ground="canvas" width="wide">
        <h2 className={SECTION_HEADING(locale)}>{pick(TOKEN_HEADING)}</h2>
        <p className="mt-3 max-w-2xl text-body-large text-on-surface-variant">{pick(TOKEN_BODY)}</p>
        <ul className="mt-5 flex flex-col gap-2.5">
          {TOKEN_EXAMPLES.map((item, i) => (
            <li key={i} className="flex gap-3 text-body-large text-on-surface">
              <span aria-hidden className="mt-2 block size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{pick(item)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-2xl text-body-large text-on-surface">{pick(NOTHING_FOUND)}</p>
      </Band>

      {/* ------------------------------------------------------ calculator */}
      <TokenCalculator />

      {/* ------------------------------------------------------- questions */}
      <Band ground="soft" width="wide">
        {PRICING_QUESTIONS.map((item, i) => (
          <div key={i} className="border-b border-outline-variant py-6 last:border-b-0">
            <h3 className="text-heading-sm">{pick(item.q)}</h3>
            {item.a.map((line, j) => (
              <p key={j} className="mt-3 text-body-large text-on-surface-variant">
                {pick(line)}
              </p>
            ))}
          </div>
        ))}
      </Band>

      {/* The page's secondary, exactly once, where a secondary belongs. */}
      <Band ground="dark" align="center" className="text-center">
        <CallToAction page="/pricing" align="center" show="secondary" />
      </Band>
    </div>
  );
}
