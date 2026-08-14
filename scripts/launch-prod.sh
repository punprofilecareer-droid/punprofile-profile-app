#!/usr/bin/env bash
#
# EU Fit Check, production launch runbook. 14/08/2026.
#
# Run this BLOCK BY BLOCK, not as one script. Two blocks need a browser and
# one needs you to paste a key, so an unattended run would stop halfway with
# a half-configured production deployment, which is worse than not starting.
#
# Order matters: Convex production has to exist and Vercel has to hold the
# deploy key BEFORE the push, because the push is what triggers the build
# that calls `convex deploy`. Pushing first just fails the build.
#
set -euo pipefail

REPO="/Users/paulb/Documents/LTD OS/punprofile-career/punprofile-profile-app"
SITE="https://punprofile-profile-app.vercel.app"


# ---------------------------------------------------------------------------
# 1. Go to the repo and clear the lock litter the Cowork bridge leaves behind
# ---------------------------------------------------------------------------
cd "$REPO"
find .git -name '*.lock.s*' -delete
find .git -name 'tmp_obj_*' -delete

# Two commits from today should be at the top, and nothing uncommitted.
git log --oneline -2
git status --short


# ---------------------------------------------------------------------------
# 2. Create the Convex PRODUCTION deployment and push the backend to it
# ---------------------------------------------------------------------------
# Until now everything has run on the dev deployment quiet-mule-251. This
# creates prod under the same project and pushes schema, indexes and
# functions. It will ask you to confirm the deployment it is creating.
npx convex deploy

# Note the production URL it prints. It looks like
# https://<something>-<something>-<number>.eu-west-1.convex.cloud
# You do not need to copy it into Vercel; step 5 explains why.


# ---------------------------------------------------------------------------
# 3. Generate the auth keys and set the admin address on production
# ---------------------------------------------------------------------------
# Fresh RS256 keypair for prod, plus ADMIN_EMAIL and SITE_URL. Dev keys are
# rotated at the same time, which signs you out of localhost until you log in
# again. Private keys never leave the Mac.
ADMIN_EMAIL=paul.bussabong@gmail.com node scripts/setup-auth.mjs

# Confirm all four landed on prod.
npx convex env list --prod


# ---------------------------------------------------------------------------
# 4. BROWSER STEP. Generate a production deploy key
# ---------------------------------------------------------------------------
# There is no CLI for this one. This opens the Convex dashboard:
npx convex dashboard
#
#   Project punprofile-profile-app -> switch to Production (top left)
#   -> Settings -> Deploy Keys -> Generate Production Deploy Key
#   -> copy it, you only get to see it once.
#
# Keep the terminal open, you paste it in the next block.


# ---------------------------------------------------------------------------
# 5. Point Vercel's production environment at production Convex
# ---------------------------------------------------------------------------
# The old NEXT_PUBLIC_CONVEX_URL has to GO, not be updated. `convex deploy
# --cmd 'next build'` sets NEXT_PUBLIC_CONVEX_URL itself from the deploy key
# during the build. A manually set one silently wins and would leave the
# production site talking to the dev database with no visible symptom.
npx vercel link            # pick team PunProfile, project punprofile-profile-app
npx vercel env rm NEXT_PUBLIC_CONVEX_URL production
npx vercel env add CONVEX_DEPLOY_KEY production      # paste the key from step 4

# Preview deployments keep pointing at dev, which is what you want, so leave
# the preview-scoped NEXT_PUBLIC_CONVEX_URL alone.
npx vercel env ls


# ---------------------------------------------------------------------------
# 6. Push. This is the deploy.
# ---------------------------------------------------------------------------
git push origin main

# Watch it. The build must show `convex deploy` running before `next build`.
npx vercel logs --follow || true


# ---------------------------------------------------------------------------
# 7. BROWSER STEP. Create the admin account on production
# ---------------------------------------------------------------------------
# The prod database is empty, including your user. There is no public sign-up,
# only the ADMIN_EMAIL gate, so this creates the one account that will exist.
#
#   open $SITE/login
#   sign up with paul.bussabong@gmail.com and a password you keep
#   then confirm $SITE/admin loads and shows an empty lead table
open "$SITE/login"


# ---------------------------------------------------------------------------
# 8. Load the 90 historical leads into production
# ---------------------------------------------------------------------------
# Idempotent on email, so a second run updates rather than duplicates.
# Regenerate the file first only if data/responses.json has changed.
# npx tsx scripts/backfill-leads.ts data/responses.json data/backfill.json
npx convex run --prod importLeads:importLegacyLeads "$(cat data/backfill.json)"

# Reload $SITE/admin. 90 scored leads.


# ---------------------------------------------------------------------------
# 9. Smoke test, on a phone, on mobile data not wifi
# ---------------------------------------------------------------------------
#   $SITE            loads, no console errors
#   run Stage 1 end to end with a throwaway email
#   the contact step has NO "Not for production" banner
#   the chart renders with Professional Capability hollow, that is correct
#   $SITE/privacy    has NO draft banner, says hi@agentsiam.com, twelve
#                    months from last contact
#   $SITE/admin      your test lead appears, scored, email visible
#
# Then the launch itself: repoint the Free Consultation Hook and the pinned
# Facebook Group post from the Google Form to $SITE, and retire the Form.
