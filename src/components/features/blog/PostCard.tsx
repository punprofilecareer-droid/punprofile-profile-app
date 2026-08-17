"use client";

/**
 * One article, as a card. 16/08/2026.
 *
 * White with a 1px border and no shadow, which is `design.md`'s elevation rule
 * rather than a style choice: border-only for a card sitting on `surface`, soft
 * shadow only for one floating on a colour wash. The grid these sit in is white,
 * so they take the border.
 *
 * **No per-card wash.** The obvious move is to tint each card with its topic's
 * colour, and the system forbids it in as many words: rotate a wash per SECTION,
 * one per section, never blended. Three tints in one grid is the blend. The
 * topic's colour is spent on the article page instead, where one article means
 * one topic means one wash for the whole header.
 *
 * `size` is the only variant. The first card in a list runs wide and takes the
 * larger headline, which is the whole of the editorial hierarchy here: there is
 * no featured section, because with three articles a featured section would be
 * the blog.
 */

import Image from "next/image";
import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import { BLOG_READ, formatDate, topicById } from "@/lib/content/blog";
import type { Post } from "@/lib/content/blog";

export default function PostCard({
  post,
  size = "normal",
}: {
  post: Post;
  size?: "normal" | "lead";
}) {
  const { pick, path } = useCopy();
  const topic = topicById(post.topic);
  const lead = size === "lead";

  return (
    <article
      className={`relative flex flex-col rounded-large border border-outline-variant bg-surface transition-colors hover:border-primary ${
        lead ? "large:col-span-2" : ""
      }`}
    >
      {/* Above the text, not beside it, and only when the article has one. The
          4:3 box and `object-cover` are `services/page.tsx`'s pattern, so the
          two grids of cards on this site crop art the same way. `rounded-t` and
          `overflow-hidden` because the card's own corner is `rounded-large` and
          a square image inside it would show four white notches. */}
      {post.image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-large">
          <Image
            src={post.image.src}
            alt={pick(post.image.alt)}
            fill
            sizes={lead ? "(max-width: 1200px) 100vw, 66vw" : "(max-width: 1200px) 100vw, 33vw"}
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col px-6 py-7">
        <p className="text-body-medium font-semibold text-primary">{pick(topic.label)}</p>

        <h2 className={`mt-3 ${lead ? "text-headline-small" : "text-title-large"}`}>
          {/* The whole card is not the link. A card-wide anchor swallows the
              date and the summary into one enormous accessible name, and this
              audience reads the summary to decide. The title is the link and
              `after:absolute` grows its hit area to the card, so a tap anywhere
              still works. */}
          <Link href={path(`/blog/${post.slug}`)} className="after:absolute after:inset-0">
            {pick(post.title)}
          </Link>
        </h2>

        <p className="mt-3 text-body-large text-on-surface-variant">{pick(post.summary)}</p>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-3 pt-7">
          <time dateTime={post.published} className="text-body-medium text-on-surface-variant">
            {formatDate(post.published)}
          </time>
          {/* Not a second link. The title already carries the anchor and its hit
              area already covers the card, so a real link here would put two
              stops in the tab order for one destination and read the title
              twice to a screen reader. */}
          <span aria-hidden className="flex items-center gap-2 text-label-large text-primary">
            {pick(BLOG_READ)}
            <span>&rarr;</span>
          </span>
        </div>
      </div>
    </article>
  );
}
