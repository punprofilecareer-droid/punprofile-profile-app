# Mascot scenes

Two, and only two. `mascot.md` in the coaching repo gives the mascot whole
moments at the **ends** of the assessment and gives photography the sections in
between, so these are the only places a candidate meets the character inside the
flow.

| File | Where | Scene |
|---|---|---|
| `welcome.jpg` | The screen before question 1 | Sitting on a clock, one hand open |
| `coach.png` | Mid-page on the first read | Standing with a clipboard, one hand open |

`result.jpg`, the character reaching for the shortest point of a four-pointed
star, was **deleted on 16/08/2026** on Paul's call, when the coach pose took its
slot in the first read's redesign. Worth knowing what went with it: that scene
said the lowest uncleared gate is the one that matters, which is
`10_Methodology.md`'s core claim drawn rather than written, and the coach pose
does not say it. `scene-prompts.md` in the coaching repo still carries the
prompt if it is ever wanted back.

## `coach.png` is a PNG, and that is deliberate

The other two are JPEGs on a backdrop. This one is cut out of its white square
and carries an alpha channel, because on the first read it stands directly on
the lavender field with no card behind it, and a white rectangle in the middle
of that field reads as a broken image.

Source: `pp_coach_square.jpeg` in the coaching repo's `ctxt-brand/assets/inbox/`.
The cutout is a flood fill from the corners with a tolerance, not a global white
removal, so the clipboard and the shoe soles keep their own near-white tones.

**Two passes, and the second one is the part that was missed first time.** A
corner fill clears everything outside the character and cannot reach the counter
of the P, the hole the letterform is defined by, so the first version shipped a
character with a white plug in the middle of it. The fix labels every enclosed
near-white region and clears the ones above 200px, which is the counter, split
in two by the glasses arm crossing it, and not the handful of 1-20px JPEG
speckles. If the asset is re-rendered, redo it the same way: keying out every
white pixel instead would eat the clipboard and the shoe soles.

**To swap one: overwrite the file.** No code change. Unlike the block
photographs these carry no blur placeholder, because they are small, sit on a
plain field, and are preloaded.

Resize before committing, the same way the block images are:

```
sips -Z 1000 new.jpg --out welcome.jpg
sips -s format jpeg -s formatOptions 80 welcome.jpg --out welcome.jpg
```

## Both files are pre-fix renders

Known and deliberate, 16/08/2026. They were generated before two prompt
corrections landed, so both are due for a re-run:

- **The counter closes up.** `result.jpg` especially: without a clearly open
  hole in the bowl, the character reads as a rounded blob with a face rather
  than as the letter P.
- **The backdrop is a neutral off-white**, not a brand wash. Welcome should be
  cream `#FFFAE7` and result mint `#E3FAF3`.

`scene-prompts.md` in the coaching repo carries both fixes. Scenes 1 and 2 are
these two.
