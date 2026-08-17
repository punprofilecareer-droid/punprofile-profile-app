/**
 * Whether the language toggle must switch in place rather than navigate.
 * 17/08/2026.
 *
 * Since 16/08/2026 the toggle moves the reader to the other language's URL,
 * because both languages no longer live at one address and a cookie alone would
 * leave an English reader on a Thai URL. That is right for every page whose
 * content comes from the server.
 *
 * It is wrong for a page holding state the reader cannot get back. `/en/…` and
 * `/…` are separate routes under separate root layouts, so a push between them
 * unmounts the page rather than re-rendering it. The assessment keeps its
 * session id, every answer and the step in component state and persists none of
 * it, so the unmount ended the assessment: switching language on the result
 * screen started a new one at question one, and switching mid-flow discarded the
 * answers given so far. Each one also left an empty `partial` lead row behind.
 *
 * So a page publishes this for as long as leaving it would cost the reader
 * something, and the toggle sets the locale and the cookie without navigating.
 * The cost is that the URL reads `/efc-assessment` while the page renders
 * English. That is a real cost and it is bounded: the canonical Thai URL still
 * serves and indexes Thai, which is what it paints first, and only a reader who
 * has toggled sees the mismatch.
 *
 * `EnglishSwitchPrompt` already worked this way and never had the bug. This is
 * that behaviour, made available to the one control that did not have it.
 *
 * **A separate store from `navLock`, and deliberately.** They answer different
 * questions. `navLock` asks whether leaving would lose answers, so it releases
 * at the contact step: after it, the lead is saved and navigating away costs
 * nothing. This asks whether leaving would lose the reader's *view* of the
 * result, which is unrecoverable from the browser because resume is magic-link
 * only, and that is true for the whole time the page is mounted. Folding them
 * together would mean one of the two facts being wrong on the result screen,
 * which is the screen the bug was reported from.
 *
 * Read at click time rather than subscribed to: nothing renders differently, so
 * the toggle needs the value only in its handler and never needs to re-render.
 */

let inPlace = false;

export function setLocaleSwitchInPlace(next: boolean): void {
  inPlace = next;
}

export function getLocaleSwitchInPlace(): boolean {
  return inPlace;
}
