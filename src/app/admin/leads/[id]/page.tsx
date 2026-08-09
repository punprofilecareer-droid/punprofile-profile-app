"use client";

/**
 * TASK-035: one lead in full. Sits under /admin so the existing middleware
 * matcher (`/admin(.*)`) already covers it, and `requireAdmin` in
 * `convex/leads.ts` is what actually enforces it.
 */

import { use } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";
import LeadDetail from "@/components/features/dashboard/LeadDetail";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 leading-normal">
      <AuthLoading>
        <p className="text-body text-neutral-500">Checking session...</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-body text-slate">
          Not signed in.{" "}
          <Link className="text-primary underline" href="/login">
            Go to sign-in
          </Link>
        </p>
      </Unauthenticated>
      <Authenticated>
        <LeadDetail leadId={id as Id<"leads">} />
      </Authenticated>
    </div>
  );
}
