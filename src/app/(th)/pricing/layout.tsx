import type { Metadata } from "next";
import { PRICING_HEADING, PRICING_INTRO } from "@/lib/content/pricing";
import { pageMetadata } from "@/lib/seo";

/**
 * Metadata for a `"use client"` page. Same pattern as `/services`: a client page
 * cannot export `metadata`, and a route-segment layout carries it for one file
 * that does nothing else.
 *
 * The strings are the page's own heading and intro, imported rather than
 * retyped. A title that has drifted from the `<h1>` beneath it is worse than no
 * title, because a reader arrives at something other than what the result
 * promised.
 */
export const metadata: Metadata = pageMetadata({
  path: "/pricing",
  title: PRICING_HEADING,
  description: PRICING_INTRO,
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
