"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

/**
 * TASK-003/004: the Convex client, created once per browser session, wrapped
 * with auth so the admin session flows into every query. For candidates this
 * behaves exactly like the plain provider; they never sign in.
 *
 * The URL is public by design. Failing loudly on a missing env var beats the
 * silent alternative, a page that renders but never subscribes.
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
  return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>;
}
