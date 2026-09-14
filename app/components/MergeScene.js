'use client';

/**
 * The Merger gem: twelve shards assembling into one faceted stone.
 *
 * WHY v1 WAS INVISIBLE, because the fix follows from it. The first version gave
 * the shards a lifted base colour and an emissive glow, which is how you light
 * a neon sign rather than a stone. Emission ignores the lights, so every facet
 * reads the same value and the object flattens into a silhouette — and on a
 * dark page a flat dark silhouette is nothing at all.
 *
 * A glossy black object on a near-black ground is legible only through
 * SPECULAR: sharp highlights travelling across the facets, and a rim light
 * along one edge to separate it from the background. So the material here is
 * almost black, fully metal, barely rough — and the light it reflects is built
 * in-scene with Lightformers, which behave as real area lights in the
 * reflection instead of a texture pretending to be one.
 *
 * Lightformers rather than an HDR preset deliberately: drei's presets fetch an
 * environment map from a CDN, which is a network round trip the hero would wait
 * on and a third party that can fail. This costs nothing and cannot 404.
 *
 * Only ever reached through a dynamic import with ssr:false — see MergeHero.
 */

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const GOLD = '#C9A96A';
const GOLD_LIT = '#E8CF97';
const SHARD_COUNT = 12;
/** How far a drag turns the stone. A drag across half the window is most of
 *  a half-turn — the threshold where it feels attached to the hand. */
const DRAG_GAIN = 7;

/** The stone: taller than wide, like the mark — a diamond, not a ball. */
function gemGeometry() {
  const g = new THREE.OctahedronGeometry(1, 0);
  g.scale(0.82, 1.32, 0.82);
  return g;
}

/**
 * Where each shard waits, and where it lands. Deterministic, so the hero can be
 * art-directed and checked rather than being a new composition every load.
 */
function useShards() {
  return useMemo(() => {
    const out = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
      const t = i / SHARD_COUNT;
      const a = t * Math.PI * 2;
      const spread = 3.4 + (i % 3) * 0.7;
      out.push({
        from: new THREE.Vector3(
          Math.cos(a) * spread,
          Math.sin(a * 1.7) * 2.0 + (i % 2 ? 0.5 : -0.5),
          Math.sin(a) * spread * 0.55 - 1.2,
        ),
        // They land ON the stone's surface, so they read as becoming its
        // facets rather than disappearing into the middle of it.
        to: new THREE.Vector3(Math.cos(a) * 0.52, Math.cos(a * 2.1) * 0.62, Math.sin(a) * 0.52),
        spin: new THREE.Euler(t * 5.1, t * 3.7, t * 2.3),
        scale: 0.3 + ((i * 7) % 5) * 0.05,
      });
    }
    return out;
  }, []);
}

function Gem({ assembly, drag }) {
  const group = useRef();
  const core = useRef();
  const refs = useRef([]);
  const shards = useShards();
  const geo = useMemo(() => gemGeometry(), []);
  const shardGeo = useMemo(() => new THREE.OctahedronGeometry(0.42, 0), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 1), [geo]);
  const shardEdges = useMemo(() => new THREE.EdgesGeometry(shardGeo, 1), [shardGeo]);

  useFrame((state, delta) => {
    const k = 1 - Math.pow(0.002, delta);   // framerate-independent damping
    const a = assembly.current;             // 0 scattered -> 1 assembled
    const e = a * a * (3 - 2 * a);

    for (let i = 0; i < shards.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const s = shards[i];
      m.position.lerpVectors(s.from, s.to, e);
      // Spin resolves to zero, so the settled state is always the same
      // composition rather than wherever the tumble happened to stop.
      m.rotation.set(s.spin.x * (1 - e), s.spin.y * (1 - e), s.spin.z * (1 - e));
      m.scale.setScalar(s.scale * (1 - e) + 0.001 * e);
      // Fade the solid and its bevels together as the piece is absorbed.
      const fade = 1 - e * e;
      if (m.children[0]) m.children[0].material.opacity = fade;
      if (m.children[1]) m.children[1].material.opacity = fade * 0.9;
      m.visible = e < 0.995;
    }

    if (core.current) {
      // The stone grows in the back half of the assembly, so it looks formed
      // BY the shards rather than revealed behind them.
      const c = Math.max(0, (a - 0.35) / 0.65);
      const ce = c * c * (3 - 2 * c);
      core.current.scale.setScalar(Math.max(0.001, ce * 1.05));
      // The group holds the solid and its bevels; both fade in together.
      const solid = core.current.children[0];
      const wire = core.current.children[1];
      if (solid) solid.material.opacity = ce;
      if (wire) wire.material.opacity = ce * 0.85;
    }

    if (group.current) {
      // §1 AUTONOMOUS, AND DRAGGABLE — NOTHING ELSE.
      //
      // The object no longer reads the cursor's position or the scroll offset.
      // Following the mouse everywhere made it feel wired to the page rather
      // than sitting in it, and it meant the object was never still: moving the
      // pointer to click the CTA dragged the gem along with it.
      //
      // So it turns on its own, always, and the ONLY input is an actual drag.
      const d = drag.current;

      // A drag adds angular velocity; releasing leaves that velocity to decay,
      // which is the inertia. Damping is per-second so a 144Hz screen spins it
      // down at the same rate as a 60Hz one.
      // DRAG MOVES IT 1:1, NOT THROUGH A VELOCITY.
      //
      // The first version set a velocity from the pixel delta and then scaled
      // that by delta again on the way into the rotation. d.dx is already a
      // per-frame fraction of the viewport (~0.018 for a brisk drag), so the
      // result was roughly a single degree for a drag right across the hero —
      // the gem technically responded and visibly did not move.
      //
      // Dragging now rotates the stone directly by the distance travelled, so
      // the object tracks the hand. DRAG_GAIN 7 means a drag across half the
      // window turns it most of a half-turn, which is what "easily dragged"
      // feels like.
      if (d.active) {
        group.current.rotation.y += d.dx * DRAG_GAIN;
        group.current.rotation.x += d.dy * DRAG_GAIN * 0.6;
        // Remember the rate so releasing mid-gesture throws it rather than
        // stopping dead. Guard delta: a stalled frame would divide by ~0.
        if (delta > 0.001) {
          d.vy = (d.dx * DRAG_GAIN) / delta;
          d.vx = (d.dy * DRAG_GAIN * 0.6) / delta;
        }
        d.dx = 0; d.dy = 0;
      } else {
        // Inertia, decaying per second so it spins down identically at 60 and
        // 144Hz.
        const decay = Math.pow(0.12, delta);
        d.vy *= decay;
        d.vx *= decay;
        group.current.rotation.y += d.vy * delta;
        group.current.rotation.x += d.vx * delta;
      }

      // The idle drift runs underneath whenever the user is not holding it, so
      // a throw blends into the drift instead of the object stopping dead.
      if (!d.active) group.current.rotation.y += 0.085 * delta;
      // Keep the tilt from tumbling all the way over — a gem lying on its side
      // stops reading as the mark.
      group.current.rotation.x = Math.max(-0.55, Math.min(0.55, group.current.rotation.x));
      // A slow vertical float, independent of everything, so it is alive even
      // when perfectly still otherwise.
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.07;
    }
  });

  return (
    <group ref={group}>
      <group ref={core} scale={0.001}>
      <mesh geometry={geo}>
        {/* Near-black, fully metal, barely rough. Everything visible on it is a
            reflection of the Lightformers below. */}
        {/* NOT A PERFECT MIRROR. At metalness 1 / roughness .14 the facets
            reflected an environment that is mostly black void, so the stone
            returned black and read as a silhouette. Backing off the metalness
            lets the base colour carry some value, and the extra roughness
            spreads each highlight across a whole facet instead of a point. */}
        <meshStandardMaterial
          color="#171C24"
          metalness={0.62}
          roughness={0.29}
          envMapIntensity={1.5}
          flatShading
          transparent
          opacity={0}
        />
      </mesh>
      {/* THE BEVELS. The mark is defined by the fine polished lines between its
          facets, and on a dark page they are also the only thing that reliably
          separates a dark stone from a dark background. Drawn as real edges of
          the same geometry, so they cannot drift out of register with it. */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={GOLD_LIT} transparent opacity={0} toneMapped={false} />
      </lineSegments>
      </group>
      {/* THE TWELVE, IN FLIGHT. They were near-black at small scale on a black
          page, which meant the assembly — the entire point of the object —
          happened invisibly. Each one carries the same gold bevels as the
          stone, so what you actually see is twelve lit fragments converging
          and going out as they land. */}
      {shards.map((s, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <mesh geometry={shardGeo}>
            <meshStandardMaterial
              color="#141922"
              metalness={0.6}
              roughness={0.3}
              envMapIntensity={1.4}
              flatShading
              transparent
            />
          </mesh>
          <lineSegments geometry={shardEdges}>
            <lineBasicMaterial color={GOLD_LIT} transparent toneMapped={false} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

export default function MergeScene({ assembly, drag, live = true }) {
  return (
    <Canvas
      // 1.5 rather than 1.75: the object is all flat facets and straight
      // edges, so the extra pixels bought very little and cost real frame time
      // on high-density displays.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.4], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // A touch over 1: the scene is deliberately dark and the highlights need
      // headroom to read as gloss rather than as grey.
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.25; }}
      // Off entirely when nobody is looking — see MergeHero.
      frameloop={live ? 'always' : 'never'}
    >
      {/* Almost no ambient: fill light is what kills specular contrast, and
          contrast is the only reason a black object on a black page is visible. */}
      <ambientLight intensity={0.08} />
      <Environment resolution={256}>
        {/* A broad, dim wrap. Without something filling most of the sphere the
            environment IS the void, and a reflective object reflects it. */}
        <Lightformer form="rect" intensity={0.55} color="#8FA3C4"
                     position={[0, 0, -8]} scale={[18, 18, 1]} target={[0, 0, 0]} />
        {/* The key — a large soft white panel above right. This is the broad
            highlight that rolls across the facets as the stone turns. */}
        <Lightformer form="rect" intensity={3.4} color="#FFFFFF"
                     position={[3.2, 4.2, 3.4]} scale={[7, 7, 1]} target={[0, 0, 0]} />
        {/* The gold rim, behind and left: the edge that separates the stone
            from the background and puts Merger's accent into the object. */}
        <Lightformer form="rect" intensity={2.6} color={GOLD_LIT}
                     position={[-4.6, 0.6, -3.2]} scale={[5, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.1} color={GOLD}
                     position={[-1.4, -3.6, 2.2]} scale={[4, 2, 1]} target={[0, 0, 0]} />
        {/* A cold sliver so the dark side is not pure void. */}
        <Lightformer form="rect" intensity={0.5} color="#4E6A8C"
                     position={[2.0, -2.6, -3.0]} scale={[4, 3, 1]} target={[0, 0, 0]} />
      </Environment>
      {/* One real light on top of the environment, for the crisp edge
          highlights the reflections alone do not give. */}
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#FFF6E2" />
      {/* A second, gold, from below-left: the rim that separates the stone from
          the page and puts Merger's accent onto the object itself. */}
      <directionalLight position={[-5, -2, -3]} intensity={1.4} color={GOLD_LIT} />
      <Gem assembly={assembly} drag={drag} />
    </Canvas>
  );
}
