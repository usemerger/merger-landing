'use client';

/**
 * The no-WebGL stage: the approved InspectionFallback, and nothing else.
 *
 * WHY THIS FILE EXISTS AT ALL. Singularity.jsx imports three, fiber and drei at
 * the top of the module, so reaching its `forceFallback` prop would mean
 * downloading ~600kB of WebGL first in order to decide not to use it — on
 * precisely the paths (reduced motion, no WebGL2, ?graphics=svg) where the
 * brief says three.js must not be fetched at all.
 *
 * InspectionFallback has no such dependency: it imports React and the pure
 * singularity-motion module, nothing more. So it can be code-split on its own
 * and the fallback path costs a few kB instead of half a megabyte.
 *
 * This is a HOST, not a re-implementation. The drawing, the projection maths,
 * the depth sorting and its visible-time clock all stay in the approved
 * component; what is here is the markup it expects to sit in — the same class
 * names from the same stylesheet — plus the pointer and key wiring that feeds
 * its `motion` ref. Nothing about the fallback's behaviour is redefined.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import InspectionFallback from './InspectionFallback';
import './singularity.css';

export default function FallbackStage({ className = '', onMounted, reason }) {
  /** The shape InspectionFallback reads every frame. Matches Singularity's. */
  const motion = useRef({ yaw: 0, pitch: 0, pointerX: 0, pointerY: 0, release: 0, interacting: false });
  const pointer = useRef(null);
  const released = useRef(false);
  const [live, setLive] = useState(true);
  const host = useRef(null);

  useEffect(() => { onMounted?.(); }, [onMounted]);

  /** Reduced motion freezes it on the assembled logo, as the brief requires. */
  const quiet = reason === 'reduced-motion';

  // Same pause discipline as the WebGL path: nothing animates off-screen or in
  // a hidden tab. This is a 30fps rAF loop inside InspectionFallback, so it is
  // cheap, but "cheap" is not a reason to run it where nobody is looking.
  useEffect(() => {
    let visible = true;
    const update = () => setLive(visible && !document.hidden);
    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { rootMargin: '100px' })
      : null;
    if (host.current) observer?.observe(host.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  const onPhase = useCallback((_phase, manualActive = false) => {
    if (!manualActive) released.current = false;
  }, []);

  const release = useCallback(() => {
    if (released.current || quiet) return;
    motion.current.release += 1;
    released.current = true;
  }, [quiet]);

  const pointerDown = (event) => {
    if (event.button !== 0 || !event.isPrimary || quiet || pointer.current) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
    motion.current.interacting = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event) => {
    if (quiet) return;
    const active = pointer.current;
    if (active && active.id !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    motion.current.pointerX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    motion.current.pointerY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    if (!active) return;
    motion.current.yaw += (event.clientX - active.x) / Math.max(bounds.width, 1) * 3.5;
    motion.current.pitch = Math.max(-0.45, Math.min(0.45, motion.current.pitch + (event.clientY - active.y) / Math.max(bounds.height, 1) * 1.8));
    active.x = event.clientX;
    active.y = event.clientY;
  };
  const pointerEnd = (event) => {
    const active = pointer.current;
    if (!active || active.id !== event.pointerId) return;
    // A press that did not travel is a tap, and a tap releases the fragments.
    if (event.type === 'pointerup' && Math.hypot(event.clientX - active.startX, event.clientY - active.startY) < 7) release();
    pointer.current = null;
    motion.current.interacting = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event) => {
    if (quiet) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'Enter', ' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') motion.current.yaw -= 0.2;
    if (event.key === 'ArrowRight') motion.current.yaw += 0.2;
    if (event.key === 'ArrowUp') motion.current.pitch = Math.max(-0.45, motion.current.pitch - 0.12);
    if (event.key === 'ArrowDown') motion.current.pitch = Math.min(0.45, motion.current.pitch + 0.12);
    if (event.key === 'Home') { motion.current.yaw = 0; motion.current.pitch = 0; }
    if (event.key === 'Enter' || event.key === ' ') release();
  };

  return (
    <div ref={host} className={`singularity-stage ${className}${quiet ? ' is-reduced' : ''}`}
      data-renderer="svg" data-ready="false" data-motion={quiet ? 'reduced' : 'full'}>
      <div className="singularity-aura" aria-hidden="true" />
      <div className="singularity-orbit orbit-one" aria-hidden="true" />
      <div className="singularity-orbit orbit-two" aria-hidden="true" />
      <div className="singularity-interaction" role="img"
        aria-label="Merger diamond slowly rotates, separates in three dimensions, and reforms when facing forward. Drag to inspect. Press Enter to release its fragments, or use the arrow keys to rotate and Home to face forward."
        tabIndex={quiet ? -1 : 0}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd}
        onPointerCancel={pointerEnd}
        onLostPointerCapture={() => { pointer.current = null; motion.current.interacting = false; }}
        onPointerLeave={() => { motion.current.pointerX = 0; motion.current.pointerY = 0; }}
        onKeyDown={onKeyDown}>
        <div className="singularity-fallback">
          <InspectionFallback motion={motion} active={live && !quiet} quiet={quiet} onPhase={onPhase} />
        </div>
      </div>
    </div>
  );
}
