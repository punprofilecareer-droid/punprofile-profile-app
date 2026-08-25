/**
 * A visible, unmistakable placeholder for copy that does not exist yet.
 *
 * The home page is built to the reference's own section anatomy, and the
 * reference has slots this product has never written: a credibility row above
 * the hero, a caption under a card, a second line beside a figure. Leaving
 * those out would quietly change the block; filling them with something
 * plausible would be inventing copy, and inventing Thai is the one thing that
 * cannot happen here.
 *
 * So the slot renders, and it says what it wants. Dashed, muted, and prefixed
 * so it can be found with one grep: every one of these is a question waiting
 * for an answer, and a page with three of them on it is honest about being
 * three answers short.
 *
 * **Nothing here is candidate-facing copy.** The English label is a note to
 * Paul, not a string to translate, which is why it takes a plain `string` and
 * not a `Copy`.
 */

export default function Slot({
  children,
  block = false,
}: {
  /** What belongs here, in English, addressed to whoever fills it. */
  children: string;
  /** `true` for a paragraph-sized gap, `false` for an inline one. */
  block?: boolean;
}) {
  const cls =
    "rounded-md border border-dashed border-line-strong px-2 py-1 text-body-sm text-mute-strong";
  return block ? (
    <p className={cls}>[{children}]</p>
  ) : (
    <span className={`inline-block ${cls}`}>[{children}]</span>
  );
}
