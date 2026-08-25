"use client";

/**
 * How to reach PunProfile. TASK-088, stripped back 14/08/2026.
 *
 * The page is a heading, a line of context, two buttons and a footnote. That is
 * the whole thing.
 *
 * It had three cards under the buttons, one per channel, each repeating a
 * destination the buttons already offered. Written down like that it is
 * obviously wrong: a contact page whose primary action is "get in touch" does
 * not need a second copy of every way to get in touch directly beneath it. The
 * cards were describing the channels rather than opening them, and describing a
 * channel is only useful when there are enough of them to need choosing
 * between. There are two.
 *
 * **The EU Fit Check is not on this page.** Someone who navigated to Contact
 * has decided to make contact, and answering them with a questionnaire answers
 * a question they did not ask. Rule 3 of the framework in
 * `src/lib/content/cta.ts`.
 *
 * **Email and LINE are one action, not two** (rule 2). Both cost the reader the
 * same thing, so they are routes rather than a fork. LINE carries its own green
 * and mark under rule 5's one exception, because a Thai reader finds that green
 * faster than they read either label.
 *
 * **The booking link is deliberately absent.** `00_Quick_Facts.md` marks
 * `calendly.com/paul-bussabong/30min` "Gated, not public. It is sent 1:1 only".
 * A contact page is about as public as a link gets. TASK-046.
 *
 * The Facebook group went with the cards. It has no URL on record anywhere in
 * the coaching repo, so it was rendering as unclickable text: a channel that
 * cannot be opened is not a channel, and this page is only for channels.
 */

import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import Band from "@/components/Band";
import { HERO_HEADING } from "@/lib/content/footer";
import {
  CONTACT_ALREADY_IN_QUEUE,
  CONTACT_CHANNELS,
  CONTACT_HEADING,
  CONTACT_INTRO,
} from "@/lib/content/contact";

export default function ContactPage() {
  // The words moved into `src/lib/content/contact.ts` on 16/08/2026, when the
  // page's title and meta description became a third and fourth reader of them.
  const { pick, locale } = useCopy();

  return (
    <div className="w-full">
      <Band ground="canvas">
        <h1 className={HERO_HEADING(locale)}>{pick(CONTACT_HEADING)}</h1>
        <p className="mt-4 text-body-large text-on-surface-variant">{pick(CONTACT_INTRO)}</p>
      </Band>

      <Band ground="soft">
        <CallToAction page="/contact" />

        <p className="mt-5 text-body-medium text-on-surface-variant">{pick(CONTACT_CHANNELS)}</p>

        <p className="mt-10 text-body-medium text-on-surface-variant">
          {pick(CONTACT_ALREADY_IN_QUEUE)}
        </p>
      </Band>
    </div>
  );
}
