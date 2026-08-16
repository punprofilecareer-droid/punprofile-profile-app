"use client";

import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  const { t } = useCopy();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-xl text-headline-large">{t("landing.headline")}</h1>
      <p className="max-w-md text-body-large text-on-surface-variant">{t("landing.subhead")}</p>
      {/* Actions come from the table in `src/lib/content/cta.ts`, not from
          this file. The landing page asks a stranger for the check, and offers
          the coaching page as the secondary for anyone not ready to answer
          seventeen questions on the strength of one headline. */}
      <CallToAction page="/" align="center" />
      <p className="text-body-medium text-on-surface-variant">{t("landing.reassurance")}</p>
    </div>
  );
}
