import type { Copy } from "./copy";

/**
 * The 1-1 coaching page. TASK-089, rewritten 14/08/2026 from Paul's own Thai.
 *
 * The structure came from a competitor's landing page (Careersu, ANZ tech
 * coaching), whose insight is that the founder section is not a page but the
 * LAST section of a sales page, reached by a reader already persuaded. The
 * words are now Paul's, supplied in Thai; the English is a translation of his
 * Thai rather than the reverse, which is the right direction for a Thai-first
 * product.
 *
 * Order: name the mechanism the reader is losing to, show they are not alone in
 * it, show the machine, say who it is and is not for, then say who is behind it.
 *
 * The founder section carried a `COACHING_REVIEWED` draft gate until Paul
 * supplied his own words on 14/08/2026. The gate and its banner are gone rather
 * than left switched on: a flag nothing reads is a flag that will be wrong one
 * day without anyone noticing. It existed because no biography lived anywhere
 * in the coaching repo to build one from, and inventing it was the one thing
 * that would have made every other honest claim on this site worthless.
 *
 * **The proof numbers are never written here.** Every figure on this page comes
 * from `convex/stats.ts` at render, each one disappears on its own if its
 * sample is too thin, and none is hard-coded. That is the only reason a page
 * whose competitor fills these slots with client logos and placement rates can
 * make a stronger claim than they do: the reader is one of the people counted.
 */

// ------------------------------------------------------------------- the hook

export const HOOK_EYEBROW: Copy = {
  en: "1-1 career coaching for Thai professionals heading to Europe",
  th: "แคเรียร์โค้ชชิ่งแบบตัวต่อตัว สำหรับคนไทยที่มุ่งสู่ยุโรป",
};

/**
 * Two lines, the second in Teal.
 *
 * `design.md` reserves Terracotta for the single primary action on a screen so
 * it keeps its persuasive weight, and a headline in the button colour spends
 * exactly that. Teal is the colour the brand is known by and carries emphasis
 * everywhere that is not a button.
 */
export const HOOK_LINE_1: Copy = {
  en: "It is rarely that your experience is not enough.",
  th: "ปัญหามักไม่ใช่ว่าคุณมีประสบการณ์ไม่พอ",
};

export const HOOK_LINE_2: Copy = {
  en: "It is that nobody in Europe can see what that experience is worth.",
  th: "แต่คือคนในยุโรปยังไม่เห็นว่าประสบการณ์นั้นมีค่าอย่างไร",
};

export const HOOK_BODY: readonly Copy[] = [
  {
    en: "A hiring manager in Amsterdam opens your CV. They do not know your last company, they cannot tell how big the job you were responsible for actually was, and the visa question has no answer yet. They are not deciding that you are not good. They simply have not been given enough reason to keep reading.",
    th: "ผู้จัดการฝ่ายสรรหาในอัมสเตอร์ดัมเปิด CV ของคุณขึ้นมา เขาไม่รู้จักบริษัทเดิมของคุณ ไม่รู้ว่างานล่าสุดที่คุณรับผิดชอบมีขนาดแค่ไหน และยังไม่มีคำตอบเรื่องวีซ่า เขาไม่ได้ตัดสินว่าคุณไม่เก่ง เพียงแต่ยังไม่เห็นเหตุผลมากพอที่จะอ่านต่อ",
  },
  {
    en: "The problem is getting your experience across to another market, not your ability, and sending more applications does not solve it.",
    th: "ปัญหาอยู่ที่การถ่ายทอดประสบการณ์ให้คนอีกตลาดเข้าใจ ไม่ใช่ความสามารถของคุณ และการส่งใบสมัครให้มากขึ้นก็แก้ปัญหานี้ไม่ได้",
  },
];

export const HOOK_CTA_SUB: Copy = {
  en: "The three ways of working together, and what each one does for you.",
  th: "ดูรูปแบบการทำงานทั้งสามแบบ และแต่ละแบบช่วยอะไรคุณบ้าง",
};

// --------------------------------------------------------- does this sound like you

export const PAIN_HEADING: Copy = {
  en: "Does any of this sound like you?",
  th: "มีข้อไหนที่ฟังดูเหมือนคุณบ้าง",
};

export const PAINS: readonly Copy[] = [
  {
    en: "You have sent applications to Europe several times and heard nothing back from anyone.",
    th: "ส่งใบสมัครไปยุโรปหลายครั้ง แต่เงียบ ไม่มีใครตอบกลับมาเลย",
  },
  {
    en: "You know you are good at your job in Thailand, but you have no idea what the same experience is worth in Berlin or Rotterdam.",
    th: "คุณรู้ว่าตัวเองทำงานเก่งในไทย แต่ไม่รู้ว่าประสบการณ์แบบเดียวกันมีค่าแค่ไหนในเบอร์ลินหรือรอตเทอร์ดาม",
  },
  {
    en: "Most advice on the internet is written for people who already have the right to work in the EU.",
    th: "คำแนะนำบนอินเทอร์เน็ตส่วนใหญ่เขียนมาสำหรับคนที่มีสิทธิ์ทำงานใน EU อยู่แล้ว",
  },
  {
    en: "You have revised your CV several times and still cannot say which version is genuinely better.",
    th: "แก้ CV มาหลายรอบ แต่ยังบอกไม่ได้ว่าเวอร์ชันไหนดีกว่ากันจริง",
  },
  {
    en: "You are not sure whether the visa is a real obstacle or an excuse you are using to hold yourself back.",
    th: "ไม่แน่ใจว่าวีซ่าเป็นอุปสรรคจริง ๆ หรือเป็นข้ออ้างที่คุณใช้รั้งตัวเองไว้",
  },
  {
    en: "If you could move tomorrow you would go, but you still cannot say which country, or which role.",
    th: "ถ้าย้ายได้พรุ่งนี้ คุณก็พร้อมไป แต่ยังตอบไม่ได้ว่าจะไปประเทศไหนหรือสมัครตำแหน่งอะไร",
  },
];

// --------------------------------------------------------------- the proof panel

export const PROOF_HEADING: Copy = {
  en: "It is not that people are not trying.",
  th: "ปัญหาไม่ใช่ว่าพวกเขาพยายามไม่พอ",
};

export interface ProofLine {
  /** Key in the `shares` object returned by `stats.community`. */
  share: string;
  label: Copy;
}

export const PROOF_LINES: readonly ProofLine[] = [
  {
    // "Started" rather than "five or more", 14/08/2026. See the note on
    // `appliedAny` in `convex/stats.ts`: the volume figure came out at 22% and
    // argued against the heading above it. The claim this panel is making is
    // that these people are already in motion, which is what this measures.
    share: "appliedAny",
    label: {
      en: "have already started applying to roles in Europe",
      th: "เริ่มสมัครงานในยุโรปไปแล้ว",
    },
  },
  {
    share: "englishB2",
    label: {
      en: "already have English at the level European job adverts ask for",
      th: "มีภาษาอังกฤษถึงระดับที่ประกาศงานในยุโรปเรียกหาอยู่แล้ว",
    },
  },
  {
    share: "cvNotForEurope",
    label: {
      en: "are still applying with a CV that was never adapted to the European market",
      th: "ยังสมัครงานด้วย CV ที่ไม่เคยปรับให้เข้ากับตลาดยุโรป",
    },
  },
];

export const PROOF_FOOT: Copy = {
  // No sample size. See the note on the return value in `convex/stats.ts`: how
  // many people have taken the check is PunProfile's own information, so the
  // footnote says who was counted and not how many.
  en: "From people who have taken the EU Fit Check, calculated from those who answered each question. The figures update as more people take it.",
  th: "ข้อมูลจากผู้ทำ EU Fit Check โดยคำนวณจากผู้ที่ตอบคำถามข้อนั้น ๆ ตัวเลขจะอัปเดตเมื่อมีผู้ทำแบบประเมินเพิ่มขึ้น",
};

export const PROOF_CONCLUSION: Copy = {
  en: "So the gap is not effort, and it is not English. It is getting experience from the Thai market across to a European employer. That takes specific expertise, and it is the work I do.",
  th: "ช่องว่างจึงไม่ได้อยู่ที่ความพยายามหรือภาษาอังกฤษ แต่อยู่ที่การถ่ายทอดประสบการณ์จากตลาดไทยให้นายจ้างยุโรปเข้าใจ งานนี้ต้องใช้ความเชี่ยวชาญเฉพาะ และนี่คืองานที่ผมทำ",
};

// ------------------------------------------------------------------ the machine

export const METHOD_HEADING: Copy = {
  en: "Before I give you advice, I show you what the assessment is based on.",
  th: "ก่อนให้คำแนะนำ ผมจะให้คุณเห็นก่อนว่าเราประเมินจากอะไร",
};

export const METHOD_INTRO: Copy = {
  en: "Advice whose source you cannot check is no different from one person's opinion delivered confidently. So I am opening up the whole framework behind it, including its limits and the things it cannot assess.",
  th: "คำแนะนำที่ตรวจสอบที่มาไม่ได้ก็ไม่ต่างจากความเห็นของใครสักคนที่พูดอย่างมั่นใจ ผมจึงเปิดกรอบการประเมินที่อยู่เบื้องหลังทั้งหมด รวมถึงข้อจำกัดและสิ่งที่กรอบนี้ประเมินไม่ได้",
};

export interface MethodStep {
  n: string;
  heading: Copy;
  /** Paragraphs, in order. Two of the four steps need a second one. */
  body: readonly Copy[];
}

export const METHOD: readonly MethodStep[] = [
  {
    n: "01",
    heading: { en: "Thirty-four assessed items", th: "หัวข้อประเมิน 34 ข้อ" },
    body: [
      {
        en: "Hiring decisions in Europe come from a number of factors that can be named and assessed. The framework behind the EU Fit Check divides them into thirty-four items, covering professional capability, readiness to apply, readiness to move country, and fit with the European market you are aiming at.",
        th: "การตัดสินใจจ้างงานในยุโรปเกิดจากหลายปัจจัยที่ระบุและประเมินได้ กรอบเบื้องหลัง EU Fit Check แบ่งออกเป็น 34 ข้อ ครอบคลุมความสามารถทางวิชาชีพ ความพร้อมในการสมัครงาน ความพร้อมในการย้ายประเทศ และความเหมาะสมกับตลาดยุโรปที่คุณตั้งเป้าไว้",
      },
    ],
  },
  {
    n: "02",
    heading: { en: "Five a form can really assess", th: "แบบฟอร์มประเมินได้จริง 5 ข้อ" },
    body: [
      {
        en: "Of those thirty-four, only five can be assessed reliably from answers on a form. So we score those five, and show the rest as a hollow circle meaning “not assessed yet”, not a score of zero.",
        th: "ใน 34 ข้อนี้ มีเพียง 5 ข้อที่ประเมินจากคำตอบในแบบฟอร์มได้อย่างน่าเชื่อถือ เราจึงให้คะแนนเฉพาะ 5 ข้อนั้น ส่วนข้อที่เหลือจะแสดงเป็นวงกลมโปร่งเพื่อบอกว่า “ยังไม่ได้ประเมิน” ไม่ใช่คะแนนศูนย์",
      },
      {
        en: "Most tools fill in all thirty-four and then let you plan around numbers nobody can stand behind.",
        th: "เครื่องมือส่วนใหญ่มักใส่คะแนนให้ครบทั้ง 34 ข้อ แล้วให้คุณนำตัวเลขที่ไม่มีใครยืนยันได้ไปวางแผนต่อ",
      },
    ],
  },
  {
    n: "03",
    heading: { en: "A person really reads your answers", th: "มีคนอ่านคำตอบของคุณจริง ๆ" },
    body: [
      {
        en: "Before anyone contacts you, a person actually reads your answers. The things a form cannot answer are what the first conversation is for: the CV you are using, the roles you are applying to, and the reason your last application went unanswered.",
        th: "ก่อนติดต่อกลับ จะมีคนอ่านคำตอบของคุณจริง ๆ ส่วนเรื่องที่แบบฟอร์มตอบไม่ได้ เราจะคุยกันในการสนทนาครั้งแรก ทั้ง CV ที่คุณใช้อยู่ ตำแหน่งที่กำลังสมัคร และเหตุผลที่ใบสมัครล่าสุดไม่ได้รับการตอบกลับ",
      },
    ],
  },
  {
    n: "04",
    heading: {
      en: "Measurable again, so you can see it change",
      th: "วัดซ้ำได้ และเห็นความเปลี่ยนแปลงได้จริง",
    },
    body: [
      {
        en: "We keep your answers as evidence, not just a score, so you can take the assessment again later and compare the charts.",
        th: "เราเก็บคำตอบของคุณไว้เป็นหลักฐาน ไม่ได้เก็บแค่คะแนน คุณจึงทำแบบประเมินซ้ำในภายหลังแล้วนำกราฟมาเทียบกันได้",
      },
      {
        en: "Work you cannot measure means taking it on faith that it is getting better, and in this market you have been asked to take enough on faith without evidence already.",
        th: "งานที่วัดผลไม่ได้ทำให้คุณต้องเชื่อไปก่อนว่ามันดีขึ้น และในตลาดนี้ คุณถูกขอให้เชื่ออะไรโดยไม่มีหลักฐานมามากพอแล้ว",
      },
    ],
  },
];

// -------------------------------------------------------------- who this is for

export const PERSONA_HEADING: Copy = {
  en: "Who this is for",
  th: "บริการนี้เหมาะกับใคร",
};

export const PERSONAS: readonly Copy[] = [
  {
    en: "Working Thai professionals with real experience, in any field, who have never had to explain that experience to a European reader.",
    th: "คนไทยวัยทำงานที่มีประสบการณ์จริง ไม่ว่าจะอยู่สายไหน แต่ยังไม่เคยต้องเล่าประสบการณ์นั้นให้คนยุโรปเข้าใจ",
  },
  {
    en: "People who have applied many times and got silence back instead of a rejection they could learn something from.",
    th: "คนที่สมัครมาหลายครั้ง แต่ได้รับความเงียบกลับมาแทนคำปฏิเสธที่พอจะนำไปปรับปรุงได้",
  },
  {
    en: "People weighing up whether to move at all, who want to decide on real information rather than on the mood of a good week or a bad one.",
    th: "คนที่กำลังชั่งใจว่าจะย้ายดีไหม และอยากตัดสินใจจากข้อมูลจริง ไม่ใช่อารมณ์ของสัปดาห์ที่ดีหรือแย่",
  },
  {
    en: "People planning to move with a partner or children, because this decision has never been only about a job.",
    th: "คนที่วางแผนย้ายพร้อมคู่ครองหรือลูก เพราะการตัดสินใจนี้ไม่เคยมีแค่เรื่องงาน",
  },
];

export const NOT_FOR_HEADING: Copy = {
  en: "And who it is not for",
  th: "และไม่เหมาะกับใคร",
};

export const NOT_FOR: readonly Copy[] = [
  {
    en: "People looking for a recruitment agency. PunProfile is paid by you, not by an employer, so there is no vacancy anyone has to push you towards.",
    th: "คนที่กำลังมองหาบริษัทจัดหางาน PunProfile รับค่าบริการจากคุณ ไม่ใช่นายจ้าง เราจึงไม่มีตำแหน่งที่ต้องพยายามผลักให้คุณสมัคร",
  },
  {
    en: "People who want a guarantee of a job or a visa. Nobody can guarantee that honestly, and anyone who makes you feel they can is selling you something else.",
    th: "คนที่ต้องการคำรับประกันว่าจะได้งานหรือวีซ่า ไม่มีใครรับประกันเรื่องนี้ได้อย่างซื่อสัตย์ และคนที่ทำให้คุณรู้สึกว่ารับประกันได้ก็กำลังขายสิ่งอื่นให้คุณ",
  },
  {
    en: "People who want it all done for them. The CV goes out under your name, and when the interview comes, the person sitting there is you.",
    th: "คนที่อยากให้เราทำทุกอย่างแทน CV ต้องส่งออกไปในชื่อของคุณ และเมื่อถึงเวลาสัมภาษณ์ คนที่ต้องนั่งอยู่ตรงนั้นก็คือคุณ",
  },
];

// ------------------------------------------------------------------ the founder

export const FOUNDER_HEADING: Copy = {
  en: "Hi, I'm Paul",
  th: "สวัสดีครับ ผมพอล",
};

/** Before the turn. What he sees, and why it happens. */
export const FOUNDER_BEFORE: readonly Copy[] = [
  {
    en: "I run PunProfile and the “Jobs at companies in Europe” group. Most people meet me through that group first. My day job is in Marketing Operations, here in Europe.",
    th: "ผมดูแล PunProfile และกลุ่ม “งานบริษัทในยุโรป” หลายคนรู้จักผมครั้งแรกผ่านกลุ่มนี้ ส่วนงานประจำ ผมทำด้าน Marketing Operations อยู่ในยุโรป",
  },
  {
    en: "The longer I work here, the clearer one thing becomes: good people are not always seen, especially when their experience comes from another country.",
    th: "ยิ่งทำงานอยู่ที่นี่ ผมยิ่งเห็นเรื่องหนึ่งชัดขึ้นเรื่อย ๆ ว่า คนเก่งไม่ได้ถูกมองเห็นเสมอไป โดยเฉพาะเมื่อประสบการณ์ของเขามาจากอีกประเทศ",
  },
  {
    en: "A company name every Thai person knows may be a name a European hiring manager has never heard. Work we know was large and difficult can become one unremarkable line on a CV. And years of accumulated experience can be passed over, not because it has no value, but because the person reading it does not have enough context to see that value.",
    th: "ชื่อบริษัทที่คนไทยรู้จักดี อาจเป็นเพียงชื่อที่ผู้จัดการฝ่ายสรรหาในยุโรปไม่เคยได้ยิน งานที่เรารู้ว่าใหญ่และยาก อาจกลายเป็นเพียงหนึ่งบรรทัดธรรมดาใน CV และประสบการณ์ที่สั่งสมมาหลายปีอาจถูกมองข้าม ไม่ใช่เพราะมันไม่มีค่า แต่เพราะคนอ่านยังไม่มีบริบทมากพอที่จะเห็นคุณค่านั้น",
  },
  {
    en: "I have watched this happen again and again to Thai people in the group. When applications go unanswered, many of them try harder: send more, revise the CV again, read more advice. But in a cross-border job market, effort does not automatically turn into opportunity. If the market still cannot read you, applying more is just sending the same unclear story out over and over.",
    th: "ผมเห็นเรื่องนี้เกิดขึ้นซ้ำ ๆ กับคนไทยในกลุ่ม เมื่อส่งใบสมัครไปแล้วไม่มีคำตอบ หลายคนจึงพยายามให้มากขึ้น ส่งให้มากขึ้น แก้ CV อีกรอบ และอ่านคำแนะนำเพิ่มอีก แต่ในตลาดงานข้ามประเทศ ความพยายามไม่ได้กลายเป็นโอกาสโดยอัตโนมัติ ถ้าตลาดยังอ่านเราไม่ออก การสมัครเพิ่มก็เป็นเพียงการส่งเรื่องเดิมที่ยังไม่ชัดออกไปซ้ำ ๆ",
  },
];

/** The hinge of the section, set apart from the paragraphs on either side. */
export const FOUNDER_TURN: Copy = {
  en: "That is why I started PunProfile.",
  th: "นี่คือเหตุผลที่ผมเริ่มทำ PunProfile",
};

/** After the turn. What he does about it, and what he will not do. */
export const FOUNDER_AFTER: readonly Copy[] = [
  {
    en: "To me, career coaching is not writing you a new story that makes you look better than you are. It is helping you see who your existing experience is valuable to, which direction you should be heading, and how to tell your own story so another market understands it.",
    th: "สำหรับผม แคเรียร์โค้ชชิ่งไม่ใช่การเขียนเรื่องใหม่ให้คุณดูเก่งกว่าความเป็นจริง แต่คือการช่วยให้คุณมองเห็นว่าประสบการณ์ที่มีอยู่มีค่ากับใคร คุณควรมุ่งไปทางไหน และจะเล่าเรื่องของตัวเองอย่างไรให้คนอีกตลาดเข้าใจ",
  },
  {
    en: "I chose career coaching over being a recruiter because the first question should be “what suits you”, not “which vacancy can I put you into”.",
    th: "ผมเลือกทำแคเรียร์โค้ชชิ่งแทนการเป็นนายหน้าจัดหางาน เพราะคำถามแรกควรเป็น “อะไรเหมาะกับคุณ” ไม่ใช่ “จะนำคุณไปใส่ในตำแหน่งไหนได้บ้าง”",
  },
  {
    en: "PunProfile is paid by you, not by an employer. So the advice starts from your goals and your situation, not from a role somebody is rushing to fill.",
    th: "PunProfile รับค่าบริการจากคุณ ไม่ใช่นายจ้าง คำแนะนำจึงเริ่มจากเป้าหมายและความเป็นจริงของคุณ ไม่ใช่จากตำแหน่งที่ใครกำลังรีบหาคนไปใส่",
  },
  {
    en: "In the end, you are still the one walking this road. My job is to make sure you are not guessing the whole way: to let you know what you already have in hand, what is still missing, and what the next step should be.",
    th: "สุดท้ายแล้ว คุณยังเป็นคนเดินเส้นทางนี้เอง งานของผมคือช่วยให้คุณไม่ต้องเดินด้วยการคาดเดาไปตลอดทาง ให้คุณรู้ว่าตอนนี้มีอะไรอยู่ในมือ ยังขาดอะไร และก้าวต่อไปควรเป็นก้าวไหน",
  },
];

// ------------------------------------------------------------------- the close

export const CLOSE_LEAD: Copy = {
  en: "If any of that landed, the next step is not a form. It is a conversation.",
  th: "ถ้ามีข้อไหนตรงกับคุณ ขั้นต่อไปไม่ใช่การกรอกฟอร์ม แต่คือการได้คุยกัน",
};

/** Alt text. Describes what the picture shows, not what the brand means by it. */
export const MASCOT_ALT: Copy = {
  en: "The PunProfile character climbing steps towards a signpost",
  th: "ภาพการ์ตูน PunProfile เดินขึ้นบันไดไปยังป้ายบอกทาง",
};

export const PORTRAIT_ALT: Copy = {
  en: "Portrait of Paul Bussabong",
  th: "ภาพถ่ายของพอล บุษบง",
};
