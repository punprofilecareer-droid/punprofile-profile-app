"use client";

/**
 * The split the assessment sits in: a block photograph on the left, whatever
 * the flow is showing on the right.
 *
 * **This lives above the question, not inside it, and that is the whole point.**
 * The first version put the panel inside `QuestionCard`, which the page keys on
 * the question, so it unmounted and remounted on every single answer. Its state
 * went with it, which meant it could never know what the previous photograph
 * was, which meant the crossfade it was written to do never ran once. The
 * picture hard-cut exactly as it had before, and the fix looked like it had not
 * worked because it had not.
 *
 * A thing that marks a section has to outlive the questions inside that section.
 * That is true of its DOM as much as of its design.
 *
 * Nothing on a phone: there is no honest way to give a photograph real room on a
 * 390px screen without pushing the question below the fold, and the question is
 * the product.
 */

import { useState } from "react";
import Image from "next/image";

export type BlockImage = {
  src: string;
  alt: string;
  priority: boolean;
  blurDataURL: string | null;
};

export default function BlockPanel({
  image,
  children,
}: {
  image: BlockImage | null;
  children: React.ReactNode;
}) {
  /**
   * Two layers, so a block change crossfades instead of cutting.
   *
   * The previous photograph stays underneath at full opacity while the new one
   * fades in over it, then it is dropped. Without the bottom layer the panel
   * would blink to its background between the two, which is worse than the cut.
   *
   * Adjusted during render rather than in an effect: an effect paints one frame
   * of the new picture at full opacity before the fade can start, which is the
   * cut again for a sixtieth of a second.
   */
  const [shown, setShown] = useState(image);
  const [leaving, setLeaving] = useState<BlockImage | null>(null);
  if (image && image.src !== shown?.src) {
    if (shown) setLeaving(shown);
    setShown(image);
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {shown && (
        // Lavender rather than grey underneath. It is the field the assessment
        // already sits on, so a panel with nothing in it yet reads as part of
        // the page instead of a hole in it.
        <div className="relative hidden shrink-0 self-start overflow-hidden bg-lavender-wash md:sticky md:top-[72px] md:block md:h-[calc(100dvh-72px)] md:w-1/2">
          {leaving && (
            <Image
              key={leaving.src}
              src={leaving.src}
              alt=""
              fill
              sizes="(max-width: 767px) 1px, 50vw"
              className="object-cover object-center"
            />
          )}
          <Image
            key={shown.src}
            src={shown.src}
            alt={shown.alt}
            fill
            // Only the first block preloads. The rest are minutes away and
            // preloading them would fetch photographs nobody has reached, over
            // the mobile data this audience is mostly on.
            priority={shown.priority}
            // Paints a 20px version of the same photograph instantly, so the
            // panel is never an empty box while the real file is resized.
            //
            // **Do not add an opacity transition to this element.** An earlier
            // attempt did, and `opacity-0` hides the placeholder too, because
            // Next paints it as a background on this same element. The crossfade
            // is a class on the element instead, which is why `q-photo-in` is
            // here rather than a Tailwind opacity utility.
            {...(shown.blurDataURL
              ? { placeholder: "blur" as const, blurDataURL: shown.blurDataURL }
              : {})}
            sizes="(max-width: 767px) 1px, 50vw"
            onAnimationEnd={() => setLeaving(null)}
            className={`object-cover object-center ${leaving ? "q-photo-in" : ""}`}
          />
        </div>
      )}
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
}
