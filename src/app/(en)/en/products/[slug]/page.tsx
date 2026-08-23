import type { Metadata } from "next";
import { PRODUCTS, productBySlug } from "@/lib/content/products";
import { NOT_YET_INDEXED, pageMetadata } from "@/lib/seo";

/** `/en/products/<slug>`. See `src/app/(en)/en/page.tsx` for why this exists. */

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
      title: product.name,
      description: product.headline,
      locale: "en",
    }),
    ...(product.status === "soon" ? NOT_YET_INDEXED : {}),
  };
}

export { default } from "../../../../(th)/products/[slug]/page";
