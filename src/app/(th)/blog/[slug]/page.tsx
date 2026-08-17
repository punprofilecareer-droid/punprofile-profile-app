import type { Metadata } from "next";
import ArticleRoute from "@/components/features/blog/ArticleRoute";
import { POSTS, postBySlug } from "@/lib/content/blog";
import { pageMetadata, shareCard } from "@/lib/seo";

/**
 * One article, Thai. 16/08/2026.
 *
 * The reason the blog is worth building at all, per `nurture-flow.md`: a URL
 * that search can index and that renders a preview when it is pasted into LINE.
 * Both of those are this file, not the component it renders, and neither is
 * available from a `"use client"` page.
 *
 * `generateStaticParams` prerenders every article at build time. The content is
 * a TypeScript module with no fetch in it, so there is nothing to revalidate and
 * nothing that can be slow. It returns an empty list while `POSTS` is empty,
 * which is correct: there is no article to prerender and any slug 404s.
 */
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return {};

  const base = pageMetadata({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.summary,
    type: "article",
    // The article's own sharing card, cut to the ratio every platform crops to.
    // `pageMetadata` puts it on both `og:image` and `twitter:image`, and
    // `shareCard` returns undefined for an article with no art, which falls
    // through to the site image rather than to nothing.
    image: shareCard(post),
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      // `type` is restated rather than inherited from the spread. Next's
      // `OpenGraph` type is a discriminated union and a spread erases the
      // discriminant, so without this line the object is no longer provably an
      // article and `publishedTime` has nowhere to live.
      type: "article",
      // The one field only an article has.
      publishedTime: post.published,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleRoute slug={slug} locale="th" />;
}
