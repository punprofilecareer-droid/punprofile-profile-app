import type { Post } from "../blog";

/**
 * `start-in-europe`, the blog's first article. Published 18/08/2026.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS ITS OWN FILE
 * ---------------------------------------------------------------------------
 *
 * `blog.ts` says filling `POSTS` is the whole of publishing, and it still is:
 * that array is the registry and the running order. What changed is that this
 * article is roughly 3,000 words in two languages, and pasting it inline would
 * put more prose than schema in the file that defines the schema. `POSTS`
 * imports it and stays a list of articles.
 *
 * The import is one-directional at runtime. This file takes `Post` as a TYPE
 * only, which is erased at compile time, so there is no cycle.
 *
 * ---------------------------------------------------------------------------
 * THE THAI IS PAUL'S AND IT IS THE SOURCE
 * ---------------------------------------------------------------------------
 *
 * He wrote it in Thai on 18/08/2026, rewriting a composed draft in place. **The
 * English below is a translation of it and only ever runs in that direction**,
 * the same as the FAQ. Where the two disagree the Thai is right and the English
 * is what gets corrected. LR-09 is the rule; `blog-first-30-days-th.md` in the
 * coaching repo is the source of record, and it carries the register
 * measurement and the term check.
 *
 * **The English has not been read back by Paul.**
 *
 * ---------------------------------------------------------------------------
 * TWO THINGS THAT WERE CHECKED RATHER THAN ASSUMED
 * ---------------------------------------------------------------------------
 *
 * - **`430` and `422` are in the cited report**, verbatim: "For 422 of the 430
 *   occupations (98%) that have been classified as in shortage in at least one
 *   country, there exists at least one other country that has identified the
 *   same occupation as being in surplus". They were checked because this repo
 *   had only ever recorded the percentage. It is the article's one citation and
 *   its only figure that is not a method.
 * - **`เว็บไซต์ทางการ` in week 1 of the plan is deliberate.** `termbase.yml`
 *   bans that rendering on `post` and the entry now records that the scope is
 *   post-only on purpose: the register argument is about a feed, and a reader
 *   who opened a long guide about visa routes reads ทางการ as precision.
 */
export const START_IN_EUROPE: Post = {
  slug: "start-in-europe",
  topic: "how-to",
  playbook: true,
  published: "2026-08-18",

  title: {
    th: "อยากไปทำงานยุโรป เริ่มจากตรงไหน: 30 วันแรกอย่าเพิ่งหว่านใบสมัคร",
    en: "You want to work in Europe. Where do you start? Do not spend the first 30 days applying",
  },

  summary: {
    th: "คนส่วนใหญ่เริ่มจากการส่งใบสมัคร ทั้งที่ใบสมัครควรเป็นปลายทางของการตัดสินใจสามเรื่องก่อนหน้า ได้แก่ จะเจาะตลาดไหน จะย้ายไปด้วยเส้นทางใด และจะทำให้นายจ้างเข้าใจคุณค่าของประสบการณ์จากไทยได้อย่างไร",
    en: "Most people start by sending applications, when an application should be the end point of three earlier decisions: which market to go after, which route you will move on, and how you will make an employer see the value of experience gained in Thailand.",
  },

  image: {
    src: "/blog/start-in-europe.jpg",
    // Describes the scene, not the article. An alt that summarised the argument
    // would read the thesis twice to anyone using a screen reader and tell them
    // nothing about the picture.
    alt: {
      th: "ตัวการ์ตูนดินปั้นกำลังปักหมุดลงบนแผนที่ยุโรป บนโต๊ะมีสมุด เอกสารโปรไฟล์พร้อมแว่นขยาย และถาดใส่ซองจดหมาย",
      en: "A clay figure placing a pin on a map of Europe, at a desk laid out with a notebook, a profile sheet under a magnifier, and a tray of envelopes",
    },
  },

  question: {
    th: "ตอนนี้เรื่องที่คุณยังตอบไม่ได้คือประเทศ เส้นทางการย้าย โปรไฟล์ ภาษา หรือเงิน?",
    en: "Right now, which is the one you still cannot answer: the country, the route, the profile, the language, or the money?",
  },

  sections: [
    {
      heading: { th: "สรุปสั้น ๆ", en: "In short" },
      body: [
        {
          kind: "p",
          text: {
            th: "การย้ายไปทำงานในยุโรปอาจดูเหมือนการตัดสินใจครั้งใหญ่เพียงครั้งเดียว แต่จริง ๆ แล้วประกอบด้วยการตัดสินใจหลายเรื่องที่ต้องเรียงให้ถูกลำดับ",
            en: "Moving to Europe for work can look like one large decision. It is really several, and they have to be taken in the right order.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ประเทศกำหนดว่าตลาดต้องการอะไร เส้นทางการย้ายกำหนดว่าบริษัทแบบไหนจ้างคุณได้ โปรไฟล์กำหนดว่านายจ้างจะมองเห็นคุณค่าของคุณหรือไม่ และใบสมัครคือเครื่องมือทดสอบว่าสามเรื่องแรกถูกต้องแค่ไหน",
            en: "The country decides what the market wants. The route decides which companies are able to hire you. Your profile decides whether an employer sees your value at all. And the application is the instrument that tests how right the first three were.",
          },
        },
        {
          kind: "p",
          text: {
            th: "คนส่วนใหญ่กลับเริ่มจากเรื่องสุดท้าย",
            en: "Most people start with the last one.",
          },
        },
        {
          kind: "p",
          text: {
            th: "พวกเขาแปลเรซูเม่เป็นภาษาอังกฤษ ปรับ LinkedIn แล้วส่งใบสมัครไปยังทุกตำแหน่งที่อ่านออก สิ่งเหล่านี้ทำให้รู้สึกว่ากำลังคืบหน้า แต่ความเคลื่อนไหวไม่ใช่กลยุทธ์เสมอไป",
            en: "They translate the CV into English, adjust LinkedIn, and apply to every role they can read. It all feels like progress. Motion is not always strategy.",
          },
        },
        {
          kind: "p",
          text: {
            th: "มองแบบง่าย ๆ โอกาสในตลาดงานข้ามประเทศเกิดจากสามอย่างประกอบกัน",
            en: "Put simply, an opportunity in a job market abroad needs three things at once.",
          },
        },
        {
          kind: "list",
          items: [
            {
              th: "ตลาดนั้นต้องการสิ่งที่คุณทำ",
              en: "That market wants what you do",
            },
            {
              th: "นายจ้างมองเห็นคุณค่าของประสบการณ์ที่คุณมี",
              en: "An employer can see the value of the experience you have",
            },
            {
              th: "บริษัทสามารถจ้างและพาคุณย้ายประเทศได้จริง",
              en: "The company is actually able to hire you and move you there",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "หากข้อใดข้อหนึ่งเป็นศูนย์ การส่งใบสมัครเพิ่มก็ชดเชยไม่ได้",
            en: "If any one of them is zero, sending more applications does not make up for it.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เดือนแรกจึงไม่ได้มีไว้สะสมจำนวนใบสมัคร แต่มีไว้ลดความไม่แน่นอนให้เหลือน้อยพอที่ใบสมัครทุกฉบับหลังจากนั้นจะมีเหตุผลรองรับ",
            en: "So the first month is not for accumulating applications. It is for reducing the uncertainty far enough that every application after it has a reason behind it.",
          },
        },
      ],
    },

    {
      heading: {
        th: "ปัญหาไม่ใช่คุณยังพยายามไม่มากพอ",
        en: "The problem is not that you have not tried hard enough",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "คนที่เริ่มคิดเรื่องไปทำงานในยุโรปมักถามเหมือนกันว่า “ควรเริ่มจากตรงไหน”",
            en: "People who start thinking about working in Europe tend to ask the same question: where should I start?",
          },
        },
        {
          kind: "p",
          text: {
            th: "เมื่อยังหาคำตอบไม่ได้ คำถามนั้นจะค่อย ๆ เปลี่ยนเป็นคำถามเกี่ยวกับตัวเอง",
            en: "When the answer does not come, that question slowly turns into questions about yourself.",
          },
        },
        {
          kind: "list",
          bare: true,
          items: [
            {
              th: "ประสบการณ์จากไทยมีน้ำหนักพอไหม",
              en: "Does experience from Thailand carry enough weight?",
            },
            {
              th: "อายุเท่านี้ยังทันหรือเปล่า",
              en: "Am I still in time at this age?",
            },
            {
              th: "ภาษายังไม่ดีพอใช่ไหม",
              en: "Is my language not good enough?",
            },
            {
              th: "ทำไมคนอื่นไปได้ แต่เรายังไม่รู้จะเริ่มอย่างไร",
              en: "Why can other people go, when I still do not know how to begin?",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "คำถามเหล่านี้เกิดขึ้นได้กับทุกคน แต่การคิดวนต่อไปจะไม่ทำให้คำตอบชัดขึ้น เพราะสิ่งที่ยังขาดไม่ได้อยู่ในตัวคุณทั้งหมด ส่วนหนึ่งอยู่ในกติกาของตลาดที่คุณยังไม่เคยต้องใช้",
            en: "These questions come to everyone, but going round on them does not make the answer any clearer, because what is missing is not all inside you. Part of it is in the rules of a market you have never had to use before.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ตลาดงานยุโรปมีกติกาต่างจากไทยหลายชั้น ทั้งสิทธิในการทำงาน การรับรองคุณวุฒิ ระดับภาษาที่แต่ละประเทศต้องการ และวิธีที่นายจ้างตีความเรซูเม่จากอีกประเทศ",
            en: "The European job market has several layers of rules that Thailand does not: the right to work, recognition of qualifications, the language level each country expects, and the way an employer reads a CV from another country.",
          },
        },
        {
          kind: "p",
          text: {
            th: "การไม่รู้กติกาเหล่านี้ไม่ได้แปลว่าคุณเก่งไม่พอ",
            en: "Not knowing those rules does not mean you are not good enough.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เดือนแรกมีไว้เรียนรู้กติกาและวางสมมติฐานที่ตรวจสอบได้ ไม่ใช่รีบกดสมัครแล้วใช้ความเงียบจากตลาดมาตัดสินคุณค่าของตัวเอง",
            en: "The first month is for learning the rules and setting out assumptions you can test, not for rushing to apply and then letting silence from the market pass judgement on your worth.",
          },
        },
      ],
    },

    {
      heading: {
        th: "ต้นทุนของการรีบสมัครไม่ใช่แค่เวลา",
        en: "The cost of applying too early is not only time",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "ในสัปดาห์แรก คนส่วนใหญ่มักทำสี่อย่าง",
            en: "In the first week, most people do four things.",
          },
        },
        {
          kind: "list",
          bare: true,
          items: [
            {
              th: "แปลเรซูเม่เป็นภาษาอังกฤษ",
              en: "Translate the CV into English",
            },
            {
              th: "เปลี่ยนชื่อตำแหน่งบน LinkedIn",
              en: "Change the job title on LinkedIn",
            },
            {
              th: "ถามว่าประเทศไหนไปง่ายที่สุด",
              en: "Ask which country is easiest to get into",
            },
            {
              th: "ส่งใบสมัครไปยังทุกตำแหน่งที่ประกาศเป็นภาษาอังกฤษ",
              en: "Apply to every role advertised in English",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "ทั้งสี่อย่างดูเหมือนการลงมือ แต่กำลังตอบคำถามที่ยังตั้งไม่ถูก",
            en: "All four look like action. All four are answering a question that has not been framed properly yet.",
          },
        },
        {
          kind: "p",
          text: {
            th: "การแปลเรซูเม่แบบคำต่อคำจะได้เอกสารภาษาอังกฤษที่ยังเล่าเรื่องด้วยตรรกะแบบตลาดไทย การถามว่าประเทศไหนไปง่ายที่สุดจะได้คำตอบที่ตั้งอยู่บนอาชีพ ภาษา เงิน และชีวิตของคนอื่น ส่วนการสมัครแบบกระจายจะได้ความเงียบที่ตีความไม่ได้ เพราะคุณไม่รู้ว่าเงียบเพราะโปรไฟล์ไม่ตรง ตลาดไม่ต้องการ หรือบริษัทจ้างคนจากนอกประเทศไม่ได้ตั้งแต่ต้น",
            en: "A word-for-word translation gets you an English document that still tells its story by the logic of the Thai market. Asking which country is easiest gets you an answer built on somebody else's profession, language, money and life. And applying broadly gets you a silence you cannot interpret, because you do not know whether it is silent because the profile did not fit, because the market did not want it, or because the company could never hire from outside the country in the first place.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ต้นทุนที่แท้จริงของการรีบสมัครจึงไม่ใช่เพียงเวลาที่เสียไป แต่คือข้อมูลที่ไม่ได้กลับมา",
            en: "So the real cost of applying too early is not the time spent. It is the information that does not come back.",
          },
        },
        {
          kind: "p",
          text: {
            th: "คุณใช้โอกาสแรกที่ตลาดจะเห็นคุณกับโปรไฟล์เวอร์ชันที่ยังจัดวางไม่เสร็จ แล้วได้รับผลลัพธ์ที่บอกไม่ได้ว่าควรแก้อะไรต่อ",
            en: "You spend the market's first look at you on a version of your profile that is not finished, and you get back a result that cannot tell you what to fix next.",
          },
        },
      ],
    },

    {
      heading: {
        th: "1. อย่าเริ่มจากคำว่า “ยุโรป”",
        en: "1. Do not start from the word “Europe”",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "“ยุโรป” ไม่ใช่ตลาดงานเดียว",
            en: "“Europe” is not one job market.",
          },
        },
        {
          kind: "p",
          text: {
            th: "งานชนิดเดียวกันอาจขาดแคลนในประเทศหนึ่งและมีผู้สมัครเกินความต้องการในอีกประเทศหนึ่ง ข้อมูลของ European Labour Authority พบว่า จาก 430 อาชีพที่ขาดแคลนในอย่างน้อยหนึ่งประเทศ มีถึง 422 อาชีพ หรือ 98% ที่ถูกจัดว่ามีแรงงานเกินความต้องการในประเทศอื่นด้วย",
            en: "The same job can be short of people in one country and have more applicants than openings in the next. European Labour Authority data finds that of 430 occupations classed as in shortage in at least one country, 422 of them, 98%, are also classed as being in surplus in another country.",
          },
          cite: {
            label: "European Labour Authority",
            href: "https://www.ela.europa.eu/en/publications/labour-shortages-and-surpluses-europe-2024",
          },
        },
        {
          kind: "p",
          text: {
            th: "ตัวเลขนี้ไม่ได้บอกว่ายุโรปมีหรือไม่มีงาน แต่มันบอกว่าคำว่า “ยุโรปต้องการอาชีพของฉันไหม” เป็นคำถามที่กว้างเกินกว่าจะใช้วางแผนได้",
            en: "That number does not tell you whether Europe has jobs or does not. It tells you that “does Europe need my profession?” is too broad a question to plan with.",
          },
        },
        {
          kind: "p",
          text: {
            th: "คำถามที่มีประโยชน์กว่าคือ",
            en: "The more useful question is this.",
          },
        },
        {
          kind: "list",
          bare: true,
          items: [
            {
              th: "ประเทศไหนกำลังต้องการทักษะของฉัน",
              en: "Which country needs my skills?",
            },
            {
              th: "และฉันผ่านเงื่อนไขที่จะทำงานในประเทศนั้นหรือไม่",
              en: "And do I meet that country's conditions for working there?",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "เริ่มจากประเทศเป้าหมายหนึ่งถึงสามประเทศ แต่ต้องมีเหตุผลร่วมกันที่เชื่อมประเทศเหล่านั้นไว้ เช่น ภาษาที่คุณใช้ทำงานได้ ตลาดที่เปิดรับภาษาอังกฤษในสายงานของคุณ หรือเส้นทางวีซ่าที่มีเงื่อนไขใกล้เคียงกัน",
            en: "Start with one to three target countries, but there has to be a shared reason holding them together: a language you can work in, markets that are open to English in your field, or visa routes with similar conditions.",
          },
        },
        {
          kind: "p",
          text: {
            th: "รายชื่อประเทศที่ไม่มีอะไรเชื่อมกันไม่ใช่การกระจายความเสี่ยง แต่คือการยังไม่ได้เลือก",
            en: "A list of countries with nothing connecting them is not spreading your risk. It is not having chosen.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ถึงคุณจะมีโอกาสในหลายประเทศ ก็ควรเริ่มลงมือกับประเทศเดียวก่อน เพราะกฎวีซ่า วิธีสมัครงาน ระดับภาษา และสิ่งที่นายจ้างให้ความสำคัญล้วนต่างกัน",
            en: "Even if several countries are open to you, start work on one of them first, because visa rules, how you apply, the language level and what employers weigh are all different.",
          },
        },
        {
          kind: "p",
          text: {
            th: "การเริ่มทีละประเทศไม่ได้แปลว่าคุณไปได้เพียงประเทศเดียว แต่แปลว่าคุณเลือกเรียนรู้ตลาดหนึ่งให้ลึกพอ ก่อนนำวิธีคิดนั้นไปใช้กับตลาดถัดไป",
            en: "Starting one country at a time does not mean only one country is available to you. It means you are choosing to learn one market deeply enough to take that way of thinking to the next one.",
          },
        },
      ],
    },

    {
      heading: {
        th: "2. “ต้องใช้วีซ่า” ยังไม่ใช่แผน",
        en: "2. “I need a visa” is not yet a plan",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "คนไทยส่วนใหญ่ที่อยากไปทำงานในยุโรปต้องใช้วีซ่า การบอกว่าต้องการบริษัทช่วยเรื่องวีซ่าจึงยังไม่ได้ทำให้เส้นทางชัดขึ้น",
            en: "Most Thai people who want to work in Europe need a visa. Saying that you need a company to help with the visa therefore does not make your route any clearer.",
          },
        },
        {
          kind: "p",
          text: {
            th: "สิ่งที่เปลี่ยนคุณจากคนที่ “อยากไป” เป็นคนที่ “มีแผนไป” คือการเรียกชื่อเส้นทางของตัวเองได้",
            en: "What turns you from someone who wants to go into someone with a plan to go is being able to name your own route.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เส้นทางหลักมักประกอบด้วย",
            en: "The main routes are usually these.",
          },
        },
        {
          kind: "list",
          items: [
            {
              th: "หางานที่นายจ้างพร้อมสปอนเซอร์ภายใต้วีซ่าประเภทที่ระบุได้",
              en: "Find a job where the employer is willing to sponsor, under a visa type you can name",
            },
            {
              th: "เรียนต่อแล้วใช้สิทธิหลังเรียนจบเพื่อหางาน",
              en: "Study, then use your post-study rights to look for work",
            },
            {
              th: "ย้ายตามคู่ครองหรือครอบครัว",
              en: "Move with a partner or family",
            },
            {
              th: "ใช้สิทธิทำงานที่มีอยู่แล้ว",
              en: "Use a right to work you already hold",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "ความต่างระหว่าง “อยากให้บริษัทช่วยเรื่องวีซ่า” กับ “ตำแหน่งระดับนี้เข้าเกณฑ์วีซ่าประเภทนี้ และนายจ้างลักษณะนี้มีแนวโน้มยื่นให้” ไม่ได้อยู่ที่ความมั่นใจ แต่อยู่ที่คุณภาพของข้อมูล",
            en: "The difference between “I want a company to help with the visa” and “a role at this level meets the criteria for this visa type, and employers of this kind tend to file it” is not confidence. It is the quality of your information.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ข้อมูลนี้ควรมาจากเว็บไซต์หน่วยงานรัฐของประเทศเป้าหมายและประกาศงานจริง ไม่ใช่โพสต์สรุปที่ไม่ได้ระบุว่าข้อมูลใช้กับใครหรืออัปเดตเมื่อใด",
            en: "That information should come from the government websites of your target country and from real job adverts, not from a summary post that never says who it applies to or when it was last updated.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เรื่องเงินต้องเข้ามาอยู่ในขั้นนี้ด้วย เพราะเงินไม่ได้เป็นเพียงค่าใช้จ่ายหลังได้งาน แต่เป็นตัวกำหนดว่าเส้นทางใดเปิดให้คุณตั้งแต่แรก",
            en: "Money belongs at this stage too, because it is not just what you spend after you get the job. It decides which routes are open to you in the first place.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เส้นทางเรียนต่อต้องใช้เงินก้อน ขณะที่ทุกเส้นทางมีค่าใช้จ่ายช่วงเปลี่ยนผ่าน เช่น ค่าเดินทาง ค่ามัดจำที่พัก ค่าเช่าเดือนแรก ค่าแปลและรับรองเอกสาร ค่าประกัน และค่าใช้ชีวิตระหว่างรอเงินเดือนก้อนแรก",
            en: "The study route needs a lump sum up front, and every route has transition costs: travel, a deposit on somewhere to live, the first month's rent, translating and certifying documents, insurance, and living expenses while you wait for the first salary.",
          },
        },
        {
          kind: "p",
          text: {
            th: "อย่าหาว่า “ไปยุโรปต้องมีเงินเท่าไร” ให้หาว่าการย้ายไปประเทศเป้าหมายด้วยเส้นทางที่คุณเลือกต้องใช้เงินเท่าไร",
            en: "Do not go looking for what it costs to go to Europe. Go looking for what it costs to move to your target country, by the route you have chosen.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ตัวเลขที่ตรวจสอบได้ของประเทศเดียวช่วยให้คุณวางแผนได้จริง ค่าเฉลี่ยของทั้งยุโรปแทบไม่มีความหมายกับชีวิตของใครคนหนึ่ง",
            en: "A checkable number for one country lets you actually plan. An average across the whole of Europe means almost nothing to any individual life.",
          },
        },
      ],
    },

    {
      heading: {
        th: "3. ปัญหาอาจไม่ใช่ประสบการณ์ แต่คือคนอ่านยังตีความไม่ออก",
        en: "3. The problem may not be your experience, but that the reader cannot interpret it",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "นายจ้างยุโรปไม่ได้รู้จักบริบทของไทยโดยอัตโนมัติ",
            en: "A European employer does not automatically know the Thai context.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ชื่อบริษัทที่คนไทยรู้จักกันทั้งประเทศ อาจเป็นเพียงชื่อหนึ่งที่ผู้สรรหาในยุโรปไม่เคยได้ยิน ชื่อตำแหน่งระดับอาวุโสในกรุงเทพฯ อาจถูกตีความเป็นระดับกลาง และโครงการที่คุณรู้ว่าใหญ่และซับซ้อนอาจกลายเป็นเพียงหนึ่งบรรทัดธรรมดาในเรซูเม่",
            en: "A company name the whole of Thailand knows may be just a name a European recruiter has never heard. A senior job title in Bangkok may be read as mid-level. And a project you know was large and complex may come out as one ordinary line on a CV.",
          },
        },
        {
          kind: "p",
          text: {
            th: "สิ่งเหล่านี้ไม่ได้ทำให้ประสบการณ์ของคุณมีค่าน้อยลง แต่เพิ่มภาระให้คนอ่านต้องตีความเอง และคนอ่านมักไม่มีเวลาทำเช่นนั้น",
            en: "None of this makes your experience worth less. It puts the work of interpretation on the reader, and the reader usually does not have time for it.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ยังมีความต่างทางวัฒนธรรมอีกชั้นหนึ่ง",
            en: "There is another layer, and it is cultural.",
          },
        },
        {
          kind: "p",
          text: {
            th: "การทำงานในไทยให้คุณค่ากับความถ่อมตัวและการยกความดีให้ทีม ขณะที่เรซูเม่และการสัมภาษณ์ในยุโรปมักต้องการให้ผู้สมัครระบุอย่างชัดเจนว่า ตัวเองทำอะไร ตัดสินใจอะไร และสร้างผลลัพธ์แบบไหน",
            en: "Working life in Thailand values modesty and giving the credit to the team, while CVs and interviews in Europe generally want a candidate to state plainly what they did themselves, what they decided, and what results they produced.",
          },
        },
        {
          kind: "p",
          text: {
            th: "คนไทยจำนวนมากจึงไม่ได้เล่าตัวเองต่ำกว่าความจริงเพราะขาดความมั่นใจ แต่เพราะกำลังใช้กติกาของอีกตลาดหนึ่งอย่างถูกต้อง",
            en: "So a great many Thai people are not underselling themselves for lack of confidence. They are correctly following the rules of a different market.",
          },
        },
        {
          kind: "p",
          text: {
            th: "คำแนะนำว่า “ต้องมั่นใจขึ้น” จึงไม่เพียงพอ สิ่งที่ต้องทำคือแปลบริบท ไม่ใช่แค่แปลภาษา",
            en: "Which is why “be more confident” is not enough advice. What is needed is translating the context, not only the language.",
          },
        },
      ],
    },

    {
      heading: {
        th: "เริ่มจากประกาศงาน 20 ตำแหน่ง",
        en: "Start with 20 job adverts",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "ก่อนกลับไปแก้เรซูเม่ ให้เลือกประกาศงานจริงอย่างน้อย 20 ตำแหน่งในประเทศและสายงานเป้าหมาย แล้วจดสิ่งที่พบซ้ำ",
            en: "Before you go back to the CV, pick at least 20 real job adverts in your target country and field, and note down what keeps recurring.",
          },
        },
        {
          kind: "list",
          items: [
            { th: "ชื่อตำแหน่งที่ตลาดใช้", en: "The job titles the market actually uses" },
            {
              th: "ปัญหาที่บริษัทต้องการให้คนตำแหน่งนี้แก้",
              en: "The problem the company wants someone in this role to solve",
            },
            {
              th: "ทักษะและเครื่องมือที่ปรากฏบ่อย",
              en: "Skills and tools that appear often",
            },
            { th: "ระดับภาษา", en: "Language level" },
            { th: "ประสบการณ์ในอุตสาหกรรม", en: "Industry experience" },
            {
              th: "เงื่อนไขเรื่องวีซ่าหรือสิทธิทำงาน",
              en: "Conditions on visas or the right to work",
            },
            {
              th: "คุณวุฒิหรือใบประกอบวิชาชีพที่ต้องมี",
              en: "Qualifications or professional licences required",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "จุดเปลี่ยนเกิดขึ้นเมื่อคำถามในหัวเปลี่ยนจาก “ฉันจะอธิบายตัวเองอย่างไร” เป็น “ตลาดกำลังจ้างคนมาแก้ปัญหาอะไร”",
            en: "The turn comes when the question in your head changes from “how do I describe myself?” to “what problem is the market hiring someone to solve?”",
          },
        },
        {
          kind: "p",
          text: {
            th: "เมื่อรู้คำตอบแล้วจึงค่อยกลับไปเขียนเรซูเม่ใหม่",
            en: "Once you have the answer, then go back and rewrite the CV.",
          },
        },
        {
          kind: "p",
          text: {
            th: "อย่าเขียนเพียงว่าคุณรับผิดชอบโครงการ ให้บอกว่าโครงการนั้นแก้ปัญหาอะไร คุณมีบทบาทอย่างไร และเกิดผลลัพธ์แบบไหน หากชื่อตำแหน่งเดิมเป็นคำที่ใช้เฉพาะในไทย ให้เพิ่มคำอธิบายที่คนต่างประเทศเข้าใจได้โดยไม่ต้องเดา",
            en: "Do not write only that you were responsible for a project. Say what problem that project solved, what your role in it was, and what came of it. If your old job title is a term used only in Thailand, add a description a foreign reader can understand without guessing.",
          },
        },
        {
          kind: "p",
          text: {
            th: "LinkedIn ต้องเล่าเรื่องเดียวกัน ชื่อตำแหน่ง คำแนะนำตัว ประสบการณ์ และทักษะควรไปในทิศทางเดียวกับเรซูเม่ เมื่อนายจ้างเปิดดูต่อ เขาควรเข้าใจคุณชัดขึ้น ไม่ใช่พบเรื่องเล่าคนละชุด",
            en: "LinkedIn has to tell the same story. The headline, the summary, the experience and the skills should all run in the same direction as the CV. When an employer looks you up, they should understand you better, not find a different account.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เป้าหมายไม่ใช่ทำให้คุณดูใหญ่กว่าความจริง แต่ทำให้คุณค่าที่มีอยู่แล้วถูกมองเห็นได้เร็วพอ",
            en: "The goal is not to make you look larger than you are. It is to make the value you already have visible quickly enough.",
          },
        },
      ],
    },

    {
      heading: {
        th: "นายจ้างไม่ได้ดูแค่ว่าคุณทำงานเป็นหรือไม่",
        en: "An employer is not only asking whether you can do the job",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "แม้ประสบการณ์จะตรง นายจ้างยังต้องตอบคำถามอีกหลายข้อก่อนจ้างผู้สมัครจากต่างประเทศ",
            en: "Even where your experience fits, an employer still has several other questions to answer before hiring a candidate from abroad.",
          },
        },
        {
          kind: "list",
          bare: true,
          items: [
            {
              th: "คุณวุฒิหรือใบประกอบวิชาชีพใช้ได้ในประเทศนั้นหรือไม่",
              en: "Is the qualification or professional licence valid in that country?",
            },
            {
              th: "ตำแหน่งต้องใช้ภาษาท้องถิ่นระดับใด",
              en: "What level of the local language does the role need?",
            },
            {
              th: "บริษัทสามารถจ้างคนจากนอกประเทศได้หรือไม่",
              en: "Is the company able to hire from outside the country?",
            },
            {
              th: "ต้องใช้ใบอนุญาตทำงานหรือวีซ่าประเภทใด",
              en: "Which work permit or visa type would be needed?",
            },
            {
              th: "คุณพร้อมเริ่มงานและย้ายประเทศเมื่อใด",
              en: "When could you start and move?",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "นี่คือเหตุผลที่คนมีฝีมืออาจยังไม่ได้รับการตอบกลับ ปัญหาไม่ได้อยู่ที่คุณค่าของประสบการณ์เสมอไป แต่อยู่ที่นายจ้างยังมองไม่เห็นว่าการจ้างคุณจะเกิดขึ้นจริงได้อย่างไร",
            en: "This is why capable people can go unanswered. The problem is not always the worth of the experience. It is that the employer cannot yet see how hiring you would actually happen.",
          },
        },
        {
          kind: "p",
          text: { th: "อย่าปล่อยให้เขาเดา", en: "Do not leave them to guess." },
        },
        {
          kind: "p",
          text: {
            th: "ระบุให้ชัดว่าตอนนี้คุณอยู่ที่ไหน เริ่มงานได้เมื่อไร มีสิทธิทำงานอยู่แล้วหรือไม่ และต้องการการสนับสนุนด้านใด ความชัดเจนนี้ช่วยคัดบริษัทที่จ้างคุณไม่ได้ออกตั้งแต่ต้น แทนที่จะเพิ่งมารู้หลังสัมภาษณ์ไปแล้วสองรอบ",
            en: "State plainly where you are now, when you could start, whether you already hold a right to work, and what support you would need. That clarity screens out the companies that cannot hire you at the beginning, rather than after two rounds of interviews.",
          },
        },
      ],
    },

    {
      heading: {
        th: "4. ใบสมัครไม่ใช่ลอตเตอรี่ แต่เป็นการทดสอบสมมติฐาน",
        en: "4. An application is not a lottery ticket, it is a test of an assumption",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "ความเร่งรีบจะบอกให้คุณส่งใบสมัครไปทุกที่ แล้วหวังว่าจะมีสักแห่งตอบกลับ",
            en: "Urgency will tell you to apply everywhere and hope one of them answers.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ปัญหาคือ เมื่อสมัครทุกที่ คุณจะค่อย ๆ เลิกเจาะจง และเมื่อโปรไฟล์ไม่เจาะจง คุณจะกลายเป็นผู้สมัครที่แทนที่ด้วยใครก็ได้",
            en: "The trouble is that when you apply everywhere you gradually stop being specific, and once a profile is not specific you become a candidate anyone else can be swapped in for.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ใบสมัครที่ดีควรทดสอบสมมติฐานที่ชัดเจนว่า",
            en: "A good application should be testing a clear assumption.",
          },
        },
        {
          kind: "list",
          bare: true,
          items: [
            {
              th: "ตลาดนี้ต้องการทักษะแบบนี้",
              en: "This market wants this kind of skill",
            },
            {
              th: "ประสบการณ์ของฉันพิสูจน์ได้ว่าทำเรื่องนี้เป็น",
              en: "My experience proves I can do it",
            },
            {
              th: "และบริษัทนี้มีทางจ้างฉันได้จริง",
              en: "And this company has a way of actually hiring me",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "หากยังเขียนสามบรรทัดนี้ไม่ได้ คุณอาจยังไม่พร้อมทดสอบด้วยใบสมัคร",
            en: "If you cannot yet write those three lines, you may not be ready to test it with an application.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เริ่มจากทำรายชื่อบริษัทจริงประมาณ 20 แห่งในประเทศเป้าหมาย ครึ่งหนึ่งเป็นบริษัทที่คุณอยากทำงานด้วยจริง อีกครึ่งหนึ่งเป็นบริษัทที่คุณพิจารณาได้",
            en: "Start by writing down about 20 real companies in your target country. Half of them ones you would genuinely want to work for, half of them ones you would consider.",
          },
        },
        {
          kind: "p",
          text: {
            th: "หากยังหารายชื่อไม่ครบ ไม่ได้แปลว่าคุณล้มเหลว แต่มันเป็นข้อมูลว่าทิศทางยังไม่ชัด ซึ่งมีประโยชน์กว่าการส่งใบสมัครต่อไปโดยไม่รู้ว่ากำลังทดสอบอะไร",
            en: "If you cannot fill the list, that is not a failure. It is information that the direction is not settled yet, and that is more useful than carrying on applying without knowing what you are testing.",
          },
        },
        {
          kind: "p",
          text: {
            th: "จากนั้นตรวจทีละบริษัทว่าเปิดรับตำแหน่งแบบใด เคยจ้างคนจากต่างประเทศหรือไม่ และพนักงานที่ทำงานคล้ายคุณมีพื้นฐานแบบไหน ข้อมูลเหล่านี้หาได้จากหน้าอาชีพของบริษัทและโปรไฟล์พนักงานปัจจุบัน",
            en: "Then go company by company: what roles they open, whether they have hired from abroad before, and what background the people doing work like yours have. You can find all of it on the company's own careers page and on current employees' profiles.",
          },
        },
      ],
    },

    {
      heading: { th: "คุยกับคนก่อนส่งไฟล์", en: "Talk to people before you send a file" },
      body: [
        {
          kind: "p",
          text: {
            th: "เว็บไซต์บอกได้ว่าบริษัทพูดอะไร แต่คนในตลาดจะบอกได้ว่าบริษัทตัดสินใจอย่างไร",
            en: "A website tells you what a company says. People in the market tell you how it decides.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ลองคุยกับคนในสายเดียวกัน ศิษย์เก่า หรือคนไทยที่ทำงานอยู่ในประเทศเป้าหมาย เตรียมคำถามที่เฉพาะเจาะจง เช่น",
            en: "Try talking to people in your own field, to alumni, or to Thai people working in your target country. Come with specific questions.",
          },
        },
        {
          kind: "list",
          bare: true,
          items: [
            {
              th: "บริษัทแบบไหนมักรับผู้สมัครจากต่างประเทศ",
              en: "What kind of company usually takes candidates from abroad?",
            },
            {
              th: "ทักษะอะไรมีน้ำหนักมากกว่าที่เขียนไว้ในประกาศ",
              en: "Which skills carry more weight than the advert says?",
            },
            {
              th: "ผู้สมัครจากต่างประเทศมักพลาดเรื่องใด",
              en: "What do candidates from abroad usually get wrong?",
            },
            {
              th: "ชื่อตำแหน่งใดใกล้กับประสบการณ์ของคุณที่สุด",
              en: "Which job title is closest to your experience?",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "จุดประสงค์ไม่ใช่การขอฝากงาน แต่เพื่อเปรียบเทียบว่าตลาดจริงต่างจากสิ่งที่คุณอ่านอย่างไร",
            en: "The purpose is not to ask them to put you forward. It is to compare how the real market differs from what you have read.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ลำดับมีผล คุยก่อนสมัครดีกว่าสมัครแล้วค่อยคุย เพราะบทสนทนาที่เกิดขึ้นก่อนยังเปลี่ยนใบสมัครของคุณได้ ส่วนบทสนทนาหลังสมัครทำได้เพียงอธิบายสิ่งที่ส่งไปแล้ว",
            en: "The order matters. Talking before applying beats applying and then talking, because a conversation that happens first can still change your application, while one that happens afterwards can only explain what you already sent.",
          },
        },
        {
          kind: "p",
          text: {
            th: "การสมัครโดยไม่รู้จักใครไม่ได้ไร้ประโยชน์ แต่คุณกำลังเข้าไปอยู่ในพื้นที่ที่มีผู้สมัครคล้ายกันจำนวนมาก สิ่งที่ช่วยเปลี่ยนความน่าจะเป็นไม่ใช่การรู้จักคนเพื่อข้ามขั้นตอน แต่คือการมีบริบทก่อนที่ชื่อของคุณจะไปถึงบริษัทในรูปแบบไฟล์ PDF",
            en: "Applying without knowing anyone is not useless, but you are stepping into a space full of similar candidates. What shifts the odds is not knowing someone so you can skip a step. It is having context in place before your name reaches the company as a PDF.",
          },
        },
      ],
    },

    {
      heading: {
        th: "สองเรื่องที่ต้องเริ่มพร้อมกันตั้งแต่วันแรก",
        en: "Two things that have to start on day one alongside everything else",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "สี่ขั้นตอนข้างต้นมีลำดับ แต่ยังมีอีกสองเรื่องที่ไม่ควรรอให้ขั้นตอนเหล่านั้นเสร็จ นั่นคือภาษา และชีวิตหลังย้าย",
            en: "The four steps above have an order. Two other things should not wait for them to finish: language, and the life you will have after the move.",
          },
        },
      ],
    },

    {
      heading: {
        th: "ภาษาไม่ใช่ด่านสุดท้าย แต่เป็นโครงสร้างพื้นฐาน",
        en: "Language is not the last hurdle, it is the foundation",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "สิ่งที่พูดมาทั้งหมดก่อนหน้านี้คือการจัดระบบสิ่งที่คุณมีอยู่แล้ว จึงใช้เวลาเป็นสัปดาห์ แต่ภาษาเป็นเรื่องที่ต้องค่อย ๆ สร้างเพิ่ม และต้องใช้เวลาเป็นเดือนหรือเป็นปี",
            en: "Everything up to this point is organising what you already have, so it is measured in weeks. Language has to be built up gradually, and it is measured in months or years.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เพราะช้าที่สุด จึงต้องเริ่มก่อน",
            en: "Because it is the slowest, it has to start first.",
          },
        },
        {
          kind: "p",
          text: {
            th: "อย่ารอจนภาษากลายเป็นเหตุผลที่ต้องปฏิเสธงาน ลำดับที่ใช้ได้จริงสำหรับหลายคนคือ พัฒนาภาษาอังกฤษให้ถึงระดับที่ใช้ทำงานได้ก่อน แล้วจึงเพิ่มภาษาท้องถิ่นหากตลาดเป้าหมายต้องการ",
            en: "Do not wait until language becomes the reason a job has to be turned down. The order that works for most people is English to a level you can work in first, then the local language if the target market needs it.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ประกาศงาน 20 ตำแหน่งที่คุณเก็บไว้จะบอกได้ดีกว่าความเห็นทั่วไปว่า ในสายงานและประเทศนั้นต้องใช้ภาษาใด ระดับไหน และบ่อยเพียงใด",
            en: "The 20 job adverts you collected will tell you better than any general opinion which language that field and country need, at what level, and how often.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ภาษาไม่ได้มีผลเฉพาะตอนสัมภาษณ์ แต่กำหนดว่าคุณจะเข้าถึงงานได้กี่ตำแหน่ง เปลี่ยนสายงานในอนาคตได้กว้างเพียงใด และตั้งหลักในชีวิตประจำวันได้เร็วแค่ไหนหลังย้าย",
            en: "Language does not only matter at the interview. It sets how many roles you can reach, how widely you can change direction later, and how quickly you find your feet in daily life after the move.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ภาษาไม่ใช่อุปกรณ์เสริมของการย้ายประเทศ แต่เป็นส่วนหนึ่งของโครงสร้างชีวิตที่คุณกำลังสร้าง",
            en: "Language is not an accessory to moving country. It is part of the structure of the life you are building.",
          },
        },
      ],
    },

    {
      heading: {
        th: "ครอบครัวและเงินไม่ใช่เรื่องที่ควรเก็บไว้คิดทีหลัง",
        en: "Family and money are not things to leave until later",
      },
      body: [
        {
          kind: "p",
          text: {
            th: "อย่ารอให้ได้งานก่อนแล้วค่อยคิดว่าจะใช้ชีวิตอย่างไร",
            en: "Do not wait until you have the job to think about how you will live.",
          },
        },
        {
          kind: "p",
          text: {
            th: "ประเมินค่าใช้จ่ายในช่วงเปลี่ยนผ่าน คุยกับครอบครัวให้ชัดเรื่องประเทศเป้าหมาย และถามว่าแต่ละคนต้องการอะไรจึงจะใช้ชีวิตได้อย่างมั่นคง",
            en: "Work out the transition costs, be clear with your family about the target country, and ask what each person needs in order to live securely.",
          },
        },
        {
          kind: "p",
          text: {
            th: "หากวางแผนย้ายไปก่อนเพียงคนเดียว ควรตกลงกันว่าจะเป็นเวลานานแค่ไหน จะติดต่อกันอย่างไร และจะกลับมาทบทวนแผนร่วมกันเมื่อใด",
            en: "If the plan is for you to go alone first, agree how long that will be, how you will stay in touch, and when you will come back and review the plan together.",
          },
        },
        {
          kind: "p",
          text: {
            th: "หากย้ายตามคู่ครองหรือครอบครัว ให้ตรวจสอบสิทธิในการทำงานตั้งแต่ต้น เพราะในหลายประเทศ การมีสิทธิพำนักไม่ได้หมายความว่าจะมีสิทธิทำงานโดยอัตโนมัติ พร้อมกันนั้นก็ควรวางแผนว่าจะรักษาหรือต่อยอดเส้นทางอาชีพของตัวเองอย่างไรหลังย้าย",
            en: "If you are moving with a partner or family, check your own right to work from the start, because in many countries the right to reside does not automatically carry the right to work. At the same time, plan how you will keep or build on your own career after the move.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เงินเก็บไม่ได้รับประกันว่าคุณจะได้งาน แต่มันซื้อเวลาให้คุณไม่ต้องตอบรับทางเลือกแรกเพราะความกลัว",
            en: "Savings do not guarantee you a job. They buy you the time not to accept the first option out of fear.",
          },
        },
        {
          kind: "p",
          text: {
            th: "คนที่รู้ว่าเงินของตัวเองรองรับชีวิตหลังย้ายได้นานกี่เดือนมีพื้นที่ให้เลือก ส่วนคนที่ไม่รู้มักถูกความเร่งรีบบังคับให้เลือก และการตัดสินใจภายใต้ความเร่งรีบแทบไม่เคยตรงเป้า",
            en: "Someone who knows how many months their money covers after the move has room to choose. Someone who does not is usually forced to choose by urgency, and decisions made under urgency are almost never on target.",
          },
        },
      ],
    },

    {
      heading: { th: "แผน 30 วันแรก", en: "A plan for the first 30 days" },
      body: [
        {
          kind: "sub",
          text: {
            th: "สัปดาห์ที่ 1: เลือกตลาดและตั้งชื่อเส้นทาง",
            en: "Week 1: choose the market and name the route",
          },
        },
        {
          kind: "list",
          items: [
            {
              th: "เลือกประเทศเป้าหมายหนึ่งประเทศ หรือไม่เกินสามประเทศที่มีเหตุผลร่วมกัน",
              en: "Choose one target country, or no more than three with a shared reason holding them together",
            },
            {
              th: "ตรวจเส้นทางวีซ่าจากเว็บไซต์ทางการ",
              en: "Check the visa routes on the official websites",
            },
            {
              th: "ประเมินค่าใช้จ่ายช่วงเปลี่ยนผ่าน",
              en: "Estimate the transition costs",
            },
            {
              th: "เขียนให้ได้หนึ่งย่อหน้าว่า ทำไมประเทศนี้จึงเหมาะกับสิ่งที่คุณมี",
              en: "Write one paragraph on why this country suits what you have",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "ผลลัพธ์ที่ควรได้: ประเทศเป้าหมายหนึ่งแห่ง เส้นทางการย้ายที่เรียกชื่อได้ และตัวเลขค่าใช้จ่ายตั้งต้น",
            en: "What you should end up with: one target country, a route you can name, and an opening cost figure.",
          },
        },
        {
          kind: "sub",
          text: {
            th: "สัปดาห์ที่ 2: อ่านตลาดก่อนเขียนตัวเอง",
            en: "Week 2: read the market before you write about yourself",
          },
        },
        {
          kind: "list",
          items: [
            { th: "เก็บประกาศงานจริง 20 ตำแหน่ง", en: "Collect 20 real job adverts" },
            {
              th: "จดชื่อตำแหน่ง ทักษะ เครื่องมือ ภาษา และเงื่อนไขที่พบซ้ำ",
              en: "Note the job titles, skills, tools, languages and conditions that recur",
            },
            {
              th: "ตรวจว่าตำแหน่งใดเปิดรับผู้สมัครจากต่างประเทศ",
              en: "Check which roles are open to candidates from abroad",
            },
            {
              th: "แยกสิ่งที่คุณมีอยู่แล้วออกจากสิ่งที่ต้องพัฒนาเพิ่ม",
              en: "Separate what you already have from what you still have to build",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "ผลลัพธ์ที่ควรได้: ภาพของผู้สมัครที่ตลาดกำลังมองหา ไม่ใช่เพียงความรู้สึกว่าคุณน่าจะสมัครได้",
            en: "What you should end up with: a picture of the candidate the market is looking for, rather than a feeling that you could probably apply.",
          },
        },
        {
          kind: "sub",
          text: {
            th: "สัปดาห์ที่ 3: ทำให้โปรไฟล์อ่านออก",
            en: "Week 3: make the profile readable",
          },
        },
        {
          kind: "list",
          items: [
            {
              th: "เลือกชื่อตำแหน่งเป้าหมายสองถึงสามแบบ",
              en: "Choose two or three target job titles",
            },
            {
              th: "เรียบเรียงประสบการณ์เป็นปัญหา บทบาท และผลลัพธ์",
              en: "Rewrite your experience as problem, role and result",
            },
            {
              th: "ปรับเรซูเม่และ LinkedIn ให้เล่าเรื่องเดียวกัน",
              en: "Bring the CV and LinkedIn into one story",
            },
            {
              th: "ระบุเรื่องสิทธิทำงาน สถานที่อยู่ และช่วงเวลาที่พร้อมเริ่มงานให้ชัด",
              en: "State your right to work, where you are, and when you could start",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "ผลลัพธ์ที่ควรได้: โปรไฟล์ตั้งต้นที่ตลาดเข้าใจได้โดยไม่ต้องรู้จักบริบทของไทยมาก่อน",
            en: "What you should end up with: a starting profile the market can understand without knowing anything about the Thai context.",
          },
        },
        {
          kind: "sub",
          text: {
            th: "สัปดาห์ที่ 4: ทดสอบอย่างเจาะจง",
            en: "Week 4: test it, specifically",
          },
        },
        {
          kind: "list",
          items: [
            {
              th: "ทำรายชื่อบริษัทเป้าหมายประมาณ 20 แห่ง",
              en: "Draw up a list of about 20 target companies",
            },
            {
              th: "คุยกับคนในตลาดเพื่อทดสอบสิ่งที่เข้าใจ",
              en: "Talk to people in the market to test what you have understood",
            },
            {
              th: "เลือกตำแหน่งที่ตรงจริงสามถึงห้าตำแหน่ง",
              en: "Pick three to five roles that genuinely fit",
            },
            {
              th: "ปรับใบสมัครให้ตอบโจทย์แต่ละตำแหน่ง ก่อนตัดสินใจส่ง",
              en: "Tailor the application to each of them before deciding to send",
            },
          ],
        },
        {
          kind: "p",
          text: {
            th: "ผลลัพธ์ที่ควรได้: คำตอบว่าคุณควรเริ่มสมัคร ปรับโปรไฟล์เพิ่มเติม หรือพัฒนาทักษะก่อน",
            en: "What you should end up with: an answer on whether to start applying, to work on the profile further, or to build skills first.",
          },
        },
        {
          kind: "p",
          text: {
            th: "หากวันที่ 30 คุณพบว่ายังไม่ควรสมัคร นั่นไม่ใช่ความล้มเหลว แต่คือการพบช่องว่างก่อนที่ตลาดจะเป็นคนชี้ให้เห็นผ่านความเงียบ",
            en: "If on day 30 you find you should not be applying yet, that is not a failure. It is finding the gap before the market points it out to you through silence.",
          },
        },
      ],
    },

    {
      heading: { th: "คุณไม่ได้เริ่มจากศูนย์", en: "You are not starting from zero" },
      body: [
        {
          kind: "p",
          text: {
            th: "ข้อเสนองานเป็นตัวชี้วัดปลายทาง แต่ความไม่แน่นอนที่ลดลงคือตัวชี้วัดว่ากลยุทธ์กำลังดีขึ้น",
            en: "A job offer is the measure at the end. Uncertainty going down is the measure that the strategy is improving.",
          },
        },
        {
          kind: "p",
          text: {
            th: "การรู้ว่าประเทศไหนเหมาะกับสิ่งที่คุณมี จะย้ายไปด้วยเส้นทางใด งานแบบไหนควรสมัคร และยังต้องเติมทักษะด้านไหน ล้วนเป็นความคืบหน้า",
            en: "Knowing which country suits what you have, which route you will move on, which jobs are worth applying for, and which skills still need filling in, is all progress.",
          },
        },
        {
          kind: "p",
          text: {
            th: "เป้าหมายของเดือนแรกจึงไม่ใช่การส่งใบสมัครให้ได้มากที่สุด แต่คือการสร้างแผนที่ทำให้ใบสมัครฉบับต่อไปมีน้ำหนักกว่าฉบับที่ส่งไปโดยยังไม่รู้ว่ากำลังส่งให้ใคร",
            en: "So the goal of the first month is not to send as many applications as possible. It is to build a plan that makes the next application carry more weight than one sent without knowing who it was going to.",
          },
        },
        {
          kind: "p",
          text: {
            th: "คุณไม่ได้เริ่มจากศูนย์ คุณเริ่มจากประสบการณ์ที่ยังไม่ได้จัดวางให้ตลาดใหม่เข้าใจ",
            en: "You are not starting from zero. You are starting from experience that has not yet been arranged so a new market can understand it.",
          },
        },
      ],
    },

    {
      heading: { th: "คำถามที่พบบ่อย", en: "Frequently asked questions" },
      body: [
        {
          kind: "qa",
          q: {
            th: "ต้องเก่งภาษาอังกฤษระดับไหนถึงจะสมัครงานได้",
            en: "How good does my English have to be before I can apply?",
          },
          a: [
            {
              th: "ขึ้นอยู่กับประเทศ ตำแหน่ง และบริษัท บางตลาดใช้ภาษาอังกฤษเป็นภาษาหลักในการทำงาน ขณะที่บางตลาดต้องใช้ภาษาท้องถิ่น แม้แต่ตำแหน่งในประเทศเดียวกันก็อาจมีข้อกำหนดต่างกัน",
              en: "It depends on the country, the role and the company. Some markets use English as their main working language, others need the local language, and even roles in the same country can differ.",
            },
            {
              th: "คำตอบที่แม่นกว่าการถามแบบกว้าง ๆ คือการอ่านประกาศจริง 20 ตำแหน่งในตลาดเป้าหมาย แล้วดูว่าระดับภาษาใดปรากฏซ้ำ",
              en: "A more accurate answer than asking in general terms is to read 20 real adverts in your target market and see which language level keeps appearing.",
            },
          ],
        },
        {
          kind: "qa",
          q: {
            th: "อายุ 35 หรือ 40 แล้ว ยังไปได้ไหม",
            en: "I am 35 or 40 already. Can I still go?",
          },
          a: [
            {
              th: "อายุเพียงอย่างเดียวตอบไม่ได้ว่าคุณไปได้หรือไม่ สิ่งที่มีผลมากกว่าคือประสบการณ์ตรงกับตลาดแค่ไหน เส้นทางวีซ่ามีเงื่อนไขอย่างไร ภาษาอยู่ระดับใด และชีวิตของคุณยืดหยุ่นต่อการย้ายมากแค่ไหน",
              en: "Age alone cannot answer whether you can go. What matters more is how well your experience fits the market, what conditions the visa route has, what level your language is at, and how flexible your life is about moving.",
            },
            {
              th: "ในวัยนี้ ประสบการณ์และวุฒิภาวะอาจเป็นจุดแข็ง แต่การเปลี่ยนสายงานอาจต้องยอมเริ่มจากระดับที่ต่างจากเดิม แทนที่จะถามว่าอายุเท่านี้สายเกินไปหรือไม่ ให้ถามว่าตำแหน่งใดมองเห็นคุณค่าของประสบการณ์ที่คุณสะสมมาแล้ว",
              en: "At this age experience and judgement can be a strength, though changing field may mean accepting a different level to start from. Rather than asking whether this age is too late, ask which roles can see the value of the experience you have already built.",
            },
          ],
        },
        {
          kind: "qa",
          q: { th: "ต้องมีเงินเก็บเท่าไร", en: "How much do I need saved?" },
          a: [
            {
              th: "ไม่มีตัวเลขเดียวที่ใช้ได้กับทุกคน เพราะค่าใช้จ่ายต่างกันตามประเทศ เมือง และเส้นทางการย้าย",
              en: "There is no single number that works for everyone, because the costs differ by country, by city and by the route you take.",
            },
            {
              th: "ทำรายการค่าเดินทาง ค่ามัดจำและค่าเช่าเดือนแรก ค่าแปลและรับรองเอกสาร ค่าประกัน ค่าใช้ชีวิตระหว่างรอเงินเดือนก้อนแรก และค่าเล่าเรียนหากเลือกเส้นทางเรียนต่อ จากนั้นหาตัวเลขจริงของประเทศเป้าหมาย",
              en: "Make a list: travel, deposit and first month's rent, translating and certifying documents, insurance, living costs while you wait for the first salary, and tuition if you take the study route. Then find the real figures for your target country.",
            },
            {
              th: "อย่าหาค่าเฉลี่ยของยุโรป ให้หาจำนวนเดือนที่เงินของคุณจะซื้อเวลาให้ตัดสินใจได้โดยไม่ต้องรีบ",
              en: "Do not look for a European average. Look for the number of months your money buys you to decide without rushing.",
            },
          ],
        },
        {
          kind: "qa",
          q: {
            th: "ควรหางานให้ได้ก่อนย้าย หรือเรียนต่อก่อน",
            en: "Should I find the job before moving, or study first?",
          },
          a: [
            {
              th: "ขึ้นอยู่กับเงิน ภาษา และโอกาสได้รับการสปอนเซอร์ในสายงานของคุณ",
              en: "It depends on money, language, and how likely sponsorship is in your field.",
            },
            {
              th: "เส้นทางหางานให้ได้ก่อนย้ายเหมาะเมื่อมีนายจ้างพร้อมสปอนเซอร์วีซ่าให้ผู้สมัครในระดับของคุณ ส่วนเส้นทางเรียนต่อต้องใช้เงินก้อน แต่ช่วยให้มีเวลาอยู่ในประเทศ สร้างเครือข่าย และเข้าถึงโอกาสที่สมัครจากต่างประเทศได้ยากกว่า",
              en: "Finding the job first suits you when there are employers willing to sponsor a visa for candidates at your level. The study route needs a lump sum, but it buys you time in the country, a network, and access to openings that are harder to reach from abroad.",
            },
            {
              th: "หากเลือกเรียนต่อ อย่าดูแค่หลักสูตรหรือชื่อมหาวิทยาลัย ให้ตรวจโอกาสฝึกงาน เครือข่ายวิชาชีพ และสิทธิในการทำงานหลังเรียนจบด้วย",
              en: "If you choose to study, do not look only at the course or the name of the university. Check the internship opportunities, the professional network, and the right to work after graduating.",
            },
          ],
        },
        {
          kind: "qa",
          q: {
            th: "บริษัทสปอนเซอร์วีซ่าให้จริงหรือไม่",
            en: "Do companies really sponsor visas?",
          },
          a: [
            {
              th: "มีจริงในบางตำแหน่งและบางบริษัท แต่ไม่ได้หมายความว่าทุกบริษัทในประเทศนั้นจะสปอนเซอร์",
              en: "Yes, for some roles and some companies. It does not mean every company in that country sponsors.",
            },
            {
              th: "ความเป็นไปได้มักขึ้นอยู่กับประเภทงาน ระดับเงินเดือน ความขาดแคลนของทักษะ ขนาดบริษัท และเงื่อนไขของวีซ่า ประกาศงานบางตำแหน่งระบุไว้ชัดเจน หากไม่ระบุ คุณสามารถสอบถามก่อนสมัครได้",
              en: "Whether it happens usually depends on the type of work, the salary level, how short the skill is, the size of the company, and the conditions of the visa. Some adverts state it plainly. Where they do not, you can ask before applying.",
            },
          ],
        },
        {
          kind: "qa",
          q: {
            th: "วุฒิการศึกษาจากไทยใช้ได้หรือไม่",
            en: "Is a Thai qualification accepted?",
          },
          a: [
            {
              th: "ขึ้นอยู่กับอาชีพ งานด้านสุขภาพ กฎหมาย การศึกษา ความปลอดภัย และวิชาชีพที่มีการกำกับดูแลมักมีข้อกำหนดเพิ่มเติม คุณอาจต้องผ่านกระบวนการรับรองคุณวุฒิหรือขอใบประกอบวิชาชีพก่อนสมัครหรือเริ่มงาน",
              en: "It depends on the profession. Health, law, education, safety and other regulated professions usually carry extra requirements, and you may have to go through a recognition process or obtain a licence before you can apply or start.",
            },
            {
              th: "ควรตรวจสอบตั้งแต่ก่อนวางแผนสมัคร เพราะกระบวนการเหล่านี้ใช้ทั้งเวลาและค่าใช้จ่าย",
              en: "Check it before you plan around applying, because these processes cost both time and money.",
            },
          ],
        },
        {
          kind: "qa",
          q: {
            th: "ยังไม่พร้อม ควรรอให้พร้อมก่อนหรือไม่",
            en: "I am not ready. Should I wait until I am?",
          },
          a: [
            {
              th: "อย่ารอความพร้อมแบบที่ไม่มีคำนิยาม",
              en: "Do not wait for a readiness nobody has defined.",
            },
            {
              th: "คุณเริ่มหาข้อมูล เรียนภาษา ตรวจเส้นทางวีซ่า อ่านประกาศงาน และจัดระเบียบประสบการณ์ได้ตั้งแต่วันนี้ สิ่งที่ควรรอไม่ใช่การเริ่มต้น แต่คือการส่งใบสมัครจนกว่าจะรู้ว่ากำลังทดสอบอะไร",
              en: "You can start gathering information, learning the language, checking visa routes, reading job adverts and organising your experience today. What should wait is not starting. It is sending applications, until you know what you are testing.",
            },
            {
              th: "การเตรียมตัวกับการสมัครงานไม่จำเป็นต้องเริ่มวันเดียวกัน",
              en: "Preparing and applying do not have to begin on the same day.",
            },
          ],
        },
        {
          kind: "qa",
          q: {
            th: "ใช้เวลานานแค่ไหนกว่าจะได้งาน",
            en: "How long does it take to get a job?",
          },
          a: [
            {
              th: "ไม่มีระยะเวลาที่ใช้ได้กับทุกคน เพราะขึ้นอยู่กับอาชีพ ภาษา เส้นทางการย้าย คุณภาพของโปรไฟล์ และความเจาะจงของการค้นหา",
              en: "There is no timeframe that applies to everyone, because it depends on the profession, the language, the route, the quality of the profile, and how specific the search is.",
            },
            {
              th: "สองเรื่องที่ทำให้ใช้เวลานานขึ้นอย่างชัดเจนคือ การเริ่มสมัครก่อนรู้ว่าตัวเองเสนออะไรให้ตลาด และการเล็งหลายประเทศที่ไม่มีเหตุผลร่วมกัน",
              en: "Two things clearly make it take longer: starting to apply before you know what you are offering the market, and aiming at several countries with no shared reason connecting them.",
            },
            {
              th: "คุณควบคุมวันที่จะได้รับข้อเสนองานไม่ได้ แต่ควบคุมได้ว่าทุกสัปดาห์จะลดความไม่แน่นอนลงกี่เรื่อง",
              en: "You cannot control the day an offer arrives. You can control how many uncertainties you remove each week.",
            },
          ],
        },
      ],
    },
  ],
};
