/**
 * Plain-language readout of a scored profile.
 *
 * Tone follows `VISION.md` § Brand Voice and `03_Content_System.md`: direct
 * enough to name a gap, never cold about it. English only for now — the Thai
 * copy needs the native-tone pass that document requires for all
 * customer-facing text, and machine-translating it here would bake in exactly
 * the literal-translated corporate register that rule exists to prevent.
 */

import { BAND_COPY } from "./model";
import type { ProfileScore, DimensionScore, Highlight } from "./scoring";
import { topStrengths, developmentPriorities, firstAction } from "./scoring";

export interface Narrative {
  headline: string;
  caveat: string;
  perDimension: { key: string; label: string; text: string }[];
  strengths: Highlight[];
  priorities: Highlight[];
  nextStep: string;
}

function describe(score: number | null): string {
  if (score === null) return "not yet measured";
  if (score >= 4.5) return "a real advantage";
  if (score >= 3.5) return "strong";
  if (score >= 2.5) return "about where most people are at this stage";
  if (score >= 1.5) return "still developing";
  return "the area holding you back most";
}

function dimensionText(d: DimensionScore): string {
  if (d.score === null) {
    return `Nothing here could be scored from your answers. ${d.question} is a question about how you actually work, and a form can't see it.`;
  }
  const unmeasured = d.totalCount - d.scoredCount;
  const strength = describe(d.score);
  const parts = [`Scores ${d.score.toFixed(1)} out of 5 on what you told us, which is ${strength}.`];
  parts.push(`This is ${BAND_COPY[d.band]}.`);
  if (unmeasured > 0) {
    parts.push(
      `${unmeasured} of the ${d.totalCount} things this measures ${unmeasured === 1 ? "needs" : "need"} a conversation, a CV review, or research we haven't done yet, so ${unmeasured === 1 ? "it is" : "they are"} left blank rather than guessed at.`,
    );
  }
  return parts.join(" ");
}

export function buildNarrative(profile: ProfileScore): Narrative {
  const scored = profile.dimensions.filter((d) => d.score !== null);
  const best = [...scored].sort((a, b) => (b.score as number) - (a.score as number))[0];
  const worst = [...scored].sort((a, b) => (a.score as number) - (b.score as number))[0];

  let headline: string;
  if (!scored.length) {
    headline = "There isn't enough here yet to show you anything honest. Answer a few more questions and the picture starts to fill in.";
  } else if (best && worst && best.key !== worst.key) {
    headline = `Your strongest area right now is ${best.label}, and ${worst.label} is what's most likely holding the timeline back.`;
  } else {
    headline = `${best.label} is the clearest signal in your answers so far.`;
  }

  const pct = Math.round(profile.overallCoverage * 100);
  const caveat =
    `Everything above is self-reported and preliminary. Your answers reach about ${pct}% of what the full assessment measures — ` +
    `the rest needs a CV review, a conversation, and some country-specific research. Treat this as a first read, not a verdict.`;

  const priorities = developmentPriorities(profile, 4);
  const first = firstAction(profile);
  const nextStep = first
    ? `Start with ${first.label.replace(/ \(self-declared\)$/, "")}. Of the things you can move on your own, it's the earliest one that isn't where it needs to be, and fixing things in order beats fixing the weakest one first. ${first.actionWhy ?? ""}`.trim()
    : "Answer a few more questions and we can point you at a first step.";

  return {
    headline,
    caveat,
    perDimension: profile.dimensions.map((d) => ({ key: d.key, label: d.label, text: dimensionText(d) })),
    strengths: topStrengths(profile, 4),
    priorities,
    nextStep,
  };
}
