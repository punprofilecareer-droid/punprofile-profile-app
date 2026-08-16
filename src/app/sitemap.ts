import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/content/blog";
import { LOCALES, localePath } from "@/lib/locale";
import { PUBLIC_ROUTES, absolute } from "@/lib/seo";

/**
 * `/sitemap.xml`. 16/08/2026.
 *
 * The site had none, which for a ten-page site is survivable and for a blog is
 * not: `nurture-flow.md` gives the blog one job, search, and an article nobody
 * links to from anywhere but a menu is an article a crawler finds late or not at
 * all.
 *
 * **Every page appears twice, once per language**, and each entry carries an
 * `alternates.languages` map naming its counterpart. Google reads that as
 * `hreflang` and it is the difference between two versions of a page and two
 * pages competing as duplicates of each other. The same map is on each page's
 * own `<head>` via `pageMetadata`; both are declared because a sitemap is read
 * before a page is fetched and a tag is read after, and the two are checked
 * against each other.
 *
 * The route list is `seo.ts`'s, not a second copy. `/admin` and `/login` are
 * absent there and also carry `noindex` on their own layout, because a sitemap
 * is a hint and a robots meta tag is an instruction.
 *
 * **`lastModified` is only set where a real date exists**, which today means the
 * articles and nothing else. `new Date()` on every route would stamp today onto
 * every page at every build, which tells a crawler the privacy notice changed
 * this morning. Doing that repeatedly is how a site teaches search engines to
 * stop believing the field.
 */

/** The `hreflang` map for one Thai path, absolute, as the sitemap format wants. */
const alternates = (path: string) => ({
  languages: Object.fromEntries(
    LOCALES.map((locale) => [locale, absolute(localePath(path, locale))]),
  ),
});

interface Entry {
  path: string;
  priority: number;
  /** Only the articles have one. See the note above on why nothing else does. */
  lastModified?: Date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    ...PUBLIC_ROUTES.map(({ path, priority }) => ({ path, priority })),
    ...POSTS.map((post) => ({
      path: `/blog/${post.slug}`,
      priority: 0.7,
      lastModified: new Date(post.published),
    })),
  ];

  return entries.flatMap((entry) =>
    LOCALES.map((locale) => ({
      url: absolute(localePath(entry.path, locale)),
      priority: entry.priority,
      alternates: alternates(entry.path),
      ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
    })),
  );
}
