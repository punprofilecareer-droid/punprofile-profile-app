/**
 * Generates a Thai review sheet for a per-page content module.
 *
 *   npm run review:page              # home.ts, the default
 *   npm run review:page -- blog      # any module in MODULES below
 *
 * **Written 17/08/2026, because there was nowhere to review this.** Paul's
 * answer to being handed a rebuilt home page was "I don't know where to review
 * this", and he was right: there was nowhere.
 *
 * `copy-worksheet.md` covers `copy.ts`, `narrative-copy.ts`, `consent-copy.ts`
 * and the levers, and round-trips through `import-copy-worksheet.ts`. It does
 * not cover the per-page modules, and it should not be extended to: the
 * importer writes back into `copy.ts` by key, so a page-module string pasted
 * into that worksheet would be silently dropped on the next import. A worksheet
 * that loses an edit is worse than no worksheet.
 *
 * So this is a **read-and-mark-up sheet, not a round trip.** It says so at the
 * top of every file it writes. Corrections come back as text and are applied by
 * hand, which is the same way `coaching.ts`, `services.ts` and `faq.ts` were
 * built from his Thai in the first place.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT PUTS IN FRONT OF HIM, AND WHY IN THIS ORDER
 * ---------------------------------------------------------------------------
 *
 * **Thai first, English under it.** He reads the Thai. Putting the English on
 * top invites reading the translation and checking the Thai against it, which is
 * the exact habit LR-09 exists to break.
 *
 * **In the order the strings appear on the page**, not in export order or
 * alphabetically. Register is a property of a whole page, which is the finding
 * `Language_System.md` records under LR-09, and a sheet in the wrong order
 * cannot show it. That is what `SECTIONS` below is for.
 *
 * **Provenance on every string**, because half of them are his own words already
 * and he should not spend a second re-reading those.
 *
 * ---------------------------------------------------------------------------
 * IT REFUSES TO OVERWRITE AN UNREAD REVIEW
 * ---------------------------------------------------------------------------
 *
 * Added 17/08/2026, after regenerating the sheet twice over Paul's own markup.
 * Nothing was lost either time, because his corrections had already been applied
 * to the code first, and that was luck rather than design.
 *
 * So: if the file already carries a filled `แก้เป็น:` line, a `PB:` note, or a
 * quotation that no longer matches the code, this exits without writing and says
 * which lines it found. `--force` overwrites, and the only time that is correct is
 * after the corrections are in the code.
 *
 * **The third signal is the one that fires.** Paul does not use the `แก้เป็น:`
 * line. He edits the quoted Thai in place, which he did on this sheet and again
 * on `thai-review-queue.md`, where the narrower guard let a whole review pass be
 * overwritten. A guard against losing someone's work has to be built around how
 * they actually work rather than how they were asked to.
 *
 * **`PB:` is Paul's marker for a note addressed to whoever reads the file next**,
 * anywhere in a markdown file, and it is not a correction. It is recorded in the
 * workspace root `CLAUDE.md`.
 */

import { writeFileSync } from "node:fs";
import { checkOverwrite, stamp } from "./lib/review-guard.js";
import { COPY } from "../src/lib/content/copy.js";
import { isCopy, walkCopy, type Copy } from "./lib/copy-walk.js";
import * as home from "../src/lib/content/home.js";
import * as blog from "../src/lib/content/blog.js";
import * as contact from "../src/lib/content/contact.js";

const MODULES: Record<string, Record<string, unknown>> = { home, blog, contact };

/**
 * Reading order and human labels, per module.
 *
 * A module with no entry falls back to export order with the export name as the
 * label, which is worse but never wrong. `home` has one because it is the module
 * this script was written for and the one being reviewed.
 *
 * `where` is what `copy.ts` calls `screen`: the page modules carry no such field,
 * so it lives here rather than being invented on every export.
 */
interface Item {
  /** Export name, or `EXPORT[i].field` for a string inside a table. */
  key: string;
  where: string;
  /**
   * Who wrote the Thai. Drives the status line under each string.
   *
   * `read` was added 17/08/2026, after the first review round. It is not the
   * same as `paul`: it means he looked at the string and left it alone, which is
   * weaker evidence than him typing it, and the sheet should not claim otherwise.
   */
  from: "paul" | "reused" | "new" | "read";
}

const SECTIONS: Record<string, { title: string; items: Item[] }[]> = {
  blog: [
    {
      title: "1. The blog index, top of the page",
      items: [
        { key: "BLOG_HEADING", where: "The page headline", from: "paul" },
        { key: "BLOG_INTRO", where: "Under the headline", from: "paul" },
      ],
    },
    {
      title: "2. The email signup, which sits directly under the intro",
      items: [
        { key: "SIGNUP_LABEL", where: "The field label", from: "paul" },
        { key: "SIGNUP_NOTE", where: "Under the field. What they are agreeing to receive", from: "paul" },
        { key: "SIGNUP_CONSENT", where: "The consent line. PDPA", from: "paul" },
        { key: "SIGNUP_BUTTON", where: "The button", from: "paul" },
        { key: "SIGNUP_BUSY", where: "The button while it is submitting", from: "paul" },
        { key: "SIGNUP_DONE", where: "After a successful signup", from: "paul" },
        { key: "SIGNUP_BAD_EMAIL", where: "When the address is malformed", from: "paul" },
      ],
    },
    {
      title: "3. The topic row",
      items: [
        { key: "BLOG_TOPICS_LABEL", where: "Above the topic buttons", from: "paul" },
        { key: "BLOG_ALL", where: "The first topic button, meaning no filter", from: "paul" },
        { key: "TOPICS[0].label", where: "Topic button: how-to", from: "paul" },
        { key: "TOPICS[1].label", where: "Topic button: the European job market", from: "paul" },
        { key: "TOPICS[2].label", where: "Topic button: perspective", from: "paul" },
        { key: "TOPICS[3].label", where: "Topic button: what people worry about", from: "paul" },
      ],
    },
    {
      title: "4. The start-here block, and the article cards",
      items: [
        { key: "PLAYBOOKS_HEADING", where: "Heading over the start-here block", from: "paul" },
        { key: "PLAYBOOKS_INTRO", where: "Under that heading", from: "paul" },
        { key: "BLOG_READ", where: "The link on every article card", from: "paul" },
      ],
    },
    {
      title: "5. When there is nothing to show",
      items: [
        { key: "BLOG_NONE_YET", where: "The whole index, while no article exists at all", from: "paul" },
        { key: "BLOG_EMPTY", where: "When a topic filter matches nothing", from: "paul" },
      ],
    },
    {
      title: "6. Inside an article",
      items: [
        { key: "BLOG_BACK", where: "The link back to the index", from: "paul" },
        { key: "BLOG_QUESTION_LABEL", where: "Above the question the article answers", from: "paul" },
        { key: "BLOG_CLOSE", where: "The closing line, on the index and at the foot of every article", from: "paul" },
      ],
    },
    {
      title: "7. Unsubscribing, reached only from an email link",
      items: [
        { key: "UNSUBSCRIBE_HEADING", where: "The page headline", from: "paul" },
        { key: "UNSUBSCRIBE_WORKING", where: "While the unsubscribe is in flight", from: "paul" },
        { key: "UNSUBSCRIBE_BODY", where: "After it succeeds", from: "paul" },
        { key: "UNSUBSCRIBE_RESTART", where: "The way to resubscribe", from: "paul" },
      ],
    },
  ],
  home: [
    {
      title: "1. Hero",
      items: [
        { key: "@copy:landing.eyebrow", where: "The small line above the headline", from: "paul" },
        { key: "@copy:landing.headline", where: "The headline, and the browser tab on every page", from: "paul" },
        { key: "HERO_STANDING", where: "Hero, first paragraph", from: "paul" },
        { key: "HERO_REFRAME", where: "Hero, second paragraph", from: "paul" },
        { key: "@copy:landing.subhead", where: "Hero, third paragraph, and the Google result description", from: "paul" },
        { key: "@copy:landing.reassurance", where: "Under the button", from: "paul" },
      ],
    },
    {
      title: "2. What we actually do",
      items: [
        { key: "MARKET_HEADING", where: "Section heading", from: "paul" },
        { key: "MARKET_BODY", where: "Under the heading", from: "paul" },
        { key: "@copy:stats.market.screened", where: "Under the number 230", from: "paul" },
        { key: "@copy:stats.market.published", where: "Under the number 84", from: "paul" },
        { key: "@copy:stats.market.employers", where: "Under the number 40", from: "paul" },
        { key: "MARKET_FOOT", where: "The small line under the three numbers", from: "new" },
      ],
    },
    {
      title: "3. Three things we help with",
      items: [
        { key: "HELP_HEADING", where: "Section heading", from: "paul" },
        { key: "HELP_INTRO", where: "Under the heading", from: "paul" },
      ],
    },
    {
      title: "4. Visa sponsorship",
      items: [{ key: "VISA_BODY", where: "The whole section, on the teal ground", from: "paul" }],
    },
    {
      title: "5. What is free and what is not",
      items: [
        { key: "COST_HEADING", where: "Section heading", from: "paul" },
        { key: "COST_ROWS[0].surface", where: "Card 1, title", from: "paul" },
        { key: "COST_ROWS[0].price", where: "Card 1, the small line above the title", from: "paul" },
        { key: "COST_ROWS[0].body", where: "Card 1, body", from: "paul" },
        { key: "COST_ROWS[1].surface", where: "Card 2, title", from: "paul" },
        { key: "COST_ROWS[1].price", where: "Card 2, the small line above the title", from: "paul" },
        { key: "COST_ROWS[1].body", where: "Card 2, body", from: "paul" },
        { key: "COST_ROWS[2].surface", where: "Card 3, title", from: "paul" },
        { key: "COST_ROWS[2].price", where: "Card 3, the small line above the title", from: "paul" },
        { key: "COST_ROWS[2].body", where: "Card 3, body", from: "paul" },
      ],
    },
    {
      title: "6. Close",
      items: [{ key: "CLOSE_LEAD", where: "The line above the last button", from: "paul" }],
    },
  ],
};

const STATUS: Record<Item["from"], string> = {
  paul: "**Your own words**, from the review of 17/08/2026. Nothing to do unless you have changed your mind.",
  reused: "**Rebuilt from your Thai** on another page. Check it still says what you meant here.",
  new: "**Written for this page.** Not read back by you yet.",
  read: "**You read this and left it alone** on 17/08/2026. Say if that was approval rather than a skip.",
};

/**
 * Resolves `EXPORT`, `EXPORT[i].field`, or `@copy:some.key` against the module.
 *
 * The `@copy:` form exists because the four hero strings deliberately live in
 * `copy.ts` rather than in the page module, so that `lint-thai` reaches them.
 * They still belong in reading order on this sheet: the split is an
 * implementation detail and a reviewer should never have to know about it.
 */
function resolve(mod: Record<string, unknown>, key: string, copyBank: Record<string, Copy>): Copy | null {
  if (key.startsWith("@copy:")) return copyBank[key.slice(6)] ?? null;
  // A dotted path with optional array indices at any level, which is what both
  // `SECTIONS` and `walkCopy` produce: `VISA_BODY`, `COST_ROWS[0].price`,
  // `SERVICES[1].includes[2]`.
  let node: unknown = mod;
  for (const step of key.split(".")) {
    const m = step.match(/^([A-Za-z_0-9]+)((?:\[\d+\])*)$/);
    if (!m || node == null || typeof node !== "object") return null;
    node = (node as Record<string, unknown>)[m[1]];
    for (const idx of m[2].match(/\d+/g) ?? []) {
      if (!Array.isArray(node)) return null;
      node = node[Number(idx)];
    }
  }
  return isCopy(node) ? node : null;
}

/** Positional args only, so `--force` in any position is not read as a module. */
const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const which = positional[0] ?? "home";
const mod = MODULES[which];
if (!mod) {
  console.error(`unknown module "${which}". One of: ${Object.keys(MODULES).join(", ")}`);
  process.exit(1);
}

const copyBank = COPY as unknown as Record<string, Copy>;

/**
 * Reading order where a module has one, and the whole module where it does not.
 *
 * **The fallback walks arrays**, since 17/08/2026. It used to enumerate top-level
 * exports only, which meant `TOPICS` in `blog.ts` was invisible: the identical
 * hole `verify-pages.ts` had on the same day, written twice independently, which
 * is why the walk now lives in `lib/copy-walk.ts` and both callers use it.
 *
 * A module reached through the fallback is listed in declaration order and every
 * string is marked `new`. That is honest rather than good: declaration order is
 * not reading order, and register is a property of a page read in sequence. Add a
 * `SECTIONS` entry before asking Paul to review a module properly.
 */
const sections =
  SECTIONS[which] ??
  [
    {
      title: "All strings, in declaration order",
      items: walkCopy(mod).map(({ path }): Item => ({ key: path, where: path, from: "new" })),
    },
  ];

const lines: string[] = [
  "---",
  "status: generated, for review. Not round-tripped.",
  `name: ${which}.ts, Thai review sheet`,
  "description: >",
  `  Every string on the page, in the order it appears, Thai first. Generated by`,
  `  scripts/export-page-review.ts in the app repo. Mark it up in place or reply`,
  `  with the numbers; corrections are applied to the code by hand.`,
  "---",
  "",
  `# ${which}.ts, Thai review`,
  "",
  "**Read the Thai. The English is underneath only so you can see what the line",
  "is supposed to mean, and it is a translation of the Thai rather than its",
  "source.** Where the two disagree, the Thai is right and the English gets fixed.",
  "",
  "**To correct one:** write your version on the `แก้เป็น:` line under it. Leave",
  "the rest alone. Anything you write outside a `แก้เป็น:` line is lost when this",
  "file is regenerated, and unlike the copy worksheet this one does not read",
  "itself back into the code, so nothing is applied until someone applies it.",
  "",
  "**Strings marked as your own words need no attention** unless you have changed",
  "your mind about them. They are here so the page reads in order.",
  "",
  "---",
  "",
];

let n = 0;
let missing = 0;
for (const section of sections) {
  lines.push(`## ${section.title}`, "");
  for (const item of section.items) {
    const copy = resolve(mod, item.key, copyBank);
    n++;
    if (!copy) {
      missing++;
      lines.push(`### ${n}. \`${item.key}\``, "", "> **NOT FOUND.** The key moved or was renamed.", "");
      continue;
    }
    lines.push(
      `### ${n}. ${item.where}`,
      "",
      `> ${copy.th || "TODO"}`,
      "",
      `*${copy.en}*`,
      "",
      STATUS[item.from],
      "",
      "แก้เป็น:",
      "",
    );
  }
  lines.push("---", "");
}

const OUT =
  positional[1] ??
  `../punprofile-career-coaching/punprofile-work/work-projects/eu-fit-check/${which}-copy-review.md`;


const force = process.argv.includes("--force");
const guard = force ? { safe: true, reasons: [] } : checkOverwrite(OUT);
if (!guard.safe) {
  console.error(`
${OUT}
`);
  for (const line of guard.reasons) console.error(line);
  console.error("");
  process.exit(1);
}

writeFileSync(OUT, stamp(lines.join("\n")));
console.log(`wrote ${OUT}`);
console.log(`${n} strings${missing ? `, ${missing} could not be resolved` : ""}`);
