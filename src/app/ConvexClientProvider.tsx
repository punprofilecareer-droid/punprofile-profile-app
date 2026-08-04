"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

/**
 * TASK-003: the Convex client, created once per browser session.
 *
 * The URL is public by design (it names the deployment; auth happens
 * per-function server-side). Failing loudly on a missing env var beats the
 * silent alternative, a page that renders but never subscribes, which on the
 * teaser chart would look exactly like a scoring bug.
 */
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is not set. Locally it comes from .env.local (written by `npx convex dev`); on Vercel it is a project environment variable.",
  );
}
const convex = new ConvexReactClient(url);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
