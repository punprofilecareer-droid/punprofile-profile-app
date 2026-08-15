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
import { PROVENANCE, THIN_CORPUS } from "./lib/provenance";

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

const ROOT = resolve(import.meta.dirname, "..");

/**
 * The corpus, by surface.
 *
 * **Surfaces are separated because their registers genuinely differ.** App copy
 * is read once on a screen the reader chose to open. A Facebook post is read in
 * a feed, competing, and it is allowed to be looser. Judging one against the
 * other's bands would fail honest writing.
 *
 * **The app surface is derived, not listed.** Any module whose header claims
 * Paul's provenance joins it automatically, using the same claim
 * `audit-thai.ts` reads. That is deliberate: a hardcoded list was correct on
 * 15/08/2026 when four modules were his and wrong an hour later when eleven
 * were, and nothing would have said so. One fact, read in one way, in two
 * places.
 *
 * **Only confirmed Paul-authored Thai counts.** The daily drafts are model
 * output, and `capture-published.py` puts it plainly: what a model wrote is the
 * draft, what Paul published is correct. Baselining on drafts would calibrate
 * this tool against the errors it exists to catch.
 */

/** Where Paul drops confirmed material by hand. One folder per surface. */
const GOLDEN = "../punprofile-career-coaching/punprofile-work/work-content/golden-th";

/** Every app module whose own header claims his provenance. */
function paulsModules(): string[] {
  const dirs = ["src/lib/content", "src/lib"];
  const out: string[] = [];
  for (const d of dirs) {
    for (const f of readdirSync(resolve(ROOT, d))) {
      if (!f.endsWith(".ts") || f.includes("termbase.generated")) continue;
      const rel = `${d}/${f}`;
      let src: string;
      try {
        src = readFileSync(resolve(ROOT, rel), "utf8");
      } catch {
        continue;
      }
      if (!/(?<!\w)th:\s*"/.test(src)) continue;
      if (PROVENANCE.test(src.slice(0, 4000))) out.push(rel);
    }
  }
  return out;
}

const CORPUS: Record<string, string[]> = {
  app: [...paulsModules(), ...glob(`${GOLDEN}/app`)],
  /**
   * The pinned post is the only Facebook-surface Thai confirmed as his.
   * `work-pipeline/published/` fills as posts are captured, forward-only by his
   * own instruction, so this widens on its own and not before.
   */
  post: [
    "../punprofile-career-coaching/punprofile-work/work-funnel/pinned-post-punprofile-intro.md",
    ...glob("../punprofile-career-coaching/punprofile-work/work-pipeline/published"),
    ...glob(`${GOLDEN}/post`),
  ],
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
 *
 * **ก่อน and ได้ were removed 15/08/2026** after they made an email read as
 * twice as chatty as it was. Both are far more often content words than
 * register markers: ก่อน is "before" and "first", and a text about doing things
 * in the right order is full of it legitimately; ได้ is "can" and "able to".
 * Counting either measures the subject matter rather than the voice.
 */
const PARTICLES = ["เลย", "ไว้", "แล้ว", "นะ", "ด้วย"];

type Stats = {
  strings: number;
  thaiChars: number;
  nominalisation: number;
  particles: number;
  phraseLen: number;
};

function measure(runs: string[]): Stats {
  const text = runs.join("\n");
  const thaiChars = (text.match(THAI_G) ?? []).length;
  if (thaiChars === 0) {
    return { strings: 0, thaiChars: 0, nominalisation: 0, particles: 0, phraseLen: 0 };
  }
  // `ความ` always nominalises. `การ` only when followed by Thai, to avoid
  // matching it inside unrelated Latin-adjacent text.
  const nom = (text.match(/ความ|การ(?=[฀-๿])/g) ?? []).length;
  const parts = PARTICLES.reduce((n, p) => n + text.split(p).length - 1, 0);
  // Thai does not space between words, so a space is a deliberate phrase break
  // and the mean run between breaks is a usable proxy for clause length.
  //
  // **A newline is a break too**, corrected 15/08/2026. Splitting on spaces
  // alone read a line-broken email at 35.4 against a 21.5 baseline when its real
  // figure was 20.2, because each whole line counted as one phrase. Every
  // measurement of line-broken text before this was wrong the same way,
  // including the post-surface baseline itself.
  const chunks = text.split(/[ \n]+/).filter((c) => THAI.test(c));
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
const surfaceChosen = surfaceArg > -1;
const surfaceName = surfaceChosen ? process.argv[surfaceArg + 1] : "app";
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

/**
 * Say when the baseline was a default rather than a choice.
 *
 * Added 15/08/2026, after measuring eight LINE messages and reading seven of
 * them as HIGH on particles. They were not: they were 1:1 messages measured
 * against app chrome, because `golden-th/line/` is empty and `app` is the
 * default. Buttons and error labels are not addressed to a person, so they
 * carry almost no `นะ` or `เลย`, and any real message will read HIGH forever.
 *
 * The surface table above already marks the choice with an arrow, which was
 * evidently not loud enough to stop me drawing the conclusion anyway.
 */
const defaulted = !surfaceChosen;

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
      : s.stats.thaiChars < THIN_CORPUS
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

// Small samples flip a verdict on one or two words, and a tight band invites
// rewriting good copy to chase noise. Say so rather than letting a HIGH on 500
// characters read with the same weight as one on 4,000.
const SMALL = 1500;
if (subject.thaiChars < SMALL || baseline.thaiChars < THIN_CORPUS) {
  console.log(
    `  NOTE: small sample. Subject ${subject.thaiChars} chars against a ${baseline.thaiChars}-char\n` +
      `  baseline. A single word can move a rate here, so treat any single band miss as a\n` +
      `  prompt to look rather than as a finding. Do not rewrite working copy to hit a number.\n`,
  );
}
// Bands are wide on purpose. This is a drift detector, not a style guide, and a
// narrow band would fail honest variation between a FAQ and a guide.
const results = [
  row("nominalisation (ความ/การ) /1000", subject.nominalisation, baseline.nominalisation, 0.5),
  row("particles /1000", subject.particles, baseline.particles, 0.5),
  row("mean phrase length (chars)", subject.phraseLen, baseline.phraseLen, 0.35),
];

console.log(
  (defaulted
    ? `\n  BASELINE IS "app" BY DEFAULT, not because it fits this text. App copy is\n` +
      `  chrome: buttons, labels, errors, nobody is addressed. A 1:1 message or an\n` +
      `  email will read HIGH on particles against it every time, and that is the\n` +
      `  baseline being wrong, not the copy. Pass --surface <name> once the right\n` +
      `  one has material in golden-th/.\n`
    : "") +
  "\n  This measures register only. It says nothing about whether the Thai is\n" +
    "  correct, idiomatic or true. A LOW nominalisation score usually means the\n" +
    "  text is chopped; a HIGH particle score usually means it reads like chat.\n",
);

process.exit(results.every(Boolean) ? 0 : 1);
