'use client';
import {useEffect,useRef} from 'react';
import {captureRef} from '../lib/waitlist';

export default function FunnelMotion({children}) {
  const root=useRef(null);
  useEffect(()=>{
    let cancelled=false,scope;
    const ref=captureRef();
    if(ref)root.current.querySelectorAll('a[href^="/signup"]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('ref',ref);link.setAttribute('href',url.pathname+url.search);});
    Promise.all([import('./motion/scope'),import('./motion/index')]).then(([runtime,{mounts}])=>{
      if(cancelled)return;scope=runtime.createMotionScope(root.current);
      for(const mount of mounts)scope.run(()=>mount(scope))();
      root.current.dataset.motionReady='true';
      scope.requestAnimationFrame(()=>scope.ScrollTrigger.refresh());
    }).catch(error=>{scope?.dispose();if(!cancelled){root.current.dataset.motionReady='fallback';console.error('Homepage motion unavailable',error);}});
    return()=>{cancelled=true;scope?.dispose();};
  },[]);
  return <div ref={root} className="funnel-home">{children}</div>;
}
