import JsonLd from "@/components/JsonLd";
import BlogIndex from "@/components/features/blog/BlogIndex";
import { BLOG_HEADING, BLOG_INTRO, POSTS } from "@/lib/content/blog";
import type { Locale } from "@/lib/locale";
import { blogJsonLd } from "@/lib/seo";

/**
 * The blog index route body, shared by both language trees. 16/08/2026.
 *
 * A server component, so the structured data is in the HTML a crawler receives
 * rather than written in after hydration. Several of the AI retrieval agents
 * named in `robots.ts` do not run JavaScript, and structured data they cannot
 * see is structured data that does not exist.
 *
 * Both `src/app/(th)/blog/page.tsx` and `src/app/(en)/en/blog/page.tsx` render
 * this and differ only in the locale they pass and the metadata they export.
 * That is the whole shape of the `/en` tree: two route files, one component.
 *
 * The `Blog` node renders only when there is something to describe. An empty one
 * is a claim that this site publishes, made on a page that proves it does not.
 */
export default function BlogIndexRoute({ locale }: { locale: Locale }) {
  return (
    <>
      {POSTS.length > 0 && (
        <JsonLd data={blogJsonLd(locale, BLOG_HEADING, BLOG_INTRO)} />
      )}
      <BlogIndex />
    </>
  );
}
