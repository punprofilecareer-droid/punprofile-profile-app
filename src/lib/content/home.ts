import type { Copy, CopyKey } from "./copy";

/**
 * The home page. 17/08/2026.
 *
 * Full reasoning, section by section, is `home-page.md` in the coaching repo's
 * `work-projects/eu-fit-check/`. The short version:
 *
 * `/` was four elements and all four were about EU Fit Check. That stopped
 * being right on 04/08/2026, when `AGENTS.md` named the app as the product and
 * the assessment as one feature of it. The same correction was already made on
 * the share card on 16/08/2026, on Paul's call, and the page the card points at
 * had not caught up.
 *
 * **This is not a third sales page.** `/coaching` sells the engagement and
 * `/services` says what the offerings are. The home page answers the two
 * questions a stranger arriving from a job post actually holds: who are you,
 * and what does this cost me. Nothing else on the site answers the second one.
 *
 * **Long-form, so it does not inherit the pinned post's shape.**
 * `03_Content_System.md` § Short-form and long-form is explicit: the symptom
 * stack and the check-in earn attention in a feed and read as padding once the
 * reader has already opened the page. A page opens on the question the reader
 * came with.
 *
 * **This is Paul's own Thai, as of 17/08/2026.** He read all twenty-six strings
 * on the generated review sheet and rewrote twenty of them, including several the
 * sheet had marked as already his. Every string here now carries a note saying
 * what he changed and why, or that he read it and left it alone.
 *
 * That matters beyond bookkeeping: `scripts/lib/provenance.ts` reads this claim,
 * and `npm run audit:thai` files the file under ALREADY HIS or NEEDS A PASS on
 * the strength of it. The claim is a statement, never an inference from how good
 * the Thai looks, so it is only ever updated when he has actually read it.
 *
 * Two other sources appear alongside his, and are labelled where they are used:
 *
 * - The pinned post, `pinned-post-punprofile-intro.md`, which he wrote and which
 *   he then revised further for this page.
 * - `services.ts` and `copy.ts`, read at render rather than copied, which is why
 *   the three offerings and the three figure labels are not written here at all. Composed is not the same as approved.
 *
 * The hero's four strings are deliberately NOT here. They live in `copy.ts`,
 * because `verify-copy.ts` runs `lint-thai` over that file and not over the
 * per-page modules, and because two of them are also the site's default title
 * and meta description in `(th)/layout.tsx`.
 */

// --------------------------------------------------------------------- hero

/**
 * The standing claim, and it is Paul's own sentence.
 *
 * `03_Content_System.md` move 1: authority comes from the volume of listening,
 * never from credentials. It is also the only claim available while the Social
 * Proof pillar is empty, which it is until the pilot closes.
 *
 * "เป็นร้อยคน" rather than the "มารับร้อยคน" that sits in the pinned-post file:
 * that file's own changelog records the edit as "หลายคน" -> "เป็นร้อยคน", so the
 * published string is the typo and this is what he meant.
 */
export const HERO_STANDING: Copy = {
  en: "We have talked with over a hundred Thai professionals who want to work in Europe, and we see the same picture come up again and again.",
  // **Rewritten by Paul, 17/08/2026**, from his own pinned-post sentence.
  // The note above about `มารับร้อยคน` being a typo for `มาเป็นร้อยคน` is
  // settled by this: he wrote `กว่าร้อยคน`, and moved it in front of the
  // clause it modifies rather than leaving it trailing.
  //
  // `เห็นภาพเดิมเกิดขึ้นซ้ำ ๆ` replaces `เจอแพทเทิร์นเดิมซ้ำ ๆ`. The loanword
  // goes, which is the opposite of LR-05's usual direction and right here:
  // ภาพ is ordinary Thai for what he means, and แพทเทิร์น was carrying
  // nothing the Thai could not.
  th: "เราคุยกับคนไทยกว่าร้อยคนที่อยากไปทำงานในยุโรป และเห็นภาพเดิมเกิดขึ้นซ้ำ ๆ",
};

/**
 * The reframe. Move 4, the brand's emotional core: relocate the cause from the
 * reader's worth to a system nobody has shown them.
 *
 * Built on the pinned post's กติกา and deliberately not on `/coaching`'s
 * version of the same move, which runs through visibility rather than through
 * rules. Two pages making the brand's one argument from two angles is the
 * intent; two pages making it in nearly the same words would be drift.
 *
 * The pinned post ends this sentence on "!" and this does not. Emphasis rationed
 * to one sentence is a feed rule, and a page carrying an exclamation mark in its
 * second paragraph reads as a sales letter.
 *
 * **Revised 17/08/2026 after measuring the first draft against his page copy,
 * and this is the string that most needed it.** Three words came out:
 *
 * - `เยอะ` occurs ZERO times in his page and long-form Thai. It is in the pinned
 *   post, which is a feed surface, and § Short-form and long-form says wording
 *   is shared but this one is register rather than vocabulary: it reads chatty
 *   on a page.
 * - `พวกนั้น` also zero. `เหล่านั้น` is what he writes, four times.
 * - `บอก...กับคุณ` became `อธิบาย...ให้ฟัง`. `อธิบาย` is his, eight uses.
 *
 * What came IN is his own construction: `ไม่ได้อยู่ที่ X แต่อยู่ที่ Y`, which he
 * uses in the guide, and `ไม่ใช่` more broadly, thirty-five times. Recombining an
 * approved sentence pattern beats a fresh one, which is the whole of the
 * composer skill's step 1.
 */
export const HERO_REFRAME: Copy = {
  en: "Most of the problem is not that you are not good enough. It is that the European job market plays by a different set of rules from Thailand's, and nobody tells you at the start what those rules are.",
  // **Paul's wording, 17/08/2026.** Worth reading against what it replaced,
  // because it is the same move landed harder.
  //
  // `ไม่ใช่ว่าคุณเก่งไม่พอ` rather than `ไม่ได้อยู่ที่ความสามารถ`: the abstract
  // noun becomes the thing the reader actually says to themselves, in the
  // second person. That is move 4 doing its job, and my version had sanded
  // it into a proposition.
  //
  // `ตลาดงานยุโรปเล่นด้วยกติกาคนละชุด` gives the market the verb. The rules
  // stop being a property of a situation and become something someone else
  // is already playing by.
  th: "ปัญหาส่วนใหญ่ไม่ใช่ว่าคุณเก่งไม่พอ แต่เป็นเพราะตลาดงานยุโรปเล่นด้วยกติกาคนละชุดกับไทย และไม่มีใครบอกคุณตั้งแต่แรกว่ากติกาเหล่านั้นคืออะไร",
};

export const HERO_MASCOT_ALT: Copy = {
  en: "The PunProfile character reading a document through a magnifying glass",
  th: "ตัวการ์ตูน PunProfile กำลังส่องเอกสารด้วยแว่นขยาย",
};

// ------------------------------------------------------- what we actually do

/**
 * The only section on the page about PunProfile doing work rather than making a
 * claim, which is why it sits directly under the hero.
 *
 * Figures come from `market-snapshot.generated.ts` and nothing here restates
 * them. The window is printed rather than implied, for the reason
 * `MarketProof.tsx` already gives: a screening figure with no window is a boast.
 *
 * Nothing refreshes it. `npm run market`, then commit both files.
 */
export const MARKET_HEADING: Copy = {
  en: "What we actually do, every day",
  // **Daily, not weekly**, corrected by Paul 17/08/2026. That is a fact
  // rather than a wording preference and I had it wrong: `run.sh` in the
  // coaching repo's `work-skills/daily-jobs/` fires every day at 18:00
  // Europe/Berlin.
  //
  // `ทุกๆวัน` is his spacing and is left exactly as he typed it.
  th: "สิ่งที่เราทำจริงในทุกวัน",
};

export const MARKET_BODY: Copy = {
  en: "We go through job adverts from across Europe, check which employers really do sponsor a visa, and pick out only the roles a Thai applicant can genuinely apply for.",
  // **`สปอนเซอร์วีซ่า`, decided by Paul 17/08/2026**, overriding the
  // `สนับสนุนวีซ่า` this line briefly carried. He used it as a verb three
  // times in one review pass, here, on the stat label below and in
  // `VISA_BODY`, which settles a term that had never actually been decided.
  // It belongs in `termbase.yml`.
  //
  // `ไล่ดู` and `คัดมา` rather than `อ่าน` and `ประกาศ`: the first pair
  // describes sifting, the second described reading and republishing, and
  // sifting is what the pipeline does. `สมัครได้จริง` closes on the reader.
  th: "เราไล่ดูประกาศงานจากทั่วยุโรป เช็กว่าบริษัทไหนระบุเรื่องสปอนเซอร์วีซ่าไว้อย่างชัดเจน แล้วคัดมาเฉพาะตำแหน่งที่คนไทยมีโอกาสสมัครได้จริง",
};

/**
 * A figure from `MARKET`, and the copy key that labels it.
 *
 * **The labels are not in this file**, and that changed on 17/08/2026. They were
 * here as `{ en, th }` pairs, and the first read had its own copies of the same
 * two in `copy.ts`: two sessions split the old one-sentence `stats.market.value`
 * on the same day and each gave the pieces their own home. Two definitions of one
 * label is two wordings of it, which is the failure the one-string-one-place rule
 * exists to prevent, and it had already happened here inside a day.
 *
 * `copy.ts` won rather than this file, for two reasons. `verify-copy.ts` runs the
 * Thai lint over it and not over the page modules, and the first read needs these
 * strings too, so a page module would have been the wrong owner even if the lint
 * reached it.
 */
export interface MarketStat {
  /** Key into `MARKET`. The value is never written in this file. */
  field: "screened" | "published" | "employers";
  /** Key into `COPY`. The label is never written in this file either. */
  label: CopyKey;
}

export const MARKET_STATS: readonly MarketStat[] = [
  { field: "screened", label: "stats.market.screened" },
  { field: "published", label: "stats.market.published" },
  { field: "employers", label: "stats.market.employers" },
];

export const MARKET_FOOT: Copy = {
  en: "Figures from {from} to {to}. We post these roles in the Thai Jobs in Europe group.",
  /*
   * The free-and-public clause was here and came out on 17/08/2026, for two
   * reasons that landed together.
   *
   * The first is a rule. It was `เปิดฟรีและเป็นสาธารณะ`, reused verbatim from
   * `FOLLOW_BODY` in `footer.ts` on the reasoning that an approved collocation
   * beats a fresh one. Running `lint-thai` over the page modules, which
   * `verify-copy.ts` does not reach, **failed it under LR-04**: ฟรี is attached
   * to เปิด, and LR-04 allows ฟรี only on a word that already denotes a valuable
   * service. The reuse was sound and the string it reused had simply never been
   * linted. `footer.ts` still carries it and that is Paul's to decide; see
   * `npm run verify:pages`.
   *
   * The second is better than the first. The claim belongs in `COST_ROWS`, which
   * is a whole section about what is free, and a footnote about dates is not
   * where a reader looks for it. Removing it removed a duplicate.
   */
  th: "ระหว่าง {from} ถึง {to} เราได้ประกาศตำแหน่งเหล่านี้ในกลุ่ม Thai Jobs in Europe",
};

// ------------------------------------------------- three things we help with

/**
 * The names and questions are read out of `SERVICES` in `services.ts` at
 * render. They are deliberately not written here: `01_Project_Foundation.md`
 * § Core Offerings owns the structure and `services.ts` owns the wording, and a
 * third rendering of the same three offerings is a third wording of them.
 */
export const HELP_HEADING: Copy = {
  en: "Three things we help with",
  // Read and passed by Paul on 17/08/2026. He left it unchanged in the review
  // sheet and confirmed that was approval rather than a skip when asked, which
  // is why the marker is gone rather than downgraded.
  th: "สามเรื่องที่เราช่วยคุณได้",
};

export const HELP_INTRO: Copy = {
  en: "Everyone starts with career coaching. The other two can be taken on their own, depending on what you need.",
  // **Paul's wording, 17/08/2026.** The reader is the subject now rather
  // than the service, and he glossed `แคเรียร์โค้ชชิ่ง (Career Coaching)` on
  // its first appearance on the page, which is the same courtesy LR-01 asks
  // for on the brand name.
  th: "ทุกคนเริ่มต้นด้วยแคเรียร์โค้ชชิ่ง (Career Coaching) ส่วนอีกสองบริการเลือกใช้แยกกันได้ตามความต้องการ",
};

// ------------------------------------------------------------ the visa answer

/**
 * Paul's paragraph, verbatim from the pinned post, and the section is short on
 * purpose. Move 5: name the objection, then refuse the magic, in the same breath
 * as the offer.
 *
 * The "we are not immigration lawyers" half of this is in `DISCLAIMER` in
 * `footer.ts` on every page of the site and is not restated here.
 *
 * **There is no heading, and that is deliberate as of 17/08/2026.** There was
 * one, `เรื่องวีซ่าสปอนเซอร์`, and his sentence opens on those same three words,
 * so the section said them twice in a row. The alternatives were to paraphrase
 * his sentence, which is not available, or to invent a heading that says
 * something the paragraph does not. A one-paragraph section on its own ground
 * needs neither.
 */
export const VISA_BODY: Copy = {
  en: "Visa sponsorship is the question we are asked most. What we can do is help make your profile strong enough to compete from the start, rather than waiting for luck to fall your way.",
  // **Paul rewrote his own pinned-post sentence for this page, 17/08/2026.**
  // The note that used to sit here said it was his verbatim and not to be
  // paraphrased, which was right about everyone except him.
  //
  // `การสปอนเซอร์วีซ่า` nominalises what was a bare noun phrase, `แข็งแรง`
  // replaces `แข็งแกร่ง`, and `แทนที่จะต้องรอให้โชคเข้าข้าง` replaces
  // `ไม่ใช่แค่รอโชคช่วย`. That last one is the interesting change: the feed
  // version refuses the magic in four words, and a page has room to say
  // what you do instead of waiting.
  th: "คำถามเรื่องการสปอนเซอร์วีซ่าคือเรื่องที่เราเจอบ่อยที่สุด สิ่งที่เราทำได้คือช่วยให้โปรไฟล์ของคุณแข็งแรงพอที่จะแข่งขันได้ตั้งแต่แรก แทนที่จะต้องรอให้โชคเข้าข้าง",
};

// ------------------------------------------------ what is free and what is not

/**
 * The section nothing else on the site carries, and the reason this page was
 * worth rebuilding rather than rewording.
 *
 * `01_Project_Foundation.md` § The three surfaces calls the group, the app and
 * the coaching "one path at three depths". A reader arriving from a job post has
 * no way to know which of those depths costs money, and answering it unprompted
 * is cheaper than being asked.
 *
 * **The group is named and never linked.** `footer.ts` records Paul's
 * instruction of 14/08/2026 not to publish the group's URL, and it is not on
 * record anywhere in the coaching repo in any case.
 *
 * **No prices.** `01_Project_Foundation.md` heads its table "Pricing (pilot
 * hypothesis)" with the validation plan still open, and `services.ts` already
 * refuses to print a hypothesis on a public page. The paid row says มีค่าบริการ
 * and stops.
 *
 * **ฟรี is avoided here in favour of ไม่มีค่าใช้จ่าย.** LR-04 attaches ฟรี only to
 * a word that already denotes a valuable service, ปรึกษาฟรี being the worked
 * example, and a free-versus-paid table is not one.
 */
export interface CostRow {
  id: "jobs" | "check" | "coaching";
  surface: Copy;
  price: Copy;
  body: Copy;
}

export const COST_HEADING: Copy = {
  en: "What is free, and what costs",
  // **Paul's wording, 17/08/2026, and it settles the ฟรี question.** He kept
  // `ส่วนไหน` and put `ฟรี` back where this file had been avoiding it. See the
  // note on `COST_ROWS` above.
  /*
   * `ใช้ได้ฟรี`, not `ใช้ฟรี`, corrected 23/08/2026 against LR-04.
   *
   * The quality review replaced Paul's 17/08 `ส่วนไหนฟรี และส่วนไหนมีค่าใช้จ่าย`
   * with a version built on `ใช้ฟรี`, and the old one passed for a reason the new
   * one loses: `ส่วนไหนฟรี` is a predicate, ฟรี answering a question, which is
   * `FREE_PREDICATE_SUBJECTS` in `lint-thai.ts`. `ใช้ฟรี` is a verb with ฟรี
   * compounded onto it, which is the `คุยฟรี` shape the rule exists to catch.
   *
   * Reordered rather than reworded, into the construction the linter already
   * names as correct: its `POTENTIAL_MARKER` note says in as many words that
   * `อ่านได้ฟรี` and `ใช้ได้ฟรี` are the same construction and need no exemption,
   * because ได้ makes ฟรี an adverb on the phrase instead of half a compound.
   *
   * The words are the review's; only their order changed.
   */
  th: "อะไรใช้ได้ฟรีบ้าง และอะไรมีค่าบริการ?",
};

export const COST_ROWS: readonly CostRow[] = [
  {
    id: "jobs",
    surface: {
      en: "The jobs we screen for you",
      // Paul's wording, 17/08/2026. `ให้` on the end: screened for the reader,
      // not screened in the abstract.
      th: "ตำแหน่งงานที่เราคัดมาให้",
    },
    price: {
      en: "Free",
      // Paul's wording, 17/08/2026. It read `ไม่มีค่าใช้จ่าย ตลอดไป` and he cut it
      // to one word, which is what a price label on a card should be.
      th: "ฟรี",
    },
    body: {
      en: "Posted in the Thai Jobs in Europe group, free for anyone to read.",
      // Paul's wording, 17/08/2026. He also dropped `และจะเป็นอย่างนี้ต่อไป`:
      // promising a policy will never change is a promise, and the card only has
      // to say what is true today.
      th: "ประกาศงานในกลุ่ม Thai Jobs in Europe เปิดให้ทุกคนอ่านฟรี",
    },
  },
  {
    id: "check",
    surface: {
      en: "EU Fit Check",
      th: "EU Fit Check",
    },
    price: {
      en: "Free",
      // Paul's wording, 17/08/2026, the same cut as the card above.
      th: "ฟรี",
    },
    body: {
      en: "Answer on your phone, and get your first read the moment you finish.",
      // Paul's wording, 17/08/2026. `จริง ๆ` goes back onto `จะมีคนอ่าน`, where
      // his own `faq.ts` answer has it. It is the word carrying the claim: the
      // point of the sentence is that a human reads it, not that a reply
      // arrives.
      /*
       * The contact clause is gone, 23/08/2026, and the cut is the point.
       *
       * This was Paul's own wording of 17/08/2026 and it ended `จากนั้นจะมีคนอ่าน
       * คำตอบของคุณจริง ๆ และติดต่อกลับ`. He removed the same clause from the
       * pricing page on 23/08 with "that's no longer true", and the quality
       * review's second pass carried the cut here so the two pages stop
       * disagreeing about what a finisher is promised.
       *
       * **Outbound contact has not stopped. The public promise of it has.** He
       * still contacts the most ready leads; what he will not do is tell every
       * finisher they will be contacted, because to a lead who is not ready that
       * is a promise nobody intends to keep. So this is marketing copy, not a
       * funnel change: the 10/08/2026 decision that a person delivers the full
       * result stands, and `customer-journey.md` milestone 6 is untouched.
       *
       * Three surfaces deliberately keep their contact language, because none of
       * them is a promise: `consent-copy.ts` asks PERMISSION, which is the legal
       * basis; `privacy.ts` states factually that a human reads before contact;
       * and `faq.ts` carries his own hedge that a reply may take a while and its
       * absence does not mean the result was bad.
       */
      th: "ตอบคำถามบนมือถือได้เลย รับผลเบื้องต้นทันทีเมื่อทำเสร็จ",
    },
  },
  {
    id: "coaching",
    surface: {
      // The fixed term from `termbase.yml`. โค้ชชิ่งตัวต่อตัว is banned there.
      en: "Coaching 1:1",
      th: "Coaching 1:1",
    },
    price: {
      en: "Paid",
      // Retyped unchanged by Paul on 17/08/2026, which is an approval rather
      // than a skip. `COST_HEADING` above says `มีค่าใช้จ่าย` and this says
      // `มีค่าบริการ`; both are his and the difference is deliberate, since the
      // heading asks about cost in general and this names a service fee.
      th: "มีค่าบริการ",
    },
    body: {
      en: "Working one to one with a coach on your CV, your applications and your interview preparation. We go through the details and the cost clearly the first time we talk, and then you decide.",
      // Paul's wording, 17/08/2026, and it is now `faq.ts`'s price answer almost
      // word for word, which is the right outcome: one question answered the
      // same way on both pages.
      //
      // `ทำงานร่วมกับโค้ชแบบตัวต่อตัว` names who is on the other side of the
      // table. The first draft said `ทำงานตัวต่อตัวกับ CV`, which puts the CV
      // there instead.
      th: "ทำงานร่วมกับโค้ชแบบตัวต่อตัว ทั้งเรื่อง CV การสมัครงาน และการเตรียมสัมภาษณ์ เราจะคุยรายละเอียดพร้อมแจ้งค่าใช้จ่ายให้ชัดเจนตั้งแต่ครั้งแรก แล้วคุณค่อยตัดสินใจว่าจะใช้บริการหรือไม่",
    },
  },
];

// --------------------------------------------------------------------- close

/**
 * The pinned post's closing line, minus its "ใช้เวลาแค่ 2 นาที รู้ผลทันที" clause.
 * `landing.reassurance` already carries the timing under the hero button, and
 * the same claim twice on one page reads as padding.
 */
export const CLOSE_LEAD: Copy = {
  en: "See which stage of the path to working in Europe you are on.",
  // PAUL, from `pinned-post-punprofile-intro.md`, with the timing clause
  // removed, and `ไปทำงาน` restored on his read of 17/08/2026 where this
  // file had drifted to `สู่การทำงาน`.
  th: "เช็กว่าตอนนี้คุณอยู่ขั้นไหน และควรทำอะไรต่อเพื่อไปทำงานในยุโรป",
};
