"use client";

/**
 * What you can get. Added 24/08/2026, replacing two sections at once.
 *
 * It replaces the old "three things we help with", which read `services.ts` and
 * so named only the 1:1 coaching half, and the old cost table, which `/pricing`
 * has carried with real numbers since 23/08/2026.
 *
 * **Read from `products.ts`, never restated.** Same rule the old section
 * followed for `services.ts`: a third rendering of the catalogue is a third
 * wording of it, and this one would drift first because it is the page nobody
 * opens when a product changes.
 *
 * **Split by what it costs, not by what it is**, because that is the question a
 * stranger arriving from a job post is actually holding. Free first: a reader
 * who learns the first two cost nothing is more likely to read the third.
 *
 * `status: "soon"` carries the same `COMING_SOON` line the product pages use,
 * so a candidate cannot tap through to a page and discover there what this page
 * could have told them.
 */

import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import { COMING_SOON, PRODUCTS } from "@/lib/content/products";
import {
  CATALOGUE_FREE,
  CATALOGUE_PAID,
  CATALOGUE_PRICE_LINE,
} from "@/lib/content/home";
import { DESTINATIONS } from "@/lib/content/cta";

/**
 * Free versus token-priced, decided here rather than stored on the product.
 *
 * `products.ts` has no price field on purpose: `/pricing` owns every number and
 * a second place holding what something costs is a second place for it to be
 * wrong. What this array holds is not a price, it is which of two columns a
 * product belongs in, which is a fact about the catalogue rather than about the
 * money. When a product moves column, it moves here, and `/pricing` is still
 * the only file that knows what anything costs.
 */
const FREE_SLUGS = new Set(["eu-fit-check", "cv-check", "guided-job-hunt"]);

export default function Catalogue() {
  const { pick, path } = useCopy();

  const free = PRODUCTS.filter((p) => FREE_SLUGS.has(p.slug));
  const paid = PRODUCTS.filter((p) => !FREE_SLUGS.has(p.slug));

  const card = (slug: string, name: string, headline: string, soon: boolean) => (
    <li key={slug}>
      <Link
        href={path(`/products/${slug}`)}
        className="card-plain group flex h-full flex-col border border-line px-6 py-7 duration-[350ms] ease-nav transition-colors hover:border-line-strong"
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-heading-sm">{name}</span>
          {soon && (
            <span className="text-caption-strong text-mute-strong">{pick(COMING_SOON)}</span>
          )}
        </span>
        <span className="mt-2 text-body-md text-body">{headline}</span>
      </Link>
    </li>
  );

  return (
    <div className="mt-8 flex flex-col gap-10">
      <div>
        <h3 className="border-b border-line pb-3 text-body-md text-mute-strong">{pick(CATALOGUE_FREE)}</h3>
        <ul className="mt-4 grid gap-4 medium:grid-cols-3">
          {free.map((p) =>
            card(p.slug, pick(p.name), pick(p.headline), p.status === "soon"),
          )}
        </ul>
      </div>

      <div>
        <h3 className="border-b border-line pb-3 text-body-md text-mute-strong">{pick(CATALOGUE_PAID)}</h3>
        <ul className="mt-4 grid gap-4 medium:grid-cols-2">
          {paid.map((p) =>
            card(p.slug, pick(p.name), pick(p.headline), p.status === "soon"),
          )}
        </ul>
        {/* The only price on this page, and it is the unit rather than a pack.
            Paul, 24/08/2026: one number and a link. The unit was held flat at
            50 THB when the packs were decided precisely so that it can be said
            on its own like this and stay true whichever pack someone buys.

            B6 in the block library, 25/08/2026: a fee is a ROW. A chip
            introduces it, the sentence sits in the middle, the way to the full
            prices sits at the end, and hairlines close it top and bottom. It
            was a paragraph followed by a link, which on a page of cards read as
            small print rather than as the price.

            The sentence is not split into a label and a value. It is one string
            in `home.ts` in both languages, and Thai puts the number in its own
            place; pulling "50" out of it here would be inventing copy and would
            break the moment the Thai is reviewed. */}
        <div className="mt-8 border-y border-line py-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-pale text-on-primary-pale"
            >
              &#3647;
            </span>
            <p className="min-w-0 flex-1 text-body-md-strong text-ink-deep">
              {pick(CATALOGUE_PRICE_LINE)}
            </p>
            <Link
              href={path(DESTINATIONS.pricing.href)}
              className="inline-flex min-h-12 shrink-0 items-center rounded-full border border-line-strong px-5 text-body-sm-strong text-ink-deep duration-[350ms] ease-nav transition-colors hover:bg-primary-pale"
            >
              {pick(DESTINATIONS.pricing.label)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
