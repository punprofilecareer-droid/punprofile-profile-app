"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * TASK-081: tell the coach a lead arrived.
 *
 * The funnel's slowest step was between a lead finishing the assessment and a
 * human opening `/admin`, and it had no trigger at all. At one to four leads a
 * week the cost of that is invisible; the day a job post lands well it is the
 * whole funnel. See `punprofile-work/work-funnel/customer-journey.md`.
 *
 * **This email carries no personal data, and that is a hard constraint, not a
 * simplification.** The consent copy signed off on 14/08/2026 tells every
 * candidate "we do not share it with third parties", and Resend is a third
 * party. So the notification says a lead arrived and what shape they are; it
 * never says who. The name, the email, the LINE ID and the answers stay in
 * Convex, and Paul reads them by opening the dashboard, which is exactly the
 * disclosure the privacy notice already describes.
 *
 * That constraint is also why this takes primitives rather than a lead id: an
 * id in an outbound email is a pointer to a person, and keeping the function
 * signature incapable of carrying one is cheaper than remembering not to.
 *
 * Failure is silent by design. PRD § 7 Reliability: the assessment flow must
 * not depend on anything optional, and a notification that throws inside a
 * scheduled action would retry against a mutation that has already committed.
 * No key configured means no email and no error, which is also what a local
 * dev deployment should do.
 */
export const newLead = internalAction({
  args: {
    /** Investment Readiness tier, or null when they did not answer it. */
    tier: v.union(v.string(), v.null()),
    /** Where they are in their job search. The SQL trigger reads this. */
    stage: v.union(v.string(), v.null()),
    /** True when the stage clears the booking gate decided 14/08/2026. */
    sqlGate: v.boolean(),
    /** Set when the Offering Match gate failed, so the pitch has to change. */
    routingNote: v.union(v.string(), v.null()),
  },
  handler: async (_ctx, args) => {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.ADMIN_EMAIL;
    if (!key || !to) return;

    const site = process.env.SITE_URL ?? "https://punprofile-profile-app.vercel.app";

    const subject = args.sqlGate
      ? "EU Fit Check: a lead cleared the booking gate"
      : "EU Fit Check: new lead";

    const lines = [
      args.sqlGate
        ? "This one clears the booking gate. Send the Calendly link."
        : "New completed assessment.",
      "",
      `Stage: ${args.stage ?? "not answered"}`,
      `Fit: ${args.tier ?? "not gradeable"}`,
      ...(args.routingNote ? ["", `Offering Match: ${args.routingNote}`] : []),
      "",
      `Open the dashboard: ${site}/admin`,
      "",
      "No candidate details are included in this email on purpose.",
    ];

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Resend's shared sender. It can only deliver to the address that
          // owns the Resend account, which is the only address this ever sends
          // to, so no domain has to be verified and no DNS record has to exist.
          from: "PunProfile <onboarding@resend.dev>",
          to: [to],
          subject,
          text: lines.join("\n"),
        }),
      });
      if (!res.ok) {
        console.error(`newLead notification failed: ${res.status} ${await res.text()}`);
      }
    } catch (err) {
      console.error("newLead notification threw", err);
    }
  },
});
