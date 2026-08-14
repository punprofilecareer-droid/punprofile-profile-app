"use client";

import { useCopy } from "@/components/LocaleProvider";

export default function Home() {
  const { t } = useCopy();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-xl text-h2">{t("landing.headline")}</h1>
      <p className="max-w-md text-body-lg text-slate">{t("landing.subhead")}</p>
      {/* button-primary. The one Terracotta action on this view: the system is
          explicit that stacking a second dilutes the signal the colour carries.
          Enlarged 14/08/2026. It was 14px type in a 45px pill sized to its own
          text, which on a phone reads as a link that happens to have a
          background. Full width up to a sensible cap below `sm`, 18px type,
          56px tall: on the screen where the entire job is "tap this", the tap
          target should be the most confident thing on it. */}
      <a
        href="/assess"
        className="flex min-h-14 w-full max-w-sm items-center justify-center rounded-md bg-accent px-8 py-4 text-body-lg font-semibold text-on-accent transition-colors hover:bg-accent-bright sm:w-auto"
      >
        {t("landing.cta")}
      </a>
      <p className="text-caption text-neutral-500">{t("landing.reassurance")}</p>
    </div>
  );
}
