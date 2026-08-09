/**
 * PDPA consent copy, Thai-first (TASK-023, PRD FR-006).
 *
 * **Nothing here has been reviewed. Do not ship it to a real candidate.**
 * TASK-047 is a legal-review checkpoint and it has not happened. Every string
 * below is a placeholder written to define the shape of the consent flow, not
 * to be the consent itself. Thailand's PDPA requires consent that is specific,
 * informed and freely given, and an LLM's paraphrase of that is not a legal
 * instrument.
 *
 * Separate from `copy.ts` on purpose, even though the shape is identical and
 * both flow through the same worksheet. Mixing them would blur which strings
 * carry the review obligation, and that distinction is the reason this file
 * exists rather than a `consent.*` prefix in the main copy module.
 *
 * PRD FR-006: every contact field gets its OWN consent checkbox, and every
 * grant is timestamped separately on the lead record (`emailConsentAt`,
 * `phoneConsentAt`, `lineConsentAt`). One blanket tick does not satisfy this.
 */

import type { CopyEntry } from "./content/copy";

/** Flipped to true only after TASK-047 clears, and not by an agent. */
export const CONSENT_COPY_REVIEWED = false;

export const CONSENT_COPY = {
  "consent.email": {
    screen: "Contact gate, beside the email field",
    en: "PLACEHOLDER, NOT LEGALLY REVIEWED. I agree that PunProfile may email me about my result and career coaching.",
    th: "",
  },
  "consent.phone": {
    screen: "Contact gate, beside the phone field",
    en: "PLACEHOLDER, NOT LEGALLY REVIEWED. I agree that PunProfile may contact me by phone.",
    th: "",
  },
  "consent.line": {
    screen: "Contact gate, beside the LINE ID field",
    en: "PLACEHOLDER, NOT LEGALLY REVIEWED. I agree that PunProfile may contact me on LINE.",
    th: "",
  },
  "consent.purpose": {
    screen: "Contact gate, above the fields: what the data is for",
    en: "PLACEHOLDER, NOT LEGALLY REVIEWED. Explains what is collected, why, how long it is kept, and how to withdraw consent.",
    th: "",
  },
} as const satisfies Record<string, CopyEntry>;

export type ConsentCopyKey = keyof typeof CONSENT_COPY;
