# Vision — EU Fit Check

> Captured by the Product Planner skill. This file is the source of truth for
> generating product-vision.md, prd.md, and product-roadmap.md. Edit it directly
> and re-run the Product Planner to regenerate downstream documents.

**Created:** 2026-07-30
**Updated:** 2026-07-30

## Founder

- **Name:** Paul
- **Expertise:** Founder of PunProfile Career Coaching and its lead-generation channel, Thai Jobs in Europe (a Facebook Group publishing vetted EU job listings for Thai professionals).
- **Background:** Paul relocated to Spain himself via a Master's degree used as the entry pathway — not a job-offer-first route — then found local work after arrival. That firsthand experience of navigating relocation without any honest, structured way to self-assess readiness is the direct motivation for this product: he's building the tool he wished existed when he made the move.

## Purpose

- **Who you help:** Thai professionals (mid-career, roughly 2–10 years' experience, white-collar or IT) who've decided Europe is the goal but don't know if they're actually competitive, and are exploring more than one route in — not only the job-offer-with-sponsorship path assumed by most existing career tools.
- **Problem you solve:** They have no honest, structured way to self-assess before investing time or money. Today's qualification tool (a 6-question quiz plus a 25-question Google Form) is long, one-directional, and gives nothing back until a human manually reads it — and it only really models one relocation pathway (secure a job first), leaving people exploring routes like study-first relocation with no relevant guidance at all.
- **Desired transformation:** From vague ambition ("I want to work in Europe") to a clear-eyed, honest picture of current readiness, real gaps, and the concrete next step for their specific pathway — leading toward a signed contract, an accepted study place, or whatever their route actually requires.
- **Why you:** Paul lived the ambiguity this product removes — he relocated via a non-obvious pathway (study, not a job offer) and had no honest readiness signal at the time. He's also the person who has to act on the output: every profile this app produces becomes a lead he personally works to convert into a coaching client, so he's building for his own workflow as much as for the candidate.

## Product

- **Name:** EU Fit Check
- **One-liner:** EU Fit Check gives Thai professionals an honest, coach-informed first read on their EU job-market readiness — before they spend a baht on coaching.
- **How it works:** A user taps the link from a Facebook post or the group → answers a short first set of questions (including which relocation pathway they're exploring: job-first, study-first, family, or not sure) → immediately sees a partial, teaser spider chart (e.g. one dimension revealed) before any contact info is requested → is invited to enter their email to unlock the full self-report profile → sees the complete picture plus a plain-language readout of strengths and gaps → is invited to go deeper now or later via a saved magic link, with a clear path to book a discovery call once there's enough signal to make that worthwhile.
- **Key capabilities:**
  - Progressive, mobile-optimized self-assessment questionnaire with a relocation-pathway selector (job-first / study-first / family / not sure)
  - Instant self-report spider chart, revealed in stages (teaser before any data ask)
  - Partial-completion save/resume via a passwordless magic link, with PDPA-compliant consent capture for email, phone, and LINE ID
  - Auto-generated lead summary surfaced to the coach for triage and outreach
- **Platform:** web
- **Market differentiation:** Unlike a generic Google Form (today's tool) or a generic online career/personality quiz, EU Fit Check gives instant visual feedback grounded in PunProfile's real coaching framework (ECRA-derived), while staying explicitly honest that the result is self-reported and preliminary — not a replacement for the full coach-validated assessment a paying client receives. Most alternatives either fake precision they don't have, or give the user nothing back at all.
- **Magic moment:** The first teaser reveal — seeing even one dimension of the spider chart light up within the first minute, before being asked for anything.

## Audience

- **Primary user:** Someone like "Nueng" — late 20s/early 30s, 2–10 years' experience in a white-collar or IT role in Bangkok, has been quietly browsing "jobs in Germany/Netherlands" for months but never taken a real step because she has no honest way to know if she's actually competitive, or which pathway even fits her situation.
- **Secondary users:**
  - Paul (the coach) — uses the generated lead summaries and self-report profiles as a triage dashboard to prioritize who to reach out to first
  - Already-warm leads who DM'd Paul directly in the Facebook Group — enter the same flow, but use it as pre-call prep rather than cold self-discovery
- **Current alternatives:** The existing 6-question quiz + 25-question Google Form funnel; generic online career/personality quizzes not specific to the EU market or Thai relocation blockers; LinkedIn's built-in "profile strength" meter; informal, inconsistent advice from friends already living in Europe.
- **Frustrations:** The Form is long with zero payoff until a human manually reads it days later. Generic quizzes ignore visa, language, and pathway-specific blockers entirely. LinkedIn's meter isn't job-market- or country-specific. Peer advice is anecdotal and pathway-biased toward whatever route that one friend happened to take.

## Business

- **Revenue model:** free
- **90-day goal:** 300+ people start the assessment; the Google Form is fully retired the moment this ships (100% of new leads route through EU Fit Check); at least 15 discovery calls booked as a direct result; at least 1 paying client attributable to the tool.
- **6-month vision:** EU Fit Check is the sole, mobile-first intake path for all Thai Jobs in Europe traffic (Google Form fully gone since launch). A LINE Official Account nurture sequence is live, feeding off the LINE IDs this tool captures. Enough pathway-type data (job-first vs. study-first vs. other) has accumulated to make an informed, deliberate decision on whether to build the "education matchmaker" extension flagged in the knowledge-base repo's decision log — not build it by default.
- **Constraints:** Paul does not code and is building this entirely through an AI coding agent (Claude Code) — the stack must minimize what he has to hand-maintain. No dedicated budget; free-tier services only. Hosting is fixed to Vercel. Paul has gone multi-week stretches without touching this project, so anything requiring constant manual upkeep is a real risk.
- **Go-to-market:** Same channel as today — the pinned Facebook Group post and the Free Consultation Hook at the end of every Thai Jobs in Europe job post, now pointing at EU Fit Check instead of the Google Form. Near-term addition: a LINE Official Account for nurture, since the app is already capturing LINE IDs as CRM data. Blockdit and Pantip are logged as channels to test later, not committed to yet. Substack was considered and explicitly ruled out — thin organic reach with this specific Thai audience.

## Brand Voice

- **Personality:** The same warm, honest advisor PunProfile already is elsewhere — direct enough to tell someone an uncomfortable truth about a gap in their readiness, but never cold, clinical, or corporate about it.
- **Tone of voice:** Clear, Honest, Supportive, Educational, Optimistic without creating unrealistic expectations — matching `03_Content_System.md`'s existing house tone exactly, including Thai-first, natural conversational language rather than literal-translated corporate phrasing. Example (low-score moment): "This isn't your strongest area yet, but here's exactly what would move the needle." Example (encouraging, not overpromising): "You're closer than you think on X — Y is what's actually holding the timeline back." Final Thai-language copy needs the same native-tone pass `03_Content_System.md` requires for all customer-facing text; these examples are placeholders in English, not final copy.

> Visual identity (mood, anti-patterns, design tokens) is deliberately not
> captured here — it lives in docs/design.md, generated by the Design System
> skill from image references.

## Tech Stack

- **App type:** web
- **Frontend:** Next.js — deploys natively to the already-chosen Vercel host with zero config, and is the framework AI coding agents are best trained on, minimizing what Paul has to hand-maintain.
- **Backend:** Convex — no backend boilerplate to write or maintain, generous free tier fits the no-budget constraint, and its real-time reactivity is a direct fit for incremental save-as-you-go progressive profiling (partial leads must persist before a session completes).
- **Database:** Convex Database — included with the backend; reactive queries suit the lead-record and partial-completion data model without needing separate relational infrastructure.
- **Auth:** Convex Auth for Paul's single admin login (the lead-triage dashboard), plus a passwordless magic-link flow (via email, no account or password) for candidates returning to unlock deeper profile stages.
- **Payments:** None — revenue model is free; monetization happens downstream in Career Coaching sales, not inside this app.
- **Analytics:** PostHog — free tier covers expected volume, and funnel/drop-off tracking directly answers where people abandon the staged flow.
- **Email:** Resend — sends magic links, delivers the self-report result, and notifies Paul when a new lead lands.
- **Error tracking:** Sentry — free tier; catches production issues a non-technical, intermittently-available founder wouldn't otherwise notice.

## Tooling

- **Coding agent:** Claude Code
