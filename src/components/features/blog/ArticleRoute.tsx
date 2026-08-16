import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import Article from "@/components/features/blog/Article";
import { postBySlug, topicById } from "@/lib/content/blog";
import type { Locale } from "@/lib/locale";
import { articleJsonLd } from "@/lib/seo";

/**
 * One article's route body, shared by both language trees. See
 * `BlogIndexRoute.tsx` for why this is a server component and why it is shared.
 *
 * The 404 lives here rather than in each route file, so an unknown slug behaves
 * identically in both languages. It cannot be reached from a link; it is what a
 * guessed or stale URL gets.
 */
export default function ArticleRoute({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const post = postBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd data={articleJsonLd(post, topicById(post.topic).label, locale)} />
      <Article slug={post.slug} />
    </>
  );
}
