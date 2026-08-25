/**
 * A visible, coded placeholder for copy that does not exist yet.
 *
 * Every page here is built to the reference's own section anatomy, and the
 * reference has parts this product has never written: a credibility row above
 * the hero, a line under a card, a quote from a client. Leaving them out would
 * quietly change the block; filling them with something plausible would be
 * inventing copy, and inventing Thai is the one thing that cannot happen here.
 *
 * So the slot renders, it says what it wants, and **it carries a code**. The
 * code is how one file can answer all of them: `slots.md` in the coaching repo
 * lists every code with its question, Paul fills it in one pass, and each answer
 * has exactly one place to go.
 *
 * Codes are `PAGE-NN`, allocated in reading order down the page and never
 * reused. A filled code leaves this component and becomes a string in a content
 * module; the code stays in the commit message, so the trail survives it.
 *
 * **Nothing here is candidate-facing copy.** The description is a note to Paul,
 * not a string to translate, which is why it takes a plain `string` and not a
 * `Copy`.
 */

export default function Slot({
  code,
  children,
  block = false,
}: {
  /** `HOME-01`, `PROD-03`. Unique across the site; see `slots.md`. */
  code: string;
  /** What belongs here, in English, addressed to whoever fills it. */
  children: string;
  /** `true` for a paragraph-sized gap, `false` for an inline one. */
  block?: boolean;
}) {
  const cls =
    "rounded-md border border-dashed border-line-strong px-2 py-1 text-body-sm text-mute-strong";
  const body = (
    <>
      <span className="font-semibold">{code}</span> · {children}
    </>
  );
  return block ? (
    <p className={cls}>{body}</p>
  ) : (
    <span className={`inline-block ${cls}`}>{body}</span>
  );
}
