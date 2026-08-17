"use client";

/**
 * What PunProfile does. TASK-084, relaid as cards 14/08/2026.
 *
 * Three cards, illustration on top, then the name, the client's question, what
 * the service covers, and the action. The layout is Paul's call, from a
 * competitor's product grid; the reason it works here is that these three
 * services are genuinely parallel and comparable, which is exactly the shape a
 * card grid reads well and the shape a stacked page of sections does not.
 *
 * **Three buttons, one action.** All three read "Contact me" and all three go
 * to the same place, which is rule 1 of the framework in
 * `src/lib/content/cta.ts`: one action may repeat once per card, because a
 * reader finishes reading at a different card than the person beside them.
 * Three buttons to three DIFFERENT places would be three actions and would
 * break the rule. `show` keeps the page's secondary out of the cards, so it still
 * appears exactly once, at the bottom where it belongs.
 *
 * `?focus=<dimension>` highlights the card that dimension points at, which is
 * how the result screen's link can honestly claim to point at the candidate's
 * own chart. Nothing identifying travels in it: one of four axis names, the
 * same four printed on the chart.
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

function ServicesBody() {
  const { pick } = useCopy();
  const focus = useSearchParams().get("focus");
  const focused = focus ? serviceForDimension(focus) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-headline-large">{pick(SERVICES_HEADING)}</h1>
      <p className="mt-4 max-w-2xl text-body-large text-on-surface-variant">{pick(SERVICES_INTRO)}</p>

      {/* `items-start` so a shorter card keeps its own height instead of
          stretching to match the tallest, and `auto-rows-fr` is deliberately
          NOT used: equal-height cards would leave the two shorter ones with a
          band of dead space above their button. */}
      {/*
        **Feed**, though a fixed one: three services rather than a browsable
        collection. It skips the spec's 2-column medium step deliberately,
        because two columns of three items leaves an orphan on its own row and
        one column reads better than that until all three fit.
      */}
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
              {/* A fixed 4:3 band, filled.
                  
                  The three illustrations became photographs on 17/08/2026, and
                  that changes the treatment rather than just the file. The old
                  ones were flat vector-ish art on a single colour, so the panel
                  behind them was painted to that exact colour and the image had
                  no visible edge. These are studio renders on a soft grey with a
                  gradient and a cast shadow: there is no single colour to match,
                  and a panel painted to the average would show a seam wherever
                  the backdrop falls away.

                  So the image fills the band edge to edge instead, and there is
                  no panel to match. `object-cover` in a fixed-ratio box also
                  makes all three bands exactly the same height, which is half of
                  what Paul asked for; the grid change above is the other half.

                  The sources were cover-cropped to 4:3 at build time rather than
                  here, so the crop is decided once in the asset rather than
                  every render. */}
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
                  <h2 className="text-title-large">{pick(s.name)}</h2>
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
                    cards above them do not. */}
                <CallToAction page="/services" className="mt-auto pt-7" show="primary" />
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 max-w-3xl text-body-large text-on-surface-variant">{pick(AI_NOTE)}</p>

      {/* The page's secondary, exactly once, where a secondary belongs. Not a
          fourth button: the cards already carry the primary. */}
      <CallToAction page="/services" className="mt-12" show="secondary" />
    </div>
  );
}

export default function ServicesPage() {
  // `useSearchParams` needs a Suspense boundary or the route opts out of static
  // rendering at build time.
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-5xl px-6 py-16" />}>
      <ServicesBody />
    </Suspense>
  );
}
