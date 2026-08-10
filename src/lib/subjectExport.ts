/**
 * A copy of everything held about one person, for a subject-access request.
 *
 * Two forms, because they serve different readers. The JSON is the portable
 * machine-readable copy. The HTML is the one a person can actually read, with
 * every answer resolved to the question that was asked and every code resolved
 * to the option they chose, because "cv: untailored" is not a meaningful answer
 * to "what do you hold about me".
 *
 * Derived values are labelled as derived. A request asks what is held, and a
 * score the system computed about someone is held about them just as much as
 * their phone number is. Hiding it because they did not type it would be a
 * strange reading of the question.
 *
 * Pure functions of a lead record. Nothing is stored, and the export is built
 * at the moment it is asked for.
 */

import { QUESTION_INDEX } from "./content/questions";
import { BRAND_FONT_LINK, BRAND_FONT_STACKS, BRAND_TOKENS_CSS } from "./design-tokens";

export interface SubjectRecord {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  lineId: string | null;
  emailConsentAt: number | null;
  phoneConsentAt: number | null;
  lineConsentAt: number | null;
  consentSource: string | null;
  pathway: string | null;
  status: string;
  source: string | null;
  responses: Record<string, unknown>;
  scores: Record<string, number | undefined>;
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
}

const stamp = (ms: number | null | undefined) =>
  ms === null || ms === undefined ? null : new Date(ms).toISOString();

const esc = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Labels for answers held on the 90 imported Lead Discovery Survey records.
 *
 * These keys are not in `QUESTION_INDEX` because this app never asks them, but
 * the answers are held, so an export that showed a bare `familyReady` would be
 * technically complete and practically useless. Wording paraphrases what the
 * Google form asked; it is not a quote of it.
 */
const IMPORTED_LABELS: Record<string, string> = {
  location: "Where you were living",
  jobTitle: "Your job title at the time",
  industry: "Your industry",
  experience: "Years of professional experience",
  applications: "Roles you had applied to",
  portfolio: "Portfolio site",
  priorInvestment: "Courses or coaching you had paid for",
  aiTools: "How you use digital and AI tools",
  dependents: "Who would relocate with you",
  familyReady: "How ready your family was",
  salary: "Your expected salary",
  timestamp: "When you submitted the survey",
};

/** Resolve a stored answer code back to the wording the candidate saw. */
function readable(key: string, value: unknown): { question: string; answer: string } {
  const q = QUESTION_INDEX[key];
  const values = Array.isArray(value) ? value : [value];
  const answer = values
    .map((v) => {
      const opt = q?.options.find((o) => o.value === v);
      return opt ? `${opt.en} (${String(v)})` : String(v);
    })
    .join(", ");
  return { question: q?.en ?? IMPORTED_LABELS[key] ?? key, answer };
}

export function buildSubjectExport(lead: SubjectRecord) {
  const answers = Object.entries(lead.responses)
    // Underscore keys are reserved for internal bookkeeping. None exist today;
    // the guard is here so adding one later cannot silently leak into an export.
    .filter(([k]) => !k.startsWith("_"))
    .map(([key, value]) => ({ key, ...readable(key, value) }));

  return {
    exportedAt: new Date().toISOString(),
    identity: {
      firstName: lead.firstName,
      lastName: lead.lastName,
      fullName: lead.fullName,
    },
    contact: {
      email: lead.email,
      phone: lead.phone,
      lineId: lead.lineId,
    },
    consent: {
      email: stamp(lead.emailConsentAt),
      phone: stamp(lead.phoneConsentAt),
      line: stamp(lead.lineConsentAt),
      basis:
        lead.consentSource === "survey_import"
          ? "Given when you submitted the Lead Discovery Survey. The timestamps are your submission date."
          : "Given at the contact step of the assessment, per channel.",
    },
    answers,
    derived: {
      note: "Computed by PunProfile from your answers. You did not provide these.",
      scores: lead.scores,
      pathway: lead.pathway,
    },
    record: {
      status: lead.status,
      source: lead.source,
      created: stamp(lead.createdAt),
      lastUpdated: stamp(lead.updatedAt),
      lastActivity: stamp(lead.lastActivityAt),
    },
  };
}

export function renderSubjectExportHtml(lead: SubjectRecord): string {
  const d = buildSubjectExport(lead);
  const name = d.identity.fullName ?? "your record";

  const row = (label: string, value: string | null) =>
    `<tr><th scope="row">${esc(label)}</th><td>${value ? esc(value) : '<span class="none">not held</span>'}</td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your data held by PunProfile</title>
${BRAND_FONT_LINK}
<style>
${BRAND_TOKENS_CSS.replace(/\n  \}$/, `\n${BRAND_FONT_STACKS}\n  }`)}
  * { box-sizing: border-box; }
  body { margin:0; padding:0 1rem 4rem; background:var(--viz-page); color:var(--ink-1);
    font-family:var(--font-sans); line-height:1.55; }
  main { max-width:48rem; margin:0 auto; }
  h1,h2 { font-family:var(--font-display); }
  h1 { font-size:1.6rem; margin:2.5rem 0 .25rem; }
  h2 { font-size:1.1rem; margin:2.5rem 0 .5rem; }
  .sub { color:var(--ink-2); font-size:.9rem; margin:0; }
  table { width:100%; border-collapse:collapse; font-size:.9rem; }
  th,td { text-align:left; padding:.5rem .5rem .5rem 0; border-bottom:1px solid var(--border); vertical-align:top; }
  th[scope="row"] { font-weight:600; width:38%; color:var(--ink-2); }
  .none { color:var(--viz-muted); }
  .note { background:var(--viz-surface); border:1px solid var(--border); border-left:3px solid var(--primary);
    border-radius:8px; padding:.75rem 1rem; font-size:.88rem; color:var(--ink-2); margin:1rem 0 0; }
</style>
</head>
<body>
<main>
  <h1>Your data held by PunProfile</h1>
  <p class="sub">Prepared ${esc(d.exportedAt.slice(0, 10))} for ${esc(name)}.</p>

  <h2>Who you are</h2>
  <table>
    ${row("First name", d.identity.firstName)}
    ${row("Last name", d.identity.lastName)}
  </table>

  <h2>How we can reach you</h2>
  <table>
    ${row("Email", d.contact.email)}
    ${row("Phone", d.contact.phone)}
    ${row("LINE ID", d.contact.lineId)}
  </table>

  <h2>Your consent</h2>
  <table>
    ${row("Email", d.consent.email)}
    ${row("Phone", d.consent.phone)}
    ${row("LINE", d.consent.line)}
  </table>
  <p class="note">${esc(d.consent.basis)}</p>

  <h2>What you told us</h2>
  <table>
    ${d.answers.map((a) => `<tr><th scope="row">${esc(a.question)}</th><td>${esc(a.answer)}</td></tr>`).join("\n    ")}
  </table>

  <h2>What we worked out from it</h2>
  <p class="note">${esc(d.derived.note)}</p>
  <table>
    ${Object.entries(d.derived.scores)
      .map(([k, v]) => row(k, v === undefined ? null : `${v} out of 5`))
      .join("\n    ")}
    ${row("Route to Europe you chose", d.derived.pathway)}
  </table>

  <h2>The record itself</h2>
  <table>
    ${row("Status", d.record.status)}
    ${row("Where you came from", d.record.source)}
    ${row("First created", d.record.created)}
    ${row("Last updated", d.record.lastUpdated)}
  </table>
</main>
</body>
</html>`;
}
