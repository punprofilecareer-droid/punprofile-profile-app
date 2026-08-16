"use client";

/**
 * The floating action bar. Added 14/08/2026 with the Liquid Glass pass.
 *
 * This is the surface that makes the material mean something here. Apple's
 * guidance is that Liquid Glass belongs to the functional layer that floats
 * above content, and until now this app had almost no such layer: a header, a
 * footer and inline buttons that scrolled away with everything else. A bar
 * pinned to the bottom of the viewport, with the questions passing underneath
 * it, is the canonical case the material was designed for.
 *
 * It also fixes something that predates glass. The Continue button sat below
 * the last option, so on a long question, target countries especially, the way
 * forward was off screen and the candidate had to scroll to find it. Pinned, it
 * is always the same distance from the thumb.
 *
 * `env(safe-area-inset-bottom)` rather than a fixed padding: on a phone with a
 * home indicator, a bar that ignores it puts the primary action under the
 * gesture area, where a tap either does nothing or leaves the app.
 *
 * The bar carries exactly one action. That is the same one-terracotta-action
 * rule the design system already had, and a floating bar is where it is most
 * tempting to break it.
 */

export default function ActionBar({
  children,
  /**
   * Constrain the bar to the right half on desktop.
   *
   * Only true where a block photograph occupies the left half. Paul,
   * 16/08/2026: the button should span until the middle of the screen and sit
   * centred under the question. Full width was putting the primary action
   * half over a photograph and half under the thing it acts on, so it read as
   * belonging to the page rather than to the question.
   *
   * Below `md` there is no photograph, so the bar is full width either way.
   */
  half = false,
}: {
  children: React.ReactNode;
  half?: boolean;
}) {
  return (
    <div
      className={`glass-bar-bottom fixed inset-x-0 bottom-0 z-40 px-6 pt-3 ${
        half ? "md:left-1/2" : ""
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}

/**
 * The spacer that stops the bar covering the end of the content. A fixed
 * element is out of flow, so nothing below it knows it exists; without this the
 * last option on a question sits under the glass, half legible and untappable.
 *
 * Rendered as a sibling by every screen that shows a bar, rather than as
 * padding on a shared wrapper, because the screens that have no bar must not
 * carry the gap.
 */
export function ActionBarSpacer() {
  return (
    <div
      aria-hidden
      style={{ height: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}
    />
  );
}
