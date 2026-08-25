/**
 * A full-bleed section band. 25/08/2026, with the `wise-1` system.
 *
 * The page is white and structure comes from bands laid across it edge to edge,
 * not from tinted cards inside a single column. `design.md`'s "four grounds"
 * table is the whole specification: a section picks one ground, the band paints
 * it full width, and the content sits in a centred column inside it.
 *
 * **The two coloured grounds pin their own content colours**, because a lime or
 * dark-green ground is fixed while the roles inside it follow the scheme. That
 * is `.ground-fixed` and `.ground-dark` in `globals.css`; naming them here means
 * no page has to remember, and no page can put light text on the lime.
 */

const GROUND = {
  canvas: "bg-canvas",
  soft: "bg-canvas-soft",
  brand: "bg-canvas-brand ground-fixed",
  dark: "bg-canvas-dark ground-dark",
} as const;

/**
 * `text` is a reading column and stops at a measure; `wide` fills the container.
 *
 * `wide` used to be `max-w-5xl`, which was correct while the box was centred and
 * wrong the moment it was not: 1024 left-aligned inside a 1295 container left
 * 271px of nothing down the right of every hero. The container already caps the
 * line length at 1440, so a band that wants the full width should take it, which
 * is what the reference does with its heroes and its card grids.
 */
const WIDTH = {
  text: "max-w-3xl",
  wide: "max-w-none",
} as const;

/**
 * The block this section is, from `block-library.md`.
 *
 * **Declared rather than inferred, and required.** `Narrative_System.md` maps
 * every block to the narrative slots it carries, so a section that names its
 * block is a section a script can ask questions of: does this page state a
 * limit before it makes an ask, does a row list carry the reader's own words,
 * does any page ask twice and explain once. A section with no declared block is
 * a section nobody decided the shape of, and that is exactly the section that
 * gets written from nothing.
 *
 * `verify:narrative` walks the pages for these and fails on a block the map
 * does not have.
 */
export type BlockId =
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "B8"
  | "B10"
  | "B13"
  | "B19";

export default function Band({
  block,
  ground = "canvas",
  width = "text",
  align = "start",
  className,
  children,
}: {
  block: BlockId;
  ground?: keyof typeof GROUND;
  width?: keyof typeof WIDTH;
  /**
   * Where the reading measure sits inside the container.
   *
   * `start` by default, and that is the decision worth stating: the reference
   * left-aligns every section against the container's edge, so a heading, a
   * paragraph and the logo in the bar all begin at the same x. Centring the
   * measure instead puts content 136px inboard of the lockup on a 1455 window,
   * which is the misalignment that started this.
   *
   * `center` is for a band whose content is centred text, where a left-aligned
   * box would centre the words against the wrong edge.
   */
  align?: "start" | "center";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-block={block}
      className={`${GROUND[ground]} py-16 medium:py-20 ${className ?? ""}`}
    >
      {/* `.page-container` sets the gutter and the 1440 cap, and it is the same
          one the header and the footer use, so a band's first character sits at
          the same x as the lockup above it. The inner box is the reading
          measure and nothing else. */}
      <div className="page-container">
        <div className={`w-full ${align === "center" ? "mx-auto" : ""} ${WIDTH[width]}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
