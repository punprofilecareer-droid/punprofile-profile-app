# Mascot scenes

**One, as of 17/08/2026.** `mascot.md` in the coaching repo gives the mascot
whole moments at the **ends** of the assessment and gives photography the
sections in between. Both ends had one; the opening no longer does.

| File | Where | Scene |
|---|---|---|
| `report.png` | Mid-page on the first read | Standing with a clipboard, glasses, one hand open |

## What went, and why it is worth knowing

**`welcome.jpg`**, the character sitting on a clock, stood on the screen before
question 1 from 16/08/2026 and was **retired on 17/08/2026** on Paul's call. It
had replaced a spinner on the argument that a character arriving is more
interesting motion than a ring, which is true and is not what a loading state is
for: a 420px illustration was the largest thing on screen at the moment the
candidate was waiting to be asked a question. The spinner is back. The file is
kept untracked in this folder rather than deleted, since the pose itself is fine.

**`coach.png`**, standing with a clipboard, held the first read's slot from
16/08/2026 until **17/08/2026**, when Paul supplied `report.png`: the same idea
with glasses and a lanyard, which reads as someone who has actually read your
answers rather than someone about to greet you. Deleted rather than parked,
because `report.png` occupies its slot exactly.

**`result.jpg`**, the character reaching for the shortest point of a four-pointed
star, was deleted on 16/08/2026 when the coach pose took its slot. Worth knowing
what went with it: that scene said the lowest uncleared gate is the one that
matters, which is `10_Methodology.md`'s core claim drawn rather than written, and
neither pose since has said it. `scene-prompts.md` in the coaching repo still
carries the prompt if it is ever wanted back.

## `report.png` is a PNG, and cropped to its own content

It arrived transparent, so `scripts/lib/mascot-cutout.py` was not needed. It is
cropped to its bounding box: the supplied file is 578x432 with the character
occupying 333x299 in the middle, and rendering the padded canvas would have shown
it at three quarters of the size its `max-w` asks for.

## Why an alpha channel matters here

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
