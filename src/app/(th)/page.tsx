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
import { SERVICES } from "@/lib/content/services";
import { DESTINATIONS } from "@/lib/content/cta";
import Band from "@/components/Band";
import { EYEBROW, HERO_HEADING, SECTION_HEADING } from "@/lib/content/footer";
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
      {/*
        The hero, rebuilt on the reference's shape 25/08/2026: centred, one
        column, and the illustration UNDER the words rather than beside them.

        It was a two-column grid with the mascot on the right, hidden below
        `large` because on a phone it pushed the button under the fold. Centred
        solves that without hiding anything: the words come first at every
        width and the picture follows them, so the phone gets the same page as
        the laptop rather than a reduced one.

        The mascot's own mint panel is gone with the grid. The asset is
        transparent and the ground is white here, so the panel was only ever
        there to fill a column.
      */}
      <Band ground="canvas" width="wide" align="center" className="text-center">
        <div className="mx-auto max-w-3xl">
          {/* Tracked and uppercased in English, neither in Thai. See `EYEBROW`
              in `content/footer.ts` for why that is a script fact rather than
              a preference. */}
          <p className={`text-mute-strong ${EYEBROW(locale)}`}>{t("landing.eyebrow")}</p>
          <h1 className={`mt-5 text-balance ${HERO_HEADING(locale)}`}>{t("landing.headline")}</h1>
          {/* Standing, then the reframe, then what we do, and the order is
              the argument: we have heard this before, it is the rulebook
              rather than you, here is what we work on. The subhead comes last
              because it is the only one that also has to stand alone as the
              site's meta description, and a description that opened on
              "we have talked to hundreds" would be describing us in a search
              result rather than the page. */}
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-body-large text-on-surface-variant">{pick(HERO_STANDING)}</p>
            <p className="text-body-large text-on-surface-variant">{pick(HERO_REFRAME)}</p>
            <p className="text-body-large text-on-surface-variant">{t("landing.subhead")}</p>
          </div>
          <CallToAction page="/" className="mt-8" align="center" />
          <p className="mt-3 text-body-medium text-on-surface-variant">
            {t("landing.reassurance")}
          </p>
        </div>

        <Image
          src="/mascot-magnifier.png"
          alt={pick(HERO_MASCOT_ALT)}
          width={1442}
          height={720}
          priority
          sizes="(max-width: 840px) 92vw, 720px"
          className="mx-auto mt-12 h-auto w-full max-w-[720px]"
        />
      </Band>

        {/* The one section about PunProfile doing work rather than making a
            claim, which is why it comes before anything the page asserts about
            itself. Every figure is read from the generated snapshot and the
            window is printed: a screening number with no window is a boast. */}
      {/*
        The trust row, on the reference's own construction: a hairline, then the
        facts side by side in the open with a small chip each. Not cards.

        They were `card-plain` on a tinted band, which is the shape this system
        uses for an OFFER. These are not offers, they are the page's only
        evidence, and putting them in three boxes made them read as three things
        for sale directly under a hero that is asking for a click.
      */}
      <Band ground="canvas" width="wide">
          <div className="max-w-3xl">
            <h2 className={SECTION_HEADING(locale)}>{pick(MARKET_HEADING)}</h2>
            <p className="mt-3 text-body-large text-on-surface-variant">{pick(MARKET_BODY)}</p>
          </div>
          <hr className="mt-10 border-line" />
          <div className="mt-10 grid gap-10 medium:grid-cols-3">
            {MARKET_STATS.map((stat) => (
              <div key={stat.field}>
                <span
                  aria-hidden
                  className="flex size-9 items-center justify-center rounded-full bg-primary-pale text-body-sm-strong text-on-primary-pale"
                >
                  &#10003;
                </span>
                <p className="mt-4 text-display-md text-on-primary">{MARKET[stat.field]}</p>
                <p className="mt-2 text-body-large text-body">{t(stat.label)}</p>
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
      </Band>

        {/* ------------------------------------------------- the problem */}
      <Band ground="canvas">
          <h2 className={SECTION_HEADING(locale)}>{pick(PROBLEM_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(PROBLEM_BODY)}</p>
      </Band>

        {/* ------------------------------------------------------- triage

            The reference product's best idea, and the one this page most
            needed: a reader arriving from a job post does not know what a Fit
            Report is and should not have to. Five of the six lines are answer
            options out of `questions.ts`, so this is the words candidates
            actually use rather than personas invented to sell something. */}
      <Band ground="canvas">
          <h2 className={SECTION_HEADING(locale)}>{pick(TRIAGE_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(TRIAGE_LEAD)}</p>
          <Triage />
      </Band>

        {/* -------------------------------------------------- how it works */}
      {/*
        Split, with the steps beside a picture, which is the reference's shape
        for a section that explains rather than sells. `mascot-laptop` was the
        one illustration in `public/` that nothing used; the hero has the
        magnifier and `/coaching` has the stepping pose, so all three poses now
        appear once each and none of them twice.

        Hidden below `large`, where a phone should get the steps and not a
        picture of somebody having them explained.
      */}
      <Band ground="soft" width="wide">
        <div className="grid items-center gap-12 large:grid-cols-[1.2fr_1fr]">
          <div>
          <h2 className={SECTION_HEADING(locale)}>{pick(HOW_HEADING)}</h2>
          <ol className="mt-8 flex flex-col gap-8">
            {HOW_STEPS.map((step) => (
              <li key={step.n} className="flex gap-5">
                {/* The number is decorative: an ordered list already carries
                    the sequence to a screen reader, and reading "one, one" is
                    the cost of drawing it without saying so. */}
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-heading-xs text-on-primary"
                >
                  {step.n}
                </span>
                <div className="min-w-0">
                  <h3 className="text-heading-sm">{pick(step.title)}</h3>
                  <p className="mt-2 text-body-large text-on-surface-variant">{pick(step.body)}</p>
                </div>
              </li>
            ))}
          </ol>
          </div>

          <Image
            src="/mascot-laptop.png"
            alt=""
            width={1442}
            height={720}
            sizes="420px"
            className="hidden h-auto w-full large:block"
          />
        </div>
      </Band>

        {/* ------------------------------------------- a sample first read

            The numbers in here are invented and the component says so twice,
            above the card and under it. It is the only fabricated thing on the
            site and it is publishable because it illustrates a format rather
            than asserting a result. See `SampleRead.tsx`. */}
      {/*
        The lime band, and the page's one unmissable ground.

        The reference puts a white card on this ground beside a short line of
        words, and that is exactly the shape this section already had: an
        example of the thing on the left, the claim about it on the right. The
        card is the sample read, which is the closest thing this site has to
        their converter, a working illustration rather than a promise.

        `ground-fixed` inside `Band` pins the content colours, so nothing here
        names one.
      */}
      <Band ground="brand" width="wide">
        <div className="grid items-center gap-10 large:grid-cols-[1fr_1.1fr]">
          <div className="max-w-xl">
            <h2 className={SECTION_HEADING(locale)}>{pick(SAMPLE_HEADING)}</h2>
          </div>
          <div className="card-plain p-6 medium:p-8">
            <SampleRead />
          </div>
        </div>
      </Band>

        {/* ---------------------------------------------------- catalogue

            Replaces the old services cards AND the old cost table. Read from
            `products.ts` at render, split by what it costs rather than by what
            it is, because that is the question a stranger is holding. */}
      <Band ground="canvas" width="wide">
          <div className="max-w-3xl">
            <h2 className={SECTION_HEADING(locale)}>{pick(CATALOGUE_HEADING)}</h2>
          </div>

          {/*
            Three cards with photographs, which is the reference's shape for the
            section that says what you can actually buy, and the one place this
            page had nothing but lists.

            The pictures are the three service photographs, and they are the
            same three that appear on `/coaching`. That is a knowing repeat
            rather than an oversight: they are the only photographs this product
            owns, and a card row here with drawn mascots in it would be a
            different section pretending to be this one. Replace them the day
            there is art of their own.

            Copy is `services.ts`'s own `name` and `question`, and the link goes
            to the anchor `/coaching` already gives each service, so nothing here
            is written twice or can drift.
          */}
          <ul className="mt-10 grid gap-6 large:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.id} className="flex">
                <Link
                  href={`${path("/coaching")}#${s.id}`}
                  className="card-plain group flex w-full flex-col overflow-hidden border border-line duration-[350ms] ease-nav transition-colors hover:border-line-strong"
                >
                  <span className="relative block aspect-[4/3] w-full">
                    <Image
                      src={s.image.src}
                      alt={pick(s.image.alt)}
                      fill
                      sizes="(max-width: 1200px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </span>
                  <span className="flex flex-1 flex-col px-6 py-7">
                    <span className="text-heading-sm">{pick(s.name)}</span>
                    {/* The client's question, not a tagline. A service described
                        by the problem it answers is checkable. */}
                    <span className="mt-3 flex-1 text-body-md text-body">
                      &ldquo;{pick(s.question)}&rdquo;
                    </span>
                    <span className="mt-5 flex items-center gap-2 text-body-sm-strong underline underline-offset-4">
                      {pick(DESTINATIONS.coaching.label)}
                      <span
                        aria-hidden
                        className="duration-[350ms] ease-nav transition-transform group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Catalogue />
      </Band>

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
      <Band ground="canvas">
        <p className={`max-w-3xl ${SECTION_HEADING(locale)}`}>{pick(VISA_BODY)}</p>
      </Band>

        {/* --------------------------------------------------- who this is

            Paul's call of 24/08/2026, option 1c: a line about who is behind
            this and no personal statistics. The reference product opens with
            thirteen years and 26,000 resumes; nothing of that kind is claimed
            here, and the only figures on this page are the pipeline's, which
            sit in the section above the fold rather than in this one. */}
      <Band ground="canvas">
          <h2 className={SECTION_HEADING(locale)}>{pick(WHO_HEADING)}</h2>
          <p className="mt-3 max-w-2xl text-body-large text-on-surface-variant">
            {pick(WHO_BODY)}
          </p>
      </Band>

        {/* ------------------------------------------------------- results

            Renders nothing while `RESULTS` is empty, which is today and which
            is the point. There are no placed clients and the Social Proof
            pillar is empty, so the shape is held in `home.ts` for the day there
            is a real one, and no heading, empty state or "coming soon" appears
            in the meantime: a visible placeholder for social proof is itself a
            claim that social proof is imminent. */}
        {RESULTS.length > 0 && (
        <Band ground="canvas">
            <h2 className={SECTION_HEADING(locale)}>{pick(RESULTS_HEADING)}</h2>
            <ul className="mt-8 flex flex-col gap-6">
              {RESULTS.map((r) => (
                <li key={r.id} className="card-plain px-8 py-9">
                  <p className="text-body-large text-on-surface">{pick(r.quote)}</p>
                  <p className="mt-3 text-body-medium text-on-surface-variant">{pick(r.who)}</p>
                </li>
              ))}
            </ul>
        </Band>
        )}

        {/* --------------------------------------------------- FAQ teaser

            Three questions and a link, which is what the reference product
            does. Read from `faq.ts` rather than restated, and deliberately not
            expandable: an accordion here would be a second FAQ to maintain. */}
      <Band ground="soft">
          <h2 className={SECTION_HEADING(locale)}>{pick(FAQ_TEASER_HEADING)}</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {FAQ.slice(0, 3).map((item, i) => (
              <li key={i} className="border-b border-line pb-4 text-body-large">
                {pick(item.q)}
              </li>
            ))}
          </ul>
          <Link
            href={path("/faq")}
            className="mt-6 inline-block text-body-large text-on-primary underline underline-offset-2"
          >
            {pick(FAQ_HEADING)}
          </Link>
      </Band>

        {/*
          The close is a PANEL, not a band. 25/08/2026.

          The reference ends its page on a dark green card with a 40px radius
          sitting on the white page, and that is a different thing from a
          full-bleed dark ground: a band says the page has changed subject, a
          panel says here is one more thing. This is one more thing.

          It also stopped the page ending on two adjacent dark surfaces, since
          the footer is a quiet band now and the full-bleed version sat directly
          against it.
        */}
        <Band ground="canvas" width="wide">
          <div className="ground-dark rounded-3xl bg-canvas-dark px-8 py-14 text-center medium:px-16">
          <span
            aria-hidden
            className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-heading-sm text-on-primary"
          >
            &#10003;
          </span>
          <p className={`mx-auto mt-6 max-w-2xl ${SECTION_HEADING(locale)}`}>{pick(CLOSE_LEAD)}</p>
          {/* Primary only. The secondary belongs to the page and has already
              appeared once, under the hero. */}
          <CallToAction page="/" className="mt-8" align="center" show="primary" />
          </div>
        </Band>
    </div>
  );
}
