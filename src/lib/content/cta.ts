import type { Copy } from "./copy";
import { CONTACT_EMAIL } from "@/lib/consent-copy";

/**
 * **Thai wording passed by Paul, 15/08/2026**, in the review of all shipped Thai.
 *
 * The call-to-action framework. TASK-090, 14/08/2026.
 *
 * Written because the site had accumulated CTAs page by page and they had
 * stopped agreeing with each other: the coaching page carried three buttons
 * back to a two-minute questionnaire, the services page's only action was
 * hidden behind an unset environment variable, and the contact page led with
 * the assessment instead of with a way to make contact. Each was defensible on
 * its own page and the set was incoherent.
 *
 * ---------------------------------------------------------------------------
 * THE RULE
 * ---------------------------------------------------------------------------
 *
 * **1. Every page declares exactly one primary action.** Not zero, which leaves
 * a reader who is convinced with nowhere to go, and not two, which makes them
 * choose instead of act.
 *
 * One action, not one button: a card grid may repeat that action once per card,
 * as the services page does with three "Contact me" buttons. Three buttons to
 * three different places would be three actions and would break this rule;
 * three buttons to the same place with the same words are one action offered
 * where each reader happens to have finished reading. Which is the whole test,
 * and it is why `CallToAction` takes a `show` prop rather than letting a page
 * hand-roll a card button: repeated instances cannot drift apart if none of
 * them is written by hand. `design.md` already says this about colour: Terracotta
 * is reserved for the single primary action so it keeps its persuasive weight.
 * This is the same rule stated as information architecture rather than as
 * palette, and it is checked by `scripts/verify-content.ts`.
 *
 * **2. One action may offer more than one channel.** The contact page's primary
 * action is "get in touch", and email and LINE are two routes to it. That is
 * not two competing actions, it is one action a Thai audience needs offered
 * twice, because most of them do not read email. A channel pair is allowed;
 * two different destinations are not.
 *
 * **3. The primary is the next step for a reader this page has already
 * convinced.** Not the step the business most wants. If someone has read the
 * whole coaching page they are past being sold on the problem, and sending them
 * to the assessment is asking them to restart a funnel they have nearly
 * finished.
 *
 * **4. A secondary must ask for something of a different weight than the
 * primary.** Two actions that cost the reader the same thing are not a
 * hierarchy, they are a fork, and a fork is what a page has instead of an
 * answer. "Read the services page" beside "read the coaching page" is the
 * failure this catches; "read the services page" beside "email us" is not.
 *
 * The first version of this rule said a secondary may only point backwards in
 * the journey. The check rejected three of the six pages in this very table,
 * and the pages were right: the FAQ's secondary should be "still stuck? write
 * to us", which is further along than the check, and the landing page's should
 * be "who are you people", which is further along than nothing. The rule was
 * ranking actions on a scale built to describe READERS. Weight is the axis that
 * actually applies to an action, so weight is what it compares now. Recorded
 * because the check finding this before a person did is the entire argument for
 * having it.
 *
 * **5. Primary is a filled Terracotta button. Secondary is a text link.** Never
 * two buttons, never an outlined button beside a filled one. The visual weight
 * is the message.
 *
 * The single exception is a channel whose owner sets its appearance. LINE's
 * button guidelines specify LINE Green (`#06C755`) and their own mark, and a
 * green LINE button next to a Terracotta email button is not the two-actions
 * failure rule 5 exists to prevent: they are rule 2 channels of one action, and
 * the colour is doing recognition work rather than competing for emphasis. A
 * Thai reader finds that green faster than they read any label.
 *
 * This is narrow on purpose. It applies only where a third party's own rules
 * govern the control, never as licence to give a PunProfile action its own
 * colour because the page looked flat.
 *
 * ---------------------------------------------------------------------------
 * WHAT AN ACTION COSTS
 * ---------------------------------------------------------------------------
 *
 * One axis, and it is about the action rather than the reader: how much a
 * person has to spend to take it. Rules 2 and 4 both compare this and nothing
 * else.
 *
 * Deliberately not a funnel position. A funnel describes where someone IS, and
 * that turns out to be the wrong thing to rank two buttons by, which the check
 * demonstrated. What a button asks for is a property of the button.
 */
export const COST = {
  /** Open a page and read it. Costs attention and nothing else. */
  read: 1,
  /** Answer seventeen questions and hand over contact details. */
  answer: 2,
  /** Write to a human, under your own name, and wait for a reply. */
  contact: 3,
} as const;

export type Cost = (typeof COST)[keyof typeof COST];

export interface Action {
  href: string;
  label: Copy;
  /** What taking it costs the reader. Rules 2 and 4 compare these. */
  cost: Cost;
  /** Opens a mail or LINE client rather than navigating. */
  external?: boolean;
  /**
   * Set only where a third party's brand rules govern the button's appearance.
   * `CallToAction` renders these in the channel's own colour with its own mark,
   * which is the rule 5 exception and nothing more.
   */
  brand?: "line";
}

/**
 * The destinations, defined once. A page picks from these rather than writing
 * its own, which is what stops "Start the EU Fit Check" and "Take the check"
 * from drifting into two different promises for one link.
 */
export const DESTINATIONS = {
  assess: {
    href: "/efc-assessment",
    cost: COST.answer,
    label: { en: "Start the EU Fit Check", th: "เริ่มทำ EU Fit Check" },
  },
  coaching: {
    href: "/coaching",
    cost: COST.read,
    label: { en: "How the coaching works", th: "ดูว่าการโค้ชของเราเป็นอย่างไร" },
  },
  services: {
    // Retargeted 23/08/2026 when `/services` folded into `/coaching`. The label
    // still promises the same thing and now points at the section that keeps it.
    href: "/coaching",
    cost: COST.read,
    label: { en: "See how we work together", th: "ดูขั้นตอนการทำงานร่วมกัน" },
  },
  /**
   * Added 23/08/2026 with `/pricing`. The label says what the page is rather
   * than what it costs, because the packs are the only prices on the site and a
   * button that quotes one would be a second place for it to drift.
   */
  pricing: {
    href: "/pricing",
    cost: COST.read,
    label: { en: "See the prices", th: "ดูแพ็กเกจและราคา" },
  },
  contact: {
    href: "/contact",
    cost: COST.contact,
    /**
     * First person, on Paul's call, 14/08/2026. "Start a conversation" is what
     * a company says; this is one person, and every service is delivered by
     * him. Defined once here, so every page that asks for contact asks for it
     * in the same words: the services cards, the coaching page, the FAQ.
     *
     * "คุยกับผม" and not "ติดต่อผม", his revision the same day, and the
     * difference is real. ติดต่อ is what you do to a company, through a form,
     * and it is the verb on the menu item for the same reason. คุย is what two
     * people do, and it is the promise the rest of the page actually makes: the
     * next step is a conversation, not a ticket. The English follows the Thai
     * rather than staying on "Contact me", or the two languages would be
     * offering different things.
     */
    label: { en: "Talk to me", th: "ทักมาคุยกัน" },
  },
  email: {
    href: `mailto:${CONTACT_EMAIL}`,
    cost: COST.contact,
    external: true,
    label: { en: "Email us", th: "ส่งอีเมลหาเรา" },
  },
  line: {
    // Empty until the LINE Official Account link is on record. Nothing in the
    // coaching repo carries one: LINE appears there only as a field collected
    // FROM candidates, never as a channel PunProfile publishes. The contact
    // page renders this channel only when the href is non-empty, so an unset
    // link is an absent button rather than a dead one.
    //
    // Supplied by Paul, 14/08/2026. A `line.me/ti/p/` add-friend link: opening
    // it in the LINE app adds the account and opens the chat, and opening it in
    // a browser lands on LINE's own interstitial, so it degrades sensibly on a
    // desktop where LINE is not installed.
    //
    // `00_Quick_Facts.md` owns it, as of 15/08/2026, under Public contact
    // channels, which is where every volatile URL for the business belongs so a
    // republished link changes in one place. This line is the app's copy of it:
    // if the two ever disagree, that file is right and this one is stale.
    href: "https://line.me/ti/p/m5CG2t8Aa4",
    cost: COST.contact,
    external: true,
    brand: "line",
    // Short, because the mark beside it already says LINE. "Message us on LINE"
    // next to the LINE logo says LINE twice.
    label: { en: "Chat on LINE", th: "ทักทาง LINE" },
  },
  // `satisfies` without `as const`, deliberately. `as const` froze every href
  // to its own literal type, which made the empty-href guard in the contact
  // page and in verify-content a type error the moment LINE was filled in:
  // TypeScript could prove no href was ever "". That is true today and the
  // guard exists for tomorrow, when a channel is added unset or an old one is
  // emptied. Widening href back to `string` keeps the key names inferred, which
  // is all `DestinationId` needs, and keeps the runtime guard meaningful.
} satisfies Record<string, Action>;

export type DestinationId = keyof typeof DESTINATIONS;

export interface PageActions {
  /**
   * One id, or several that are channels for the SAME action under rule 2. All
   * entries of a channel pair must cost the same, which the check enforces:
   * that is the difference between offering two routes and offering a fork.
   */
  primary: DestinationId | readonly DestinationId[];
  secondary?: DestinationId;
  /** Why this primary, in one line. Read by the check's failure messages. */
  because: string;
}

/**
 * Every candidate-facing page, and what it asks for.
 *
 * `/efc-assessment` is absent on purpose. The assessment's own action is "answer
 * this question", which is the flow rather than a destination, and the result
 * screen is covered by the `/efc-assessment-result` entry below.
 */
export const PAGE_ACTIONS: Record<string, PageActions> = {
  "/": {
    primary: "assess",
    // `pricing` from 24/08/2026, Paul's call, replacing `coaching`.
    //
    // The primary is untouched and the reasoning below still holds. What changed
    // is the second question a stranger holds. Until 23/08/2026 nothing on this
    // site had a price, so the useful second step was the page that explained
    // the engagement. Now the plug&play half can be bought without asking, and
    // "what does this cost" is answerable in one tap. The catalogue section
    // links to `/coaching` anyway, so nothing was lost by the swap.
    secondary: "pricing",
    because:
      "A stranger from the group knows nothing about us yet. The check is the cheapest thing we can ask for and the only one that gives them something back immediately.",
  },
  "/efc-assessment-result": {
    primary: "services",
    secondary: undefined,
    // `because` corrected 24/08/2026. It said they had "been told there is a
    // queue", which stopped being true on 20/08/2026 when Paul's rewrite of
    // `teaser.nextStep` dropped the queue sentence, and stopped being true a
    // second way on 23/08 when the card above it stopped promising contact.
    because:
      "They have just seen their own result. The useful thing to offer is what the work actually is, not a second booking button on a screen that already has one.",
  },
  "/coaching": {
    primary: "contact",
    secondary: "pricing",
    because:
      "Rewritten 23/08/2026, when `/services` folded in here and this page's old primary became a link to itself. The three offerings are now on this page, so the question left at the bottom is the one the services page used to ask: what it costs, which is settled in conversation. The secondary goes to the prices for a reader who would rather see a number before speaking to anyone.",
  },
  /*
   * One entry per product page, added 23/08/2026.
   *
   * **The live one asks for the thing itself; the four unbuilt ones ask for a
   * conversation.** A button that starts a product which does not exist is the
   * one thing a `soon` page must not do, and a conversation is the real flow
   * anyway while payment is a bank transfer arranged by hand.
   */
  "/products/eu-fit-check": {
    primary: "assess",
    secondary: "pricing",
    because:
      "The product is free and it is one tap away, so the page asks for the thing itself rather than for a conversation about it.",
  },
  "/products/cv-check": {
    primary: "contact",
    secondary: "assess",
    because:
      "It is not built. The honest ask is to be told when it opens, and the secondary sends a reader who wants something now to the check that already exists.",
  },
  "/products/fit-report": {
    primary: "contact",
    secondary: "assess",
    because:
      "It is not built, and it is built ON the check, so anyone interested in the full result needs the free one first.",
  },
  "/products/matched-jobs": {
    primary: "contact",
    secondary: "pricing",
    because:
      "It is not built. The secondary goes to the prices because this is the product the tokens exist for, and a reader here is usually asking what it costs.",
  },
  "/products/guided-job-hunt": {
    primary: "contact",
    secondary: "pricing",
    because:
      "It is not built, and it is the surface matched roles land on, so the prices are the page that explains what fills it.",
  },
  "/pricing": {
    primary: "contact",
    secondary: "assess",
    because:
      "The prices are on the screen and the next step is a bank transfer arranged one to one, so the ask is a conversation. The secondary goes back to the check for anyone who arrived at the prices before doing anything else.",
  },
  "/blog": {
    primary: "assess",
    secondary: "coaching",
    because:
      "A blog reader arrived from search or a shared link and owes us nothing. The check is the cheapest thing we can ask for and the only one that hands something back the same minute, which is the landing page's reasoning and applies here for the same reason.",
  },
  "/blog/post": {
    primary: "assess",
    secondary: "services",
    because:
      "Someone who read a whole article is convinced the writing is worth their time, not yet that they need a coach. The check is still the right ask; the secondary goes to the services page for the reader who has already made that jump.",
  },
  "/faq": {
    primary: "assess",
    secondary: "contact",
    because:
      "Most questions on this page are about the check itself, so its readers are usually people who have not taken it yet.",
  },
  "/contact": {
    // Rule 2: one action, two channels. Both cost the same thing, so this is a
    // choice of route rather than a choice of destination.
    primary: ["email", "line"],
    secondary: undefined,
    because:
      "The entire page is 'get in touch'. Anything else on it competes with the one thing it exists to do, and a Thai audience needs LINE offered beside email rather than instead of it.",
  },
};

/** Channels of a multi-channel primary, in order, dropping any without a href. */
export function primaryChannels(page: PageActions): Action[] {
  const ids: readonly DestinationId[] = Array.isArray(page.primary)
    ? page.primary
    : [page.primary as DestinationId];
  return ids.map((id) => DESTINATIONS[id] as Action).filter((a) => a.href !== "");
}
