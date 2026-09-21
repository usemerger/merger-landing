/**
 * The Merger mark — solid gold, one path, `currentColor`.
 *
 * WHAT THIS REPLACES, AND WHY THE OLD REASONING NO LONGER APPLIES. This used
 * to be an <img> pointing at a 51-path glossy-black gem, with a stack of gold
 * drop-shadows behind it in landing.css. That rim was never a design choice —
 * it was a rescue. The artwork is near-black facets separated by TRANSPARENT
 * bevels, drawn for a light page where those bevels read as white lines. On
 * Merger's ink background they read as ink, the facets sit within a few
 * percent of the backdrop, and the logo all but vanished; the rim put the
 * light back where the artwork had assumed the page would provide it.
 *
 * The approved direction is a gold mark, so the whole problem disappears: a
 * gold logo on ink needs nothing behind it to be seen. The rim and the
 * separate hover artwork are gone with it.
 *
 * INLINE, NOT AN <img>, because `currentColor` is the point. A single
 * monochrome path costs ~370 bytes, so the old argument against inlining it
 * four times (6.6kB of 51 paths per appearance) no longer holds, and inlining
 * buys two things a file cannot: the colour follows CSS, so hover and any
 * future surface can retint it without a second asset; and it cannot 404.
 *
 * The geometry is the approved mark from the Singularity handoff, unchanged.
 */

/** The approved gold. Also mirrored by --mark-gold in landing.css. */
const GOLD = '#d7b777';

export default function MarketingMark({ size = 29, hover = false, className = '' }) {
  return (
    <span
      className={`mk-mark ${hover ? 'mk-mark-hover' : ''} ${className}`.trim()}
      style={{ width: size, height: size, color: GOLD }}
      aria-hidden="true"
    >
      {/* 80x100 artwork in a square box: preserveAspectRatio keeps it centred
          and un-stretched at whatever `size` the caller asks for. */}
      <svg
        viewBox="0 0 80 100"
        width={size}
        height={size}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="m40 4-17 48 17 4 17-4L40 4Zm-4 2L4 42l16 10L36 6Zm8 0 32 36-16 10L44 6ZM6 46l14 10 16 36L6 46Zm17 11 15 3v36L23 57Zm19 3 15-3-15 39V60Zm18-4 14-10-30 46 16-36Z"
        />
      </svg>
    </span>
  );
}
