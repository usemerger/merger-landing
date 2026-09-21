'use client';

/**
 * The hero's 3D slot: a sized box, a poster, and a decision about what to load.
 *
 * WHAT CHANGED. This used to own a WebGL scene end to end — the probe, the
 * render loop, the drag handling, the first-frame signal. The approved
 * Singularity component owns all of that itself, so keeping both would have
 * meant two WebGL2 probes each creating and discarding a context (Safari caps
 * live contexts at 16), two IntersectionObservers, two reduced-motion
 * listeners, and — the deciding problem — two pointer-drag systems on
 * overlapping elements, which do not merely duplicate but actively fight:
 * `touch-action: pan-y` here against `pan-y pinch-zoom` there, with both
 * calling setPointerCapture on the same gesture.
 *
 * So this is shape 2 from the brief: Singularity owns the canvas lifecycle and
 * this file is reduced to the three jobs the scaffold was actually good at.
 *
 *   1. RESERVE THE BOX. The container is sized identically at every breakpoint
 *      whether the scene loads, falls back, or never arrives — so nothing can
 *      push the hero copy around at any point in the page's life. That is the
 *      whole CLS story and it is unchanged.
 *
 *   2. PAINT SOMETHING IMMEDIATELY. A 35kB webp poster fills that box from
 *      first paint and fades once a stage has rendered. (The source poster is
 *      a 794kB PNG. Shipping that as a first-paint image would have been a
 *      repeat of a mistake this project already made once — three 1080p JPEGs
 *      pushed LCP 520ms -> 780ms before being re-encoded. 1000x1100 webp q72
 *      is 35kB and visually identical on a dark render.)
 *
 *   3. DECIDE WHAT TO DOWNLOAD, BEFORE DOWNLOADING IT. This is the part that
 *      matters most. Singularity.jsx imports three/fiber/drei at module scope,
 *      so its own `forceFallback` prop can only be reached after ~600kB of
 *      WebGL has already been fetched. The brief requires three.js not to be
 *      requested at all on the reduced-motion / no-WebGL / ?graphics=svg
 *      paths, so the choice has to be made HERE, before the import — and the
 *      fallback path imports InspectionFallback alone, which pulls no three.
 */

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState } from 'react';

/** ssr:false keeps every one of these out of the server render and the initial chunk. */
const SingularityStage = dynamic(() => import('./singularity/SingularityStage'), { ssr: false, loading: () => null });
const FallbackStage = dynamic(() => import('./singularity/FallbackStage'), { ssr: false, loading: () => null });

/** Which presentation this visitor gets. `pending` until the client decides. */
const MODE = { PENDING: 'pending', WEBGL: 'webgl', SVG: 'svg' };

/**
 * A stage that throws must not take the hero with it.
 *
 * Singularity has its own graphics boundary for render-time failures inside
 * the canvas. This one is a level up and catches what that cannot: a failed
 * JavaScript chunk, or a module that throws on evaluation. The brief asks for
 * exactly this outer boundary. Either way the poster is still underneath, so
 * the failure costs the animation and nothing else.
 */
class StageBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/**
 * Can this visitor be sent 600kB of WebGL, and should they be?
 *
 * Deliberately not a width test — a phone from the last several years runs
 * this scene in its compact mode without noticing, and Singularity has its own
 * `max-width: 720px` path for that. What is being decided here is only whether
 * downloading three.js could ever pay off.
 */
function decideMode() {
  try {
    // An explicit request for the SVG path wins over everything, so the
    // fallback can be reviewed on any machine. Matches the review project's
    // own ?graphics=svg convention.
    if (new URLSearchParams(window.location.search).get('graphics') === 'svg') {
      return { mode: MODE.SVG, reason: 'forced' };
    }
  } catch { /* no URL to read */ }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { mode: MODE.SVG, reason: 'reduced-motion' };
  }

  // Absent in Safari — absent means "no answer", not "weak", so only an
  // explicit low number disqualifies.
  if (navigator.deviceMemory && navigator.deviceMemory < 2) return { mode: MODE.SVG, reason: 'low-memory' };
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return { mode: MODE.SVG, reason: 'low-cores' };

  try {
    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe) return { mode: MODE.SVG, reason: 'no-webgl2' };
    // Hand the context straight back: browsers cap live contexts, and a probe
    // that keeps one is a context the real canvas cannot have.
    probe.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { return { mode: MODE.SVG, reason: 'no-webgl2' }; }

  return { mode: MODE.WEBGL, reason: 'eligible' };
}

export default function MergeHero() {
  const hostRef = useRef(null);
  const [{ mode, reason }, setDecision] = useState({ mode: MODE.PENDING, reason: '' });
  /** True once a stage has rendered — the poster's release condition. */
  const [staged, setStaged] = useState(false);
  /** The hero is on (or near) screen, so loading it is worth the bytes. */
  const [near, setNear] = useState(false);

  const onMounted = useCallback(() => setStaged(true), []);
  const onFail = useCallback(() => setStaged(false), []);

  useEffect(() => { setDecision(decideMode()); }, []);

  /**
   * NEAR-VIEWPORT GATE. The brief asks that three.js and the GLB not be
   * requested until the hero is close to being seen. On a desktop the hero is
   * the top of the page, so this fires essentially at once; on a phone the
   * waitlist form pushes the art below the fold and the download genuinely
   * waits. 300px of rootMargin means it is decoded by the time it is scrolled
   * to rather than starting then.
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); io.disconnect(); }
    }, { rootMargin: '300px' });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  /**
   * And even when it is near, the WebGL chunk waits for the page to finish
   * loading and then for idle time. Parsing and evaluating three.js is
   * hundreds of milliseconds of script work; inside the first few seconds it
   * competes with the waitlist form for the main thread, and the form is the
   * only thing on this page anyone has to be able to use. The SVG path does
   * not wait — it is a few kB and it IS the picture.
   */
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (mode !== MODE.WEBGL || !near) return;
    let cancel = () => {};
    const schedule = () => {
      const request = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
      const clear = window.cancelIdleCallback || clearTimeout;
      const handle = request(() => setIdle(true), { timeout: 1500 });
      cancel = () => clear(handle);
    };
    if (document.readyState === 'complete') schedule();
    else {
      window.addEventListener('load', schedule, { once: true });
      cancel = () => window.removeEventListener('load', schedule);
    }
    return () => cancel();
  }, [mode, near]);

  const showWebgl = mode === MODE.WEBGL && near && idle;
  const showSvg = mode === MODE.SVG && near;

  return (
    // data-* here is not decoration: which of the three presentations a
    // visitor got, and why, is otherwise invisible from the outside — and this
    // is exactly the decision most likely to be wrong on a device nobody in
    // the room is holding.
    <div className={`mh-host${staged ? ' is-staged' : ''}`} ref={hostRef}
      data-mode={mode} data-reason={reason || 'pending'} data-near={near} data-idle={idle}>
      {/*
        The poster. Always present, always underneath, and the whole hero until
        a stage renders — which is the only correct answer on a browser that
        could not give us a context. `fetchPriority="high"` because within its
        own box it is the largest paint the hero has; it is 35kB, so this costs
        nothing worth measuring.
      */}
      <img
        className="mh-poster"
        src="/models/merger-singularity-poster.webp"
        alt=""
        aria-hidden="true"
        width="1000"
        height="1100"
        decoding="async"
        fetchPriority="high"
      />

      {(showWebgl || showSvg) && (
        <div className="mh-stage">
          <StageBoundary onFail={onFail}>
            {showWebgl
              ? <SingularityStage onMounted={onMounted} />
              : <FallbackStage onMounted={onMounted} reason={reason} />}
          </StageBoundary>
        </div>
      )}
    </div>
  );
}
