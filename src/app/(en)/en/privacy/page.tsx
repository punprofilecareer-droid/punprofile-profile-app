import type { Metadata } from "next";
import { PRIVACY_HEADING, PRIVACY_INTRO } from "@/lib/content/privacy";
import { pageMetadata } from "@/lib/seo";

/** `/en/privacy`. See `src/app/(en)/en/page.tsx` for why this file exists. */
export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: PRIVACY_HEADING,
  description: PRIVACY_INTRO,
  locale: "en",
});

export { default } from "../../../(th)/privacy/page";
