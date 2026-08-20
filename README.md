# PunProfile App

The web surface of PunProfile Career Coaching. **EU Fit Check** is its
assessment feature, not the product itself; the job board, saved jobs and
application tracker are specified in Phase 4.

All specifications live in the sibling repo `../punprofile-career-coaching/`:
the method in `10_Methodology.md`, the product specs in `ctxt-product/`, the
roadmap in `punprofile-work/work-projects/eu-fit-check/`. This repo is
implementation only. See `AGENTS.md`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. See
`docs/prd.md` § 2 Technical Architecture for what each service is for.

| Variable | Where it's used | Notes |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Next.js client | Convex deployment URL, public/safe for client. Set by `npx convex dev`. |
| `CONVEX_DEPLOY_KEY` | CI/CD (Vercel build) | Server-only, used for `npx convex deploy`. |
| `RESEND_API_KEY` | Convex environment (`npx convex env set`) | Never exposed to the client — email actions run in Convex, not Next.js. |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Next.js client | Analytics; must be configured to exclude PII (see PRD § 2 Security). |
| `NEXT_PUBLIC_SENTRY_DSN` | Next.js client/server/edge | Error tracking. |
| `SENTRY_AUTH_TOKEN` | Build time only | Source map upload; not needed at runtime. |
| `ADMIN_EMAILS` | Convex Auth config | Comma-separated allowlist of coach accounts — no public sign-up path. Read via `convex/adminEmails.ts`. |
| `ADMIN_EMAIL` | Convex environment | Recipient of the new-lead alert (`convex/notify.ts`), and a fallback allowlist entry. |

## Stack

Next.js (App Router) + Convex + Convex Auth + Resend + PostHog + Sentry,
deployed on Vercel. See `docs/VISION.md` § Tech Stack for the rationale
behind each choice.

## Build Status

Following `docs/product-roadmap.md`. Currently in Phase 0 — Foundation &
Setup.
