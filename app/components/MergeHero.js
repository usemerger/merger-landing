'use client';

/**
 * The hero's 3D slot, and every guarantee attached to it.
 *
 * MergeScene is the art. This file is the engineering around it, and it is the
 * part that decides whether the hero reads as premium or as a liability:
 *
 *   · the scene is dynamically imported with ssr:false and only after first
 *     paint, so three.js is never in the initial bundle and can never be the
 *     LCP element
 *   · the box is reserved at every breakpoint and a poster fills it from the
 *     first frame, so nothing moves when the canvas arrives (CLS ~0)
 *   · prefers-reduced-motion never loads the scene at all — it gets the
 *     resolved still, which is the honest reading of the preference
 *   · the render loop stops when the tab is hidden or the hero scrolls away
 *
 * The poster is inline SVG rather than an image file: it is a few hundred bytes
 * of the same geometry, it needs no second network round trip before the hero
 * looks finished, and it cannot 404.
 *
 * ── WHY THIS FILE CHANGED ─────────────────────────────────────────────────
 * Three separate reports, one cause each, all of them this file's fault:
 *
 *   "it doesn't show on my phone" — the scene was gated on viewport WIDTH
 *     (≤820px never mounted), so every phone and every narrow window got a flat
 *     SVG outline blown up to fill the column. The gate is now CAPABILITY, not
 *     size: if the device can run it, it runs it, phone included.
 *
 *   "it doesn't work on iPhone" — .mh-host carried `touch-action: none` at
 *     every width, including the widths where no canvas was ever mounted. That
 *     is a ~400px band across the hero where a touch drag scrolls nothing. The
 *     grab affordance is now attached only while the scene is actually live,
 *     and it is `pan-y`, so a vertical swipe always belongs to the page.
 *
 *   "it doesn't show in another browser" — the poster faded out on `is-live`,
 *     which was set by an IntersectionObserver that knows nothing about WebGL.
 *     If context creation failed, the hero went to an empty box. The poster now
 *     waits for a frame the renderer actually produced, and comes back if the
 *     context is later lost.
 */

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState } from 'react';

/**
 * The resolved state, drawn flat.
 *
 * Doubles as the poster (shown until the canvas has drawn) and as the entire
 * hero under reduced motion or wherever WebGL is unavailable — so it has to
 * look deliberate on its own, not like a placeholder someone forgot to
 * replace. The soft gold falloff behind it is what keeps a thin outline from
 * reading as a wireframe when it is the only thing in the box.
 */
function ResolvedMark({ title }) {
  return (
    <svg className="mh-poster" viewBox="0 0 240 240" role="img" aria-label={title}>
      <defs>
        <linearGradient id="mh-face" x1="40" y1="20" x2="200" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1B2330" />
          <stop offset=".55" stopColor="#11161E" />
          <stop offset="1" stopColor="#0B0F15" />
        </linearGradient>
        <radialGradient id="mh-halo" cx="120" cy="120" r="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C9A96A" stopOpacity=".16" />
          <stop offset="1" stopColor="#C9A96A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* The light the stone would have been sitting in. */}
      <circle cx="120" cy="120" r="96" fill="url(#mh-halo)" />
      {/* The gem: the same faceted diamond as the logo, resolved. */}
      <g fill="url(#mh-face)" stroke="#C9A96A" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M120 34 56 116l64 90 64-90z" opacity=".95" />
        <path d="M120 34 56 116h128z" opacity=".55" />
        <path d="M120 34v172" strokeOpacity=".45" fill="none" />
        <path d="M56 116h128" strokeOpacity=".45" fill="none" />
      </g>
    </svg>
  );
}

// ssr:false keeps three.js out of the server render AND out of the initial
// client bundle — Next code-splits it into its own chunk fetched on demand.
const MergeScene = dynamic(() => import('./MergeScene'), {
  ssr: false,
  loading: () => null,
});

/**
 * A scene that throws must not take the hero with it.
 *
 * react-three-fiber throws synchronously when it cannot get a context, and a
 * three.js release can throw on a driver it does not like. Either way the
 * correct outcome is the poster, not a blank column and a broken page.
 */
class SceneBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** At or below this, run the scene at 1x with no antialias rather than not at all. */
const LOW_POWER_MAX = 820;

/**
 * Can this machine be asked to run the scene at all?
 *
 * Deliberately NOT a width test. A phone from the last several years runs
 * thirteen flat-shaded octahedra without noticing; a two-core machine with no
 * hardware WebGL does not, whatever size its monitor is.
 */
function canRunScene() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // Both of these are absent in Safari — absent means "no answer", not "weak".
  if (navigator.deviceMemory && navigator.deviceMemory < 2) return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
  try {
    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe) return false;
    // Hand the context straight back. Browsers cap live contexts (Safari at
    // 16), and a probe that keeps one is a context the real canvas cannot have.
    probe.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

export default function MergeHero() {
  const hostRef = useRef(null);
  /** 0 scattered → 1 assembled. Driven by a timer on mount, NOT by scroll:
   *  §4 asks for the pieces to come together on load and settle. Scroll only
   *  nudges the settled stone afterwards. A ref, not state — it changes every
   *  frame and must never cause a React render. */
  const assembly = useRef(0);
  /** Drag state. dx/dy are the pixels moved since the last frame consumed
   *  them; vx/vy are the angular velocity the scene decays after release. */
  const drag = useRef({ active: false, dx: 0, dy: 0, vx: 0, vy: 0 });
  const [mount, setMount] = useState(false);
  const [live, setLive] = useState(false);
  /** THE POSTER'S RELEASE CONDITION. Not "the canvas element exists" and not
   *  "the hero is on screen" — a frame the renderer actually drew. Until this
   *  is true the still IS the hero, which is the only correct answer on a
   *  browser or a driver that could not give us a context. */
  const [ready, setReady] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  /** Context lost (GPU reset, tab evicted on iOS, too many contexts on the
   *  page). Put the still back rather than leaving an empty box. */
  const onLost = useCallback(() => setReady(false), []);
  const onFail = useCallback(() => { setReady(false); setMount(false); }, []);

  useEffect(() => {
    // Decide once, on the client, with everything available.
    if (!canRunScene()) return;
    setLowPower(window.matchMedia(`(max-width: ${LOW_POWER_MAX}px)`).matches);

    // AFTER `load`, THEN IN IDLE TIME. Parsing and evaluating three.js is ~580ms
    // of script work; while that sat inside the first few seconds it competed
    // with interactivity and pushed Total Blocking Time to 520ms, which cost
    // ~15 Lighthouse points on its own. Waiting for the load event moves that
    // work past the window where the page is meant to be responding to the
    // person, and the assembly still plays well within the time anyone spends
    // reading the headline.
    let cancel = () => {};
    const schedule = () => {
      const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
      const clear = window.cancelIdleCallback || clearTimeout;
      const handle = idle(() => setMount(true), { timeout: 1500 });
      cancel = () => clear(handle);
    };
    if (document.readyState === 'complete') schedule();
    else {
      window.addEventListener('load', schedule, { once: true });
      cancel = () => window.removeEventListener('load', schedule);
    }
    return () => cancel();
  }, []);

  // §1 DRAG IS THE ONLY INPUT.
  //
  // The cursor-follow parallax and the scroll nudge are both gone. Following
  // the pointer everywhere made the object feel wired to the page rather than
  // sitting in it — and it meant simply moving the mouse toward the CTA swung
  // the gem around, so it was never actually still.
  //
  // Pointer events (not mouse) so a touch drag works identically, and capture
  // so a drag that leaves the hero keeps tracking instead of sticking.
  //
  // Bound only once a frame has been drawn. Before that there is nothing to
  // turn, and these listeners plus `touch-action` were quietly making the hero
  // a dead zone for touch scrolling on every device that never got a canvas.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;
    let id = null;
    let last = null;

    const down = (e) => {
      if (e.button != null && e.button !== 0) return;
      id = e.pointerId;
      last = { x: e.clientX, y: e.clientY };
      drag.current.active = true;
      try { host.setPointerCapture(id); } catch { /* not capturable */ }
    };
    const move = (e) => {
      if (!drag.current.active || e.pointerId !== id || !last) return;
      // Normalised by viewport width so the same gesture turns it the same
      // amount on a laptop and on a 4K display.
      drag.current.dx += (e.clientX - last.x) / window.innerWidth;
      drag.current.dy += (e.clientY - last.y) / window.innerWidth;
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (e) => {
      if (e.pointerId !== id) return;
      drag.current.active = false;
      drag.current.dx = 0; drag.current.dy = 0;
      last = null;
      try { host.releasePointerCapture(id); } catch { /* already released */ }
      id = null;
    };

    host.addEventListener('pointerdown', down);
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerup', up);
    // `touch-action: pan-y` means the browser takes the gesture over the moment
    // a touch turns into a vertical scroll, and tells us by cancelling the
    // pointer. Treat that exactly like a release: the page keeps the gesture.
    host.addEventListener('pointercancel', up);
    return () => {
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', up);
    };
  }, [ready]);

  // ASSEMBLE ON LOAD. Runs once the canvas is mounted, on rAF rather than a
  // CSS transition because the value feeds three.js directly. Slow enough to be
  // watched — the whole point is that someone sees twelve pieces become one.
  useEffect(() => {
    if (!mount) return;
    let raf = 0;
    let start = 0;
    const DURATION = 2200;
    const tick = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      // Long decelerating tail: arriving with weight, never springing.
      assembly.current = 1 - Math.pow(1 - t, 3);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mount]);

  // Stop rendering when nobody is looking. A hero that keeps a GPU busy in a
  // background tab is the difference between a site that feels expensive and
  // one that drains a laptop.
  useEffect(() => {
    if (!mount) return;
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting && !document.hidden),
      { threshold: 0.01 },
    );
    io.observe(host);
    const onVis = () => setLive(!document.hidden && !!host.getBoundingClientRect().height
      && host.getBoundingClientRect().bottom > 0
      && host.getBoundingClientRect().top < window.innerHeight);
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, [mount]);

  return (
    <div className={`mh-host${ready ? ' is-interactive' : ''}`} ref={hostRef}>
      {/* Always present, underneath. It is the poster before the canvas draws
          and the whole hero when the canvas never will. */}
      <ResolvedMark title="Twelve conversations merging into one deal desk" />
      {mount && (
        <div className={`mh-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
          <SceneBoundary onFail={onFail}>
            <MergeScene assembly={assembly} drag={drag} live={live}
              lowPower={lowPower} onReady={onReady} onLost={onLost} />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
