import type { Metadata } from "next";
import { FAQ_HEADING, FAQ_INTRO } from "@/lib/content/faq";
import { pageMetadata } from "@/lib/seo";

/** See `services/layout.tsx` for why a layout carries this. */
export const metadata: Metadata = pageMetadata({
  path: "/faq",
  title: FAQ_HEADING,
  description: FAQ_INTRO,
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
