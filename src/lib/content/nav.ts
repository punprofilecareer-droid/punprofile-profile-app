import type { AnyCopyKey } from "@/lib/locale";
import { POSTS } from "./blog";

/**
 * The site menu, in order. TASK-085, 14/08/2026.
 *
 * One list, read by the menu and by the route sweep in
 * `scripts/verify-content.ts`, so a link that points at a route nobody built
 * fails a check rather than a visitor's tap.
 *
 * `/admin` and `/login` are absent and must stay absent. They are protected by
 * `requireAdmin` in Convex and by the middleware, so listing them would not be
 * a security hole, but a menu is an invitation and there is nothing behind
 * those two for anyone reading this menu.
 *
 * Order is the funnel, not the sitemap: the check first because it is the
 * thing to do, then what we do, then the coaching pitch, then the two support
 * pages, then privacy last where a footer link would sit.
 *
 * There is no About entry. It was replaced by /coaching on 14/08/2026: the
 * founder section belongs at the END of a page that has already made its case,
 * not on a page of its own that asks a stranger to care first.
 *
 * Five entries, trimmed on Paul's read the same day. Two came out:
 *
 * - **Home.** The landing page is a pitch for the EU Fit Check with a button to
 *   it, and that button's destination is the first entry in this menu. Listing
 *   both meant offering the advert and the thing it advertises as if they were
 *   different destinations. `/` still exists and is still where a Facebook link
 *   lands; it is just not somewhere anyone needs to be sent back to.
 * - **Privacy.** It is in the footer of every page, which is where people look
 *   for it, and the contact step carries its own link inside the consent copy,
 *   which is the screen that actually collects anything. One link in the chrome
 *   is enough.
 *
 * A menu is a claim about what matters. Seven entries said everything mattered
 * equally, which is the same as saying nothing does.
 *
 * **Six from the moment the blog has an article**, and the same test was applied
 * to it rather than waived. It earns the slot because it is the only ungated
 * thing on the site: every other entry is either the check, a pitch, or support
 * for one of those, so a reader who is not ready to be asked for anything
 * currently has nowhere to go. It sits after the coaching pitch and before the
 * support pages because that is where reading-instead-of-acting belongs in this
 * order, and because `nurture-flow.md` scopes the blog as a surface for search
 * and shared links rather than as a step in the funnel.
 *
 * **Five until then.** The blog shipped empty on 16/08/2026 and the entry is
 * gated on `POSTS.length` rather than hard-coded in and commented out. A menu is
 * an invitation, which is the reason `/admin` and `/login` are absent above, and
 * an invitation to an empty page is the same mistake pointed at a different
 * kind of nothing. Gating rather than deleting means the first article publishes
 * the link with it, and nobody has to remember this file.
 */
export interface NavItem {
  href: string;
  label: AnyCopyKey;
  /** Sets it apart as the action rather than another destination. */
  primary?: boolean;
}

export const NAV: readonly NavItem[] = [
  { href: "/efc-assessment", label: "nav.assess", primary: true },
  { href: "/services", label: "nav.services" },
  { href: "/coaching", label: "nav.coaching" },
  ...(POSTS.length > 0
    ? [{ href: "/blog", label: "nav.blog" as AnyCopyKey }]
    : []),
  { href: "/faq", label: "nav.faq" },
  { href: "/contact", label: "nav.contact" },
];
