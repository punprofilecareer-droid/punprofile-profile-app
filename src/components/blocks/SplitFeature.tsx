import Image from "next/image";

/**
 * B2: a picture one side, the argument the other, vertically centred.
 *
 * The reference alternates the side down a page, which is why `reverse` exists
 * and why it is a prop rather than two components. Below `large` the picture
 * always follows the words: on a phone the argument comes first and the
 * illustration is support, never the thing that pushes the button under the
 * fold.
 *
 * The image is `object-cover` in a 4:3 box so a row of these crops the same way
 * whatever the source ratio, which is the rule the card rows already follow.
 */

export default function SplitFeature({
  src,
  alt,
  reverse = false,
  children,
}: {
  src: string;
  /** Empty when the picture is decoration and the words beside it already say it. */
  alt: string;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 large:grid-cols-2 large:gap-16">
      <div className={reverse ? "large:order-2" : undefined}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image src={src} alt={alt} fill sizes="(max-width: 1200px) 100vw, 50vw" className="object-cover" />
        </div>
      </div>
      <div className={reverse ? "large:order-1" : undefined}>{children}</div>
    </div>
  );
}
