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

/** `text` is a reading column; `wide` is for a hero or a card grid. */
const WIDTH = {
  text: "max-w-3xl",
  wide: "max-w-5xl",
} as const;

export default function Band({
  ground = "canvas",
  width = "text",
  className,
  children,
}: {
  ground?: keyof typeof GROUND;
  width?: keyof typeof WIDTH;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${GROUND[ground]} px-6 py-16 medium:py-20 ${className ?? ""}`}>
      <div className={`mx-auto w-full ${WIDTH[width]}`}>{children}</div>
    </section>
  );
}
