import type { Metadata } from "next";
import Unsubscribe from "@/components/features/blog/Unsubscribe";
import { NOT_INDEXED } from "@/lib/seo";

/**
 * `/unsubscribe/<token>`. 16/08/2026.
 *
 * **Never indexed, and this is the one page on the site where that is not about
 * tidiness.** The URL is a capability: following it stops somebody's email.
 * A crawler that indexed one would put a working opt-out link in a search
 * result, and the next crawler to follow it would unsubscribe a person who
 * never asked. `robots.ts` does not need a rule for it because the path is
 * unguessable, but the tag is the instruction that matters to a crawler that
 * has already been handed the link.
 *
 * No canonical and no `hreflang`, deliberately: this is not a page anyone
 * should arrive at twice, and declaring an alternate would advertise the same
 * capability at a second address.
 */
export const metadata: Metadata = NOT_INDEXED;

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <Unsubscribe token={token} />;
}
