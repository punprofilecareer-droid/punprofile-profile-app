import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  /**
   * The assessment moved from `/assess` to `/efc-assessment` on 16/08/2026, when
   * EU Fit Check was positioned as a sub-brand and the URL was made to say so.
   *
   * **These redirects are not optional and must not be removed.** Every daily
   * job post ever published to the Facebook group carries
   * `punprofile.vercel.app/assess?src=fb&job=<id>`, and the pinned post and the
   * LINE account carry `?src=pinned` and `?src=line`. Those links are in other
   * people's feeds and cannot be edited. `00_Quick_Facts.md` in the sibling repo
   * owns the current URL and has been updated; this is what keeps the old ones
   * working.
   *
   * Permanent, so search engines move their index rather than keeping two URLs
   * for one page. Query strings are preserved by Next automatically, which is
   * the whole point: the attribution parameters have to survive the hop or the
   * redirect silently destroys the channel data it was added to protect.
   */
  async redirects() {
    return [
      { source: "/assess", destination: "/efc-assessment", permanent: true },
      { source: "/en/assess", destination: "/en/efc-assessment", permanent: true },
      /**
       * `/services` folded into `/coaching` on 23/08/2026. Same rule as above and
       * the same reason: the route was in the sitemap from 16/08/2026 and in the
       * footer of every page, so the link exists in other people's hands.
       * `?focus=` is preserved by Next along with every other query string, which
       * is what keeps the result screen's link pointing at the right card.
       */
      { source: "/services", destination: "/coaching", permanent: true },
      { source: "/en/services", destination: "/en/coaching", permanent: true },
    ];
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
