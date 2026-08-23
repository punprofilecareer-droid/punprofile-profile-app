import type { Copy } from "./copy";

/**
 * The FAQ. TASK-087, rewritten 14/08/2026 from Paul's own Thai.
 *
 * Every answer here is checkable against something that already exists: the
 * privacy notice for anything about data, `self-report-scoring.md` for anything
 * about the chart, `01_Project_Foundation.md` for anything about the services.
 * That constraint is the point of the page. An FAQ is where a brand quietly
 * starts making claims nobody reviewed, because each answer looks too small to
 * need checking, and a hundred small unreviewed claims is a bigger liability
 * than one long page that went through legal.
 *
 * So: no timelines we have not committed to, no success rates, no "most of our
 * clients", and no price. The cost question is answered by saying where it gets
 * answered, which is true and stays true when the pilot pricing settles.
 *
 * The voice is first person singular, matching the coaching page: this is one
 * person answering, not a company. Paul's Thai is the source and the English is
 * a translation of it.
 */
export interface FaqItem {
  q: Copy;
  /** Paragraphs, in order. */
  a: Copy[];
  /** Renders an inline link at the end of the answer. */
  link?: { href: string; label: Copy };
}

export const FAQ_HEADING: Copy = {
  en: "Frequently asked questions",
  th: "คำถามที่พบบ่อย",
};

export const FAQ_INTRO: Copy = {
  en: "If you cannot find the answer you are looking for, message me and ask.",
  th: "ถ้ายังไม่เจอคำตอบที่ต้องการ ทักมาถามผมได้เลย",
};

export const FAQ_CLOSE: Copy = {
  en: "Not taken the EU Fit Check yet? A lot of the answers above are much easier to understand once you have seen your own result.",
  th: "ยังไม่ได้ทำ EU Fit Check ใช่ไหม คำตอบหลายข้อด้านบนจะเข้าใจง่ายขึ้นมากเมื่อคุณได้เห็นผลของตัวเอง",
};

export const FAQ: readonly FaqItem[] = [
  {
    q: { en: "What is the EU Fit Check?", th: "EU Fit Check คืออะไร" },
    a: [
      {
        en: "The EU Fit Check is a short assessment about your work experience, your English level, your target countries, and where you are right now on the road to working in Europe.",
        th: "EU Fit Check เป็นแบบประเมินสั้น ๆ เกี่ยวกับประสบการณ์ทำงาน ระดับภาษาอังกฤษ ประเทศเป้าหมาย และตอนนี้คุณอยู่ขั้นไหนบนเส้นทางไปทำงานในยุโรป",
      },
      {
        en: "It takes about two minutes. As soon as you finish, you see your first read and your own chart straight away.",
        th: "ใช้เวลาประมาณ 2 นาที พอทำเสร็จ คุณจะเห็นผลเบื้องต้นและกราฟของตัวเองทันที",
      },
    ],
  },
  {
    q: { en: "Does it cost anything?", th: "มีค่าใช้จ่ายไหม" },
    a: [
      {
        en: "No. The EU Fit Check is free, and there is no payment step in it.",
        th: "ไม่มีค่าใช้จ่าย คุณทำ EU Fit Check ได้ฟรี และไม่มีขั้นตอนการชำระเงิน",
      },
    ],
  },
  {
    q: { en: "Why are parts of my chart empty?", th: "ทำไมกราฟบางส่วนถึงว่างอยู่" },
    a: [
      {
        en: "Because we do not guess a score for something a form cannot measure.",
        th: "เพราะเราไม่เดาคะแนนในเรื่องที่แบบฟอร์มวัดไม่ได้",
      },
      {
        en: "The framework behind the EU Fit Check has thirty-four assessed items in total, but only five can be assessed reliably from your answers. The rest need someone to read your actual CV, or to talk to you first.",
        th: "กรอบเบื้องหลัง EU Fit Check มีหัวข้อประเมินทั้งหมด 34 ข้อ แต่มีเพียง 5 ข้อที่ประเมินจากคำตอบของคุณได้อย่างน่าเชื่อถือ ส่วนที่เหลือต้องมีคนอ่าน CV ตัวจริงของคุณหรือพูดคุยกับคุณก่อน",
      },
      {
        en: "So a hollow marker means “not assessed yet”. It does not mean a score of zero.",
        th: "จุดวงกลมโปร่งจึงหมายถึง “ยังไม่ได้ประเมิน” ไม่ใช่คะแนนศูนย์",
      },
    ],
  },
  {
    q: { en: "How accurate is the result?", th: "ผลที่ได้แม่นยำแค่ไหน" },
    a: [
      {
        en: "This first read is based on the answers you gave yourself, so it is exactly as accurate as the information you put in. We say so clearly on the result screen.",
        th: "ผลเบื้องต้นอ้างอิงจากคำตอบที่คุณให้เอง ความแม่นยำจึงขึ้นอยู่กับข้อมูลที่คุณกรอก เราระบุเรื่องนี้ไว้อย่างชัดเจนบนหน้าผลลัพธ์",
      },
      {
        en: "It is meant as a starting point for a conversation, not a verdict on whether you are good at your job.",
        th: "ผลนี้มีไว้เป็นจุดเริ่มต้นสำหรับการพูดคุย ไม่ใช่คำตัดสินว่าคุณเก่งหรือไม่เก่ง",
      },
    ],
  },
  {
    q: {
      en: "What happens after I finish the assessment?",
      th: "ทำแบบประเมินเสร็จแล้วจะเกิดอะไรขึ้น",
    },
    a: [
      {
        en: "A person actually reads your answers. The system does not decide on its own who gets contacted back.",
        th: "จะมีคนอ่านคำตอบของคุณจริง ๆ ระบบไม่ได้เป็นผู้ตัดสินเพียงลำพังว่าเราจะติดต่อใครกลับ",
      },
      {
        en: "There are a lot of enquiries at the moment, so there may be a wait. If you do not hear back straight away, it does not mean your result was poor or that you did not qualify.",
        th: "ช่วงนี้มีคนติดต่อเข้ามาค่อนข้างมาก จึงอาจต้องรอสักหน่อย หากยังไม่ได้รับการติดต่อกลับทันที ไม่ได้หมายความว่าผลของคุณไม่ดีหรือไม่ผ่าน",
      },
    ],
  },
  {
    q: {
      en: "Do you find me a job, or guarantee that I will get one?",
      th: "คุณหางานให้หรือรับประกันว่าจะได้งานไหม",
    },
    a: [
      {
        en: "No. And nobody can honestly guarantee a job or a visa.",
        th: "ไม่ครับ และไม่มีใครรับประกันว่าจะได้งานหรือวีซ่าได้อย่างซื่อสัตย์",
      },
      {
        en: "PunProfile provides career coaching, not recruitment. We are paid by you, not by an employer, so there is no quota and no vacancy anyone has to push you into applying for.",
        th: "PunProfile ให้บริการแคเรียร์โค้ชชิ่ง ไม่ใช่บริษัทจัดหางาน เรารับค่าบริการจากคุณ ไม่ใช่นายจ้าง จึงไม่มีโควตาหรือตำแหน่งที่ต้องผลักให้คุณสมัคร",
      },
      {
        en: "What we do is help you decide which direction to head in, build a profile that makes people want to keep reading, and work through each application with you.",
        th: "สิ่งที่เราทำคือช่วยให้คุณตัดสินใจได้ว่าควรมุ่งไปทางไหน สร้างโปรไฟล์ที่ทำให้คนอยากอ่านต่อ และลงมือสมัครแต่ละตำแหน่งไปพร้อมกับคุณ",
      },
    ],
    link: {
      href: "/coaching",
      label: { en: "See what PunProfile does", th: "ดูบริการของ PunProfile" },
    },
  },
  {
    // Paul's rewrite, 23/08/2026, from the pricing review sheet. Applied here
    // too so one question is not answered two ways on two pages.
    q: { en: "What does Career Coaching cost?", th: "บริการ Career Coaching ราคาเท่าไร" },
    a: [
      {
        en: "It depends what you want help with and how far that help goes. We go through the details and tell you the cost clearly the first time we talk, and then you decide whether to go ahead.",
        th: "ค่าบริการขึ้นอยู่กับเรื่องที่คุณอยากให้เราช่วยและขอบเขตความช่วยเหลือที่ต้องการ เราจะคุยรายละเอียดพร้อมแจ้งค่าใช้จ่ายให้ชัดเจนตั้งแต่ครั้งแรก แล้วคุณค่อยตัดสินใจว่าจะใช้บริการหรือไม่",
      },
      {
        en: "Both the EU Fit Check and that first conversation are free.",
        th: "ทำ EU Fit Check พร้อมดูผลเบื้องต้น และคุยกับเราครั้งแรกได้ฟรี",
      },
    ],
  },
  {
    q: {
      en: "My English is not strong yet. Can I still do this?",
      th: "ภาษาอังกฤษยังไม่แข็งแรง ทำได้ไหม",
    },
    a: [
      {
        en: "Yes. The assessment is in Thai, and language is one of the things we assess rather than a condition for starting.",
        th: "ได้ แบบประเมินเป็นภาษาไทย และเรื่องภาษาเป็นหนึ่งในหัวข้อที่เราประเมิน ไม่ใช่เงื่อนไขในการเริ่มทำ",
      },
      {
        en: "Speaking plainly: European employers outside the multinationals usually expect at least B2, in English or in the local language. Knowing how far you are from that right now is more useful than not knowing at all.",
        th: "พูดกันตรง ๆ หลายตำแหน่งในยุโรปต้องการภาษาอังกฤษหรือภาษาท้องถิ่นอย่างน้อยระดับ B2 การรู้ว่าตอนนี้คุณห่างจากจุดนั้นแค่ไหน มีประโยชน์กว่าการไม่รู้เลย",
      },
    ],
  },
  {
    q: { en: "Can I change an answer, or take it again?", th: "แก้คำตอบหรือทำใหม่ได้ไหม" },
    a: [
      {
        en: "Yes. You can go back and change an answer at any point, even once you have reached the result screen, and the chart updates to your new answers straight away.",
        th: "ได้ คุณย้อนกลับไปแก้คำตอบได้ตลอด แม้จะมาถึงหน้าผลลัพธ์แล้วก็ตาม กราฟจะอัปเดตตามคำตอบใหม่ให้ทันที",
      },
      {
        en: "The assessment does not save your previous session on your device. So opening it again starts a new round rather than continuing the old one.",
        th: "แบบประเมินไม่ได้บันทึกรอบเดิมไว้บนอุปกรณ์ของคุณ หากเปิดแบบประเมินใหม่ จึงเท่ากับเริ่มทำรอบใหม่ ไม่ใช่ทำต่อจากรอบเดิม",
      },
    ],
  },
  {
    q: { en: "What happens to my information?", th: "ข้อมูลของฉันจะถูกนำไปทำอะไร" },
    a: [
      {
        en: "We use your information to prepare your result and to contact you back through the channels you consented to, and nothing else.",
        th: "เราใช้ข้อมูลของคุณเพื่อจัดทำผลประเมินและติดต่อกลับผ่านช่องทางที่คุณยินยอมไว้เท่านั้น",
      },
      {
        en: "We do not sell your information or pass it to anyone else. It is kept for twelve months from the last time we were in contact, and you can ask us to delete it sooner at any point.",
        th: "เราไม่ขายหรือส่งต่อข้อมูลให้บุคคลอื่น ข้อมูลจะถูกเก็บไว้ 12 เดือนนับจากวันที่เราติดต่อกันครั้งล่าสุด และคุณขอให้ลบก่อนกำหนดได้ทุกเมื่อ",
      },
    ],
    link: {
      href: "/privacy",
      label: { en: "Read the privacy policy", th: "อ่านนโยบายความเป็นส่วนตัว" },
    },
  },
];
