import type { Copy } from "./copy";
import { POSTS } from "./blog";
import { DESTINATIONS } from "./cta";

/**
 * **Thai wording passed by Paul, 15/08/2026**, in the review of all shipped Thai.
 *
 * The footer. TASK-091, 14/08/2026.
 *
 * Modelled on a competitor's (Careersu AI), whose structure is worth taking:
 * a wide left block that gives a reason to stay in touch, link columns grouped
 * by what a reader came for rather than by site structure, then a rule, then
 * the legal paragraph, then the fine print. The grouping is the good part. Most
 * footers list every page in one flat row, which tells a reader nothing about
 * which of them is for them.
 *
 * **What was NOT taken: the newsletter capture.** Theirs leads with an email
 * field and "one insight a week". PunProfile has no newsletter, no sending
 * infrastructure and no consent copy covering a marketing list, and a field
 * that collects an email address under PDPA without a lawful basis is a
 * compliance problem rather than a design flourish.
 *
 * What went in its place was a paragraph about the Facebook presence, and that
 * is retired too, 17/08/2026: see the note where `FOLLOW_BODY` used to be. The
 * left block is now the logo, a label and a link, which is what a footer owes.
 * **The lesson is the one the newsletter note already had**, applied a step
 * further: the answer to an empty slot is a smaller block, not a different
 * thing to sell in it.
 *
 * **The legal paragraph is the other thing worth copying.** Theirs names what
 * they are not: not migration agents, no guarantee of employment. Ours says the
 * same because the same is true, and because it is already what the FAQ and the
 * coaching page tell people. A disclaimer that repeats what the rest of the
 * site already says is a disclaimer nobody can call a surprise.
 */

/**
 * Eyebrow type. Tracked and uppercased in English, neither in Thai.
 *
 * `letter-spacing` is a Latin device. Thai is written without word spaces and
 * relies on the eye grouping clusters of a base character with its vowels and
 * tone marks stacked around it; pushing the bases apart makes those clusters
 * ambiguous and the line harder to read, not more emphatic. `text-transform:
 * uppercase` does nothing at all to Thai script, so in Thai the whole treatment
 * would be pure cost.
 *
 * Caught by rendering the footer in Thai before shipping it rather than after,
 * which is the only reason it was visible: in English the same class is exactly
 * right, and that is what makes this class of mistake survive review.
 *
 * So the eyebrow is distinguished by size, weight and colour in both languages,
 * and by tracking in English only.
 */
export const EYEBROW = (locale: string) =>
  locale === "th"
    ? "text-body-medium font-semibold"
    : "text-body-medium font-semibold uppercase tracking-[0.14em]";

export interface FooterLink {
  href: string;
  label: Copy;
  external?: boolean;
}

export interface FooterColumn {
  heading: Copy;
  links: readonly FooterLink[];
}

/**
 * The Facebook Page, supplied by Paul 14/08/2026.
 *
 * The Page, and deliberately not the งานบริษัทในยุโรป group: Paul's instruction
 * the same day was not to publish the group's URL, and it is not recorded
 * anywhere in the coaching repo in any case. Nothing on this site links to it,
 * and no placeholder stands in for it.
 *
 * This is a follow link, not a contact channel. Public contact is LINE and
 * email only, which is why Facebook is absent from the Contact column below.
 */
export const FACEBOOK_PAGE = "https://www.facebook.com/punprofile";

export const FOLLOW_EYEBROW: Copy = { en: "Follow", th: "ติดตามเรา" };

/*
 * `FOLLOW_BODY` was here and is retired, 17/08/2026, on Paul: "it does not make
 * sense, we're not promoting the FB group on the web app."
 *
 * Worth recording properly, because the line was wrong twice in three days for
 * two different reasons and only the second one is the real one.
 *
 * It began as a description of the Facebook Group's free job posts sitting above
 * a link to the Facebook Page. `Content_Strategy.md` § Channels has said since
 * 11/07/2026 that those are different surfaces carrying different pillars: the
 * Group has Job Trend and How-Tos, the Page has Thought Leadership, How-Tos and
 * Social Proof. A note on 14/08/2026 claimed to have fixed exactly that and had
 * only changed the reasoning. Rewritten on 17/08/2026 to describe the Page.
 *
 * **Then retired the same day, which supersedes all of it.** The app does not
 * advertise Facebook. A paragraph selling a channel is a paragraph the footer
 * does not owe anyone, and the question of which Facebook surface it described
 * stops mattering once there is no paragraph.
 *
 * `FOLLOW_EYEBROW` and the Facebook button below it stay. A labelled link is a
 * link; it was the sales copy under it that had no business being there.
 * `FACEBOOK_PAGE` also stays: `SiteShell` reads it for the organisation's
 * `sameAs` in JSON-LD, which is a machine-readable fact about who we are rather
 * than a promotion.
 */

/**
 * Three columns, grouped by what the reader wants rather than by route.
 * Everything here already exists; a footer is the worst place to discover a
 * link to a page nobody built.
 */
export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: { en: "EU Fit Check", th: "EU Fit Check" },
    links: [
      { href: "/efc-assessment", label: { en: "Take the check", th: "ทำ EU Fit Check" } },
      { href: "/faq", label: { en: "FAQ", th: "FAQ" } },
    ],
  },
  {
    heading: { en: "Coaching", th: "แคเรียร์โค้ชชิ่ง" },
    links: [
      { href: "/coaching", label: { en: "Coaching 1:1", th: "Coaching 1:1" } },
      /*
       * "Our Services" pointed at `/services` until 23/08/2026 and was retargeted
       * with everything else when that route folded into `/coaching`. That made
       * it the second link in this column to the same page, which React caught
       * as a duplicate key before anyone read the column.
       *
       * Removed rather than deduplicated by giving it a different key. Two
       * labels for one destination in one footer column is a reader being told
       * there are two things behind them, and the fold means there is one.
       * `/pricing` takes the slot, which is the page the column was missing.
       */
      { href: "/pricing", label: { en: "Pricing", th: "แพ็กเกจและราคา" } },
      // The blog, added 16/08/2026, and this column rather than a fourth one.
      //
      // The grid beside this is three columns wide and a fourth would rebuild
      // the footer for one link. Of the three, this is the one it belongs to:
      // `Content_Strategy.md` files written content as demand generation for the
      // coaching business, and the articles are that business's point of view in
      // public. It reads oddly under a heading that says Coaching, which is the
      // cost of not having a "Read" column, and is worth revisiting when there
      // is enough here to justify one.
      //
      // Absent until the blog has an article, same gate and same reason as the
      // menu entry in `nav.ts`. This file's own note above says a footer is the
      // worst place to discover a link to a page nobody built, and a page built
      // with nothing on it is the same discovery.
      ...(POSTS.length > 0
        ? [{ href: "/blog", label: { en: "Blog", th: "Blog" } }]
        : []),
    ],
  },
  {
    // LINE and email only, Paul's call 14/08/2026. Facebook came out: it is
    // somewhere to follow us, not somewhere to reach us, and listing it here
    // promised a reply on a channel nobody watches for one. It keeps its place
    // in the Follow block above.
    heading: { en: "Contact", th: "ติดต่อ" },
    links: [
      { href: "/contact", label: { en: "Contact us", th: "ติดต่อเรา" } },
      { href: DESTINATIONS.line.href, label: { en: "LINE", th: "LINE" }, external: true },
      {
        href: DESTINATIONS.email.href,
        label: { en: "Email", th: "อีเมล" },
        external: true,
      },
    ],
  },
];

/**
 * What PunProfile is not.
 *
 * Every clause here is already stated somewhere a reader can check: the "no
 * guarantee" line is the FAQ's answer and the coaching page's who-this-is-not-
 * for list, and the "paid by you, not an employer" line is in both. The visa
 * clause is new here and is the one that most needs saying, because relocation
 * coaching sits close enough to immigration advice that a reader can reasonably
 * assume it includes it. It does not.
 */
export const DISCLAIMER: Copy = {
  en: "PunProfile provides career coaching and job-search guidance. We are not a recruitment agency, and we are not immigration lawyers or licensed migration advisers. Nothing here is legal, immigration or financial advice: for visa and work-rights questions, consult a qualified immigration lawyer in the country concerned. We are paid by you rather than by an employer, results vary from person to person, and we do not guarantee employment, an interview or a visa.",
  th: "ปั้นโปรไฟล์ ให้บริการโค้ชชิ่งด้านอาชีพและคำแนะนำในการหางาน เราไม่ใช่บริษัทจัดหางาน และไม่ใช่ทนายความหรือที่ปรึกษาด้านการย้ายถิ่นฐานที่ได้รับใบอนุญาต ข้อมูลในเว็บไซต์นี้ไม่ใช่คำแนะนำทางกฎหมาย การเข้าเมือง หรือการเงิน สำหรับคำถามเรื่องวีซ่าและสิทธิ์ในการทำงาน กรุณาปรึกษาทนายความด้านการเข้าเมืองในประเทศนั้น ๆ เรารับค่าบริการจากคุณไม่ใช่จากนายจ้าง ผลลัพธ์แตกต่างกันไปในแต่ละบุคคล และเราไม่รับประกันว่าคุณจะได้งาน ได้สัมภาษณ์ หรือได้วีซ่า",
};
