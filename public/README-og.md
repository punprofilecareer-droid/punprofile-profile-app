# og.png, the social share card

1200x630. Referenced from `metadata.openGraph` in `src/app/layout.tsx` and
served straight out of `public/`. Added 16/08/2026, after a link posted into the
Facebook group rendered as a bare URL.

## What is on it, and why

**The card is PunProfile, not EU Fit Check.** Paul's call, 16/08/2026, replacing
a first version that led on the assessment. A shared link is the business
introducing itself, and the assessment is one feature of an app that is still
growing, so a card built around it goes stale as the app does.

- **Teal**, and specifically `primary` (#068376), the colour `design.md` says
  PunProfile is known by and the one it names for full-bleed section
  backgrounds. Lavender is EU Fit Check's identity and would say the wrong
  thing on a card for the business.

  It was `primary-deep` for about an hour, borrowed from the site footer, and
  Paul's read was that it was very dark green. He is right and the document
  agrees with him: `primary-deep` is described as a ramp extension for
  text-on-teal, pressed states and data-viz accents, never as a background.
  The footer is the exception, and it earns it by needing two readable text
  tiers on a dark surface. A share card does not.

  The cost of the brighter teal, since it is real: white on `primary` holds
  4.71:1, which is AA for body and above but leaves no headroom for a second
  text tier, so the eyebrow is white at 92% rather than `accent-tint`, which
  fails on this background at 2.9:1. Hierarchy comes from size and weight
  instead of colour.

  **The lift is on the right, not on the base.** Paul asked for slightly
  brighter on 16/08/2026 and the base cannot move: mixing even 12% of
  `primary-bright` into it drops white to 4.18:1 and fails the 19px chips. So
  `primary-bright` is pooled behind the mascot, where nothing has to stay
  readable, and the text keeps the unlifted base under it.
- **The reversed wordmark**, so the brand is legible at thumbnail size before
  anything else is read.
- **The coaching hook**, `HOOK_EYEBROW`, `HOOK_LINE_1` and `HOOK_LINE_2` from
  `coaching.ts`, which are Paul's own Thai. The first sentence is set large and
  the second smaller: same size for both orphaned a word and gave the card four
  heading lines to read at thumbnail size. The large line is held to a 19ch
  measure so it breaks over two lines; on one line it ran out to within a hair
  of the mascot and left the card no air.
- **The three service names** from `services.ts`, as chips.
- **The coach mascot**, cut out of its white square. The counter of the P, the
  hole the letterform is defined by, has to be transparent so the background
  shows through it. Getting that wrong is not subtle: a white plug in the middle
  of the letter reads as a rendering fault, and it shipped that way for an hour.

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
   `globals.css`, fonts from Google Fonts, images by absolute path so
   `/punprofile-wordmark-reversed.png` and the mascot resolve). Add a strip of
   calibration patches below the card, in colours whose true values are known:
   black, `primary`, `primary-bright`, `accent`, `ink`, white.
2. Serve `public/` and screenshot the page.
3. **Colour-correct against the strip before cropping it off.** This is not
   optional and it is invisible if skipped, which is what makes it dangerous.
   The screenshot comes back in the display's colour space and is re-encoded as
   sRGB without conversion, so a flat `primary` (#068376) arrives as about
   #3A8276: same green and blue, red lifted by fifty, and the brand's teal
   quietly duller on every card built this way. Greys and black and white land
   untouched while saturated colours desaturate, which is a gamut rotation
   rather than a per-channel curve, so the fix is a 3x3 matrix in linear light
   fitted from the six patches. Fitted on 16/08/2026 it reproduced all six to
   within two units, and the card's background came back to (3,131,118).
4. Crop to the card, resize to exactly 1200x630.
5. Delete the HTML file. It must not stay in `public/`: a fourth copy of the
   palette is exactly what `AGENTS.md` forbids, and this one would be served
   publicly as well.

**Check the contrast after correcting, not before.** White on the corrected
background measures 4.6:1 to 4.65:1 under every text block, which clears AA at
19px and up. On the uncorrected capture it reads 4.53:1, close enough to the
line that a colour error could hide inside it.

## After changing it

Facebook caches aggressively and will keep serving the old card. Re-scrape at
`developers.facebook.com/tools/debug/` with the production URL, and change the
filename if a cache refuses to clear.
