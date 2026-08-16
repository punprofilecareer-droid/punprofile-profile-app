import type { Metadata } from "next";
import { NOT_INDEXED } from "@/lib/seo";

/**
 * Never indexed. 16/08/2026.
 *
 * `robots.ts` already disallows this path, and a robots file is a request that
 * a crawler is free to ignore, while this tag is an instruction to one that has
 * already fetched the page. Both, because what sits behind here is ninety real
 * people's personal data per `data-inventory.md`.
 *
 * Neither is the security boundary. `requireAdmin` in `convex/leads.ts` is, and
 * the redirect in `src/proxy.ts` is the convenience layer in front of it.
 */
export const metadata: Metadata = NOT_INDEXED;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
