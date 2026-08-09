"use client";

import { useCopy } from "@/components/LocaleProvider";

export default function Home() {
  const { t } = useCopy();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-xl text-h2">{t("landing.headline")}</h1>
      <p className="max-w-md text-body-lg text-slate">{t("landing.subhead")}</p>
      {/* button-primary. The one Terracotta action on this view: the system is
          explicit that stacking a second dilutes the signal the colour carries. */}
      <a
        href="/assess"
        className="rounded-md bg-accent px-7 py-3.5 text-label text-on-accent transition-colors hover:bg-accent-bright"
      >
        {t("landing.cta")}
      </a>
      <p className="text-caption text-neutral-500">{t("landing.reassurance")}</p>
    </div>
  );
}
