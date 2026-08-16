/**
 * A structured-data block. 16/08/2026.
 *
 * Schema.org JSON-LD is how a search engine, and an answer engine more so,
 * learns what a page IS rather than what words are on it. Prose says "career
 * coaching for Thai professionals"; this says `ProfessionalService`, in Thailand,
 * in Thai, published by a named organisation, and a machine can act on the
 * second without reading the first.
 *
 * A server component with no `"use client"`, so the script is in the HTML the
 * crawler receives rather than written in by React after hydration. That is the
 * entire requirement: a crawler that does not run JavaScript sees nothing
 * otherwise, and several of the AI retrieval agents named in `robots.ts` do not.
 *
 * `JSON.stringify` and not a template string. The one way to break a page with
 * this tag is a `</script>` sequence inside a string value, which ends the block
 * early and spills the rest into the document; stringify escapes nothing by
 * default, so the forward slash is replaced here explicitly. Cheap, and the
 * alternative is a class of bug that only appears once somebody writes an
 * article about HTML.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
