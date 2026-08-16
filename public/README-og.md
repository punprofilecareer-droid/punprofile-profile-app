# og.png, the social share card

1200x630. Referenced from `metadata.openGraph` in `src/app/(th)/layout.tsx` and
served straight out of `public/`. Added 16/08/2026, after a link posted into the
Facebook group rendered as a bare URL.

**The path changed later the same day**, when the `/en` tree split the root
layout into three. The Thai tree's layout is the one that owns this card;
`src/app/(en)/layout.tsx` points at the same file and says why an English card
does not exist yet. See `AGENTS.md` § Routing.

## What is on it, and why

**The card is PunProfile, not EU Fit Check.** Paul's call, 16/08/2026, replacing
a first version that led on the assessment. A shared link is the business
introducing itself, and the assessment is one feature of an app that is still
growing, so a card built around it goes stale as the app does.

- **Olive**, `primary` (#566423), the colour `design.md` now says PunProfile is
  known by. It replaced teal on 16/08/2026 with the Material Design 3 rebrand.
  Blue is EU Fit Check's identity and would say the wrong thing on a card for
  the business.

  **The rebrand gave this card contrast headroom it never had.** White on the
  old teal held 4.65:1, AA for body and nothing left over, which is why the
  eyebrow used to be white at 92% rather than a second colour. White on olive
  holds **6.48:1**, and `primary-container` (#D9EB9A) holds **5.03:1**, so the
  eyebrow is now a real second tier in its own colour instead of a faded white.
  Hierarchy comes from colour *and* size rather than size alone.

  **The lift is still on the right, not on the base.** `primary-fixed-dim`
  (#BDCE80) is pooled at 40% behind the mascot, where nothing has to stay
  readable, and the text keeps the unlifted base under it. Measured on the
  shipped pixels, every text block sits on a clean #566423.

- **The reversed lockup**, `punprofile-logo-reversed.svg`, so the brand is
  legible at thumbnail size before anything else is read. It was a PNG wordmark
  until 16/08/2026.
- **The coaching hook**, `HOOK_EYEBROW`, `HOOK_LINE_1` and `HOOK_LINE_2` from
  `coaching.ts`, which are Paul's own Thai. The first sentence is set large and
  the second smaller: same size for both orphaned a word and gave the card four
  heading lines to read at thumbnail size. The large line is held to a 19ch
  measure so it breaks over two lines; on one line it ran out to within a hair
  of the mascot and left the card no air.
- **The three service names** from `services.ts`, as chips.
- **The coach mascot**, cut out of its white square, bled off the right edge.
  Positioned so the loose prop at its feet falls outside the canvas rather than
  being half-cropped at the corner, which is what it looked like at first. The counter of the P, the
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
The source is a throwaway HTML file rendered in a browser at 1200x630, because
that is the only way to get real Anuphan shaping with correct Thai tone-mark
placement.

1. Write the card as a standalone HTML file into `public/` as `_og-build.html`
   (tokens copied from `tokens.generated.css`, fonts from Google Fonts, images by
   absolute path so `/punprofile-logo-reversed.svg` and the mascot resolve). Add
   a strip of calibration patches below the card, 200px each, in colours whose
   true values are known: black, `primary`, `primary-fixed-dim`, `action`,
   `on-surface`, white.
2. Capture it with **headless Chrome**, not with a screenshot of a visible
   window:

   ```
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
     --window-size=1200,690 --virtual-time-budget=6000 \
     --screenshot=raw.png http://localhost:3100/_og-build.html
   ```

3. **Check the patches, then crop.** This is where the process changed on
   16/08/2026, and the change is worth understanding rather than just following.

   The previous method screenshotted a visible browser window, and that capture
   came back in the display's colour space and was re-encoded as sRGB without
   conversion: a flat `primary` arrived with its red channel lifted by about
   fifty, greys untouched, saturated colours quietly duller. The fix was a 3x3
   matrix in linear light fitted from the six patches, and it was mandatory and
   invisible if skipped.

   **Headless Chrome does not do this.** Measured on 16/08/2026, all six patches
   came back byte-exact, every channel, zero error. So the correction step is
   gone. The patches stay, as the check that proves it is still true. If any
   patch is off by more than a unit, something about the capture has changed and
   the old matrix fit is in this file's git history.

   `scripts/lib/og-correct.py`, which fitted and applied that matrix, was
   deleted in the same change. It is in git history if the capture method ever
   goes back to screenshotting a visible window.

   Capturing at `--force-device-scale-factor=1` also matters: the browser
   extension's screenshot runs at DPR 2 and is returned downscaled as JPEG,
   which would mean building a 1200x630 deliverable out of a resampled lossy
   image.
4. Crop to `(0, 0, 1200, 630)`. No resize is needed; the capture is already at
   the right scale.
5. **Measure the contrast on the cropped pixels, not on the CSS.** Sample the
   ground under each text block and compute against the text colour actually
   used. On 16/08/2026 that gave eyebrow 5.03, headline 6.48, lead 6.48, chips
   6.48, all clearing AA.
6. Delete `_og-build.html`. It must not stay in `public/`: a copy of the palette
   that nothing generates is exactly what `AGENTS.md` forbids, and this one
   would be served publicly as well.

## After changing it

Facebook caches aggressively and will keep serving the old card. Re-scrape at
`developers.facebook.com/tools/debug/` with the production URL, and change the
filename if a cache refuses to clear.
