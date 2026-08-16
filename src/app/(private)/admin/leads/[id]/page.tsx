"use client";

/**
 * TASK-035: one lead in full. Sits under /admin so the existing proxy matcher
 * (`/admin(.*)`) already covers it, and `requireAdmin` in `convex/leads.ts` is
 * what actually enforces it.
 */

import { use } from "react";
import AdminGate from "@/components/AdminGate";
import LeadDetail from "@/components/features/dashboard/LeadDetail";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    // Wider than the rest of the site on purpose. Every other page is a reading
    // column; this one is two working columns side by side, and 48rem split in
    // half leaves both too narrow to scan.
    <div className="mx-auto w-full max-w-6xl px-6 py-16 leading-normal">
      <AdminGate>
        <LeadDetail leadId={id as Id<"leads">} />
      </AdminGate>
    </div>
  );
}
