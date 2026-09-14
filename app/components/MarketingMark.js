/**
 * The Merger mark — the glossy-black faceted gem.
 *
 * WHY AN <img> AND NOT INLINE SVG. The asset is 51 paths, and it appears in the
 * nav, the hero card, the footer and the final CTA. Inlining it four times puts
 * the same 6.6KB into the HTML on every page for no benefit; as a file it is
 * fetched once and cached.
 *
 * WHY THE BRASS RIM (see .mk-mark in landing.css). The mark is near-black
 * facets separated by transparent bevels. On a white page those bevels read as
 * white lines and the gem is legible; on Merger's ink background they read as
 * ink, the facets are within a few percent of the backdrop, and the logo very
 * nearly disappears. The rim puts the light back where the artwork assumed a
 * light page would provide it.
 */
export default function MarketingMark({ size = 29, hover = false, className = '' }) {
  return (
    <span
      className={`mk-mark ${hover ? 'mk-mark-hover' : ''} ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src="/merger-logo.svg" alt="" width={size} height={size} draggable="false" />
    </span>
  );
}
