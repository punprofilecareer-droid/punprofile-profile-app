"use client";

/**
 * The page an unsubscribe link lands on. 16/08/2026.
 *
 * It acts on arrival and shows the result. There is no confirm button, because
 * a second click for somebody who has already said what they want is friction
 * pointed at the one thing you must never make hard, and because the action is
 * harmless and reversible: the worst case is that a link prefetcher stops email
 * nobody had asked to keep, and the page says how to start again.
 *
 * **It always says the same thing.** A bad token, an expired one and a live one
 * all end here, and the mutation reports nothing back. Telling a caller which
 * tokens exist is a courtesy owed to nobody, and a reader who followed a link
 * from their own inbox is not helped by learning that it had already been used.
 *
 * The one thing it is careful to say is that this is not a deletion.
 * `data-inventory.md` records that as its own rule and the reason is concrete:
 * conflating the two would erase someone who only asked to stop being messaged.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCopy } from "@/components/LocaleProvider";
import {
  UNSUBSCRIBE_BODY,
  UNSUBSCRIBE_HEADING,
  UNSUBSCRIBE_RESTART,
  UNSUBSCRIBE_WORKING,
} from "@/lib/content/blog";

export default function Unsubscribe({ token }: { token: string }) {
  const { pick, path } = useCopy();
  const unsubscribe = useMutation(api.marketing.unsubscribe);
  const [done, setDone] = useState(false);
  // React runs effects twice in development. The mutation is idempotent, so a
  // second call is harmless, but firing it is still noise in the log.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Settled either way. A failure here means the request did not reach the
    // server, and there is nothing a reader can do about that from this page;
    // the address in the privacy notice is the fallback the notice already
    // promises.
    unsubscribe({ token }).finally(() => setDone(true));
  }, [unsubscribe, token]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      {!done ? (
        <p className="text-body-lg text-slate">{pick(UNSUBSCRIBE_WORKING)}</p>
      ) : (
        <>
          <h1 className="text-h2">{pick(UNSUBSCRIBE_HEADING)}</h1>
          <p className="mt-5 text-body-lg text-slate">{pick(UNSUBSCRIBE_BODY)}</p>
          <p className="mt-8 text-body text-slate">
            {pick(UNSUBSCRIBE_RESTART)}{" "}
            <Link
              href={path("/blog")}
              className="text-primary underline underline-offset-2"
            >
              /blog
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
