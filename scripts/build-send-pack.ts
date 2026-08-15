/**
 * Builds one ready-to-send email per recipient. `npm run send-pack -- <export>`.
 *
 * Written 15/08/2026. There is no send path (`RESEND_API_KEY` is set on neither
 * deployment), so Paul sends these by hand. This produces the text and the
 * address, and refuses to produce either where it cannot justify them.
 *
 * **Output goes to `data/send-pack/`, which is gitignored.** Ninety-one names
 * and email addresses are not going into a repo. That is the whole reason the
 * path is not configurable.
 *
 * The Thai lives in `email-send-blocks.md` in the coaching repo, which owns it.
 * This file owns only which blocks a given person gets, and that decision comes
 * from their own answers.
 *
 * Three things it refuses to do, each because doing it once would be worse than
 * sending nothing:
 *
 *   1. **No consent, no file.** Resolved through `maySend` from
 *      `src/lib/consent.ts`, the same resolver the app uses. Not a timestamp
 *      check, not a "they gave us an address so presumably".
 *   2. **No verified route, no scheme name.** `07_Reference.md` verified seven
 *      countries; the data contains nineteen. The other twelve get a block that
 *      says so, which is `01_Project_Foundation.md`'s no-fabricated-third-party-
 *      terms rule with a face on it.
 *   3. **No segment, no guess.** Someone who never answered the visa question
 *      lands in `hold/` for Paul to decide, not in a pile that gets sent.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { maySend, type ConsentEvent } from "../src/lib/consent";

const ROOT = resolve(import.meta.dirname, "..");
const BLOCKS = resolve(
  ROOT,
  "../punprofile-career-coaching/punprofile-work/work-content/email-send-blocks.md",
);
const OUT = resolve(ROOT, "data/send-pack");

/**
 * What each country gets, and it is never a scheme name on its own.
 *
 * **Rewritten 15/08/2026.** The first version keyed on "has `07_Reference.md`
 * verified a scheme name for this country", and produced `Skilled Worker visa
 * รายละเอียดล่าสุดดูได้ที่ gov.uk ครับ`. Paul: "as a coach we don't say things
 * like this, do you take people for stupid." He is right. A name plus a link is
 * a search result, and sending one claims credit for a ten-second lookup.
 *
 * So the key is now **"is there something here that changes what they do"**,
 * which is a much shorter list than "is there a name". Four countries have it.
 * The rest get the general method, which is real advice that happens not to
 * need a country.
 */
const COUNTRY_BLOCK: Record<string, string> = {
  // The register is public, so the order of the job search can change.
  Netherlands: "a-method-register",
  "United Kingdom": "a-method-register",
  // You can go before anyone says yes, which changes the sequence entirely.
  Germany: "a-germany",
  // Quota-based and EU-preference tested, so targeting it alone is a strategy
  // problem worth naming before someone spends a year on it.
  Switzerland: "a-switzerland",
};

/**
 * Thai for every country in the data. Needed by every path, since even the
 * block that declines to detail a country still names it.
 */
const COUNTRY_TH: Record<string, string> = {
  Netherlands: "เนเธอร์แลนด์",
  Germany: "เยอรมนี",
  Ireland: "ไอร์แลนด์",
  Denmark: "เดนมาร์ก",
  Sweden: "สวีเดน",
  France: "ฝรั่งเศส",
  "United Kingdom": "สหราชอาณาจักร",
  Spain: "สเปน",
  Italy: "อิตาลี",
  Switzerland: "สวิตเซอร์แลนด์",
  Norway: "นอร์เวย์",
  Poland: "โปแลนด์",
  Portugal: "โปรตุเกส",
  Austria: "ออสเตรีย",
  Belgium: "เบลเยียม",
  Iceland: "ไอซ์แลนด์",
  Finland: "ฟินแลนด์",
  Luxembourg: "ลักเซมเบิร์ก",
  Greece: "กรีซ",
};

type Lead = {
  _id: string;
  email?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  responses?: Record<string, unknown> | null;
};

function blocks(): Record<string, string> {
  const src = readFileSync(BLOCKS, "utf8");
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/^## ([a-z0-9-]+)\n+```\n([\s\S]*?)^```/gm)) {
    out[m[1]] = m[2].trimEnd();
  }
  return out;
}

/** First name for the greeting. The import stored one field, often in caps. */
function greetName(l: Lead): string {
  const raw = (l.firstName ?? l.fullName ?? "").trim();
  if (!raw) return "";
  const first = raw.split(/\s+/)[0];
  // `LALIDA WARASTH` and `Sasiprapha Yimdee` are both in the data. Shouting
  // someone's name back at them is worse than the mixed casing it fixes.
  return first === first.toUpperCase() && /[a-z]/i.test(first)
    ? first[0] + first.slice(1).toLowerCase()
    : first;
}

function jsonl<T>(path: string): T[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);
}

const snapshot = process.argv[2];
if (!snapshot) {
  console.error("\n  usage: npm run send-pack -- <path to unzipped convex export>\n");
  process.exit(1);
}

const leads = jsonl<Lead>(resolve(snapshot, "leads/documents.jsonl"));
const events = jsonl<ConsentEvent & { leadId: string }>(
  resolve(snapshot, "consentEvents/documents.jsonl"),
);
const byLead = new Map<string, ConsentEvent[]>();
for (const e of events) {
  const list = byLead.get(e.leadId) ?? [];
  list.push(e);
  byLead.set(e.leadId, list);
}

const B = blocks();
const missing = [
  "a-open",
  "a-symptom",
  "a-method-register",
  "a-method-general",
  "a-germany",
  "a-switzerland",
  "a-study-route",
  "a-close",
  "b-body",
  "subject-a",
  "subject-b",
].filter((k) => !B[k]);
if (missing.length) {
  console.error(`\n  email-send-blocks.md is missing: ${missing.join(", ")}\n`);
  process.exit(1);
}

type Built = {
  file: string;
  email: string;
  name: string;
  subject: string;
  body: string;
  /** Which country block they got, or null for the general method. */
  countryBlock: string | null;
};
const built: Record<"a" | "b", Built[]> = { a: [], b: [] };
const skipped: string[] = [];

for (const lead of leads) {
  const email = (lead.email ?? "").trim();
  if (!email) continue;

  const consent = byLead.get(lead._id) ?? [];
  if (!maySend(consent, "email", "service")) {
    skipped.push(`${email}  no live email/service consent`);
    continue;
  }

  const r = (lead.responses ?? {}) as Record<string, unknown>;
  const workAuth = r.workAuth as string | null | undefined;
  const countries = (r.targetCountries as string[] | undefined) ?? [];
  const country = countries[0];
  const name = greetName(lead);
  if (!name) {
    skipped.push(`${email}  no name to greet`);
    continue;
  }

  // Nobody whose visa is already settled gets a visa email. `email-name-your-
  // route.md`: a Mobility email to someone who has cleared Mobility is the
  // clearest possible signal that nobody read their answers.
  if (workAuth === "sponsor_route_named" || workAuth === "eu_rights") continue;

  // Thai runs unspaced, so คุณฐิติกา is right and คุณTanyanan is not. A Latin
  // name needs the space a Thai one does not; without it the greeting is the
  // first thing a reader sees and the first thing that looks machine-made.
  const greeting = /^[\u0E00-\u0E7F]/.test(name) ? name : ` ${name}`;
  const fill = (s: string, th?: string) =>
    s.replaceAll("{ชื่อ}", greeting).replaceAll("{ประเทศ}", th ?? "");

  let subject: string;
  let body: string;
  let bucket: "a" | "b";
  let countryBlock: string | null = null;

  if (workAuth === "unsure") {
    bucket = "b";
    subject = B["subject-b"];
    body = fill(B["b-body"]);
  } else if (workAuth === "sponsor_no_route" && country) {
    bucket = "a";
    const th = COUNTRY_TH[country] ?? country;
    const special = COUNTRY_BLOCK[country];
    const parts = [fill(B["a-open"], th), fill(B["a-symptom"], th)];

    countryBlock = special ?? null;
    if (special) {
      parts.push(fill(B[special], th));
    } else {
      // No country-specific move, so the general one. It used to be followed by
      // a line admitting the country was not researched; that apologised in the
      // middle of good advice and added a second ask, so it is gone.
      parts.push(fill(B["a-method-general"], th));
    }

    // Germany's block already offers a second way in. A third would break the
    // method's own one-action rule.
    if (special !== "a-germany") parts.push(B["a-study-route"]);

    parts.push(B["a-close"]);
    subject = fill(B["subject-a"], th);
    body = parts.join("\n\n");
  } else {
    // No visa answer, or the answer with no country to hang it on. Paul's call,
    // 15/08/2026: send them B. It assumes no country and asks for one, which is
    // exactly the fact that is missing, so it is the right email by
    // construction rather than by guess.
    bucket = "b";
    subject = B["subject-b"];
    body = fill(B["b-body"]);
  }

  const slug = email.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  built[bucket].push({ file: `${slug}.md`, email, name, subject, body, countryBlock });
}

rmSync(OUT, { recursive: true, force: true });
for (const b of ["a", "b"] as const) mkdirSync(resolve(OUT, b), { recursive: true });

for (const [bucket, list] of Object.entries(built)) {
  for (const m of list) {
    writeFileSync(
      resolve(OUT, bucket, m.file),
      `To: ${m.email}\nSubject: ${m.subject}\n\n---\n\n${m.body}\n`,
    );
  }
}

const index = [
  "bucket,name,email,subject",
  ...(["a", "b"] as const).flatMap((b) =>
    built[b].map((m) => `${b},"${m.name}",${m.email},"${m.subject}"`),
  ),
].join("\n");
writeFileSync(resolve(OUT, "index.csv"), index + "\n");

console.log(`\n  Send pack, ${OUT}\n`);
console.log(`    a  ${String(built.a.length).padStart(3)}  they know they need sponsorship`);
console.log(`    b  ${String(built.b.length).padStart(3)}  the four routes, no country assumed`);

// What this counts changed with the rewrite. It used to count how many named a
// verified scheme, which is exactly the thing Paul cut. What matters now is how
// many got advice about their own country rather than the general method.
//
// Read from the choice the builder recorded, not by searching the output for a
// marker: the first attempt did that and reported 49 of 49, because the marker
// it looked for contains a placeholder that is filled before it is written.
const specific = built.a.filter((m) => m.countryBlock).length;
console.log(
  `\n    of the ${built.a.length} in a, ${specific} get advice specific to their country and\n` +
    `    ${built.a.length - specific} get the general method plus a line saying so. Four countries have\n` +
    `    something in 07_Reference.md that changes behaviour; the rest have a name.`,
);
const byBlock = new Map<string, number>();
for (const m of built.a) byBlock.set(m.countryBlock ?? "a-method-general", (byBlock.get(m.countryBlock ?? "a-method-general") ?? 0) + 1);
for (const [k, n] of [...byBlock].sort((x, y) => y[1] - x[1])) {
  console.log(`      ${String(n).padStart(3)}  ${k}`);
}
if (skipped.length) {
  console.log(`\n  NOT BUILT (${skipped.length})`);
  for (const s of skipped) console.log(`    ${s}`);
}
console.log(
  `\n  Nobody with workAuth sponsor_route_named or eu_rights is in here: their\n` +
    `  Mobility gate is already clear and this email would read as unread answers.\n`,
);
