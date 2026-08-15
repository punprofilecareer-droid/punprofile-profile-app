# Block photographs

One per section of the assessment, six in total. Drop the file here, then set
`image` on the matching entry in `src/lib/content/blocks.ts`.

`npm run verify:copy` reports how many are sourced. A block with `image: null`
renders exactly as the assessment did before photographs existed, so a partial
set is a valid state and the sequence never waits for art.

**Spec:** portrait or square, at least 1600 x 2000. The same file has to survive
a half-screen desktop panel and a short mobile banner crop, and the band biases
its crop upward because a centred crop of a standing figure lands on the torso.

The sourcing brief, including search terms per block and the one real risk, is
`two-registers.md` in the coaching repo's `work-projects/mascot/`.
