"use client";

/**
 * Puts the content column inside EU Fit Check's colour scope on the assessment
 * route, and leaves it alone everywhere else. 17/08/2026.
 *
 * **Why this is not just the assessment's own layout.** The header is rendered
 * by `SiteShell` above `<main>`, so a scope set inside the route would recolour
 * the assessment and leave the EU Fit Check lockup sitting on the parent's warm
 * ground, which is the seam the sub-brand is trying to remove. Header, content
 * and footer are one column and they take the scope together.
 *
 * **The drawer is deliberately outside it.** At `expanded` the site navigation
 * sits to the left of this column and keeps PunProfile's own olive-tinted
 * ground. That is the whole proposition stated in colour: a blue tool with its
 * own ground, running inside the company's site rather than instead of it. It is
 * also hidden during the flow itself by `NavLockGate`, so it only reads that way
 * once the candidate has finished.
 *
 * A client component reading the pathname, for the same reason `BrandLockup` is
 * one: the header is rendered once for all three root layouts, so a prop would
 * have to be passed identically in three places and would be wrong in whichever
 * one somebody forgot.
 */

import { usePathname } from "next/navigation";
import { isAssessment } from "@/components/BrandLockup";

export default function BrandScope({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // `undefined` rather than a second value: a page that is not EU Fit Check has
  // no brand scope at all, and the attribute should not be in the DOM claiming
  // otherwise.
  return (
    <div data-brand={isAssessment(pathname) ? "efc" : undefined} className={className}>
      {children}
    </div>
  );
}
