"use client";

/**
 * The privacy notice. Resolves the `[Privacy Notice TODO]` placeholder that
 * `consent.purpose` points at.
 *
 * Renders a draft banner while `PRIVACY_REVIEWED` is false, which it is. The
 * route working is not the same as the notice being true, and without the
 * banner the difference is invisible to a reader.
 *
 * Client component only because it reads the locale context. There is nothing
 * interactive on the page.
 */

import Link from "next/link";
import { useCopy } from "@/components/LocaleProvider";
import {
  PRIVACY_HEADING,
  PRIVACY_INTRO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_REVIEWED,
  PRIVACY_SECTIONS,
} from "@/lib/content/privacy";

export default function PrivacyPage() {
  const { locale, pick, path } = useCopy();
  const th = locale === "th";

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      {!PRIVACY_REVIEWED && (
        <p className="mb-10 rounded-small border border-warning bg-warning-container px-4 py-3 text-body-medium text-on-warning-container">
          {th
            ? "ฉบับร่าง ยังไม่ผ่านการตรวจสอบทางกฎหมาย ยังไม่ควรใช้อ้างอิง"
            : "Draft. Not yet reviewed by a qualified person and not yet something to rely on."}
        </p>
      )}

      <h1 className="text-headline-large">{pick(PRIVACY_HEADING)}</h1>
      <p className="mt-2 text-body-medium text-on-surface-variant">
        {th ? "ปรับปรุงล่าสุด" : "Last updated"} {PRIVACY_LAST_UPDATED}
      </p>
      <p className="mt-6 text-body-large text-on-surface-variant">{pick(PRIVACY_INTRO)}</p>

      {PRIVACY_SECTIONS.map((section) => (
        <section key={section.heading.en} className="mt-10">
          <h2 className="text-title-large">{pick(section.heading)}</h2>
          {section.body.map((para) => {
            const text = pick(para);
            // A leading "- " is the list marker the content module documents.
            // Hanging indent rather than a real <ul>, so a section can mix
            // prose and items without splitting into two arrays.
            const item = text.startsWith("- ");
            return (
              <p
                key={para.en}
                className={
                  item
                    ? "mt-3 pl-5 -indent-5 text-body-large text-on-surface-variant"
                    : "mt-3 text-body-large text-on-surface-variant"
                }
              >
                {item ? `• ${text.slice(2)}` : text}
              </p>
            );
          })}
        </section>
      ))}

      <p className="mt-12">
        <Link href={path("/")} className="text-body-medium text-on-primary underline">
          {th ? "กลับหน้าแรก" : "Back to the start"}
        </Link>
      </p>
    </div>
  );
}
