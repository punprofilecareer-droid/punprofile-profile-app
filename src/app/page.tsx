export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="max-w-md text-3xl font-semibold tracking-tight">
        See where you actually stand for Europe.
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        An honest first read on your EU job-market readiness — in a few
        minutes, on your phone.
      </p>
      <a
        href="/assess"
        className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Check where you stand
      </a>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Under 2 minutes. No sign-up before you see your first result.
      </p>
    </div>
  );
}
