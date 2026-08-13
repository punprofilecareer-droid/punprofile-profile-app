/**
 * EU Fit Check — self-report scoring model.
 *
 * The competency map from `docs/self-report-scoring.md`, as data. Nothing here
 * imports Convex, React or Next — this file is the shared source of truth for
 * `convex/scoring.ts`, the client-side teaser chart, and the offline report
 * renderer alike.
 *
 * Framework definitions (the 34 competencies, the 1-5 scale, the indicator-count
 * and lookup formulas) belong to `08_Coaching_Business.md`. Do not restate a
 * framework fact here that that document owns — only the survey mapping.
 */

export type DimensionKey =
  | "professionalCapability"
  | "employability"
  | "mobilityReadiness"
  | "europeanMarketFit";

/**
 * ECRA  — the survey collects this competency's own defined inputs; the score is
 *         the real ECRA score by its own formula.
 * proxy — the survey evidences part of the picture. Scored, but named as its own
 *         observable thing, never under the ECRA competency's name.
 * coach — no survey evidence. Never estimated.
 */
export type Tier = "ecra" | "proxy" | "coach";

export interface ItemDef {
  key: string;
  label: string;
  tier: Tier;
  /** Survey questions this reads. Empty for coach-only items. */
  sources: string[];
  /** Why a coach-only item cannot be scored from a form. Shown in the report. */
  note?: string;
  /**
   * Position in the funnel a candidate can act on alone, following the triage
   * order in `08_Coaching_Business.md` → Triage Logic: direction first, then
   * assets, then applications. Lower runs earlier. Items with no rank are not
   * things the candidate can simply go and do — either they need the coach, or
   * they are life circumstances rather than tasks — and are never offered as
   * "the first thing to move".
   */
  actionRank?: number;
  /** Why moving this first is worth it. Only set where the claim is defensible. */
  actionWhy?: string;
}

export interface DimensionDef {
  key: DimensionKey;
  label: string;
  question: string;
  items: ItemDef[];
}

export const DIMENSIONS: DimensionDef[] = [
  {
    key: "professionalCapability",
    label: "Professional Capability",
    question: "Can this person perform the role?",
    items: [
      { key: "experienceDepth", label: "Experience Depth", tier: "proxy", sources: ["Q6"] },
      { key: "learningInvestment", label: "Learning Investment", tier: "proxy", sources: ["Q21"] },
      { key: "searchFollowThrough", label: "Search Follow-through", tier: "proxy", sources: ["Q12"] },
      { key: "technicalExpertise", label: "Technical Expertise", tier: "coach", sources: [], note: "Years of experience is 1 of its 4 indicators; the rest need conversation." },
      { key: "problemSolving", label: "Problem Solving", tier: "coach", sources: [], note: "Scored on how a case is broken down in conversation." },
      { key: "communication", label: "Communication", tier: "coach", sources: [], note: "Scored on observed spoken and written explanation." },
      { key: "collaboration", label: "Collaboration", tier: "coach", sources: [], note: "Needs a specific team example and its internal consistency." },
      { key: "leadershipOwnership", label: "Leadership & Ownership", tier: "coach", sources: [], note: "Needs examples of initiative and owning a mistake." },
      { key: "strategicThinking", label: "Strategic Thinking", tier: "coach", sources: [], note: "Needs a decision traced to a longer-term goal." },
      { key: "execution", label: "Execution", tier: "coach", sources: [], note: "Application count is 1 of its 4 indicators." },
      { key: "learningAgility", label: "Learning Agility", tier: "coach", sources: [], note: "Prior investment is 1 of its 4 indicators." },
    ],
  },
  {
    key: "employability",
    label: "Employability",
    question: "Can this person secure interviews and job offers?",
    items: [
      { key: "aiDigitalFluency", label: "AI & Digital Fluency", tier: "ecra", sources: ["Q32"] },
      { key: "cvStatus", label: "CV Status (self-declared)", tier: "proxy", sources: ["Q13"], actionRank: 2, actionWhy: "It is the first thing a European employer sees, and a CV that was not written for that market gets filtered before a human reads it." },
      { key: "linkedinStatus", label: "LinkedIn Status (self-declared)", tier: "proxy", sources: ["Q14"], actionRank: 3, actionWhy: "European recruiters source candidates on LinkedIn directly, so a dormant profile removes you from searches you never see." },
      { key: "portfolioEvidence", label: "Portfolio Evidence", tier: "proxy", sources: ["Q15"], actionRank: 6, actionWhy: "Concrete evidence of results does the arguing for you in a market where your previous employers are unfamiliar names." },
      { key: "applicationActivity", label: "Application Activity", tier: "proxy", sources: ["Q11", "Q12"], actionRank: 7, actionWhy: "Nothing else in the process can start until applications are actually going out." },
      { key: "cvQuality", label: "CV Quality", tier: "coach", sources: [], note: "All 4 indicators are facts about the document itself." },
      { key: "linkedinProfile", label: "LinkedIn Profile", tier: "coach", sources: [], note: "Needs the live profile, not a self-rating of it." },
      { key: "interviewSkills", label: "Interview Skills", tier: "coach", sources: [], note: "Needs a mock interview." },
      { key: "personalBrand", label: "Personal Brand", tier: "coach", sources: [], note: "Needs CV, LinkedIn and verbal pitch compared against each other." },
      { key: "networking", label: "Networking", tier: "coach", sources: [], note: "Not asked on the survey." },
      { key: "jobSearchStrategy", label: "Job Search Strategy", tier: "coach", sources: [], note: "Volume is known; targeting, cadence, channels and tracking are not." },
      { key: "recruiterReadiness", label: "Recruiter Readiness", tier: "coach", sources: [], note: "Scored on responsiveness during an engagement." },
    ],
  },
  {
    key: "mobilityReadiness",
    label: "Mobility Readiness",
    question: "Is this person prepared to relocate successfully?",
    items: [
      { key: "visaReadiness", label: "Visa Readiness", tier: "ecra", sources: ["Q18"], actionRank: 4, actionWhy: "Naming the specific route you would use is research you can do yourself, and it changes which employers are worth applying to at all." },
      { key: "languageReadiness", label: "Language Readiness", tier: "ecra", sources: ["Q16", "Q17"], actionRank: 5, actionWhy: "It moves slowly, so starting it early costs nothing and starting it late blocks the timeline." },
      { key: "familyReadiness", label: "Family Readiness", tier: "ecra", sources: ["Q33", "Q34"] },
      { key: "relocationTimeline", label: "Relocation Timeline", tier: "proxy", sources: ["Q10", "Q7"] },
      { key: "qualificationRecognition", label: "Qualification Recognition", tier: "coach", sources: [], note: "Needs coach research into the target country's recognition process." },
      { key: "financialPreparedness", label: "Financial Preparedness", tier: "coach", sources: [], note: "No budget question on the survey." },
      { key: "relocationPlanning", label: "Relocation Planning", tier: "coach", sources: [], note: "Timeline is 1 of its 4 indicators; city, housing and month-by-month plan are unasked." },
      { key: "culturalAdaptability", label: "Cultural Adaptability", tier: "coach", sources: [], note: "Reading motivation off free text is coach judgment." },
      { key: "administrativeReadiness", label: "Administrative Readiness", tier: "coach", sources: [], note: "Document checklist not yet built." },
    ],
  },
  {
    key: "europeanMarketFit",
    label: "European Market Fit",
    question: "How competitive is this person in the European labour market?",
    items: [
      { key: "businessEnglish", label: "Business English", tier: "ecra", sources: ["Q16"] },
      { key: "targetClarity", label: "Target Clarity", tier: "proxy", sources: ["Q8"], actionRank: 1, actionWhy: "Every step after it — which visa route applies, which language matters, which employers to approach — is specific to a country and a role. Without those two fixed, the rest is guesswork." },
      { key: "salaryStated", label: "Salary Expectation Stated", tier: "proxy", sources: ["Q35"] },
      { key: "crossCultural", label: "Cross-cultural Communication", tier: "coach", sources: [], note: "Needs observed adjustment to a different cultural context." },
      { key: "independence", label: "Independence", tier: "coach", sources: [], note: "Needs observed autonomous decision-making." },
      { key: "ownershipMindset", label: "Ownership Mindset", tier: "coach", sources: [], note: "Needs observed follow-through between sessions." },
      { key: "businessAwareness", label: "Customer & Business Awareness", tier: "coach", sources: [], note: "Needs the candidate to connect their role to commercial outcomes." },
      { key: "collaborationStyle", label: "Collaboration Style", tier: "coach", sources: [], note: "Needs observed comfort with flat structures and upward feedback." },
      { key: "salaryExpectations", label: "Salary Expectations", tier: "coach", sources: [], note: "A figure alone can't be classified without a country/role market benchmark." },
      { key: "labourMarketKnowledge", label: "Labour Market Knowledge", tier: "coach", sources: [], note: "Needs named target employers and hiring-timeline awareness." },
      { key: "adaptability", label: "Adaptability", tier: "coach", sources: [], note: "Needs an example of unplanned change handled well." },
      { key: "professionalConfidence", label: "Professional Confidence", tier: "coach", sources: [], note: "Needs composure under a challenging mock-interview question." },
    ],
  },
];

/** An ECRA-tier item counts fully toward coverage; a proxy counts half. */
export const TIER_WEIGHT: Record<Tier, number> = { ecra: 1, proxy: 0.5, coach: 0 };

export type ConfidenceBand = "moderate" | "limited" | "indicative";

export function bandFor(coverage: number): ConfidenceBand {
  if (coverage >= 0.45) return "moderate";
  if (coverage >= 0.25) return "limited";
  return "indicative";
}

export const BAND_COPY: Record<ConfidenceBand, string> = {
  moderate: "reasonably well covered by what you told us",
  limited: "a partial read — several areas are still unmeasured",
  indicative: "an early indication only — most of this needs a real conversation",
};

/** Maximum coverage any dimension can reach if every survey question is answered. */
export function maxCoverage(dim: DimensionDef): number {
  const scoreable = dim.items.reduce((n, i) => n + TIER_WEIGHT[i.tier], 0);
  return scoreable / dim.items.length;
}
