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
  path: "/efc-assessment",
  title: ALL_COPY["nav.assess"],
  description: ALL_COPY["landing.subhead"],
});

/**
 * The ground the assessment sits on.
 *
 * This was `.eufit-field`, three radial pools of lavender added 14/08/2026.
 * It existed only to give the glass bars something to bend: over flat white the
 * material was an expensive way to draw a 1px border. The glass was retired
 * 16/08/2026, so the field went with it. Nothing here is decoration that
 * survived its reason.
 *
 * The layout itself stays, because it still does a second job: the page renders
 * four different things (loading, question, contact gate, result) and the
 * ground has to be continuous across all of them. It is now
 * `surface-container-low`, one tier off the default, which is how M3 marks a
 * region as its own without a colour change. That also keeps the EU Fit Check
 * identity where `design.md` puts it, in `tertiary` on the controls, rather
 * than in a full-bleed wash competing with PunProfile's own chrome.
 *
 * `min-h-full` and `flex-1` so it reaches the bottom of short screens.
 */
export default function AssessLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * The assessment sits on the system's own band, the same ground as the rest
     * of the site. It used to have a colour of its own; it does not any more, so
     * a tier that says "one step off the page" would be saying it about the page.
     */
    <div className="flex min-h-full flex-1 flex-col bg-surface-container">
      {children}
    </div>
  );
}
