import type { Copy } from "./copy";
import { DESTINATIONS } from "./cta";

/**
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
 * compliance problem rather than a design flourish. The honest equivalent is
 * the thing that already publishes weekly, which is the Facebook presence, so
 * the left block points there instead.
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
    ? "text-caption font-semibold"
    : "text-caption font-semibold uppercase tracking-[0.14em]";

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

export const FOLLOW_BODY: Copy = {
  // Describes the Page, which is what it links to. The first version described
  // the group and pointed at the Page, which is the kind of small untruth
  // nobody notices until the person who clicks it does.
  en: "Jobs in Europe, and what each one is actually looking for. Free and public, and where most people find us first.",
  th: "งานในยุโรป และสิ่งที่แต่ละตำแหน่งมองหาจริง ๆ เปิดฟรีและเป็นสาธารณะ และเป็นที่ที่คนส่วนใหญ่เจอเราเป็นที่แรก",
};

/**
 * Three columns, grouped by what the reader wants rather than by route.
 * Everything here already exists; a footer is the worst place to discover a
 * link to a page nobody built.
 */
export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: { en: "EU Fit Check", th: "EU Fit Check" },
    links: [
      { href: "/assess", label: { en: "Take the check", th: "ทำแบบประเมิน" } },
      { href: "/faq", label: { en: "FAQ", th: "คำถามที่พบบ่อย" } },
    ],
  },
  {
    heading: { en: "Coaching", th: "โค้ชชิ่ง" },
    links: [
      { href: "/coaching", label: { en: "Coaching 1:1", th: "Coaching 1:1" } },
      { href: "/services", label: { en: "Our Services", th: "บริการของเรา" } },
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
      { href: DESTINATIONS.line.href, label: { en: "LINE", th: "Line" }, external: true },
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
  th: "PunProfile ให้บริการโค้ชชิ่งด้านอาชีพและคำแนะนำในการหางาน เราไม่ใช่บริษัทจัดหางาน และไม่ใช่ทนายความหรือที่ปรึกษาด้านการย้ายถิ่นฐานที่ได้รับใบอนุญาต ข้อมูลในเว็บไซต์นี้ไม่ใช่คำแนะนำทางกฎหมาย การเข้าเมือง หรือการเงิน สำหรับคำถามเรื่องวีซ่าและสิทธิ์ในการทำงาน กรุณาปรึกษาทนายความด้านการเข้าเมืองในประเทศนั้น ๆ เรารับค่าบริการจากคุณไม่ใช่จากนายจ้าง ผลลัพธ์แตกต่างกันไปในแต่ละบุคคล และเราไม่รับประกันว่าคุณจะได้งาน ได้สัมภาษณ์ หรือได้วีซ่า",
};
