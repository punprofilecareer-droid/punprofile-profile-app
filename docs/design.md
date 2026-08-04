---
status: PENDING
version: none
name: EU Fit Check (PunProfile profile-app)
description: >
  PLACEHOLDER. This file does not yet contain a real design system — no colors, fonts, or
  component tokens have been decided for this product. It exists only so that every doc that
  already references `docs/design.md` (VISION.md, product-vision.md, prd.md,
  product-roadmap.md) points at a real file instead of a dangling path, and so this project's
  wiring matches the other PunProfile/AgentSiam/kink projects structurally. Nothing in this
  file should be read as a decision.
---

# Design system — PENDING

**This is a stub, not a design system.** No visual design work has happened for this product
yet. Do not build UI, a slide deck, or anything else that depends on real tokens from this file
— there aren't any. `product-roadmap.md` TASK-006 already established the working rule for this
project: use plain framework defaults as placeholder styling, and never invent a color palette
or typography scale to fill this gap. This file follows that same rule.

## What's actually pending

1. **Run the Design System skill** (`.claude/skills/design-system/` — not yet installed in this
   repo; see `punprofile-career-coaching/.claude/skills/design-system/` for a working example
   from the sibling PunProfile project) against real brand references (site URL, screenshots, or
   existing assets) to generate this file's real content: colors, typography, spacing,
   components, motion.
2. Once real content exists here, this file's `status` field should change from `PENDING` to
   `alpha` (or whatever the Design System skill's own convention is), matching the shape of
   `punprofile-career-coaching/context/docs/design.md` (that file is the closest sibling
   reference for what a filled-in version of this file should look like — same YAML-frontmatter +
   prose structure, real hex values, real font choices, real component grammar).
3. **Only after that** does it make sense to build a project-scoped `frontend-slides` skill fork
   for this product (a `.claude/skills/frontend-slides/` folder locked to one deck template), the
   same pattern already in place for kink (`kink-editorial`), AgentSiam (`agentsiam-editorial`),
   and PunProfile Career Coaching (`punprofile-editorial`). Building that fork now, against this
   placeholder, would just be inventing a brand twice — once here, once in the fork's own
   `design.md` — which is exactly the drift this pattern exists to prevent.

## Related open items in this repo

- `product-roadmap.md` TASK-006 — flagged the missing design system, used Tailwind defaults as a
  placeholder, explicitly scoped to not invent tokens.
- `VISION.md` § Brand Voice — deliberately keeps visual identity out of that file, pointing here
  instead.
- `product-vision.md` § 5 Visual Design — same pointer, same "run the Design System skill first"
  instruction.

Nothing in this stub changes any of those files. It just gives their existing `docs/design.md`
references something real to point at.
