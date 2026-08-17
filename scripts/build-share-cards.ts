/**
 * Social sharing cards for blog articles. 18/08/2026.
 *
 * ---------------------------------------------------------------------------
 * WHY A SEPARATE FILE AND NOT JUST THE ARTICLE IMAGE
 * ---------------------------------------------------------------------------
 *
 * `og:image` already points at something for every article that has an image,
 * so a card was never going to be blank. The problem is the shape. Facebook,
 * Line, X, LinkedIn and Slack all render a link card at roughly 1.91:1 and
 * CENTRE-CROP whatever they are given to reach it.
 *
 * The article art is 4:3. Centre-cropping 1200x900 to 1200x630 takes 135px off
 * the top and the bottom, and on `start-in-europe` that lands directly on the
 * figure's head: the crop cuts the hair off. The image "loads" and looks broken,
 * which is worse than the site logo would have been.
 *
 * So each article gets a card cut for that ratio, and it is cut with an UPWARD
 * BIAS rather than centred. `public/assess/blocks/README.md` already records why
 * for the assessment photographs, in the same words: a centred crop of a
 * standing figure lands on the torso. The bias is 15% of the vertical slack
 * instead of 50%, which on this image keeps the whole head with room above it
 * and loses only the table legs, which carry no meaning.
 *
 * ---------------------------------------------------------------------------
 * HOW IT IS WIRED
 * ---------------------------------------------------------------------------
 *
 * By convention, not by a field. An article whose image is `/blog/<slug>.jpg`
 * gets a card at `/blog/share/<slug>.jpg`, and `shareCard()` in `seo.ts` derives
 * the path from the slug alone. There is nothing per-article to remember, and
 * therefore nothing to forget: `--check` fails if an article has art and no
 * card, so a future article cannot ship with a broken preview.
 *
 * ---------------------------------------------------------------------------
 * IT WILL NOT OVERWRITE A CARD THAT EXISTS
 * ---------------------------------------------------------------------------
 *
 * The 15% bias is a decent default and it will be wrong for some artwork. When
 * it is, replace `public/blog/share/<slug>.jpg` by hand and this script leaves
 * it alone from then on. `--force` regenerates anyway.
 *
 * That is `export-page-review.ts`'s refuse-to-overwrite rule, which the
 * workspace `CLAUDE.md` names as the pattern to copy: a generator must never
 * silently destroy a human's version of its own output.
 *
 * ---------------------------------------------------------------------------
 * MACOS ONLY, AND THE OUTPUT IS COMMITTED
 * ---------------------------------------------------------------------------
 *
 * It shells out to `sips`, which is macOS only. That is deliberate rather than
 * lazy: `sips` is already this repo's image tool, it is what the blur-placeholder
 * instructions in `public/assess/blocks/README.md` use, and adding an image
 * library as a dependency to crop one file per article is not a trade worth
 * making. `sharp` is present in `node_modules` but only as a transitive
 * dependency of Next, so depending on it here would be depending on something
 * nobody declared.
 *
 * The cards are committed, exactly like `tokens.generated.css` and the design
 * HTML, so the Vercel build on Linux never runs this and never needs to.
 *
 *   npm run blog:cards            generate any that are missing
 *   npm run blog:cards -- --force regenerate all of them
 *   npm run blog:cards -- --check fail if any are missing, write nothing
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { POSTS } from "../src/lib/content/blog";

/** What every platform renders a link card at. 1.91:1, near enough. */
const CARD_W = 1200;
const CARD_H = 630;

/**
 * Where the crop window sits in the vertical slack, as a fraction. 0 is flush
 * with the top, 0.5 is centred. See the header for why this is not 0.5.
 */
const UPWARD_BIAS = 0.15;

const ROOT = resolve(import.meta.dirname, "..");
const PUBLIC = resolve(ROOT, "public");

const force = process.argv.includes("--force");
const check = process.argv.includes("--check");

function sips(args: string[]): string {
  return execFileSync("sips", args, { encoding: "utf8" });
}

function dimensions(file: string): { w: number; h: number } {
  const out = sips(["-g", "pixelWidth", "-g", "pixelHeight", file]);
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
  if (!w || !h) throw new Error(`could not read dimensions of ${file}`);
  return { w, h };
}

/** The card for an article, by convention. Kept in step with `seo.ts`. */
export function cardPath(slug: string): string {
  return `/blog/share/${slug}.jpg`;
}

const wanted = POSTS.filter((p) => p.image);
if (!wanted.length) {
  console.log("No article has an image yet, so there is no card to build.");
  process.exit(0);
}

mkdirSync(resolve(PUBLIC, "blog/share"), { recursive: true });

let built = 0;
let kept = 0;
const missing: string[] = [];

for (const post of wanted) {
  const src = resolve(PUBLIC, post.image!.src.replace(/^\//, ""));
  const out = resolve(PUBLIC, cardPath(post.slug).replace(/^\//, ""));

  if (!existsSync(src)) {
    console.error(`  MISSING SOURCE  ${post.slug}: ${post.image!.src}`);
    missing.push(post.slug);
    continue;
  }

  if (check) {
    if (existsSync(out)) {
      const { w, h } = dimensions(out);
      if (w === CARD_W && h === CARD_H) {
        console.log(`  ok       ${post.slug}  ${w}x${h}`);
        continue;
      }
      console.error(`  WRONG SIZE  ${post.slug}: ${w}x${h}, wanted ${CARD_W}x${CARD_H}`);
    } else {
      console.error(`  NO CARD  ${post.slug}: expected ${cardPath(post.slug)}`);
    }
    missing.push(post.slug);
    continue;
  }

  if (existsSync(out) && !force) {
    console.log(`  kept     ${post.slug}  (exists; --force to regenerate)`);
    kept++;
    continue;
  }

  // Scale so the source COVERS the card, then crop. Resampling by the axis that
  // is proportionally shorter is what guarantees neither dimension ends up under
  // the target and leaves sips padding the difference with white.
  const { w, h } = dimensions(src);
  const byWidth = CARD_W / w >= CARD_H / h;
  sips([...(byWidth ? ["--resampleWidth", `${CARD_W}`] : ["--resampleHeight", `${CARD_H}`]), src, "--out", out]);

  const scaled = dimensions(out);
  const offsetY = Math.max(0, Math.round((scaled.h - CARD_H) * UPWARD_BIAS));
  const offsetX = Math.max(0, Math.round((scaled.w - CARD_W) / 2));

  sips(["--cropOffset", `${offsetY}`, `${offsetX}`, "-c", `${CARD_H}`, `${CARD_W}`, out, "--out", out]);
  sips(["-s", "format", "jpeg", "-s", "formatOptions", "70", out, "--out", out]);

  const final = dimensions(out);
  console.log(`  built    ${post.slug}  ${final.w}x${final.h}  from ${w}x${h}`);
  built++;
}

console.log();
if (check) {
  if (missing.length) {
    console.error(
      `${missing.length} article(s) without a usable sharing card: ${missing.join(", ")}\n` +
        `Run: npm run blog:cards\n`,
    );
    process.exit(1);
  }
  console.log(`Sharing cards OK: ${wanted.length} article(s) with art, all carded.\n`);
  process.exit(0);
}

console.log(`${built} built, ${kept} kept. Commit anything under public/blog/share/.\n`);
if (missing.length) process.exit(1);
