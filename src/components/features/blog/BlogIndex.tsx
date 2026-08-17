"use client";

/**
 * The blog index. 16/08/2026.
 *
 * Three sections, one background each, which is `design.md`'s wash rule applied
 * literally: the hero on Mint, the list on white, and the closing block a Mint
 * material panel rather than a fourth full-bleed wash, the same shape the FAQ
 * page closes with.
 *
 * Filtering is `?topic=`, in the URL rather than in state, so a topic can be
 * linked to, shared and reloaded. Same mechanism and same reason as the services
 * page's `?focus=`, including the Suspense boundary: `useSearchParams` opts the
 * route out of static rendering at build time without one.
 *
 * An unknown or absent `topic` shows everything. A filter is a narrowing, and a
 * narrowing that fails should hand back the whole list rather than an error.
 */

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import PostCard from "@/components/features/blog/PostCard";
import SignupForm from "@/components/features/blog/SignupForm";
import {
  BLOG_ALL,
  BLOG_CLOSE,
  BLOG_EMPTY,
  BLOG_HEADING,
  BLOG_INTRO,
  BLOG_NONE_YET,
  BLOG_TOPICS_LABEL,
  PLAYBOOKS_HEADING,
  PLAYBOOKS_INTRO,
  POSTS,
  playbooks,
  usedTopics,
} from "@/lib/content/blog";
import type { TopicId } from "@/lib/content/blog";

const CHIP =
  "inline-flex items-center rounded-full px-4 py-2 text-label-large transition-colors";

function Chip({
  href,
  label,
  on,
}: {
  href: string;
  label: string;
  on: boolean;
}) {
  return (
    <Link
      href={href}
      // `chip-filter-selected` from `design.md`: `secondary-container`, which is
      // what M3 uses for a selected state everywhere. Not the `action` colour,
      // which is reserved for the single primary action on a view and on this
      // page is the button at the bottom. It was a solid `primary` fill until
      // 16/08/2026, which broke the rule against `primary` as a filled control.
      //
      // The unselected border is `outline`, not `outline-variant`. At 1.61 the
      // chip had no perceivable edge, so an unselected filter row read as loose
      // words rather than as controls.
      className={`${CHIP} ${
        on
          ? "bg-secondary-container text-on-secondary-container"
          : "border border-outline text-on-surface hover:border-secondary"
      }`}
      aria-current={on ? "true" : undefined}
    >
      {label}
    </Link>
  );
}

function BlogBody() {
  const { pick, path } = useCopy();
  const params = useSearchParams();
  const topics = usedTopics();
  const raw = params.get("topic");
  const active = topics.some((t) => t.id === raw) ? (raw as TopicId) : null;
  const posts = active ? POSTS.filter((p) => p.topic === active) : POSTS;

  return (
    <>
      {/* Brand lime, the one unmissable ground on this page. It is allowed here
          because the blog index carries no brand orange; `design.md` permits one
          fixed high-energy ground per page and no more. Ink text, never white. */}
      <section className="ground-fixed bg-brand-lime">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 medium:py-20">
          <h1 className="max-w-3xl text-display-small">{pick(BLOG_HEADING)}</h1>
          <p className="mt-5 max-w-2xl text-body-large text-on-surface-variant">{pick(BLOG_INTRO)}</p>
          {/* Renders nothing until Paul has read the Thai. `SignupForm` owns
              that gate and says why. */}
          <SignupForm />
        </div>
      </section>

      {/* Start here. Hidden below two, because pointing at one article out of
          one is the list again with a heading on top, which is the same
          judgement the empty blog makes about its own menu entry.

          On white, so the wash rotation reads hero -> white -> white rather
          than three colours down the page. `design.md` asks for one wash per
          section and lets spacing do the sub-grouping. */}
      {playbooks().length > 1 && (
        <section className="mx-auto w-full max-w-5xl px-6 pt-16">
          <h2 className="max-w-2xl text-headline-large">{pick(PLAYBOOKS_HEADING)}</h2>
          <p className="mt-4 max-w-2xl text-body-large text-on-surface-variant">
            {pick(PLAYBOOKS_INTRO)}
          </p>
          {/*
            **Feed**, one of M3's three canonical layouts: a collection of
            browsable cards. The spec's progression is 1 / 2 / 3 / 4 across
            compact, medium, expanded and large, and this runs 1 / 2 / 3 for two
            reasons that are both in `design.md`.

            The third column arrives at `large` rather than `expanded`, because
            the standard drawer takes 280px from `expanded` up and three columns
            in the 560 that leaves would be 170px each. And there is no fourth,
            because the reading measure caps this container at 1024 and four
            columns inside that is a card too narrow to carry a Thai headline.
          */}
          <div className="mt-10 grid items-start gap-6 medium:grid-cols-2 large:grid-cols-3">
            {playbooks().map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        {/* No topic row when there is nothing to filter. A row of one chip
            reading "All" is a control that cannot do anything, and it makes an
            empty page look broken rather than new. */}
        {topics.length > 0 && (
          <>
            <p className="text-body-medium font-semibold text-on-surface-variant">
              {pick(BLOG_TOPICS_LABEL)}
            </p>
            <nav className="mt-4 flex flex-wrap gap-3">
              <Chip href={path("/blog")} label={pick(BLOG_ALL)} on={active === null} />
              {topics.map((t) => (
                <Chip
                  key={t.id}
                  href={path(`/blog?topic=${t.id}`)}
                  label={pick(t.label)}
                  on={active === t.id}
                />
              ))}
            </nav>
          </>
        )}

        {posts.length === 0 ? (
          <p className={`text-body-large text-on-surface-variant ${topics.length > 0 ? "mt-12" : ""}`}>
            {pick(POSTS.length === 0 ? BLOG_NONE_YET : BLOG_EMPTY)}
          </p>
        ) : (
          // `items-start` so a short card keeps its own height rather than
          // stretching to the tallest in its row, the same call the services
          // grid makes and for the same reason.
          <div className="mt-10 grid items-start gap-6 medium:grid-cols-2 large:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.slug} post={p} size={i === 0 ? "lead" : "normal"} />
            ))}
          </div>
        )}

        {/* The action stays even with nothing to read, so an empty page is not a
            dead end. The line above it does not: it says "read this far", which
            is untrue of a page with nothing on it, and a closing line that
            contradicts the page it closes is worse than no line. */}
        <div className="card-tonal mt-16 rounded-large px-6 py-7">
          {POSTS.length > 0 && <p className="text-body-large text-on-surface">{pick(BLOG_CLOSE)}</p>}
          <CallToAction page="/blog" className={POSTS.length > 0 ? "mt-5" : ""} />
        </div>
      </section>
    </>
  );
}

export default function BlogIndex() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-5xl px-6 py-16" />}>
      <BlogBody />
    </Suspense>
  );
}
