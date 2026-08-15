/**
 * Where a candidate came from, parsed from the URL. Spec:
 * `lifecycle-data-model.md` § 5.
 *
 * **What this replaces.** `leads.source` was a single loose string, and the
 * client passed the literal `"direct"` on every session without ever reading a
 * URL parameter. So every app-native lead in the database claims the same
 * origin, and none of those claims mean anything. The one attribution question
 * this business has, which job posts produce leads, could not be asked at all.
 *
 * Pure and side-effect free so the mutation, the client and a test can all
 * agree on what a given URL means.
 */

export const CHANNELS = [
  "fb_group_post",
  "fb_pinned_post",
  "line_oa",
  "direct",
  "referral",
  "other",
] as const;
export type Channel = (typeof CHANNELS)[number];

export type Attribution = {
  channel: Channel;
  campaign?: string;
  landedAt: number;
  raw?: string;
};

/**
 * Accepted spellings, so a link written by hand still lands somewhere true.
 *
 * The keys are what actually gets typed into a Facebook post: `src=fb`, or a
 * pasted `utm_source=facebook`. Anything unrecognised becomes `other` and keeps
 * its original text in `raw`, which is the part that matters. A channel added
 * six months from now can be recovered from `raw`; one collapsed into `direct`
 * cannot, and would silently inflate the number that looks like organic
 * traffic.
 */
const ALIASES: Record<string, Channel> = {
  fb: "fb_group_post",
  facebook: "fb_group_post",
  fb_group_post: "fb_group_post",
  group: "fb_group_post",
  job: "fb_group_post",
  jobpost: "fb_group_post",
  pinned: "fb_pinned_post",
  fb_pinned_post: "fb_pinned_post",
  pinned_post: "fb_pinned_post",
  line: "line_oa",
  line_oa: "line_oa",
  lineoa: "line_oa",
  oa: "line_oa",
  referral: "referral",
  ref: "referral",
  friend: "referral",
  direct: "direct",
};

/** Which query keys are read, in order of precedence. */
const SOURCE_KEYS = ["src", "source", "utm_source"] as const;
const CAMPAIGN_KEYS = ["job", "jobid", "campaign", "utm_campaign"] as const;

const clean = (s: string | null | undefined) =>
  (s ?? "").trim().toLowerCase().replace(/[\s]+/g, "_").slice(0, 60);

/**
 * Read attribution from a query string.
 *
 * **No parameters means `direct`, and that is a claim worth being careful
 * about.** It is true for someone who typed the address or followed an
 * unparameterised link, and it is also what a stripped or mangled link looks
 * like. `raw` stays absent in that case, which is how a reader tells a real
 * direct visit from a link that lost its tag: a `direct` with no `raw` is an
 * assumption, not an observation.
 */
export function parseAttribution(
  search: string | URLSearchParams,
  landedAt: number,
): Attribution {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;

  let rawSource = "";
  for (const key of SOURCE_KEYS) {
    const v = params.get(key);
    if (v && v.trim()) {
      rawSource = v.trim();
      break;
    }
  }

  let campaign = "";
  for (const key of CAMPAIGN_KEYS) {
    const v = params.get(key);
    if (v && v.trim()) {
      campaign = v.trim().slice(0, 80);
      break;
    }
  }

  if (!rawSource) {
    return campaign
      ? // A campaign with no source still tells us a post sent them, and a job
        // id only ever appears on a job post link.
        { channel: "fb_group_post", campaign, landedAt, raw: `campaign_only:${campaign}` }
      : { channel: "direct", landedAt };
  }

  const channel = ALIASES[clean(rawSource)] ?? "other";
  return {
    channel,
    ...(campaign ? { campaign } : {}),
    landedAt,
    raw: rawSource.slice(0, 80),
  };
}

/**
 * Map a legacy `leads.source` string onto the new shape, for the backfill.
 *
 * Returns null when the string carries no information. `"direct"` is exactly
 * that: it is what the client sent unconditionally, so it is a default the code
 * chose rather than anything observed about the person, and writing it as an
 * attribution would launder a hardcoded value into a finding.
 */
export function attributionFromLegacySource(
  source: string | undefined,
  landedAt: number,
): Attribution | null {
  if (!source) return null;
  const key = clean(source);
  if (key === "direct" || key === "survey_import") return null;
  const channel = ALIASES[key] ?? "other";
  return { channel, landedAt, raw: source.slice(0, 80) };
}
