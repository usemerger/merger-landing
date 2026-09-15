import MarketingMark from './MarketingMark';

/**
 * Device mockups: a Mac window and an iPhone, tilted in CSS 3D, with a
 * monitor/phone toggle between them.
 *
 * ═══ HOW TO DROP REAL FOOTAGE IN ═══════════════════════════════════════════
 *
 * Every screen is a slot. Pass `media` and the placeholder disappears:
 *
 *   <DeviceSwitcher id="inbox" title="Merger — Inbox"
 *     mac={{ src: '/showcase/inbox.png',        alt: 'The unified inbox' }}
 *     phone={{ src: '/showcase/inbox-ios.mp4',  poster: '/showcase/inbox-ios.jpg' }} />
 *
 * A `src` ending in .mp4 or .webm renders a muted, looping, inline <video>;
 * anything else renders an <img>. Both are `object-fit: cover` inside a box
 * with a fixed aspect ratio, so swapping footage in cannot move the page. The
 * desktop and mobile captures are independent — either can land first.
 *
 * Until then each slot renders a PLACEHOLDER, and it is meant to look like
 * one: a navy gradient, the Merger gem at low opacity, and a "Preview" tag.
 * Nothing here imitates the product. A mockup showing invented screenshots is
 * worse than an empty frame, because the empty frame cannot mislead anyone
 * about what the app does.
 *
 * ═══ WHY CSS 3D AND NOT A REAL 3D DEVICE ═══════════════════════════════════
 *
 * A perspective-transformed frame is what the reference sites actually ship,
 * and it costs one composited transform. A live GLTF device would mean another
 * WebGL context on a page that already spends ~620ms evaluating Three.js for
 * the hero — and this page sits exactly on the threshold where that evaluation
 * splits into one long task instead of two. So: no new JavaScript at all.
 * These are server components; the tilt, the depth, the scroll parallax AND
 * the Mac/iOS toggle are CSS.
 *
 * THE TOGGLE IS TWO RADIO INPUTS AND A SIBLING SELECTOR. No state, no client
 * component, no hydration — `:checked ~ .dv-views` swaps which device is
 * shown. It works before JavaScript loads and it works if JavaScript never
 * loads, which for a control that only changes which picture is on screen is
 * strictly better than a React `useState` would be.
 */

const VIDEO = /\.(mp4|webm)$/i;

/** The swappable screen. Real media if given; an honest placeholder if not. */
export function ScreenSlot({ media, tag = 'Preview', note }) {
  if (media?.src) {
    return VIDEO.test(media.src)
      /**
       * `poster` is what removes the black flash: the first frame paints
       * immediately while only metadata is fetched, and the video takes over
       * when it is ready. `preload="metadata"` keeps three 1080p captures from
       * pulling ~1.8MB the moment the page loads for a section most visitors
       * scroll past.
       *
       * `data-motion` marks it for the reduced-motion script below — the one
       * thing CSS cannot do is stop a video autoplaying.
       */
      ? <video className="dv-media" data-motion src={media.src} poster={media.poster}
               aria-label={media.alt} autoPlay muted loop playsInline preload="metadata" />
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

function MonitorIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M9 20.5h6M12 17v3.5" strokeLinecap="round" />
  </svg>;
}
function PhoneIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <rect x="7" y="2.5" width="10" height="19" rx="2.4" /><path d="M10.8 5.4h2.4" strokeLinecap="round" />
  </svg>;
}

/**
 * A Mac window. The traffic lights are decorative and marked as such — three
 * dots that announce themselves to a screen reader are three pieces of noise.
 */
export function MacWindow({ media, title = 'Merger', note, className = '', tilt = 'left', chrome = null }) {
  return (
    <div className={`dv-stage dv-stage-${tilt} ${className}`.trim()}>
      <div className="dv-mac">
        <div className="dv-mac-bar">
          <span className="dv-lights" aria-hidden="true"><i /><i /><i /></span>
          <span className="dv-mac-title">{title}</span>
          {chrome}
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
export function PhoneFrame({ media, note = 'iOS in progress', tag = 'Soon', className = '' }) {
  return (
    <div className={`dv-stage dv-stage-phone ${className}`.trim()}>
      <div className="dv-phone">
        <span className="dv-island" aria-hidden="true" />
        <div className="dv-screen dv-screen-phone"><ScreenSlot media={media} tag={tag} note={note} /></div>
      </div>
      <span className="dv-shadow dv-shadow-phone" aria-hidden="true" />
    </div>
  );
}

/**
 * Mac or iOS, switched by a pair of radios.
 *
 * `id` must be unique per instance — it names the radio group, and two groups
 * sharing a name would toggle each other. The inputs come FIRST in the DOM
 * because `:checked ~ x` only reaches forward; that is the one structural
 * constraint the CSS puts on this markup.
 */
export function DeviceSwitcher({ id, title, note, tilt = 'left', mac, phone, phoneNote = 'iOS in progress' }) {
  const macId = `dv-${id}-mac`;
  const iosId = `dv-${id}-ios`;
  return (
    <div className="dv-switch">
      <input className="dv-radio" type="radio" name={`dv-${id}`} id={macId} defaultChecked />
      <input className="dv-radio" type="radio" name={`dv-${id}`} id={iosId} />

      {/* Sits over the window chrome, top right, like the reference. Labels
          rather than buttons: the radio above is the state, and a label is
          already the accessible control for it. */}
      <div className="dv-toggle" role="group" aria-label={`Show ${title} on desktop or mobile`}>
        <label className="dv-toggle-btn" htmlFor={macId}><MonitorIcon /><span className="sr-only">Desktop view</span></label>
        <label className="dv-toggle-btn" htmlFor={iosId}><PhoneIcon /><span className="sr-only">Mobile view</span></label>
      </div>

      <div className="dv-views">
        <div className="dv-view dv-view-mac"><MacWindow title={title} note={note} tilt={tilt} media={mac} /></div>
        <div className="dv-view dv-view-ios"><PhoneFrame media={phone} note={phoneNote} /></div>
      </div>
    </div>
  );
}
