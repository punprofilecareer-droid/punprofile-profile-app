---
status: draft for founder review
name: EU Fit Check, survey specification
description: >
  The full questionnaire, prefilled with the exact Thai and English wording
  currently live in the two Google Forms. Edit in place: change wording, add or
  remove options, move questions between stages. This file is the input to
  `src/lib/content/questions.ts`.
---

# Survey specification

**Prefilled from live data.** Every Thai string below was extracted from the
published forms and their response sheet, not retyped from the spec docs, so
it is what candidates actually saw. Your job is to correct and improve it, not
to author it from scratch.

**How to edit.** Change any wording directly. Delete options you don't want.
Move a question between Stage 1 and Stage 2 by moving its block. Add a new
question by copying a block. Where a decision is needed, there is a
`DECISION:` line with checkboxes.

**Three constraints that shape what's possible.**

1. Every answer needs a fixed option. The app never parses free text, so a
   free-text answer can be stored as context for your calls but cannot score.
2. Stage 1 is capped at 10 questions including pathway. That cap is what makes
   the teaser chart appear in under a minute.
3. `SLOT:` names the scoring field a question fills. `SLOT: context only`
   means it scores nothing and exists purely for your coaching conversation.

**Legend.** `[ECRA]` means the answer produces a real framework score, the
strongest kind. `[proxy]` means it evidences part of a picture and is named for
what it actually observes. Five ECRA-scoreable competencies exist in total and
four are reachable here.

---

## Stage 1, before the email ask

Nine questions today. Two are new (pathway, and country as multi-select); the
rest carry live wording.

### S1-1. Pathway `SLOT: pathway` (context + narrative)

> **TH:** คุณกำลังมองเส้นทางไหนในการไปยุโรป
> **EN:** Which route to Europe are you exploring?

- `job_first` = หางานก่อน แล้วค่อยย้าย / Find a job first, then relocate
- `study_first` = เรียนต่อก่อน แล้วค่อยหางานที่นั่น / Study first, then find work there
- `family` = ไปตามคู่ครองหรือครอบครัว / Family or partner route
- `not_sure` = ยังไม่แน่ใจ กำลังหาข้อมูลอยู่ / Not sure yet, exploring

*New question, no live equivalent. Wording is a first draft and needs your eye.
It drives the opening line of the result narrative (FR-008), so all four routes
must feel equally legitimate, never like "job-first is the real one".*

### S1-2. Target countries `SLOT: targetCountries` `[proxy: Target Clarity]`

> **TH:** ประเทศในยุโรปที่คุณสนใจไปทำงาน (เลือกได้มากกว่า 1 ข้อ)
> **EN:** Target country/countries in Europe (you can choose more than one)

Multi-select. Germany / Netherlands / France / Denmark / Sweden / Norway /
Finland / Ireland / Belgium / Austria / Switzerland / Spain / Italy / Portugal
/ Poland / Czech Republic, plus `not_sure` = ยังไม่แน่ใจ / Not sure yet

*Live version was free text and got answers like "Netherlands Germany France",
"All options are open", "สนใจทุกประเทศ". Multi-select fixes that.*

**DECISION 1: how should choosing several countries score?**
Today one country scores Target Clarity 4 and several scores 3, because every
later step (visa route, language, employers) is country-specific, so focus is
genuinely more ready than breadth.

- [ ] Keep it: 1 country = 4, several = 3
- [ ] Neutral: any named country scores the same
- [ ] Taper: 1 = 4, two or three = 3.5, four or more = 3
- [ ] Other: ________________

### S1-3. Target role `SLOT: targetRole` `[proxy: Target Clarity]`

> **TH:** ตำแหน่งงานหรือสายงานที่อยากทำในยุโรป
> **EN:** Target role or field in Europe

IT & Software / Engineering & Technical / Business, Strategy & Project /
Marketing / Sales & Business Development / Customer Success & Account
Management / Procurement, Supply Chain & Operations / Management & Executive /
Other, plus `not_sure` = ยังไม่แน่ใจ / Not sure yet

*Categories come from your own Job Title Pool. Live version was free text.*

**DECISION 2:** are these the right nine categories, or do you want to add,
merge or rename any? ________________

### S1-4. CV `SLOT: cv` `[proxy: CV Status]`

> **TH:** ตอนนี้มี CV/เรซูเม่ที่อัปเดตแล้วหรือยัง
> **EN:** Do you have an updated CV?

- `none` = ยังไม่มี / Don't have one yet
- `untailored` = มีแต่ยังไม่ปรับให้เหมาะกับยุโรป / Have one, not tailored for Europe
- `europe_ready` = มีแล้วพร้อมใช้สมัครงานยุโรป / Have one, Europe-ready

*Live wording, unchanged.*

### S1-5. LinkedIn `SLOT: linkedin` `[proxy: LinkedIn Status]`

> **TH:** มีโปรไฟล์ LinkedIn หรือไม่
> **EN:** Do you have a LinkedIn profile?

- `none` = ยังไม่มี / None
- `basic` = มี แต่ไม่ได้อัพเดต / Have one, rarely updated
- `active` = มีและอัพเดทสม่ำเสมอ / Active and kept up to date

*Live wording, unchanged.*

### S1-6. Work authorisation `SLOT: workAuth` `[ECRA: Visa Readiness]`

> **TH:** เรื่องวีซ่า/สิทธิ์ทำงานในยุโรป ตอนนี้คุณอยู่ตรงไหน
> **EN:** Where do you stand on visa and the right to work in Europe?

- `eu_rights` = มีพาสปอร์ต EU หรือสิทธิ์ทำงานอยู่แล้ว / Already have an EU passport or work rights
- `sponsor_route_named` = ต้องการสปอนเซอร์วีซ่า และรู้แล้วว่าจะใช้วีซ่าประเภทไหน / Need sponsorship and know which visa route I'd use
- `sponsor_no_route` = เข้าใจว่าต้องหาบริษัทที่ช่วย sponsor วีซ่า / Understand I'll need visa sponsorship
- `unsure` = ยังไม่รู้เลยว่าต้องใช้อะไรบ้าง / Not sure what's needed at all

*Merges the quiz's visa question with the survey's. The `sponsor_route_named`
option is new: the framework scores "knows the specific route" a full point
above "knows sponsorship is needed", and no live form ever asked it, so that
distinction is currently invisible. Worth adding.*

### S1-7. English `SLOT: englishCefr` `[ECRA: Language Readiness + Business English]`

> **TH:** ระดับภาษาอังกฤษของคุณ
> **EN:** Your English level

- `A2` = พื้นฐาน / Basic
- `B1` = พอสื่อสารได้ / Conversational
- `C1` = คล่องแคล่ว / Fluent
- `C2` = ใกล้เคียงเจ้าของภาษา / Native-level

*Live version added "หรือถ้าผ่านการสอบวัดระดับโปรดระบุ" (state your test score if
you have one) and got IELTS 6.5, TOEIC 775, TOEFL 93, plus vague answers like
"Good" that score nothing.*

**DECISION 3:** add an optional follow-up for a test score?
- [ ] No, four buttons is enough
- [ ] Yes, ask separately for IELTS/TOEIC/TOEFL (more precise, costs a tap)

*This one question feeds two of the four dimensions, so precision here is worth
more than anywhere else in the form.*

### S1-8. Job search stage `SLOT: stage` `[proxy: Application Activity]`

> **TH:** ตอนนี้คุณอยู่ขั้นตอนไหนของการหางานแล้ว
> **EN:** What stage are you at right now?

- `not_started` = ยังไม่เริ่ม / Haven't started
- `researching` = กำลังหาข้อมูล / Researching
- `applying` = กำลังสมัครงาน / Actively applying
- `interviewing` = มีนัดสัมภาษณ์แล้ว / Interviewing
- `offer` = ได้รับข้อเสนอแล้ว กำลังต่อรองเงินเดือนและ benefits / Have an offer or negotiating

*Live wording. The last two live options ("ได้รับข้อเสนองานแล้ว" and
"กำลังเจรจาสัญญา") score identically, so they are merged here.*

### S1-9. Timeline `SLOT: timeline` `[proxy: Relocation Timeline]`

> **TH:** อยากเริ่มงานที่ยุโรปเมื่อไหร่
> **EN:** When do you want to start working in Europe?

- `within_3m` = ภายใน 3 เดือน / Within 3 months
- `3_6m` = 3–6 เดือน / In 3 to 6 months
- `6_12m` = 6–12 เดือน / In 6 to 12 months
- `exploring` = ยังไม่แน่ใจ กำลังศึกษาข้อมูลอยู่ / Not sure, still exploring

*Live wording, unchanged.*

**DECISION 4:** Stage 1 is nine questions, one under the cap. Add one more,
keep as is, or cut something? ________________

---

## Stage 2, after the email unlock

Everything below is live survey content. Scoring-relevant questions first,
context questions after.

### S2-1. AI and digital habits `SLOT: aiIndicatorFlags` `[ECRA: AI & Digital Fluency]`

> **TH:** คุณใช้เครื่องมือดิจิทัล/AI ในการทำงานอย่างไรบ้าง (เลือกได้มากกว่า 1 ข้อ)
> **EN:** How do you use digital tools and AI in your work? (Select all that apply)

Exactly four checkboxes, live wording:

1. ใช้เครื่องมือ AI (เช่น ChatGPT) ค้นหาข้อมูลเป็นประจำทุกสัปดาห์ / I use AI tools (e.g. ChatGPT) for search-related tasks weekly
2. ใช้เครื่องมือทำงานสากลยุโรปได้คล่อง (Slack, Teams, Notion) / I'm comfortable with core EU workplace tools (Slack, Teams, Notion)
3. เคยใช้ AI ปรับ CV/จดหมายสมัครงานให้เหมาะกับแต่ละตำแหน่ง ไม่ใช่แค่เทมเพลตทั่วไป / I've used AI to tailor application materials to a specific role, not just generic templates
4. เคยเรียนรู้และเริ่มใช้เครื่องมือดิจิทัลใหม่ด้วยตัวเอง ไม่ใช่เพราะถูกบังคับ / I've adopted at least one new digital tool on my own initiative

*Keep exactly four: the score is literally 1 + boxes ticked. Adding a fifth
breaks the framework formula. Each unticked box also becomes a specific
coaching action in the AI toolstack plan.*

### S2-2. Dependents `SLOT: hasDependents` `[ECRA: Family Readiness, gate]`

> **TH:** คุณมีคู่ครองหรือผู้ที่ต้องพึ่งพา (เช่น บุตร, ผู้สูงอายุในความดูแล) ที่จะย้ายไปพร้อมกับคุณหรือไม่
> **EN:** Do you have a partner or dependents who would relocate with you?

- `false` = ไม่มี – อยู่คนเดียว/ไม่มีคู่ครองหรือผู้ที่ต้องพึ่งพา / No, single with no dependents
- `true` = มี – มีคู่ครองหรือผู้ที่ต้องพึ่งพา / Yes, I have a partner and/or dependents

*Answering "no" auto-scores Family Readiness 5 and skips the next question.*

### S2-3. Family readiness `SLOT: familyIndicatorFlags` `[ECRA: Family Readiness]`

> **TH:** ครอบครัวของคุณเตรียมพร้อมสำหรับการย้ายไปทำงานที่ยุโรปแค่ไหน (เลือกได้มากกว่า 1 ข้อ)
> **EN:** How ready is your family for the relocation? (Select all that apply)

Exactly four checkboxes, live wording:

1. ได้พูดคุยเรื่องการย้ายกับสมาชิกครอบครัวที่เกี่ยวข้องทุกคนแล้ว / I've discussed the relocation with all affected family members
2. ไม่มีข้อคัดค้านที่ยังแก้ไม่ได้จากคู่ครองหรือผู้ที่ต้องพึ่งพา / There's no unresolved objection from a partner or dependent
3. มีแผนรองรับ (เช่น โรงเรียนบุตร, งานของคู่ครอง) หรือยืนยันว่าไม่เกี่ยวข้อง / I have a plan for dependents (schooling, partner's work) or confirmed N/A
4. กำหนดเวลาการย้ายของฉันคำนึงถึงเรื่องครอบครัวแล้ว / My relocation timeline accounts for family logistics

*Only shown when S2-2 is yes.*

### S2-4. Years of experience `SLOT: experienceYears` `[proxy: Experience Depth]`

> **TH:** คุณมีประสบการณ์ทำงานมากี่ปีแล้ว
> **EN:** Years of professional experience

- `0-1` = 0–1 ปี / years
- `2-10` = 2–10 ปี / years
- `11-15` = 11–15 ปี / years
- `16+` = 16+ ปี / years

*Live wording. Started as free text, became bands mid-collection, which is why
early responses have raw numbers.*

### S2-5. Applications sent `SLOT: applicationCount` `[proxy: Search Follow-through]`

> **TH:** สมัครงานในยุโรปไปแล้วกี่ตำแหน่ง
> **EN:** How many roles have you applied to in Europe so far?

- `0` = ยังไม่ได้สมัคร / Haven't applied yet
- `1-4` = 1–4 ตำแหน่ง / 1 to 4 roles
- `5-19` = 5–19 ตำแหน่ง / 5 to 19 roles
- `20+` = 20 ตำแหน่งขึ้นไป / 20 or more

*Live version was free text and produced "เยอะมากค่ะ", "20 กว่าที่",
"Content moderator - Thai speaker, Accenture, Dublin". Bands fix it, and the
scorer only uses bands anyway.*

### S2-6. Portfolio `SLOT: portfolio` `[proxy: Portfolio Evidence]`

> **TH:** มีเว็บไซต์แสดงผลงาน (portfolio) หรือไม่
> **EN:** Do you have a portfolio site showing your work?

- `none` = ยังไม่มี / No
- `partial` = มีบางส่วน / Partly
- `good` = มีแล้ว อยู่ในระดับที่ดี / Yes, and it's good

*Live wording, unchanged.*

### S2-7. Other European languages `SLOT: otherLanguageCefr` `[ECRA: Language Readiness bonus]`

> **TH:** ภาษาอื่นๆ ในยุโรปที่พูดได้ และระดับความสามารถ
> **EN:** Other European languages you speak, and your level

Live form had a grid of ten languages (Dutch, German, French, Spanish, Italian,
Portuguese, Swedish, Danish, Norwegian, Polish) each rated
ไม่พูดเลย / พื้นฐาน A1-A2 / พอสื่อสารได้ B1-B2 / คล่องแคล่ว C1 / ใกล้เคียงเจ้าของภาษา C2.

**DECISION 5:** the grid is ten taps for something that only adds a bonus point
at B2 or above. Simplify?
- [ ] Keep the full ten-language grid
- [ ] Ask only about the language of their chosen target country (recommended)
- [ ] Single question: "any other European language at conversational or above?"
- [ ] Drop it

### S2-8. Salary expectation `SLOT: salary` `[proxy: Salary Expectation Stated]`

> **TH:** เงินเดือนที่คุณคาดหวังสำหรับตำแหน่งเป้าหมายในยุโรป
> **EN:** Your expected salary for your target role in Europe

Live version was free text and produced "Euro 33,000", "150,000 บาท ต่อเดือนขึ้นไป",
"800 euros Plus", "Depends". The score only checks whether a usable figure
exists with a currency and a period, never whether it is realistic; realism is
your judgement call, not the form's.

**DECISION 6:**
- [ ] Structured: a currency picker, an amount, and a per-month/per-year toggle
- [ ] Keep free text (context only, scores nothing)
- [ ] Drop it

### S2-9. Prior investment `SLOT: priorInvestment` `[proxy: Learning Investment]`

> **TH:** ที่ผ่านมาเคยลงทุนกับคอร์สเรียน ใบรับรอง หรือโค้ชด้านอาชีพมาก่อนไหม
> **EN:** Have you invested in courses, certifications or coaching before?

- `none` = ไม่เคยลงทุน / Never invested
- `unrelated` = เคยลงทุน แต่ไม่เกี่ยวข้องกับสายงานที่ต้องการ / Yes, but unrelated to my target field
- `relevant` = เคยลงทุน และเกี่ยวข้องกับสายงานที่ต้องการ / Yes, and relevant to my target field

*Live wording. This is your strongest willingness-to-pay signal, and it reads
naturally rather than as a budget question.*

### Context questions, no score

Kept because you read them before a call. Free text is fine here.

- **ทำไมถึงอยากไปยุโรปโดยเฉพาะ** / Why Europe, specifically?
- **มีอะไรที่ทำให้การสมัครงานหรือสัมภาษณ์ของคุณติดขัดอยู่ตอนนี้** / Anything currently blocking your applications or interviews?
- **อะไรคืออุปสรรคใหญ่ที่สุดที่ทำให้คุณยังไม่ได้งานในยุโรปตอนนี้** / What's the biggest obstacle stopping you from getting hired in Europe right now?
- **ตำแหน่งงานปัจจุบันของคุณ** / Current job title
- **Industry ที่คุณทำงานอยู่** / Current industry
- **ตอนนี้คุณอยู่ที่ไหน (จังหวัด/ประเทศ)** / Current location

**DECISION 7:** which of these six earn their place? Cross out any you'd cut.

*Dropped from the live survey on purpose: full name and "best way to reach you"
are replaced by the email capture step and the optional phone/LINE fields, so
asking twice is unnecessary.*

---

## Your decisions, collected

1. Multi-country scoring: ________________
2. Role categories right?: ________________
3. English test score follow-up?: ________________
4. Stage 1 length: ________________
5. Other-languages grid: ________________
6. Salary question format: ________________
7. Context questions to keep: ________________

## Anything else

1.
2.
3.
