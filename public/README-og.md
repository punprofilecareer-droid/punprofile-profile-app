# og.png, the social share card

1200x630. Referenced from `metadata.openGraph` in `src/app/layout.tsx` and
served straight out of `public/`. Added 16/08/2026, after a link posted into the
Facebook group rendered as a bare URL.

## What is on it, and why

- **The lavender field**, EU Fit Check's own colour, not the Teal chrome. The
  card advertises the assessment.
- **The wordmark**, so the brand is legible at thumbnail size before anything
  else is read.
- **The Thai headline**, which is `landing.headline` from `copy.ts` and not a
  second wording of it. If that string changes, this image is stale.
- **The coach mascot.**
- **No subhead.** Facebook and LINE print `og:description` directly beneath the
  card, so a second sentence inside the image is the same words twice at a third
  of the size.

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
