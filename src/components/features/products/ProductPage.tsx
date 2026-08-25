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
import SplitFeature from "@/components/blocks/SplitFeature";
import Checklist from "@/components/blocks/Checklist";
import { HERO_HEADING, SECTION_HEADING } from "@/lib/content/footer";
import {
  COMING_SOON,
  HOW_HEADING,
  LIMIT_HEADING,
  type Product,
} from "@/lib/content/products";

/**
 * A picture per product page, and it is a placeholder mapping.
 *
 * These are the assessment's own block photographs, which are studio shots of
 * the mascot rather than pictures of the product, because none of the five has
 * art of its own. Each is assigned by what its question is about, so the pairing
 * is not random, but it is a stand-in and should be replaced the day there is
 * real art. `alt` is empty at the call site for the same reason: a decorative
 * stand-in should not be described to a screen reader as if it meant something.
 */
const PRODUCT_ART: Record<string, string> = {
  "eu-fit-check": "/assess/blocks/now.jpg",
  "cv-check": "/assess/blocks/understood.jpg",
  "fit-report": "/assess/blocks/aim.jpg",
  "matched-jobs": "/assess/blocks/go.jpg",
  "guided-job-hunt": "/assess/blocks/bring.jpg",
  default: "/assess/blocks/aim.jpg",
};

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

      {/* --------------------------------------------------------- how ----

          B11: the steps beside a picture rather than a bulleted list on their
          own. It was a numbered list and it is still numbered; what changed is
          that each step gets a hairline and the section gets something to look
          at, which is what the reference does on every page that has to say
          what a product actually does. */}
      <Band ground="soft" width="wide">
        <h2 className={SECTION_HEADING(locale)}>{pick(HOW_HEADING)}</h2>
        <div className="mt-10">
          <SplitFeature src={PRODUCT_ART[product.slug] ?? PRODUCT_ART.default} alt="" reverse>
            <Checklist items={product.how.map((item) => ({ lead: pick(item) }))} />
          </SplitFeature>
        </div>
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
