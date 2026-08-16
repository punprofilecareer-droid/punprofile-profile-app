import type { Metadata } from "next";
import { FAQ_HEADING, FAQ_INTRO } from "@/lib/content/faq";
import { pageMetadata } from "@/lib/seo";

/** `/en/faq`. See `src/app/(en)/en/page.tsx` for why this file exists. */
export const metadata: Metadata = pageMetadata({
  path: "/faq",
  title: FAQ_HEADING,
  description: FAQ_INTRO,
  locale: "en",
});

export { default } from "../../../(th)/faq/page";
