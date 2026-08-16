# og.png, the social share card

1200x630. Referenced from `metadata.openGraph` in `src/app/layout.tsx` and
served straight out of `public/`. Added 16/08/2026, after a link posted into the
Facebook group rendered as a bare URL.

## What is on it, and why

**The card is PunProfile, not EU Fit Check.** Paul's call, 16/08/2026, replacing
a first version that led on the assessment. A shared link is the business
introducing itself, and the assessment is one feature of an app that is still
growing, so a card built around it goes stale as the app does.

- **Teal**, the colour PunProfile is known by. Specifically `primary-deep`, the
  same surface as the site footer and for the reason recorded there: on
  `primary` white holds 4.71:1 and leaves nothing for a second tier, while on
  `primary-deep` white holds 8.97:1 and `accent-tint` 5.37:1. Lavender is EU Fit
  Check's identity and would say the wrong thing here.
- **The reversed wordmark**, so the brand is legible at thumbnail size before
  anything else is read.
- **The coaching hook**, `HOOK_EYEBROW`, `HOOK_LINE_1` and `HOOK_LINE_2` from
  `coaching.ts`, which are Paul's own Thai. The first sentence is set large and
  the second smaller: same size for both orphaned a word and gave the card four
  heading lines to read at thumbnail size.
- **The three service names** from `services.ts`, as chips.
- **The coach mascot.**

If any of those strings change, this image is stale. It is not generated from
them, only copied.

Deliberately not a screenshot of the result screen: at thumbnail size a radar
chart is an unreadable smudge, and a real-looking set of scores on a share card
invites the reading that they are somebody's.

## Rebuilding it

There is no build step, on purpose: it changes when someone decides it should.
The source is a throwaway HTML file rendered in a browser at 1200x630 and
screenshotted, because that is the only way to get real Noto Serif Thai shaping
with correct tone-mark placement.

1. Write the card as a standalone HTML file into `public/` (tokens copied from
   `globals.css`, fonts from Google Fonts, images by absolute path so `/og.png`
   and `/punprofile-wordmark.png` resolve).
2. Open it on the dev server, screenshot it, crop to the card's bounding box and
   resize to exactly 1200x630.
3. Delete the HTML file. It must not stay in `public/`: a fourth copy of the
   palette is exactly what `AGENTS.md` forbids, and this one would be served
   publicly as well.

## After changing it

Facebook caches aggressively and will keep serving the old card. Re-scrape at
`developers.facebook.com/tools/debug/` with the production URL, and change the
filename if a cache refuses to clear.
