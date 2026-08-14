/**
 * The lavender field the assessment sits on. Added 14/08/2026 with the Liquid
 * Glass pass, and it is not decoration: glass works by bending what is behind
 * it, so over flat white the material is an expensive way to draw a 1px
 * border. Something with local variation has to pass under the bars for the
 * effect to exist at all.
 *
 * A route layout rather than a class on each branch of the page, because the
 * page renders four different things (loading, question, contact gate, result)
 * and the field has to be continuous across all of them. It also keeps the
 * field off every other route: the landing page, the privacy policy and the
 * whole coach dashboard stay white, since they are PunProfile surfaces rather
 * than EU Fit Check ones.
 *
 * `min-h-full` and `flex-1` so the field reaches the bottom of short screens.
 * A gradient that stops two thirds down is worse than no gradient.
 */
export default function AssessLayout({ children }: { children: React.ReactNode }) {
  return <div className="eufit-field flex min-h-full flex-1 flex-col">{children}</div>;
}
