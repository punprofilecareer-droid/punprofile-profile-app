"use client";

/**
 * The burger menu. TASK-085, 14/08/2026.
 *
 * Upper left, with the wordmark centred beside it. The wordmark stays inert:
 * it sits above a running assessment, and now that navigation has its own
 * control there is no reason to make the logo a second one.
 *
 * **It hides while an assessment is in progress**, which is the point of
 * `navLock`. Not disabled and not confirming: absent. A disabled control still
 * says "there is a way out of here" to someone halfway through ten questions,
 * and a confirmation dialog is a screen nobody reads that exists only to undo
 * a tap they should not have been offered. See `src/lib/navLock.ts`.
 *
 * The panel is Liquid Glass, which is the third and last surface in the app
 * that qualifies under the rule in `design.md`: the functional layer above
 * content, never the content layer itself. It shares that budget with the
 * header bar it drops out of and the assessment's bottom action bar, and those
 * two are never on screen at the same time as this one.
 *
 * ---------------------------------------------------------------------------
 * WHY THE PANEL IS PORTALLED
 * ---------------------------------------------------------------------------
 *
 * Because the header it lives in has `backdrop-filter`, and an element with a
 * `backdrop-filter` other than `none` becomes the containing block for every
 * `position: fixed` descendant. Same rule as `transform` and `filter`, and it
 * is the reason a fixed overlay nested inside the app bar silently stops being
 * fixed to the viewport.
 *
 * The symptom is not a missing background, which is what it looks like. The
 * panel was painting its background correctly, into a box 72px tall, because
 * `inset-y-0` was resolving against the HEADER rather than the screen. The
 * links overflowed that box and landed on the page with nothing behind them,
 * and the `fixed inset-0` scrim was clipped to the same 72px, so the page
 * behind never dimmed either. Three separate-looking bugs, one cause.
 *
 * `LocaleToggle`'s dropdown is unaffected and looks right, which is what made
 * this confusing: its menu is `absolute`, and absolute positioning wants a
 * positioned ancestor anyway, so the containing-block change costs it nothing.
 *
 * A portal to `document.body` puts the overlay outside every such ancestor,
 * which is the fix rather than a workaround: a modal layer belongs at the top
 * of the document, not nested inside a bar that happens to contain its button.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopy } from "@/components/LocaleProvider";
import { NAV } from "@/lib/content/nav";
import { DESTINATIONS } from "@/lib/content/cta";

/** The card advertises the assessment, so it takes the assessment's own label. */
const ASSESS = DESTINATIONS.assess;
import { getNavLocked, getNavLockedServer, subscribeNavLock } from "@/lib/navLock";

/** A store that never emits. Module scope so the reference is stable. */
const NEVER_CHANGES = () => () => {};

export default function SiteMenu() {
  const { t, path, pick } = useCopy();
  const pathname = usePathname();

  /**
   * Open state is stored as the route it was opened on, not as a boolean.
   *
   * Which makes "close on navigate" a derivation rather than an effect: the
   * panel is open exactly while the route it was opened on is still the route
   * you are on. An effect watching `pathname` to call `setOpen(false)` renders
   * the open panel on the new page first and closes it a frame later, and it
   * misses the case where a visitor taps the entry for the page they are
   * already on, which navigates nowhere and so fires no effect.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;

  /**
   * The exit animation needs the panel to still be mounted while it plays, so
   * closing is two steps: mark it closing, let the animation run, then unmount.
   *
   * The timeout lives in the close handler rather than in an effect watching a
   * flag, which keeps it out of the render cycle entirely: an event handler is
   * exactly where a "do this, then that" belongs, and there is no state
   * synchronisation for a stale closure to get wrong.
   */
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const locked = useSyncExternalStore(subscribeNavLock, getNavLocked, getNavLockedServer);

  // `document` does not exist during the server render, and a portal cannot be
  // created before hydration. The button renders either way; only the overlay
  // waits, and it cannot be open before a click in any case.
  //
  // `useSyncExternalStore` rather than a `setMounted(true)` effect: it reads
  // false on the server and true on the client with no state write at all, so
  // it costs no extra render and does not trip the cascading-render rule. The
  // store never changes, hence the no-op subscribe.
  const mounted = useSyncExternalStore(NEVER_CHANGES, () => true, () => false);

  const EXIT_MS = 200;
  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setOpenedAt(null);
      setClosing(false);
    }, EXIT_MS);
  }, []);

  // Nothing closes the panel when the lock comes on, because nothing needs to.
  // The lock is only ever set by the assessment mounting, which means the route
  // changed to /assess, which the effect above already closed on. An extra
  // effect syncing `open` to `locked` would be a cascading render buying a case
  // that cannot happen.

  useEffect(() => {
    if (!open) return;


    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        // Focus goes back to the control that opened the panel rather than to
        // the top of the document, or a keyboard user lands nowhere.
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    // The page behind must not scroll under an open panel. Restoring the
    // previous values rather than clearing them means this composes with
    // anything else that locks scrolling instead of fighting it.
    const previous = document.body.style.overflow;
    const previousPad = document.body.style.paddingRight;

    /**
     * Fallback for the scrollbar shift, behind `scrollbar-gutter: stable` in
     * `globals.css`, for browsers that do not support it (Safari before 18.2).
     *
     * **Probe the body's own box, not `clientWidth`.** Two wrong versions
     * preceded this one and both padded when they should not have, so the page
     * slid left by half a scrollbar instead of right by half a scrollbar.
     *
     * The second version measured `documentElement.clientWidth` on either side
     * of the lock, which looks like exactly the right thing and is not:
     * `clientWidth` on the root reports the VIEWPORT, and the viewport does
     * widen by the scrollbar when it disappears. The layout does not, because
     * `scrollbar-gutter` is still holding that space. So the probe reported a
     * 15px gap that no element had actually gained, and the padding for it was
     * pure error.
     *
     * `document.body.getBoundingClientRect().width` is a layout measurement, so
     * it answers the question actually being asked: did anything get wider.
     * With the gutter working it is zero and nothing is padded; without it
     * (Safari before 18.2) it is the scrollbar width and the padding restores
     * the original content box. The forced reflow between the two reads costs
     * one layout, once, on opening a menu.
     */
    const widthBefore = document.body.getBoundingClientRect().width;
    document.body.style.overflow = "hidden";
    const gap = document.body.getBoundingClientRect().width - widthBefore;
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    // Focus into the panel so the next Tab is inside it, not back in the page.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      document.body.style.paddingRight = previousPad;
    };
  }, [open, close]);

  // Locked renders nothing at all, not even the button, so the header's centre
  // column keeps the wordmark centred by the grid rather than by the presence
  // of a control on the left.
  if (locked) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          // Cancels an exit still in flight. Without this, reopening during the
          // 200ms close would be undone by the timeout that is already queued.
          setClosing(false);
          setOpenedAt(pathname);
        }}
        aria-label={t("nav.menu")}
        aria-expanded={open}
        aria-controls="site-menu"
        className="-ml-2 flex size-12 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-tertiary-container"
      >
        {/* Three rules, drawn rather than typed: the glyph characters that look
            like a burger render at different weights across Thai and Latin
            font stacks, and this header carries both. */}
        <span aria-hidden className="flex w-5 flex-col gap-1">
          <span className="h-0.5 w-full rounded-full bg-current" />
          <span className="h-0.5 w-full rounded-full bg-current" />
          <span className="h-0.5 w-full rounded-full bg-current" />
        </span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <>
            {/* Not `aria-hidden` alone: it is the tap target that closes the
                panel, which is the gesture most people reach for first. */}
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("nav.menuClose")}
              onClick={close}
              className={`fixed inset-0 z-40 cursor-default bg-on-surface/20 ${
                closing ? "menu-scrim-out" : "menu-scrim-in"
              }`}
            />
            {/* One tier above the language menu, because a drawer covers more.
                Level 3, which the skill maps to `surface-container-high`; the
                tone is what carries the elevation and the shadow only earns its
                place because the drawer floats over the page. Only the right corners are
                rounded, because the left edge is against the screen and a
                rounded corner there would float the panel off an edge it is
                supposed to be attached to. */}
            <div
              id="site-menu"
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.menu")}
              className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,80vw)] flex-col overflow-hidden rounded-r-large bg-surface-container-high px-5 pt-5 shadow-level-3 outline-none ${
                closing ? "menu-panel-out" : "menu-panel-in"
              }`}
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                onClick={close}
                aria-label={t("nav.menuClose")}
                className="-ml-1 mb-5 flex size-12 items-center justify-center self-start rounded-full text-on-surface transition-colors hover:bg-black/5"
              >
                <span aria-hidden className="text-title-large leading-none">
                  &times;
                </span>
              </button>

              {/* Plain text, no chips. Reworked 16/08/2026 from a reference
                  the founder supplied: the old list put every item in a 12px
                  box and filled the current one, which made a six-item menu
                  read as six buttons. A drawer is a list of destinations, and
                  the thing it should be is quiet and easy to scan.

                  `headline-small` and a 28px gap rather than `body-large` and
                  4px. The generosity is the design; a cramped list is what
                  chips were compensating for.

                  The current page is marked by weight and colour rather than by
                  a filled background, which is the same information without a
                  second shape competing with the card below. `aria-current`
                  carries it for a screen reader either way. */}
              <nav className="flex flex-col gap-7">
                {NAV.map((item) => {
                  // `path()` first, then compare. `pathname` is the real URL, so
                  // on the English tree it is `/en/faq` and the table's `/faq`
                  // would never match, leaving the menu with nothing marked as
                  // the current page.
                  const href = path(item.href);
                  const here = pathname === href;
                  return (
                    <Link
                      key={item.href}
                      href={href}
                      aria-current={here ? "page" : undefined}
                      className={`text-headline-small transition-colors hover:text-primary ${
                        here ? "font-semibold text-primary" : "text-on-surface"
                      }`}
                    >
                      {t(item.label)}
                    </Link>
                  );
                })}
              </nav>

              {/* The card at the foot of the drawer, from the same reference.
                  `mt-auto` so it sits against the bottom however short the list
                  is.

                  `tertiary-container`, not brand lime. The reference's ground is
                  a loud yellow and lime is the equivalent here, but this card
                  advertises EU Fit Check, and EU Fit Check's identity colour is
                  the blue family. A lime card would say PunProfile in a place
                  that is trying to say EU Fit Check. Ink on it holds 13.26.

                  The headline is the only new string; the action reuses the
                  assessment's own label from `cta.ts`, so the menu and every
                  other surface cannot drift into two wordings of one button. */}
              <Link
                href={path(ASSESS.href)}
                className="group mt-auto flex flex-col gap-6 rounded-extra-large bg-tertiary-container p-6 transition-colors hover:bg-tertiary-fixed-dim"
              >
                <span className="text-headline-medium font-bold text-balance text-on-tertiary-container">
                  {t("menu.promo")}
                </span>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-body-large font-semibold text-on-tertiary-container">
                    {pick(ASSESS.label)}
                  </span>
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tertiary text-on-tertiary transition-transform group-hover:translate-x-0.5"
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
