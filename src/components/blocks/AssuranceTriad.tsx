import Image from "next/image";

/**
 * B12: three tinted cards, centred, with one action under the row.
 *
 * The reference uses this for the things a reader has to believe before they
 * will act: support, fraud, safeguarding. It is the trust triad's heavier
 * cousin, and the difference is deliberate. `B3` states facts in the open with
 * a chip; this puts them in cards because each one needs a paragraph, and a
 * paragraph in the open beside two others is a wall.
 *
 * One action under the row and never one per card: three cards with three
 * buttons is three buttons being ignored.
 */

export interface AssuranceItem {
  title: React.ReactNode;
  body: React.ReactNode;
  image?: { src: string; alt: string };
}

export default function AssuranceTriad({
  items,
  action,
}: {
  items: readonly AssuranceItem[];
  action?: React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <>
      <div className="grid gap-6 large:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl bg-canvas-soft px-8 py-10 text-center">
            {item.image && (
              <Image
                src={item.image.src}
                alt={item.image.alt}
                width={320}
                height={240}
                sizes="320px"
                className="mx-auto mb-6 h-auto w-full max-w-[200px]"
              />
            )}
            <p className="text-heading-sm text-ink-deep">{item.title}</p>
            <p className="mt-3 text-body-md text-body">{item.body}</p>
          </div>
        ))}
      </div>
      {action && <div className="mt-10 flex justify-center">{action}</div>}
    </>
  );
}
