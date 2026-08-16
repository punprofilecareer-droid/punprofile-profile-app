import type { Metadata } from "next";
import { SERVICES_HEADING, SERVICES_INTRO } from "@/lib/content/services";
import { pageMetadata } from "@/lib/seo";

/**
 * Metadata for a `"use client"` page. 16/08/2026.
 *
 * A client page cannot export `metadata`, and rewriting six pages into server
 * shells to give them a title would touch every one of them for a reason that
 * has nothing to do with what they render. A route-segment layout carries
 * metadata for its segment and costs one file that does nothing else.
 *
 * The strings are the page's own heading and intro, imported rather than
 * retyped. A title that has drifted from the `<h1>` beneath it is worse than no
 * title, because a reader arrives at something other than what the result
 * promised.
 */
export const metadata: Metadata = pageMetadata({
  path: "/services",
  title: SERVICES_HEADING,
  description: SERVICES_INTRO,
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
