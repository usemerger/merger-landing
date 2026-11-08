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
      // Native fragment positioning happens before pinned sections add their
      // scroll space. Reapply incoming links after motion and fonts settle.
      const followFragment=()=>{
        let id;try{id=decodeURIComponent(window.location.hash.slice(1));}catch{return;}
        if(!id)return;
        const target=document.getElementById(id);
        if(!target||!root.current?.contains(target))return;
        scope.ScrollTrigger.refresh();
        const smoother=scope.ScrollSmoother.get();
        if(smoother)smoother.scrollTo(target,false,'top 40px');
        else target.scrollIntoView({behavior:'instant',block:'start'});
      };
      scope.listen(window,'hashchange',followFragment);
      Promise.resolve(document.fonts?.ready).then(scope.run(()=>scope.requestAnimationFrame(followFragment)));
    }).catch(error=>{scope?.dispose();if(!cancelled){root.current.dataset.motionReady='fallback';console.error('Homepage motion unavailable',error);}});
    return()=>{cancelled=true;scope?.dispose();};
  },[]);
  return <div ref={root} className="funnel-home">{children}</div>;
}
