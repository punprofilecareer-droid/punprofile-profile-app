/**
 * B22: a pale chip naming who a section is for, sitting above its heading.
 *
 * `/platform` uses it to say "For banks & financial institutions" before it
 * says anything else, which is a cheap and honest way to let the wrong reader
 * leave. It is not an eyebrow: an eyebrow labels the section, this labels the
 * person.
 */

export default function AudienceChip({
  children,
  mark,
}: {
  children: React.ReactNode;
  /** An SVG path drawn before the words. */
  mark?: string;
}) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-canvas-soft px-4 py-2 text-body-sm-strong text-on-primary">
      {mark && (
        <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0" fill="currentColor">
          <path d={mark} />
        </svg>
      )}
      {children}
    </p>
  );
}
