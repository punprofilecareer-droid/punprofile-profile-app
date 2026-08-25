# DESIGN.md

The design system is **wise-1** and it lives in one file:

`../punprofile-career-coaching/punprofile-context/ctxt-brand/design.md`

Read it before writing any UI. The frontmatter is the machine-readable system
and `scripts/build-tokens.ts` generates this repo's whole token layer from it;
the prose after the frontmatter is the part a person needs. `design.html` beside
it is the rendered style guide, regenerated with `npm run design:html`.

Do not put tokens, colours or type scales in this file. A second file claiming to
describe the system is the failure mode this one exists to prevent.

`AGENTS.md` in this repo carries the working rules that follow from it.
