export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-xl text-h2">See where you actually stand for Europe.</h1>
      <p className="max-w-md text-body-lg text-slate">
        An honest first read on your EU job-market readiness, in a few minutes,
        on your phone.
      </p>
      {/* button-primary. The one Terracotta action on this view: the system is
          explicit that stacking a second dilutes the signal the colour carries. */}
      <a
        href="/assess"
        className="rounded-md bg-accent px-7 py-3.5 text-label text-on-accent transition-colors hover:bg-accent-bright"
      >
        Check where you stand
      </a>
      <p className="text-caption text-neutral-500">
        Under 2 minutes. No sign-up before you see your first result.
      </p>
    </div>
  );
}
