import type { Metadata } from "next";
import { CONTACT_HEADING, CONTACT_INTRO } from "@/lib/content/contact";
import { pageMetadata } from "@/lib/seo";

/** `/en/contact`. See `src/app/(en)/en/page.tsx` for why this file exists. */
export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: CONTACT_HEADING,
  description: CONTACT_INTRO,
  locale: "en",
});

export { default } from "../../../(th)/contact/page";
