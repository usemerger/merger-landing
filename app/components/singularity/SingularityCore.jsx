'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const diskVertex = `
  varying vec2 vDisk;
  void main() {
    vDisk = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const diskFragment = `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform float uFine;
  varying vec2 vDisk;
  void main() {
    float r = length(vDisk);
    float angle = atan(vDisk.y, vDisk.x);
    float inner = smoothstep(.155, .21, r);
    float outer = 1.0 - smoothstep(.39, .55, r);
    float current = pow(.5 + .5 * sin(angle * 3.0 + r * 45.0 - uTime * 2.7), 7.0);
    float strands = pow(.5 + .5 * sin(r * 124.0 + sin(angle * 4.0 - uTime) * 1.5), 13.0);
    float hotRim = exp(-abs(r - .186) * 91.0);
    float orbit = .55 + .45 * pow(.5 + .5 * sin(angle * 2.0 - uTime * 1.3), 2.0);
    float alpha = inner * outer * (.11 + strands * .5 + current * .45) * orbit;
    alpha += hotRim * (.58 + orbit * .4);
    alpha *= mix(.4, 1.2, uEnergy) * mix(1.0, .68, uFine);
    alpha += hotRim * uPulse * .28;
    vec3 amber = vec3(1.0, .49, .13);
    vec3 gold = vec3(1.0, .79, .39);
    vec3 ivory = vec3(1.0, .95, .77);
    vec3 color = mix(amber, gold, clamp(strands + current + .18, 0.0, 1.0));
    color = mix(color, ivory, hotRim * .76);
    gl_FragColor = vec4(color, alpha);
  }
`;

const horizonVertex = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-p.xyz);
    gl_Position = projectionMatrix * p;
  }
`;

const horizonFragment = `
  uniform float uEnergy;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 4.0);
    vec3 core = vec3(.003, .004, .007);
    vec3 corona = vec3(1.0, .65, .23) * (.58 + uEnergy * .65 + uPulse * .65);
    gl_FragColor = vec4(core + corona * rim, 1.0);
  }
`;

const streamVertex = `
  attribute float aPhase;
  attribute float aArm;
  attribute float aSize;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float journey = fract(aPhase + uTime * (.073 + aArm * .007));
    float radius = mix(.58, .155, journey);
    float angle = aArm * 2.094395 + journey * 9.6 + uTime * .29;
    float lift = sin(journey * 6.283185 + aArm * 2.094395) * (.11 + (1.0 - journey) * .15);
    vec3 p = vec3(cos(angle) * radius, sin(angle) * radius * .78, lift);
    float tilt = .7 + aArm * .38;
    p = vec3(p.x, p.y * cos(tilt) - p.z * sin(tilt), p.y * sin(tilt) + p.z * cos(tilt));
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp(aSize * uPixelRatio * (8.0 / max(1.0, -view.z)), 1.0, 5.0);
    vAlpha = sin(journey * 3.141593) * (.25 + uEnergy * .65) + uPulse * .12;
    vHeat = journey;
  }
`;

const streamFragment = `
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float r = length(gl_PointCoord - vec2(.5));
    float alpha = (1.0 - smoothstep(.09, .5, r)) * vAlpha;
    vec3 color = mix(vec3(1.0, .56, .15), vec3(1.0, .9, .59), vHeat);
    gl_FragColor = vec4(color, alpha);
  }
`;

function makeAuraTexture() {
  const width = 96;
  const data = new Uint8Array(width * width * 4);
  for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
    const radius = Math.hypot((x + .5 - width / 2) / (width / 2), (y + .5 - width / 2) / (width / 2));
    const hole = THREE.MathUtils.smoothstep(radius, .18, .27);
    const corona = Math.exp(-Math.pow((radius - .3) / .12, 2));
    const fade = Math.exp(-radius * radius * 5.5) * (1 - THREE.MathUtils.smoothstep(radius, .7, 1));
    const offset = (y * width + x) * 4;
    data[offset] = 255;
    data[offset + 1] = Math.round(157 + corona * 51);
    data[offset + 2] = Math.round(55 + corona * 57);
    data[offset + 3] = Math.round(Math.min(1, hole * fade * (.58 + corona * .62)) * 255);
  }
  const texture = new THREE.DataTexture(data, width, width);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** A local-space core. The parent's clock controls every animated element. */
export default function SingularityCore({ energy, compact = false }) {
  const group = useRef();
  const disk = useRef();
  const crossDisk = useRef();
  const orbit = useRef();
  const impact = useRef();
  const light = useRef();
  const aura = useRef();
  const auraMap = useMemo(makeAuraTexture, []);
  const count = compact ? 84 : 180;

  useEffect(() => () => auraMap.dispose(), [auraMap]);

  const uniforms = useMemo(() => ({
    disk: { uTime: { value: 0 }, uEnergy: { value: 0 }, uPulse: { value: 0 }, uFine: { value: 0 } },
    cross: { uTime: { value: 0 }, uEnergy: { value: 0 }, uPulse: { value: 0 }, uFine: { value: 1 } },
    horizon: { uEnergy: { value: 0 }, uPulse: { value: 0 } },
    stream: { uTime: { value: 0 }, uEnergy: { value: 0 }, uPulse: { value: 0 }, uPixelRatio: { value: 1 } },
  }), []);

  const attributes = useMemo(() => {
    const position = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const arm = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      phase[i] = (i * .61803398875) % 1;
      arm[i] = i % 3;
      size[i] = 1.05 + ((i * .381966) % 1) * 1.7;
    }
    return { position, phase, arm, size };
  }, [count]);

  useFrame(({ gl }) => {
    const state = energy.current;
    if (!state || !group.current) return;
    const openness = THREE.MathUtils.clamp(state.amount, 0, 1.15);
    const visibility = THREE.MathUtils.smoothstep(openness, .025, .8);
    const t = Number.isFinite(state.time) ? state.time : 0;
    const pulse = state.reduced ? 0 : THREE.MathUtils.clamp(state.pulse || 0, 0, 1);

    // A small junction while assembled, a spherical vortex as the shell opens.
    group.current.scale.setScalar(.2 + visibility * 1.15 + pulse * .035);
    disk.current.rotation.set(.58 + Math.sin(t * .13) * .12, .2, t * .075);
    crossDisk.current.rotation.set(1.8, -.55 + Math.sin(t * .11) * .11, -t * .1);
    orbit.current.rotation.set(.95, .75, t * .14);
    orbit.current.material.opacity = .025 + visibility * .2 + pulse * .11;
    aura.current.material.opacity = .055 + THREE.MathUtils.smoothstep(openness, .15, .75) * .46 + pulse * .1;
    aura.current.scale.setScalar(1.42 + pulse * .08);

    impact.current.rotation.copy(disk.current.rotation);
    impact.current.scale.setScalar(1 + (1 - pulse) * .4);
    impact.current.material.opacity = pulse * visibility * .3;
    light.current.intensity = 1.35 + visibility * 2.2 + pulse * 1.6;

    for (const values of Object.values(uniforms)) {
      if (values.uTime) values.uTime.value = t;
      values.uEnergy.value = visibility;
      values.uPulse.value = pulse;
    }
    uniforms.stream.uPixelRatio.value = Math.min(gl.getPixelRatio(), compact ? 1 : 1.5);
  });

  return (
    <group ref={group} position={[0, -.255, 0]} scale={.2}>
      <sprite ref={aura} scale={1.42}>
        <spriteMaterial map={auraMap} transparent opacity={.055} depthWrite={false}
          blending={THREE.AdditiveBlending} toneMapped={false}/>
      </sprite>
      <mesh>
        <sphereGeometry args={[.155, compact ? 24 : 40, compact ? 16 : 24]}/>
        <shaderMaterial uniforms={uniforms.horizon} vertexShader={horizonVertex} fragmentShader={horizonFragment} toneMapped={false}/>
      </mesh>
      <mesh ref={disk} rotation={[.58, .2, 0]}>
        <ringGeometry args={[.158, .55, compact ? 64 : 112, 1]}/>
        <shaderMaterial uniforms={uniforms.disk} vertexShader={diskVertex} fragmentShader={diskFragment}
          side={THREE.DoubleSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
      </mesh>
      <mesh ref={crossDisk} rotation={[1.8, -.55, 0]}>
        <ringGeometry args={[.158, .55, compact ? 48 : 80, 1]}/>
        <shaderMaterial uniforms={uniforms.cross} vertexShader={diskVertex} fragmentShader={diskFragment}
          side={THREE.DoubleSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
      </mesh>
      <mesh ref={orbit} rotation={[.95, .75, 0]}>
        <torusGeometry args={[.39, .0019, 4, compact ? 64 : 96]}/>
        <meshBasicMaterial color="#f7ce7c" transparent opacity={.025} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
      </mesh>
      <mesh ref={impact}>
        <torusGeometry args={[.435, .003, 4, compact ? 64 : 96]}/>
        <meshBasicMaterial color="#fff0c5" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
      </mesh>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[attributes.position, 3]}/>
          <bufferAttribute attach="attributes-aPhase" args={[attributes.phase, 1]}/>
          <bufferAttribute attach="attributes-aArm" args={[attributes.arm, 1]}/>
          <bufferAttribute attach="attributes-aSize" args={[attributes.size, 1]}/>
        </bufferGeometry>
        <shaderMaterial uniforms={uniforms.stream} vertexShader={streamVertex} fragmentShader={streamFragment}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
      </points>
      <pointLight ref={light} color="#efba60" intensity={1.35} distance={4} decay={2}/>
    </group>
  );
}
