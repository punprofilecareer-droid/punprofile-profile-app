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
SITE="https://punprofile.vercel.app"

# Verified in the Vercel dashboard, 14/08/2026:
#   GitHub punprofilecareer-droid/punprofile-profile-app, connected 4 Aug
#   Production branch: master. A push to master auto-deploys, no CLI needed.
#   Domains punprofile.vercel.app (primary, claimed 14/08) and
#   punprofile-profile-app.vercel.app, both on Production
#   Vercel account punprofile.career@gmail.com, team slug pun-profile, Hobby


# ---------------------------------------------------------------------------
# 1. Go to the repo and clear the lock litter the Cowork bridge leaves behind
# ---------------------------------------------------------------------------
cd "$REPO"
find .git -name '*.lock.s*' -delete
find .git -name 'tmp_obj_*' -delete

# Today's work should be at the top and nothing uncommitted. The count that
# matters is how far ahead of the remote you are: everything in it goes out in
# one push at block 6.
git log --oneline -12
git status --short
git rev-list --count origin/master..HEAD


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
# 2b. Commit the regenerated Convex types, then run the invariant checks
# ---------------------------------------------------------------------------
# `convex/notify.ts` is new, so `convex/_generated/api.d.ts` has to be
# regenerated before anything typechecks. That file IS tracked in git, and the
# Cowork bridge has no network so it could not be regenerated there. Step 2
# above already did it as part of the deploy.
npx tsc --noEmit                       # expect silence
npx tsx scripts/verify-content.ts      # expect "content model OK: ..."
npx tsx scripts/verify-copy.ts         # reports missing Thai, does not fail

# Build it locally before the push. Vercel has never built this app: it has
# only ever built the Phase 0 placeholder, so block 6 is a first build on a
# 60-commit jump and that is where a missing dependency would surface. Two
# minutes here beats debugging it in a deploy log.
npm run build

git -c user.name=punprofile -c user.email=punprofile.career@gmail.com \
  add convex/_generated
git -c user.name=punprofile -c user.email=punprofile.career@gmail.com \
  commit -m "Regenerate Convex types for the new-lead notification" || true


# ---------------------------------------------------------------------------
# 3. Generate the auth keys and set the admin address on production
# ---------------------------------------------------------------------------
# Fresh RS256 keypair for prod, plus ADMIN_EMAIL and SITE_URL. Dev keys are
# rotated at the same time, which signs you out of localhost until you log in
# again. Private keys never leave the Mac.
ADMIN_EMAIL=paul.bussabong@gmail.com node scripts/setup-auth.mjs

# Confirm all four landed on prod, BY NAME ONLY. Plain `convex env list`
# prints every value in full, JWT_PRIVATE_KEY included, which puts the
# deployment's signing key into your scrollback. Learned on 14/08/2026 by
# doing it.
npx convex env list --prod | grep -oE '^[A-Z_]+=' | tr -d '='


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
# The old NEXT_PUBLIC_CONVEX_URL has to GO, not be updated. The build command
# `npx convex deploy --cmd 'npm run build'` sets NEXT_PUBLIC_CONVEX_URL itself
# from the deploy key during the build. A manually set one silently wins and
# would leave the production site talking to the dev database with no visible
# symptom at all.
npx vercel link            # team slug is pun-profile, project punprofile-profile-app

# Verified in the dashboard 14/08/2026: the project has exactly ONE environment
# variable, NEXT_PUBLIC_CONVEX_URL, added 4 Aug and scoped to Production AND
# Preview in a single entry. Preview should keep pointing at dev, so this is an
# EDIT, not a delete. The CLI cannot narrow an entry's scope, so do it in the
# dashboard: Settings -> Environment Variables -> the three dots -> Edit ->
# untick Production, leave Preview ticked -> Save.
open "https://vercel.com/pun-profile/punprofile-profile-app/settings/environment-variables"
npx vercel env add CONVEX_DEPLOY_KEY production      # paste the key from step 4

# The Build Command override is ALREADY SET, done 14/08/2026 and verified in
# the dashboard: `npx convex deploy --cmd 'npm run build'`. Nothing to do here.
# The `vercel-build` script was removed from package.json in the same change,
# so there is exactly one definition of the build and no question about which
# of the two Vercel would have picked. Convex deploys before Next builds, so a
# schema change can never land ahead of the frontend that needs it.

# The new-lead notification. RESEND_API_KEY is a CONVEX env var, not a Vercel
# one, because the action runs in Convex. Sign up at resend.com with
# paul.bussabong@gmail.com, take the default API key, and no domain needs
# verifying: the mail carries no candidate details and only ever goes to the
# account owner's own address, so Resend's shared sender is enough.
# Skip this and there is simply no notification, no error.
npx convex env set RESEND_API_KEY re_xxxxxxxx --prod

# Preview deployments keep pointing at dev, which is what you want, so leave
# the preview-scoped NEXT_PUBLIC_CONVEX_URL alone.
npx vercel env ls


# ---------------------------------------------------------------------------
# 6. Push. This is the deploy.
# ---------------------------------------------------------------------------
# The branch is master, not main, and local is far ahead of it: origin/master
# still sits on Phase 0, which is why Vercel has been serving the placeholder
# page all along. This push is the first time the real app reaches the
# internet, and it carries every commit at once.
git push origin master

# Watch the build in the dashboard. It must show `convex deploy` running
# BEFORE `next build`. If it does not, the build command override was lost and
# you would ship a frontend with no backend behind it.
open "https://vercel.com/pun-profile/punprofile-profile-app/deployments"


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
#   $SITE/privacy    has NO draft banner, says punprofile.career@gmail.com, twelve
#                    months from last contact
#   $SITE/admin      your test lead appears, scored, email visible
#   your inbox       a "EU Fit Check: new lead" mail with NO candidate
#                    details in it. If you answered the stage question as
#                    interviewing, the subject says it cleared the gate.
#
# Then the launch itself: repoint the Free Consultation Hook and the pinned
# Facebook Group post from the Google Form to $SITE, and retire the Form.
