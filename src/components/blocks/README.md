# blocks

The section blocks from `block-library.md` in the coaching repo, as components.

Three rules, and they are the reason this folder exists rather than a pile of
one-off markup in pages:

1. **A block holds no copy.** Every string arrives as a prop from a content
   module, so nothing here can drift from `products.ts`, `home.ts` or `cta.ts`,
   and nothing here needs Thai review.
2. **A block with nothing in it renders nothing.** Not an empty card, not a
   "coming soon", not a skeleton. `home.ts` has said since 14/08/2026 that a
   visible placeholder for social proof is itself a claim that social proof is
   imminent, and that applies to every one of these.
3. **A block owns its ground's contract.** If it paints `canvas-dark` it also
   pins the content colours, so a page never names a colour on it.

Built ahead of the pages that will use them, deliberately: these are the shapes
the reference uses to convert, and having them typed and ready is what stops the
next conversion section being invented from scratch at the moment it is needed.
Unused today are marked below.

| File | Block | Used by |
|---|---|---|
| `Checklist.tsx` | B11 rows | product pages |
| `SplitFeature.tsx` | B2 / B11 | product pages |
| `EditorialGrid.tsx` | B19 | blog index |
| `AudienceChip.tsx` | B22 | product pages |
| `AssuranceTriad.tsx` | B12 | unused |
| `Testimonials.tsx` | B13 | unused, waiting on `RESULTS` |
| `ConversionBand.tsx` | B17 | unused |
| `EmptyState.tsx` | B18 | unused |
