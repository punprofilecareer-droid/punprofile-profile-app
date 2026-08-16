import type { Metadata } from "next";
import ArticleRoute from "@/components/features/blog/ArticleRoute";
import { POSTS, postBySlug } from "@/lib/content/blog";
import { pageMetadata } from "@/lib/seo";

/** `/en/blog/<slug>`. See `src/app/(en)/en/page.tsx` for why this file exists. */
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
    locale: "en",
    type: "article",
  });

  return {
    ...base,
    openGraph: { ...base.openGraph, type: "article", publishedTime: post.published },
  };
}

export default async function ArticlePageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleRoute slug={slug} locale="en" />;
}
