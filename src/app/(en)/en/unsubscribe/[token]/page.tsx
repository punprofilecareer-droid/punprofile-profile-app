import type { Metadata } from "next";
import { UNSUBSCRIBE_HEADING } from "@/lib/content/blog";
import { pick } from "@/lib/locale";
import { NOT_INDEXED } from "@/lib/seo";

/**
 * `/en/unsubscribe/<token>`. See the Thai route for why this is never indexed.
 *
 * It exists so a reader who was on the English tree when they subscribed lands
 * back on it, rather than being answered in a language they did not choose at
 * the one moment they are already unhappy with the email.
 */
export const metadata: Metadata = {
  ...NOT_INDEXED,
  title: pick(UNSUBSCRIBE_HEADING, "en"),
};

export { default } from "../../../../(th)/unsubscribe/[token]/page";
