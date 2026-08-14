"use client";

/**
 * Renders a page's declared actions. TASK-090, 14/08/2026.
 *
 * The framework in `src/lib/content/cta.ts` is only worth having if pages
 * cannot quietly disagree with it, so they do not hand-roll buttons any more:
 * they name their route and this renders whatever the table says. Changing what
 * a page asks for is now an edit to one table, and the check in
 * `scripts/verify-content.ts` runs against that same table.
 *
 * Rule 5 lives here and nowhere else. Primary is a filled Terracotta pill;
 * secondary is a text link. There is deliberately no `variant` prop and no way
 * to render a secondary as a button, because every instance of two buttons on
 * one screen started as somebody having a good reason.
 */

import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import { DESTINATIONS, PAGE_ACTIONS, primaryChannels } from "@/lib/content/cta";
import type { Action } from "@/lib/content/cta";

const BASE =
  "inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full px-8 py-4 text-body-lg font-semibold transition-colors";

const PRIMARY_CLASS = `${BASE} bg-accent text-on-accent hover:bg-accent-bright`;

/**
 * LINE Green, from LINE's own button guidelines. Hard-coded rather than added
 * to the theme on purpose: it is not a PunProfile colour and must never become
 * available to a PunProfile component. `#05b34c` is the hover, LINE's own
 * darker state.
 */
const LINE_CLASS = `${BASE} bg-[#06c755] text-white hover:bg-[#05b34c]`;

/**
 * The LINE mark, drawn rather than shipped as an asset.
 *
 * The speech bubble with the wordmark cut out of it, which is how the mark
 * behaves on a coloured button: the glyph is the background showing through,
 * not white paint, so it stays crisp at 20px where a raster asset would not.
 * `currentColor` means it inherits the button's text colour and cannot drift
 * out of step with it.
 */
function LineMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0" fill="currentColor">
      <path d="M12 2.4c5.52 0 10 3.63 10 8.1 0 1.79-.7 3.4-2.05 4.86-1.95 2.24-6.3 4.97-7.3 5.39-.98.41-.85-.26-.81-.5l.13-.8c.03-.24.06-.6-.03-.83-.1-.26-.5-.4-.8-.46C6.3 17.53 2 14.15 2 10.5c0-4.47 4.48-8.1 10-8.1Z" />
      <path
        d="M9.4 8.62v3.53M6.9 8.62v3.53h1.9M17.1 8.62h-1.9v3.53h1.9M15.2 10.38h1.6M11.2 12.15V8.62l2.3 3.53V8.62"
        fill="none"
        stroke="#06c755"
        // 1.2, not 1.05. Rendered both at the real 20px: the lighter stroke thins out
        // and the counters in the N and E start to close up.
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Primary({ action, label }: { action: Action; label: string }) {
  const line = action.brand === "line";
  const body = (
    <>
      {line && <LineMark />}
      {label}
      {/* No arrow on a channel button. The arrow means "onward through the
          site"; LINE opens an app, which is a different promise. */}
      {!line && <span aria-hidden>&rarr;</span>}
    </>
  );
  // `mailto:` and a LINE deep link are not routes, so they must not go through
  // the client router.
  return action.external ? (
    <a
      href={action.href}
      className={line ? LINE_CLASS : PRIMARY_CLASS}
      {...(line ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {body}
    </a>
  ) : (
    <Link href={action.href} className={PRIMARY_CLASS}>
      {body}
    </Link>
  );
}

export default function CallToAction({
  page,
  className = "",
  align = "start",
  show = "both",
}: {
  /** Key into `PAGE_ACTIONS`, e.g. "/coaching". */
  page: string;
  className?: string;
  align?: "start" | "center";
  /**
   * Which halves to render. One prop rather than two booleans, because
   * `primaryOnly` and `secondaryOnly` both set to true is a state that should
   * not be expressible.
   *
   * A card grid repeating the primary under rule 1 uses "primary" on each card
   * and "secondary" once at the foot of the page: the primary belongs to every
   * card because a reader finishes at a different one each time, the secondary
   * belongs to the page and must appear exactly once.
   */
  show?: "both" | "primary" | "secondary";
}) {
  const { pick } = useCopy();
  const actions = PAGE_ACTIONS[page];
  // A page not in the table renders nothing rather than guessing. The check
  // makes this impossible to ship, so it only ever happens mid-edit.
  if (!actions) return null;

  const channels = show === "secondary" ? [] : primaryChannels(actions);
  const secondary =
    show !== "primary" && actions.secondary ? (DESTINATIONS[actions.secondary] as Action) : null;
  if (channels.length === 0 && !secondary) return null;

  return (
    <div
      className={`flex flex-col gap-4 ${align === "center" ? "items-center" : "items-start"} ${className}`}
    >
      {/* Channels of one action sit side by side. Both carry primary weight
          because they are the same action, which is rule 2. */}
      {channels.length > 0 && (
        <div className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
          {channels.map((action) => (
            <Primary key={action.href} action={action} label={pick(action.label)} />
          ))}
        </div>
      )}

      {secondary && (
        <Link
          href={secondary.href}
          className="text-body text-primary underline underline-offset-2"
        >
          {pick(secondary.label)}
        </Link>
      )}
    </div>
  );
}
