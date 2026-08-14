#!/usr/bin/env node
/**
 * TASK-004, one-time key setup. Run from the repo root on the machine that is
 * logged in to Convex:
 *
 *   node scripts/setup-auth.mjs
 *
 * Generates a fresh RS256 keypair PER DEPLOYMENT (dev and prod each get their
 * own) and sets every env var Convex Auth needs, straight through the Convex
 * CLI. Private keys never print and never leave this machine.
 *
 * Safe to re-run: it simply rotates the keys, which signs the admin out
 * everywhere until the next sign-in. That property is also the recovery path
 * if a key is ever exposed: re-run, and the exposed one signs nothing.
 *
 * **Never run `npx convex env list` to check this worked.** It prints every
 * value in full, including JWT_PRIVATE_KEY, so a routine "did that land?"
 * check dumps the deployment's signing key into a terminal buffer, a
 * screenshot, or a pasted chat message. Confirmed the hard way on 14/08/2026.
 * List names only:
 *
 *   npx convex env list --prod | grep -oE '^[A-Z_]+=' | tr -d '='
 */
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { execFileSync } from "node:child_process";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "paul.bussabong@gmail.com";
// Changed 14/08/2026 when punprofile.vercel.app was claimed. This must match
// the address candidates actually visit: Convex Auth builds its redirects from
// SITE_URL, so a mismatch breaks admin sign-in on the domain being published
// while still working on the old one, which is the confusing way round.
// punprofile-profile-app.vercel.app stays alive and serves the same
// deployment, it is just no longer the address anything refers to.
const PROD_SITE_URL = "https://punprofile.vercel.app";
// 3100, not 3000: another project owns 3000 on Paul's machine. This has to
// match the port `npm run dev` actually serves on, because Convex Auth builds
// its redirects from SITE_URL, so a mismatch breaks admin sign-in locally with
// an error that points at auth rather than at a port number.
const DEV_SITE_URL = "http://localhost:3100";

function setEnv(name, value, prod) {
  const args = ["convex", "env", "set"];
  if (prod) args.push("--prod");
  // `--` ends option parsing, and it is not optional here. A PKCS#8 private
  // key begins `-----BEGIN PRIVATE KEY-----`, which the CLI's argument parser
  // reads as an unknown option and rejects with `error: unknown option`,
  // printing the whole key to the terminal as it complains. Found on
  // 14/08/2026, the first time this script ran against a real deployment.
  args.push("--", name, value);
  // stdout inherited so Convex's own confirmation lines show; values are
  // passed as arguments, not echoed.
  execFileSync("npx", args, { stdio: ["ignore", "inherit", "inherit"] });
}

async function configure(prod) {
  const label = prod ? "prod" : "dev";
  const { privateKey, publicKey } = await generateKeyPair("RS256", {
    extractable: true,
  });
  const pkcs8 = await exportPKCS8(privateKey);
  const jwk = await exportJWK(publicKey);
  const jwks = JSON.stringify({ keys: [{ use: "sig", ...jwk }] });

  setEnv("JWT_PRIVATE_KEY", pkcs8, prod);
  setEnv("JWKS", jwks, prod);
  setEnv("ADMIN_EMAIL", ADMIN_EMAIL, prod);
  setEnv("SITE_URL", prod ? PROD_SITE_URL : DEV_SITE_URL, prod);
  console.log(`[${label}] auth environment configured.`);
}

await configure(false);
try {
  await configure(true);
} catch {
  console.log(
    "[prod] could not configure yet (production deployment not provisioned). " +
      "Re-run this script after the first `npx convex deploy` and it will complete.",
  );
}
