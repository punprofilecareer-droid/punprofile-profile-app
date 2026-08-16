import type { Metadata } from "next";
import { PRIVACY_HEADING, PRIVACY_INTRO } from "@/lib/content/privacy";
import { pageMetadata } from "@/lib/seo";

/** See `services/layout.tsx` for why a layout carries this. */
export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: PRIVACY_HEADING,
  description: PRIVACY_INTRO,
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
