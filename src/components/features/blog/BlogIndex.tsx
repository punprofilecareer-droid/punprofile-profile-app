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
  "inline-flex items-center rounded-full px-4 py-2 text-label transition-colors";

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
      // Teal and not Terracotta. A filter is emphasis, not the action, and
      // `design.md` reserves Terracotta for the single primary action on a view,
      // which on this page is the button at the bottom.
      className={`${CHIP} ${
        on
          ? "bg-primary text-on-primary"
          : "border border-neutral-300 text-ink hover:border-primary"
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
      <section className="bg-mint-wash">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <h1 className="max-w-3xl text-h1">{pick(BLOG_HEADING)}</h1>
          <p className="mt-5 max-w-2xl text-body-lg text-slate">{pick(BLOG_INTRO)}</p>
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
        <section className="mx-auto w-full max-w-6xl px-6 pt-16">
          <h2 className="max-w-2xl text-h2">{pick(PLAYBOOKS_HEADING)}</h2>
          <p className="mt-4 max-w-2xl text-body-lg text-slate">
            {pick(PLAYBOOKS_INTRO)}
          </p>
          <div className="mt-10 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks().map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {/* No topic row when there is nothing to filter. A row of one chip
            reading "All" is a control that cannot do anything, and it makes an
            empty page look broken rather than new. */}
        {topics.length > 0 && (
          <>
            <p className="text-caption font-semibold text-slate">
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
          <p className={`text-body-lg text-slate ${topics.length > 0 ? "mt-12" : ""}`}>
            {pick(POSTS.length === 0 ? BLOG_NONE_YET : BLOG_EMPTY)}
          </p>
        ) : (
          // `items-start` so a short card keeps its own height rather than
          // stretching to the tallest in its row, the same call the services
          // grid makes and for the same reason.
          <div className="mt-10 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.slug} post={p} size={i === 0 ? "lead" : "normal"} />
            ))}
          </div>
        )}

        {/* The action stays even with nothing to read, so an empty page is not a
            dead end. The line above it does not: it says "read this far", which
            is untrue of a page with nothing on it, and a closing line that
            contradicts the page it closes is worse than no line. */}
        <div className="material-mint mt-16 rounded-lg px-6 py-7">
          {POSTS.length > 0 && <p className="text-body text-ink">{pick(BLOG_CLOSE)}</p>}
          <CallToAction page="/blog" className={POSTS.length > 0 ? "mt-5" : ""} />
        </div>
      </section>
    </>
  );
}

export default function BlogIndex() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-6xl px-6 py-16" />}>
      <BlogBody />
    </Suspense>
  );
}
