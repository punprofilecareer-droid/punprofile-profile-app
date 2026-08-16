import type { Metadata } from "next";
import { CONTACT_HEADING, CONTACT_INTRO } from "@/lib/content/contact";
import { pageMetadata } from "@/lib/seo";

/**
 * See `services/layout.tsx` for why a layout carries this.
 *
 * The strings come from `contact.ts`, which they were moved into on 16/08/2026
 * for exactly this reason: the page had them inline, and a title, a description
 * and an English route were about to be three more copies.
 */
export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: CONTACT_HEADING,
  description: CONTACT_INTRO,
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
