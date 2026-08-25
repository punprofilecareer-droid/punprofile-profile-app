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
 * It does NOT check that a given page renders a given slot. That needs the
 * page-to-block map to be data rather than JSX, and inventing that mapping to
 * satisfy a checker would be the checker writing the architecture.
 */

import { readFileSync } from "node:fs";
import { load } from "js-yaml";
import { PRODUCTS } from "../src/lib/content/products.js";
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
  pitch: string;
  [slot: string]: string;
}

interface Narrative {
  version: string;
  spine: Spine[];
  blocks: Record<string, string[]>;
  offers: Offer[];
  house: { id: string; rule: string }[];
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

// 1. every product has a record
const recorded = new Set(n.offers.map((o) => o.slug));
for (const p of PRODUCTS) {
  if (!recorded.has(p.slug)) {
    fail(`${p.slug} is a product with no narrative record. Add one to Narrative_System.md.`);
  }
}
// and no record describes a product that does not exist
const real = new Set(PRODUCTS.map((p) => p.slug));
for (const o of n.offers) {
  if (!real.has(o.slug)) fail(`${o.slug} has a record and is not in products.ts.`);
}

// 2, 3, 4. every record is complete, points somewhere real, and states no figure
const DIGITS = /\d/;
for (const o of n.offers) {
  for (const slot of slots) {
    const v = o[slot];
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
    `${Object.keys(n.blocks).length} blocks mapped, ${n.house.length} house slots. OK`,
);
