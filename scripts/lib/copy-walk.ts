/**
 * Finds every `{ en, th }` pair in a content module, at any depth.
 *
 * **Extracted 17/08/2026 because the same bug was written twice in one day.**
 *
 * `verify-pages.ts` had a walker whose array arm recursed into items without
 * first asking whether the item was itself a `Copy`. A `Copy` is an object, so it
 * recursed; inside are only two strings; so nothing was collected. It skipped 62
 * of 153 strings and reported "no findings", which is the worst possible failure
 * for a check: it passed because it did not look. Another session found it by
 * reading the code.
 *
 * `export-page-review.ts` then turned out to have the same hole in its fallback
 * path, for modules with no hand-written section order: it enumerated top-level
 * exports only, so `TOPICS` in `blog.ts` was invisible for the same reason.
 *
 * Two instances of one mistake is the signal to have one implementation. Both
 * callers use this now, so the array case is written down once and tested once.
 *
 * Nothing here knows about linting or about review sheets. It walks an object and
 * returns what it found, in the order it found it, which is declaration order for
 * a module's exports and index order inside an array. Callers that need reading
 * order impose it themselves.
 */

export interface Copy {
  en: string;
  th: string;
}

export interface FoundCopy {
  /**
   * Dotted path from the module root, with array indices: `SERVICES[0].includes[2]`.
   * Stable enough to cite in a lint failure or a review sheet.
   */
  path: string;
  copy: Copy;
}

export const isCopy = (v: unknown): v is Copy =>
  !!v &&
  typeof v === "object" &&
  typeof (v as Copy).en === "string" &&
  typeof (v as Copy).th === "string";

/**
 * Every `Copy` reachable from `node`.
 *
 * The order of the two array branches is the whole point of this file: a `Copy`
 * inside an array is a **result**, not a node to walk into. Test for it first.
 */
export function walkCopy(node: Record<string, unknown>, prefix = ""): FoundCopy[] {
  const out: FoundCopy[] = [];

  const visit = (value: unknown, path: string) => {
    if (isCopy(value)) {
      out.push({ path, copy: value });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, i) => visit(item, `${path}[${i}]`));
      return;
    }
    // Functions are exported alongside data in these modules (`topicById`,
    // `playbooks`). `typeof` catches them; without this the walk would recurse
    // into a function's own properties and find nothing, slowly.
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        visit(child, path ? `${path}.${key}` : key);
      }
    }
  };

  for (const [key, value] of Object.entries(node)) {
    visit(value, prefix ? `${prefix}.${key}` : key);
  }
  return out;
}
