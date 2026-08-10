/**
 * The privacy notice, Thai-first. Resolves `[Privacy Notice TODO]` in
 * `consent-copy.ts`.
 *
 * **Not reviewed. `PRIVACY_REVIEWED` is false and the page renders a visible
 * draft banner while it stays false.** Same gate as the consent copy, same
 * reason: TASK-047 is a legal checkpoint and an LLM's paraphrase of the PDPA is
 * not a legal instrument. The banner exists so this cannot quietly start
 * reading as a real notice just because the route works.
 *
 * What IS reliable here is the factual half. Every claim about what the system
 * collects, where it stores it, who processes it and what leaves Thailand was
 * taken from `data-inventory.md`, which was written by reading the schema, the
 * Sentry scrubber and the import scripts. The reviewer's job is the framing:
 * lawful basis, rights language, whether the cross-border disclosure is
 * sufficient. Not the facts.
 *
 * Two statements in here are commitments rather than descriptions, and both are
 * flagged at their section:
 *
 * - **Twelve-month retention is not implemented.** No job deletes anything. The
 *   figure matches `consent.purpose`, which is the existing commitment, and it
 *   stays a promise until the retention job is built.
 * - **The withdrawal contact is still a placeholder.** Inventory § 9 question 6
 *   asks what it should be and who monitors it. Inventing an address here would
 *   be worse than an obvious gap, because a notice that names an unmonitored
 *   inbox is a rights mechanism that silently fails.
 *
 * Structured as sections rather than flat keys because it is long-form prose,
 * and a `privacy.section4.para2` key space would be unreadable in the worksheet
 * for no gain. It flows through the same `{ en, th }` shape as everything else.
 */

import type { Copy } from "./copy";

/** Flipped to true only after TASK-047 clears, and not by an agent. */
export const PRIVACY_REVIEWED = false;

/** Last substantive change to the text, DD/MM/YYYY. Shown to the reader. */
export const PRIVACY_LAST_UPDATED = "10/08/2026";

export interface PrivacySection {
  heading: Copy;
  /** Paragraphs. A leading "- " marks a list item at render. */
  body: Copy[];
}

export const PRIVACY_INTRO: Copy = {
  en: "This notice explains what PunProfile collects when you use the EU Fit Check, why we hold it, and what you can ask us to do with it.",
  th: "ประกาศนี้อธิบายว่า PunProfile เก็บข้อมูลอะไรบ้างเมื่อคุณใช้ EU Fit Check เก็บไว้เพื่ออะไร และคุณขอให้เราทำอะไรกับข้อมูลนั้นได้บ้าง",
};

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    heading: {
      en: "Who holds your data",
      th: "ใครเป็นผู้เก็บข้อมูลของคุณ",
    },
    body: [
      {
        en: "PunProfile Career Coaching. One person has access to it: the account holder who runs the coaching practice. There is no team, and no one else can sign in.",
        th: "PunProfile Career Coaching มีเพียงคนเดียวที่เข้าถึงข้อมูลได้ คือเจ้าของบัญชีที่ดูแลบริการแนะแนวอาชีพนี้ ไม่มีทีมงานอื่น และไม่มีใครอื่นเข้าสู่ระบบได้",
      },
    ],
  },
  {
    heading: {
      en: "What we collect",
      th: "เราเก็บข้อมูลอะไรบ้าง",
    },
    body: [
      {
        en: "Your answers to the nine assessment questions: your route to Europe, target countries, target role, CV and LinkedIn status, visa and right-to-work status, English level, job-search stage, and desired timeline. Every one is a fixed choice you tap. The assessment collects no free text anywhere.",
        th: "คำตอบของคุณในคำถามประเมินทั้งเก้าข้อ ได้แก่ เส้นทางไปยุโรป ประเทศเป้าหมาย ตำแหน่งงานเป้าหมาย สถานะ CV และ LinkedIn สถานะวีซ่าและสิทธิในการทำงาน ระดับภาษาอังกฤษ ขั้นตอนการหางาน และกรอบเวลาที่ต้องการ ทุกข้อเป็นตัวเลือกที่กำหนดไว้ให้เลือก แบบประเมินนี้ไม่มีการเก็บข้อความที่พิมพ์เองในส่วนใดเลย",
      },
      {
        en: "Your contact details at the final step: first name, last name, email address, and a LINE ID or phone number.",
        th: "ข้อมูลติดต่อของคุณในขั้นตอนสุดท้าย ได้แก่ ชื่อ นามสกุล อีเมล และ LINE ID หรือหมายเลขโทรศัพท์",
      },
      {
        en: "One of those questions asks about your visa and right-to-work status, which says something about your immigration position. We hold it because it changes what advice is honest, and for no other reason.",
        th: "หนึ่งในคำถามเหล่านั้นถามถึงสถานะวีซ่าและสิทธิในการทำงานของคุณ ซึ่งบ่งบอกถึงสถานะทางการเข้าเมืองของคุณ เราเก็บข้อมูลนี้เพราะมันเปลี่ยนคำแนะนำที่เราจะให้ได้อย่างตรงไปตรงมา และไม่มีเหตุผลอื่นนอกจากนี้",
      },
    ],
  },
  {
    heading: {
      en: "What we work out from it",
      th: "เราประมวลผลอะไรจากข้อมูลนั้น",
    },
    body: [
      {
        en: "From your answers we calculate four readiness scores and select a recommended next step. You did not provide these; the system computed them, and they are yours to ask about.",
        th: "จากคำตอบของคุณ เราคำนวณคะแนนความพร้อมสี่ด้านและเลือกขั้นตอนถัดไปที่แนะนำ ข้อมูลส่วนนี้คุณไม่ได้ให้ไว้ แต่ระบบคำนวณขึ้นมา และคุณมีสิทธิสอบถามเกี่ยวกับข้อมูลนี้ได้",
      },
      {
        en: "We also form an internal judgement about whether PunProfile is the right fit to work with you. It is used to decide who we follow up with. It is not shown to you and it is not stored.",
        th: "นอกจากนี้เรายังประเมินภายในว่า PunProfile เหมาะที่จะทำงานร่วมกับคุณหรือไม่ ใช้เพื่อพิจารณาว่าจะติดต่อกลับหาใคร ข้อมูลนี้ไม่ได้แสดงให้คุณเห็นและไม่ได้ถูกจัดเก็บไว้",
      },
      {
        en: "No decision here is fully automated. A person reads your record before anyone contacts you.",
        th: "ไม่มีการตัดสินใจใดในขั้นตอนนี้ที่เป็นระบบอัตโนมัติทั้งหมด จะมีคนอ่านข้อมูลของคุณก่อนที่จะมีการติดต่อไป",
      },
    ],
  },
  {
    heading: {
      en: "Why we hold it",
      th: "เหตุใดเราจึงเก็บข้อมูลนี้",
    },
    body: [
      {
        en: "To produce your assessment result and send it to you, and, if you gave consent for that channel, to contact you about career coaching. We do not use it for anything else, and we do not sell it.",
        th: "เพื่อจัดทำผลการประเมินและส่งให้คุณ และหากคุณให้ความยินยอมสำหรับช่องทางนั้น เพื่อติดต่อคุณเกี่ยวกับบริการแนะแนวอาชีพ เราไม่นำไปใช้เพื่อการอื่นและไม่ขายข้อมูลของคุณ",
      },
      {
        en: "Each contact channel is consented to separately, and each consent is recorded with the date and time you gave it. A phone number with no consent beside it is one we will not call.",
        th: "แต่ละช่องทางติดต่อต้องให้ความยินยอมแยกกัน และความยินยอมแต่ละรายการจะถูกบันทึกพร้อมวันและเวลาที่คุณให้ไว้ หมายเลขโทรศัพท์ที่ไม่มีการให้ความยินยอมกำกับไว้ คือหมายเลขที่เราจะไม่โทรหา",
      },
    ],
  },
  {
    heading: {
      en: "Where it is stored, and where it goes",
      th: "ข้อมูลถูกเก็บที่ใด และส่งต่อไปที่ใด",
    },
    body: [
      {
        en: "Your data is stored on servers in Ireland, operated by our database provider Convex. This means information you give us in Thailand is transferred out of Thailand and held in the European Union.",
        th: "ข้อมูลของคุณถูกจัดเก็บบนเซิร์ฟเวอร์ในประเทศไอร์แลนด์ ซึ่งดำเนินการโดย Convex ผู้ให้บริการฐานข้อมูลของเรา หมายความว่าข้อมูลที่คุณให้เราในประเทศไทยจะถูกโอนออกนอกประเทศไทยและจัดเก็บไว้ในสหภาพยุโรป",
      },
      {
        en: "- Convex, our database. Holds everything described above.",
        th: "- Convex ฐานข้อมูลของเรา จัดเก็บข้อมูลทั้งหมดที่อธิบายไว้ข้างต้น",
      },
      {
        en: "- Vercel, our hosting. Handles the web traffic. Stores none of your answers.",
        th: "- Vercel ผู้ให้บริการโฮสติ้งของเรา ดูแลการรับส่งข้อมูลของเว็บไซต์ ไม่ได้จัดเก็บคำตอบของคุณ",
      },
      {
        en: "- Sentry, our error reporting, on its European servers. Receives technical error reports only. Your name, contact details and answers are stripped out before anything is sent.",
        th: "- Sentry ระบบรายงานข้อผิดพลาดของเรา ใช้เซิร์ฟเวอร์ในยุโรป รับเฉพาะรายงานข้อผิดพลาดทางเทคนิคเท่านั้น ชื่อ ข้อมูลติดต่อ และคำตอบของคุณจะถูกตัดออกก่อนส่งทุกครั้ง",
      },
      {
        en: "These are service providers processing data on our behalf, not parties we share your information with. No one else receives it.",
        th: "ทั้งหมดนี้คือผู้ให้บริการที่ประมวลผลข้อมูลในนามของเรา ไม่ใช่บุคคลที่เราเปิดเผยข้อมูลของคุณให้ ไม่มีผู้อื่นได้รับข้อมูลนี้",
      },
    ],
  },
  {
    heading: {
      en: "What is stored on your device",
      th: "ข้อมูลที่จัดเก็บบนอุปกรณ์ของคุณ",
    },
    body: [
      {
        en: "Nothing that identifies you. We store no session identifier and no tracking cookie, and every visit starts fresh. The only thing we keep on your device is your language choice, Thai or English, which cannot be linked back to you or to your answers.",
        th: "ไม่มีข้อมูลใดที่ระบุตัวตนของคุณ เราไม่จัดเก็บรหัสเซสชันและไม่มีคุกกี้ติดตาม การเข้าใช้งานทุกครั้งเริ่มต้นใหม่ทั้งหมด สิ่งเดียวที่เราเก็บไว้บนอุปกรณ์ของคุณคือภาษาที่คุณเลือก ไทยหรืออังกฤษ ซึ่งไม่สามารถเชื่อมโยงกลับมาถึงตัวคุณหรือคำตอบของคุณได้",
      },
    ],
  },
  {
    heading: {
      en: "How long we keep it",
      th: "เราเก็บข้อมูลไว้นานเท่าใด",
    },
    body: [
      {
        en: "Twelve months from the date you submit, unless you ask us to delete it sooner.",
        th: "สิบสองเดือนนับจากวันที่คุณส่งข้อมูล เว้นแต่คุณจะขอให้เราลบก่อนกำหนด",
      },
    ],
  },
  {
    heading: {
      en: "Your rights",
      th: "สิทธิของคุณ",
    },
    body: [
      {
        en: "- Ask for a copy of everything we hold about you. We will send you a readable copy, including the scores the system worked out from your answers.",
        th: "- ขอสำเนาข้อมูลทั้งหมดที่เรามีเกี่ยวกับคุณ เราจะส่งสำเนาที่อ่านเข้าใจได้ให้คุณ รวมถึงคะแนนที่ระบบคำนวณจากคำตอบของคุณ",
      },
      {
        en: "- Ask us to correct anything that is wrong.",
        th: "- ขอให้เราแก้ไขข้อมูลที่ไม่ถูกต้อง",
      },
      {
        en: "- Ask us to delete you entirely. This removes your record, your answers and any link we sent you. It cannot be undone and there is no backup to restore from.",
        th: "- ขอให้เราลบข้อมูลของคุณทั้งหมด การดำเนินการนี้จะลบระเบียนข้อมูล คำตอบ และลิงก์ใด ๆ ที่เราเคยส่งให้คุณ ไม่สามารถย้อนกลับได้และไม่มีข้อมูลสำรองให้กู้คืน",
      },
      {
        en: "- Withdraw your consent for any contact channel at any time. Withdrawing it stops future contact on that channel; it does not undo contact already made.",
        th: "- ถอนความยินยอมสำหรับช่องทางติดต่อใดก็ได้ทุกเมื่อ การถอนความยินยอมจะหยุดการติดต่อในช่องทางนั้นในอนาคต แต่ไม่ได้ย้อนกลับการติดต่อที่เกิดขึ้นไปแล้ว",
      },
      {
        en: "- Object to how we assess you, or complain to Thailand's Personal Data Protection Committee.",
        th: "- คัดค้านวิธีที่เราประเมินคุณ หรือร้องเรียนต่อคณะกรรมการคุ้มครองข้อมูลส่วนบุคคลของประเทศไทย",
      },
      {
        en: "To exercise any of these, contact us using the details below. We may ask you to confirm something only the person in the record would know, because we have no way to log you in and we will not hand your data to someone claiming to be you.",
        th: "หากต้องการใช้สิทธิเหล่านี้ โปรดติดต่อเราตามรายละเอียดด้านล่าง เราอาจขอให้คุณยืนยันบางอย่างที่เฉพาะเจ้าของข้อมูลเท่านั้นที่ทราบ เนื่องจากเราไม่มีระบบให้คุณเข้าสู่ระบบ และเราจะไม่ส่งมอบข้อมูลของคุณให้ผู้ที่อ้างว่าเป็นคุณ",
      },
    ],
  },
  {
    heading: {
      en: "Contact us",
      th: "ติดต่อเรา",
    },
    body: [
      {
        en: "[Contact method TODO]",
        th: "[ช่องทางติดต่อ TODO]",
      },
    ],
  },
];
