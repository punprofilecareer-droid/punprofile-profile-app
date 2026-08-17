/**
 * Stops a generated review file from being regenerated over someone's markup.
 *
 * **Third attempt, 17/08/2026, and the first two are worth reading because each
 * failed in a different direction.**
 *
 * *One:* refuse if a `แก้เป็น:` line is filled in or a `PB:` note is present. That
 * checked the mechanism the file's author designed. Paul does not use it: he edits
 * the quoted Thai in place, which he did on both review files. A whole review pass
 * was regenerated over and survived only because it had already been read.
 *
 * *Two:* also refuse if any quoted line no longer matches what the code says. That
 * caught his edits, and then blocked the very next run, because applying his
 * corrections is itself a way of making the file disagree with the code. A guard
 * that fires after you do the right thing is a guard people learn to `--force`
 * past, which is worse than no guard.
 *
 * *Three, this one:* **a checksum of what was written.** The question is not "does
 * the file match the code", it is "has anyone touched the file since it was
 * generated", and only the generator can answer that. So it stamps the file, and
 * on the next run recomputes:
 *
 * - hash matches -> nobody has touched it -> regenerate freely, however stale it is
 * - hash differs -> a human edited it -> refuse, and say where
 * - no hash at all -> a file from before this existed -> refuse, and say so
 *
 * The `แก้เป็น:` and `PB:` scan survives, demoted from the gate to the
 * explanation: the checksum decides whether to stop, and those lines are what is
 * worth printing when it does.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const FIELD = "checksum";
const CORRECTION = "แก้เป็น:";

/** The document with its own checksum line removed, which is what gets hashed. */
const withoutStamp = (doc: string): string =>
  doc
    .split("\n")
    .filter((l) => !l.startsWith(`${FIELD}: `))
    .join("\n");

const hash = (doc: string): string =>
  createHash("sha256").update(withoutStamp(doc), "utf8").digest("hex").slice(0, 16);

/**
 * Inserts the stamp into the YAML frontmatter, or prepends one if there is none.
 *
 * Inside the frontmatter rather than in a comment at the foot, because a reader
 * scrolling to the end of a long review sheet should not find machine bookkeeping
 * where the last string should be.
 */
export function stamp(doc: string): string {
  const digest = hash(doc);
  const lines = doc.split("\n");
  if (lines[0] === "---") {
    const close = lines.indexOf("---", 1);
    if (close > 0) {
      lines.splice(close, 0, `${FIELD}: ${digest}`);
      return lines.join("\n");
    }
  }
  return `---\n${FIELD}: ${digest}\n---\n\n${doc}`;
}

export interface GuardResult {
  /** True when the file may be overwritten. */
  safe: boolean;
  /** One line per reason, for a terminal. Empty when safe. */
  reasons: string[];
}

/**
 * Whether `path` can be overwritten.
 *
 * A file that does not exist is safe. A file with no stamp is not, because it
 * predates this guard and there is no way to know what is in it.
 */
export function checkOverwrite(path: string): GuardResult {
  if (!existsSync(path)) return { safe: true, reasons: [] };

  const doc = readFileSync(path, "utf8");
  const recorded = doc.match(new RegExp(`^${FIELD}: ([0-9a-f]{16})$`, "m"))?.[1];

  if (!recorded) {
    return {
      safe: false,
      reasons: [
        "  The file carries no checksum, so it was written before this guard existed",
        "  and there is no way to tell whether anyone has edited it.",
      ],
    };
  }
  if (recorded === hash(doc)) return { safe: true, reasons: [] };

  // Edited. Everything below is only to say WHERE, so the reasons are best-effort
  // and never decide the outcome.
  const reasons = ["  Edited since it was generated. Apply the changes, then re-run with --force.", ""];
  const marked = doc
    .split("\n")
    .map((raw, i) => ({ line: raw.trim(), no: i + 1 }))
    .filter(
      ({ line }) =>
        line.startsWith("PB:") ||
        (line.startsWith(CORRECTION) && line.slice(CORRECTION.length).trim() !== ""),
    );

  if (marked.length) {
    reasons.push("  Corrections and notes found:");
    for (const { line, no } of marked) reasons.push(`    line ${no}: ${line.slice(0, 88)}`);
    reasons.push("");
  }
  reasons.push(
    "  There may also be edits made directly to the quoted strings, which is how",
    "  Paul reviews. Diff the file against git to see all of them.",
  );
  return { safe: false, reasons };
}
