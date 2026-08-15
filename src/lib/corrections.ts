/**
 * The coach's correction layer over a candidate's own answers.
 *
 * Candidates contradict themselves. Someone ticks B2 English on a form and then
 * cannot hold a sentence in it on the call; someone leaves a question blank
 * that they answer in the first two minutes of a conversation. Before this,
 * neither could be recorded anywhere the model would read, so the coach knew
 * something the app did not and every screen kept showing the answer known to
 * be wrong.
 *
 * **Corrections never overwrite.** Each is an `assessments` row with
 * `source: "coach"`, holding only the fields it changes, plus the reason and
 * who wrote it. The candidate's own answers stay exactly as they gave them, and
 * the effective record is the base overlaid with every correction in time
 * order. That is what `candidate-data-architecture.md` L3 describes: snapshots
 * store evidence, scores are recomputed from them, and a `source: "coach"`
 * change is verified where a `source: "app"` change stays self-reported.
 *
 * Nothing here is candidate-facing, and the denormalised `leads.scores` is
 * deliberately left alone. A correction changes what the coach sees, not what
 * the candidate is told they scored. The two are allowed to differ; what is not
 * allowed is differing silently, so every corrected field is labelled on screen
 * and the briefing says how many there are.
 */

export interface Correction {
  /** The `assessments` row id, so one can be removed when a coach mis-types. */
  _id: string;
  takenAt: number;
  responses: Record<string, unknown>;
  note?: string;
  by?: string;
}

export interface FieldCorrection {
  key: string;
  /** What the candidate themselves said. Undefined when they never answered. */
  original: unknown;
  /** What the coach recorded instead. */
  value: unknown;
  note?: string;
  by?: string;
  at: number;
  correctionId: string;
}

export interface CorrectedRecord {
  /** Base answers with every coach correction applied, newest winning. */
  effective: Record<string, unknown>;
  /** The winning correction per field, for labelling and for undo. */
  byKey: Map<string, FieldCorrection>;
  /** True when the coach supplied a field the candidate left blank. */
  filled: string[];
  /** True when the coach replaced an answer the candidate did give. */
  changed: string[];
}

/**
 * Applies coach corrections to a candidate's answers.
 *
 * Oldest first, so a later correction of the same field wins and the whole
 * history stays in the table rather than being edited in place. Only `coach`
 * rows are read: an `app` or `survey_import` snapshot is the candidate's own
 * record of themselves and correcting nothing.
 */
export function applyCorrections(
  base: Record<string, unknown>,
  corrections: Correction[],
): CorrectedRecord {
  const effective = { ...base };
  const byKey = new Map<string, FieldCorrection>();

  for (const c of [...corrections].sort((a, b) => a.takenAt - b.takenAt)) {
    for (const [key, value] of Object.entries(c.responses)) {
      byKey.set(key, {
        key,
        // The candidate's own answer, never a previous correction: the screen
        // shows "they said X, we recorded Y", and X is always theirs.
        original: base[key],
        value,
        note: c.note,
        by: c.by,
        at: c.takenAt,
        correctionId: c._id,
      });
      effective[key] = value;
    }
  }

  const filled: string[] = [];
  const changed: string[] = [];
  for (const [key, f] of byKey) {
    (f.original === undefined || f.original === null ? filled : changed).push(key);
  }

  return { effective, byKey, filled, changed };
}
