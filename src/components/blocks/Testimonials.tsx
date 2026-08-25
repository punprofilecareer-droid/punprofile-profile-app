import Image from "next/image";

/**
 * B13: quote cards, grounds alternating.
 *
 * **It renders nothing until there is a real one**, which is the whole reason
 * it is written now and used later. `home.ts` has said since 14/08/2026 that a
 * visible placeholder for social proof is itself a claim that social proof is
 * imminent, and there are no placed clients. `RESULTS` is empty; when it is
 * not, this is the block, and nobody has to invent one under time pressure on
 * the day the first quote arrives.
 *
 * The reference alternates dark and pale grounds down the row, which stops a
 * run of quotes reading as one long testimonial. The dark card pins its own
 * content colours through `.ground-dark`.
 */

export interface Quote {
  quote: React.ReactNode;
  who: React.ReactNode;
  portrait?: { src: string; alt: string };
}

export default function Testimonials({ items }: { items: readonly Quote[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-6 large:grid-cols-3">
      {items.map((item, i) => (
        <li
          key={i}
          className={`rounded-2xl px-8 py-9 ${
            i % 2 === 0 ? "ground-dark bg-canvas-dark" : "bg-primary-pale text-on-primary-pale"
          }`}
        >
          {item.portrait && (
            <Image
              src={item.portrait.src}
              alt={item.portrait.alt}
              width={96}
              height={96}
              className="mb-5 size-14 rounded-full object-cover"
            />
          )}
          <p className="text-body-md-strong">{item.quote}</p>
          <p className="mt-4 text-body-sm">{item.who}</p>
        </li>
      ))}
    </ul>
  );
}
