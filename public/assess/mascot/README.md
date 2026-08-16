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
star, is **no longer rendered**. Paul supplied the coach pose on 16/08/2026 with
the first read's redesign and it took that slot. The file stays for now because
the star scene says something the coach pose does not, which is that the lowest
gate is the one that matters; if it is not brought back it should be deleted
rather than left here.

## `coach.png` is a PNG, and that is deliberate

The other two are JPEGs on a backdrop. This one is cut out of its white square
and carries an alpha channel, because on the first read it stands directly on
the lavender field with no card behind it, and a white rectangle in the middle
of that field reads as a broken image.

Source: `pp_coach_square.jpeg` in the coaching repo's `ctxt-brand/assets/inbox/`.
The cutout was a flood fill from the corners with a tolerance, not a global
white removal, so the clipboard and the shoe soles keep their own near-white
tones. If the asset is re-rendered, redo the cutout the same way rather than
keying out every white pixel.

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
