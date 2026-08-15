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

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { maySend, type ConsentEvent } from "../src/lib/consent";

const ROOT = resolve(import.meta.dirname, "..");
const BLOCKS = resolve(
  ROOT,
  "../punprofile-career-coaching/punprofile-work/work-content/email-send-blocks.md",
);
const OUT = resolve(ROOT, "data/send-pack");

/**
 * Countries whose scheme name `07_Reference.md` verified on 15/08/2026, mapped
 * to the block that names it and the Thai the placeholder renders as.
 *
 * **Adding a row here is a claim that the route was checked against the
 * official source named in that document.** It is not a translation task.
 */
const ROUTES: Record<string, { block: string; th: string }> = {
  Netherlands: { block: "a-route-netherlands", th: "เนเธอร์แลนด์" },
  Germany: { block: "a-route-germany", th: "เยอรมนี" },
  Ireland: { block: "a-route-ireland", th: "ไอร์แลนด์" },
  Denmark: { block: "a-route-denmark", th: "เดนมาร์ก" },
  Sweden: { block: "a-route-sweden", th: "สวีเดน" },
  France: { block: "a-route-france", th: "ฝรั่งเศส" },
  "United Kingdom": { block: "a-route-united-kingdom", th: "สหราชอาณาจักร" },
};

/**
 * Thai for the countries in the data with no verified route. Needed because the
 * `a-no-route` block still names the country, it just declines to name a
 * scheme for it.
 */
const COUNTRY_TH: Record<string, string> = {
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

/**
 * The one checkable fact, where there is one. Only three countries have
 * something in `07_Reference.md` that is a fact rather than a threshold, and a
 * threshold may not go in candidate copy.
 */
const FACT: Record<string, string> = {
  Netherlands: "a-fact-sponsor-register",
  "United Kingdom": "a-fact-sponsor-register",
  Germany: "a-fact-chancenkarte",
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
  "a-no-numbers",
  "a-study-route",
  "a-no-route",
  "a-close",
  "b-body",
  "subject-a",
  "subject-b",
  ...Object.values(ROUTES).map((r) => r.block),
  ...new Set(Object.values(FACT)),
].filter((k) => !B[k]);
if (missing.length) {
  console.error(`\n  email-send-blocks.md is missing: ${missing.join(", ")}\n`);
  process.exit(1);
}

type Built = { file: string; email: string; name: string; subject: string; body: string };
const built: Record<"a" | "b" | "hold", Built[]> = { a: [], b: [], hold: [] };
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
  let bucket: "a" | "b" | "hold";

  if (workAuth === "unsure") {
    bucket = "b";
    subject = B["subject-b"];
    body = fill(B["b-body"]);
  } else if (workAuth === "sponsor_no_route" && country) {
    bucket = "a";
    const route = ROUTES[country];
    const th = route?.th ?? COUNTRY_TH[country] ?? country;
    const parts = [fill(B["a-open"], th)];
    if (route) {
      parts.push(fill(B[route.block], th), B["a-no-numbers"]);
      if (FACT[country]) parts.push(fill(B[FACT[country]], th));
      // Germany's Chancenkarte block already is the second route, and stacking
      // the study route after it gives that reader three. One is the point.
      if (FACT[country] !== "a-fact-chancenkarte") parts.push(B["a-study-route"]);
    } else {
      parts.push(fill(B["a-no-route"], th), B["a-study-route"]);
    }
    parts.push(B["a-close"]);
    subject = fill(B["subject-a"], th);
    body = parts.join("\n\n");
  } else {
    // No visa answer, or the answer without a country to hang it on. Both are
    // Paul's call, and a guess here is a guess about someone's immigration
    // status.
    bucket = "hold";
    subject = B["subject-b"];
    body = fill(B["b-body"]);
  }

  const slug = email.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  built[bucket].push({ file: `${slug}.md`, email, name, subject, body });
}

rmSync(OUT, { recursive: true, force: true });
for (const b of ["a", "b", "hold"] as const) mkdirSync(resolve(OUT, b), { recursive: true });

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
  ...(["a", "b", "hold"] as const).flatMap((b) =>
    built[b].map((m) => `${b},"${m.name}",${m.email},"${m.subject}"`),
  ),
].join("\n");
writeFileSync(resolve(OUT, "index.csv"), index + "\n");

console.log(`\n  Send pack, ${OUT}\n`);
console.log(`    a     ${String(built.a.length).padStart(3)}  named a route, or said why not`);
console.log(`    b     ${String(built.b.length).padStart(3)}  the four routes, no country assumed`);
console.log(`    hold  ${String(built.hold.length).padStart(3)}  no visa answer. Paul decides, nothing is sent`);
const withRoute = readdirSync(resolve(OUT, "a")).filter((f) =>
  /ind\.nl|make-it-in-germany|enterprise\.gov|nyidanmark|migrationsverket|welcometofrance|gov\.uk/.test(
    readFileSync(resolve(OUT, "a", f), "utf8"),
  ),
).length;
console.log(`\n    of the ${built.a.length} in a, ${withRoute} name a verified scheme and ${built.a.length - withRoute} decline to`);
if (skipped.length) {
  console.log(`\n  NOT BUILT (${skipped.length})`);
  for (const s of skipped) console.log(`    ${s}`);
}
console.log(
  `\n  Nobody with workAuth sponsor_route_named or eu_rights is in here: their\n` +
    `  Mobility gate is already clear and this email would read as unread answers.\n`,
);
