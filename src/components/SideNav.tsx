"use client";

/**
 * The standard navigation drawer, from `expanded` (840px) up.
 *
 * Added 16/08/2026 after an MD3 compliance audit. The skill's own decision tree
 * selects a navigation component by destination count before anything else:
 *
 *   6+ destinations
 *   ├── Compact   → Navigation Drawer (modal)
 *   ├── Medium    → Navigation Drawer (standard) or Rail + overflow
 *   └── Expanded+ → Navigation Drawer (standard)
 *
 * The site has six, so a rail is not what M3 specifies here; a standard drawer
 * is. The compact case was already right, `SiteMenu`'s modal drawer.
 *
 * **This is `standard`, not `modal`: it is part of the page, not on top of it.**
 * It does not trap focus, has no scrim and no close button, and content sits
 * beside it rather than under it. Those are the properties that distinguish the
 * two in M3, and getting them wrong produces a modal drawer that never closes.
 *
 * **Hidden while the assessment runs**, on the same signal and for the same
 * reason as the modal drawer and the footer: mid-check, every link out costs the
 * candidate their answers. `NavLockGate` wraps it.
 *
 * `medium` (600–839) deliberately keeps the modal drawer. M3 allows a standard
 * drawer there, but 360px of permanent navigation out of 600 is more than half
 * the width on a tablet in portrait, and this is largely a reading site.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";
import { NAV } from "@/lib/content/nav";
import { DESTINATIONS } from "@/lib/content/cta";

const ASSESS = DESTINATIONS.assess;

export default function SideNav() {
  const { t, path, pick } = useCopy();
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label={t("nav.menu")}
      /*
       * Sticky and viewport-tall. Without it the drawer is as tall as the page,
       * which on a long article puts the card at its foot thousands of pixels
       * below the fold and scrolls the destinations out of reach. A standard
       * drawer is persistent; a column that scrolls away is not one.
       */
      className="sticky top-0 hidden h-dvh w-[280px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-outline-variant bg-surface-container-low px-3 py-6 expanded:flex"
    >
      {NAV.map((item) => {
        const href = path(item.href);
        const here = pathname === href;
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={here ? "page" : undefined}
            /*
             * M3's navigation drawer item: 56dp tall, fully rounded, and the
             * active one takes `secondary-container`. That is the one place in
             * this app where M3's own selection colour is used rather than the
             * tertiary the assessment claims, because this is PunProfile
             * chrome rather than EU Fit Check's.
             */
            className={`flex min-h-14 items-center rounded-full px-6 text-title-medium transition-colors ${
              here
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {t(item.label)}
          </Link>
        );
      })}

      {/* The same card the modal drawer carries, so the two drawers offer the
          same thing rather than diverging into two navigation designs. */}
      <Link
        href={path(ASSESS.href)}
        className="group mt-auto flex flex-col gap-4 rounded-extra-large bg-tertiary-container p-5 transition-colors hover:bg-tertiary-fixed-dim"
      >
        <span className="text-title-large font-bold text-balance text-on-tertiary-container">
          {t("menu.promo")}
        </span>
        <span className="flex items-center justify-between gap-3">
          <span className="text-body-medium font-semibold text-on-tertiary-container">
            {pick(ASSESS.label)}
          </span>
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tertiary text-on-tertiary transition-transform group-hover:translate-x-0.5"
          >
            &rarr;
          </span>
        </span>
      </Link>
    </nav>
  );
}
