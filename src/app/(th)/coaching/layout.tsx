import type { Metadata } from "next";
import { HOOK_EYEBROW, HOOK_LINE_1, HOOK_LINE_2 } from "@/lib/content/coaching";
import { pageMetadata } from "@/lib/seo";

/**
 * See `services/layout.tsx` for why a layout carries this.
 *
 * The page opens on a two-line headline rather than a heading and a paragraph,
 * so the description is those two lines joined. Same pair the share card in the
 * root layout uses, and joined the same way, because they are one sentence
 * broken for typographic reasons and a search result has no line to break on.
 */
export const metadata: Metadata = pageMetadata({
  path: "/coaching",
  title: HOOK_EYEBROW,
  description: {
    en: `${HOOK_LINE_1.en} ${HOOK_LINE_2.en}`,
    th: `${HOOK_LINE_1.th} ${HOOK_LINE_2.th}`,
  },
});

export default function CoachingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
