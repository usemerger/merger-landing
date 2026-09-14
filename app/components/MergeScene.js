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

function Gem({ assembly, pointer, scroll }) {
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
      // Alive: a slow idle turn, the pointer tilting it, scroll nudging it.
      // Damped toward the target so it feels weighted rather than wired
      // straight to the mouse.
      const ty = pointer.current.x * 0.42 + state.clock.elapsedTime * 0.085 + scroll.current * 0.6;
      const tx = pointer.current.y * 0.26 + scroll.current * 0.15;
      group.current.rotation.y += (ty - group.current.rotation.y) * k;
      group.current.rotation.x += (tx - group.current.rotation.x) * k;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.06 - scroll.current * 0.4;
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

export default function MergeScene({ assembly, pointer, scroll, live = true }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
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
      <Gem assembly={assembly} pointer={pointer} scroll={scroll} />
    </Canvas>
  );
}
