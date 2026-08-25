/**
 * Checks the narrative system against the app it describes.
 *
 *   npm run verify:narrative
 *
 * `Narrative_System.md` in the coaching repo carries its records as YAML
 * frontmatter, the same arrangement `design.md` uses, so one file is both the
 * document a person reads and the data a script can check. A narrative system
 * nobody can verify is a document that drifts from the site within a month,
 * which is the failure `termbase.yml` and `lint-thai.ts` were built to prevent
 * for terms and this prevents for stories.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT CHECKS, AND WHY EACH ONE
 * ---------------------------------------------------------------------------
 *
 * 1. **Every product has a record.** A product shipped without one is a page
 *    somebody will write from scratch, which is how the site got three sections
 *    making the same claim.
 * 2. **Every record has every slot.** An empty slot is not a gap in a document,
 *    it is a block on a page with nothing to put in it.
 * 3. **`ask` names a real destination.** The spine's last slot points at
 *    `cta.ts`; a record asking for a destination that does not exist is a
 *    promise with no route.
 * 4. **No record states a figure.** The one rule the root `CLAUDE.md` puts
 *    first is never restating a source-of-truth value. A number in a narrative
 *    record is a number that will be stale and unnoticed, so digits are
 *    refused outright except where they are part of a document's name.
 * 5. **Every block's slots exist in the spine.** A block map naming a slot the
 *    spine does not have is a typo that would silently exempt a section from
 *    checking.
 *
 * 6. **Every page's blocks exist, and every page that asks also limits.** Each
 *    `Band` declares the block it is, so the pages are walkable. The rule being
 *    enforced is the one the spine states and nothing could hold it to: a limit
 *    comes before an ask. A page that carries an `ask`-bearing block and no
 *    `limit`-bearing one is a page selling something without saying what it is
 *    not, which is the failure mode every one of these pages started in.
 *
 * It still does not check WHICH offer a page tells. A page can carry a B7 and
 * say nothing the record says, and no script can see that. What it can see is
 * a page shaped wrongly, and that is most of it.
 */

import { readFileSync } from "node:fs";
import { load } from "js-yaml";
import { PRODUCTS } from "../src/lib/content/products.js";
import { SERVICES } from "../src/lib/content/services.js";
import { DESTINATIONS } from "../src/lib/content/cta.js";

const SOURCE =
  "../punprofile-career-coaching/punprofile-context/ctxt-content/Narrative_System.md";

interface Spine {
  id: string;
  name: string;
  owner: string;
  rule: string;
}

interface Offer {
  slug: string;
  /**
   * Which module the offer lives in. `products` is the default and the five
   * self-serve pages; `services` is the three 1:1 engagements, which are sold
   * through a conversation and have no product page, so they are checked
   * against `services.ts` instead.
   */
  source?: "products" | "services";
  pitch: string;
  [slot: string]: string | undefined;
}

interface Narrative {
  version: string;
  spine: Spine[];
  blocks: Record<string, string[]>;
  offers: Offer[];
  house: {
    slots: { id: string; rule: string }[];
    not: string;
    consequence: string;
    people: {
      id: string;
      who: string | null;
      done: string | null;
      relevance: string | null;
      /** Slots this person has not written yet. See the note in the file. */
      pending: string[];
    }[];
  };
}

const raw = readFileSync(SOURCE, "utf8");
const end = raw.indexOf("\n---\n");
if (!raw.startsWith("---") || end === -1) {
  console.error(`FAIL ${SOURCE}: expected YAML frontmatter delimited by ---`);
  process.exit(1);
}
const n = load(raw.slice(3, end)) as Narrative;

const failures: string[] = [];
const fail = (m: string) => {
  console.error(`FAIL ${m}`);
  failures.push(m);
};

const slots = n.spine.map((s) => s.id);

// 1. every offer, in either module, has a record and every record has an offer
const recorded = new Set(n.offers.map((o) => o.slug));
for (const p of PRODUCTS) {
  if (!recorded.has(p.slug)) {
    fail(`${p.slug} is a product with no narrative record. Add one to Narrative_System.md.`);
  }
}
for (const s of SERVICES) {
  if (!recorded.has(s.id)) {
    fail(`${s.id} is a service with no narrative record. Add one to Narrative_System.md.`);
  }
}
const realProducts = new Set(PRODUCTS.map((p) => p.slug));
const realServices = new Set(SERVICES.map((s) => s.id));
for (const o of n.offers) {
  const where = o.source === "services" ? realServices : realProducts;
  const module = o.source === "services" ? "services.ts" : "products.ts";
  if (!where.has(o.slug)) fail(`${o.slug} has a record and is not in ${module}.`);
}

// 2, 3, 4. every record is complete, points somewhere real, and states no figure
const DIGITS = /\d/;
for (const o of n.offers) {
  for (const slot of slots) {
    const v = o[slot] as string | undefined;
    if (!v || !v.trim()) {
      fail(`${o.slug} is missing the "${slot}" slot.`);
      continue;
    }
    // `10_Methodology.md` and `08_Coaching_Business.md` are names, not figures.
    const withoutDocNames = v.replace(/\b\d+_[A-Za-z_]+\.md\b/g, "");
    if (slot !== "ask" && DIGITS.test(withoutDocNames)) {
      fail(
        `${o.slug} › ${slot} states a figure. Point at the document that owns it ` +
          `instead: a number here is a number that goes stale unnoticed.`,
      );
    }
  }
  if (o.ask && !(o.ask in DESTINATIONS)) {
    fail(`${o.slug} asks for "${o.ask}", which is not a destination in cta.ts.`);
  }
  if (!o.pitch || !o.pitch.trim()) fail(`${o.slug} has no pitch line.`);
}

// 6. the pages: every declared block is real, and asking implies limiting
const PAGES = [
  "src/app/(th)/page.tsx",
  "src/app/(th)/coaching/page.tsx",
  "src/app/(th)/pricing/page.tsx",
  "src/app/(th)/faq/page.tsx",
  "src/app/(th)/contact/page.tsx",
  "src/components/features/products/ProductPage.tsx",
  "src/components/features/blog/BlogIndex.tsx",
];
for (const page of PAGES) {
  let src: string;
  try {
    src = readFileSync(page, "utf8");
  } catch {
    fail(`${page} is in the page list and does not exist.`);
    continue;
  }
  const used = [...src.matchAll(/<Band\s+block="([A-Z0-9]+)"/g)].map((m) => m[1]);
  if (used.length === 0) {
    fail(`${page} renders no Band with a declared block.`);
    continue;
  }
  const carries = (slot: string) =>
    used.some((b) => (n.blocks[b] ?? []).includes(slot));
  for (const b of used) {
    if (!(b in n.blocks)) {
      fail(`${page} uses block ${b}, which the map in Narrative_System.md does not have.`);
    }
  }
  /*
   * The rule applies to pages that SELL, and not to every page with a button.
   *
   * Scoped after the first run said `/contact` and the blog index were selling
   * blind. They are not selling: a contact page's ask is the page, and a blog
   * index asks you to read. A page is selling when it describes a thing you can
   * buy, which is `mechanism` or `artefact`, and those are the pages that owe
   * the reader a limit.
   */
  if (carries("ask") && (carries("mechanism") || carries("artefact")) && !carries("limit")) {
    fail(
      `${page} asks without limiting. The spine puts slot 6 before slot 8: a page ` +
        `that describes what you get and then asks, without ever saying what it is ` +
        `not, is selling blind.`,
    );
  }
}

/*
 * 7. The house narrative.
 *
 * Its people are checked differently from an offer, and the difference is the
 * point. An offer with an empty slot is broken, because the page it feeds will
 * be written from nothing. A PERSON with an empty slot is normal: they have not
 * written it yet, and writing it for them is the failure.
 *
 * So a slot may be empty only if it is declared pending, and a slot may be
 * pending only if it is empty. Either half alone is a lie: a filled pending
 * slot means somebody wrote it and forgot to say so, and an empty slot with no
 * pending marker means the site is one edit away from claiming nothing.
 */
const HOUSE_PERSON_SLOTS = ["who", "done", "relevance"] as const;
let pendingCount = 0;
for (const person of n.house.people) {
  for (const slot of HOUSE_PERSON_SLOTS) {
    const filled = Boolean(person[slot] && String(person[slot]).trim());
    const pending = person.pending.includes(slot);
    if (!filled && !pending) {
      fail(`house › ${person.id} has no "${slot}" and does not declare it pending.`);
    }
    if (filled && pending) {
      fail(`house › ${person.id} declares "${slot}" pending and has filled it.`);
    }
    if (pending) pendingCount += 1;
  }
}
for (const slot of ["not", "consequence"] as const) {
  if (!n.house[slot] || !n.house[slot].trim()) {
    fail(`house › "${slot}" is empty. It belongs to the business and is never pending.`);
  }
}

// 5. the block map only names slots the spine has
for (const [block, wants] of Object.entries(n.blocks)) {
  for (const slot of wants) {
    if (!slots.includes(slot)) {
      fail(`block ${block} wants "${slot}", which is not a slot in the spine.`);
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}

console.log(
  `narrative ${n.version}: ${n.offers.length} offers, ${slots.length} slots, ` +
    `${Object.keys(n.blocks).length} blocks mapped, ${n.house.people.length} people. OK`,
);
if (pendingCount) {
  console.log(
    `  ${pendingCount} house slot(s) pending, which is a state and not a failure. ` +
      `They are waiting on their own words; see dew-tatiy-review.md.`,
  );
}
