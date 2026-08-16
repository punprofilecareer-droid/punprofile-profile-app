import type { Metadata } from "next";
import { HOOK_EYEBROW, HOOK_LINE_1, HOOK_LINE_2 } from "@/lib/content/coaching";
import { pageMetadata } from "@/lib/seo";

/** `/en/coaching`. See `src/app/(en)/en/page.tsx` for why this file exists. */
export const metadata: Metadata = pageMetadata({
  path: "/coaching",
  title: HOOK_EYEBROW,
  description: {
    en: `${HOOK_LINE_1.en} ${HOOK_LINE_2.en}`,
    th: `${HOOK_LINE_1.th} ${HOOK_LINE_2.th}`,
  },
  locale: "en",
});

export { default } from "../../../(th)/coaching/page";
