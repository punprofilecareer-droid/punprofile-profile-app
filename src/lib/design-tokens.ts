/**
 * The brand token block for standalone HTML output.
 *
 * This file is now a re-export. The values live in
 * `design-tokens.generated.ts`, written by `scripts/build-tokens.ts` from
 * `design.md` in the sibling coaching repo. The import path is kept so the
 * report, the report book and the two-views demo did not all have to change.
 *
 * Before 16/08/2026 this file and `src/app/globals.css` each held a hand-copied
 * palette, with a comment in each warning the other not to drift. There is now
 * one definition and two generated files.
 *
 * The variable NAMES `--viz-*`, `--ink-*` and `--border` remain load-bearing:
 * `scripts/build-report-book.ts` lifts the emitted <style> block out of a
 * rendered report and writes its own shell CSS against them. Renaming one
 * silently strips the report book's sidebar. The mapping from those names onto
 * design-system roles is the ALIASES table in `scripts/build-tokens.ts`.
 */

export {
  BRAND_TOKENS_CSS,
  BRAND_FONT_LINK,
  BRAND_FONT_STACKS,
} from "./design-tokens.generated";
