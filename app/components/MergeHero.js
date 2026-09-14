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
 *   · small screens get the same still rather than a WebGL context
 *   · the render loop stops when the tab is hidden or the hero scrolls away
 *
 * The poster is inline SVG rather than an image file: it is a few hundred bytes
 * of the same geometry, it needs no second network round trip before the hero
 * looks finished, and it cannot 404.
 */

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

/**
 * The resolved state, drawn flat.
 *
 * Doubles as the poster (shown until the canvas is live) and as the entire
 * hero under reduced motion or on a phone — so it has to look deliberate on
 * its own, not like a placeholder someone forgot to replace.
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
      </defs>
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

/** Below this the scene is not worth a WebGL context. */
const MOBILE_MAX = 820;

export default function MergeHero() {
  const hostRef = useRef(null);
  /** 0 apart → 1 fused. A ref, not state: it updates per scroll frame and must
   *  never cause a React render. */
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [mount, setMount] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // Decide once, on the client, with everything available.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;
    // A machine that cannot do WebGL should not be asked to try.
    let webgl = false;
    try {
      webgl = !!document.createElement('canvas').getContext('webgl2');
    } catch { webgl = false; }
    if (reduced || small || !webgl) return;

    // AFTER FIRST PAINT, not during it. requestIdleCallback where it exists so
    // the scene loads in genuinely spare time; a timeout where it does not.
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 320));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const handle = idle(() => setMount(true));
    return () => cancel(handle);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Scroll → merge progress. Read geometry in the handler but write only to a
    // ref; the canvas picks it up on its own frame, so scrolling never triggers
    // React work.
    const onScroll = () => {
      const r = host.getBoundingClientRect();
      // RESOLVED WHILE STILL IN VIEW. Mapping the merge across a full viewport
      // meant the shards only fused as the hero left the screen — the whole
      // payoff happened where nobody could see it. Completing inside the first
      // ~45% of a screen of scroll puts the resolved gem in front of the reader
      // while the hero copy is still beside it.
      const travelled = -r.top / Math.max(window.innerHeight * 0.45, 1);
      progress.current = Math.min(1, Math.max(0, travelled + 0.10));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const onPointer = (e) => {
      const r = host.getBoundingClientRect();
      // -1..1 from the centre of the hero, not the window: the object should
      // respond to where the cursor is relative to IT.
      pointer.current = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      };
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

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
    <div className="mh-host" ref={hostRef}>
      {/* Always present, underneath. It is the poster before the canvas exists
          and the whole hero when the canvas never will. */}
      <ResolvedMark title="Twelve conversations merging into one deal desk" />
      {mount && (
        <div className={`mh-canvas ${live ? 'is-live' : ''}`} aria-hidden="true">
          <MergeScene progress={progress} pointer={pointer} live={live} />
        </div>
      )}
    </div>
  );
}
