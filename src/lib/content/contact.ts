import type { Copy } from "./copy";

/**
 * The contact page's words. Extracted from the page 16/08/2026.
 *
 * They were four `locale === "th" ? … : …` ternaries inline in the JSX, which
 * was fine while the page was the only thing that read them. It is not any
 * more: the page's `<title>` and meta description are set in a route layout,
 * and the English route sets its own, so the same sentence was about to exist in
 * three files. `03_Content_System.md` owns the words; this module owns where
 * they live, and both trees plus both layouts now read from here.
 *
 * Not in `copy.ts`, following `faq.ts` and `services.ts`: a page whose content
 * is prose owns its prose, and `copy.ts` holds the interface chrome the
 * translation worksheet round-trips.
 */

export const CONTACT_HEADING: Copy = { en: "Contact", th: "ติดต่อเรา" };

export const CONTACT_INTRO: Copy = {
  en: "Questions about the services, about your result, or about your own data. Write to us, we read everything.",
  th: "มีคำถามเรื่องบริการ เรื่องผลประเมิน หรือเรื่องข้อมูลของคุณ ทักมาได้เลย เราอ่านทุกข้อความ",
};

/**
 * Which channel suits what, in one line rather than in two cards. The
 * distinction is real and worth keeping: LINE is faster, email holds an
 * attachment.
 */
export const CONTACT_CHANNELS: Copy = {
  en: "LINE is usually the faster reply. Email is better for anything detailed, or if you want to attach a CV.",
  th: "Line มักได้คำตอบเร็วกว่า ส่วนอีเมลเหมาะกับคำถามที่มีรายละเอียดเยอะ หรือถ้าคุณอยากแนบ CV มาด้วย",
};

/** For the person who already left their details and is about to do it twice. */
export const CONTACT_ALREADY_IN_QUEUE: Copy = {
  en: "If you have already taken the check and left your details, you are in the queue. No need to write as well.",
  th: "ถ้าคุณทำแบบประเมินและฝากช่องทางติดต่อไว้แล้ว คุณอยู่ในคิวเรียบร้อย ไม่ต้องส่งข้อความมาซ้ำ",
};
