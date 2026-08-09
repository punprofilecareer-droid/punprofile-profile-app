/**
 * The intervention catalog over a scored profile: moves, services, and the
 * simulation that ranks them.
 *
 * Two representations hang off one assessment (see
 * `docs/candidate-data-architecture.md`): the coach playbook and the candidate
 * journey. Both need to say "do X and this number moves", and both must say it
 * honestly. So a move is not advice text with a guessed benefit. It is a
 * hypothetical change to the candidate's own answers, re-scored through the
 * real lookup tables in `scoring.ts`. The uplift shown is arithmetic, not an
 * estimate, and it stays self-report: a simulated CV score of 4 means "what
 * your self-assessment would read after doing this", never "what a coach would
 * score you".
 *
 * Services are the other lever type and they deliberately do NOT move scores.
 * They unlock coach-tier items, which raises coverage. Score moves and
 * coverage moves are kept apart because conflating them is how faked
 * precision starts.
 */

import { scoreResponse } from "./scoring";
import type { ScoringInput, ProfileScore } from "./scoring";
import { DIMENSIONS } from "./model";
import type { DimensionKey } from "./model";
import type { Copy } from "./content/copy";

export type Horizon = "days" | "weeks" | "months";

/** Offering names follow the triage table in `08_Coaching_Business.md`. */
export type Module =
  | "Career Coaching"
  | "Candidate Profile Optimization"
  | "Job Application Lifecycle"
  | "Self-serve";

export interface Move {
  key: string;
  /** The scored item this move primarily targets. */
  itemKey: string;
  module: Module;
  horizon: Horizon;
  /** Part of the AI toolstack (goal 1.2). */
  ai?: boolean;
  /** Coach-facing imperative. English only: the coach is the only reader. */
  coach: string;
  /**
   * Candidate-facing copy, so bilingual. Empty `th` falls back to English, and
   * the worksheet is how Thai arrives (`scripts/export-copy-worksheet.ts`).
   */
  candidate: Copy;
  applies(r: ScoringInput): boolean;
  apply(r: ScoringInput): ScoringInput;
}

function withAiFlag(r: ScoringInput, i: number): ScoringInput {
  const flags = [...(r.aiIndicatorFlags ?? [false, false, false, false])];
  flags[i] = true;
  return { ...r, aiIndicatorFlags: flags, aiIndicators: flags.filter(Boolean).length };
}

const aiFlagKnownMissing = (r: ScoringInput, i: number) =>
  Array.isArray(r.aiIndicatorFlags) && r.aiIndicatorFlags[i] === false;

/**
 * Deliberately absent: Family Readiness and Relocation Timeline. Both can be
 * low for reasons that are life circumstances rather than tasks, the same rule
 * that keeps them out of `firstAction`. Job-search *stage* is also not a move:
 * "be interviewing" is an outcome, not something you do.
 */
export const MOVES: Move[] = [
  {
    key: "target-one",
    itemKey: "targetClarity",
    module: "Career Coaching",
    horizon: "days",
    ai: true,
    coach: "Narrow to one target country and one target role. AI-assisted country/role research prompts make this a session, not a month.",
    candidate: { en: "Pick one country and one role to aim at first. Everything after this step gets easier once it is specific.", th: "" },
    applies: (r) => !((r.targetCountries?.length ?? 0) === 1 && !!r.targetRole?.trim()),
    apply: (r) => ({
      ...r,
      targetCountries: [(r.targetCountries ?? [])[0] ?? "Chosen country"],
      targetRole: r.targetRole?.trim() || "Chosen role",
    }),
  },
  {
    key: "cv-europe",
    itemKey: "cvStatus",
    module: "Candidate Profile Optimization",
    horizon: "weeks",
    coach: "Rework the CV to Europe-ready: quantified achievements, role tailoring, ATS-safe format, 2 pages.",
    candidate: { en: "Retailor your CV for the European market. It is the first thing an employer sees, and format alone filters people out.", th: "" },
    applies: (r) => r.cv === "none" || r.cv === "untailored",
    apply: (r) => ({ ...r, cv: "europe_ready" }),
  },
  {
    key: "linkedin-active",
    itemKey: "linkedinStatus",
    module: "Candidate Profile Optimization",
    horizon: "days",
    coach: "Bring LinkedIn to active and optimized: headline, About, target-role keywords, recent activity.",
    candidate: { en: "Wake up your LinkedIn. European recruiters search there directly, and a quiet profile is invisible to them.", th: "" },
    applies: (r) => r.linkedin === "none" || r.linkedin === "basic",
    apply: (r) => ({ ...r, linkedin: "active" }),
  },
  {
    key: "visa-name-route",
    itemKey: "visaReadiness",
    module: "Self-serve",
    horizon: "days",
    ai: true,
    coach: "Have them name the specific visa route (Blue Card, Chancenkarte, zoekjaar...). Research prompts provided; verification stays coach-side.",
    candidate: { en: "Find and name the specific visa route you would use. Knowing the route changes which employers are even worth applying to.", th: "" },
    applies: (r) => r.workAuth === "sponsor_no_route",
    apply: (r) => ({ ...r, workAuth: "sponsor_route_named" }),
  },
  {
    key: "visa-learn-basics",
    itemKey: "visaReadiness",
    module: "Self-serve",
    horizon: "days",
    ai: true,
    coach: "They don't yet know what work authorisation requires. One research session moves them from unsure to sponsorship-aware.",
    candidate: { en: "Spend one session learning what working in Europe legally requires. It is the single fastest gap to close.", th: "" },
    applies: (r) => r.workAuth === "unsure",
    apply: (r) => ({ ...r, workAuth: "sponsor_no_route" }),
  },
  {
    key: "salary-benchmark",
    itemKey: "salaryStated",
    module: "Self-serve",
    horizon: "days",
    ai: true,
    coach: "Get a stated salary expectation with currency and period. AI benchmark research against the target country/role; realism check stays a coach call.",
    candidate: { en: "Work out a salary expectation for your target country, with currency and period. It anchors every later conversation.", th: "" },
    applies: (r) => !r.salary || !r.salary.hasFigure || !r.salary.hasCurrency || !r.salary.hasPeriod,
    apply: (r) => ({ ...r, salary: { hasFigure: true, hasCurrency: true, hasPeriod: true } }),
  },
  {
    key: "portfolio-seed",
    itemKey: "portfolioEvidence",
    module: "Candidate Profile Optimization",
    horizon: "weeks",
    coach: "Seed a partial portfolio: 2-3 case studies with outcomes. Only after CV and LinkedIn are done.",
    candidate: { en: "Put two or three pieces of your work somewhere an employer can see them. Evidence argues better than adjectives.", th: "" },
    applies: (r) => r.portfolio === "none",
    apply: (r) => ({ ...r, portfolio: "partial" }),
  },
  {
    key: "first-applications",
    itemKey: "searchFollowThrough",
    module: "Job Application Lifecycle",
    horizon: "weeks",
    coach: "First five targeted applications, tracked. Volume without targeting is noise; five tracked beats fifty sprayed.",
    candidate: { en: "Send your first five targeted applications and track each one. Nothing downstream starts until these go out.", th: "" },
    applies: (r) => r.applicationCount === 0,
    apply: (r) => ({ ...r, applicationCount: 5 }),
  },
  {
    key: "english-to-c1",
    itemKey: "languageReadiness",
    module: "Self-serve",
    horizon: "months",
    coach: "Structured push from conversational toward C1. Slow lever; start it early precisely because it is slow.",
    candidate: { en: "Start a steady English routine aiming at fluent professional level. It moves slowly, which is exactly why starting now matters.", th: "" },
    applies: (r) => r.englishCefr === "A1" || r.englishCefr === "A2" || r.englishCefr === "B1" || r.englishCefr === "B2",
    apply: (r) => ({ ...r, englishCefr: "C1" }),
  },
  // The AI toolstack (goal 1.2). When Q32 was never answered, prescribing a
  // single indicator is guesswork, so the whole stack is one onboarding move.
  {
    key: "ai-toolstack",
    itemKey: "aiDigitalFluency",
    module: "Self-serve",
    horizon: "weeks",
    ai: true,
    coach: "Q32 unanswered: onboard the full AI toolstack (weekly AI research, EU workplace tools, AI-tailored materials, one self-adopted tool) and capture the answers.",
    candidate: { en: "Set up your AI job-search toolkit: weekly AI research, the workplace tools European teams use, AI-tailored applications, and one tracker you pick yourself.", th: "" },
    applies: (r) => r.aiIndicatorFlags === null || r.aiIndicatorFlags === undefined,
    apply: (r) => ({ ...r, aiIndicatorFlags: [true, true, true, true], aiIndicators: 4 }),
  },
  {
    key: "ai-weekly-research",
    itemKey: "aiDigitalFluency",
    module: "Self-serve",
    horizon: "days",
    ai: true,
    coach: "Missing indicator 1: weekly AI research habit. Give them the job-search prompt pack.",
    candidate: { en: "Make AI research a weekly habit: companies, visa rules, salary ranges, one hour, every week.", th: "" },
    applies: (r) => aiFlagKnownMissing(r, 0),
    apply: (r) => withAiFlag(r, 0),
  },
  {
    key: "ai-eu-tools",
    itemKey: "aiDigitalFluency",
    module: "Self-serve",
    horizon: "weeks",
    ai: true,
    coach: "Missing indicator 2: EU workplace tools. Self-onboarding onto Slack, Teams and Notion free tiers.",
    candidate: { en: "Get hands-on with Slack, Teams and Notion. They are the default furniture of a European office.", th: "" },
    applies: (r) => aiFlagKnownMissing(r, 1),
    apply: (r) => withAiFlag(r, 1),
  },
  {
    key: "ai-tailoring",
    itemKey: "aiDigitalFluency",
    module: "Self-serve",
    horizon: "days",
    ai: true,
    coach: "Missing indicator 3: AI-tailored materials. Teach the tailor-per-role workflow, not generic output.",
    candidate: { en: "Use AI to tailor your CV and cover letter to each specific role instead of sending one version everywhere.", th: "" },
    applies: (r) => aiFlagKnownMissing(r, 2),
    apply: (r) => withAiFlag(r, 2),
  },
  {
    key: "ai-self-adopt",
    itemKey: "aiDigitalFluency",
    module: "Self-serve",
    horizon: "days",
    ai: true,
    coach: "Missing indicator 4: self-adopted tooling. Have them pick and run an application tracker of their own choice.",
    candidate: { en: "Pick one tool nobody told you to use, an application tracker is the obvious one, and make it yours.", th: "" },
    applies: (r) => aiFlagKnownMissing(r, 3),
    apply: (r) => withAiFlag(r, 3),
  },
];

// ---------------------------------------------------------------- simulation

export interface DimChange {
  dimension: DimensionKey;
  label: string;
  from: number | null;
  to: number | null;
  delta: number;
}

export interface MoveImpact {
  move: Move;
  itemFrom: number | null;
  itemTo: number | null;
  /** Dimensions whose score changed, largest delta first. */
  changes: DimChange[];
  /** Overall coverage change. Answer-type moves raise this even at zero score delta. */
  coverageDelta: number;
}

const ITEM_DIM: Record<string, DimensionKey> = {};
const ITEM_RANK: Record<string, number> = {};
for (const d of DIMENSIONS) {
  for (const i of d.items) {
    ITEM_DIM[i.key] = d.key;
    if (i.actionRank !== undefined) ITEM_RANK[i.key] = i.actionRank;
  }
}

function itemScore(p: ProfileScore, key: string): number | null {
  for (const d of p.dimensions) {
    const it = d.items.find((i) => i.key === key);
    if (it) return it.score;
  }
  return null;
}

export function impactOf(move: Move, input: ScoringInput, base?: ProfileScore): MoveImpact {
  const before = base ?? scoreResponse(input);
  const after = scoreResponse(move.apply(input));
  const changes: DimChange[] = [];
  for (const d of DIMENSIONS) {
    const from = before.dimensions.find((x) => x.key === d.key)?.score ?? null;
    const to = after.dimensions.find((x) => x.key === d.key)?.score ?? null;
    if (from !== to) changes.push({ dimension: d.key, label: d.label, from, to, delta: (to ?? 0) - (from ?? 0) });
  }
  changes.sort((a, b) => b.delta - a.delta);
  return {
    move,
    itemFrom: itemScore(before, move.itemKey),
    itemTo: itemScore(after, move.itemKey),
    changes,
    coverageDelta: after.overallCoverage - before.overallCoverage,
  };
}

/**
 * Applicable moves ranked by simulated uplift. With `focus` set (the coach's
 * goal 1.1 case: employability), ranking is by that dimension's delta; ties
 * break toward the earlier funnel stage, the same order `firstAction` uses.
 */
export function rankMoves(input: ScoringInput, focus?: DimensionKey): MoveImpact[] {
  const base = scoreResponse(input);
  const impacts = MOVES.filter((m) => m.applies(input)).map((m) => impactOf(m, input, base));
  const score = (x: MoveImpact) =>
    focus ? (x.changes.find((c) => c.dimension === focus)?.delta ?? 0) : (x.changes[0]?.delta ?? 0);
  return impacts.sort(
    (a, b) => score(b) - score(a) || (ITEM_RANK[a.move.itemKey] ?? 99) - (ITEM_RANK[b.move.itemKey] ?? 99),
  );
}

// ------------------------------------------------------------------ services

/**
 * What a PunProfile engagement unlocks. Services never move a self-report
 * score; they measure the coach-tier items, which moves coverage. Every
 * coach-tier item in the model belongs to exactly one service, checked by
 * `validateCatalog`.
 */
export interface Service {
  key: string;
  label: string;
  unlocks: string[];
}

export const SERVICES: Service[] = [
  {
    key: "conversation",
    label: "Coaching conversation",
    unlocks: [
      "technicalExpertise", "problemSolving", "communication", "collaboration",
      "leadershipOwnership", "strategicThinking", "execution", "learningAgility",
      "networking", "jobSearchStrategy",
      "financialPreparedness", "relocationPlanning", "culturalAdaptability",
      "crossCultural", "independence", "ownershipMindset", "businessAwareness",
      "collaborationStyle", "adaptability",
    ],
  },
  {
    key: "document-review",
    label: "CV & LinkedIn review",
    unlocks: ["cvQuality", "linkedinProfile", "personalBrand"],
  },
  {
    key: "mock-interview",
    label: "Mock interview",
    unlocks: ["interviewSkills", "recruiterReadiness", "professionalConfidence"],
  },
  {
    key: "country-research",
    label: "Country-specific research",
    unlocks: ["qualificationRecognition", "administrativeReadiness", "salaryExpectations", "labourMarketKnowledge"],
  },
];

export interface UnlockProjection {
  measuredNow: number;
  measuredAfter: number;
  totalItems: number;
  coverageNow: number;
  coverageAfter: number;
  services: { key: string; label: string; count: number }[];
}

export function projectUnlock(profile: ProfileScore): UnlockProjection {
  const totalItems = DIMENSIONS.reduce((n, d) => n + d.items.length, 0);
  const measuredNow = profile.dimensions.reduce((n, d) => n + d.scoredCount, 0);
  const coachCount = SERVICES.reduce((n, s) => n + s.unlocks.length, 0);
  // Coverage weights an ECRA item 1.0 and a proxy 0.5; unlocked coach items
  // are measured by the framework's own formulas, so they earn full weight.
  const earnedNow = profile.overallCoverage * totalItems;
  return {
    measuredNow,
    measuredAfter: measuredNow + coachCount,
    totalItems,
    coverageNow: profile.overallCoverage,
    coverageAfter: Math.min(1, (earnedNow + coachCount) / totalItems),
    services: SERVICES.map((s) => ({ key: s.key, label: s.label, count: s.unlocks.length })),
  };
}

/** Catalog integrity: every coach item in exactly one service, nothing extra. */
export function validateCatalog(): string[] {
  const problems: string[] = [];
  const coachKeys = new Set(
    DIMENSIONS.flatMap((d) => d.items.filter((i) => i.tier === "coach").map((i) => i.key)),
  );
  const seen = new Map<string, number>();
  for (const s of SERVICES) {
    for (const k of s.unlocks) {
      seen.set(k, (seen.get(k) ?? 0) + 1);
      if (!coachKeys.has(k)) problems.push(`service ${s.key} unlocks non-coach item ${k}`);
    }
  }
  for (const k of coachKeys) if (!seen.has(k)) problems.push(`coach item ${k} not covered by any service`);
  for (const [k, n] of seen) if (n > 1) problems.push(`item ${k} appears in ${n} services`);
  for (const m of MOVES) if (!ITEM_DIM[m.itemKey]) problems.push(`move ${m.key} targets unknown item ${m.itemKey}`);
  return problems;
}
