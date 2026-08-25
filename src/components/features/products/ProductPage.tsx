"use client";

/**
 * One template for every product page. Added 23/08/2026.
 *
 * A template rather than five hand-built pages because these five genuinely are
 * parallel: same question in the headline, same three-point mechanism, same
 * limit, same single action. Where two of them stop being parallel they should
 * leave this file rather than grow a flag inside it, which is why `/coaching`
 * was never folded in: it carries a founder section and three service cards and
 * would have cost more in exceptions than it saved in duplication.
 *
 * **The `soon` line is what makes shipping an unbuilt product's page honest.** It
 * is not a disclaimer at the bottom; it sits directly under the name, before the
 * reader has invested anything in reading, and the action underneath opens a
 * conversation rather than a dead button.
 */

import { useCopy } from "@/components/LocaleProvider";
import CallToAction from "@/components/CallToAction";
import Band from "@/components/Band";
import { HERO_HEADING, SECTION_HEADING } from "@/lib/content/footer";
import {
  COMING_SOON,
  HOW_HEADING,
  LIMIT_HEADING,
  type Product,
} from "@/lib/content/products";

export default function ProductPage({ product }: { product: Product }) {
  const { pick, locale } = useCopy();

  return (
    <div className="w-full">
      <Band ground="canvas">
      <p className="text-heading-xs text-mute-strong">{pick(product.name)}</p>

      {product.status === "soon" && (
        <p className="mt-2 inline-flex rounded-full bg-primary-pale px-3 py-1 text-body-sm-strong text-on-primary-pale">
          {pick(COMING_SOON)}
        </p>
      )}

      {/* The problem, not the feature. A page that opens on what the product IS
          asks a stranger to care about the product first; one that opens on what
          went wrong hands them their own experience. */}
      <h1 className={`mt-4 text-balance ${HERO_HEADING(locale)}`}>{pick(product.headline)}</h1>
      <p className="mt-5 text-body-large text-on-surface-variant">{pick(product.lede)}</p>

      <CallToAction page={product.actionsKey} className="mt-8" show="primary" />
      </Band>

      {/* --------------------------------------------------------- how ---- */}
      <Band ground="soft">
        <h2 className={SECTION_HEADING(locale)}>{pick(HOW_HEADING)}</h2>
        <ul className="mt-5 flex flex-col gap-4">
          {product.how.map((item, i) => (
            <li key={i} className="flex gap-4 text-body-large text-on-surface">
              <span
                aria-hidden
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-canvas text-body-sm-strong text-on-primary"
              >
                {i + 1}
              </span>
              <span>{pick(item)}</span>
            </li>
          ))}
        </ul>
      </Band>

      {/* ------------------------------------------------------- limit ---- */}
      {/* Its own block with its own heading rather than a line of small print.
          Several of these carry a standing decision (the app does not rewrite
          CVs; PunProfile is not a recruiter), and a decision that only appears
          as a footnote is one nobody reads before they buy. */}
      <Band ground="canvas">
        <div className="card-plain border border-line px-8 py-9">
          <h2 className="text-heading-sm">{pick(LIMIT_HEADING)}</h2>
          <p className="mt-3 text-body-large text-on-surface-variant">{pick(product.limit)}</p>
        </div>
      </Band>

      {/* --------------------------------------------------------- faq ---- */}
      {product.faq.length > 0 && (
        <Band ground="soft">
          {product.faq.map((item, i) => (
            <div key={i} className="border-b border-line py-6 last:border-b-0">
              <h3 className="text-heading-sm">{pick(item.q)}</h3>
              <p className="mt-3 text-body-large text-on-surface-variant">{pick(item.a)}</p>
            </div>
          ))}
        </Band>
      )}

      {/* The same action as the top, once more at the foot. Rule 1 in `cta.ts`
          allows one action to repeat; a reader who got this far arrived at the
          decision here rather than at the headline. */}
      <Band ground="dark" align="center" className="text-center">
        <CallToAction page={product.actionsKey} align="center" show="primary" />
      </Band>
    </div>
  );
}
