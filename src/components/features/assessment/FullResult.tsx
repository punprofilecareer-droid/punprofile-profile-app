"use client";

/**
 * TASK-028, PRD § 8 Screen: Full Result. What the contact gate unlocks.
 *
 * Renders `buildCandidateJourney`, the candidate projection that has existed
 * since before this screen did. That projection is a WHITELIST: a typed shape
 * containing only fields safe to show, never the coach view with fields
 * removed, so nothing internal can reach here by being forgotten.
 *
 * Order follows the PRD: chart above the fold on mobile, narrative below,
 * the checklist and uplifts after, CTA at the bottom. The self-reported label
 * is persistent rather than a footnote, because FR-007 requires it to be
 * impossible to miss.
 *
 * The AI-habits section of the journey is deliberately not rendered. Its data
 * comes from a Stage 2 question that is not built, so every row would read
 * "unanswered", which is noise rather than honesty.
 */

import { useMemo } from "react";
import { useCopy } from "@/components/LocaleProvider";
import SpiderChart from "@/components/features/chart/SpiderChart";
import { buildCandidateJourney, buildTeaserSummary } from "@/lib/views";
import { toScoringInput } from "@/lib/content/mapping";
import type { ScoringInput } from "@/lib/scoring";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

type Pathway = Parameters<typeof buildTeaserSummary>[1];

export default function FullResult({
  responses,
  pathway,
  scores,
}: {
  responses: Record<string, unknown>;
  pathway: Pathway;
  scores: Parameters<typeof SpiderChart>[0]["scores"];
}) {
  const { t, locale } = useCopy();

  const input: ScoringInput = useMemo(() => toScoringInput(responses), [responses]);
  // The candidate's name is not passed in. `getSession` deliberately keeps
  // contact fields server-side, and this screen renders the journey's steps and
  // scores, never the name field, so asking for it would widen that surface for
  // nothing.
  const journey = useMemo(
    () => buildCandidateJourney(input, "", locale),
    [input, locale],
  );
  const summary = useMemo(
    () => buildTeaserSummary(input, pathway, locale),
    [input, pathway, locale],
  );

  return (
    <div className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="text-h3">{t("result.headline")}</h1>
      {/* FR-007: persistent, not a footnote. */}
      <p className="mt-2 text-body text-slate">{t("teaser.selfReported")}</p>

      <div className="mt-6">
        <SpiderChart scores={scores} variant="full" />
      </div>
      <p className="mt-2 text-caption text-neutral-500">{t("teaser.hollowMarkers")}</p>

      {/* FR-008: the opening line differs by pathway. */}
      <section className="mt-8 space-y-4">
        <p className="text-body-lg text-ink">{summary.opener}</p>
        <p className="text-body text-slate">{summary.standing}</p>
      </section>

      {journey.strengths.length > 0 && (
        <section className="mt-10">
          <h2 className="text-h4">{t("result.strengthsHeading")}</h2>
          <ul className="mt-3 space-y-2">
            {journey.strengths.map((s) => (
              <li
                key={s.label}
                className="flex items-baseline justify-between gap-4 border-b border-neutral-300 pb-2 text-body"
              >
                <span className="text-ink">{s.label}</span>
                <span className="tabular-nums text-primary-deep">{s.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {journey.next && (
        <section className="mt-10 rounded-lg border border-neutral-300 bg-mint-wash px-6 py-6">
          <h2 className="text-label text-primary-deep">{summary.nextLead}</h2>
          <p className="mt-2 text-body text-ink">{journey.next.title}</p>
          {/* `next.why` is deliberately not rendered. It comes from
              `model.ts`'s actionWhy, which is English-only and built for the
              coach report, so showing it would drop English into a Thai
              screen. It needs a pass through the copy pipeline first. */}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-h4">{t("result.stepsHeading")}</h2>
        <ul className="mt-3 space-y-2">
          {journey.steps.map((s) => (
            <li key={s.label} className="border-b border-neutral-300 pb-2">
              <div className="flex items-baseline gap-3 text-body">
                <span aria-hidden className="w-5 shrink-0 text-primary">
                  {s.status === "done" ? "✓" : s.status === "next" ? "→" : "·"}
                </span>
                <span
                  className={
                    s.status === "done"
                      ? "text-slate line-through decoration-neutral-300"
                      : s.status === "next"
                        ? "font-semibold text-ink"
                        : "text-slate"
                  }
                >
                  {s.label}
                </span>
              </div>
              {s.detail && <p className="ml-8 text-caption text-neutral-500">{s.detail}</p>}
            </li>
          ))}
        </ul>
      </section>

      {/* Computed uplift, never an estimate: each is the candidate's own
          answers re-scored through the real lookups. */}
      {journey.reachable.length > 0 && (
        <section className="mt-10">
          <h2 className="text-h4">{t("result.reachableHeading")}</h2>
          <ul className="mt-3 space-y-4">
            {journey.reachable.map((r) => (
              <li key={r.action} className="rounded-md border border-neutral-300 px-4 py-4">
                <p className="text-body text-ink">{r.action}</p>
                <p className="mt-1 text-caption text-primary-deep">
                  {t("result.reachableLine", {
                    area: r.area,
                    from: r.from === null ? "—" : r.from.toFixed(1),
                    to: r.to === null ? "—" : r.to.toFixed(1),
                  })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-caption text-neutral-500">{journey.measured.line}</p>
      <p className="mt-4 text-caption text-neutral-500">{journey.caveat}</p>

      {/* TASK-046. Hidden until a booking mechanism exists. */}
      {BOOKING_URL && (
        <section className="mt-10">
          <h2 className="text-h4">{t("narrative.cta.heading")}</h2>
          <p className="mt-2 text-body text-slate">{t("narrative.cta.body")}</p>
          <a
            href={BOOKING_URL}
            className="mt-4 inline-block rounded-md bg-accent px-7 py-3.5 text-label text-on-accent transition-colors hover:bg-accent-bright"
          >
            {t("narrative.cta.button")}
          </a>
        </section>
      )}
    </div>
  );
}
