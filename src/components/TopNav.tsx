"use client";

/**
 * The horizontal top navigation, from `expanded` (840px) up. Added 23/08/2026.
 *
 * **It replaces `SideNav`, and that is a deliberate departure from an audit.**
 * `SideNav.tsx` was added on 16/08/2026 after an M3 compliance pass whose
 * decision tree picks a navigation component by destination count: at six flat
 * destinations, a modal drawer on compact and a standard drawer from 840px up.
 * That answered the question as it stood.
 *
 * The question changed. The site now has a catalogue with a group inside it, and
 * a standard drawer is a list of peers with nowhere to put a submenu without
 * turning the whole left column into an accordion. A top bar with one dropdown
 * is the shape that fits, and it is the shape the reference product uses.
 *
 * **Compact keeps the modal drawer**, because six destinations plus a group do
 * not fit across 360px and hover does not exist on touch. `SiteMenu` still owns
 * that case, now from the upper RIGHT on Paul's call of 23/08/2026: easier to
 * reach with a thumb.
 *
 * ---------------------------------------------------------------------------
 * THE DROPDOWN, AND WHY IT IS NOT HOVER-ONLY
 * ---------------------------------------------------------------------------
 *
 * It opens on hover AND on click, and closes on Escape, on blur out of the
 * group, and on navigation. Hover alone would be unreachable by keyboard and by
 * anyone on a touch screen wide enough to get this bar, which a tablet in
 * landscape is.
 *
 * Open state is stored as the route it was opened on rather than as a boolean,
 * the same trick `SiteMenu` uses: "close on navigate" becomes a derivation
 * instead of an effect, and it also covers the case of tapping the entry for the
 * page you are already on, which navigates nowhere and so fires no effect.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";
import { NAV, PRODUCTS } from "@/lib/content/nav";

export default function TopNav() {
  const { t, path } = useCopy();
  const pathname = usePathname() ?? "";
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;
  const group = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpenedAt(null), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  /** True while the route is this entry's own, or inside its group. */
  const isHere = (href: string) => pathname === path(href);
  const inProducts = PRODUCTS.some((p) => isHere(p.href));

  const itemClass = (active: boolean) =>
    `flex h-10 items-center rounded-full px-4 text-title-medium transition-colors ${
      active
        ? "bg-secondary-container text-on-secondary-container"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`;

  return (
    <nav aria-label={t("nav.menu")} className="hidden items-center gap-1 expanded:flex">
      {/* ------------------------------------------------------- Products */}
      <div
        ref={group}
        className="relative"
        onMouseEnter={() => setOpenedAt(pathname)}
        onMouseLeave={close}
        onBlur={(e) => {
          // Only when focus has left the group entirely, or tabbing from the
          // trigger into the first menu item would close the menu underneath.
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
        }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpenedAt(open ? null : pathname)}
          className={itemClass(inProducts)}
        >
          {t("nav.products")}
          <span
            aria-hidden
            className={`ml-1.5 text-body-medium transition-transform ${open ? "rotate-180" : ""}`}
          >
            &#9662;
          </span>
        </button>

        {open && (
          <div
            role="menu"
            /* `top-full` with no gap: a dropdown separated from its trigger by
               dead space closes as the pointer crosses it. */
            className="absolute left-0 top-full z-50 min-w-[260px] rounded-large border border-outline-variant bg-surface p-2 shadow-lg"
          >
            {PRODUCTS.map((item) => (
              <Link
                key={item.href}
                role="menuitem"
                href={path(item.href)}
                onClick={close}
                aria-current={isHere(item.href) ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-medium px-4 text-body-large transition-colors ${
                  isHere(item.href)
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- flat entries */}
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={path(item.href)}
          aria-current={isHere(item.href) ? "page" : undefined}
          className={itemClass(isHere(item.href))}
        >
          {t(item.label)}
        </Link>
      ))}
    </nav>
  );
}
