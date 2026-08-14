"use client";

/**
 * How to reach PunProfile. TASK-088, stripped back 14/08/2026.
 *
 * The page is a heading, a line of context, two buttons and a footnote. That is
 * the whole thing.
 *
 * It had three cards under the buttons, one per channel, each repeating a
 * destination the buttons already offered. Written down like that it is
 * obviously wrong: a contact page whose primary action is "get in touch" does
 * not need a second copy of every way to get in touch directly beneath it. The
 * cards were describing the channels rather than opening them, and describing a
 * channel is only useful when there are enough of them to need choosing
 * between. There are two.
 *
 * **The EU Fit Check is not on this page.** Someone who navigated to Contact
 * has decided to make contact, and answering them with a questionnaire answers
 * a question they did not ask. Rule 3 of the framework in
 * `src/lib/content/cta.ts`.
 *
 * **Email and LINE are one action, not two** (rule 2). Both cost the reader the
 * same thing, so they are routes rather than a fork. LINE carries its own green
 * and mark under rule 5's one exception, because a Thai reader finds that green
 * faster than they read either label.
 *
 * **The booking link is deliberately absent.** `00_Quick_Facts.md` marks
 * `calendly.com/paul-bussabong/30min` "Gated, not public. It is sent 1:1 only".
 * A contact page is about as public as a link gets. TASK-046.
 *
 * The Facebook group went with the cards. It has no URL on record anywhere in
 * the coaching repo, so it was rendering as unclickable text: a channel that
 * cannot be opened is not a channel, and this page is only for channels.
 */

import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";

export default function ContactPage() {
  const { locale } = useCopy();
  const th = locale === "th";

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-h2">{th ? "ติดต่อเรา" : "Contact"}</h1>
      <p className="mt-4 text-body-lg text-slate">
        {th
          ? "มีคำถามเรื่องบริการ เรื่องผลประเมิน หรือเรื่องข้อมูลของคุณ ทักมาได้เลย เราอ่านทุกข้อความ"
          : "Questions about the services, about your result, or about your own data. Write to us, we read everything."}
      </p>

      <CallToAction page="/contact" className="mt-8" />

      {/* Which channel suits what, in one line rather than in two cards. The
          distinction is real and worth keeping: LINE is faster, email holds an
          attachment. */}
      <p className="mt-5 text-caption text-neutral-500">
        {th
          ? "LINE มักได้คำตอบเร็วกว่า ส่วนอีเมลเหมาะกับคำถามที่มีรายละเอียดเยอะ หรือถ้าคุณอยากแนบ CV มาด้วย"
          : "LINE is usually the faster reply. Email is better for anything detailed, or if you want to attach a CV."}
      </p>

      <p className="mt-10 text-caption text-neutral-500">
        {th
          ? "ถ้าคุณทำแบบประเมินและฝากช่องทางติดต่อไว้แล้ว คุณอยู่ในคิวเรียบร้อย ไม่ต้องส่งข้อความมาซ้ำ"
          : "If you have already taken the check and left your details, you are in the queue. No need to write as well."}
      </p>
    </div>
  );
}
