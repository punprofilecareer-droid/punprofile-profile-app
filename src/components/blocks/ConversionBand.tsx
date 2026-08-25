/**
 * B17: a heading, two lines, one button, centred, and nothing else.
 *
 * The reference puts this where a page has finished making its case and the
 * only remaining question is whether to act. Everything that is not the
 * decision is left out on purpose, which is why this component takes no image,
 * no list and no secondary link: the moment one appears, the block is a section
 * again rather than a decision.
 */

export default function ConversionBand({
  heading,
  body,
  action,
}: {
  heading: React.ReactNode;
  body?: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {heading}
      {body && <div className="mt-5 text-body-large text-body">{body}</div>}
      <div className="mt-8 flex justify-center">{action}</div>
    </div>
  );
}
