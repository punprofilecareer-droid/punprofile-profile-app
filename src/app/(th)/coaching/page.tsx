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
import { api } from "../../../../convex/_generated/api";
import { useCopy } from "@/components/LocaleProvider";
import { EYEBROW, HERO_HEADING, SECTION_HEADING } from "@/lib/content/footer";
import Band from "@/components/Band";
import CallToAction from "@/components/CallToAction";
import ServiceCards from "@/components/features/services/ServiceCards";
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
  const { pick, locale } = useCopy();
  if (!stats) return null;

  const lines = PROOF_LINES.map((line) => ({
    line,
    value: stats.shares[line.share],
  })).filter((x): x is { line: (typeof PROOF_LINES)[number]; value: { pct: number } } =>
    Boolean(x.value),
  );
  if (lines.length === 0) return null;

  return (
    <Band ground="soft">
      <h2 className={SECTION_HEADING(locale)}>{pick(PROOF_HEADING)}</h2>
      <div className="mt-6 grid gap-4 medium:grid-cols-3">
        {lines.map(({ line, value }) => (
          <div key={line.share} className="card-plain px-8 py-9">
            <p className="text-headline-large text-on-primary">{value.pct}%</p>
            <p className="mt-2 text-body-large text-on-surface">{pick(line.label)}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-body-medium text-on-surface-variant">{pick(PROOF_FOOT)}</p>
      <p className="mt-6 text-heading-sm text-on-surface">{pick(PROOF_CONCLUSION)}</p>
    </Band>
  );
}

export default function CoachingPage() {
  const { pick, locale } = useCopy();

  return (
    <div className="w-full">
      {/* Full-bleed hero on `primary-container`, the successor to the cream
          wash the mascot illustration was drawn on. `design.md` rotates one
          container tone per major section and says each mascot gets its own.

          Deliberately NOT brand lime, even though this is the page's opening
          section: the founder section below is already on brand orange, and the
          system allows one fixed high-energy ground per page. Two of them is two
          things claiming to be the loudest. 16/08/2026. */}
      <Band ground="canvas" width="wide">
        <div className="mx-auto grid max-w-5xl items-center gap-10 large:grid-cols-[1.15fr_1fr]">
          <div>
            {/* Same rule as the footer: tracked and uppercased in English,
                neither in Thai. See `EYEBROW` in `content/footer.ts`. */}
            <p className={`text-on-surface-variant ${EYEBROW(locale)}`}>{pick(HOOK_EYEBROW)}</p>
            {/* Two lines, second in Teal. `text-balance` because the break
                between them is meaningful and a ragged first line reads as a
                mistake rather than as a beat. */}
            <h1 className={`mt-5 text-balance ${HERO_HEADING(locale)}`}>
              {pick(HOOK_LINE_1)}
              <br />
              <span className="text-on-primary">{pick(HOOK_LINE_2)}</span>
            </h1>
            <div className="mt-6 flex max-w-xl flex-col gap-4">
              {HOOK_BODY.map((p, i) => (
                <p key={i} className="text-body-large text-on-surface-variant">
                  {pick(p)}
                </p>
              ))}
            </div>
            <CallToAction page="/coaching" className="mt-8" />
            <p className="mt-3 text-body-medium text-on-surface-variant">{pick(HOOK_CTA_SUB)}</p>
          </div>

          {/* The asset carries its own cream, a shade off `cream-wash`, so the
              panel is set to the illustration's exact background and rounded.
              A deliberate panel reads as design; a near-match rectangle reads
              as a mistake. Hidden below `lg` rather than shrunk: on a phone it
              would push the headline and the button below the fold, and the
              button is the entire job of this section. */}
          <div className="hidden overflow-hidden rounded-large bg-surface-container large:block">
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
      </Band>

        {/* Recognition before argument. A reader who has ticked three of these
            off in their head reads the rest of the page differently. */}
        <Band ground="canvas">
          <h2 className={SECTION_HEADING(locale)}>{pick(PAIN_HEADING)}</h2>
          <div className="mt-6 grid gap-3 medium:grid-cols-2">
            {PAINS.map((p, i) => (
              <p key={i} className="card-plain px-8 py-6 text-body-large text-on-surface">
                {pick(p)}
              </p>
            ))}
          </div>
        </Band>

        <ProofPanel />

        {/* The machine. The section this business is best placed to write,
            because the framework genuinely does say what it cannot do. */}
        <Band ground="soft">
          <h2 className={SECTION_HEADING(locale)}>{pick(METHOD_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(METHOD_INTRO)}</p>
          <div className="mt-8 grid gap-4 medium:grid-cols-2">
            {METHOD.map((step) => (
              <div key={step.n} className="card-plain px-8 py-9">
                <p className="text-headline-small text-on-primary">{step.n}</p>
                <h3 className="mt-2 text-heading-sm">{pick(step.heading)}</h3>
                <div className="mt-3 flex flex-col gap-3">
                  {step.body.map((b, i) => (
                    <p key={i} className="text-body-large text-on-surface-variant">
                      {pick(b)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Band>

        <Band ground="canvas">
          <h2 className={SECTION_HEADING(locale)}>{pick(PERSONA_HEADING)}</h2>
          <ul className="mt-6 flex flex-col gap-3">
            {PERSONAS.map((p, i) => (
              <li key={i} className="flex gap-3 text-body-large text-on-surface">
                <span aria-hidden className="mt-2.5 block size-2 shrink-0 rounded-full bg-primary" />
                <span>{pick(p)}</span>
              </li>
            ))}
          </ul>

          {/* Saying who you turn away is the cheapest credibility on the page. */}
          <h3 className="mt-10 text-heading-sm">{pick(NOT_FOR_HEADING)}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {NOT_FOR.map((p, i) => (
              <li key={i} className="flex gap-3 text-body-large text-on-surface-variant">
                <span
                  aria-hidden
                  className="mt-2.5 block size-2 shrink-0 rounded-full bg-surface-container-highest"
                />
                <span>{pick(p)}</span>
              </li>
            ))}
          </ul>
        </Band>

      {/* Last, and only now. An About page asks a stranger to care who you
          are before they have a reason to; this asks a reader who has just
          agreed with six things.

          Full-bleed on the lime band, which is the page's one unmissable
          ground. `ground-fixed` pins the content colours, so the running text
          is `ink-deep` at 9.45 rather than a role that would follow the scheme
          and vanish. This is the longest piece of running text on the site, so
          the ratio is the reason the label is not white. */}
      <Band ground="brand">
          <div className="flex flex-col gap-8 medium:flex-row medium:items-start">
            <Image
              src="/paul-portrait.png"
              alt={pick(PORTRAIT_ALT)}
              width={421}
              height={421}
              className="size-32 shrink-0 rounded-full bg-canvas object-cover medium:size-40"
            />
            <div>
              <h2 className={SECTION_HEADING(locale)}>{pick(FOUNDER_HEADING)}</h2>
              <div className="mt-5 flex flex-col gap-4">
                {FOUNDER_BEFORE.map((p, i) => (
                  <p key={i} className="text-body-large">
                    {pick(p)}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* The hinge of the section, given its own line and its own weight.
              In Paul's draft it sits alone between two blocks of paragraphs,
              and running it in as another paragraph would lose the beat. */}
          <p className="mt-10 text-heading-sm">{pick(FOUNDER_TURN)}</p>

          <div className="mt-6 flex max-w-2xl flex-col gap-4">
            {FOUNDER_AFTER.map((p, i) => (
              <p key={i} className="text-body-large">
                {pick(p)}
              </p>
            ))}
          </div>
    </Band>

      {/* The three services, folded in from `/services` on 23/08/2026. They sit
          after the case for coaching and before the close, which is where "and
          here is what that actually is" belongs: a reader who has got this far
          has agreed there is a problem and now wants the shape of the work.

          It carries the `?focus=` contract the result screen depends on. See the
          note at the top of `ServiceCards`. */}
      <Band ground="soft" width="wide">
        <ServiceCards />
      </Band>

      <Band ground="dark" className="text-center">
        <p className={SECTION_HEADING(locale)}>{pick(CLOSE_LEAD)}</p>
        <CallToAction page="/coaching" className="mt-8" align="center" />
      </Band>
    </div>
  );
}
