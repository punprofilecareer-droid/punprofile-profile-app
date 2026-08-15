/**
 * Who wrote a Thai string, as a claim a module makes about itself.
 *
 * One definition, imported by `audit-thai.ts`, which reports what has not been
 * read, and by `verify-thai-register.ts`, which decides what calibrates the
 * register bands. Two copies would let a file count as reviewed for one tool
 * and not the other, and that is the confusing half of a real bug.
 *
 * **Deliberately a short list of exact phrases.** A loose pattern would let any
 * file mentioning Paul mark itself reviewed, which is the one way this could
 * quietly start lying. Provenance is a claim in a header, never an inference
 * from how good the Thai looks.
 *
 * Its own module rather than an export from either script, because importing a
 * script executes it: the first attempt at sharing this pulled a
 * `process.exit` into the audit and silenced it.
 */
export const PROVENANCE =
  /Paul's own Thai|Paul's own wording|rewritten .{0,40}from Paul's own|Thai wording passed by Paul|Founder-signed off|Paul's sign-off/i;

/** How much Thai a surface needs before its numbers mean anything. */
export const THIN_CORPUS = 3000;
