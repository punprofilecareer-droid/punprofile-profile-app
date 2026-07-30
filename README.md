# EU Fit Check

PunProfile's mobile-first EU job-market readiness self-assessment. See
`docs/VISION.md`, `docs/product-vision.md`, `docs/prd.md`, and
`docs/product-roadmap.md` for full product context and build plan.

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
| `ADMIN_EMAIL` | Convex Auth config | Restricts the single admin account (Paul) — no public sign-up path. |

## Stack

Next.js (App Router) + Convex + Convex Auth + Resend + PostHog + Sentry,
deployed on Vercel. See `docs/VISION.md` § Tech Stack for the rationale
behind each choice.

## Build Status

Following `docs/product-roadmap.md`. Currently in Phase 0 — Foundation &
Setup.
