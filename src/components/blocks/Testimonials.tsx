import Image from "next/image";
import Slot from "@/components/blocks/Slot";

/**
 * B13: quote cards, grounds alternating.
 *
 * The reference runs these as a carousel with a heading on the left and a pair
 * of circular arrows on the right. Cards alternate dark green and pale green,
 * each carrying a round portrait, the quote, a name, a role, and a button into
 * that person's story.
 *
 * **Ours renders slots until there is a real quote.** `home.ts` has said since
 * 14/08/2026 that a visible placeholder for social proof is itself a claim that
 * social proof is imminent, and that rule has not changed: a slot is not a
 * placeholder pretending to be a testimonial, it is a coded question with a
 * dashed border round it, and it cannot be mistaken for a client saying
 * something. The day `RESULTS` has a row, `items` gets it and the slots go.
 *
 * There is no per-card button yet. The reference's leads to a case study and
 * this product has none; a button with nowhere to go is worse than no button.
 */

export interface Quote {
  quote: React.ReactNode;
  who: React.ReactNode;
  role?: React.ReactNode;
  portrait?: { src: string; alt: string };
}

export default function Testimonials({
  items,
  placeholders = 0,
  codePrefix = "TESTIMONIAL",
}: {
  items: readonly Quote[];
  /** How many slotted cards to draw while `items` is empty. */
  placeholders?: number;
  /** Slot codes are `${codePrefix}-${n}-quote` and `-who`. */
  codePrefix?: string;
}) {
  if (items.length === 0 && placeholders === 0) return null;

  const ground = (i: number) =>
    i % 2 === 0 ? "ground-dark bg-canvas-dark" : "bg-primary-pale text-on-primary-pale";

  return (
    <ul className="grid gap-6 large:grid-cols-3">
      {items.map((item, i) => (
        <li key={`q${i}`} className={`rounded-2xl px-8 py-9 ${ground(i)}`}>
          {item.portrait && (
            <Image
              src={item.portrait.src}
              alt={item.portrait.alt}
              width={96}
              height={96}
              className="mb-5 size-14 rounded-full object-cover"
            />
          )}
          <p className="text-body-md-strong">&ldquo;{item.quote}&rdquo;</p>
          <p className="mt-4 text-body-sm-strong">{item.who}</p>
          {item.role && <p className="text-body-sm">{item.role}</p>}
        </li>
      ))}

      {items.length === 0 &&
        Array.from({ length: placeholders }, (_, i) => (
          <li key={`s${i}`} className={`rounded-2xl px-8 py-9 ${ground(i)}`}>
            {/* The portrait's own box, so the card is the height it will be. */}
            <span
              aria-hidden
              className="mb-5 flex size-14 items-center justify-center rounded-full border border-dashed border-line-strong text-caption text-mute-strong"
            >
              {i + 1}
            </span>
            <Slot code={`${codePrefix}-${i + 1}-quote`} block>
              the quote, in their words, two or three lines
            </Slot>
            <div className="mt-4">
              <Slot code={`${codePrefix}-${i + 1}-who`} block>
                who said it: a name, and what they were doing at the time
              </Slot>
            </div>
          </li>
        ))}
    </ul>
  );
}
