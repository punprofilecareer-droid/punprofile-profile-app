/**
 * Measures Thai copy against the register of Paul's own approved Thai.
 *
 * `npm run verify:thai-register -- <file>`, or with no argument to print the
 * baseline. Reads any file and measures every Thai run it finds, so it works on
 * a `.ts` copy module, a markdown guide, or a pasted draft.
 *
 * ## Why this exists
 *
 * Added 15/08/2026. The Thai for a lead-magnet guide was written twice and was
 * wrong both times, and neither `lint-thai.ts` nor a careful read caught why.
 * `lint-thai.ts` only checks banned terms, and it silently checks nothing at
 * all on a file that is not post-shaped. A read cannot catch register drift
 * because register is a property of a whole document, not of any one sentence.
 *
 * Measuring the second draft against Paul's own approved strings found it
 * immediately, and the finding was the opposite of the assumption:
 *
 *   nominalisations   Paul 9.0 / 1000 chars, the draft 1.4
 *   particles         Paul 10.5 / 1000 chars, the draft 20.5
 *
 * The draft was not too formal. It was **too chopped and too chatty**: an
 * over-correction after an earlier note that `ความสามารถทางวิชาชีพ` read stiff.
 * Stripping ความ and การ below a natural rate makes Thai read telegraphic, and
 * padding particles to compensate makes it read like chat.
 *
 * ## What this can and cannot tell you
 *
 * It measures **register**, not correctness, and not naturalness. Text can hit
 * every band here and still be wrong, unidiomatic, or say something false. It
 * exists to catch the one failure mode a human reader reliably misses, which is
 * a document that drifted away from house voice while every sentence looked
 * fine on its own.
 *
 * The baseline is Paul's own Thai. If he rewrites those files, rerun and the
 * baseline moves with him, which is the intent.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Every text file in a directory, or nothing if it does not exist yet.
 *
 * `.keep.md` placeholders are skipped: they are English scaffolding and would
 * otherwise count as zero-Thai material in a surface that has none.
 */
function glob(dir: string): string[] {
  const abs = resolve(import.meta.dirname, "..", dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((f) => (f.endsWith(".md") || f.endsWith(".txt")) && !f.startsWith(".keep"))
    .map((f) => `${dir}/${f}`);
}

/** Where Paul drops confirmed material. One folder per surface. */
const GOLDEN = "../punprofile-career-coaching/punprofile-work/work-content/golden-th";

const ROOT = resolve(import.meta.dirname, "..");

/**
 * The corpus, by surface.
 *
 * **Surfaces are separated because their registers genuinely differ.** App copy
 * is read once on a screen the reader chose to open. A Facebook post is read in
 * a feed, competing, and it is allowed to be looser. Judging one against the
 * other's bands would fail honest writing.
 *
 * **Only confirmed Paul-authored Thai goes in here.** The daily drafts are
 * model output, and `capture-published.py` says it plainly: what a model wrote
 * is the draft, what Paul published is what is correct. Baselining on drafts
 * would calibrate this tool against the errors it exists to catch.
 */
const CORPUS: Record<string, string[]> = {
  // Roughly 123 strings. Each file is headed "rewritten from Paul's own Thai".
  app: [
    "src/lib/content/faq.ts",
    "src/lib/content/coaching.ts",
    "src/lib/content/services.ts",
    "src/lib/consent-copy.ts",
    ...glob(`${GOLDEN}/app`),
  ],
  /**
   * **A sample of one, and `03_Content_System.md` already flags it as such.**
   * The pinned post is the only Facebook-surface Thai confirmed to be Paul's
   * own edit. `work-pipeline/published/` was empty on 15/08/2026 and capture is
   * forward-only by his call, so this widens on its own as posts are captured
   * and not before. Treat post-surface numbers as indicative until it does.
   */
  post: [
    "../punprofile-career-coaching/punprofile-work/work-funnel/pinned-post-punprofile-intro.md",
    ...glob("../punprofile-career-coaching/punprofile-work/work-pipeline/published"),
    ...glob(`${GOLDEN}/post`),
  ],
  /** No examples yet. Anything written for these surfaces is currently being
   *  measured against the app's register, which is a guess. */
  line: glob(`${GOLDEN}/line`),
  email: glob(`${GOLDEN}/email`),
  other: glob(`${GOLDEN}/other`),
};

const THAI = /[฀-๿]/;
const THAI_G = /[฀-๿]/g;

/**
 * Casual sentence-final and aspectual particles. Not an exhaustive list of Thai
 * particles: these are the ones that carry spoken register, which is what is
 * being measured.
 */
const PARTICLES = ["เลย", "ก่อน", "ไว้", "แล้ว", "ได้", "นะ", "ด้วย"];

type Stats = {
  strings: number;
  thaiChars: number;
  nominalisation: number;
  particles: number;
  phraseLen: number;
};

function measure(runs: string[]): Stats {
  const text = runs.join(" ");
  const thaiChars = (text.match(THAI_G) ?? []).length;
  if (thaiChars === 0) {
    return { strings: 0, thaiChars: 0, nominalisation: 0, particles: 0, phraseLen: 0 };
  }
  // `ความ` always nominalises. `การ` only when followed by Thai, to avoid
  // matching it inside unrelated Latin-adjacent text.
  const nom = (text.match(/ความ|การ(?=[฀-๿])/g) ?? []).length;
  const parts = PARTICLES.reduce((n, p) => n + text.split(p).length - 1, 0);
  // Thai does not space between words; a space is a deliberate phrase break, so
  // the mean run between spaces is a usable proxy for clause length.
  const chunks = text.split(" ").filter((c) => THAI.test(c));
  return {
    strings: runs.length,
    thaiChars,
    nominalisation: (nom / thaiChars) * 1000,
    particles: (parts / thaiChars) * 1000,
    phraseLen: chunks.length ? thaiChars / chunks.length : 0,
  };
}

/** Every Thai-bearing line or `th:` string in a file. */
function extract(path: string): string[] {
  const src = readFileSync(path, "utf8");
  const quoted = [...src.matchAll(/th:\s*"([^"]+)"/g)].map((m) => m[1]).filter((t) => THAI.test(t));
  if (quoted.length) return quoted;
  return src
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => THAI.test(l))
    // Drop lines that are commentary about Thai rather than Thai copy: table
    // rows, bullets naming a banned term, and backticked references.
    .filter((l) => !l.startsWith("|") && !l.startsWith("- **") && !l.startsWith(">"))
    .map((l) => l.replace(/`[^`]*`/g, " "))
    .filter((l) => THAI.test(l));
}

const surfaces = Object.fromEntries(
  Object.entries(CORPUS).map(([name, files]) => [
    name,
    { stats: measure(files.flatMap((f) => extract(resolve(ROOT, f)))), files: files.length },
  ]),
);

// `--surface post` to measure against the feed register instead of the app's.
const surfaceArg = process.argv.indexOf("--surface");
const surfaceName = surfaceArg > -1 ? process.argv[surfaceArg + 1] : "app";
if (!surfaces[surfaceName]) {
  console.error(`Unknown surface "${surfaceName}". Known: ${Object.keys(CORPUS).join(", ")}`);
  process.exit(1);
}
if (surfaces[surfaceName].stats.thaiChars === 0) {
  console.error(
    `\n  Surface "${surfaceName}" has no material yet, so there is nothing to measure against.\n` +
      `  Add confirmed Paul-written Thai to golden-th/${surfaceName}/ first. See its README.\n` +
      `  Measuring against an empty baseline would invent bands from nothing.\n`,
  );
  process.exit(1);
}
const baseline = surfaces[surfaceName].stats;

const arg = process.argv.filter((a, i) => i >= 2 && a !== "--surface" && process.argv[i - 1] !== "--surface")[0];

function row(label: string, v: number, base: number, tolerance: number, unit = "") {
  const lo = base * (1 - tolerance);
  const hi = base * (1 + tolerance);
  const ok = v >= lo && v <= hi;
  const mark = ok ? "ok  " : v < lo ? "LOW " : "HIGH";
  console.log(
    `  ${mark} ${label.padEnd(34)} ${v.toFixed(1).padStart(6)}${unit}   baseline ${base.toFixed(1)}, band ${lo.toFixed(1)} to ${hi.toFixed(1)}`,
  );
  return ok;
}

console.log("\nThai register, measured against Paul's own confirmed copy\n");
for (const [name, s] of Object.entries(surfaces)) {
  const mark = name === surfaceName ? "->" : "  ";
  const thin =
    s.stats.thaiChars === 0
      ? "  EMPTY, add material to golden-th/"
      : s.stats.thaiChars < 3000
        ? "  THIN, treat as indicative"
        : "";
  console.log(
    `  ${mark} ${name.padEnd(5)} ${String(s.stats.strings).padStart(4)} strings, ${String(s.stats.thaiChars).padStart(5)} chars, ${s.files} file(s)${thin}`,
  );
}
console.log();

if (!arg) {
  console.log(`  nominalisations (ความ/การ) per 1000 : ${baseline.nominalisation.toFixed(1)}`);
  console.log(`  particles per 1000                  : ${baseline.particles.toFixed(1)}`);
  console.log(`  mean phrase length in characters    : ${baseline.phraseLen.toFixed(1)}`);
  console.log("\n  Pass a file to measure it against these.\n");
  process.exit(0);
}

const subject = measure(extract(resolve(process.cwd(), arg)));
if (subject.thaiChars === 0) {
  console.error(`  No Thai found in ${arg}.\n`);
  process.exit(1);
}

console.log(`  measuring: ${arg}, ${subject.thaiChars} Thai characters\n`);
// Bands are wide on purpose. This is a drift detector, not a style guide, and a
// narrow band would fail honest variation between a FAQ and a guide.
const results = [
  row("nominalisation (ความ/การ) /1000", subject.nominalisation, baseline.nominalisation, 0.5),
  row("particles /1000", subject.particles, baseline.particles, 0.5),
  row("mean phrase length (chars)", subject.phraseLen, baseline.phraseLen, 0.35),
];

console.log(
  "\n  This measures register only. It says nothing about whether the Thai is\n" +
    "  correct, idiomatic or true. A LOW nominalisation score usually means the\n" +
    "  text is chopped; a HIGH particle score usually means it reads like chat.\n",
);

process.exit(results.every(Boolean) ? 0 : 1);
