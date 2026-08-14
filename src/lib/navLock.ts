/**
 * Whether the header's menu may be shown. TASK-085, 14/08/2026.
 *
 * A one-value external store, deliberately not React context. The header is
 * rendered by the root layout, above `<main>`, so a page inside `children`
 * cannot reach it through context without lifting the whole header into a
 * client provider and re-rendering it on every step change. This is the state
 * the header subscribes to and the assessment publishes, in both senses an
 * external system, which is also why calling `setNavLocked` from an effect is
 * the sanctioned pattern rather than a cascading render.
 *
 * **What it protects.** The assessment holds every answer in memory and in a
 * Convex row with no candidate-side identifier. There is no cookie, no
 * localStorage, and resume exists only through a magic link that requires an
 * email that has not been given yet. So navigating away mid-flow does not pause
 * anything: it ends it. That is exactly why the wordmark has never been a link,
 * and a menu is the same trapdoor with more doors in it.
 *
 * Locked is the safe default for a value that is set asynchronously. If the
 * assessment mounts and publishes before the header reads, the header hides a
 * menu that could have been shown, which costs one tap. The other way round
 * loses ten answers.
 */

let locked = false;
const listeners = new Set<() => void>();

export function setNavLocked(next: boolean): void {
  if (locked === next) return;
  locked = next;
  for (const fn of listeners) fn();
}

export function subscribeNavLock(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getNavLocked(): boolean {
  return locked;
}

/**
 * The server render never has an assessment in progress, because the store is
 * per-request module state that nothing has written yet. Returning false keeps
 * the server and the first client render agreeing, so the menu does not flash.
 */
export function getNavLockedServer(): boolean {
  return false;
}
