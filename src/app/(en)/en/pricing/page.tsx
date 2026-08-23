import type { Metadata } from "next";
import { PRICING_HEADING, PRICING_INTRO } from "@/lib/content/pricing";
import { pageMetadata } from "@/lib/seo";

/** `/en/pricing`. See `src/app/(en)/en/page.tsx` for why this file exists. */
export const metadata: Metadata = pageMetadata({
  path: "/pricing",
  title: PRICING_HEADING,
  description: PRICING_INTRO,
  locale: "en",
});

export { default } from "../../../(th)/pricing/page";
