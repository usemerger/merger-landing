'use client';

import React, { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { releaseAmount, releasePhase, RELEASE_DURATION, seeded, inspectionAngle, inspectionAmount, inspectionPhase, inspectionScale, fragmentTransform } from './singularity-motion.mjs';
import SingularityCore from './SingularityCore';
import InspectionFallback from './InspectionFallback';
import './singularity.css';

const MODEL_URL = '/models/merger-singularity.glb?v=inspection-2';
const CORE_Y = -.255;

class GraphicsBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Relic({ motion, compact, reduced, onReady, onPhase }) {
  const { scene } = useGLTF(MODEL_URL);
  const size = useThree(state=>state.size);
  const root = useRef();
  const shardRefs = useRef([]);
  const filament = useRef();
  const particles = useRef();
  const energy = useRef({amount:0,time:0,pulse:0,reduced:false});
  const ready = useRef(false);
  const phaseRef = useRef({label:'',manual:false});
  const userYaw = useRef(0);
  const previousAmount = useRef(0);
  const localTime = useRef(0);
  const kineticStart = useRef(-100);
  const lastRelease = useRef(0);
  const particleCount = compact ? 115 : 210;

  const shards = useMemo(() => {
    scene.updateMatrixWorld(true);
    const result = [];
    scene.traverse(node => {
      if (!/^shard_\d+$/.test(node.name)) return;
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      node.matrixWorld.decompose(position, quaternion, scale);
      const content = node.clone(true);
      content.position.set(0,0,0);
      content.quaternion.identity();
      content.scale.set(1,1,1);
      const materials = [];
      const edges = [];
      const outlineParts = [];
      content.updateMatrixWorld(true);
      content.traverse(part => {
        if (!part.isMesh) return;
        const copies = (Array.isArray(part.material) ? part.material : [part.material]).map(material => {
          const copy = material.clone();
          copy.envMapIntensity = 1.45;
          materials.push(copy);
          return copy;
        });
        part.material = Array.isArray(part.material) ? copies : copies[0];
        outlineParts.push(part.geometry.clone().applyMatrix4(part.matrixWorld));
      });
      // One outline per fragment avoids five extra draws for its material primitives.
      const outline = mergeGeometries(outlineParts,false);
      if (outline) {
        const geometry = new THREE.EdgesGeometry(outline,32);
        const material = new THREE.LineBasicMaterial({color:'#d0aa64',transparent:true,opacity:.13,depthWrite:false});
        const edge = new THREE.LineSegments(geometry,material);
        content.add(edge);
        edges.push(edge);
        outline.dispose();
      }
      outlineParts.forEach(part=>part.dispose());
      const index = result.length;
      result.push({
        name: node.name, content, materials, edges,
        position, base:position.toArray(), quaternion, scale,
        phase: seeded(index, 8)*Math.PI*2,
      });
    });
    if (!result.length) throw new Error('The Merger model contains no independently animated shards.');
    return result;
  }, [scene]);

  const tetherPositions = useMemo(() => new Float32Array(shards.length * 2 * 8 * 2 * 3), [shards.length]);
  const particlePositions = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);
  const particleSizes = useMemo(() => Float32Array.from({length:particleCount}, (_,i) => .7+Math.pow(seeded(i,20),3)*2.1), [particleCount]);
  const rotation = useMemo(() => new THREE.Euler(), []);
  const wobbleQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const anchor = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => {
    shards.forEach(shard => {
      shard.edges.forEach(edge => { edge.geometry.dispose(); edge.material.dispose(); });
      shard.materials.forEach(material => material.dispose());
    });
  }, [shards]);

  useFrame((_, delta) => {
    if (!ready.current) { ready.current = true; onReady(); }
    const dt = Math.min(delta, .05);
    if (!reduced && !motion.current.interacting) localTime.current += dt;
    const time = localTime.current;
    if (motion.current.release !== lastRelease.current) {
      kineticStart.current = time;
      lastRelease.current = motion.current.release;
    }
    const sinceRelease = time - kineticStart.current;
    const manual = sinceRelease >= 0 && sinceRelease < RELEASE_DURATION;
    if (!reduced) userYaw.current = THREE.MathUtils.damp(userYaw.current,motion.current.yaw,5,dt);
    const angle = inspectionAngle(time) + userYaw.current;
    const automatic = inspectionAmount(angle);
    const amount = Math.max(automatic, releaseAmount(sinceRelease));
    const phase = manual ? releasePhase(sinceRelease) : inspectionPhase(angle,automatic);
    if (phaseRef.current.label !== phase || phaseRef.current.manual !== manual) {
      phaseRef.current = {label:phase,manual}; onPhase(phase,manual);
    }
    root.current.rotation.y = angle;
    const targetX = THREE.MathUtils.clamp(motion.current.pitch + automatic*(Math.sin(time*.25)*.095-motion.current.pointerY*.055),-.45,.45);
    if (!reduced) root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x,targetX,4,dt);
    root.current.position.y = Math.sin(time*.5)*.045;
    // Keep the front silhouette full size; the 3D orbit gains breathing room.
    root.current.scale.setScalar(inspectionScale(amount,size.width/Math.max(1,size.height)));
    const contraction = Math.max(0,previousAmount.current-amount)/Math.max(dt,.001);
    if(!reduced) previousAmount.current=amount;
    energy.current.amount = Math.max(0,amount);
    energy.current.time = time;
    energy.current.pulse = Math.min(1,contraction*.6);
    energy.current.reduced = reduced;
    motion.current.inspectionTime = time;
    motion.current.viewYaw = angle;
    motion.current.expansion = amount;
    let lineOffset = 0;
    shards.forEach((shard, index) => {
      const group = shardRefs.current[index];
      const transform=fragmentTransform(index,shard.base,amount,time);
      group.position.fromArray(transform.position);
      rotation.fromArray(transform.rotation);
      wobbleQuaternion.setFromEuler(rotation);
      group.quaternion.copy(shard.quaternion).multiply(wobbleQuaternion);
      for (let strand=0; strand<2; strand++) {
        anchor.copy(group.position);
        anchor.x += (strand ? 1 : -1)*.07;
        anchor.y += (strand ? .04 : -.04);
        const bend = Math.sin(time*.75+shard.phase+strand)*(.038+amount*.20);
        for (let segment=0; segment<8; segment++) {
          for (let endpoint=0; endpoint<2; endpoint++) {
            const t = (segment+endpoint)/8;
            const curve = Math.sin(t*Math.PI);
            tetherPositions[lineOffset++] = anchor.x*t + bend*curve + Math.sin(time*.7+strand+shard.phase)*curve*amount*.045;
            tetherPositions[lineOffset++] = CORE_Y+(anchor.y-CORE_Y)*t + curve*(strand ? -.05 : .05);
            tetherPositions[lineOffset++] = .045 + (anchor.z-.045)*t + curve*bend;
          }
        }
      }
    });
    filament.current.geometry.attributes.position.needsUpdate = true;
    filament.current.material.opacity = .11 + amount*.40;
    for (let i=0; i<particleCount; i++) {
      const angle = seeded(i, 11)*Math.PI*2 + time*(.027+seeded(i, 12)*.034 + amount*.055);
      const radial = 1 + amount*.11;
      const radius = 1.65 + seeded(i, 13)*1.55;
      particlePositions[i*3] = Math.cos(angle)*radius*radial;
      particlePositions[i*3+1] = Math.sin(angle)*(1.45+seeded(i, 14)*1.45)*radial;
      particlePositions[i*3+2] = (seeded(i, 15)-.5)*2.5 - .5;
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={root}>
      {shards.map((shard,index) => (
        <group key={shard.name} ref={node => { shardRefs.current[index]=node; }} position={shard.position} quaternion={shard.quaternion} scale={shard.scale}>
          <primitive object={shard.content} dispose={null}/>
        </group>
      ))}
      <lineSegments ref={filament} frustumCulled={false}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[tetherPositions,3]} usage={THREE.DynamicDrawUsage}/></bufferGeometry>
        <lineBasicMaterial color="#efbd69" transparent opacity={.4} depthWrite={false} blending={THREE.AdditiveBlending}/>
      </lineSegments>
      <SingularityCore energy={energy} compact={compact}/>
      <points ref={particles} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions,3]} usage={THREE.DynamicDrawUsage}/>
          <bufferAttribute attach="attributes-size" args={[particleSizes,1]}/>
        </bufferGeometry>
        <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
          uniforms={{uPixelRatio:{value:Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.5)}}}
          vertexShader={`attribute float size; uniform float uPixelRatio; varying float vBrightness; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*p; gl_PointSize=size*uPixelRatio*(8.0/-p.z); vBrightness=.45+size*.13; }`}
          fragmentShader={`varying float vBrightness; void main(){ float r=length(gl_PointCoord-vec2(.5)); float a=smoothstep(.5,.08,r)*vBrightness; gl_FragColor=vec4(1.0,.71,.34,a); }`}/>
      </points>
    </group>
  );
}

function GraphicsHealth({ onFailure }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = event => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl,onFailure]);
  return null;
}

function Scene({ motion, compact, reduced, onReady, onFailure, onPhase }) {
  return <>
    <GraphicsHealth onFailure={onFailure}/>
    <ambientLight intensity={.24}/>
    <directionalLight position={[3,5,6]} color="#fff1d4" intensity={2.4}/>
    <directionalLight position={[-4,1,2]} color="#a5b3d0" intensity={1.1}/>
    <directionalLight position={[1,-3,-2]} color="#dfaa55" intensity={1.5}/>
    <Environment resolution={compact ? 128 : 256}>
      <Lightformer form="rect" intensity={3.5} color="#fff4df" position={[-4,5,3]} rotation={[0,Math.PI/5,-.4]} scale={[3,8,1]}/>
      <Lightformer form="rect" intensity={2.2} color="#a8b8d5" position={[4,1,4]} rotation={[0,-Math.PI/4,.3]} scale={[1.5,7,1]}/>
      <Lightformer form="rect" intensity={3} color="#f0bc66" position={[0,-4,1]} rotation={[Math.PI/3,0,0]} scale={[5,.8,1]}/>
      <Lightformer form="ring" intensity={1} color="#ecc78a" position={[0,1,-4]} scale={4}/>
    </Environment>
    <Relic motion={motion} compact={compact} reduced={reduced} onReady={onReady} onPhase={onPhase}/>
  </>;
}

export default function Singularity({ className = '', paused = false, forceFallback = false }) {
  const host = useRef();
  const pointer = useRef(null);
  const motion = useRef({ yaw:0, pitch:0, pointerX:0, pointerY:0, release:0 });
  const [eligible,setEligible] = useState(false);
  const [failed,setFailed] = useState(false);
  const [ready,setReady] = useState(false);
  const [compact,setCompact] = useState(false);
  const [reduced,setReduced] = useState(true);
  const [live,setLive] = useState(true);
  const released = useRef(false);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onPhase = useCallback((_phase,manualActive=false) => {
    if (!manualActive) released.current = false;
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallQuery = window.matchMedia('(max-width: 720px)');
    const update = () => { setReduced(motionQuery.matches); setCompact(smallQuery.matches); };
    update();
    for (const query of [motionQuery,smallQuery]) {
      if (query.addEventListener) query.addEventListener('change', update); else query.addListener(update);
    }
    try {
      const probe = document.createElement('canvas');
      const context = probe.getContext('webgl2', { failIfMajorPerformanceCaveat:false });
      setEligible(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setEligible(false); }
    return () => {
      for (const query of [motionQuery,smallQuery]) {
        if (query.removeEventListener) query.removeEventListener('change', update); else query.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    let visible = true;
    const update = () => setLive(visible && !document.hidden);
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; update();
    }, {rootMargin:'100px'}) : null;
    if (host.current) observer?.observe(host.current);
    document.addEventListener('visibilitychange',update);
    update();
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange',update); };
  }, []);

  const enhanced = eligible && !failed && !forceFallback;
  const quiet = reduced || paused;
  useEffect(() => {
    if (!enhanced) setReady(false);
  }, [enhanced]);
  useEffect(() => {
    if (!enhanced || ready || !live) return;
    const timeout = window.setTimeout(onFailure,18000);
    return () => window.clearTimeout(timeout);
  }, [enhanced,ready,live,onFailure]);

  const release = useCallback(() => {
    if (released.current || quiet) return;
    motion.current.release += 1;
    released.current = true;
  }, [quiet]);

  const pointerDown = event => {
    if (event.button !== 0 || !event.isPrimary || quiet || pointer.current) return;
    pointer.current = {id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY};
    motion.current.interacting = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = event => {
    if (quiet) return;
    const active = pointer.current;
    if (active && active.id !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    motion.current.pointerX = Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
    motion.current.pointerY = Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
    if (!active) return;
    motion.current.yaw += (event.clientX-active.x)/Math.max(bounds.width,1)*3.5;
    motion.current.pitch = THREE.MathUtils.clamp(motion.current.pitch+(event.clientY-active.y)/Math.max(bounds.height,1)*1.8,-.45,.45);
    active.x=event.clientX; active.y=event.clientY;

  };
  const pointerEnd = event => {
    const active = pointer.current;
    if (!active || active.id !== event.pointerId) return;
    if (event.type === 'pointerup' && Math.hypot(event.clientX-active.startX,event.clientY-active.startY)<7) release();
    pointer.current = null;
    motion.current.interacting = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = event => {
    if (quiet) return;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') motion.current.yaw -= .2;
    if (event.key === 'ArrowRight') motion.current.yaw += .2;
    if (event.key === 'ArrowUp') motion.current.pitch = Math.max(-.45,motion.current.pitch-.12);
    if (event.key === 'ArrowDown') motion.current.pitch = Math.min(.45,motion.current.pitch+.12);
    if (event.key === 'Home') { motion.current.yaw=-inspectionAngle(motion.current.inspectionTime || 0); motion.current.pitch=0; }
    if (event.key === 'Enter' || event.key === ' ') release();

  };

  return (
    <div ref={host} className={`singularity-stage ${className}${enhanced && ready ? ' is-ready' : ''}${quiet ? ' is-reduced' : ''}`} data-renderer={enhanced && ready ? 'webgl' : 'svg'} data-ready={enhanced && ready} data-motion={quiet ? 'reduced' : 'full'}>
      <div className="singularity-aura" aria-hidden="true"/>
      <div className="singularity-orbit orbit-one" aria-hidden="true"/>
      <div className="singularity-orbit orbit-two" aria-hidden="true"/>
      <div className="singularity-interaction" role="img" aria-label="Merger diamond slowly rotates, separates in three dimensions, and reforms when facing forward. Drag to inspect. Press Enter to release its fragments, or use the arrow keys to rotate and Home to face forward." tabIndex={quiet ? -1 : 0}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={() => { pointer.current=null; motion.current.interacting=false; }}
        onPointerLeave={() => { motion.current.pointerX=0; motion.current.pointerY=0; }} onKeyDown={onKeyDown}>
        <div className="singularity-fallback"><InspectionFallback motion={motion} active={live && !(enhanced && ready)} quiet={quiet} onPhase={enhanced && ready ? undefined : onPhase}/></div>
        {enhanced && <div className="singularity-canvas">
          <GraphicsBoundary onFailure={onFailure}>
            <Canvas camera={{position:[0,0,9.8],fov:36,near:.1,far:40}} dpr={compact ? 1 : [1,1.5]} frameloop={!live ? 'never' : quiet ? 'demand' : 'always'}
              gl={{antialias:!compact,alpha:true,powerPreference:'default'}} onCreated={({gl}) => { gl.setClearColor('#08090d',0); gl.toneMapping=THREE.ACESFilmicToneMapping; gl.toneMappingExposure=1.1; }}>
              <Suspense fallback={null}><Scene motion={motion} compact={compact} reduced={quiet} onReady={onReady} onFailure={onFailure} onPhase={onPhase}/></Suspense>
            </Canvas>
          </GraphicsBoundary>
        </div>}
      </div>
    </div>
  );
}
