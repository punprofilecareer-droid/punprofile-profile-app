---
status: template
name: EU Fit Check, survey specification worksheet
description: >
  Fill this in to define the app's questionnaire. It is the input to the
  content model in `src/lib/content/questions.ts`. Every question that reaches
  a score must map to a scoring slot listed in section 2; anything else is
  context, which is fine but must be marked as such.
---

# Survey specification worksheet

**How to use this.** Fill in sections 3 and 4. Leave Thai blank if you want to
do the language pass later (TASK-052); English alone is enough to build
against. Anything you are unsure about, write the question in section 6 rather
than guessing, and it gets resolved before code is written.

**Before you start, three rules that shape what is possible.**

1. **Every answer needs a fixed value.** The app never parses free text. If an
   answer cannot be a button, it cannot be scored, only stored as context.
2. **Stage 1 is capped at 10 questions**, including pathway. That cap is what
   makes the teaser chart appear in under a minute, which is the product's
   whole differentiation. Stage 2 has no practical cap.
3. **A question that maps to no scoring slot still costs the candidate a tap.**
   Ask it only if you will actually use the answer in a conversation.

---

## 1. What already exists

Current Stage 1, nine questions: pathway, target country (single-select),
target role, CV, LinkedIn, work authorisation, English, job-search stage,
timeline. Known gap you flagged: **country should be multi-select.**

Good news on that one. The data model already stores countries as a list, so
multi-select needs only a UI change plus your decision in section 5 about how
multiple countries should score.

---

## 2. Scoring slots available

These are the slots the scoring engine reads. A question is "scored" only if it
fills one. Slots not filled by any question simply stay unmeasured, which the
report shows honestly.

| Slot | Accepts | Currently asked in | Feeds |
|---|---|---|---|
| `targetCountries` | list of country names | Stage 1 | Target Clarity, Relocation Timeline |
| `targetRole` | one role category | Stage 1 | Target Clarity |
| `cv` | none / untailored / europe_ready | Stage 1 | CV Status |
| `linkedin` | none / basic / active | Stage 1 | LinkedIn Status |
| `workAuth` | eu_rights / sponsor_route_named / sponsor_no_route / unsure / no_awareness | Stage 1 | **Visa Readiness (real ECRA score)** |
| `englishCefr` | A1 / A2 / B1 / B2 / C1 / C2 | Stage 1 | **Language Readiness + Business English (both real ECRA)** |
| `stage` | not_started / researching / applying / interviewing / offer / negotiating | Stage 1 | Application Activity |
| `timeline` | within_3m / 3_6m / 6_12m / exploring | Stage 1 | Relocation Timeline |
| `otherLanguageCefr` | A1..C2, best other European language | not yet | Language Readiness bonus |
| `experienceYears` | 0-1 / 2-10 / 11-15 / 16+ | not yet | Experience Depth |
| `applicationCount` | a number | not yet | Search Follow-through |
| `portfolio` | none / partial / good | not yet | Portfolio Evidence |
| `priorInvestment` | none / unrelated / relevant | not yet | Learning Investment |
| `aiIndicatorFlags` | 4 yes/no checkboxes | not yet | **AI & Digital Fluency (real ECRA)** |
| `hasDependents` + `familyIndicatorFlags` | yes/no + 4 checkboxes | not yet | **Family Readiness (real ECRA)** |
| `salary` | figure + currency + period | not yet | Salary Expectation Stated |

Five of those are **real ECRA scores** rather than proxies. Two of the five
(AI fluency, family readiness) are not asked anywhere yet, so moving them into
Stage 2 is the single biggest coverage win available.

---

## 3. Stage 1 questions, pre-email

Aim for 10 or fewer. Copy this block per question.

```
QUESTION 1
Key:              (short id, e.g. targetCountry)
Ask (EN):
Ask (TH):         (optional now)
Answer type:      single-select | multi-select | number | checkboxes
Options:          (one per line, with the label the candidate sees)
Scoring slot:     (from section 2, or "context only")
Why ask it here:  (why this earns a pre-email tap)
```

**Worked example, so the shape is unambiguous:**

```
QUESTION 1
Key:              targetCountry
Ask (EN):         Which countries in Europe are you aiming for?
Ask (TH):
Answer type:      multi-select
Options:          Germany / Netherlands / France / Denmark / Sweden / Norway /
                  Finland / Ireland / Belgium / Austria / Switzerland / Spain /
                  Italy / Portugal / Poland / Czech Republic / Not sure yet
Scoring slot:     targetCountries
Why ask it here:  Every later step is country-specific, and it is an easy
                  opening tap.
```

---

## 4. Stage 2 questions, post-email unlock

Same block format. This is where the long survey's remaining content goes:
experience, industry, portfolio, other languages, AI habits, family, salary,
obstacles, prior investment.

Two notes worth having in mind while you write these:

- **AI habits and family readiness are checkbox questions with exactly four
  boxes each**, and the four boxes are already defined by the framework in
  `08_Coaching_Business.md`. Keep them as four, since the score is literally
  "1 + boxes ticked".
- **Free-text questions from the old survey** (biggest obstacle, what is
  blocking you, why Europe) are worth keeping as context for your coaching
  conversation, even though they score nothing. Mark them "context only".

---

## 5. Decisions only you can make

**5.1 Multi-select countries and scoring.** Today, naming exactly one country
scores Target Clarity 4, and naming several scores 3. The reasoning was that
every downstream step is country-specific, so focus is genuinely more ready
than breadth. Multi-select makes the question easier to answer honestly, but
the scoring rule then needs a decision. Pick one:

- [ ] Keep as is: one country scores highest, several scores slightly lower.
- [ ] Neutral: any named country scores the same, breadth is not penalised.
- [ ] Soft taper: 1 country = 4, 2-3 = 3.5, 4+ = 3.
- [ ] Something else: ______________________________

**5.2 Question order.** Current Stage 1 opens with country and role. Alternative
is opening with the easiest emotional question. Your call, note it here:
______________________________

**5.3 Anything to drop.** Every Stage 1 question costs a tap and some drop-off.
Is there one you would cut? ______________________________

**5.4 Stage 2 length.** The old survey was 26 questions and people completed it.
Do you want Stage 2 to be the full set, or trimmed? ______________________________

---

## 6. Open questions

Anything you want resolved before this gets built:

1.
2.
3.

---

## 7. What happens after you fill this in

The next session turns this into `src/lib/content/questions.ts`, adds a
multi-select variant to the question UI, extends the mapping module, and
re-runs `scripts/verify-content.ts` to prove every new option actually reaches
a score. Then a generated bilingual copy deck for your Thai pass.
