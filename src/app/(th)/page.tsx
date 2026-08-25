"use client";

/**
 * The home page. Rebuilt 17/08/2026, rebuilt again 24/08/2026.
 *
 * **The second rebuild is Paul's instruction to build it like the reference
 * product, careersy.ai.** `home-page-v2.md` in the coaching repo maps all
 * sixteen of their sections onto what PunProfile actually has, and records the
 * four that cannot be reproduced without inventing proof: customer results,
 * three named testimonials, a lead-magnet PDF, and a founder back-catalogue.
 * Three of those four are the same reason, which is that they have customers
 * and this does not yet.
 *
 * ---------------------------------------------------------------------------
 * WHAT WAS ACTUALLY WRONG, WHICH IS MORE THAN THE /services RENAME
 * ---------------------------------------------------------------------------
 *
 * Three of the six sections said something the site contradicted.
 *
 * Section 3 read `services.ts`, the three 1:1 coaching offerings, so the front
 * door named only the half that requires asking. Since 23/08/2026 the catalogue
 * is five products plus coaching and most of it can be bought without a
 * conversation, and a stranger could not learn that here.
 *
 * Its intro said everyone starts with career coaching. After the token ladder
 * that is not the funnel: CV Check, Matched Jobs and the Fit Report start with
 * nobody. A claim about how the business works, not a wording problem.
 *
 * Section 5 was "the section nothing else on the site carries", the only place
 * answering cost, and it deliberately printed no prices. `/pricing` has carried
 * that with real numbers since 23/08/2026, and two of its three rows were the
 * same strings word for word.
 *
 * ---------------------------------------------------------------------------
 * NINE SECTIONS, AND FOUR OF THEM ARE UNTOUCHED
 * ---------------------------------------------------------------------------
 *
 * The hero, the market snapshot, the visa paragraph and the close are exactly
 * as Paul wrote them. Triage, the catalogue and the FAQ teaser are new frames
 * around strings he has already reviewed. Only the problem statement, the four
 * steps, the sample and a handful of headings are genuinely new Thai.
 *
 * That is the design, not an accident of scheduling: the cheapest honest page
 * is the one that reuses reviewed copy rather than writing around it, and every
 * new string costs a round trip through `thai-review-queue.md`.
 *
 * **The primary action is still the assessment.** `cta.ts`'s reasoning for `/`
 * is unchanged: the check is the cheapest thing we can ask a stranger for and
 * the only one that hands something back the same minute. What changed is the
 * secondary, from `/coaching` to `/pricing`, because until last week nothing on
 * this site had a price and now the second question is answerable in one tap.
 * One filled action per view per `design.md`; every other route on this page is
 * a text link or a card.
 */


import Image from "next/image";
import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import SampleRead from "@/components/features/home/SampleRead";
import Triage from "@/components/features/home/Triage";
import Catalogue from "@/components/features/home/Catalogue";
import { EYEBROW } from "@/lib/content/footer";
import { MARKET } from "@/lib/content/market-snapshot.generated";
import { FAQ, FAQ_HEADING } from "@/lib/content/faq";
import {
  CATALOGUE_HEADING,
  CLOSE_LEAD,
  FAQ_TEASER_HEADING,
  HERO_MASCOT_ALT,
  HERO_REFRAME,
  HERO_STANDING,
  HOW_HEADING,
  HOW_STEPS,
  MARKET_BODY,
  MARKET_FOOT,
  MARKET_HEADING,
  MARKET_STATS,
  PROBLEM_BODY,
  PROBLEM_HEADING,
  RESULTS,
  RESULTS_HEADING,
  SAMPLE_HEADING,
  TRIAGE_HEADING,
  TRIAGE_LEAD,
  VISA_BODY,
  WHO_BODY,
  WHO_HEADING,
} from "@/lib/content/home";

export default function Home() {
  const { t, pick, path, locale } = useCopy();

  return (
    <div className="w-full">
      {/* Full-bleed hero on `primary-container`. Olive is the brand and this is
          the brand's front door, so it takes the brand ground.

          The illustration is `mascot-magnifier` and not `mascot-stepping`, which
          is `/coaching`'s hero on this same ground. Two identical heroes on the
          two most-visited pages is a flat site rather than a consistent one.

          Brand lime is deliberately unused. It is the one unmissable ground per
          page and the hero is where it would go, but a button on lime has to be
          `btn-contrast` and `CallToAction` has no variant prop, on purpose. */}
      <section className="bg-primary-container px-6 py-16 medium:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 large:grid-cols-[1.15fr_1fr]">
          <div>
            {/* Tracked and uppercased in English, neither in Thai. See `EYEBROW`
                in `content/footer.ts` for why that is a script fact rather than
                a preference. */}
            <p className={`text-on-surface-variant ${EYEBROW(locale)}`}>{t("landing.eyebrow")}</p>
            <h1 className="mt-5 text-display-small text-balance">{t("landing.headline")}</h1>
            {/* Standing, then the reframe, then what we do, and the order is
                the argument: we have heard this before, it is the rulebook
                rather than you, here is what we work on. The subhead comes last
                because it is the only one that also has to stand alone as the
                site's meta description, and a description that opened on
                "we have talked to hundreds" would be describing us in a search
                result rather than the page. */}
            <div className="mt-6 flex max-w-xl flex-col gap-4">
              <p className="text-body-large text-on-surface-variant">{pick(HERO_STANDING)}</p>
              <p className="text-body-large text-on-surface-variant">{pick(HERO_REFRAME)}</p>
              <p className="text-body-large text-on-surface-variant">{t("landing.subhead")}</p>
            </div>
            <CallToAction page="/" className="mt-8" />
            <p className="mt-3 text-body-medium text-on-surface-variant">
              {t("landing.reassurance")}
            </p>
          </div>

          {/* The asset bakes its own mint in, so the panel is set to the
              illustration's exact background rather than to a token two shades
              off. Hidden below `large` for the same reason `/coaching`'s is: on
              a phone it pushes the headline and the button below the fold, and
              the button is the whole job of this section. */}
          <div
            className="hidden overflow-hidden rounded-large large:block"
            style={{ backgroundColor: "#e4fbf5" }}
          >
            <Image
              src="/mascot-magnifier.png"
              alt={pick(HERO_MASCOT_ALT)}
              width={1442}
              height={720}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 pb-16">
        {/* The one section about PunProfile doing work rather than making a
            claim, which is why it comes before anything the page asserts about
            itself. Every figure is read from the generated snapshot and the
            window is printed: a screening number with no window is a boast. */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(MARKET_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(MARKET_BODY)}</p>
          <div className="mt-8 grid gap-4 medium:grid-cols-3">
            {MARKET_STATS.map((stat) => (
              <div key={stat.field} className="card-outlined rounded-large px-6 py-7">
                <p className="text-headline-large text-primary">{MARKET[stat.field]}</p>
                <p className="mt-2 text-body-large text-on-surface">{t(stat.label)}</p>
              </div>
            ))}
          </div>
          {/* The window is one sentence in both languages rather than three
              fragments joined here, which is the rule `copy.ts` states for
              placeholders: Thai puts the dates in its own place and only the
              whole sentence can carry that. */}
          <p className="mt-4 text-body-medium text-on-surface-variant">
            {pick(MARKET_FOOT)
              .replaceAll("{from}", MARKET.from)
              .replaceAll("{to}", MARKET.to)}
          </p>
        </section>

        {/* ------------------------------------------------- the problem */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(PROBLEM_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(PROBLEM_BODY)}</p>
        </section>

        {/* ------------------------------------------------------- triage

            The reference product's best idea, and the one this page most
            needed: a reader arriving from a job post does not know what a Fit
            Report is and should not have to. Five of the six lines are answer
            options out of `questions.ts`, so this is the words candidates
            actually use rather than personas invented to sell something. */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(TRIAGE_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(TRIAGE_LEAD)}</p>
          <Triage />
        </section>

        {/* -------------------------------------------------- how it works */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(HOW_HEADING)}</h2>
          <ol className="mt-8 flex flex-col gap-8">
            {HOW_STEPS.map((step) => (
              <li key={step.n} className="flex gap-5">
                {/* The number is decorative: an ordered list already carries
                    the sequence to a screen reader, and reading "one, one" is
                    the cost of drawing it without saying so. */}
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-title-medium text-on-secondary-container"
                >
                  {step.n}
                </span>
                <div className="min-w-0">
                  <h3 className="text-title-large">{pick(step.title)}</h3>
                  <p className="mt-2 text-body-large text-on-surface-variant">{pick(step.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------- a sample first read

            The numbers in here are invented and the component says so twice,
            above the card and under it. It is the only fabricated thing on the
            site and it is publishable because it illustrates a format rather
            than asserting a result. See `SampleRead.tsx`. */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(SAMPLE_HEADING)}</h2>
          <div className="mt-6">
            <SampleRead />
          </div>
        </section>

        {/* ---------------------------------------------------- catalogue

            Replaces the old services cards AND the old cost table. Read from
            `products.ts` at render, split by what it costs rather than by what
            it is, because that is the question a stranger is holding. */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(CATALOGUE_HEADING)}</h2>
          <Catalogue />
        </section>
      </div>

      {/* ---------------------------------------------- visa sponsorship

          Name the objection, then refuse the magic, in the same breath as the
          offer. Paul's own paragraph, unchanged since 17/08/2026, and short on
          purpose.

          **Moved on 24/08/2026 and not rewritten.** It sat after the old
          services cards; it now sits after the catalogue, which is the same
          position in the argument: the offer has just been made and this is the
          question the reader is holding while they read it.

          `secondary-container` teal, the second of the three rotation grounds
          this page uses. Not `tertiary-container`: blue is EU Fit Check's
          identity and spending it on a PunProfile section blurs the one
          distinction the sub-brand exists to make.

          **No heading.** It had one, and his sentence opens on the same three
          words it did. Paraphrasing him to fix that is not available and
          inventing a heading that says something else is worse, so the
          paragraph is the section, set one tier up in `headline-small`. */}
      <section className="bg-secondary-container px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="max-w-2xl text-headline-small">{pick(VISA_BODY)}</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 pb-16">
        {/* --------------------------------------------------- who this is

            Paul's call of 24/08/2026, option 1c: a line about who is behind
            this and no personal statistics. The reference product opens with
            thirteen years and 26,000 resumes; nothing of that kind is claimed
            here, and the only figures on this page are the pipeline's, which
            sit in the section above the fold rather than in this one. */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(WHO_HEADING)}</h2>
          <p className="mt-3 max-w-2xl text-body-large text-on-surface-variant">
            {pick(WHO_BODY)}
          </p>
        </section>

        {/* ------------------------------------------------------- results

            Renders nothing while `RESULTS` is empty, which is today and which
            is the point. There are no placed clients and the Social Proof
            pillar is empty, so the shape is held in `home.ts` for the day there
            is a real one, and no heading, empty state or "coming soon" appears
            in the meantime: a visible placeholder for social proof is itself a
            claim that social proof is imminent. */}
        {RESULTS.length > 0 && (
          <section className="mt-20">
            <h2 className="text-headline-small">{pick(RESULTS_HEADING)}</h2>
            <ul className="mt-8 flex flex-col gap-6">
              {RESULTS.map((r) => (
                <li key={r.id} className="card-outlined rounded-large px-6 py-7">
                  <p className="text-body-large text-on-surface">{pick(r.quote)}</p>
                  <p className="mt-3 text-body-medium text-on-surface-variant">{pick(r.who)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --------------------------------------------------- FAQ teaser

            Three questions and a link, which is what the reference product
            does. Read from `faq.ts` rather than restated, and deliberately not
            expandable: an accordion here would be a second FAQ to maintain. */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(FAQ_TEASER_HEADING)}</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {FAQ.slice(0, 3).map((item, i) => (
              <li key={i} className="border-b border-outline-variant pb-4 text-body-large">
                {pick(item.q)}
              </li>
            ))}
          </ul>
          <Link
            href={path("/faq")}
            className="mt-6 inline-block text-body-large text-primary underline underline-offset-2"
          >
            {pick(FAQ_HEADING)}
          </Link>
        </section>

        <section className="py-16 text-center">
          <p className="text-title-medium text-on-surface">{pick(CLOSE_LEAD)}</p>
          {/* Primary only. The secondary belongs to the page and has already
              appeared once, under the hero. */}
          <CallToAction page="/" className="mt-6" align="center" show="primary" />
        </section>
      </div>
    </div>
  );
}
