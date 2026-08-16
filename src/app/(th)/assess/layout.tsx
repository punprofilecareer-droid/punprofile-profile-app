import type { Metadata } from "next";
import { ALL_COPY } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

/**
 * The assessment's own title and description. Added 16/08/2026.
 *
 * Deliberately open to crawlers, which `robots.ts` says out loud: this is the
 * product, it is what every Facebook post links to, and it is the only page on
 * the site somebody might search for by its name. The landing page sells it and
 * this is it, so the two are close by design and separated by the title: the
 * landing page is the pitch, `EU Fit Check` is the thing.
 *
 * `EU Fit Check` is `fixed: true` in `termbase.yml`, so it is written here the
 * way it is written everywhere, and it comes out of the copy bank rather than
 * being typed, which is what makes that true rather than merely intended.
 */
export const metadata: Metadata = pageMetadata({
  path: "/assess",
  title: ALL_COPY["nav.assess"],
  description: ALL_COPY["landing.subhead"],
});

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
