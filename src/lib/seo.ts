import type { Metadata } from "next";
import type { Copy } from "./content/copy";
import { DEFAULT_LOCALE, localePath, pick } from "./locale";
import type { Locale } from "./locale";
import { POSTS } from "./content/blog";
import type { Block, Section } from "./content/blog";

/**
 * Everything the site says about itself to a machine. 16/08/2026.
 *
 * Written because being found is a stated requirement and the site was not
 * equipped for it: no `robots.txt`, no sitemap, no structured data, and one
 * title and one description shared by all ten pages, so a search result for the
 * FAQ and a search result for the coaching page were the same result.
 *
 * ---------------------------------------------------------------------------
 * ONE ORIGIN
 * ---------------------------------------------------------------------------
 *
 * `SITE_URL` moved here from `layout.tsx`. It is now read by the layout, the
 * sitemap, `robots.txt`, `llms.txt` and every JSON-LD block, and a second
 * definition of it would be a second answer to "what is this site called",
 * which is the one question every one of those files exists to answer
 * identically.
 *
 * `SITE_URL` is the same variable `convex/notify.ts` reads and
 * `scripts/launch-prod.sh` sets. The fallback is the domain claimed 14/08/2026.
 *
 * ---------------------------------------------------------------------------
 * TWO LANGUAGES, TWO SETS OF URLS
 * ---------------------------------------------------------------------------
 *
 * Thai at the root, English under `/en`. `locale.ts` owns that shape and the
 * reasoning for it; this file is what tells a search engine about it.
 *
 * Every page declares three things, and all three are needed or none of them
 * works: a `canonical` pointing at its own language's URL, an `hreflang` pair
 * naming the other one, and an `x-default` naming Thai. Without the pair, the
 * two versions of a page compete with each other as duplicates. Without
 * `x-default`, a searcher in a country with neither language gets whichever
 * Google guessed.
 *
 * A page's strings are resolved at its own locale, which is the whole point of
 * having done the routing work: before 16/08/2026 everything here resolved at
 * `DEFAULT_LOCALE` because a crawler arrives with no cookie and would otherwise
 * have been served English by accident. The URL now answers that question, so
 * the `/en` tree can honestly be English.
 */
export const SITE_URL = process.env.SITE_URL ?? "https://punprofile.vercel.app";

/** Absolute, for structured data and sitemaps, which may not take a relative. */
export const absolute = (path: string): string => new URL(path, SITE_URL).toString();

/**
 * Every page a stranger may land on, in the order they matter.
 *
 * `/admin` and `/login` are absent for the same reason they are absent from the
 * menu in `nav.ts`: there is nothing behind either one for anyone who would find
 * them this way. Both also carry `robots: { index: false }` on their own
 * layouts, because a sitemap is a suggestion and a meta tag is not.
 *
 * `/blog` is present only when it has an article. An empty page in a sitemap is
 * a page a crawler fetches, finds nothing on, and learns to come back to less
 * often, which is a cost paid against the pages that do have something.
 */
export const PUBLIC_ROUTES: readonly { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/efc-assessment", priority: 0.9 },
  { path: "/coaching", priority: 0.8 },
  { path: "/services", priority: 0.8 },
  ...(POSTS.length > 0 ? [{ path: "/blog", priority: 0.7 }] : []),
  { path: "/faq", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
  { path: "/privacy", priority: 0.2 },
];

/**
 * A page's metadata, built the same way every time.
 *
 * The three things every page owes and none of them had: a title of its own, a
 * description of its own, and a canonical URL. The canonical matters more here
 * than on most sites, because `?topic=` and the `?src=` and `?job=` attribution
 * parameters in `attribution.ts` all produce URLs that a crawler will otherwise
 * treat as separate pages carrying duplicate content.
 */
export function pageMetadata({
  path,
  title,
  description,
  locale = DEFAULT_LOCALE,
  type = "website",
  image,
}: {
  /** The Thai path. The English one is derived, never passed. */
  path: string;
  title: Copy;
  description: Copy;
  locale?: Locale;
  type?: "website" | "article";
  /**
   * The sharing card, as a site-absolute path. Sets `og:image` AND
   * `twitter:image`, which is why it is one argument rather than something a
   * caller assembles: they were drifting apart the moment there were two of
   * them. X falls back to `og:image` when `twitter:image` is absent, so the
   * missing one was invisible rather than broken, which is the harder kind of
   * wrong to notice.
   *
   * Omit it and the page falls through to the site image on the root layout.
   * That is right for a page about the whole site and wrong for an article,
   * which is what `shareCard` exists to prevent.
   */
  image?: string;
}): Metadata {
  const t = pick(title, locale);
  const d = pick(description, locale);
  // Absolute, because Line, Slack and several crawlers do not resolve a
  // relative og:image against the page URL. `metadataBase` covers Next's own
  // rendering, and this covers everything that reads the tag directly.
  const card = image ? [{ url: absolute(image), width: 1200, height: 630 }] : undefined;

  return {
    title: t,
    description: d,
    alternates: {
      canonical: localePath(path, locale),
      // Keys are what Google reads as `hreflang`. `th` and `en` unqualified
      // rather than `th-TH` and `en-GB`: the split here is language, not region.
      // An English-speaking reader of this site could be anywhere, and a region
      // tag would tell a search engine to prefer the Thai page for all of them.
      languages: {
        th: path,
        en: localePath(path, "en"),
        "x-default": path,
      },
    },
    openGraph: {
      type,
      siteName: "PunProfile",
      locale: locale === "th" ? "th_TH" : "en_GB",
      url: localePath(path, locale),
      title: t,
      description: d,
      ...(card ? { images: card } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: d,
      ...(card ? { images: card } : {}),
    },
  };
}

/**
 * The sharing card for an article, by convention rather than by a field.
 *
 * An article with art at `/blog/<slug>.jpg` has a card at
 * `/blog/share/<slug>.jpg`, cut to 1200x630 by `scripts/build-share-cards.ts`.
 * Deriving it from the slug means there is nothing per-article to set and
 * therefore nothing to forget, and `npm run blog:cards -- --check` fails the
 * pre-push list if an article has art and no card.
 *
 * **Why not just reuse the article image.** Every platform renders a link card
 * at about 1.91:1 and centre-crops to get there. The art is 4:3, so a centre
 * crop takes 135px off the top, which on the first article cuts the figure's
 * head off. The card is the same picture recut with an upward bias.
 *
 * Returns undefined for an article with no art, and the page then falls through
 * to the site image, which is the correct fallback rather than a broken one.
 */
export function shareCard(post: { slug: string; image?: { src: string } }): string | undefined {
  return post.image ? `/blog/share/${post.slug}.jpg` : undefined;
}

/**
 * A page nobody should find in a search result, and which should also not pass
 * authority anywhere. Used by `/admin` and `/login`.
 */
export const NOT_INDEXED: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Proof to Google and Bing that whoever is claiming this site owns it.
 *
 * Both tools verify ownership before they will show a property's data or accept
 * a sitemap, and both accept a `<meta>` tag carrying a token they generate. The
 * token is not a secret, it is a nonce, so it lives in an environment variable
 * rather than in the repository only because it is per-property and changes when
 * the property does.
 *
 * **The meta tag is the only method available today**, and that is a
 * consequence of the domain rather than a preference. The other common methods,
 * a DNS `TXT` record and a file at the site root, both need control of the
 * domain, and `punprofile.vercel.app` is Vercel's. On a domain PunProfile owns,
 * DNS is the better method, because it verifies every subdomain at once and
 * survives a rebuild that forgets an environment variable.
 *
 * Absent variables render nothing at all rather than an empty tag, so this is
 * inert until the tokens exist:
 *
 *   GOOGLE_SITE_VERIFICATION=<token from Search Console, "HTML tag" method>
 *   BING_SITE_VERIFICATION=<token from Bing Webmaster Tools>
 *
 * Set them on the Vercel project, not in `.env.local`: a token that only exists
 * on a laptop verifies a site nobody can reach.
 */
export const VERIFICATION: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : {}),
  // Bing's own tag name. Next has no field for it, and `other` is the escape
  // hatch for exactly this.
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
};

/**
 * The organisation, for structured data.
 *
 * **Every field here is checkable against something already published.** The
 * name is the legal entity from `footer.ts`'s copyright line, the description is
 * the root metadata's own, the logo and the Facebook page are files and URLs
 * this site already serves or links to, and the disclaimer is the one in the
 * footer. Nothing is added because a schema has a slot for it: an invented
 * `foundingDate`, an `aggregateRating` with no reviews or an `address` that is
 * not a real place are exactly the claims `01_Project_Foundation.md` forbids,
 * and they are worse in JSON-LD than in prose because a machine repeats them
 * without the hedge.
 *
 * `ProfessionalService` rather than `Organization`: it is the narrower type that
 * is still true, and a search engine reading it learns that this is a service
 * somebody buys rather than a company that exists.
 */
export function organizationJsonLd(facebookPage: string, disclaimer: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absolute("/#organization"),
    name: "PunProfile Career Coaching",
    alternateName: "PunProfile",
    url: SITE_URL,
    logo: absolute("/punprofile-logo.svg"),
    image: absolute("/og.png"),
    sameAs: [facebookPage],
    description:
      "Career coaching for Thai professionals pursuing roles in Europe, with a free self-serve readiness check.",
    // The audience and the subject, which is the whole of what makes this
    // findable for the question a candidate actually asks.
    knowsLanguage: ["th", "en"],
    areaServed: [{ "@type": "Country", name: "Thailand" }],
    serviceType: "Career coaching",
    disambiguatingDescription: disclaimer,
  };
}

/**
 * The site itself, so a search engine can name it and knows where its search
 * lives if one is ever built. Deliberately without a `SearchAction`: the blog
 * has no search, and declaring one that does not exist is a broken promise a
 * machine will act on.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absolute("/#website"),
    url: SITE_URL,
    name: "PunProfile",
    inLanguage: "th",
    publisher: { "@id": absolute("/#organization") },
  };
}

/**
 * The blog index as a `Blog`, with each article as a member.
 *
 * `blogPost` rather than a bare list of links: it lets an answer engine read the
 * headline, the date and the summary of every article without fetching each one,
 * which is the difference between a site that can be cited and a site that has
 * to be crawled first.
 *
 * The `@id`s are per language, because the two trees are two documents. What
 * they share is the publisher, which they reference rather than restate.
 */
export function blogJsonLd(locale: Locale, heading: Copy, intro: Copy) {
  const at = (path: string) => absolute(localePath(path, locale));

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${at("/blog")}#blog`,
    url: at("/blog"),
    name: pick(heading, locale),
    description: pick(intro, locale),
    inLanguage: locale,
    publisher: { "@id": absolute("/#organization") },
    blogPost: POSTS.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${at(`/blog/${post.slug}`)}#article`,
      headline: pick(post.title, locale),
      description: pick(post.summary, locale),
      datePublished: post.published,
      url: at(`/blog/${post.slug}`),
    })),
  };
}

/**
 * One article, plus where it sits.
 *
 * `BlogPosting` is what makes an article quotable by an answer engine: headline,
 * date, language, publisher, and the section it belongs to, all readable without
 * parsing the prose. `BreadcrumbList` is what stops it being read as an orphan,
 * and it is what a search result renders as the path above the title.
 *
 * **`author` is the organisation, not a person.** Every article's Thai is Paul's
 * and the coaching page introduces him by name, but nothing here has a fact
 * about him it can cite from a content module, and inventing a `Person` node
 * with a name and a job title would be the first fabricated claim in the site's
 * structured data. The organisation is true and is enough. Give it a `Person`
 * when there is a byline on the page to match it.
 *
 * **An `FAQPage` node joins the graph when the article carries `qa` blocks**,
 * added 18/08/2026. That is the reason the block kind exists at all: a playbook
 * is the piece someone reaches by asking the question, and this is the only form
 * in which the question and its answer travel as a pair. It is emitted from the
 * blocks rather than hand-written, so the page and the markup cannot say
 * different things, and an article with no FAQ gets no node rather than an empty
 * one.
 */
export function articleJsonLd(
  post: {
    slug: string;
    title: Copy;
    summary: Copy;
    published: string;
    sections: readonly Section[];
    image?: { src: string };
  },
  section: Copy,
  locale: Locale,
) {
  const at = (path: string) => absolute(localePath(path, locale));
  const url = at(`/blog/${post.slug}`);

  const qa = post.sections
    .flatMap((s) => s.body)
    .filter((b): b is Extract<Block, { kind: "qa" }> => b.kind === "qa");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        isPartOf: { "@id": `${at("/blog")}#blog` },
        mainEntityOfPage: url,
        url,
        headline: pick(post.title, locale),
        description: pick(post.summary, locale),
        datePublished: post.published,
        dateModified: post.published,
        inLanguage: locale,
        articleSection: pick(section, locale),
        // Absolute, because a schema consumer is not reading this from the page
        // it sits on. Omitted rather than null when the article has no art, so
        // the node never claims an image that is not there.
        ...(post.image ? { image: absolute(post.image.src) } : {}),
        author: { "@id": absolute("/#organization") },
        publisher: { "@id": absolute("/#organization") },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PunProfile", item: at("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: at("/blog") },
          { "@type": "ListItem", position: 3, name: pick(post.title, locale) },
        ],
      },
      ...(qa.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              // The answer is the article's own paragraphs joined, because the
              // markup has to say what the page says. Two paragraphs on screen
              // are one answer to the question, and a reader who gets only the
              // first of them has been given a different, shorter answer than
              // the one that was written.
              mainEntity: qa.map((b) => ({
                "@type": "Question",
                name: pick(b.q, locale),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: b.a.map((p) => pick(p, locale)).join(" "),
                },
              })),
            },
          ]
        : []),
    ],
  };
}
