# CLAUDE.md — punprofile-profile-app

The PunProfile App: Next.js and Convex, implementation only. Every specification lives in the
sibling repo `../punprofile-career-coaching/`. Nothing here defines what the app should be.

`README.md` is orientation. This file is what to do.

Rule IDs R1 upward are stable and are cited from elsewhere in this repo. A retired rule keeps its
number and is marked RETIRED. Numbers are never reused. Core rules C1 to C48 live in the core block
at the foot of this file and are identical in every repo.

**Three rules are LAW: R1, R14, R37.** A law overrides everything else in this file. Check them
before writing any file.

No rule here carries the date it was added. Provenance lives in the commit message and the incident
behind a rule lives in section 7. Live state, meaning the roadmap, open decisions and session
handoff, lives in `product-roadmap.md` in the sibling repo's
`punprofile-work/work-projects/eu-fit-check/`, which this file points at rather than holds (C35).

`AGENTS.md` in this repo is a one-line `@CLAUDE.md` import. Never two rule sets in one repo.

This file is rules. `README.md`, `DESIGN.md` and `scripts/README.md` are navigation. Do not
duplicate one into the other.

---

## 1. Read before answering

| File | Holds | Convention |
|---|---|---|
| `design.md`, sibling `ctxt-brand/` | the real design system, wise-1: every colour, type, shape and elevation token | source of this repo's generated token layer (R14) |
| `Language_System.md`, sibling | Thai language rules LR-01 to LR-09 | enforced over copy by `verify:copy` and `verify:pages` |
| `termbase.yml`, sibling | decided Thai terms | `npm run termbase` syncs it here, `verify:copy` enforces it |
| `convex/_generated/ai/guidelines.md` | Convex API rules that override training data | read it before writing anything under `convex/` |
| `node_modules/next/dist/docs/` | this Next version's own docs | its APIs, conventions and file structure differ from training data |

**Never answer from memory, from this file, or from `README.md`. Open the file.**

## 2. Map and ownership

| Folder | Holds | Test | Write access |
|---|---|---|---|
| `../punprofile-career-coaching/` | every specification, brand, method, language and roadmap document | does it say what the app should be, look like, ask or score | Owner-approved only (C32), and never committed from a session working in this repo |
| `tokens.generated.css`, `design-tokens.generated.ts` | the token layer | is it written by `scripts/build-tokens.ts` | Generated, never hand-edited (R14) |
| `/data` | candidate data, gitignored, in neither repo | is it a person's answers | Free, never committed |
| `src/`, `convex/`, `scripts/`, `public/` | implementation | everything else | Free |

| Question | Owner |
|---|---|
| The method: core claim, gates, stages, Thai-specific factors | `10_Methodology.md` |
| PRD, product vision, scoring spec, survey spec | `ctxt-product/` |
| Why a competency is scored `proxy` or not at all | `self-report-scoring.md`, in `ctxt-product/` |
| Lead qualification, ICP, ECRA, live form URLs | `08_Coaching_Business.md` |
| Writing standards, Thai tone, the fixed CTA pool | `03_Content_System.md` |
| Brand personality, voice, colour meaning | `Brand_Guidelines.md` |
| Mission, offerings, scope, audience | `01_Project_Foundation.md` |
| Product story slots and their destinations | `Narrative_System.md` |
| Which candidate data exists and where it sits | `data-inventory.md` |
| The campaign link parameters every posted URL carries | `00_Quick_Facts.md` |
| The four similarly named instruments, in full | the sibling repo's root `CLAUDE.md` |
| Roadmap and session handoff | `punprofile-work/work-projects/eu-fit-check/` |

DERIVED, stale until regenerated and flagged as stale rather than built on: the two token files and
the synced termbase, the rendered style guide beside `design.md`, `public/blog/share/<slug>.jpg`.

## 3. Sources of truth

| Value | Lives in | Notes |
|---|---|---|
| Scoring, every consumer of it | `src/lib/scoring.ts` | `convex/scoring.ts` wraps it, the client and `scripts/` call it (R11) |
| Every design token | `design.md`, sibling repo | this repo holds generated output only |
| Decided Thai terms | `termbase.yml`, sibling repo | |
| The public route list | `PUBLIC_ROUTES` in `src/lib/seo.ts` | sitemap, `hreflang` and `llms.txt` all follow it |
| A figure quoted in a product story | the document that owns the figure | the story record points, it never states (R47) |
| Which deployment is which | section 6 of this file | |

## 4. Where a new file goes

**Does the file say what the app should be, or does it implement it?** Says: the sibling repo.
Implements: here.

`sitemap.ts`, `robots.ts` and `llms.txt/` sit at the root of `src/app/`, outside both locale trees.
A page is three edits, not one (R36), and a page put in the wrong place is invisible in one language.
There are three root layouts because Next renders one `<html>` per request and `<html lang>` has to
be true. All three render `SiteShell` and differ only in the locale they pass.

**Working notes do not belong in this repository.** Session summaries, state-of-play documents,
reviews, handovers, scratch analysis: extract what matters into the file that owns it and keep the
working file outside. A file that seems to have no home is a working note. There is no exception:
`/data` is gitignored candidate data, not a working note, and review exports are written into the
sibling repo by the exporter that makes them.

## 5. Repo-specific hard constraints

| ID | Rule |
|---|---|
| **R1 LAW** | This repo implements, it never specifies. A decision about what the app says, asks, scores or looks like is made in the sibling repo, and a session working here does not commit there. |
| **R2** | Cite a sibling document by bare filename in backticks, never by path. |
| **R3** | The product is the PunProfile App and EU Fit Check is its assessment feature. Older spec text using "EU Fit Check" for the whole product means the app. |
| **R4** | Never hard-code a product name into user-facing copy beyond the brand "PunProfile". |
| **R5** | Europe Readiness Check is the 6-question quiz, Lead Discovery Survey the 21-question form, ECRA the 34-competency diagnostic, EU Fit Check this app. The quiz feeds the survey. |
| **R6** | Never infer the funnel's shape from where a form link is posted, from a copy document, or from a response sheet's row count. |
| **R7** | RETIRED. Promoted to the core block as C45, read the owning document before reasoning. |
| **R8** | RETIRED. Promoted to the core block as C46, say what is verified, inferred and opinion. |
| **R10** | This app's candidate-facing product copy may use em dashes, which is the exemption C29 asks each repo to state. Chat, LINE, email and social copy may not. |
| **R11** | `src/lib/scoring.ts` is the only scoring implementation. Never add a second, including as a spreadsheet formula. |
| **R12** | A score is tiered `ecra` where the survey collects that competency's own defined inputs, `proxy` where it evidences part of the picture, `coach` where it does not reach. Never score a `coach` item, and never name a proxy after the competency it gestures at. |
| **R13** | Run `npx tsx scripts/audit.ts <responses.json>` after touching `src/lib/normalize.ts`. It reports per-question parse rates, prints every rejected value, and asserts the scoring invariants. |
| **R14 LAW** | `src/app/tokens.generated.css` and `src/lib/design-tokens.generated.ts` are generated. Never hand-edit either: change the token in `design.md`, run `npm run tokens`, commit both. |
| **R15** | `globals.css` holds only what is not a token: the base layer, the chart styles, the animations. `src/lib/design-tokens.ts` is a re-export and nothing more. |
| **R16** | One accent. `primary` is a fill, never type. Text that has to say what the lime says takes `ink`, `ink-deep`, or the `-deep` member of a semantic pair. `positive` and `accent-cyan` are fills for the same reason. |
| **R17** | `mute` is not a text colour under 19px. Captions, chart ticks and field hints take `mute-strong`. |
| **R18** | `canvas` is the card, `canvas-soft` is the band it sits in. A sage card on a white page is backwards. |
| **R19** | The aliases in `design.md > aliases` are read, never written. An alias leaves the map when nothing references it. |
| **R20** | No component names the dark scheme and Tailwind's `dark:` prefix is never used. A surface that looks wrong in dark holds a literal colour or the wrong role. |
| **R21** | A fixed fill carries `.ground-fixed`, because the content inside it does change between schemes. The lime fill is `bg-canvas-brand`, never `bg-primary`: inside a fixed ground `primary` is remapped to the green-black, so the two together paint ink on ink. |
| **R22** | Hover is a state layer, 8% of the element's own content colour over its own background. There is no second, brighter token per interactive colour. |
| **R23** | The page is white and structure comes from `<Band ground="canvas\|soft\|brand\|dark">` in `src/components/Band.tsx`. Do not tint the page and do not stack tinted cards in one white column. |
| **R24** | `.card-plain` is the card on a band, `.card-outlined` the card on white, and a page needing many of those wanted a band. Content cards are `.card-outlined` and `.card-tonal`. |
| **R25** | Three type tiers: `display-*` once per page, `headline-*` for section headings, `heading-*` for card and group titles, `body-lg` for copy. Never set a Thai heading in Archivo or Inter; `HERO_HEADING(locale)` and `SECTION_HEADING(locale)` pick the tier per script. |
| **R26** | A button is always `pill`. `rounded-2xl` is the card, `3xl` the large feature panel, `md` dense controls, `sm` the smallest chips. Never mix in Tailwind's own `rounded-sm\|md\|lg`. |
| **R27** | Breakpoints are window size classes: `medium:` 600, `expanded:` 840, `large:` 1200, `xlarge:` 1600. Never Tailwind's `sm\|md\|lg\|xl`. |
| **R28** | A page's columns belong at `large:`. The shell and the assessment are the two exceptions and use `expanded:`. |
| **R29** | Elevation is `level-0` for almost everything. `level-1` and `level-2` are for a menu or a toast, `level-3` and up is a modal. |
| **R30** | No spacing tokens in the app. The deck preset is the one consumer that needs them named. |
| **R31** | `src/lib/radar.ts` holds no colours. |
| **R32** | Never rename `--viz-*`, `--ink-*` or `--border`. `scripts/build-report-book.ts` reads them out of a rendered report's stylesheet. |
| **R33** | Do not reintroduce a backdrop filter, a fifth easing curve, or a second accent colour. |
| **R34** | Thai is unprefixed at the root and English is prefixed `/en`. Never `/th`, and `/admin` is in neither tree. |
| **R35** | Every internal link is written as its Thai path and passed through `path()` from `useCopy()`, or `localePath(href, locale)` in a server component. The link tables in `nav.ts`, `footer.ts`, `cta.ts` and `faq.ts` hold no locale. |
| **R36** | Adding a page means the real file under `(th)/`, an `(en)/en/…/page.tsx` re-exporting its default with its own `pageMetadata({ …, locale: "en" })`, and a `PUBLIC_ROUTES` entry. |
| **R37 LAW** | A push to `master` is the production deploy, not a step before one, and it is gated by the pre-push list in section 6. Never deploy from a laptop and never run `npx convex deploy --prod`. |
| **R38** | Every CLI command without `--prod` hits dev, which holds real personal data and is not a scratch environment. PDPA applies to it. |
| **R39** | Commit before deploying anything. `git status --short` empty is the gate, because Convex pushes the working tree and not a commit. |
| **R40** | Dev may drift. Keep it reproducible instead: from a clean tree, `npx convex dev --once` rebuilds it from what is committed. |
| **R41** | A deploy that changed nothing means the wrong deployment was targeted. Re-check the target rather than deploying again. |
| **R42** | Watch the Vercel build run `convex deploy` before `next build`, then run any pending backfill against `--prod`. |
| **R43** | Write a code-and-data change so that any interleaving of the two steps is safe. A backfill is not part of a deploy and never will be. |
| **R44** | Dual-write through a migration, and let reads degrade honestly rather than merely safely. |
| **R45** | Every backfill is idempotent, so a run that dies half way is resumed by running it again. |
| **R46** | RETIRED. Promoted to the core block as C47, anything reading across a boundary announces a missing source. |
| **R49** | No candidate-facing string is written inline in a component. Copy lives in `src/lib/content/`, and `consent-copy.ts`, its Thai terms reach it from `termbase.yml` through `termbase.generated.ts`, and a string written anywhere else is linted by nothing and missing in the other language. |
| **R47** | A product story record points at the document that owns a figure and never states the figure. |
| **R48** | An article with artwork needs a sharing card at `public/blog/share/<slug>.jpg`, at 1200x630. |

## 6. Tooling and commands

Cloned as siblings in one parent folder, from two accounts, `punprofilecareer-droid/punprofile-profile-app`
and `paulthinks/punprofile-career-coaching`. Eleven scripts read across by relative path, and each says so when the sibling is missing (C47), so a
lone clone runs but cannot regenerate its colours or its termbase. Production is
`dashing-shepherd-41`, serving `punprofile.vercel.app`; development is `quiet-mule-251`, named in
`.env.local`, holding real lead data (R38).

| Command | Does |
|---|---|
| `npm run tokens` | regenerates the token layer from `design.md` (R14) |
| `npm run design:html` | regenerates the rendered style guide beside `design.md` |
| `npm run termbase` | syncs the decided Thai terms into this repo |
| `npm run verify:thai-register` | checks the Thai register against `golden-th/` in the sibling repo |
| `npm run blog:cards` | generates missing sharing cards, `--force` redoes them. macOS only, output committed, so the Vercel build never runs it |
| `npm run review:page` | exports a page for review into the sibling repo, and refuses to overwrite a `PB:` line without `--force` (C43) |

Before a production push, all of it, in this order:

```
git status --short
git rev-list --count origin/master..HEAD
npx tsc --noEmit -p tsconfig.json
npx tsc --noEmit -p convex/tsconfig.json
npm run lint
npm run verify:copy
npm run verify:pages
npm run verify:narrative
npm run verify:consent
npm run blog:cards -- --check
git push origin master
```

`verify:copy` lints `copy.ts`, the question bank and the privacy notice. `verify:pages` covers the
per-page content modules, which `verify:copy` does not read. `verify:narrative` fails a record
missing one of its eight slots, naming a destination `cta.ts` lacks, or stating a figure (R47).

## 7. Traps

- Reading this repo in isolation produced wrong work twice. The specification is always in the sibling repo, and the workspace root `CLAUDE.md` carries the full map.
- This repo's `docs/design.md` said no design tokens existed. It was wrong, and it is gone. The design system is the sibling repo's `design.md` and always was.
- Conflating the four instruments has produced confidently wrong analysis, usually by reading the funnel's shape off a form link or a row count (R5, R6).
- `verify:copy` had never read the per-page content modules, 91 candidate-facing strings, and the first `verify:pages` run found a real LR-04 failure in `footer.ts` that had already shipped.
- A sharing card's failure is invisible locally: every platform crops to about 1.91:1, and the 4:3 article art lost the figure's head (R48).
- A story record holding its own copy of a figure is a fourth place for a stale number to hide, which is why `verify:narrative` exists rather than a document being enough.
- The consent migration is the worked example of R43 to R45: `captureContact` dual-writes, `resolveConsent` returns `never_asked` rather than guessing, and the backfill reported 200 written then 0 written on an immediate re-run.
- A deploy that appeared to change nothing was a different deployment, not a failed push (R41).
- The Now pill shipped dark green on dark green, because `bg-primary` was paired with `.ground-fixed` and that pairing cancels itself out. On a lime ground the lime is the ground and the pill on it is the dark one (R21).

## 8. Cadence

Answer the question in front of you, touch only the files it needs, note drift you see and do not go
looking for it. The full cross-check is the pre-push list in section 6, on every production push.

---

<!-- CLAUDE-CORE:BEGIN v1 — synced from /Users/paulb/Documents/LTD OS/_standards/CLAUDE-core.md. Do not edit here. -->

# CLAUDE core rules

Version 3.7. This line is bumped on every edit to this file, no exceptions, and it travels inside
every pasted block, so any repo's copy says which core it came from. Byte-identity against the
canonical file is verified by diffing the pasted block against
`/Users/paulb/Documents/LTD OS/_standards/CLAUDE-core.md` directly; no hash is needed.

Identical in every one of Paul's repositories. Do not edit this block inside a repo. Edit the
canonical copy and re-sync, so the same rule cannot say two things in two places.

Rule IDs are stable, currently C1 to C48. A new rule takes the next free number and sits in the
section it belongs to, so numbers are unique but not strictly ordered within a section. A retired
rule keeps its number and is marked RETIRED. Numbers are never reused. Repo-specific rules are
numbered R1 upward in the repo's own file and never collide with these.

Every rule below reads as current and final. No rule carries the date it was added. Provenance
lives in the commit message; the incident that caused a rule lives in the repo's Traps section.

## Working with Paul

**C1. Lead with the answer.** A direct question gets its answer in the first line: yes, no, a name,
a number. Reasoning, corrections and next steps come after, and only if they change what he does.
A correct answer buried under context reads as no answer.

**C2. Keep the reply short, put the detail in a file.** Long replies he cannot follow are a failure,
not thoroughness. Write the reasoning to the repo's work area and give him the finding plus the
absolute path.

**C3. One decision at a time by default; batch only what is genuinely open together.** Ask him one
thing, wait, then the next. This applies to reviews and verification steps too. The exception: when
several decisions are genuinely open at once, list them all in one block at the end rather than
dripping them out, and say which ones block the others, because a decision he cannot see is a
decision he cannot make. Each item in the block still stands alone under C4. Never use the
exception to stack questions that are merely ready rather than open, and never reopen a topic he
has already steered.

**C4. A question is a closed choice with a recommendation.** Never an open prompt, never "say the
word", never "let me know". Working out the option set is the job. The recommended option comes
first and is marked. Every question carries:

1. What is true now, in plain words, with no shorthand and no file path standing in for an
   explanation. Define any term he may not hold in his head.
2. Why it is a decision at all: what is in conflict, or what is unknown.
3. What each option changes in the world, not in the repo.
4. What it costs, including the cost of the recommended one.

Three more constraints on the options themselves. Only options worth choosing: every one listed
must be one you would be willing to carry out, no straw men, no padding an option to make the
recommendation look better. Ordered best first, always: 1a is the recommendation, 1b the runner-up,
and the order carries the argument. Recommending nothing is not neutrality, it is pushing the work
back up; if the evidence genuinely does not favour one, say so and say what would settle it. And if
the honest answer is that it is a lookup rather than a decision, look it up instead of dressing it
up as a choice. Three options is the normal shape, not a quota: where only two are defensible, give
two and say a third would be padding. A single question is still numbered Q1, and a marker is never
reused within one message.

The test is whether he could answer correctly having read nothing else and remembering nothing from
the last message. Six lines is fine if two will not do. Number the question Q1 and its options 1a,
1b, so he can reply "1a" or "skip". Put it at the END of the message. And where the answer becomes
record, the question says which document the answer lands in. Where the repo keeps a standing
question queue, the split is routing, not preference: a decision that is his and can wait goes to
the queue; the in-reply block is for what blocks the work now.

**C44. Ask when his own wording carries two readings.** Where the difference is factual, ask rather
than picking the likelier reading and writing it as record. An invented fact is the one line a
recipient can catch as wrong.

**C5. Not every message needs a question.** Reserve C4 for things only he can decide. Small copy and
implementation calls he has already steered get made, stated in one line, and moved past. Repeated
numbered blocks on the same topic read as being challenged rather than helped.

**C6. Never send him back up the conversation, and never cite by number or code.** No "as above",
"see my earlier message", "scroll up". No "4c is done", no bare "action 76", no bare "v2". Name the
thing every time, in plain words, on every mention. He answers from a phone and does not scroll
back. Numbering restarts every message: it addresses the reply he is about to type and nothing more.

**C7. Every file and folder named in chat carries its full absolute path**, starting `/Users/paulb/`.
Never `~`, never a repo-relative fragment, never a bare filename. Every mention, not only the first,
folders included. Inside repository files the existing repo-relative convention stays, so the record
survives being moved.

**C8. Terminal instructions are one fenced bash block, every line in order, starting with `cd` to the
absolute path in double quotes.** No `#` comments inside the block: zsh treats one as an argument and
an apostrophe hangs the shell. Explanation goes in the prose above the block, never inside it. Around
the block, three things: one line before it saying what it does and what it changes if it writes
anything; what success looks like, concretely enough to recognise; and what to do on failure, which
is normally "paste me the error". Anything past roughly thirty seconds gets a time estimate, so a
long silence is not mistaken for a hang. And say why it needs him at all: if it could have run in the
sandbox it should have, and if it could not, name the reason in a few words.

**C34. Blocked is not a status to sit in.** While a decision is open, do every part of the work that
does not depend on it, and say what was done. Never gate work on a decision that does not actually
gate it: an internal structure question rarely blocks a live defect from being fixed.

**C9. Do not explain his house rules back to him.** He wrote them. Apply them silently. A rule is
worth surfacing only when it conflicts with what he asked for.

**C10. Stay inside the project he is working in.** Do not pull his other ventures into the session or
offer to widen scope.

**C43. A `PB:` line in any file is a note from Paul to whoever reads the file next.** It can appear
anywhere in any file, including inside a generated one, and it is not a correction, a heading or
content. Read it, act on it, and do not treat its absence as approval or its presence as an edit to
apply verbatim. Tooling that regenerates a file must never silently destroy one.

## Drafting a message he will send

**C39. Answer the question that was asked, and stop.** A true finding that answers a different
question belongs in the repository, not in the reply. Adjacent material reads as padding and widens
the thread.

**C40. Never assert another party's scope.** What sits inside a partner's, a workstream's or a
colleague's remit is theirs to state. Put it back as a question instead: should this be out of
scope for them?

**C41. Where the answer is unknown, say so and stop.** The useful reply is the admission, the
single question that has to be answered, and who could answer it. Evidence for why it is unknown is
not an answer; stacking it opens questions rather than closing them.

## Not overwriting his work

Paul edits these files while a session is editing them. Work has been destroyed this way in more
than one repo.

**C38. One owner at a time, and say which.** Before editing a file he has worked on, say you are
taking it, and say when you hand it back. Two editors between saves is how work disappears.

**C11. Re-read the file from disk immediately before every write**, even one produced an hour ago.
Your own earlier draft is never the truth. Verify the byte count before and after.

**C12. If the file changed and you did not change it, STOP.** A blank that was empty now holding a
value, a table row now holding data, content that moved: re-read, diff against what you last saw,
and ask before writing anything. A whole-file write raises no conflict and no error, so nothing
warns you. Never explain an unexpected change away as another session's doing.

**C13. Targeted string replacement only.** No whole-file rewrite of a file that already exists, no
force overwrite, no regenerate-from-scratch. Edit in place, using the blank rows and spacers a
document already has rather than inserting rows. Generated files a repo names as such are the one
exception: they are never hand-edited, so edit the source and rerun the generator, which may
rewrite its output wholesale. A generated file nobody listed is treated as authored.

**C14. A deletion is a decision.** What he removed stays removed. When a document and its covering
note then disagree, change the note. Raise a recommendation twice at most; silence is acceptance.

**C15. Sections he fills are his.** Results, measurements, answers he types in. Ask before writing
into one, every time, even to fill an obviously missing number.

**C16. Never write to a file he has open.** A `~$` file beside it means Word or Excel holds a lock.
Say so and wait.

**C17. Preserve what you did not write.** Comments, tracked changes, images, formatting. `openpyxl`
flattens Excel threaded comments and strips authors; `docx` libraries drop what they do not model.
Inspect the file's parts before saving and graft back what the library dropped.

**C18. Verify before handing it back.** Render it and look at it. Diff every sheet or section you did
not intend to touch. Confirm images and comments survived, then run the house-rule checks over the
text.

## Truth and sources

**C19. One live file per deliverable, at exactly one path, edited in place.** No parallel versions in
a folder, no rendered copy beside the source, no export into another tool "for convenience". If an
output must be reachable from somewhere else, link to the path. A superseded file whose record
matters moves to the repo's named archive folder; one that should not be kept moves to
`_to_delete/`, which Paul empties himself. Each repo declares which kind of folder that is: tracked,
so parking is a committed move and the content stays recoverable from git history, or gitignored, so
the content is gone once the folder is emptied. Anything confidential is deleted, never parked in a
tracked folder.

**C20. Never restate a source-of-truth value in a second document. Link to it.** Dates, prices,
dimensions, thresholds. Every repo's own file names its sources of truth; that registry is the only
place a value is written.

**C21. Never present an assumption as a fact, and never fabricate.** Figures, pricing, supplier or
third-party terms, market data: ask rather than infer. Anything marked TO CONFIRM or described as a
working assumption is said to be unverified every time it is used, not once at the end.

**C22. Never invent an owner, a constraint, a gate, a rule or a rationale nobody stated.** If it is
not in the repo and neither Paul nor the team said it, it does not go in a doc as a rule. A blank
owner reads as unassigned and is said to be unassigned. Reasoning that justifies a rule they already
hold is padding, not rigour.

**C23. Never invent jargon or abbreviations.** Use only names that already exist in the repo, in the
client's own materials, or in the industry. Do not coin a short form because you have used a phrase
twice.

**C24. Say a standing rule once, or not at all.** Restating a known constraint in every table row and
every callout reads as padding.

**C25. Docs state what is true now, not how they got there.** No "was X, changed DD/MM/YYYY", no
"moved from Monday", no "Paul confirmed DD/MM/YYYY" in the body of a doc. A date belongs in a body
only when it is operational: when a run happens, when a decision was closed in a date-closed column,
the provenance of a photo or a quote. Everything else goes in the commit message, or in the doc's own
changelog section, which records decisions and their reasons rather than diffs. Record files a repo
names as such, a facts file or a tracking table, are exempt: they exist to show supersession and
waiting time on the page, and keeping the contradicted or dated entry is the point.

**C26. Source material is extracted, not just filed, and the extraction is what counts.** Anything
arriving from someone else stays raw until its content reaches the repo's live record and the
structured file that owns the subject. Once extracted, the record is what is read back: a raw
capture, an arrived source or a filled-in prep note, is never cited as a fact.

**C36. Documents for an audience follow the repo's named voice and design standards, read before
the first line.** Every repo names its standards in its own file. "For an audience" means any file
opened by someone other than the person who asked for it, in any format: spreadsheets, workbooks,
boards, HTML, slides and diagrams, not only reports and memos. A working tool that will be
attached, shared, screen-shared or presented is a document, and internal is not an exemption, only
a different audience for the same system. Read the standards before writing the first line, because
palette, type and layout are decided at the start and retrofitting them means rebuilding.

**C37. Delivered files are frozen.** Once a file has gone to its audience, its body is not
restructured or edited, appendix included. Later material is appended as a labelled addendum or
shipped as a new document, and questions about delivered content are answered in conversation. The
one permitted edit is fixing a cross-reference the addition itself broke, at the moment of adding.

**C42. An inbox is receive-only.** It holds what arrived from other people or awaits triage.
Nothing you produce goes there, ever, and it is never a fallback when no folder fits: ask which
folder instead.

**C27. Git history is the decision log. One commit per decision, not batched.**

**C45. Read the document that owns a fact before reasoning about it.** Not the map, not a summary,
not memory of an earlier read.

**C46. Say what is verified, what is inferred and what is opinion.** Every substantive claim carries
which of the three it is, and the boundaries are not blurred to make an answer read more confident.

**C48. Flag contradictions and risks rather than smoothing them.** Two sources that disagree, a
listing that markets what the rules forbid, a policy the practice breaches: surface it, do not
write around it to keep an answer tidy.

**C47. Anything reading across a boundary announces a missing source.** A script, a check or a
lookup that reaches into another repo, file or system and finds its source absent says so and
stops, rather than quietly passing with partial data.

**C32. A repo's read-mostly area takes per-change approval.** Every repo names its source-of-truth
area (context, strategy) in its own file. A write there is proposed as a diff, saying what it
supersedes, and then waits. Approval is for the write, not for the task: "Paul asked me to research
X" is not approval to write X into the record. Approval is per change and expires with it. There is
no size threshold: a typo fix and a re-sync of a derived file are changes. Where the repo keeps a
decisions log, the change lands with a dated line naming who approved it.

**C33. A session ends clean.** A piece of work ships as the deliverable plus a README saying what it
consumed, so the derivation is visible later. Intermediates that nothing needs any more are deleted,
and the deletion is reported: an input fully folded into the deliverable, a round-trip file whose
corrections were applied, an export a command can regenerate, a scratch analysis whose conclusion is
written down. Anything that regenerates the output, or that the output was derived from and cannot
be cheaply re-collected, moves to `src/` inside the work folder. A file
that is a copy of a live source says so and is temporary: deleted once used, replaced by the command
that regenerates it. Nothing references a file that might be deleted. Work that was acted on is
kept, and superseded deliverables are archived rather than binned: the target is intermediates, not
history.

**C35. Live state never lives in the rules file.** Open decisions, known deviations, current status
and struck-through resolved items belong in the repo's live record, which the rules file points at.
A rules file that carries status goes stale the day it is written, and a stale rule cannot be told
from a current one.

## House rules

**C28. Dates in prose are DD/MM/YYYY**, in messages to Paul and in documents alike. Dates in code,
filenames and data formats are ISO `YYYY-MM-DD`, so they sort and parse; a prose-format date never
goes into a filename.

**C29. No em dashes, en dashes or arrow characters in anything a person outside the repo reads, or in
anything written to Paul.** Commas or shorter sentences. Each repo states in its own file whether its
product and marketing copy is exempt.

**C30. Minimal, precise output.** No unsolicited explanation, no padding caveats, no
self-congratulation.

**C31. Priority order when rules pull against each other:** Accuracy > Trust > Practical usefulness >
Clarity > Speed > Volume.

<!-- CLAUDE-CORE:END -->

<!--
Rule number mapping. The previous rules file, AGENTS.md, carried no rule numbers, so no number is
inherited and nothing in this repo cites one: a grep for R-numbers across src, convex, scripts and
the markdown returns nothing. R1 to R49 are therefore all new and stable from here.

Gaps. R7, R8 and R46 were promoted into the core block as C45, C46 and C47, and are marked RETIRED
here. R9, a wider date rule, was deleted before the first commit, when C28 was widened to make prose
dates DD/MM/YYYY everywhere and code, filename and data dates ISO. None of the four is reused.

R39, R41, R43, R44 and R45 are core candidates held here under the rule of two: the first other repo
to re-derive one earns it a scoped shipping section in the core block, and until a second repo needs
them they are this repo's.

What did cite the old file cites it by section name, and those citations now point at a file that
is an import: DESIGN.md, README.md, public/README-og.md, scripts/verify-pages.ts,
src/app/(th)/layout.tsx, src/app/(private)/layout.tsx, src/components/BrandLockup.tsx,
src/lib/radar.ts, src/lib/consent-copy.ts, src/lib/content/blog.ts.
-->
