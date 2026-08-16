import type { Metadata } from "next";
import BlogIndexRoute from "@/components/features/blog/BlogIndexRoute";
import { BLOG_HEADING, BLOG_INTRO, POSTS } from "@/lib/content/blog";
import { pageMetadata } from "@/lib/seo";

/**
 * The blog index, Thai. 16/08/2026.
 *
 * A server component wrapping a client one, which is the opposite of every other
 * page on this site and is the whole reason the blog exists. `nurture-flow.md`
 * gives it one job, search and a link that renders a preview in LINE, and a
 * `"use client"` page cannot export `metadata`.
 *
 * **`noindex` while it is empty.** The section shipped with no articles, and a
 * page in the index with nothing on it is worse than a page that is not in the
 * index: a crawler spends a visit on it, finds nothing, and comes back to the
 * whole site less often. `sitemap.ts` and `nav.ts` leave it out on the same
 * condition and for the same reason. The first article turns all three on at
 * once, with no edit here.
 */
export const metadata: Metadata = {
  ...pageMetadata({ path: "/blog", title: BLOG_HEADING, description: BLOG_INTRO }),
  ...(POSTS.length === 0 ? { robots: { index: false, follow: true } } : {}),
};

export default function BlogPage() {
  return <BlogIndexRoute locale="th" />;
}
