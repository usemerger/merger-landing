import MarketingMark from './MarketingMark';

/**
 * Device mockups: a Mac window and an iPhone, tilted in CSS 3D.
 *
 * ═══ HOW TO DROP REAL FOOTAGE IN ═══════════════════════════════════════════
 *
 * Every screen is a slot. Pass `media` and the placeholder disappears:
 *
 *   <MacWindow title="Merger — Inbox"
 *              media={{ src: '/showcase/inbox.png', alt: 'The unified inbox' }} />
 *
 *   <MacWindow title="Merger — Deal Desk"
 *              media={{ src: '/showcase/deals.mp4', poster: '/showcase/deals.jpg',
 *                       alt: 'Deals being filed as messages arrive' }} />
 *
 * A `src` ending in .mp4 or .webm renders a muted, looping, inline <video>;
 * anything else renders an <img>. Both are `object-fit: cover` inside a box
 * with a fixed aspect ratio, so swapping footage in cannot move the page.
 * That is the entire seam — no other file needs to change.
 *
 * Until then each slot renders a PLACEHOLDER, and it is meant to look like
 * one: a navy gradient, the Merger gem at low opacity, and a "Preview" tag.
 * Nothing here imitates the product. A mockup that shows invented screenshots
 * is worse than an empty frame, because the empty frame cannot mislead anyone
 * about what the app does.
 *
 * ═══ WHY CSS 3D AND NOT A REAL 3D DEVICE ═══════════════════════════════════
 *
 * A perspective-transformed frame is what the reference sites actually ship,
 * and it costs one composited transform. A live GLTF device would mean another
 * WebGL context on a page that already spends ~620ms evaluating Three.js for
 * the hero — and this page sits exactly on the threshold where that evaluation
 * splits into one long task instead of two. So: no new JavaScript at all.
 * These are server components; the tilt, the depth and the scroll parallax are
 * CSS, and the parallax uses `animation-timeline: view()`, which does nothing
 * on browsers that lack it and costs nothing on the ones that have it.
 *
 * If a genuinely rotatable device is ever wanted — drag to spin, not just a
 * fixed tilt — that is a real 3D object and a different piece of work. It
 * would want the hero's Three.js context reused rather than a second one.
 */

const VIDEO = /\.(mp4|webm)$/i;

/** The swappable screen. Real media if given; an honest placeholder if not. */
function ScreenSlot({ media, tag = 'Preview', note }) {
  if (media?.src) {
    return VIDEO.test(media.src)
      ? <video className="dv-media" src={media.src} poster={media.poster} aria-label={media.alt}
               autoPlay muted loop playsInline preload="metadata" />
      : <img className="dv-media" src={media.src} alt={media.alt || ''} loading="lazy" decoding="async" />;
  }
  return (
    <div className="dv-placeholder" role="img" aria-label={`${note || 'Product screen'} — placeholder, real footage to follow`}>
      <MarketingMark size={64} className="dv-watermark" />
      <span className="dv-tag">{tag}</span>
      {note && <span className="dv-note">{note}</span>}
    </div>
  );
}

/**
 * A Mac window. The traffic lights are decorative and marked as such — three
 * dots that announce themselves to a screen reader are three pieces of noise.
 */
export function MacWindow({ media, title = 'Merger', note, className = '', tilt = 'left' }) {
  return (
    <div className={`dv-stage dv-stage-${tilt} ${className}`.trim()}>
      <div className="dv-mac">
        <div className="dv-mac-bar">
          <span className="dv-lights" aria-hidden="true"><i /><i /><i /></span>
          <span className="dv-mac-title">{title}</span>
        </div>
        <div className="dv-screen"><ScreenSlot media={media} note={note} /></div>
      </div>
      <span className="dv-shadow" aria-hidden="true" />
    </div>
  );
}

/**
 * An iPhone. Labelled as forthcoming, because iOS is not shipped — a phone
 * mockup with no caveat on a page selling a Windows alpha is a promise.
 */
export function PhoneFrame({ media, note = 'iOS in progress', className = '' }) {
  return (
    <div className={`dv-stage dv-stage-phone ${className}`.trim()}>
      <div className="dv-phone">
        <span className="dv-island" aria-hidden="true" />
        <div className="dv-screen dv-screen-phone"><ScreenSlot media={media} tag="Soon" note={note} /></div>
      </div>
      <span className="dv-shadow dv-shadow-phone" aria-hidden="true" />
    </div>
  );
}
