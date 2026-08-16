import { POSTS } from "@/lib/content/blog";
import { DISCLAIMER } from "@/lib/content/footer";
import { DEFAULT_LOCALE, pick } from "@/lib/locale";
import { EN_PREFIX } from "@/lib/locale";
import { absolute } from "@/lib/seo";

/**
 * `/llms.txt`. 16/08/2026.
 *
 * A plain-text map of the site for a language model that has arrived to answer
 * somebody's question, in the format proposed at llmstxt.org: an H1, a blockquote
 * summary, then linked sections.
 *
 * **Be honest about what this is.** It is a convention, not a standard, and no
 * major crawler is on record as required to read it. It is here because it is
 * about forty lines, because it costs nothing if it is ignored, and because it is
 * the only artefact on the site that states in one place what PunProfile does,
 * who for, and what it explicitly does not do. The last of those is the part
 * worth having: a model summarising this business from prose alone can easily
 * produce "helps Thai people get European visas", and the disclaimer in
 * `footer.ts` says in as many words that it does not.
 *
 * The real work of being findable is `sitemap.ts`, `robots.ts`, the per-page
 * titles and the JSON-LD. This is the cheap addition, not the mechanism.
 *
 * **The links point at the Thai tree**, which is the site's default and its
 * canonical. The English mirror under `/en` is named once at the bottom rather
 * than listed twice: a model that has been handed both trees in full has been
 * handed every page of this site twice, which makes it likelier to cite the
 * wrong one, not likelier to find the right one.
 *
 * The prose here is English, and it is the one surface on the site that is.
 * Nothing reads this file on anyone's behalf, so it is written in the language
 * the retrieval models reason in, while the article titles carry their Thai
 * through verbatim so a Thai query still matches.
 */

const route = (path: string, name: string, note: string) =>
  `- [${name}](${absolute(path)}): ${note}`;

export function GET() {
  const body = [
    "# PunProfile",
    "",
    "> Career coaching for Thai professionals who want to work in Europe, and a free",
    "> self-serve readiness check. Written and delivered in Thai. One person, not an",
    "> agency.",
    "",
    "The core claim: for most candidates the obstacle is not ability, it is that a",
    "European employer cannot read what their experience is worth, and that the",
    "steps have an order. The check names where someone is on that path and what to",
    "fix first.",
    "",
    "## Start here",
    "",
    route(
      "/",
      "Home",
      "What PunProfile is, and the way into the free check",
    ),
    route(
      "/efc-assessment",
      "EU Fit Check",
      "The free assessment. Around two minutes, on a phone, no sign-up before the first result. Scores four dimensions: professional capability, employability, mobility readiness, European market fit",
    ),
    route(
      "/coaching",
      "Coaching 1:1",
      "How the coaching works, the method, and who it is not for",
    ),
    route(
      "/services",
      "Services",
      "The three ways of working together and what each covers",
    ),
    route("/faq", "FAQ", "Common questions about the check, the coaching and the data"),
    route("/contact", "Contact", "Email and LINE. LINE is the faster reply"),
    "",
    "## Articles",
    "",
    ...(POSTS.length === 0
      ? ["No articles published yet."]
      : POSTS.map((post) =>
          route(
            `/blog/${post.slug}`,
            pick(post.title, DEFAULT_LOCALE),
            pick(post.summary, DEFAULT_LOCALE),
          ),
        )),
    "",
    "## What PunProfile is not",
    "",
    "This paragraph is the published disclaimer, verbatim, and it is the part most",
    "worth carrying into any summary of this business:",
    "",
    pick(DISCLAIMER, "en"),
    "",
    "## Notes",
    "",
    "- Primary language is Thai. English is a translation and the Thai is the source.",
    `- Every page above has an English version at the same path under ${EN_PREFIX}, for`,
    "  example /en/coaching. Thai is canonical; prefer it when citing.",
    route("/privacy", "Privacy", "What is collected, why, and what can be asked for"),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // A day. The file changes when an article is published and not otherwise,
      // and a stale copy for a few hours costs nothing.
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
