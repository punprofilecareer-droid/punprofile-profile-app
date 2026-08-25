import Image from "next/image";

/**
 * B18: an illustration, a large heading, one line, one way out.
 *
 * From the reference's 404, and it is the shape for any screen that has nothing
 * to show: a search with no results, a list before its first row, an expired
 * link. The rule it encodes is that an empty screen still has to say what
 * happened and offer exactly one thing to do next.
 */

export default function EmptyState({
  image,
  heading,
  body,
  action,
}: {
  image?: { src: string; alt: string };
  heading: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={400}
          height={300}
          sizes="280px"
          className="mx-auto mb-8 h-auto w-full max-w-[280px]"
        />
      )}
      {heading}
      {body && <div className="mt-4 text-body-large text-body">{body}</div>}
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  );
}
