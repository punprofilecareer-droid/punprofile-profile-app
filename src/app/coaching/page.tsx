"use client";

/**
 * 1-1 Coaching. TASK-089, 14/08/2026. Replaces the About page.
 *
 * A sales page in the order a stranger actually needs it: the mechanism they
 * are losing to, evidence they are not alone in it, the machine, who it is for
 * and who it is not, then who is behind it. The founder section is last on
 * purpose. See the note at the top of `src/lib/content/coaching.ts`.
 *
 * **There is no EU Fit Check call to action on this page**, added 14/08/2026 on
 * Paul's read. It had three. A reader here has already self-selected into
 * wanting coaching, and sending them to a two-minute questionnaire is asking
 * them to go back to the top of a funnel they have walked most of the way down.
 * The check earns its place on the landing page, in the FAQ and on the contact
 * page, where the reader has not yet decided anything. Here the one action is
 * the services, and the only mention of the check is as the source of the
 * numbers, which is a citation rather than an invitation.
 *
 * One accent button per view, per `design.md`. The quiet link to /contact under
 * it is text, not a second button.
 */

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCopy } from "@/components/LocaleProvider";
import { EYEBROW } from "@/lib/content/footer";
import CallToAction from "@/components/CallToAction";
import {
  CLOSE_LEAD,
  FOUNDER_AFTER,
  FOUNDER_BEFORE,
  FOUNDER_HEADING,
  FOUNDER_TURN,
  HOOK_BODY,
  HOOK_CTA_SUB,
  HOOK_EYEBROW,
  HOOK_LINE_1,
  HOOK_LINE_2,
  MASCOT_ALT,
  METHOD,
  METHOD_HEADING,
  METHOD_INTRO,
  NOT_FOR,
  NOT_FOR_HEADING,
  PAINS,
  PAIN_HEADING,
  PERSONAS,
  PERSONA_HEADING,
  PORTRAIT_ALT,
  PROOF_CONCLUSION,
  PROOF_FOOT,
  PROOF_HEADING,
  PROOF_LINES,
} from "@/lib/content/coaching";

function ProofPanel() {
  const stats = useQuery(api.stats.community);
  const { pick } = useCopy();
  if (!stats) return null;

  const lines = PROOF_LINES.map((line) => ({
    line,
    value: stats.shares[line.share],
  })).filter((x): x is { line: (typeof PROOF_LINES)[number]; value: { pct: number } } =>
    Boolean(x.value),
  );
  if (lines.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="text-h3">{pick(PROOF_HEADING)}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {lines.map(({ line, value }) => (
          <div key={line.share} className="material rounded-lg px-6 py-7">
            <p className="text-h2 text-primary">{value.pct}%</p>
            <p className="mt-2 text-body text-ink">{pick(line.label)}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-caption text-neutral-500">{pick(PROOF_FOOT)}</p>
      <p className="mt-6 text-body-lg text-ink">{pick(PROOF_CONCLUSION)}</p>
    </section>
  );
}

export default function CoachingPage() {
  const { pick, locale } = useCopy();

  return (
    <div className="w-full">
      {/* Full-bleed hero on cream-wash, which is the section wash the mascot
          illustration was drawn on. `design.md` rotates one wash per major
          section and says each mascot gets its own, so this is that section. */}
      <section className="bg-cream-wash px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            {/* Same rule as the footer: tracked and uppercased in English,
                neither in Thai. See `EYEBROW` in `content/footer.ts`. */}
            <p className={`text-slate ${EYEBROW(locale)}`}>{pick(HOOK_EYEBROW)}</p>
            {/* Two lines, second in Teal. `text-balance` because the break
                between them is meaningful and a ragged first line reads as a
                mistake rather than as a beat. */}
            <h1 className="mt-5 text-h1 text-balance">
              {pick(HOOK_LINE_1)}
              <br />
              <span className="text-primary">{pick(HOOK_LINE_2)}</span>
            </h1>
            <div className="mt-6 flex max-w-xl flex-col gap-4">
              {HOOK_BODY.map((p, i) => (
                <p key={i} className="text-body-lg text-slate">
                  {pick(p)}
                </p>
              ))}
            </div>
            <CallToAction page="/coaching" className="mt-8" />
            <p className="mt-3 text-caption text-neutral-500">{pick(HOOK_CTA_SUB)}</p>
          </div>

          {/* The asset carries its own cream, a shade off `cream-wash`, so the
              panel is set to the illustration's exact background and rounded.
              A deliberate panel reads as design; a near-match rectangle reads
              as a mistake. Hidden below `lg` rather than shrunk: on a phone it
              would push the headline and the button below the fold, and the
              button is the entire job of this section. */}
          <div className="hidden overflow-hidden rounded-lg bg-[#fcf5e2] lg:block">
            <Image
              src="/mascot-stepping.png"
              alt={pick(MASCOT_ALT)}
              width={1442}
              height={720}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 pb-16">
        {/* Recognition before argument. A reader who has ticked three of these
            off in their head reads the rest of the page differently. */}
        <section className="mt-20">
          <h2 className="text-h3">{pick(PAIN_HEADING)}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PAINS.map((p, i) => (
              <p key={i} className="material rounded-lg px-6 py-5 text-body text-ink">
                {pick(p)}
              </p>
            ))}
          </div>
        </section>

        <ProofPanel />

        {/* The machine. The section this business is best placed to write,
            because the framework genuinely does say what it cannot do. */}
        <section className="mt-20">
          <h2 className="text-h3">{pick(METHOD_HEADING)}</h2>
          <p className="mt-3 text-body-lg text-slate">{pick(METHOD_INTRO)}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {METHOD.map((step) => (
              <div key={step.n} className="material rounded-lg px-6 py-7">
                <p className="text-h3 text-primary">{step.n}</p>
                <h3 className="mt-2 text-h4">{pick(step.heading)}</h3>
                <div className="mt-3 flex flex-col gap-3">
                  {step.body.map((b, i) => (
                    <p key={i} className="text-body text-slate">
                      {pick(b)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-h3">{pick(PERSONA_HEADING)}</h2>
          <ul className="mt-6 flex flex-col gap-3">
            {PERSONAS.map((p, i) => (
              <li key={i} className="flex gap-3 text-body-lg text-ink">
                <span aria-hidden className="mt-2.5 block size-2 shrink-0 rounded-full bg-primary" />
                <span>{pick(p)}</span>
              </li>
            ))}
          </ul>

          {/* Saying who you turn away is the cheapest credibility on the page. */}
          <h3 className="mt-10 text-h4">{pick(NOT_FOR_HEADING)}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {NOT_FOR.map((p, i) => (
              <li key={i} className="flex gap-3 text-body text-slate">
                <span
                  aria-hidden
                  className="mt-2.5 block size-2 shrink-0 rounded-full bg-neutral-300"
                />
                <span>{pick(p)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Last, and only now. An About page asks a stranger to care who you
          are before they have a reason to; this asks a reader who has just
          agreed with six things.

          Full-bleed Mascot Orange, on Paul's call. Ink text rather than white,
          which is not a taste decision: white on this orange holds 3.08:1 and
          fails AA at body size, ink holds 5.12:1 and passes, and this is the
          longest piece of running text on the site. See the token note in
          `globals.css`.

          The portrait keeps its own mint disc rather than being recoloured to
          match. Teal against terracotta is the brand's own pairing, so the
          contrast reads as the system rather than as an unedited asset. */}
      <section className="bg-mascot px-6 py-20 text-ink">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <Image
              src="/paul-portrait.png"
              alt={pick(PORTRAIT_ALT)}
              width={421}
              height={421}
              className="size-32 shrink-0 rounded-full bg-[#c9faee] object-cover sm:size-40"
            />
            <div>
              <h2 className="text-h2">{pick(FOUNDER_HEADING)}</h2>
              <div className="mt-5 flex flex-col gap-4">
                {FOUNDER_BEFORE.map((p, i) => (
                  <p key={i} className="text-body">
                    {pick(p)}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* The hinge of the section, given its own line and its own weight.
              In Paul's draft it sits alone between two blocks of paragraphs,
              and running it in as another paragraph would lose the beat. */}
          <p className="mt-10 text-h3">{pick(FOUNDER_TURN)}</p>

          <div className="mt-6 flex max-w-2xl flex-col gap-4">
            {FOUNDER_AFTER.map((p, i) => (
              <p key={i} className="text-body">
                {pick(p)}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <p className="text-body-lg text-ink">{pick(CLOSE_LEAD)}</p>
        <CallToAction page="/coaching" className="mt-6" align="center" />
      </section>
    </div>
  );
}
