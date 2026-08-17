"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { STAGE1 } from "@/lib/content/questions";
import QuestionCard from "@/components/features/assessment/QuestionCard";
import { BLOCKS, blockFor } from "@/lib/content/blocks";
import Image from "next/image";
import BlockPanel, { type BlockImage } from "@/components/features/assessment/BlockPanel";
import SpiderChart from "@/components/features/chart/SpiderChart";
import ScoreLegend from "@/components/features/chart/ScoreLegend";
import { useCopy } from "@/components/LocaleProvider";
import ContactGate from "@/components/features/assessment/ContactGate";
import LanguageGrid from "@/components/features/assessment/LanguageGrid";
import EnglishSwitchPrompt from "@/components/features/assessment/EnglishSwitchPrompt";
import CommunityStats from "@/components/features/assessment/CommunityStats";
import MarketProof from "@/components/features/assessment/MarketProof";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/content/cta";
import { setNavLocked } from "@/lib/navLock";
import { setLocaleSwitchInPlace } from "@/lib/localeInPlace";
import { buildTeaserSummary } from "@/lib/views";
import { toScoringInput } from "@/lib/content/mapping";

/**
 * TASK-018..022: the Stage 1 flow. The nine questions from
 * `survey-spec-template.md`, pathway first, then the teaser chart, reactive off
 * `leads.getSession`, with no contact ask anywhere on screen (FR-004). Answers
 * render optimistically from local state; the server recomputes scores on every
 * write.
 *
 * Pathway is no longer special-cased in this file. It is STAGE1[0] like any
 * other question, and `submitAnswer` mirrors it onto the `leads.pathway` column
 * so the `by_pathway` index stays populated.
 *
 * No client-side storage at all: every visit is a new session. Resume exists
 * only through the magic link, which needs an email and its consent first.
 */

/**
 * The flow, as one sequence. Stage 2 was collapsed into Stage 1 on 14/08/2026.
 *
 * There had been two stages and no principle behind the split: Stage 1 was
 * whatever the retiring quiz used to ask, and Stage 2 meant "everything we did
 * not get to". The moment that was written down it stopped surviving contact
 * with the actual boundary, which is the contact step. Before it, every
 * question is a conversion cost paid by a stranger; after it, questions are
 * nearly free. A second stage on the far side of that boundary is optional by
 * construction, so nothing the business actually needs can live there, which
 * made it the wrong home for the one question that was in it.
 *
 * So there is one flow and one budget. "Which stage does this go in" becomes
 * "does this question earn its place at all", which is a question with an
 * answer.
 *
 * The language grid is a step in the sequence rather than an entry in STAGE1
 * because it is not a QuestionCard: it is one question whose follow-ups depend
 * on its own answer. `FLOW` keeps the engine index-based by holding either a
 * question or that one marker.
 */
const LANGUAGES_STEP = { custom: "languages" } as const;
type FlowStep = (typeof STAGE1)[number] | typeof LANGUAGES_STEP;

/** Straight after English, where a candidate is already thinking about language. */
const ENGLISH_AT = STAGE1.findIndex((q) => q.key === "english");
const FLOW: FlowStep[] = [
  ...STAGE1.slice(0, ENGLISH_AT + 1),
  LANGUAGES_STEP,
  ...STAGE1.slice(ENGLISH_AT + 1),
];

const TOTAL_STEPS = FLOW.length;

/**
 * The photograph for a step in the flow, or null while its block has none.
 *
 * Module level rather than inline, since 17/08/2026, because the loading screen
 * now needs the same answer as the first question. Deriving both from `FLOW`
 * makes "the picture does not change when the first question arrives" true by
 * construction rather than by two call sites agreeing.
 */
function panelFor(item: FlowStep): BlockImage | null {
  const b = blockFor("custom" in item ? "languages" : item.key);
  if (!b?.image) return null;
  return {
    src: `/assess/blocks/${b.image}`,
    // Decorative. The section it marks is already named by the question the
    // candidate is reading, so describing the photograph would put a sentence
    // between them and the question for no gain.
    alt: "",
    // Only the first block preloads. The rest are minutes away.
    priority: b.id === BLOCKS[0].id,
    blurDataURL: b.blurDataURL,
    // Centred unless the photograph says otherwise, which most of them do not.
    focus: b.focus ?? "center",
  };
}

/**
 * Open the screen this renders inside at the top of the page.
 *
 * The third instance of one bug, fixed the same way twice already in
 * `QuestionCard` and `ContactGate`: a step swaps its content without moving the
 * window, so it inherits wherever the previous step was scrolled to. On a phone
 * the contact step is tall enough to be scrolled to its submit button, and the
 * result then opened at roughly its own midpoint, with the headline and the
 * chart above the fold. Reported 17/08/2026.
 *
 * The other two do it in their own `useEffect` on mount. This screen has no
 * component of its own to hang one on, and deriving "am I showing the result"
 * from the render guards would restate them, so instead the reset mounts with
 * the screen and cannot disagree with it.
 *
 * `instant`, for the reason `QuestionCard` gives: a scroll animation on top of
 * a content swap is two motions describing one event.
 */
function ResetScroll() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}

type Answer = string | string[];

const isAnswer = (v: unknown): v is Answer =>
  typeof v === "string" || (Array.isArray(v) && v.every((x) => typeof x === "string"));

/** Set once TASK-046 picks a booking mechanism. The CTA hides until then. */
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

/**
 * The English levels that switch the flow into English. 16/08/2026, Paul's call.
 *
 * B1 and up, which is `stats.ts`'s own bar for "speaks a language" rather than a
 * second definition of the same idea. B2 would be the more cautious line, since
 * B2 is the level European job adverts actually name, and a B1 reader may find
 * the English questions harder than the Thai ones. The revert is what makes B1
 * safe: the cost of being wrong is one tap.
 */
const ENGLISH_SWITCH_AT: readonly string[] = ["B1", "B2", "C1", "C2"];

export default function AssessPage() {
  const { t, pick, path, locale, setLocale } = useCopy();
  const [leadId, setLeadId] = useState<Id<"leads"> | null>(null);
  const [local, setLocal] = useState<Record<string, Answer>>({});
  const [step, setStep] = useState(0); // 0..STAGE1.length-1 = questions, then the contact gate, then the teaser
  /** Which half of the question transition is on screen. See `commit` below. */
  const [phase, setPhase] = useState<"entering" | "leaving">("entering");
  /**
   * The English switch, at most once per session.
   *
   * `offered` latches on the first fire and is never cleared, so going back and
   * changing the English answer cannot bring the panel back. A prompt that
   * returns after being dismissed stops being an offer.
   */
  const [englishPrompt, setEnglishPrompt] = useState<{ open: boolean; offered: boolean }>({
    open: false,
    offered: false,
  });

  /**
   * A deliberate floor on how fast the first question can appear, 14/08/2026.
   *
   * `startSession` usually resolves in well under 200ms, so tapping the CTA
   * swapped one screen for another with no beat in between and read as a
   * mis-tap rather than a start. The pause is doing honest work: it says a
   * session was created and something is being prepared, which is true.
   *
   * A floor, not a delay added on top. If the mutation is slow the wait is the
   * mutation's, not this; the two overlap rather than stack, so a bad
   * connection never pays twice.
   *
   * 900ms first, raised to 1500ms on Paul's read. The upper bound is the PRD
   * § 1 budget of 90 seconds from landing to first read, which this spends
   * 1.5s of, so there is room but not unlimited room.
   */
  const [minWaitDone, setMinWaitDone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinWaitDone(true), 1500);
    return () => clearTimeout(id);
  }, []);

  const startSession = useMutation(api.leads.startSession);
  const submitAnswer = useMutation(api.leads.submitAnswer);
  const captureContact = useMutation(api.leads.captureContact);
  const submitLanguages = useMutation(api.leads.submitLanguages);
  const [startFailed, setStartFailed] = useState(false);
  /** Bumping this re-runs the session effect, which is what Try again does. */
  const [attempt, setAttempt] = useState(0);
  const session = useQuery(api.leads.getSession, leadId ? { leadId } : "skip");

  // Always a new session. Nothing about the candidate is stored on their
  // device: no cookie, no localStorage, no identifier of any kind before they
  // have consented to anything.
  //
  // US-001's acceptance criteria require this in as many words: closing the tab
  // mid-flow without giving an email must leave no recoverable lead. Resume is
  // the magic link's job (FR-011), and that only exists once an email and its
  // consent do.
  useEffect(() => {
    // A rejection here is usually the rate limit (TASK-039) or a dropped
    // connection. Without this the promise fails silently and the candidate
    // watches the loading line forever, which reads as a broken app rather
    // than a busy one.
    // The landing query string, handed over verbatim and parsed server-side.
    //
    // This used to send the literal "direct" on every session and never look at
    // the URL, so every app-native lead in the database claims the same origin
    // and none of those claims mean anything. A job post link carrying
    // `?src=fb&job=<job-log id>` is now recoverable all the way back to the post
    // that produced the lead.
    //
    // Read at call time rather than from a hook: this runs once per session and
    // `useSearchParams` would opt the whole route into a Suspense boundary for
    // a value that is already sitting on `location`.
    const search = typeof window === "undefined" ? "" : window.location.search;
    void startSession({ search })
      .then(setLeadId)
      .catch(() => setStartFailed(true));
  }, [startSession, attempt]);

  /**
   * Resume position from server state on reload. Runs once: after that, local
   * state is ahead of the server and must not be overwritten by it.
   *
   * Adjusted during render rather than in an effect, 16/08/2026. The effect
   * version was a visible bug as well as a lint error: it painted question one,
   * then jumped to wherever the candidate actually was, so a returning
   * candidate saw a question they had already answered flash past.
   */
  const [resumed, setResumed] = useState(false);
  if (session && !resumed) {
    setResumed(true);
    const answers = Object.fromEntries(
      Object.entries(session.responses).filter(([, v]) => isAnswer(v)),
    ) as Record<string, Answer>;
    if (Object.keys(answers).length > 0) {
      setLocal(answers);
      const answered = STAGE1.filter((q) => answers[q.key] !== undefined).length;
      setStep(Math.min(answered, TOTAL_STEPS));
    }
  }

  /**
   * Hide the site menu for as long as leaving would cost the candidate their
   * answers, TASK-085.
   *
   * The condition is the flow's own two facts, not a route match: still inside
   * the questions, or through them but not yet past the contact step. After
   * that the session is a real lead with an email, the result is on screen, and
   * navigating away loses nothing, so the menu comes back.
   *
   * Publishing to an external store from an effect is the intended direction
   * for `useSyncExternalStore`, and the cleanup releases the lock on unmount so
   * a candidate who leaves by any other means cannot strand the menu hidden.
   */
  const navLocked = step < FLOW.length || session?.status === "partial";
  useEffect(() => {
    setNavLocked(navLocked);
    return () => setNavLocked(false);
  }, [navLocked]);

  /**
   * Make the language toggle switch in place rather than navigate, 17/08/2026.
   *
   * For the whole time this page is mounted, and not on `navLocked`'s
   * condition. That one releases at the contact step, because after it the lead
   * is saved and leaving costs nothing. This is about a different loss: the
   * candidate's view of their own result, which is held in this component's
   * state and is unrecoverable from the browser, since resume needs a magic
   * link. Switching language on the result screen pushed to the other tree,
   * unmounted this, and started a new session at question one. That is the bug
   * this fixes; `localeInPlace.ts` carries the rest of the reasoning.
   */
  useEffect(() => {
    setLocaleSwitchInPlace(true);
    return () => setLocaleSwitchInPlace(false);
  }, []);

  const scores = useMemo(() => session?.scores ?? {}, [session]);

  /**
   * The lowest scored axis, which aims the services link and nothing else.
   *
   * It is a hint about which section of `/services` to open on, not a verdict:
   * the page highlights one card and shows all three regardless. Undefined
   * scores are skipped rather than treated as zero, because a hollow marker
   * means "not measured", which is the distinction the chart caption makes and
   * this must not quietly contradict.
   */
  const weakest = useMemo(() => {
    let key: string | null = null;
    let low = Infinity;
    for (const [k, v] of Object.entries(scores)) {
      if (typeof v === "number" && v < low) {
        low = v;
        key = k;
      }
    }
    return key;
  }, [scores]);

  // Selected from the sentence bank, never composed. Recomputed client-side
  // from the same responses the server scored, so the words and the chart
  // cannot disagree.
  const summary = useMemo(
    () =>
      session
        ? buildTeaserSummary(
            toScoringInput(session.responses),
            session.pathway as Parameters<typeof buildTeaserSummary>[1],
            locale,
          )
        : null,
    [session, locale],
  );

  /**
   * The wait is already the split, 17/08/2026, on Paul's read.
   *
   * This was a centred column, so the assessment opened as one narrow thing in
   * the middle of a wide screen and then rebuilt itself into a two-column layout
   * the moment the first question arrived. The candidate's first impression of
   * the product was a page changing shape under them.
   *
   * It is the first question's own photograph, taken from `FLOW[0]` rather than
   * named here, so nothing moves at the handover: the panel is already painted
   * and only the right-hand column changes. It is also the block that carries
   * `priority`, so the 1.5s floor below is spent fetching a picture the
   * candidate is about to need rather than waiting in front of an empty panel.
   *
   * Below `expanded` the panel hides itself, exactly as it does for the
   * questions, and this stays the centred column it always was on a phone.
   */
  if (!leadId || !minWaitDone) {
    return (
      <BlockPanel image={panelFor(FLOW[0])}>
      {/* The same width and padding as `QuestionCard`'s own wrapper, so the
          column the message sits in is the column the question will sit in. */}
      <div className="w-full max-w-md px-6 py-8 text-center">
        {startFailed ? (
          <>
            <p className="text-body-large text-on-surface-variant">{t("assess.busy")}</p>
            <button
              type="button"
              onClick={() => {
                setStartFailed(false);
                setAttempt((n) => n + 1);
              }}
              className="mt-6 h-12 btn-filled px-7 text-label-large"
            >
              {t("assess.retry")}
            </button>
          </>
        ) : (
          <>
            {/* Back to the spinner, 17/08/2026, on Paul's call. The mascot
                stood here from 16/08/2026 on the argument that a character
                arriving is more interesting motion than a ring, which it is, and
                that is not what a loading state is for: a 420px illustration is
                the largest thing on the screen at the moment the candidate is
                waiting to be asked a question.

                The requirement the mascot inherited is unchanged and this still
                meets it. Something has to move, or the pause reads as a stall
                rather than as work.

                Roles rather than the literals this markup carried before the
                rebrand: it was `border-neutral-300 border-t-eufit`, and `eufit`
                does not exist any more. Inside the assessment's scope `primary`
                IS the product's blue, so the ring picks up EU Fit Check's colour
                without naming it, which is what the scope is for.

                `mascot-in` in `globals.css` still has a second caller at the end
                of the flow, so it stays. */}
            <div
              role="presentation"
              className="mx-auto mb-5 block size-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
            />
            <p className="text-body-large text-on-surface-variant" role="status">
              {t("assess.starting")}
            </p>
          </>
        )}
      </div>
      </BlockPanel>
    );
  }

  // The question sequence (TASK-019/020), now including the language grid.
  if (step < FLOW.length) {
    const item = FLOW[step];

    /**
     * The English switch panel, rendered by both branches below.
     *
     * It has to be in both, and that is not tidiness: `commit` advances the step
     * roughly half a second after the answer, and the step straight after the
     * English question is the language grid, which is the other branch. Mounting
     * it only where it fires meant it unmounted before anyone saw it. It is
     * `fixed inset-0`, so where in the tree it sits changes nothing else.
     */
    const dialog = englishPrompt.open ? (
      <EnglishSwitchPrompt
        onStay={() => setEnglishPrompt((p) => ({ ...p, open: false }))}
        onRevert={() => {
          setLocale("th");
          setEnglishPrompt((p) => ({ ...p, open: false }));
        }}
      />
    ) : null;

    /**
     * The photograph for whatever the flow is showing.
     *
     * Computed here rather than inside the card, and `BlockPanel` is mounted
     * outside the keyed `QuestionCard`, so it survives every answer. The first
     * version put the panel inside the card, which the page keys on the
     * question, so it remounted on every tap and its crossfade could never run.
     */
    const panel = panelFor(item);

    if ("custom" in item) {
      return (
        <>
        {dialog}
        <BlockPanel image={panel}>
        <LanguageGrid
          // Skip writes an empty grid rather than nothing. "I speak no other
          // European language" is an answer, and it is a different fact from
          // "never reached this question": the first lets Country Reach stand
          // on English honestly, the second leaves it unmeasured.
          onSubmit={async (levels) => {
            await submitLanguages({ leadId, levels });
            setStep(step + 1);
          }}
          onSkip={async () => {
            await submitLanguages({ leadId, levels: {} });
            setStep(step + 1);
          }}
          step={step + 1}
          total={TOTAL_STEPS}
          onBack={() => setStep(step - 1)}
          hasPanel={Boolean(panel)}
        />
        </BlockPanel>
        </>
      );
    }

    const q = item;
    /**
     * Hold, then leave, then advance.
     *
     * The write goes out immediately; only the screen waits. A candidate who
     * closes the tab during the 460ms still has their answer saved, which is
     * the whole reason the two are not sequenced together.
     *
     * Durations are read from the stylesheet rather than repeated here, so
     * `--q-hold` and `--q-out` stay the single definition and a reduced-motion
     * user gets whatever those resolve to for them.
     */
    const commit = (value: Answer) => {
      void submitAnswer({ leadId, questionKey: q.key, value });

      // "Let's finish this in English." The switch happens here, on the same tap
      // as the answer, so the questions behind the panel have already changed by
      // the time it is read. Thai only: a candidate already reading in English
      // has nothing to be told.
      if (
        q.key === "english" &&
        locale === "th" &&
        !englishPrompt.offered &&
        typeof value === "string" &&
        ENGLISH_SWITCH_AT.includes(value)
      ) {
        setLocale("en");
        setEnglishPrompt({ open: true, offered: true });
      }
      const css = getComputedStyle(document.documentElement);
      /**
       * Read a CSS time as milliseconds, honouring the unit.
       *
       * `parseFloat` alone was a bug and a well-hidden one. The stylesheet says
       * `260ms`; the production minifier rewrites that to the shorter `.26s`,
       * so `parseFloat` returned 0.26 and the hold became a quarter of a
       * millisecond. The transition looked broken in exactly the way Paul
       * described, "too fast, acting weird", and it worked in the source and
       * failed in the build, which is the worst place for a difference to live.
       */
      const ms = (name: string) => {
        const raw = css.getPropertyValue(name).trim();
        const n = parseFloat(raw);
        if (!Number.isFinite(n)) return 0;
        return raw.endsWith("ms") ? n : n * 1000;
      };
      setPhase("leaving");
      window.setTimeout(
        () => {
          setStep(step + 1);
          setPhase("entering");
        },
        ms("--q-hold") + ms("--q-out"),
      );
    };
    return (
      <>
      {dialog}
      <BlockPanel image={panel}>
      <QuestionCard
        key={q.key}
        prompt={pick(q)}
        options={q.options.map((o) => ({ value: o.value, label: pick(o) }))}
        select={q.select}
        selected={local[q.key]}
        step={step + 1}
        total={TOTAL_STEPS}
        phase={phase}
        // The section's photograph, held across every question in the block, so
        // it changes six times across sixteen questions rather than sixteen.
        // Null until one is sourced, which is the norm today.
        hasPanel={Boolean(blockFor(q.key)?.image)}
        onSelect={(value) => {
          setLocal((prev) => ({ ...prev, [q.key]: value }));
          // A "many" question waits for Continue: the scorer should only ever
          // see a complete list, and a per-tap write would score a half-answer.
          if (q.select === "one") commit(value);
        }}
        onContinue={() => {
          const value = local[q.key];
          if (value !== undefined) commit(value);
        }}
        // PRD § 11: a candidate may change a prior answer after moving forward,
        // and the score recomputes rather than the update being discarded.
        // Nothing is unwound on the way back: the previous answer stays stored
        // until they actually replace it.
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
      />
      </BlockPanel>
      </>
    );
  }

  // Contact is the last step of the survey, not a gate on the result.
  //
  // Decided 10/08/2026, and it deliberately reverses PRD FR-004, which had the
  // chart render before any contact field. That mechanic optimised for people
  // finishing; this one optimises for every finisher being reachable, because
  // the full result now arrives through a human rather than a screen.
  if (session && session.status === "partial") {
    return (
      <ContactGate
        totalSteps={TOTAL_STEPS + 1}
        onSubmit={async (values) => {
          await captureContact({ leadId, ...values });
        }}
      />
    );
  }

  // Teaser (TASK-021/022): chart only, no contact ask on this screen.
  //
  // Redesigned 16/08/2026 against Paul's mockup. Four things changed and each
  // one is a decision rather than a layout preference:
  //
  // - **The chart is a card with a title and a legend.** A radar is a shape,
  //   not a reading, and it was previously the only thing on the screen
  //   carrying the four numbers.
  // - **The mascot moved into the middle**, between the read and the strength
  //   line, and is the coach pose rather than the star. It now sits where the
  //   page needs a breath rather than at the top competing with the headline.
  // - **The next-action line lost its card.** Same words, no panel, because the
  //   screen had three coloured boxes stacked and the queue message is the one
  //   that has to be unmissable.
  // - **The pipeline figure arrived** directly above the services card, since it
  //   is the only proof on this screen about work PunProfile has actually done.
  //
  // **The desktop layout, added the same day.** Everything above describes a
  // phone, which is where this audience actually is, and the page was one 448px
  // column no matter how wide the window got. That is not neutral on a laptop:
  // it reads as a phone screenshot pasted into a browser, and this screen is
  // asking to be taken seriously. From `lg` it becomes two columns, chart beside
  // the read, and the three community facts sit in a row rather than a stack.
  //
  // The order still degrades to exactly the phone order, because the sequence
  // is an argument: chart, what it says about you, what to do, what happens
  // next, who else is here, what we have read. Nothing is moved on desktop that
  // would break that; only the shape changes.
  return (
    <div className="mx-auto w-full max-w-md px-6 py-10 text-center large:max-w-5xl large:px-8 large:py-16">
      <ResetScroll />
      <h1 className="text-headline-large text-on-tertiary-container large:text-display-small">{t("teaser.headline")}</h1>
      <p className="mt-2 text-body-large text-on-surface-variant large:text-body-large">{t("teaser.selfReported")}</p>

      {/* Chart and read, side by side from `lg`.
          **`items-stretch` since 17/08/2026, reversing the note that used to
          sit here.** It said the read was shorter than the chart card for most
          profiles, so a white card grown to match would be mostly empty. The
          read has since gained the mascot, the strength line, the next action
          and the queue notice, and it is now the taller of the two by a long
          way: the chart card stopped short and the section had a ragged floor.
          Matching them is what makes the two columns read as one row. */}
      <div className="large:mt-12 large:grid large:grid-cols-2 large:items-stretch large:gap-10">
        {/* The chart gets its own surface. The radar's grid is 1px neutral-300
            and the field's gradient moves through the same value range, so on
            the field alone the grid reads as noise rather than as structure. */}
        <div className="card-outlined mt-6 rounded-large px-4 py-6 text-left large:mt-0 large:px-6 large:py-7">
          <h2 className="text-title-large text-on-tertiary-container">{t("teaser.chart.heading")}</h2>
          <SpiderChart scores={scores} variant="teaser" />
          <div className="mt-2 border-t border-outline-variant pt-5">
            <ScoreLegend scores={scores} />
          </div>
        </div>

        <div className="large:pt-2">
          {/* The personalized read. Every sentence is selected from the bank in
              `narrative-copy.ts` by the candidate's own scores, so nothing here
              can claim more than the answers support. */}
          {summary && (
            <div className="mt-8 space-y-4 text-left large:mt-0">
              <p className="text-title-medium text-on-surface">{summary.opener}</p>
              <p className="text-body-large text-on-surface-variant">{summary.standing}</p>
            </div>
          )}

          {/* The report pose, replacing the coach pose on Paul's call,
              17/08/2026. The character now holds a clipboard, which is what this
              screen is: a read of the candidate's answers rather than a greeting.

              It sits here rather than at the top because the page has just made
              its two densest claims and the reader needs a beat before the next
              one. Smaller on desktop, where it shares a column with the text
              rather than getting the full width to itself.

              **Already transparent, so no cutout was needed**, unlike the earlier
              poses that `scripts/lib/mascot-cutout.py` exists for. It was cropped
              to its own content: the supplied file is 578x432 with the character
              occupying 333x299 in the middle, and rendering the padded canvas
              would have shown the character at three quarters of the size the
              `max-w` here asks for while its neighbours kept theirs.

              The ratio changed from 1.11 tall-ish to wider, so the box is set
              from the cropped file rather than carried over. */}
          <Image
            src="/assess/mascot/report.png"
            alt=""
            width={333}
            height={299}
            priority
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 320px, 260px"
            className="mascot-in mx-auto my-6 w-full max-w-[300px] large:my-7 large:max-w-[260px]"
          />

          {summary && (
            <div className="space-y-3 text-left">
              {summary.strengthLead && (
                <p className="text-title-medium text-on-surface">{summary.strengthLead}</p>
              )}
              {/* The most actionable sentence on the screen, and no longer in a
                  panel of its own. Three stacked coloured boxes meant none of
                  them read as important; the label carries the emphasis. */}
              {summary.next && (
                <p className="text-body-large text-on-surface-variant">
                  <span className="font-semibold text-on-tertiary-container">{summary.nextLead} </span>
                  {summary.next}
                </p>
              )}
              {summary.unmeasured && (
                <p className="text-body-medium text-on-surface-variant">{summary.unmeasured}</p>
              )}
            </div>
          )}

          {/* Contact is already in by the time this renders, so this says what
              happens next rather than asking for anything. It stays inside the
              read's column on desktop: it is the end of that thought, and full
              width would make a queue notice the widest thing on the page. */}
          <div className="card-tonal mt-6 flex items-start gap-3 rounded-large px-5 py-4 text-left">
            <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 size-5 shrink-0 fill-primary">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM13.25 17h-2.5v-6.5h2.5V17Z" />
            </svg>
            <div>
              <p className="text-body-large text-on-surface">{t("teaser.nextStep")}</p>
              {/* The card stops being a notice and becomes the ask, 17/08/2026.
                  `copy.ts` says why the line changed; this is the half that makes
                  the new last sentence actionable, since "tell us" with nothing to
                  tap is worse than the queue notice it replaced.

                  `/contact` and not `/services`: the reader has just been told to
                  say something, and the services page is a page about us. The
                  result screen's declared primary in `cta.ts` is still `services`
                  and still renders further down, which is the framework working
                  rather than being bypassed: one primary action per view, and this
                  is a link inside a card rather than a second filled button. */}
              <Link
                href={path(DESTINATIONS.contact.href)}
                className="mt-2 inline-block text-body-large text-primary underline underline-offset-2"
              >
                {pick(DESTINATIONS.contact.label)}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TASK-083. Facts about everyone who has taken this and one about the
          candidate, so the screen after the queue message has something on it
          other than waiting. Renders nothing at all until each statistic
          clears its own sample floor. */}
      <CommunityStats scores={scores} />

      {/* The pipeline figure and the services card it earns, side by side from
          `lg`: the proof and the action it is there to justify, which is the
          one pairing on this page that gains from being read at once. */}
      <div className="large:mt-6 large:grid large:grid-cols-2 large:items-stretch large:gap-6">
        <MarketProof />

        {/* TASK-084. The second action on this screen, and deliberately not a
            second booking button: the candidate has just been told there is a
            queue, so what they can usefully do now is read what the work is.
            Secondary treatment throughout, because when TASK-046 turns the
            booking CTA on below, that one is the revenue step. */}
        <div className="card-outlined mt-4 flex flex-col rounded-large px-5 py-6 text-left large:mt-4">
          <h2 className="text-title-large">{t("services.cta.heading")}</h2>
          <p className="mt-2 text-body-large text-on-surface-variant">{t("services.cta.body")}</p>
          {/* Still hand-rolled, and the one deliberate exception to the table:
              this link carries `?focus=` so the services page opens on the axis
              the candidate scored lowest, which no shared component can know.
              It is the table's `/efc-assessment-result` primary in every other respect,
              including its destination.

              **Teal, from 16/08/2026.** It was Terracotta until the percentile
              block took that colour on Paul's call. Two Terracotta elements on
              one view is the thing `design.md` warns about, and of the two the
              stat block is the one he wants loud. `mt-auto` keeps the button on
              the card's floor so it lines up with the card beside it. */}
          <Link
            href={path(weakest ? `/services?focus=${weakest}` : "/services")}
            className="btn-tonal mt-5 inline-flex min-h-14 items-center justify-center gap-2 px-7 py-4 text-body-large font-semibold large:mt-auto large:self-start"
          >
            {t("services.cta.button")}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* TASK-046. Hidden until a booking mechanism exists, rather than
          shipping a button that goes nowhere. */}
      {/* When TASK-046 turns this on, this screen will hold two Terracotta
          actions and one of them has to give way. The booking CTA wins, since
          it is the revenue step; the language offer drops to a secondary
          treatment at that point rather than both shouting. */}
      {BOOKING_URL && (
        <div className="mt-8 text-left">
          <h2 className="text-title-large">{t("narrative.cta.heading")}</h2>
          <p className="mt-2 text-body-large text-on-surface-variant">{t("narrative.cta.body")}</p>
          <a
            href={BOOKING_URL}
            className="mt-4 inline-block btn-filled px-7 py-3.5 text-label-large"
          >
            {t("narrative.cta.button")}
          </a>
        </div>
      )}
      {/* Without this the chart is a dead end, and PRD § 11 allows changing an
          answer after moving forward. Quiet, and below the chart, so it never
          competes with the reveal. */}
      <button
        type="button"
        onClick={() => setStep(STAGE1.length - 1)}
        className="mt-6 rounded-small px-2 py-1 text-body-medium text-on-surface-variant underline underline-offset-2 transition-colors hover:text-on-tertiary-container"
      >
        {t("teaser.revise")}
      </button>
    </div>
  );
}
