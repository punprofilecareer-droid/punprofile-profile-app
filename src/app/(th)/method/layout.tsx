import type { Metadata } from "next";
import { METHOD_HEADING, METHOD_INTRO } from "@/lib/content/method";
import { NOT_YET_INDEXED, pageMetadata } from "@/lib/seo";

/**
 * See `faq/layout.tsx` for why a layout carries this rather than the page.
 *
 * `NOT_YET_INDEXED` until the Thai on this page is read back, which is the same
 * arrangement the four `soon` product pages use. It comes off with the marker,
 * at which point `/method` joins `PUBLIC_ROUTES` in `seo.ts`. Both are the same
 * decision and drift apart if they are made on different days.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    path: "/method",
    title: METHOD_HEADING,
    description: METHOD_INTRO,
  }),
  ...NOT_YET_INDEXED,
};

export default function MethodLayout({ children }: { children: React.ReactNode }) {
  return children;
}
