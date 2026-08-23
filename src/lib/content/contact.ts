import type { Copy } from "./copy";

/**
 * The contact page's words. Extracted from the page 16/08/2026.
 *
 * **This is Paul's own Thai, as of 17/08/2026.** He read all four strings on the
 * generated review sheet, rewrote two and left two. `scripts/lib/provenance.ts`
 * reads this claim and `npm run audit:thai` files the module on the strength of
 * it, so it is a statement about who wrote the words and never an inference from
 * how good they look.
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
  en: "Whatever you want to ask about, the services, your result, or your data, just write. We read every message.",
  // Paul's wording, 17/08/2026. `ไม่ว่าจะ` turns a list of three permitted
  // subjects into an invitation that covers all of them, and drops the two
  // repeated `เรื่อง`.
  th: "ไม่ว่าจะมีคำถามเรื่องบริการ ผลประเมิน หรือข้อมูลของคุณ ทักมาได้เลย เราอ่านทุกข้อความ",
};

/**
 * Which channel suits what, in one line rather than in two cards. The
 * distinction is real and worth keeping: LINE is faster, email holds an
 * attachment.
 */
export const CONTACT_CHANNELS: Copy = {
  en: "We usually reply faster on Line. Email suits anything detailed, or when you want to attach a CV.",
  // Paul's wording, 17/08/2026. `ปกติเราตอบ` puts us in the sentence: it
  // was the channel that was fast, and now it is us being faster on it,
  // which is a thing we can be held to.
  //
  // **He wrote `LINE` and this says `Line`**, which is the one departure
  // from his text. `channel-line` in `termbase.yml` is `fixed: true` with
  // `LINE` explicitly banned, so the capitalisation is a decided term
  // rather than a preference and `lint-thai` fails the build on it. If the
  // decision should change, it changes in the termbase and everywhere at
  // once.
  th: "ปกติเราตอบทาง LINE ได้เร็วกว่า ส่วนอีเมลเหมาะกับคำถามที่มีรายละเอียดเยอะหรือเมื่อต้องการแนบ CV มาด้วย",
};

/** For the person who already left their details and is about to do it twice. */
export const CONTACT_ALREADY_IN_QUEUE: Copy = {
  en: "If you have already taken the check and left your details, you are in the queue. No need to write as well.",
  th: "ถ้าคุณทำแบบประเมินและฝากช่องทางติดต่อไว้แล้ว คุณอยู่ในคิวเรียบร้อย ไม่ต้องส่งข้อความมาซ้ำ",
};
