"use client";

/**
 * The home page. Rebuilt 17/08/2026.
 *
 * It was four elements and all four were about EU Fit Check: a headline, a
 * subhead, the button and a reassurance line. That was right while the
 * assessment was the only thing the app did and wrong from 04/08/2026, when
 * `AGENTS.md` named the app as the product and the assessment as one feature of
 * it alongside a job board and saved jobs.
 *
 * **It is not a third sales page.** `/coaching` sells the engagement and
 * `/services` says what the offerings are. This answers the two questions a
 * stranger arriving from a job post actually holds, in this order: who are you,
 * and what does this cost me. Section 5 is the only place on the site that
 * answers the second one, and it is the reason the page was worth rebuilding
 * rather than rewording.
 *
 * **The primary action is still the assessment**, and the page getting wider
 * does not change that. `cta.ts`'s reasoning for `/` stands: the check is the
 * cheapest thing we can ask a stranger for and the only one that hands
 * something back the same minute. One filled `action` button per view, per
 * `design.md`, and the route on to `/services` in section 3 is a text link
 * rather than a second button.
 *
 * Full reasoning and the section table are in `home-page.md` in the coaching
 * repo's `work-projects/eu-fit-check/`. Wording provenance, string by string,
 * is in `src/lib/content/home.ts`.
 */

import Image from "next/image";
import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import { EYEBROW } from "@/lib/content/footer";
import { DESTINATIONS } from "@/lib/content/cta";
import { MARKET } from "@/lib/content/market-snapshot.generated";
import { SERVICES, CORE_BADGE } from "@/lib/content/services";
import {
  CLOSE_LEAD,
  COST_HEADING,
  COST_ROWS,
  HELP_HEADING,
  HELP_INTRO,
  HERO_MASCOT_ALT,
  HERO_REFRAME,
  HERO_STANDING,
  MARKET_BODY,
  MARKET_FOOT,
  MARKET_HEADING,
  MARKET_STATS,
  VISA_BODY,
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

        {/* The three offerings, read out of `services.ts` rather than restated.
            `01_Project_Foundation.md` owns the structure and that file owns the
            wording; a third rendering would be a third wording.

            Cards are not buttons and the route on carries the destination's own
            label from `cta.ts`, so this page and `/coaching` name `/services` in
            the same words. */}
        <section className="mt-20">
          <h2 className="text-headline-small">{pick(HELP_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(HELP_INTRO)}</p>
          <div className="mt-8 flex flex-col gap-4">
            {SERVICES.map((service) => (
              <div key={service.id} className="card-outlined rounded-large px-6 py-7">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-title-large">{pick(service.name)}</h3>
                  {service.core && (
                    <span className="text-label-large text-primary">{pick(CORE_BADGE)}</span>
                  )}
                </div>
                <p className="mt-2 text-body-large text-on-surface-variant">
                  {pick(service.question)}
                </p>
              </div>
            ))}
          </div>
          <Link
            href={path(DESTINATIONS.services.href)}
            className="mt-6 inline-block text-body-large text-primary underline underline-offset-2"
          >
            {pick(DESTINATIONS.services.label)}
          </Link>
        </section>
      </div>

      {/* Name the objection, then refuse the magic, in the same breath as the
          offer. Paul's own paragraph, and short on purpose.

          `secondary-container` teal, the second of the three rotation grounds
          this page uses. Not `tertiary-container`: blue is EU Fit Check's
          identity and spending it on a PunProfile section blurs the one
          distinction the sub-brand exists to make.

          **No heading.** It had one, and his sentence opens on the same three
          words it did. Paraphrasing him to fix that is not available and
          inventing a heading that says something else is worse, so the
          paragraph is the section. Set one tier up, in `headline-small` rather
          than `title-medium`, because it is now carrying the section on its
          own. */}
      <section className="bg-secondary-container px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="max-w-2xl text-headline-small">{pick(VISA_BODY)}</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6">
        {/* The section nothing else on the site carries.
            `01_Project_Foundation.md` calls the group, the app and the coaching
            one path at three depths; a reader arriving from a job post cannot
            tell which depth costs money, and answering that unprompted is
            cheaper than being asked.

            The group is named and never linked, per Paul's instruction of
            14/08/2026 recorded in `footer.ts`. No prices, because
            `01_Project_Foundation.md` still heads its table "Pricing (pilot
            hypothesis)". */}
        <section className="mt-16">
          <h2 className="text-headline-small">{pick(COST_HEADING)}</h2>
          {/* `card-outlined` and not `card-tonal`. Tonal is
              `secondary-container`, which is the ground of the visa section
              directly above, and three tonal cards under it read as that
              section continuing rather than as a new one. `design.md`'s rule is
              one container tone per section, never blended within one. */}
          <div className="mt-8 grid gap-4 medium:grid-cols-3">
            {COST_ROWS.map((row) => (
              <div key={row.id} className="card-outlined rounded-large px-6 py-7">
                <p className="text-label-large text-primary">{pick(row.price)}</p>
                <h3 className="mt-2 text-title-large">{pick(row.surface)}</h3>
                <p className="mt-3 text-body-medium text-on-surface-variant">{pick(row.body)}</p>
              </div>
            ))}
          </div>
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
