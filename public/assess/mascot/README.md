# Mascot scenes

Two, and only two. `mascot.md` in the coaching repo gives the mascot whole
moments at the **ends** of the assessment and gives photography the sections in
between, so these are the only places a candidate meets the character inside the
flow.

| File | Where | Scene |
|---|---|---|
| `welcome.jpg` | The screen before question 1 | Sitting on a clock, one hand open |
| `result.jpg` | Above the chart on the teaser | Reaching for the shortest point of a four-pointed star |

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
