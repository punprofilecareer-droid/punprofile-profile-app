"use client";

/**
 * The three service cards, lifted out of `/services` on 23/08/2026 when that
 * route folded into `/coaching`.
 *
 * **It is a component rather than a page because of one link.** The result
 * screen sends a candidate to `?focus=<dimension>`, and `Service.answers` maps
 * each chart axis to the card that answers it. That is the only link in the
 * product connecting a candidate's own result to what PunProfile does, and
 * `services/page.tsx` was explicit that it is "how the result screen's link can
 * honestly claim to point at the candidate's own chart". Retiring the route
 * without moving this would have broken it or quietly degraded it to a generic
 * page, so the mapping travels with the cards.
 *
 * The mapping stays on `/coaching` rather than moving to a product page, because
 * the four axes map to coaching work rather than to anything plug and play.
 *
 * Everything below the extraction line is unchanged from the page it came from,
 * including the two layout notes that were argued out on screenshots in August.
 */

import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import {
  AI_NOTE,
  CORE_BADGE,
  SERVICES,
  SERVICES_HEADING,
  SERVICES_INTRO,
  serviceForDimension,
} from "@/lib/content/services";

function Body() {
  const { pick } = useCopy();
  const focus = useSearchParams().get("focus");
  const focused = focus ? serviceForDimension(focus) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <h2 className="text-headline-small">{pick(SERVICES_HEADING)}</h2>
      <p className="mt-4 max-w-2xl text-body-large text-on-surface-variant">{pick(SERVICES_INTRO)}</p>

      {/* No `items-start`, removed 17/08/2026 on Paul's screenshot: it sized
          every card to its own content, so three cards with different amounts of
          text ended at three different heights and the row looked broken. The
          default `stretch` makes them share the tallest, and the card is already
          `flex flex-col` with a `flex-1` body, so the extra height lands in the
          text column rather than stretching the image. */}
      <div className="mt-12 grid gap-6 large:grid-cols-3">
        {SERVICES.map((s) => {
          const on = focused === s.id;
          return (
            <section
              key={s.id}
              id={s.id}
              className={`flex flex-col overflow-hidden rounded-large border transition-colors ${
                on ? "border-tertiary bg-tertiary-container" : "border-outline-variant bg-surface"
              }`}
            >
              {/* A fixed 4:3 band, filled. The three illustrations became
                  photographs on 17/08/2026: studio renders on a soft grey with a
                  gradient and a cast shadow, so there is no single colour for a
                  panel to match and the image fills the band edge to edge
                  instead. `object-cover` in a fixed-ratio box also makes all
                  three bands exactly the same height. */}
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={s.image.src}
                  alt={pick(s.image.alt)}
                  fill
                  sizes="(max-width: 1200px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col px-6 py-7">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-title-large">{pick(s.name)}</h3>
                  {s.core && (
                    <span className="rounded-full bg-action-container px-2.5 py-0.5 text-body-medium text-action">
                      {pick(CORE_BADGE)}
                    </span>
                  )}
                </div>

                {on && (
                  <p className="mt-2 text-body-medium text-on-tertiary-container">
                    {pick({
                      en: "Your result points here",
                      th: "ผลประเมินของคุณชี้มาที่บริการนี้",
                    })}
                  </p>
                )}

                {/* The client's question, not a tagline. A service described by
                    the problem it answers is checkable; one described by its
                    benefits is not. */}
                <p className="mt-3 text-title-medium text-on-surface">&ldquo;{pick(s.question)}&rdquo;</p>
                <p className="mt-3 text-body-large text-on-surface-variant">{pick(s.summary)}</p>

                <ul className="mt-5 flex flex-col gap-2.5">
                  {s.includes.map((item, i) => (
                    <li key={i} className="flex gap-3 text-body-large text-on-surface">
                      <span
                        aria-hidden
                        className="mt-2 block size-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span>{pick(item)}</span>
                    </li>
                  ))}
                </ul>

                {/* `mt-auto` pins the action to the bottom of its own card, so
                    the three buttons line up with each other even though the
                    cards above them do not.

                    **Three buttons, one action.** All three go to the same
                    place, which is rule 1 in `cta.ts`. They now read from the
                    `/coaching` entry rather than the retired `/services` one,
                    and that entry's primary is `contact`, so the promise is
                    unchanged. */}
                <CallToAction page="/coaching" className="mt-auto pt-7" show="primary" />
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 max-w-3xl text-body-large text-on-surface-variant">{pick(AI_NOTE)}</p>
    </div>
  );
}

export default function ServiceCards() {
  // `useSearchParams` needs a Suspense boundary or the route opts out of static
  // rendering at build time.
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-5xl px-6" />}>
      <Body />
    </Suspense>
  );
}
