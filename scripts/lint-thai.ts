/**
 * The Thai language rules, as code.
 *
 *   npx tsx scripts/lint-thai.ts                      # this app's strings
 *   npx tsx scripts/lint-thai.ts <draft.md> [...]     # Facebook post drafts
 *
 * `Language_System.md` in the coaching repo holds the rules and the reasoning,
 * `termbase.yml` holds the decided terms. This file holds neither. It implements
 * LR-02 and LR-04 to LR-08 mechanically and nothing else, so a rule changes in
 * one place and is enforced in one place.
 *
 * What it deliberately cannot check: LR-01 and LR-03. Whether a sentence sounds
 * like a Thai person said it is not a pattern, and a lint that pretended to judge
 * it would be worse than one that says plainly it does not.
 *
 * `verify-copy.ts` imports `lintThai` and fails on what it returns. Post drafts
 * go through the CLI.
 */

import { readFileSync } from "node:fs";
import { TERMBASE, TERMS } from "../src/lib/content/termbase.generated.js";
import type { Surface, Term } from "./sync-termbase.js";

export interface LintTarget {
  /** Where this string lives, for the failure message. */
  id: string;
  th: string;
  /** The English source, where there is one. Used by the passthrough check. */
  en?: string;
  surface: Exclude<Surface, "all">;
  /** Term id this string must render exactly, for `fixed` terms. */
  binding?: string;
}

export interface LintFinding {
  rule: string;
  target: string;
  message: string;
  /** Character span in `th` this finding covers, where it has one. */
  at?: [number, number];
  /**
   * `warn` is for a finding whose resolution is already recorded as an open
   * decision. It prints and does not fail. Everything else is `fail`.
   */
  level: "fail" | "warn";
}

const applies = (t: Term, s: LintTarget["surface"]) =>
  t.surfaces.includes("all") || t.surfaces.includes(s);

const span = (f: LintFinding) => (f.at ? f.at[1] - f.at[0] : 0);

/**
 * Stems ฟรี may attach to. The first two are PunProfile's, from the termbase.
 * The rest are the examples LR-04 names as naturally collocating, kept here
 * rather than in the termbase because they are illustrations of the rule and not
 * decisions PunProfile has made about its own copy.
 *
 * **`อ่าน` and `เปิด` added 17/08/2026**, when this check was first pointed at
 * the per-page content modules and failed three strings, two of them Paul's own
 * and one shipped in `footer.ts` since 15/08/2026.
 *
 * They are added rather than exempted because LR-04's own test admits them. The
 * rule asks whether the verb alone already reads as something worth paying for,
 * and names คุย as the counter-example precisely because casual talk is not.
 * Reading something and having a group open to you both are: อ่านฟรี and เปิดฟรี
 * are ordinary Thai, and the rule was never aimed at them. It was derived from
 * the คุยฟรี error and the whitelist simply stopped where that error did.
 *
 * The termbase's ban on คุยฟรี, แชทฟรี, ทักฟรี and นัดคุยฟรี is untouched.
 *
 * `Language_System.md` owns the rule's wording and lives in the read-mostly
 * zone, so its LR-04 section still describes the narrower list. That is a
 * pending edit, not a disagreement.
 */
const FREE_STEMS = ["ปรึกษา", "ทดลอง", "ตรวจ", "เรียน", "ส่ง", "จัดส่ง", "อบรม", "อ่าน", "เปิด"];

/** Casual verbs that must stay separate from ฟรี. LR-04. */
const CASUAL_VERBS = ["คุย", "แชท", "ทัก", "แอด", "เม้าท์", "ถาม"];

/**
 * Words after which ฟรี is a predicate rather than half a compound.
 *
 * Added 17/08/2026 with the two stems above, and it is a different fix for a
 * different problem. `ส่วนไหนฟรี`, "which part is free", is not a verb with ฟรี
 * stuck on the end; it is a question whose answer is "free". LR-04 has nothing
 * to say about it, and the check was firing because it reads the characters
 * before ฟรี and cannot see grammar.
 *
 * Deliberately short, and it is not a general escape hatch: everything here has
 * to be a word that can only be the subject of a predicate, never a verb ฟรี
 * could compound with.
 */
const FREE_PREDICATE_SUBJECTS = ["ไหน", "นี้", "นั้น"];

/**
 * The potential marker. `<verb>ได้ฟรี` is "can be done for free", where ฟรี is an
 * adverb on the whole phrase rather than a compound on the verb.
 *
 * Added 17/08/2026, on Paul's own `ทำได้ฟรี` in `faq.ts`, shipped since
 * 14/08/2026 and only visible once `verify-pages.ts` stopped skipping strings
 * held inside arrays. It is a grammatical class rather than another word on a
 * list, which is why it is here and not a third entry in `FREE_STEMS`: `อ่านได้ฟรี`
 * and `ใช้ได้ฟรี` are the same construction and none of them needs its own
 * exemption.
 *
 * **`CASUAL_VERBS` is still checked first, with this stripped**, so `คุยได้ฟรี`
 * fails exactly as `คุยฟรี` does. Chatting does not become a paid service by
 * having a potential marker on it, and that is the one thing LR-04 was written
 * to catch.
 */
const POTENTIAL_MARKER = "ได้";

/**
 * Text with every quoted span blanked out, positions preserved.
 *
 * An employer's own words are quoted on purpose, and the rules about emphasis
 * and register are about how PunProfile writes, not about what it reports. The
 * 14/08 batch quoted "We do sponsor visas!" twice and the emphasis check called
 * it two exclamation marks of PunProfile's own.
 */
function withoutQuotes(s: string): string {
  return s.replace(/"[^"]*"|"[^"]*"|'[^']*'/g, (m) => " ".repeat(m.length));
}

export function lintThai(targets: LintTarget[]): LintFinding[] {
  const out: LintFinding[] = [];
  const add = (
    rule: string,
    target: string,
    message: string,
    at?: [number, number],
    level: "fail" | "warn" = "fail",
  ) => out.push({ rule, target, message, at, level });

  for (const target of targets) {
    const { th, en, surface, id } = target;
    if (!th.trim()) continue;
    const unquoted = withoutQuotes(th);

    // ---------------------------------------------------- LR-04 to LR-06, terms
    // A banned form is one somebody actually shipped and Paul corrected. Scoped
    // by surface, because ประกาศ rules mean nothing on an app screen.
    const banned: LintFinding[] = [];
    for (const term of TERMS) {
      if (!applies(term, surface)) continue;
      for (const form of term.banned) {
        let from = 0;
        for (;;) {
          const i = th.indexOf(form, from);
          if (i === -1) break;
          banned.push({
            rule: term.rule,
            target: id,
            message: `"${form}" is banned by term \`${term.id}\`. Use ${term.th.join(" or ")}.`,
            at: [i, i + form.length],
            level: "fail",
          });
          from = i + 1;
        }
      }
    }
    // นัดคุยฟรี and คุยฟรี are the same mistake seen at two widths. Report the
    // widest match covering a span and drop the rest, or one correction reads as
    // three failures and the count stops meaning anything.
    const kept = banned.filter(
      (f) =>
        !banned.some(
          (g) => g !== f && g.at![0] <= f.at![0] && g.at![1] >= f.at![1] && span(g) > span(f),
        ),
    );
    out.push(...kept);

    // ------------------------------------------------------- LR-04, collocation
    // The banned list catches the forms already written. This catches the next
    // one, before it needs a human to notice it.
    for (const m of th.matchAll(/ฟรี/g)) {
      // Already reported at full width by the banned scan.
      if (kept.some((f) => f.at![0] <= m.index && f.at![1] >= m.index + 3)) continue;
      const before = th.slice(Math.max(0, m.index - 12), m.index);
      // A trailing potential marker is stripped before every test below, so
      // `ทำได้ฟรี` is judged on ทำ and `คุยได้ฟรี` on คุย. Order matters: the
      // casual-verb check has to see through the marker, or the one form this
      // rule exists to ban gets a free pass by adding two characters.
      const adverbial = before.endsWith(POTENTIAL_MARKER);
      const stem = adverbial ? before.slice(0, -POTENTIAL_MARKER.length) : before;
      const casual = CASUAL_VERBS.find((v) => stem.endsWith(v));
      if (!casual) {
        if (FREE_STEMS.some((s) => stem.endsWith(s))) continue;
        if (FREE_PREDICATE_SUBJECTS.some((s) => stem.endsWith(s))) continue;
        if (adverbial) continue;
      }
      if (casual) {
        add("LR-04", id, `ฟรี attached to the casual verb "${casual}". Attach it to ปรึกษา instead.`);
      } else if (/[฀-๿]$/.test(before)) {
        add(
          "LR-04",
          id,
          `ฟรี attached to "${before.slice(-6)}", which is not a known service word. ` +
            `If that verb already reads as something worth paying for, add it to FREE_STEMS with a reason.`,
        );
      }
    }

    // -------------------------------------------------------- LR-06, speech act
    // The adjacent forms are in the termbase. This reaches the ones with words in
    // between, "ประกาศเรื่องนี้บอกว่า".
    if (surface === "post") {
      for (const m of th.matchAll(/ประกาศ/g)) {
        const after = th.slice(m.index, m.index + 24);
        const verb = ["พูด", "บอก", "เล่า"].find((v) => after.includes(v));
        if (verb) {
          add("LR-06", id, `ประกาศ given the speech-act verb "${verb}". Use ระบุ or เขียน.`);
        }
      }
    }

    // ------------------------------------------------------------- LR-07, budget
    if (surface === "post") {
      const count = [...th.matchAll(/ประกาศ/g)].length;
      if (count > 1) {
        add(
          "LR-07",
          id,
          `ประกาศ used ${count} times. Budget is one per post, and only where the exact wording is the point.`,
        );
      }
    }

    // ------------------------------------------------------------- LR-08, fixed
    if (target.binding) {
      const term = TERMS.find((t) => t.id === target.binding);
      if (!term) {
        add("LR-08", id, `bound to term \`${target.binding}\`, which is not in the termbase`);
      } else if (th !== term.th[0]) {
        // A mismatch on a term that already records the conflict is a decision
        // waiting on Paul, not a regression, and a harness that stays red until
        // he answers is a harness people stop reading. It downgrades to a
        // warning, and becomes a hard failure the moment the `conflict` field is
        // removed from the termbase, which is what deciding it looks like.
        add(
          "LR-08",
          id,
          `renders "${th}" but term \`${term.id}\` is fixed at "${term.th[0]}".` +
            (term.conflict ? "\n       Recorded as unresolved in the termbase, awaiting a decision." : ""),
          undefined,
          term.conflict ? "warn" : "fail",
        );
      }
    }

    // ------------------------------------------------ markdown, house rule
    // Facebook renders it literally. A prose rule since the beginning, checked
    // for the first time here.
    if (surface === "post" || surface === "message") {
      if (/\*\*|__|`/.test(th)) {
        add("format", id, "markdown syntax in post copy. Facebook renders it literally.");
      }

      // Em dashes, narrowed 15/08/2026. The house rule used to be a blanket ban
      // and `verify-copy.ts` enforced it over the app's own strings; it now binds
      // only on what PunProfile says to someone, meaning chat and LINE, email and
      // social posts. That is exactly `post` and `message` here, and the commit
      // that narrowed the rule noted that nothing automated was left checking the
      // surfaces it still covers. This is that check.
      if (th.includes("—")) {
        add("format", id, "em dash in something PunProfile says. Use a comma or a shorter sentence.");
      }
    }

    // ---------------------------------------- emphasis budget, the moves item 4
    // "Emphasis is rationed to the one sentence that removes blame."
    if (surface === "post" || surface === "message") {
      const bangs = [...unquoted.matchAll(/!/g)].length;
      if (bangs > 1) {
        add("voice", id, `${bangs} exclamation marks. One point of emphasis per post or message.`);
      }
    }

    // --------------------------------------------------- person, the moves item 8
    // เรา for the brand in broadcast, ผม in 1:1. A binding exempts a string that
    // was decided otherwise, which is how คุยกับผม survives on an app surface.
    if (!target.binding) {
      if (surface === "post" && /ผม/.test(th)) {
        add("voice", id, "ผม in broadcast copy. Use เรา, per the person table in the termbase.");
      }
      if (surface === "message" && /\bเรา\b|ทีมเรา/.test(th)) {
        add("voice", id, "เรา in a 1:1 message, where a brand plural reads evasive. Use ผม.");
      }
    }

    // ------------------------------------------------------------------ LR-02
    // Job categories, industries, role titles and countries are supplied in
    // English in both directions, so on this surface Thai script is the failure
    // and identical strings are the point. The 90 survey responses that mixed
    // เจ้าหน้าอาวุโสกลยุทธ์สื่อ into a column with "Senior Software QA Engineer" are
    // what this prevents.
    if (surface === "value") {
      if (/[฀-๿]/.test(th)) {
        add("LR-02", id, `Thai script in a value that is supplied in English. LR-02.`);
      }
      continue;
    }

    // ------------------------------------------------------------ passthrough
    // Thai identical to English is either an intentional passthrough recorded in
    // the termbase, or a string nobody translated.
    //
    // A string with no words in it is neither. "{step} / {total}" is a format,
    // and translating it would mean translating the slash.
    const words = (en ?? "").replace(/\{[a-zA-Z]+\}/g, "").replace(/[^\p{L}]/gu, "");
    if (en && words && th.trim() === en.trim()) {
      const allowed = TERMS.some((t) => t.th[0] === th.trim() && applies(t, surface));
      if (!allowed) {
        add(
          "LR-01",
          id,
          `Thai is identical to English and no termbase entry allows it. Translate it, or record the passthrough.`,
        );
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// CLI: post drafts
// ---------------------------------------------------------------------------

/**
 * Splits a draft file into one target per post, and one per Creative Callout.
 *
 * Only the `## Ready to Publish` section holds drafted copy. `Needs Your
 * Screening` entries are questions for Paul, and the run summary at the end is
 * tooling notes. Linting those failed six drafts for backticks in a sentence
 * about `build_brief.py`, which is the lint being wrong rather than the draft.
 *
 * Within a post, the `Source:`, `Priority:` and `What's missing:` lines are the
 * reviewer's and never the reader's, which is exactly where LR-07 says
 * attribution belongs. Counting ประกาศ in them would fail a draft for doing the
 * right thing.
 *
 * Callouts are separate targets. They are graphic-overlay text, so they carry
 * their own ประกาศ budget rather than spending the post's.
 */
export function postsFromDraft(path: string): LintTarget[] {
  const text = readFileSync(path, "utf8");
  const file = path.split("/").pop() ?? path;

  // Everything from "Ready to Publish" up to the next `##` heading.
  const publishable = text.split(/^## +Ready to Publish[^\n]*$/m)[1]?.split(/^## /m)[0];
  if (!publishable) return [];

  const META = /^(Source|Posted|Priority|Verdict|Score|Notes|What's known|What's missing|Question to resolve)\b.*:/;

  return publishable
    .split(/^### /m)
    .slice(1)
    .flatMap((section, i) => {
      const lines = section.split(/^---$/m)[0].split("\n");
      const title = (lines[0] ?? `post ${i + 1}`).trim();
      const rest = lines.slice(1).filter((l) => !META.test(l.trim()));

      // The callout block is `Creative Callouts:` followed by numbered lines.
      // The post body is everything after it.
      const start = rest.findIndex((l) => /^Creative Callouts:/.test(l.trim()));
      const callouts: LintTarget[] = [];
      let bodyFrom = 0;

      if (start !== -1) {
        let j = start + 1;
        for (; j < rest.length && /^\s*\d+\.\s/.test(rest[j]); j++) {
          callouts.push({
            id: `${file} :: ${title} :: callout ${rest[j].trim().slice(0, 2)}`,
            th: rest[j].replace(/^\s*\d+\.\s*/, ""),
            surface: "post",
          });
        }
        bodyFrom = j;
      }

      const body = rest.slice(bodyFrom).join("\n").trim();
      return [
        ...callouts,
        ...(body ? [{ id: `${file} :: ${title}`, th: body, surface: "post" as const }] : []),
      ];
    });
}

function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.error("Linting this app's strings is done by verify-copy.ts:");
    console.error("  npx tsx scripts/verify-copy.ts");
    console.error("For post drafts, pass the files:");
    console.error("  npx tsx scripts/lint-thai.ts ../punprofile-career-coaching/punprofile-work/work-pipeline/drafts/*.md");
    process.exit(2);
  }

  const targets = files.flatMap(postsFromDraft);
  const findings = lintThai(targets);

  const failures = findings.filter((f) => f.level === "fail");
  for (const f of findings) {
    const tag = f.level === "warn" ? "OPEN" : "FAIL";
    console.error(`${tag} [${f.rule}] ${f.target}\n       ${f.message}`);
  }

  console.log(
    `\n${targets.length} posts checked against ${TERMS.length} terms ` +
      `(termbase ${TERMBASE.updated}, hash ${TERMBASE.sourceHash})`,
  );
  if (failures.length) {
    console.error(`${failures.length} findings`);
    process.exit(1);
  }
  console.log("No findings. LR-01 and LR-03 still need a read.");
}

if (process.argv[1]?.endsWith("lint-thai.ts")) main();
