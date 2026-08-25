/**
 * B11's rows: `icon chip + lead + body`, hairlines between.
 *
 * The reference uses this beside a picture on every page that has to say what a
 * product actually does. It is not a bulleted list with a decoration: the lead
 * is the claim and the body is the evidence, and the hairline is what stops six
 * of them reading as one paragraph.
 *
 * The chip is deliberately plain. Where a caller has no icon it takes the
 * item's number, which is honest about being an ordinal rather than pretending
 * to be a symbol for something.
 */

export interface ChecklistItem {
  /** The claim. One line. */
  lead: React.ReactNode;
  /** The evidence. Optional: a lead that needs no support should not invent it. */
  body?: React.ReactNode;
  /** An SVG path drawn in the chip. Falls back to the item's position. */
  mark?: string;
}

export default function Checklist({ items }: { items: readonly ChecklistItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4 border-b border-line py-5 last:border-b-0">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-pale text-body-sm-strong text-on-primary-pale"
          >
            {item.mark ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                <path d={item.mark} />
              </svg>
            ) : (
              i + 1
            )}
          </span>
          <div className="min-w-0">
            <p className="text-body-md-strong text-on-primary">{item.lead}</p>
            {item.body && <p className="mt-1 text-body-md text-body">{item.body}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
