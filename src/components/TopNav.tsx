"use client";

/**
 * The horizontal top navigation, from `expanded` (840px) up. Added 23/08/2026,
 * rebuilt 25/08/2026 on the `wise-1` navigation spec in `design.md`.
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
 * **This component renders NOTHING below 840px**, which is the trap this file
 * has to state out loud. It is `hidden ... expanded:flex`, so on a phone the
 * drawer is the only navigation there is. When `PRODUCTS` was split out of `NAV`
 * for the dropdown here, the drawer kept mapping `NAV` alone and six
 * destinations vanished on mobile with every check green. `verify-pages.ts` now
 * fails when either component forgets either array.
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
 *
 * ---------------------------------------------------------------------------
 * HOW IT OPENS, AND WHY IT IS A HEIGHT
 * ---------------------------------------------------------------------------
 *
 * The panel does not drop, slide or scale. It sits in a full-width white
 * viewport pinned under the bar with `overflow: hidden`, and the VIEWPORT
 * animates its height from nothing to the panel's own measured height. The
 * panel fades in inside it. `design.md`'s navigation section is where that
 * comes from and it was measured off the reference rather than guessed: 350ms
 * on `--ease-nav`, and nothing in this header uses a different curve.
 *
 * The height has to be measured rather than declared, because the panel's
 * content is copy in two languages and Thai is not the same height as English.
 * `panel.current.scrollHeight` is read on open, which is one layout read at the
 * moment the pointer arrives and not on every frame.
 *
 * The page behind dims and blurs while it is open. That is not decoration: a
 * full-width panel over a white page has no edge of its own, and the dimmer is
 * what gives it one.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";
import { ACTION, NAV, PRICING, PRODUCTS } from "@/lib/content/nav";
import { productBySlug } from "@/lib/content/products";
import { DESTINATIONS } from "@/lib/content/cta";

export default function TopNav({ slot = "primary" }: { slot?: "primary" | "secondary" }) {
  const { t, path, pick } = useCopy();

  /** The one product the menu argues for. Absent slug means no card, not a crash. */
  const efc = productBySlug("eu-fit-check");
  const pathname = usePathname() ?? "";
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;
  const group = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const close = useCallback(() => setOpenedAt(null), []);

  // One layout read, at the moment the panel is asked for.
  useEffect(() => {
    if (open && panel.current) setHeight(panel.current.scrollHeight);
  }, [open, pathname]);

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

  /*
   * 14px at 600, `ink-deep`, in a pill that is invisible until it is hovered or
   * open. `primary-pale` fills it then; the lime is the page's action colour and
   * a navigation link is not an action.
   */
  const itemClass = (active: boolean) =>
    `flex h-9 items-center rounded-full px-3 text-body-sm-strong duration-[350ms] ease-nav transition-colors ${
      active ? "bg-primary-pale text-on-primary-pale" : "text-ink-deep hover:bg-primary-pale"
    }`;

  /*
   * The dimmer goes into `document.body`, and that is not a detail.
   *
   * The header is `sticky`, which makes it a stacking context, so a dimmer
   * rendered inside it cannot paint BEHIND the bar however its z-index is set:
   * it would grey out the logo and the links along with the page. The reference
   * keeps its bar crisp above the dim, which is the whole point of dimming.
   * A portal puts the dimmer beside the header in the tree, where the header's
   * own z-40 wins.
   *
   * Mounted only after hydration, because `document` does not exist on the
   * server. Kept mounted and toggled by opacity after that: mounting it on open
   * would have it appear at full strength on the first frame instead of fading.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // On the next frame rather than synchronously, which is what the lint rule
    // about cascading renders is asking for and costs nothing here: the dimmer
    // is transparent until a menu opens, so a frame without it is a frame that
    // looks identical.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /*
   * The bar is two groups and this component renders one of them, chosen by
   * `slot`. 25/08/2026.
   *
   * `primary` is the offer, pinned to the logo on the left, and it owns the
   * menu, the viewport and the dimmer. `secondary` is the support pages and the
   * one action, on the right. They are two instances rather than one component
   * spanning the bar, because `justify-between` is what holds the two ends
   * apart and a single node cannot be at both ends of it.
   */
  if (slot === "secondary") {
    return (
      <nav aria-label={t("nav.menu")} className="hidden items-center gap-1 expanded:flex">
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

        {/* The one filled control in the bar. Lime with `on-primary` ink, the
            same pill as every other primary button in the system, because a
            reader who has decided to write to us should find the same shape
            here that they found at the bottom of the page they decided on. */}
        <Link
          href={path(ACTION.href)}
          aria-current={isHere(ACTION.href) ? "page" : undefined}
          className="ml-2 flex h-9 items-center rounded-full bg-primary px-4 text-body-sm-strong text-on-primary duration-[350ms] ease-nav transition-colors hover:bg-primary-active"
        >
          {t(ACTION.label)}
        </Link>
      </nav>
    );
  }

  return (
    <>
      {mounted &&
        createPortal(
          <div
            aria-hidden
            onMouseEnter={close}
            className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-[8px] duration-[350ms] ease-nav transition-opacity ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />,
          document.body,
        )}

      <nav aria-label={t("nav.products")} className="hidden items-center gap-1 expanded:flex">
        <div
          ref={group}
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
            className={itemClass(inProducts || open)}
          >
            {t("nav.products")}
            <span
              aria-hidden
              className={`ml-1.5 text-caption duration-[350ms] ease-nav transition-transform ${
                open ? "rotate-180" : ""
              }`}
            >
              &#9662;
            </span>
          </button>
        </div>
      </nav>

      {/* The viewport. Full width, under the bar, clipping a panel that is
          always laid out at its natural height. `height` is the only thing that
          animates; the panel fades so the text does not appear to stretch. */}
      <div
        className="absolute left-0 top-full hidden w-full overflow-hidden bg-canvas duration-[350ms] ease-nav transition-[height] expanded:block"
        style={{ height: open ? height : 0 }}
        onMouseEnter={() => setOpenedAt(pathname)}
        onMouseLeave={close}
      >
        <div
          ref={panel}
          role="menu"
          aria-hidden={!open}
          className={`mx-auto grid w-full max-w-5xl gap-10 px-6 py-10 duration-[350ms] ease-nav transition-opacity large:grid-cols-[minmax(0,320px)_1fr] ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {/*
           * The offer card. One per menu, on the left, and it is the reason the
           * panel is a panel rather than a list: a menu that only lists
           * destinations spends the most valuable space on the page saying
           * nothing. EU Fit Check is what this group is for, so it is the one
           * that gets a picture.
           *
           * Copy is `products.ts`'s own name and lede and the action is
           * `DESTINATIONS.assess`, so the card cannot drift from the product
           * page or promise something the button does not deliver.
           */}
          {efc && (
            <Link
              href={path(DESTINATIONS.assess.href)}
              onClick={close}
              tabIndex={open ? undefined : -1}
              className="group hidden overflow-hidden rounded-2xl border border-line bg-canvas duration-[350ms] ease-nav transition-colors hover:border-line-strong large:block"
            >
              <Image
                src="/assess/mascot/welcome.jpg"
                alt=""
                width={1000}
                height={750}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="px-6 py-6">
                <p className="text-display-md uppercase">{pick(efc.name)}</p>
                <p className="mt-3 text-body-sm text-body">{pick(efc.lede)}</p>
                <p className="mt-5 flex items-center gap-2 text-body-sm-strong underline underline-offset-4">
                  {pick(DESTINATIONS.assess.label)}
                  <span
                    aria-hidden
                    className="duration-[350ms] ease-nav transition-transform group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </p>
              </div>
            </Link>
          )}

          {/* Two groups, the products and what they cost, which is the pair of
              questions this menu exists to answer. */}
          <div className="grid gap-8 medium:grid-cols-[2fr_1fr]">
            <div>
              <p className="border-b border-line pb-3 text-body-md text-mute-strong">
                {t("nav.products")}
              </p>
              <div className="mt-4 grid gap-1 medium:grid-cols-2">
                {PRODUCTS.map((item) => (
                  <Link
                    key={item.href}
                    role="menuitem"
                    href={path(item.href)}
                    onClick={close}
                    tabIndex={open ? undefined : -1}
                    aria-current={isHere(item.href) ? "page" : undefined}
                    className={`group flex min-h-12 items-center gap-3 rounded-md px-3 text-body-md-strong duration-[350ms] ease-nav transition-colors ${
                      isHere(item.href)
                        ? "bg-primary-pale text-on-primary-pale"
                        : "text-ink-deep hover:bg-canvas-soft"
                    }`}
                  >
                    {/* Decoration, and named as such: the reference gives every
                        row a glyph and we do not have an icon per product, so
                        the chip carries the shape without claiming a meaning. */}
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-pale text-caption"
                    >
                      &rarr;
                    </span>
                    {t(item.label)}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="border-b border-line pb-3 text-body-md text-mute-strong">
                {t("nav.pricing")}
              </p>
              <div className="mt-4 grid gap-1">
                {PRICING.map((item) => (
                  <Link
                    key={item.href}
                    role="menuitem"
                    href={path(item.href)}
                    onClick={close}
                    tabIndex={open ? undefined : -1}
                    aria-current={isHere(item.href) ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-md px-3 text-body-md-strong duration-[350ms] ease-nav transition-colors ${
                      isHere(item.href)
                        ? "bg-primary-pale text-on-primary-pale"
                        : "text-ink-deep hover:bg-canvas-soft"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-pale text-caption"
                    >
                      &rarr;
                    </span>
                    {t(item.label)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
