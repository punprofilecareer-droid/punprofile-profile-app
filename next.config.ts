import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

// TASK-007. Source-map upload only runs when SENTRY_AUTH_TOKEN is present
// (a build-time secret, per README); without it the build stays green and
// stack traces are simply unminified later.
export default withSentryConfig(nextConfig, {
  org: "punprofile",
  project: "javascript-nextjs",
  silent: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
