'use client';

/**
 * The hero object: twelve shards converging into one resolved gem.
 *
 * This is the product thesis as geometry. Merger's claim is that a dozen
 * disconnected channels become one deal desk, so the object starts as scattered
 * fragments and fuses into the Merger mark — a faceted diamond, the same form
 * as the logo's seven glossy faces.
 *
 * SCROLL OWNS THE MERGE, THE POINTER OWNS THE ANGLE. Keeping those separate is
 * what stops the two inputs fighting: the user performs the metaphor by
 * scrolling, and looks around it with the mouse. If the pointer also affected
 * convergence the object would appear to undo itself whenever the mouse moved.
 *
 * This module is only ever reached through a dynamic import with ssr:false —
 * see MergeHero.js. Nothing here may run during SSR or before first paint.
 */

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Brass, as a colour three can use. Matches --brass exactly. */
const BRASS = '#C9A96A';
const SHARD_COUNT = 12;

/**
 * Where each shard rests when merged, and where it waits when apart.
 *
 * Deterministic rather than random: a hero that arranges itself differently on
 * every load cannot be art-directed, and the one arrangement can be checked.
 */
function useShards() {
  return useMemo(() => {
    const out = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
      const t = i / SHARD_COUNT;
      const angle = t * Math.PI * 2;
      // Scattered: a wide ring, tilted, at varying depth — twelve channels
      // arriving from twelve directions.
      const spread = 3.1 + (i % 3) * 0.55;
      out.push({
        from: new THREE.Vector3(
          Math.cos(angle) * spread,
          Math.sin(angle * 1.7) * 1.5 + (i % 2 ? 0.4 : -0.4),
          Math.sin(angle) * spread * 0.6,
        ),
        // Merged: pressed into the body of the gem, a little off-centre so the
        // resolved form still reads as faceted rather than as a single ball.
        to: new THREE.Vector3(
          Math.cos(angle) * 0.34,
          Math.cos(angle * 2.3) * 0.22,
          Math.sin(angle) * 0.34,
        ),
        spin: new THREE.Euler(t * 5.1, t * 3.7, t * 2.3),
        scale: 0.42 + ((i * 7) % 5) * 0.06,
      });
    }
    return out;
  }, []);
}

/**
 * @param progress 0 = apart, 1 = fused. Driven by scroll from the parent.
 */
function Shards({ progress, pointer }) {
  const group = useRef();
  const shards = useShards();
  const refs = useRef([]);
  const coreRef = useRef();
  const eased = useRef(0);

  useFrame((state, delta) => {
    // Smooth toward the scroll target rather than tracking it exactly. Scroll
    // events are jumpy — especially with a trackpad — and a hero that snaps
    // frame-to-frame reads as cheap no matter how good the geometry is.
    // Framerate-independent so it settles the same on 60Hz and 144Hz.
    const k = 1 - Math.pow(0.0015, delta);
    eased.current += (progress.current - eased.current) * k;
    const p = eased.current;

    for (let i = 0; i < shards.length; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const s = shards[i];
      // Ease the travel itself, not just the input, so shards arrive with
      // weight instead of coasting linearly into place.
      const e = p * p * (3 - 2 * p);
      mesh.position.lerpVectors(s.from, s.to, e);
      // Spin resolves to zero as they merge: chaos becoming order, and it means
      // the final state is always the same orientation rather than whatever
      // rotation the animation happened to stop on.
      mesh.rotation.set(
        s.spin.x * (1 - e), s.spin.y * (1 - e), s.spin.z * (1 - e),
      );
      // THEY SHRINK AS THEY ARRIVE. Twelve full-size octahedra converging on one
      // point simply overlapped into a flat brass blob — technically "merged",
      // visually a pile. Shrinking them into the core as the gem below grows is
      // what reads as fusing rather than stacking.
      const sc = s.scale * (1 - e) + 0.06 * e;
      mesh.scale.setScalar(sc);
      // Brighten on the way in, then hand off to the gem: past the midpoint the
      // shards dim again so the resolved form is the thing that is lit.
      const glow = e < 0.5 ? e * 2 : (1 - e) * 2;
      mesh.material.emissiveIntensity = 0.06 + glow * 0.34;
    }

    // The gem only exists in the second half of the merge, so it appears to be
    // formed BY the shards rather than revealed behind them.
    if (coreRef.current) {
      const c = Math.max(0, (p - 0.45) / 0.55);
      const ce = c * c * (3 - 2 * c);
      coreRef.current.scale.setScalar(Math.max(0.001, ce));
      coreRef.current.material.opacity = ce;
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }

    if (group.current) {
      // Pointer parallax — angle only, never convergence. Damped toward the
      // target so the object feels heavy rather than glued to the cursor.
      const tx = pointer.current.y * 0.18;
      const ty = pointer.current.x * 0.32;
      group.current.rotation.x += (tx - group.current.rotation.x) * k;
      group.current.rotation.y += (ty + state.clock.elapsedTime * 0.04 - group.current.rotation.y) * k;
    }
  });

  // One geometry shared by every shard: twelve octahedra cost one buffer, not
  // twelve, which is most of what keeps this cheap enough for a hero.
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.62, 0), []);

  return (
    <group ref={group}>
      {/* THE RESOLVED MARK. Absent while the shards are apart, and the only
          thing left once they have arrived — the "one" in many-to-one. Its
          edges are brass so the finished state matches the logo in the nav. */}
      <mesh ref={coreRef} scale={0.001}>
        <octahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial
          color="#161D28"
          emissive={BRASS}
          emissiveIntensity={0.16}
          metalness={0.75}
          roughness={0.18}
          flatShading
          transparent
          opacity={0}
        />
      </mesh>
      {shards.map((s, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} geometry={geometry}>
          <meshStandardMaterial
            // Lifted off the background deliberately. At #11161E on a #0F1319
            // page the shards were invisible until they caught a highlight —
            // technically rendering, practically not there.
            color="#2A3342"
            emissive={BRASS}
            emissiveIntensity={0.06}
            metalness={0.7}
            roughness={0.22}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ progress, pointer }) {
  const { gl } = useThree();
  // Cap the pixel ratio. A 3x phone or a 4K display would otherwise render four
  // to nine times the pixels for a decorative object, which is exactly the
  // "phone-melting WebGL" the brief rules out.
  gl.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.75));
  return <Shards progress={progress} pointer={pointer} />;
}

export default function MergeScene({ progress, pointer, live = true, dpr = [1, 1.75] }) {
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      // Antialiasing stays on: the whole object is straight facet edges, and
      // they alias badly without it. alpha:true so the canvas composites onto
      // the panel behind rather than painting its own background over it.
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // THE RENDER LOOP IS OFF WHENEVER NOBODY IS LOOKING. The parent watches
      // intersection and document visibility; 'never' genuinely stops the loop
      // rather than rendering invisible frames, which is the difference between
      // a hero that feels expensive and one that flattens a laptop battery.
      frameloop={live ? 'always' : 'never'}
    >
      <ambientLight intensity={0.35} />
      {/* Two lights, both warm-on-cold: a brass key so the facets catch the
          accent, and a cold fill so the unmerged shards stay ink-coloured. */}
      <directionalLight position={[4, 6, 5]} intensity={1.5} color={BRASS} />
      <directionalLight position={[-6, -3, -4]} intensity={0.5} color="#4E6A8C" />
      <Rig progress={progress} pointer={pointer} />
    </Canvas>
  );
}
