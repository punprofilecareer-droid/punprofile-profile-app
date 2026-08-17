"use client";

/**
 * The lockup in the header, and which brand it shows.
 *
 * Added 16/08/2026, positioning EU Fit Check as a sub-brand rather than a
 * differently-coloured page of the parent site.
 *
 * **On the assessment route the header shows the EU Fit Check lockup; everywhere
 * else it shows PunProfile.** The EFC lockup carries "by PunProfile" under its
 * own name, so the parent is never absent, it is subordinated. That is the whole
 * of what a sub-brand is, and it makes visible the split `design.md` has held
 * since 14/08/2026: the assessment is a product a candidate uses, PunProfile is
 * the company they are being introduced to, and a candidate has to be able to
 * tell them apart.
 *
 * A client component reading the pathname, rather than a prop threaded down from
 * three root layouts. The header is rendered once in `SiteShell` for all of
 * them, so a prop would have to be passed identically in three places and would
 * be wrong in whichever one somebody forgot.
 *
 * Deliberately not a link, in either brand. The header sits above a running
 * assessment and a logo that navigates home is a one-tap way to lose ten
 * answers. Navigation has its own control on the left.
 */

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";

/**
 * The assessment's path, without a locale prefix. One constant because three
 * things need to agree about it: this component, `seo.ts`'s route table, and the
 * sitemap. If the route is ever renamed, every link ever posted to the group
 * carries the old one, so a rename needs a redirect rather than a find-replace.
 */
export const ASSESS_PATH = "/efc-assessment";

/**
 * Matches the Thai route at the root and the English one under `/en`.
 *
 * Exported since 17/08/2026, because `BrandScope` needs the same answer to
 * decide whether the content column is inside EU Fit Check's colour scope. Two
 * copies of this would be two things that can disagree about which route the
 * sub-brand lives on, and the lockup and the ground under it disagreeing is the
 * one failure the sub-brand cannot survive.
 */
export function isAssessment(pathname: string): boolean {
  return pathname === ASSESS_PATH || pathname === `/en${ASSESS_PATH}`;
}

export default function BrandLockup() {
  const { t } = useCopy();
  const pathname = usePathname() ?? "";
  const efc = isAssessment(pathname);

  return (
    <Image
      // Both are vector, and both carry the brand orange mark, which is what
      // makes the pair read as one family rather than two logos.
      src={efc ? "/efc-logo.svg" : "/punprofile-logo.svg"}
      alt={efc ? `${t("nav.assess")} — ${t("nav.brand")}` : t("nav.brand")}
      width={efc ? 1911 : 2421}
      height={efc ? 488 : 657}
      priority
      // The EFC lockup is wider relative to its height and its descriptor line
      // is smaller, so it needs a little more box to read at the same optical
      // size as the parent.
      className={efc ? "h-10 w-auto" : "h-9 w-auto"}
    />
  );
}
