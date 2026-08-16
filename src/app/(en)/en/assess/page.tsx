import type { Metadata } from "next";
import { ALL_COPY } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

/** `/en/assess`. See `src/app/(en)/en/page.tsx` for why this file exists. */
export const metadata: Metadata = pageMetadata({
  path: "/assess",
  title: ALL_COPY["nav.assess"],
  description: ALL_COPY["landing.subhead"],
  locale: "en",
});

export { default } from "../../../(th)/assess/page";
