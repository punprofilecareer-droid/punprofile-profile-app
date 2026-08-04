---
status: alpha
version: 1.0
name: EU Fit Check, self-report scoring spec
description: >
  Maps the Lead Discovery Survey's answers onto the four ECRA dimensions, and states
  exactly which competencies a self-report survey can and cannot evidence. Owns the
  lookup tables that `scoring.ts` implements. Read before changing any survey question,
  answer option, or score.
---

# Self-report scoring: survey to ECRA

Implements the four-dimension model from `08_Coaching_Business.md` → ECRA, restricted
to what a self-report survey can honestly evidence. Resolves `prd.md` § 14 Open Question
"exact self-report question set and scoring weights per dimension", and unblocks
`product-roadmap.md` TASK-014.

`08_Coaching_Business.md` owns the ECRA framework itself, the 34 competencies, the 1–5
scale, and the indicator-count/lookup formulas. This document does not redefine any of
them. It only records which of them the survey reaches, and the exact answer→score
tables. If the two ever disagree, that document wins.

---

## The central constraint

ECRA has 34 competencies. **The survey can produce a real ECRA score for 5 of them.**
Everything else in the framework needs a mock interview, a CV/LinkedIn document review,
or coach research. None of those inputs exist at self-report time.

That is not a gap to paper over. `prd.md` § 1 Success Criteria makes "explicit,
impossible-to-miss self-reported, preliminary labelling" one of the two things that
must hold or the differentiation collapses. A chart that renders 34 confident-looking
scores off 21 survey answers is exactly the faked precision the product exists to
beat. So the model has three tiers, and the report shows which tier every number came
from.

| Tier | Meaning | Count |
|---|---|---|
| **ECRA** | The survey collects that competency's own defined inputs. The score is the real ECRA score, computed by that competency's own formula. | 5 |
| **Proxy** | The survey evidences part of the picture. Scored and shown, named as its own observable thing, never under the ECRA competency's name. | 8 |
| **Coach** | No survey evidence. Not scored, not estimated, shown as an unfilled axis. | 21 |

Proxies are deliberately **not** named after the competency they gesture at. The survey
knows a candidate's self-declared CV status; it does not know their CV Quality. Calling
the first the second is how a self-report tool ends up lying. So the proxy is called
"CV Status (self-declared)" and sits beside a still-empty CV Quality.

---

## Dimension coverage

| Dimension | ECRA-scored | Proxy | Coach-only | Coverage |
|---|---|---|---|---|
| Professional Capability | 0 / 8 | 3 | 8 | low |
| Employability | 1 / 8 | 4 | 7 | medium |
| Mobility Readiness | 3 / 8 | 1 | 5 | medium |
| European Market Fit | 1 / 10 | 2 | 9 | low |

Professional Capability having zero ECRA-scoreable competencies is the honest result,
not a bug in the mapping. Every competency in that dimension, Problem Solving,
Communication, Collaboration, Leadership and Strategic Thinking, is scored in ECRA off
observed behaviour in conversation. A form cannot see any of it. The dimension still
renders, on proxies, at low confidence, and the report says so in words.

---

## Confidence bands

Confidence is computed, not asserted: `coverage = scored items / total ECRA competencies
in that dimension`, where an ECRA-tier item counts 1.0 and a proxy counts 0.5.

| Band | Coverage | How the report says it |
|---|---|---|
| moderate | ≥ 0.45 | "reasonably well covered by what you told us" |
| limited | 0.25 – 0.45 | "a partial read, several areas still unmeasured" |
| indicative | < 0.25 | "an early indication only, most of this needs a real conversation" |

No band is called "high". Self-report never earns that word.

---

## 1. Professional Capability

| Item | Tier | Source | Scoring |
|---|---|---|---|
| Experience Depth | proxy | Q6 years | 0–1 yr → 2 · 2–10 yr → 3 · 11–15 yr → 4 · 16+ yr → 4 |
| Learning Investment | proxy | Q21 prior courses/certs/coaching | never invested → 2 · invested, unrelated field → 3 · invested, field unclassifiable → 3 · invested, relevant field → 4 |
| Search Follow-through | proxy | Q12 applications submitted | 0 → 1 · 1–4 → 3 · 5–19 → 4 · 20+ → 4 |
| Technical Expertise | coach | | Q6 is 1 of its 4 indicators; the other 3 need conversation |
| Problem Solving | coach | | |
| Communication | coach | | |
| Collaboration | coach | | |
| Leadership & Ownership | coach | | |
| Strategic Thinking | coach | | |
| Execution | coach | | Q12 is 1 of its 4 indicators |
| Learning Agility | coach | | Q21 is 1 of its 4 indicators |

Experience Depth caps at 4, not 5. Years served is a floor on capability, never a
demonstration of it. A 5 in ECRA means competitive advantage, which no date arithmetic
can establish.

## 2. Employability

| Item | Tier | Source | Scoring |
|---|---|---|---|
| **AI & Digital Fluency** | **ECRA** | Q32 checkboxes | `1 + indicators ticked`, the framework's own formula against its own 4 indicators |
| CV Status (self-declared) | proxy | Q13 | none → 1 · have, not Europe-tailored → 2 · self-declared Europe-ready → 4 |
| LinkedIn Status (self-declared) | proxy | Q14 | none → 1 · basic/not updated → 2 · active and optimised → 4 |
| Portfolio Evidence | proxy | Q15 | none → 1 · partial → 3 · yes, high quality → 4 |
| Application Activity | proxy | Q11 stage + Q12 volume | not started → 1 · researching → 2 · applying → 3 · interviewing → 4 · negotiating → 5 |
| CV Quality | coach | | needs the document; all 4 indicators are document-review facts |
| LinkedIn Profile | coach | | needs the profile |
| Interview Skills | coach | | |
| Personal Brand | coach | | |
| Networking | coach | | |
| Job Search Strategy | coach | | Q12 gives volume, not the targeting/cadence/multi-channel/tracking the formula asks for |
| Recruiter Readiness | coach | | scored on responsiveness to the coach, no pre-engagement data exists |

Self-declared "Europe-ready" caps at 4. Across the 63 responses to date, 25 candidates
declared a Europe-ready CV; ECRA's CV Quality indicators (quantified achievements, target
tailoring, ATS-safe formatting, ≤2 pages EU format) are all unverifiable from the form.
Application Activity is the one item where 5 is reachable, because "negotiating an offer"
is a fact about the world rather than a self-rating.

## 3. Mobility Readiness

| Item | Tier | Source | Scoring |
|---|---|---|---|
| **Visa Readiness** | **ECRA** | Q18 | EU passport/work rights → 5 · sponsorship needed, route named → 4 · sponsorship needed, no route → 3 · unsure what's needed → 2 · no awareness → 1 |
| **Language Readiness** | **ECRA** | Q16 + Q17 | native/C2 → 5 · fluent/C1 → 4 · conversational/B1–B2 → 3 · basic/A1–A2 → 2 · not functional → 1; +1 (cap 5) for a second European language at B2 or above |
| **Family Readiness** | **ECRA** | Q33 gate + Q34 checkboxes | no partner/dependents → 5 · otherwise `1 + indicators ticked` |
| Relocation Timeline | proxy | Q10 + Q7 | just exploring → 1 · 6–12 mo → 2 · 3–6 mo → 3 · within 3 mo → 4; −1 if no target country named |
| Qualification Recognition | coach | | needs coach research per candidate |
| Financial Preparedness | coach | | no budget question on the survey |
| Relocation Planning | coach | | Q10 is 1 of its 4 indicators; city, housing and month-by-month plan are unasked |
| Cultural Adaptability | coach | | Q9 is 1 of its 4 indicators, and reading motivation off free text is coach judgment |
| Administrative Readiness | coach | | checklist not yet built, flagged in `08_Coaching_Business.md` |

This is the strongest dimension, and it should be: visa, language and family are the
three things a Thai candidate genuinely knows about themselves without a coach present.
Language Readiness scores English first because Q16 is answered by everyone and Q17 is
optional; the bonus for a second language is capped so a fluent-English candidate with
B2 German cannot exceed a native speaker's ceiling.

## 4. European Market Fit

| Item | Tier | Source | Scoring |
|---|---|---|---|
| **Business English** | **ECRA** | Q16 | native/C2 professional register → 5 · fluent, comfortable professionally → 4 · conversational, needs polish → 3 · basic → 2 · not functional → 1 |
| Target Clarity | proxy | Q7 + Q8 | neither country nor role named → 1 · one of the two → 2 · both, one country → 4 · both, 2+ countries → 3 |
| Salary Expectation Stated | proxy | Q35 | no figure → 1 · figure without currency or period → 2 · figure with currency and period → 3 |
| Cross-cultural Communication | coach | | |
| Independence | coach | | |
| Ownership Mindset | coach | | |
| Customer & Business Awareness | coach | | |
| Collaboration Style | coach | | |
| Salary Expectations | coach | | ECRA scores this against a country/role market benchmark; the figure alone can't be classified |
| Labour Market Knowledge | coach | | |
| Adaptability | coach | | |
| Professional Confidence | coach | | |

Target Clarity scores a single named country **above** a scattergun list. Naming
Netherlands, Germany, France and Denmark is not four times the clarity of naming
Netherlands, in the ECRA sense it is less, because every downstream step (visa route,
language, market knowledge) is country-specific. Salary Expectation Stated caps at 3
and deliberately measures only whether a usable figure exists, never whether it is
realistic; realism is a coach benchmark and stays a coach item.

---

## Data quality notes from the live sheet

Observed across the 63 responses received between 07/07/2026 and the current export.
The normaliser handles each of these; they are recorded here so the next person doesn't
assume clean input.

- **Q6 changed shape mid-collection.** Early responses are free-text numbers ("8",
  "5 years", "7 years +"), later ones are banded ("2–10 ปี / years"). Both parse.
- **Q16 English level was answered in at least five vocabularies**, Thai terms, English
  terms, CEFR levels, and test scores (IELTS 6.5, TOEIC 775, TOEFL-iBT 93). Test scores
  are mapped through the standard CEFR concordances. Anything unrecognised scores null
  rather than guessing, and the item drops out of that dimension's mean.
- **Q32, Q33, Q34 and Q35 were added on 12/07/2026.** Responses before that date have
  them blank. Blank is treated as unanswered, never as zero, an unanswered checkbox
  question is not evidence of zero indicators met.
- **Q12 answers are free text** and include "0", "None", "Not yet", "ยังไม่ได้สมัคร",
  "1 position", "เยอะมากค่ะ" (a lot), and "20 กว่าที่" (20-odd). Numerals and the
  common Thai/English zero phrasings parse; anything else scores null.
- **Q21 was free text before it became a dropdown.** 16 early responses describe
  real courses and certifications in prose. Whether that investment is relevant
  to the target field is a coach judgment, so those parse to a fourth value,
  `unclassified`, scoring the neutral middle rather than being read either way.
- **A few rows have answers shifted into the wrong column** (a timeline answer sitting
  in the CV field, a stage answer in the LinkedIn field). The normaliser validates each
  answer against its own question's option set and rejects out-of-vocabulary values
  rather than scoring them.

## Picking the "what to do first" item

The report names one next action. It is **not** simply the lowest score, for two
reasons found by running the real responses through it.

Family Readiness and Relocation Timeline are frequently low for reasons that are
life circumstances rather than tasks. Telling someone their family situation is
their top action item is both wrong and unkind, so neither is eligible.

And ranking purely by score put Portfolio Evidence first for 38 of the 63 real
responses, 44 of them report no portfolio, which scores the floor. A portfolio
is a late nice-to-have for most white-collar roles; an untailored CV is not.
Lowest-score-wins produced advice that was arithmetically correct and practically
useless.

So funnel order leads, following the triage order in `08_Coaching_Business.md`:
direction, then assets, then applications. Score only decides whether a stage
counts as deficient.

| Order | Item | Reason it sits here |
|---|---|---|
| 1 | Target Clarity | Visa route, language and target employers are all country-and-role specific |
| 2 | CV Status | First thing an employer sees, and filtered before a human reads it |
| 3 | LinkedIn Status | European recruiters source directly; a dormant profile is invisible |
| 4 | Visa Readiness | Naming the route is self-serve research and changes who's worth applying to |
| 5 | Language Readiness | Moves slowly, so late starts block the timeline |
| 6 | Portfolio Evidence | Helps, but late, unfamiliar employer names are the real problem it solves |
| 7 | Application Activity | Nothing downstream starts until applications go out |

The rule: earliest stage scoring ≤ 2; failing that, earliest scoring ≤ 3;
failing that, the weakest eligible item. Across the 63 real responses this
produces 32 CV, 14 Target Clarity, 10 LinkedIn, 5 Portfolio, 1 Visa, 1 Language
, which lines up with the entry points Paul's own sheet triage already assigns
(49 of 70 candidates routed to Candidate Profile Optimization).

## What this unblocks

`product-roadmap.md` TASK-014 (initial self-report scoring logic) and TASK-017 (first
question-set content) both depend on this mapping. It also settles which questions the
app's short first set must contain to make the teaser chart meaningful: the four
ECRA-tier questions (Q18 visa, Q16 English, Q32 AI tools, Q33/34 family) plus Q13/Q14
carry almost all the scoreable signal in the whole 21-question survey. The remaining 15
questions serve triage, ICP and coach context, not the chart.
