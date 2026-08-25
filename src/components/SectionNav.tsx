"use client";

/**
 * The section bar: a second row under the header carrying a section's own name
 * and its own links. 25/08/2026, B15 in the block library.
 *
 * **This is the answer to a question that was closed the wrong way.** EU Fit
 * Check used to be told apart by colour: a scoped blue applied on
 * `[data-brand="efc"]`, which the one-accent system removed on 25/08/2026 and
 * left the section with no identity at all. The reference separates a section
 * with STRUCTURE rather than with a second brand colour: `/currency-converter`
 * and `/blog` both carry a bar under the header with the section's name at the
 * left and the section's pages after it. That costs no accent and it survives
 * a rebrand.
 *
 * **It renders nothing outside the section**, and nothing during the check.
 * `NavLockGate` in `SiteShell` wraps it for the same reason it wraps the menu
 * and the footer: mid-assessment, every link out costs the candidate their
 * answers, and a bar full of destinations under a half-finished flow is the
 * trapdoor the menu already closes.
 *
 * The ground is `canvas-soft` rather than a second colour: one step off the
 * header, which is what the reference does with its own two greens. The
 * hairline underneath is what separates the pair from the page.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";
import { DESTINATIONS } from "@/lib/content/cta";
import { FAQ_HEADING } from "@/lib/content/faq";

/** The section's own root, and the page that explains what it is. */
const ROOT = "/products/eu-fit-check";

/**
 * The routes that ARE this section.
 *
 * The product page and the check itself. Deliberately not every page that
 * mentions EU Fit Check: a section is a place, and the pricing page and the FAQ
 * belong to the site rather than to this.
 */
const IN_SECTION = [ROOT, DESTINATIONS.assess.href];

export default function SectionNav() {
  const { t, pick, path } = useCopy();
  const pathname = usePathname() ?? "";

  const here = IN_SECTION.some((h) => pathname === path(h));
  if (!here) return null;

  /*
   * The links, and why the list is short.
   *
   * Three destinations, each with a label that already exists and is already
   * reviewed: the check, what it costs, and the questions. Inventing a fourth
   * would mean inventing Thai for it, and a section bar padded out with pages
   * that are not the section's is the same mistake as a menu that lists
   * everything.
   */
  const links = [
    { href: DESTINATIONS.assess.href, label: pick(DESTINATIONS.assess.label) },
    { href: DESTINATIONS.pricing.href, label: pick(DESTINATIONS.pricing.label) },
    { href: "/faq", label: pick(FAQ_HEADING) },
  ];

  return (
    <div className="sticky top-[76px] z-30 border-b border-line bg-canvas-soft">
      <div className="page-container flex h-14 items-center gap-6 overflow-x-auto">
        <Link
          href={path(ROOT)}
          aria-current={pathname === path(ROOT) ? "page" : undefined}
          className="shrink-0 text-heading-xs text-on-primary"
        >
          {t("nav.assess")}
        </Link>

        <nav aria-label={t("nav.assess")} className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={path(l.href)}
              aria-current={pathname === path(l.href) ? "page" : undefined}
              className={`flex h-9 shrink-0 items-center rounded-full px-3 text-body-sm-strong text-on-primary duration-[350ms] ease-nav transition-colors ${
                pathname === path(l.href) ? "bg-primary-pale" : "hover:bg-primary-pale"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
