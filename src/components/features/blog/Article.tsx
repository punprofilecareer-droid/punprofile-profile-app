"use client";

/**
 * One article, rendered. 16/08/2026.
 *
 * Takes a slug rather than a post, so the server route stays free of the copy
 * objects: it looks up the same module, and a slug that does not resolve has
 * already been sent to `notFound()` upstream.
 *
 * The header sits on the topic's own wash and the body on white. That is the
 * one place `design.md`'s wash rotation fits a blog cleanly, because one article
 * has one topic, so a whole section can take one wash without blending. Cards on
 * the index deliberately do not, and `PostCard` says why.
 *
 * Measure is `max-w-2xl`, the same reading column as the FAQ and the privacy
 * notice. `design.md` asks for generous spacing over density, and a wider column
 * would cost more than the space buys: Thai carries tone marks above and below
 * the line and is written without word spaces, so a long line has fewer places
 * for the eye to reacquire itself than the same line in Latin.
 */

import Image from "next/image";
import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import {
  BLOG_BACK,
  BLOG_CLOSE,
  BLOG_QUESTION_LABEL,
  formatDate,
  postBySlug,
  topicById,
} from "@/lib/content/blog";
import type { Block } from "@/lib/content/blog";

function Body({ blocks }: { blocks: readonly Block[] }) {
  const { pick } = useCopy();

  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "sub") {
          return (
            <h3 key={i} className="mt-10 text-title-medium text-on-surface">
              {pick(block.text)}
            </h3>
          );
        }

        if (block.kind === "list") {
          const items = block.items.map((item, j) => (
            <li key={j} className="flex gap-3 text-body-large text-on-surface">
              {/* A bare list keeps the `li`, and therefore the list semantics,
                  and drops only the drawn marker. See `blog.ts` for why these
                  passages are a list at all. */}
              {block.bare ? null : block.ordered ? (
                <span aria-hidden className="shrink-0 font-semibold text-on-primary">
                  {j + 1}.
                </span>
              ) : (
                <span
                  aria-hidden
                  className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-primary"
                />
              )}
              <span>{pick(item)}</span>
            </li>
          ));
          return block.ordered ? (
            <ol key={i} className="mt-5 flex flex-col gap-3">
              {items}
            </ol>
          ) : (
            <ul key={i} className="mt-5 flex flex-col gap-3">
              {items}
            </ul>
          );
        }

        if (block.kind === "qa") {
          return (
            // `h3`, under the section's own `h2`. The FAQ is an appendix to the
            // argument above it, not a continuation of it, and the heading
            // outline is the only thing that says so to a screen reader or to
            // anything else reading the document rather than looking at it.
            <div key={i} className="mt-10 first:mt-6">
              <h3 className="text-title-medium text-on-surface">{pick(block.q)}</h3>
              {block.a.map((para, j) => (
                <p key={j} className="mt-3 text-body-large text-on-surface-variant">
                  {pick(para)}
                </p>
              ))}
            </div>
          );
        }

        return (
          <p key={i} className="mt-5 text-body-large text-on-surface">
            {pick(block.text)}
            {/* The citation sits on the paragraph whose claim it supports, not
                in a pile at the foot. `blog.ts` says why: a footnote list lets a
                paragraph borrow the authority of a source that says something
                else, and two of these articles carry numbers from three
                different institutions. */}
            {block.cite && (
              <>
                {" "}
                <a
                  href={block.cite.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-medium text-on-primary underline underline-offset-2"
                >
                  {block.cite.label} &#8599;
                </a>
              </>
            )}
          </p>
        );
      })}
    </>
  );
}

export default function Article({ slug }: { slug: string }) {
  const { pick, path } = useCopy();
  const post = postBySlug(slug);
  if (!post) return null;
  const topic = topicById(post.topic);

  return (
    <article>
      <header style={{ backgroundColor: topic.wash }}>
        <div className="mx-auto w-full max-w-2xl px-6 py-14">
          <Link
            href={path("/blog")}
            className="text-body-medium text-on-surface-variant underline underline-offset-2"
          >
            &larr; {pick(BLOG_BACK)}
          </Link>

          <h1 className="mt-8 text-display-small">{pick(post.title)}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-body-medium text-on-surface-variant">
            <Link
              href={path(`/blog?topic=${topic.id}`)}
              className="rounded-full border border-on-surface/15 px-3 py-1 font-semibold transition-colors hover:border-on-surface/40"
            >
              {pick(topic.label)}
            </Link>
            <time dateTime={post.published}>{formatDate(post.published)}</time>
          </div>
        </div>
      </header>

      {/* Between the header and the body, spanning the reading column rather
          than the window. A full-bleed hero would be the widest thing on a site
          whose every other page holds one measure, and the article's own header
          already carries the topic wash that a hero would be competing with.

          `priority` because on an article page this is the largest element above
          the fold and lazy-loading it is the one case Next's own guidance calls
          out. Sized to the column, not the viewport, so a desktop reader is not
          served an image three times the box it lands in. */}
      {post.image && (
        <div className="mx-auto w-full max-w-2xl px-6 pt-10">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-large">
            <Image
              src={post.image.src}
              alt={pick(post.image.alt)}
              fill
              priority
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <p className="text-body-large text-on-surface-variant">{pick(post.summary)}</p>

        {post.sections.map((section, i) => (
          <section key={i} className={i === 0 ? "mt-8" : "mt-12"}>
            {section.heading && <h2 className="text-headline-small">{pick(section.heading)}</h2>}
            <Body blocks={section.body} />
          </section>
        ))}

        {post.question && (
          <div className="card-tonal mt-12 rounded-large px-6 py-7">
            <p className="text-body-medium font-semibold text-on-primary-container">
              {pick(BLOG_QUESTION_LABEL)}
            </p>
            <p className="mt-2 text-title-medium text-on-surface">{pick(post.question)}</p>
          </div>
        )}

        <div className="mt-16 border-t border-outline-variant pt-10">
          <p className="text-body-large text-on-surface-variant">{pick(BLOG_CLOSE)}</p>
          <CallToAction page="/blog/post" className="mt-5" />
        </div>
      </div>
    </article>
  );
}
