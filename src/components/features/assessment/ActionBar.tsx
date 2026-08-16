"use client";

/**
 * The floating action bar. Added 14/08/2026 with the Liquid Glass pass, and it
 * outlived the glass: the material was retired 16/08/2026 and the bar was not,
 * because pinning it was a navigation decision rather than a property of what
 * it was made of.
 *
 * It is now `navigation-bar` from `design.md`: `surface-container` with a
 * hairline above it. A distinct container tier rather than a shadow, because
 * M3 builds depth from surface tiers and keeps elevation for things that
 * genuinely float free of an edge.
 *
 * The reason it exists is unchanged. The Continue button sat below
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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-container px-6 pt-3 ${
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
 * last option on a question sits under the bar, half legible and untappable.
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
