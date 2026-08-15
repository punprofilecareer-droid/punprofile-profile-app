/**
 * The six sections of the assessment, and the photograph that marks each one.
 *
 * Decided 16/08/2026. `assessment-motion.md` has the reasoning and
 * `two-registers.md` has the boundary against the mascot; the short version is
 * that the image marks a section rather than decorating a question, so it is
 * held for a whole block and changes six times across sixteen questions. Every
 * change means "new section", which is information.
 *
 * Blocks are read off the `SLOT:` annotations in `questions.ts`, not off the
 * order, so they group by what a question feeds rather than by where it happens
 * to sit.
 *
 * **`image: null` is the normal state until a photograph is sourced.** A block
 * with no image renders exactly as the assessment did before this existed. That
 * is deliberate: the sequence must not depend on art arriving.
 */

/** Question keys in order, grouped. `languages` is the grid, not a QuestionCard. */
export type Block = {
  id: string;
  /** Coach-facing. Never shown to a candidate. */
  title: string;
  keys: readonly string[];
  /**
   * File under `public/assess/blocks/`, or null while unsourced.
   *
   * Portrait or square, at least 1600x2000: the same file has to survive a
   * half-screen desktop panel and a short mobile banner crop.
   */
  image: string | null;
  /**
   * What the picture is doing, in one line. Kept next to the slot rather than
   * only in the sourcing brief, because whoever swaps the file later will read
   * this and not that.
   */
  intent: string;
};

export const BLOCKS: readonly Block[] = [
  {
    id: "aim",
    title: "Where you are aiming",
    keys: ["pathway", "targetCountries", "targetRole"],
    image: null,
    intent: "A destination considered, not arrived at. Looking outward.",
  },
  {
    id: "bring",
    title: "What you bring",
    keys: ["experienceYears", "cv", "linkedin", "portfolio", "aiTools"],
    image: null,
    intent: "Work already done. Hands, a desk, evidence of craft.",
  },
  {
    id: "go",
    title: "Whether you can go",
    keys: ["workAuth"],
    image: null,
    intent: "Paperwork and borders. The one block about a rule, not a person.",
  },
  {
    id: "understood",
    title: "How you will be understood",
    keys: ["english", "languages"],
    image: null,
    intent: "Two people talking. Language as a bridge, not a test.",
  },
  {
    id: "now",
    title: "Where you are now",
    keys: ["stage", "applications", "timeline"],
    image: null,
    intent: "The search itself. Screens, applications, waiting.",
  },
  {
    id: "cost",
    title: "What it costs",
    keys: ["family", "salary", "priorInvestment"],
    image: null,
    intent: "Money and family, the hardest block. Domestic and quiet.",
  },
] as const;

const BY_KEY = new Map<string, Block>(
  BLOCKS.flatMap((b) => b.keys.map((k) => [k, b] as [string, Block])),
);

/** The block a question belongs to, or undefined if it is in none. */
export function blockFor(questionKey: string): Block | undefined {
  return BY_KEY.get(questionKey);
}

/**
 * Every question key the blocks claim, for the verifier.
 *
 * A question added to `questions.ts` and not to a block would silently lose its
 * section marker, and the image would appear to jump backwards when the
 * candidate reached it. `verify-copy.ts` asserts the two agree.
 */
export const BLOCKED_KEYS: readonly string[] = BLOCKS.flatMap((b) => b.keys);
