import type { AnyCopyKey } from "@/lib/locale";
import { POSTS } from "./blog";

/**
 * The site menu, in order. TASK-085, 14/08/2026.
 *
 * One list, read by BOTH navigations and by the reach check in
 * `scripts/verify-pages.ts`, so a link that points at a route nobody built
 * fails a check rather than a visitor's tap.
 *
 * The claim here used to name `verify-content.ts` as doing that sweep. It never
 * did, and on 23/08/2026 that cost six destinations on mobile. The check is real
 * now and it lives in `verify-pages.ts`, which is in the pre-push list.
 *
 * **Anything added to either array below has to appear in `TopNav.tsx` AND in
 * `SiteMenu.tsx`.** They render at different widths and neither is a fallback
 * for the other.
 *
 * `/admin` and `/login` are absent and must stay absent. They are protected by
 * `requireAdmin` in Convex and by the middleware, so listing them would not be
 * a security hole, but a menu is an invitation and there is nothing behind
 * those two for anyone reading this menu.
 *
 * Order is the funnel, not the sitemap: what we do, then the coaching pitch,
 * then the two support pages.
 *
 * **EU Fit Check came out of this list on 17/08/2026, on Paul's call**, and it
 * was the first entry. The `primary` flag went with it, because it existed to
 * set that one entry apart and nothing read it.
 *
 * The reasoning it leaves behind is worth keeping straight. This file used to
 * say Home was dropped because "the landing page is a pitch for the EU Fit Check
 * with a button to it, and that button's destination is the first entry in this
 * menu". Both halves of that are now false: the landing page is not an EU Fit
 * Check pitch since the 17/08/2026 rebuild, and the check is not in the menu.
 *
 * What is left is a menu of places to read, and one action that lives where
 * actions live: `cta.ts` puts the check on the landing page, the FAQ, the blog
 * and the menu's own promo card, each time as a button rather than as a line in
 * a list. A destination list and an action are different things, and this file is
 * the list.
 *
 * There is no About entry. It was replaced by /coaching on 14/08/2026: the
 * founder section belongs at the END of a page that has already made its case,
 * not on a page of its own that asks a stranger to care first.
 *
 * Four entries. Three came out over two reads:
 *
 * - **Home**, 14/08/2026. `/` still exists and is still where a Facebook link
 *   lands; it is just not somewhere anyone needs to be sent back to.
 * - **EU Fit Check**, 17/08/2026. See above.
 * - **Privacy.** It is in the footer of every page, which is where people look
 *   for it, and the contact step carries its own link inside the consent copy,
 *   which is the screen that actually collects anything. One link in the chrome
 *   is enough.
 *
 * A menu is a claim about what matters. Seven entries said everything mattered
 * equally, which is the same as saying nothing does.
 *
 * **Five from the moment the blog has an article**, and the same test was applied
 * to it rather than waived. It earns the slot because it is the only ungated
 * thing on the site: every other entry is either the check, a pitch, or support
 * for one of those, so a reader who is not ready to be asked for anything
 * currently has nowhere to go. It sits after the coaching pitch and before the
 * support pages because that is where reading-instead-of-acting belongs in this
 * order, and because `nurture-flow.md` scopes the blog as a surface for search
 * and shared links rather than as a step in the funnel.
 *
 * **Four until then.** The blog shipped empty on 16/08/2026 and the entry is
 * gated on `POSTS.length` rather than hard-coded in and commented out. A menu is
 * an invitation, which is the reason `/admin` and `/login` are absent above, and
 * an invitation to an empty page is the same mistake pointed at a different
 * kind of nothing. Gating rather than deleting means the first article publishes
 * the link with it, and nobody has to remember this file.
 */
export interface NavItem {
  href: string;
  label: AnyCopyKey;
}

/**
 * The Products group, added 23/08/2026 with the top bar.
 *
 * **Only what exists gets an entry**, Paul's call: EU Fit Check and the coaching
 * pages are live, the Fit Report and Matched Jobs are not, and a menu is an
 * invitation, which is the same reason `/admin` and `/login` are absent below.
 * They join as they ship.
 *
 * `/services` was here for one day and left on 23/08/2026 when it folded into
 * `/coaching`, which is what that fold was always going to look like: an entry
 * leaves this array rather than leaving the top level.
 */
export const PRODUCTS: readonly NavItem[] = [
  { href: "/products/eu-fit-check", label: "nav.assess" },
  { href: "/products/cv-check", label: "nav.cvCheck" },
  { href: "/products/fit-report", label: "nav.fitReport" },
  { href: "/products/matched-jobs", label: "nav.matchedJobs" },
  { href: "/products/guided-job-hunt", label: "nav.guidedJobHunt" },
  { href: "/coaching", label: "nav.coaching" },
];

/**
 * The flat entries, which sit beside the Products group rather than inside it.
 *
 * `/services` and `/coaching` moved into `PRODUCTS` on 23/08/2026, so what is
 * left here is the group's peers: the price surface and the three support pages.
 */
export const NAV: readonly NavItem[] = [
  { href: "/pricing", label: "nav.pricing" },
  ...(POSTS.length > 0
    ? [{ href: "/blog", label: "nav.blog" as AnyCopyKey }]
    : []),
  { href: "/faq", label: "nav.faq" },
  { href: "/contact", label: "nav.contact" },
];
