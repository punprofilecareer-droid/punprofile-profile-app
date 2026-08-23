import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/features/products/ProductPage";
import { PRODUCTS, productBySlug } from "@/lib/content/products";
import { NOT_YET_INDEXED, pageMetadata } from "@/lib/seo";

/**
 * `/products/<slug>`. Added 23/08/2026.
 *
 * **A dynamic segment rather than five flat routes**, the same call the blog
 * made. Five products is ten route files across two language trees, each one a
 * place for the chrome to drift, and the pages are identical in everything but
 * their data.
 *
 * **Under `/products/` rather than at the root**, which is where the reference
 * product puts them (`careersy.ai/cv-score`). A bare slug at the root needs a
 * catch-all that swallows every future path, and the group already has a name in
 * the menu, so the URL saying it costs nothing and prevents that.
 */

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  return {
    ...pageMetadata({
      path: `/products/${slug}`,
      // The name in the tab, the headline as the description. The headline is the
      // problem the reader has, which is what a search result should be answering.
      title: product.name,
      description: product.headline,
    }),
    // A product that is not open yet is not a search result. Spread AFTER the
    // metadata so the tag wins, and applied here rather than inside
    // `pageMetadata` because the condition is the product's own status and
    // nothing else on the site has one.
    ...(product.status === "soon" ? NOT_YET_INDEXED : {}),
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
