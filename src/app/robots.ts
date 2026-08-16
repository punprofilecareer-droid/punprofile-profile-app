import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

/**
 * `/robots.txt`. 16/08/2026.
 *
 * ---------------------------------------------------------------------------
 * TWO KINDS OF AI CRAWLER, AND THEY ARE NOT THE SAME DECISION
 * ---------------------------------------------------------------------------
 *
 * "Be findable by AI" is one requirement and the robots file answers it with two
 * different permissions, which is worth stating because they are routinely
 * conflated and only one of them was asked for:
 *
 * - **Retrieval.** `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`,
 *   `Claude-User`, `PerplexityBot`, `Perplexity-User`. These fetch a page in
 *   order to answer a question and cite it. This is what "AI searchable" means
 *   and it is the reason this file exists.
 * - **Training.** `GPTBot`, `ClaudeBot`, `Google-Extended`,
 *   `Applebot-Extended`, `CCBot`, `Bytespider`, `meta-externalagent`. These
 *   collect text to train a model. Nothing is cited back and no reader arrives.
 *
 * **Both are allowed, decided by Paul on 16/08/2026** when this file was put in
 * front of him with the distinction spelled out. The reasoning for allowing
 * training as well as retrieval: being in the training data is how a model
 * answers "Thai career coach Europe" without crawling anything, and for a
 * pre-pilot business with no Social Proof pillar that is worth more than the
 * text is.
 *
 * It is also what was already true. With no `robots.txt` at all, everything was
 * permitted by default, so this file changes nothing about who may crawl and
 * everything about whether that was chosen. Refusing training later is moving a
 * name from the allow list into a `disallow` rule, one line each, with no other
 * change.
 *
 * The retrieval agents are named explicitly rather than left to the wildcard.
 * The wildcard already covers them, so this is a statement rather than a
 * mechanism: it puts the intent on the record, and it means a later decision to
 * refuse training does not accidentally take retrieval down with it.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS CLOSED
 * ---------------------------------------------------------------------------
 *
 * `/admin` and `/login` only. Neither has anything for a stranger and `/admin`
 * sits in front of ninety real people's personal data, which `data-inventory.md`
 * records. This is not the security boundary and must never be mistaken for one:
 * `requireAdmin` in `convex/leads.ts` is, and a robots file is a request that
 * a hostile crawler simply ignores. It is here so an obedient crawler does not
 * put a login page in a search result.
 *
 * `/assess` is deliberately open. It is the product, it is the page every
 * Facebook post points at, and it is the one thing on this site somebody might
 * search for by name.
 */

/** Fetch a page to answer a question, and cite it. What "AI searchable" means. */
const AI_RETRIEVAL = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

const CLOSED = ["/admin", "/admin/", "/login", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: CLOSED },
      ...AI_RETRIEVAL.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: CLOSED,
      })),
    ],
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  };
}
