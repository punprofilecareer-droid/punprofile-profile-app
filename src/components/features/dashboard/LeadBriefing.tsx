"use client";

/**
 * The coach's briefing on one lead: what to say, and what to say it about.
 *
 * Renders `buildNarrative` and `buildCoachView`, both of which have existed
 * since before this screen and were previously only reachable through an
 * offline demo script. Nothing here is a new assessment; it is the same scored
 * profile the candidate sees, read from the other side.
 *
 * Coach-facing, so English, and free to use internal vocabulary. That is the
 * whole point of the split in `views.ts`: the candidate journey is a whitelist
 * that `assertCandidateSafe` polices, and this is the view that does not have
 * to hold back.
 *
 * Uplift figures are arithmetic, not estimates: each is the candidate's own
 * answers re-scored through the real lookups. Say them out loud in a call
 * without hedging.
 */

import { useMemo } from "react";
import SpiderChart from "@/components/features/chart/SpiderChart";
import { toScoringInputForLead } from "@/lib/content/mapping";
import { scoreResponse } from "@/lib/scoring";
import { buildNarrative } from "@/lib/narrative";
import { buildCoachView } from "@/lib/views";
import { gradeLead, toGradeInput, NO_COACH_ICP } from "@/lib/leadGrade";
import type { CoachIcp } from "@/lib/leadGrade";

export default function LeadBriefing({
  responses,
  fullName,
  coachIcp = NO_COACH_ICP,
}: {
  responses: Record<string, unknown>;
  fullName: string | null;
  /** What a logged call collected. Fills only what the form left empty. */
  coachIcp?: CoachIcp;
}) {
  const { profile, narrative, coach, grade } = useMemo(() => {
    // `toScoringInputForLead`, not `toScoringInput`: the 90 imported survey
    // leads store their answers under ScoringInput field names, and reading
    // them with the app mapper dropped English, applications, AI fluency,
    // family and salary. Every one of those leads rendered a chart that
    // disagreed with its own stored scores while looking finished.
    const input = toScoringInputForLead(responses);
    const profile = scoreResponse(input);
    return {
      profile,
      narrative: buildNarrative(profile),
      coach: buildCoachView(input, fullName ?? "Lead"),
      // Raw responses, not `input`: the two ICP answers are deliberately kept
      // out of ScoringInput so they cannot reach the candidate's chart.
      grade: gradeLead(toGradeInput(responses), coachIcp),
    };
  }, [responses, fullName, coachIcp]);

  if (Object.keys(responses).length === 0) {
    return (
      <p className="text-body text-neutral-500">
        No answers on this lead, so there is nothing to brief on.
      </p>
    );
  }

  const chartScores = Object.fromEntries(
    profile.dimensions.map((d) => [d.key, d.score ?? undefined]),
  ) as Parameters<typeof SpiderChart>[0]["scores"];

  const chartLabels = Object.fromEntries(
    profile.dimensions.map((d) => [d.key, d.label]),
  ) as Parameters<typeof SpiderChart>[0]["axisLabels"];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-h4">Executive summary</h2>
        <p className="mt-3 text-body-lg text-ink">{narrative.headline}</p>
        <p className="mt-2 text-caption text-neutral-500">{narrative.caveat}</p>

        <div className="mt-6 max-w-md">
          {/* The coach's names for the axes, so the chart agrees with the
              dimension list directly under it. Without this the chart labels
              follow the viewer's locale and read Thai on a screen this file's
              own header calls English and coach-facing. */}
          <SpiderChart scores={chartScores} variant="full" axisLabels={chartLabels} />
        </div>
      </section>

      <section>
        <h2 className="text-h4">Dimension by dimension</h2>
        <div className="mt-3 space-y-4">
          {profile.dimensions.map((d, i) => (
            <div key={d.key} className="border-b border-neutral-300 pb-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-label text-ink">{d.label}</span>
                <span className="tabular-nums text-body text-primary-deep">
                  {d.score === null ? "not scored" : d.score.toFixed(1)}
                  <span className="ml-2 text-caption text-neutral-500">
                    {d.scoredCount}/{d.totalCount} measured
                  </span>
                </span>
              </div>
              <p className="mt-1 text-body text-slate">{narrative.perDimension[i]?.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="text-h4">Lead with these</h2>
          <Highlights items={narrative.strengths} empty="Nothing scored high enough to lead with." />
        </section>
        <section>
          <h2 className="text-h4">Development priorities</h2>
          <Highlights items={narrative.priorities} empty="Nothing scored low enough to prioritise." />
        </section>
      </div>

      <section>
        <h2 className="text-h4">Start here</h2>
        <p className="mt-3 rounded-lg border border-neutral-300 bg-mint-wash px-6 py-4 text-body text-ink">
          {narrative.nextStep}
        </p>
      </section>

      {coach.topLevers.length > 0 && (
        <section>
          <h2 className="text-h4">What moves, and by how much</h2>
          <p className="mt-1 text-caption text-neutral-500">
            Each is their own answers re-scored through the real lookups, so these are
            arithmetic rather than estimates. Safe to quote in a call.
          </p>
          <ul className="mt-3 space-y-3">
            {coach.topLevers.slice(0, 5).map((x) => (
              <li key={x.move.key} className="rounded-md border border-neutral-300 px-4 py-3">
                <p className="text-body text-ink">{x.move.coach}</p>
                <p className="mt-1 text-caption text-slate">
                  {x.move.module} · {x.move.horizon}
                  {x.changes[0] && (
                    <>
                      {" · "}
                      <span className="text-primary-deep">
                        {x.changes[0].label} {x.changes[0].from?.toFixed(1) ?? "—"} to{" "}
                        {x.changes[0].to?.toFixed(1) ?? "—"}
                      </span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-h4">What a conversation would add</h2>
        <p className="mt-3 text-body text-slate">
          Their answers measure <strong className="text-ink">{coach.unlock.measuredNow}</strong> of{" "}
          {coach.unlock.totalItems} competencies. An engagement reaches{" "}
          <strong className="text-ink">{coach.unlock.measuredAfter}</strong>, taking coverage from{" "}
          {Math.round(coach.unlock.coverageNow * 100)}% to{" "}
          {Math.round(coach.unlock.coverageAfter * 100)}%.
        </p>
        <p className="mt-2 text-caption text-neutral-500">
          The gap is not a gap in them. It is what a form cannot see and a conversation can,
          which is the honest thing to sell.
        </p>
      </section>

      {coach.aiPlan.state !== "unknown" && (
        <section>
          <h2 className="text-h4">AI and digital habits</h2>
          <p className="mt-2 text-body text-slate">
            {coach.aiPlan.metCount} of 4 in place.
            {coach.aiPlan.missing.length > 0 && " Missing: " + coach.aiPlan.missing.join("; ")}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-h4">Fit</h2>
        <p className="mt-2 text-body text-slate">
          {grade.score === null
            ? "Not enough answered to grade."
            : `${grade.tier} fit. Investment Readiness ${grade.score} of 3.`}
        </p>
        {grade.routingNote && (
          <p className="mt-1 text-body text-ink">{grade.routingNote}</p>
        )}
        {grade.jobTitle && (
          <p className="mt-1 text-body text-slate">
            Job title, from a call: {grade.jobTitle}. Not classified, because the Job
            Title Pool that Gate 1 reads is not loaded.
          </p>
        )}
        {/* Where each graded answer came from. The grade treats a call and the
            form identically, since both are the person's answer to the same
            question, but it never stops being able to say which. */}
        {grade.coachInputAt !== null && (
          <p className="mt-1 text-caption text-primary-deep">
            Graded partly on a call from{" "}
            {new Date(grade.coachInputAt).toLocaleDateString("en-GB")}:{" "}
            {[
              grade.sources.offeringMatch === "call" && "years of experience",
              grade.sources.investment === "call" && "prior paid learning",
            ]
              .filter(Boolean)
              .join(" and ") || "job title"}
            .
          </p>
        )}
        <p className="mt-1 text-caption text-neutral-500">
          Unmeasured: {grade.unmeasured.join("; ")}.
        </p>
      </section>
    </div>
  );
}

function Highlights({
  items,
  empty,
}: {
  items: { key: string; label: string; score: number; tier: string }[];
  empty: string;
}) {
  if (!items.length) return <p className="mt-3 text-body text-neutral-500">{empty}</p>;
  return (
    <ul className="mt-3 space-y-2">
      {items.map((h) => (
        <li
          key={h.key}
          className="flex items-baseline justify-between gap-3 border-b border-neutral-300 pb-2"
        >
          <span className="text-body text-ink">{h.label}</span>
          <span className="shrink-0 tabular-nums text-body text-primary-deep">
            {h.score.toFixed(1)}
          </span>
        </li>
      ))}
    </ul>
  );
}
