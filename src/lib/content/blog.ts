import type { Copy } from "./copy";

/**
 * The blog. 16/08/2026.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS IS FOR
 * ---------------------------------------------------------------------------
 *
 * `nurture-flow.md` in the coaching repo already ruled on the format, and the
 * ruling is narrower than "we should have a blog": **the blog is the surface,
 * not the payload.** Its job is search, and a link that renders a preview when
 * it is pasted into LINE. So the two things this build actually owes are a real
 * URL per article and honest per-article metadata, which is why the article
 * route is a server component with its own `generateMetadata` rather than
 * another `"use client"` page like the rest of the site.
 *
 * ---------------------------------------------------------------------------
 * IT SHIPPED EMPTY, ON PURPOSE
 * ---------------------------------------------------------------------------
 *
 * `POSTS` is `[]`, and that is the state Paul chose on 16/08/2026 rather than a
 * half-finished build. Three articles were prepared from
 * `golden-th/other/thai-europe-job-guide.md`, the only Thai in either repo
 * confirmed to be his own, and he held all three. They are queued in the
 * coaching repo's `blog-queue.md` with their slugs, pillars, citation maps, line
 * ranges into the Thai source and finished English.
 *
 * **An empty blog must not advertise itself**, so the menu entry, the footer
 * link and the sitemap all read `POSTS.length`. Filling this array is the whole
 * of publishing; nothing else in the app has to be touched, and nothing has to
 * be decided twice.
 *
 * Two rules the queued articles are already shaped by, and any future one must
 * be:
 *
 * - **LR-09: Thai is composed in Thai, never translated into it.** Which means
 *   an article cannot start life as an English draft. It starts as Paul's Thai,
 *   and the English is the translation, the same direction the FAQ runs in.
 *   Where the two disagree the Thai is right.
 * - **Citations sit on the paragraph whose claim they support**, never in a pile
 *   at the foot. `03_Content_System.md`'s quality checklist requires every fact
 *   to trace to the specific source cited, and a footnote list lets a paragraph
 *   borrow the authority of a source that says something else.
 *
 * ---------------------------------------------------------------------------
 * WHAT WAS TAKEN FROM THE REFERENCE, AND WHAT WAS NOT
 * ---------------------------------------------------------------------------
 *
 * Structure from the competitor blog named in `competitive-reference.md`, which
 * `footer.ts` already borrowed from and which is confidential and never named on
 * a candidate-facing surface. Taken: a hero that opens on the reader's question,
 * a topic row, cards carrying category and date, and a category on the article
 * itself.
 *
 * **Not taken, and each is a decision rather than an omission:**
 *
 * - **The email capture.** Theirs leads with a field and "one insight a week".
 *   `footer.ts` refused the same thing on the same grounds and the grounds have
 *   not changed: no send path, no marketing consent, and an email field under
 *   PDPA with no lawful basis is a compliance problem rather than a flourish.
 * - **The "start with the playbooks" block, search, and pagination.** All three
 *   are devices for navigating a large archive. Build them when there is an
 *   archive: roughly ten articles for the first, more for the others.
 * - **Per-article illustrations.** The three mascot assets in `public/` belong to
 *   the three services and are captioned as those services on `/services`.
 *   Reusing them here would caption an article with a picture of something else.
 *   The cards carry a topic wash instead, which is the system's own device
 *   (`design.md` § Colors) and needs no asset that does not exist.
 */

/**
 * Topics, which are `Content_Strategy.md`'s five content pillars and not a new
 * taxonomy. That document owns what gets written and why; inventing a second set
 * of buckets here would put the blog's shelves out of step with its production
 * plan on day one.
 *
 * Two are declared with nothing in them, on purpose. `stories` is the Social
 * Proof pillar, which that document records as empty because the business is
 * pre-pilot and there is no client outcome to write up. `questions` is the
 * FAQ / objection-handling pillar, whose brief exists in the survey's free-text
 * answers and whose articles do not. The index renders a topic only when it has
 * an article, so an empty pillar is invisible to a reader and legible to whoever
 * writes the next piece.
 */
export type TopicId = "how-to" | "market" | "perspective" | "questions" | "stories";

export interface Topic {
  id: TopicId;
  label: Copy;
  /**
   * The wash this topic's cards and article header take, from `design.md`'s
   * section washes. One per topic and never blended, which is the same rule the
   * services page follows with the mascot panels.
   */
  wash: string;
}

export const TOPICS: readonly Topic[] = [
  {
    id: "how-to",
    // The loanword, per LR-05: Thai career writing says "How to" and any Thai
    // compound built for it reads as an invention. The rule's own worked example
    // is แบบเช็ก, a compound assembled to avoid saying "survey".
    // `How-to` in both, corrected 17/08/2026. Paul hyphenated it on the review
    // sheet, matching the pillar's own name in `Content_Strategy.md`.
    label: { en: "How-to", th: "How-to" },
    wash: "var(--color-secondary-container)",
  },
  {
    id: "market",
    label: { en: "The European job market", th: "ตลาดงานยุโรป" },
    wash: "var(--color-primary-container)",
  },
  {
    id: "perspective",
    label: { en: "Perspective", th: "มุมมอง" },
    wash: "var(--color-tertiary-container)",
  },
  {
    /*
     * **Was Client stories until 17/08/2026.** Paul relabelled it on the review
     * sheet to `เรื่องที่หลายคนกังวล`, the things many people worry about, which
     * is what the `questions` topic beside it already said. Two buttons meaning
     * the same thing on one row reads as a bug, so `questions` is deleted rather
     * than both being kept.
     *
     * **Which of the two survives is the decision, and it is his.** Client
     * stories is `Content_Strategy.md`'s Social Proof pillar, which that document
     * records as empty because PunProfile is pre-pilot: the topic had no articles
     * and no prospect of any until the first client outcome exists. The worries
     * topic has the content brief already written, in the open-text answers of
     * the Lead Discovery Survey.
     *
     * So this is the pillar with something to say taking the slot from the one
     * without. When Social Proof has outcomes to show, it comes back as its own
     * topic rather than by editing this label a second time.
     */
    id: "stories",
    label: { en: "What people worry about", th: "เรื่องที่หลายคนกังวล" },
    wash: "var(--color-primary-container)",
  },
];

export const topicById = (id: TopicId): Topic =>
  TOPICS.find((t) => t.id === id) ?? TOPICS[0];

/**
 * A citation, rendered under the paragraph whose claim it supports rather than
 * gathered into a list at the foot.
 *
 * That placement is the point. `03_Content_System.md` § Content Quality
 * Checklist requires that every fact trace to the specific source being cited,
 * and a footnote pile lets a paragraph borrow the authority of a source that
 * says something else. Two of these three articles carry numbers from the
 * European Commission, the European Labour Authority and the WEF, and a reader
 * has to be able to see which number came from which without counting.
 *
 * `label` is the publisher and is not translated: it is a name.
 */
export interface Cite {
  label: string;
  href: string;
}

export type Block =
  | { kind: "p"; text: Copy; cite?: Cite }
  | { kind: "list"; items: readonly Copy[]; ordered?: boolean };

export interface Section {
  /** Absent on the opening section, which runs straight on from the title. */
  heading?: Copy;
  body: readonly Block[];
}

export interface Post {
  slug: string;
  topic: TopicId;
  /**
   * A cornerstone piece, shown in the "start here" block above the grid.
   *
   * A property of the article rather than a sixth topic, because a playbook has
   * a topic like anything else: `Content_Strategy.md` lists Playbooks as a
   * pillar in its own right since 16/08/2026, and the pillar describes the
   * article's ROLE while `topic` describes its subject. The reference blog this
   * was taken from shows the same thing, since every card in its playbooks block
   * still carries a category above the title.
   */
  playbook?: boolean;
  /** ISO, for `<time dateTime>` and metadata. Rendered DD/MM/YYYY. */
  published: string;
  title: Copy;
  /** One line. The card, and the share preview a LINE paste renders. */
  summary: Copy;
  sections: readonly Section[];
  /** Paul's closing question, where the piece has one. */
  question?: Copy;
}

/**
 * Newest first. The index reads this order and does not sort, so the running
 * order is editable here rather than being a property of the dates.
 */
export const POSTS: readonly Post[] = [
  // Empty on purpose, and this is the state the section shipped in.
  //
  // Three articles were prepared from `golden-th/other/thai-europe-job-guide.md`
  // and Paul held all three on 16/08/2026. They are queued in the coaching
  // repo's `blog-queue.md`, which carries the slug, the pillar, the citation
  // map, the line ranges into the Thai source and the finished English, so
  // publishing them is filling this array rather than deciding anything again.
  //
  // Nothing else in the app needs changing when they land. The menu entry, the
  // footer link and the sitemap all read `POSTS.length`, so they appear on
  // their own and an empty blog is never advertised.
];

export const postBySlug = (slug: string): Post | undefined =>
  POSTS.find((p) => p.slug === slug);

/**
 * The cornerstone pieces, in running order.
 *
 * The block that renders these is hidden when there are fewer than two, which
 * is the same judgement the empty blog makes about its own menu entry: pointing
 * at one article out of one is not a recommendation, it is the list again with
 * a heading on top.
 */
export const playbooks = (): Post[] => POSTS.filter((p) => p.playbook);

/** Topics that actually have an article, in `TOPICS` order. */
export const usedTopics = (): Topic[] =>
  TOPICS.filter((t) => POSTS.some((p) => p.topic === t.id));

/**
 * DD/MM/YYYY, the house convention, formatted without `toLocaleDateString`.
 *
 * The locale API would render Thai dates in the Buddhist era on a Thai locale
 * and Gregorian on an English one, so the same article would appear to be from
 * 2569 and 2026 depending on which button the reader last pressed. The house
 * rule is one format, and this is it.
 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// The index page's own copy. Kept here beside the articles rather than in
// `copy.ts`, which is the pattern `faq.ts` and `services.ts` already follow: a
// page whose content is a body of prose owns its prose, and `copy.ts` holds the
// interface chrome that the worksheet round-trips.
// ---------------------------------------------------------------------------

export const BLOG_HEADING: Copy = {
  // Paul's wording, 17/08/2026. It was a description of the blog's method,
  // "explained one piece at a time"; his is a promise about what the reader gets
  // out of it. `ลงหลักปักฐาน`, putting down roots, is the first time anything on
  // this site names the actual end state rather than the job.
  en: "Stories from Europe, on the road to settling there",
  th: "เรื่องเล่าจากยุโรป บนเส้นทางสู่การลงหลักปักฐาน",
};

export const BLOG_INTRO: Copy = {
  // "Not shortcuts" is the pinned post's move 5, name the objection and refuse
  // the magic, in the smallest form it comes in. A career blog's first promise
  // is usually a shortcut, and this one says at the top that it is not one.
  // Paul's wording, 17/08/2026. He wrote two versions on the review sheet and
  // chose this one, the later of the two.
  //
  // Three changes from what it replaced, and the last is the one that matters.
  // `การหางานในยุโรป` rather than `ตลาดงานยุโรป`: the reader's activity rather
  // than the subject area. `ข้อมูลจริงที่ตรวจสอบได้` rather than
  // `สิ่งที่ตรวจสอบได้`. And the closing clause is now an argument rather than a
  // label: `ไม่ใช่สูตรลัดที่ฟังดูดีแต่ใช้จริงไม่ได้`, not shortcuts that sound
  // good and do not work, where it had said only "not shortcuts".
  //
  // His other draft closed on `ไม่ขายฝันด้วยสูตรลัด`, we do not sell dreams. He
  // did not pick it, and it is worth recording why that is the right call: it
  // accuses the rest of the market, and nothing else on this site does.
  en: "Articles on finding work in Europe: visas, CVs and getting ready. Written from real information you can check, not shortcuts that sound good and do not work.",
  th: "รวมบทความเรื่องการหางานในยุโรป วีซ่า เรซูเม่ และการเตรียมตัว เขียนจากข้อมูลจริงที่ตรวจสอบได้ ไม่ใช่สูตรลัดที่ฟังดูดีแต่ใช้จริงไม่ได้",
};

export const BLOG_TOPICS_LABEL: Copy = { en: "Pick a topic", th: "เลือกหัวข้อ" };

export const BLOG_ALL: Copy = { en: "All", th: "ทั้งหมด" };

export const BLOG_BACK: Copy = { en: "All articles", th: "บทความทั้งหมด" };

export const BLOG_EMPTY: Copy = {
  en: "Nothing in this topic yet.",
  // Paul's wording, 17/08/2026. He cut `ลองดูหัวข้ออื่น`: the topic row is
  // directly above this line, so telling the reader to try another one is
  // narrating a control they can already see.
  th: "ยังไม่มีบทความในหัวข้อนี้",
};

/**
 * The whole blog, empty. A different string from the one above and not a reuse
 * of it: "nothing under this topic" tells a reader to try another topic, and
 * there are no other topics to try. Saying so plainly is the honest version, and
 * the page still carries its action, so nobody arrives at a dead end.
 */
export const BLOG_NONE_YET: Copy = {
  en: "There is nothing to read yet. We are writing the first one.",
  // Paul's wording, 17/08/2026, and this is the one that matters most on
  // this page: with no articles published it is the only Thai a visitor to
  // `/blog` actually sees. `ให้อ่าน` says what is missing from the reader's
  // side, and `เรา` puts someone behind the work rather than leaving it as
  // a state the page is in.
  th: "ตอนนี้ยังไม่มีบทความให้อ่าน เรากำลังเขียนชิ้นแรกอยู่",
};

export const BLOG_QUESTION_LABEL: Copy = {
  // Paul's own label, from the second of the two pieces that closes on a
  // question. See the note at the top of this file on why it replaced the other.
  en: "A question for you",
  th: "คำถามสำหรับคุณ",
};

export const BLOG_READ: Copy = { en: "Read", th: "อ่านบทความ" };

// ---------------------------------------------------------------------------
// The "start here" block, and the email capture above it.
//
// Both were asked for on 16/08/2026 after a look at the reference blog, and
// both were among the things the first build deliberately left out. The
// reasoning that ruled them out has changed for one and not the other, so it is
// worth being exact about which:
//
// - **The capture is now buildable.** `footer.ts` refused the same field on
//   PDPA grounds, "no sending infrastructure and no consent copy covering a
//   marketing list". Since 15/08/2026 the consent log records a `marketing`
//   purpose per channel, withdrawal is a real mechanism, and the privacy notice
//   covers it. What is left is Paul's read of the Thai, so this is gated on
//   `MARKETING_CONSENT_COPY_REVIEWED` exactly as the contact step's tick is.
// - **The playbooks block was only ever a question of having enough articles.**
//   It renders at two or more.
//
// **No weekly cadence is promised anywhere below**, and that is deliberate
// rather than an omission. The reference says "One insight a week"; there is no
// send schedule, no `RESEND_API_KEY` on either deployment, and `nurture-flow.md`
// § 5 lists both as open. A promise of a rhythm nobody can keep is the one thing
// on this page that would be a lie rather than a plan.
//
// The Thai was composed 16/08/2026 through the `thai-composer` skill, measured
// against Paul's own app copy, and **he has not read it back.**
// ---------------------------------------------------------------------------

export const PLAYBOOKS_HEADING: Copy = {
  en: "First time here? Start with these guides.",
  // Paul's wording, 17/08/2026. `ใช่ไหม` and `ได้เลย` are the difference
  // between a label and someone speaking: the first makes the question a
  // real one and the second gives permission rather than an instruction.
  th: "เพิ่งเข้ามาครั้งแรกใช่ไหม? เริ่มจากคู่มือเหล่านี้ได้เลย",
};

export const PLAYBOOKS_INTRO: Copy = {
  en: "The articles to start with. Each one explains from the basics through to what you can go and do yourself.",
  // Paul's wording, 17/08/2026. `ควรเริ่มอ่าน` rather than `ควรอ่านก่อน`,
  // which is where to begin rather than an order of merit, and `พื้นฐาน`
  // names what they start from.
  th: "บทความที่ควรเริ่มอ่าน แต่ละเรื่องอธิบายตั้งแต่พื้นฐานจนคุณนำไปลงมือทำต่อได้ด้วยตัวเอง",
};

/** The field's accessible name. Never rendered as a visible label. */
export const SIGNUP_LABEL: Copy = { en: "Your email", th: "อีเมลของคุณ" };

/** An example address, which is neither language. */
export const SIGNUP_PLACEHOLDER = "name@email.com";

/*
 * **Rewritten 17/08/2026, and it was promising a paid feature.**
 *
 * It said "get job openings by email" / `รับอีเมลแจ้งตำแหน่งงาน`, which is the
 * same promise the assessment's marketing tick was making and which Paul removed
 * there the same day: `01_Project_Foundation.md` lists email notification for
 * jobs under the app as "free to start, paid for depth", and `AGENTS.md` puts it
 * in Phase 4.
 *
 * He did not ask for this one, and it is changed anyway. Two surfaces asking for
 * consent to the same unbuilt paid feature is one error in two places, and fixing
 * the half he happened to be looking at would have left the other live.
 *
 * Wording follows `consent.marketing` in `consent-copy.ts` rather than being
 * composed again, so the blog and the assessment ask for the same thing in the
 * same words.
 */
export const SIGNUP_BUTTON: Copy = {
  en: "Get news and advice by email",
  th: "รับข่าวสารและคำแนะนำทางอีเมล",
};

/**
 * Under the button. Names the payload and the limit in one line, which is the
 * pinned post's move 5: say what this is not, in the same breath as the offer.
 */
export const SIGNUP_NOTE: Copy = {
  // The fifth and last of the job-alert promises, caught by Paul 17/08/2026
  // after the other four were fixed. It said "only roles that match you", which
  // is the same Phase 4 paid feature.
  //
  // **Worth recording that it took two passes.** Four strings were corrected by
  // grepping for `แจ้งตำแหน่งงาน` and `matching roles`, and this one used neither:
  // it says `ส่งเฉพาะตำแหน่งที่ตรงกับคุณ`, the same promise in different words. A
  // grep finds the phrasing it was given and a person reading the form finds the
  // promise. That is why he found it and the search did not.
  //
  // The no-spam and stop-any-time halves are unchanged and are still true.
  en: "News and practical advice only. No spam, and you can stop at any time.",
  th: "ส่งเฉพาะข่าวสารและคำแนะนำ ไม่มีสแปม ยกเลิกได้ทุกเมื่อ",
};

/**
 * The sentence the reader agrees to by submitting, and it is not decoration:
 * `convex/subscribe.ts` writes it verbatim into the consent event's `evidence`
 * field. `schema.ts` says why in as many words, a consent record that cannot say
 * what was agreed to is a timestamp rather than evidence.
 *
 * So editing this string changes what future records claim was shown, and older
 * records keep the wording that was actually on screen when they were made.
 *
 * `จะไม่ส่งต่อข้อมูลให้บุคคลอื่น` is Paul's own, from `consent.purpose`.
 */
export const SIGNUP_CONSENT: Copy = {
  // Same correction as `SIGNUP_BUTTON` above: it said the email is kept "in
  // order to send you matching roles", which is the Phase 4 paid feature. The
  // no-onward-disclosure half is unchanged and is true; `privacy.ts` says the
  // same thing at length.
  // Paul's wording, 17/08/2026. Two changes worth keeping straight: he drops
  // "เมื่อกดปุ่มนี้", since a consent line under a button does not need to say
  // which button, and he writes `เก็บและใช้` rather than `เก็บ`. The second is
  // the substantive one for PDPA: keeping and using are different operations and
  // the notice discloses both, so the consent should name both.
  //
  // `ปั้นโปรไฟล์` in Thai script rather than the wordmark, which is LR-01 where
  // the brand opens a Thai clause.
  en: "You agree that PunProfile may keep and use your email address to send you news and practical advice. We do not pass your details to anyone else.",
  th: "ยินยอมให้ ปั้นโปรไฟล์ เก็บและใช้อีเมลของคุณเพื่อส่งข่าวสารและคำแนะนำ เราจะไม่ส่งต่อข้อมูลของคุณให้บุคคลอื่น",
};

export const SIGNUP_DONE: Copy = {
  // Last of the four, 17/08/2026. Same paid-feature promise in the success
  // message, which is the one a reader sees only after they have said yes.
  en: "Done. We will send news and practical advice to this address.",
  th: "เรียบร้อย เราจะส่งข่าวสารและคำแนะนำไปที่อีเมลนี้",
};

export const SIGNUP_BAD_EMAIL: Copy = {
  en: "That email is not right. Please check it.",
  // Paul's wording, 17/08/2026. `ดู` goes: the field either parses or it
  // does not, and hedging a validation error makes the reader wonder
  // whether they have to fix it.
  th: "อีเมลนี้ไม่ถูกต้อง ลองตรวจดูอีกครั้ง",
};

// ---------------------------------------------------------------------------
// Stopping the emails. 16/08/2026.
//
// The link at the foot of every marketing email, and the page it lands on. It
// exists because marketing email is not lawful without a one-click way out, and
// because `data-inventory.md` records the rule this page has to hold to:
// **withdrawing is not deleting.** They are separate requests with separate
// consequences, and conflating them would erase someone who only asked to stop
// being messaged. The page says so in as many words rather than leaving a reader
// to wonder whether they just deleted themselves.
//
// It acts on arrival with no confirm step. A confirmation button on an
// unsubscribe page is a second thing to click for somebody who has already told
// you what they want, and the action is harmless and reversible: the worst case
// is that a prefetch stops email nobody had asked to keep, and the page says how
// to start again.
// ---------------------------------------------------------------------------

export const UNSUBSCRIBE_HEADING: Copy = {
  en: "You will not get these emails any more",
  th: "คุณจะไม่ได้รับอีเมลเหล่านี้อีก",
};

export const UNSUBSCRIBE_BODY: Copy = {
  en: "We have recorded your request to stop, with the date. Your details and your result are unchanged, and you can still contact us about your result at any time.",
  // Paul's wording, 17/08/2026. It names what was recorded rather than only
  // that something was: `คำขอหยุดรับข่าวสารพร้อมวันที่` is the PDPA record
  // this page exists to create, and `privacy.ts` promises exactly it.
  th: "เราได้บันทึกคำขอหยุดรับข่าวสารพร้อมวันที่ไว้แล้ว ข้อมูลและผลประเมินของคุณยังอยู่ตามเดิม และคุณยังติดต่อเราเพื่อสอบถามเกี่ยวกับผลได้เสมอ",
};

export const UNSUBSCRIBE_RESTART: Copy = {
  en: "Change your mind whenever, and you can sign up again from the blog, or just contact us.",
  // Paul's wording, 17/08/2026. It adds the second route: someone who has
  // just unsubscribed may not want to hunt for a form, and the contact page
  // is a person.
  th: "เปลี่ยนใจเมื่อไหร่ ก็กลับมาสมัครรับข่าวสารใหม่ได้ที่หน้าบทความ หรือติดต่อเราได้เลย",
};

export const UNSUBSCRIBE_WORKING: Copy = {
  en: "One moment.",
  th: "รอสักครู่",
};

export const SIGNUP_BUSY: Copy = {
  // Paul's wording, 17/08/2026. Shorter, and it leads with what happened rather
  // than with our inability to do it: `บันทึกไม่สำเร็จ` states the outcome where
  // `ยังบันทึกไม่ได้ในตอนนี้` narrates our side of it.
  en: "That did not save. Please try again in a moment.",
  th: "บันทึกไม่สำเร็จ ลองอีกครั้งในอีกสักครู่",
};

/**
 * The line above the action, on the index and at the foot of every article.
 *
 * Assembled from the clauses in `03_Content_System.md` § 8's hook pool rather
 * than written fresh, which is what LR-03 asks for: reuse the phrases that have
 * been approved instead of generating a new call to action on the fly. The pool
 * itself is written to be VARIED across a feed; this is an app surface, where
 * `Language_System.md` says the opposite holds and a string that changes between
 * visits reads as a different string.
 */
export const BLOG_CLOSE: Copy = {
  en: "Read this far and still not sure where to start? Two minutes, and you will know which stage of the path to working in Europe you are on.",
  // Paul's wording, 17/08/2026, and it is the closing line on the index and
  // at the foot of every article.
  //
  // `อ่านมาถึงตรงนี้แล้ว` earns the ask from what the reader just did,
  // which is the one thing a closing line can do that an opening cannot.
  // The second half is his own closing sentence from the pinned post,
  // already used on the home page, so the blog closes the way the site
  // closes.
  th: "อ่านมาถึงตรงนี้แล้วยังไม่รู้ว่าจะเริ่มจากไหน? ใช้เวลาแค่ 2 นาที เช็กว่าตอนนี้คุณอยู่ขั้นไหนบนเส้นทางไปทำงานในยุโรป",
};
