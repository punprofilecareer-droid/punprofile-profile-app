import Link from "next/link";

/**
 * B19: a category heading that is itself the link into the category, then the
 * cards under it.
 *
 * The reference's blog runs several of these down one page, each a category
 * with its own row. The heading carries a chevron and is the way in, so the row
 * does not need a "see all" link sitting apart from it.
 *
 * The cards are the caller's, because a card is a different decision from a
 * grid: this block owns the heading, the chevron and the columns.
 */

export default function EditorialGrid({
  heading,
  intro,
  href,
  columns = 3,
  children,
}: {
  heading: React.ReactNode;
  /** One line under the heading. A category that needs no explanation gets none. */
  intro?: React.ReactNode;
  /** Omitted when the category has no page of its own; the heading stays plain. */
  href?: string;
  columns?: 2 | 3;
  children: React.ReactNode;
}) {
  const title = (
    <span className="inline-flex items-center gap-3">
      {heading}
      {href && (
        <span aria-hidden className="text-body-large">
          &rsaquo;
        </span>
      )}
    </span>
  );

  return (
    <>
      {href ? (
        <Link href={href} className="inline-block duration-[350ms] ease-nav transition-opacity hover:opacity-70">
          {title}
        </Link>
      ) : (
        title
      )}
      {intro && <div className="mt-4 max-w-2xl text-body-large text-body">{intro}</div>}
      <div
        className={`mt-8 grid items-start gap-6 medium:grid-cols-2 ${
          columns === 3 ? "large:grid-cols-3" : ""
        }`}
      >
        {children}
      </div>
    </>
  );
}
