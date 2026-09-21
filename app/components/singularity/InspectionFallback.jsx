import React, { useEffect, useId, useRef, useState } from 'react';
import {
  inspectionAngle, inspectionAmount, inspectionPhase, fragmentTransform,
  releaseAmount, releasePhase, RELEASE_DURATION,
} from './singularity-motion.mjs';

const CORE_Y = -.255;
const SCALE = 4.6 / 888;
const REGIONS = [
  [[460,72],[140,403],[296,503]],
  [[500,56],[322,505],[500,540],[678,505]],
  [[540,72],[860,403],[704,503]],
  [[148,432],[296,522],[439,900]],
  [[322,530],[487,562],[487,944]],
  [[678,530],[513,562],[513,944]],
  [[852,432],[704,522],[561,900]],
];

// These are closed solids, not planar SVG shapes transformed edge-on. The
// seven source regions keep the original Merger silhouette at both alignments.
const PRISMS = REGIONS.map((region, index) => {
  const outline = region.map(([x,y]) => [(x-500)*SCALE,(500-y)*SCALE]);
  const area = outline.reduce((sum,a,i) => {
    const b = outline[(i+1)%outline.length];
    return sum + a[0]*b[1] - a[1]*b[0];
  }, 0);
  if (area < 0) outline.reverse();
  const center = outline.reduce((sum,p) => [sum[0]+p[0]/outline.length,sum[1]+p[1]/outline.length], [0,0]);
  const thickness = .88 + (index%3)*.055;
  const vertices = [
    ...outline.map(([x,y]) => [x-center[0],y-center[1],thickness/2]),
    ...outline.map(([x,y]) => [(x-center[0])*.92,(y-center[1])*.92,-thickness/2]),
  ];
  const count = outline.length;
  const faces = [
    { indices: Array.from({length:count},(_,i)=>i), side:false },
    { indices: Array.from({length:count},(_,i)=>count*2-1-i), side:false },
    ...outline.map((_,i) => ({ indices:[i,i+count,(i+1)%count+count,(i+1)%count], side:true })),
  ];
  return { vertices, faces, base:[center[0],center[1],-.18] };
});

function rotate([x,y,z], [rx,ry,rz]) {
  const cx=Math.cos(rx), sx=Math.sin(rx), cy=Math.cos(ry), sy=Math.sin(ry), cz=Math.cos(rz), sz=Math.sin(rz);
  const ay=y*cx-z*sx, az=y*sx+z*cx;
  const bx=x*cy+az*sy, bz=-x*sy+az*cy;
  return [bx*cz-ay*sz,bx*sz+ay*cz,bz];
}

function frameGeometry(seconds, motion, manualStart) {
  const yaw = inspectionAngle(seconds) + (motion.yaw || 0);
  const autoAmount = inspectionAmount(yaw);
  const sinceRelease = seconds-manualStart;
  const manualActive = sinceRelease >= 0 && sinceRelease < RELEASE_DURATION;
  const amount = Math.max(autoAmount, manualActive ? releaseAmount(sinceRelease) : 0);
  const phase = manualActive ? releasePhase(sinceRelease) : inspectionPhase(yaw, autoAmount);
  // Pointer parallax fades as the logo aligns, retaining a clean silhouette.
  const globalRotation = [
    (motion.pitch || 0) + Math.sin(seconds*.31)*.09*amount - (motion.pointerY || 0)*.045*amount,
    yaw + (motion.pointerX || 0)*.04*amount,
    0,
  ];
  const zoom = 1-amount*.17;
  const hover = Math.sin(seconds*.5)*.045;
  const world = point => {
    const rotated = rotate(point, globalRotation);
    return [rotated[0]*zoom,(rotated[1]+hover)*zoom,rotated[2]*zoom];
  };
  const projectWorld = ([x,y,z]) => {
    const perspective = 12/(12-z);
    return [310+x*94*perspective,320-y*94*perspective,z];
  };
  const project = point => projectWorld(world(point));
  const format = point => `${point[0].toFixed(2)},${point[1].toFixed(2)}`;
  const faces = [];
  const tethers = [];
  const center = project([0,CORE_Y,0]);

  PRISMS.forEach((prism,index) => {
    const transform = fragmentTransform(index,prism.base,amount,seconds);
    const vertices = prism.vertices.map(vertex => {
      const local = rotate(vertex,transform.rotation);
      return world(local.map((value,axis)=>value+transform.position[axis]));
    });
    prism.faces.forEach((face,faceIndex) => {
      const points = face.indices.map(i=>vertices[i]);
      const [a,b,c] = points;
      const ab=b.map((value,i)=>value-a[i]), ac=c.map((value,i)=>value-a[i]);
      const normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      const length=Math.hypot(...normal)||1;
      const illumination=Math.max(0,(normal[0]*-.34+normal[1]*.64+normal[2]*.69)/length);
      const highlight=Math.pow(illumination,5)*20;
      const shade=Math.round(13+illumination*21+highlight);
      faces.push({
        key:`${index}-${faceIndex}`,
        depth:points.reduce((sum,p)=>sum+p[2]/points.length,0),
        points:points.map(p=>format(projectWorld(p))).join(' '),
        fill:face.side ? `rgb(${shade+5},${shade+1},${Math.max(9,shade-5)})` : `rgb(${shade},${shade+2},${shade+7})`,
        side:face.side,
      });
    });
    const anchor=project(transform.position);
    for (let strand=0;strand<2;strand++) {
      const bend=(strand ? -1 : 1)*(8+amount*12)*Math.sin(seconds*.55+index);
      tethers.push(`M${format(center)} Q${((center[0]+anchor[0])/2+bend).toFixed(2)},${((center[1]+anchor[1])/2-9).toFixed(2)} ${format(anchor)}`);
    }
  });
  faces.sort((a,b)=>a.depth-b.depth);

  const rings = Array.from({length:3},(_,ring) => {
    const radius=.30+amount*(.50+ring*.13);
    const points=Array.from({length:65},(_,i) => {
      const angle=i/64*Math.PI*2+seconds*(.6+ring*.15);
      const orbit=rotate([Math.cos(angle)*radius,Math.sin(angle)*radius,0],[.67+ring*.83,seconds*.23+ring*1.1,ring*.58]);
      return format(project([orbit[0],orbit[1]+CORE_Y,orbit[2]]));
    });
    return `M${points.join(' L')} Z`;
  });
  const sparks=Array.from({length:30},(_,i) => {
    const angle=i*2.39996+seconds*(.1+(i%4)*.022);
    const radius=.62+(i%7)*.35+amount*.26;
    const point=project([Math.cos(angle)*radius,CORE_Y+Math.sin(angle)*radius*.87,Math.sin(i*1.91+seconds*.13)*1.15]);
    return { x:point[0], y:point[1], radius:.5+(i%4)*.21, opacity:.13+amount*.38+(i%3)*.045 };
  });
  return {faces,tethers,center,rings,sparks,amount,phase,manualActive,yaw};
}

export default function InspectionFallback({ motion, active, quiet, onPhase }) {
  const id=`inspection-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
  const elapsed=useRef(0);
  const releaseStart=useRef(-100);
  const lastRelease=useRef(motion.current.release);
  const lastPhase=useRef('');
  const phaseCallback=useRef(onPhase);
  phaseCallback.current=onPhase;
  const [frame,setFrame]=useState(()=>frameGeometry(0,{...motion.current,yaw:0,pitch:0,pointerX:0,pointerY:0},-100));

  useEffect(() => {
    if (!active || quiet) return;
    let animationFrame;
    let previousTime=null;
    let previousPaint=-Infinity;
    const animate=timestamp => {
      if (previousTime !== null && !motion.current.interacting) elapsed.current+=Math.min((timestamp-previousTime)/1000,.05);
      previousTime=timestamp;
      if (motion.current.release !== lastRelease.current) {
        lastRelease.current=motion.current.release;
        releaseStart.current=elapsed.current;
      }
      if (timestamp-previousPaint >= 1000/30) {
        previousPaint=timestamp;
        const next=frameGeometry(elapsed.current,motion.current,releaseStart.current);
        motion.current.inspectionTime=elapsed.current;
        motion.current.viewYaw=next.yaw;
        motion.current.expansion=next.amount;
        setFrame(next);
        const phaseKey=`${next.phase}:${next.manualActive}`;
        if (phaseKey !== lastPhase.current) {
          lastPhase.current=phaseKey;
          phaseCallback.current?.(next.phase,next.manualActive);
        }
      }
      animationFrame=requestAnimationFrame(animate);
    };
    animationFrame=requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [active,quiet,motion]);

  const [cx,cy]=frame.center;
  return <svg aria-hidden="true" viewBox="0 0 620 640" data-inspection-fallback="true" data-inspection-amount={frame.amount.toFixed(3)} data-inspection-yaw={frame.yaw.toFixed(3)}
    style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none'}}>
    <defs>
      <radialGradient id={`${id}-glow`}><stop stopColor="#ffedb4" stopOpacity=".84"/><stop offset=".10" stopColor="#e9b557" stopOpacity=".53"/><stop offset=".34" stopColor="#dc982e" stopOpacity=".15"/><stop offset="1" stopColor="#d59b41" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#efd399" stopOpacity=".86"/><stop offset=".30" stopColor="#775d32" stopOpacity=".52"/><stop offset=".72" stopColor="#433829" stopOpacity=".64"/><stop offset="1" stopColor="#bd975a" stopOpacity=".72"/></linearGradient>
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2=".85" y2="1"><stop stopColor="#bdc7da" stopOpacity=".13"/><stop offset=".30" stopColor="#b8c3dc" stopOpacity=".015"/><stop offset=".69" stopColor="#05060b" stopOpacity=".10"/><stop offset="1" stopColor="#d9b46b" stopOpacity=".08"/></linearGradient>
    </defs>
    <circle cx={cx} cy={cy} r={80+frame.amount*66} fill={`url(#${id}-glow)`} opacity={.50+frame.amount*.38}/>
    <g fill="#edc178">{frame.sparks.map((spark,i)=><circle key={i} cx={spark.x} cy={spark.y} r={spark.radius} opacity={spark.opacity}/>)}</g>
    <g stroke="#e4ae54" fill="none" strokeWidth=".65" opacity={.18+frame.amount*.46}>
      {frame.tethers.map((path,i)=><path key={i} d={path}/>)}
    </g>
    <g fill="none" opacity={.12+frame.amount*.78}>
      {frame.rings.map((path,i)=><path key={i} d={path} stroke={i===0?'#ffdc8f':'#dca956'} strokeWidth={i===0?1.55:.70}/>)}
    </g>
    <circle cx={cx} cy={cy} r={4.5+frame.amount*8} fill="#100d08" stroke="#f7d084" strokeWidth={.9+frame.amount*.8}/>
    <circle cx={cx} cy={cy} r={2.4+frame.amount*.6} fill="#ffe5a7" opacity={1-frame.amount*.64}/>
    <g stroke={`url(#${id}-edge)`} strokeWidth=".85" strokeLinejoin="round">
      {frame.faces.map(face=><g key={face.key}>
        <polygon points={face.points} fill={face.fill}/>
        {!face.side && <polygon points={face.points} fill={`url(#${id}-sheen)`} stroke="none"/>}
      </g>)}
    </g>
  </svg>;
}
