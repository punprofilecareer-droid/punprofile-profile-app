"use client";

/**
 * Hides its children while an assessment is in progress. TASK-085, 14/08/2026.
 *
 * The footer is a server component and the lock is client state, so this sits
 * between them and takes the footer as `children`. The footer's markup is still
 * rendered on the server and shipped as a prop; only the decision to show it
 * runs on the client, which is a few bytes rather than a whole footer's worth
 * of component code.
 *
 * Same store and same reason as `SiteMenu`. Every link out of the page during
 * the check costs the candidate their answers: the flow holds them in memory
 * and in a Convex row with no candidate-side identifier, there is no cookie and
 * no localStorage, and resume only exists through a magic link that needs an
 * email they have not given yet. A footer full of destinations under a
 * half-finished assessment is the same trapdoor the menu already closes.
 */

import { useSyncExternalStore } from "react";
import { getNavLocked, getNavLockedServer, subscribeNavLock } from "@/lib/navLock";

export default function NavLockGate({ children }: { children: React.ReactNode }) {
  const locked = useSyncExternalStore(subscribeNavLock, getNavLocked, getNavLockedServer);
  return locked ? null : <>{children}</>;
}
