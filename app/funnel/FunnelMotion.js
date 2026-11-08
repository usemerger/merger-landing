'use client';
import {useEffect,useRef,useState} from 'react';
import {captureRef} from '../lib/waitlist';

export default function FunnelMotion({children}) {
  const root=useRef(null);
  const motion=useRef(null);
  const [showTop,setShowTop]=useState(false);
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;setShowTop(window.scrollY>240);};
    const onScroll=()=>{if(!frame)frame=window.requestAnimationFrame(update);};
    update();
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>{window.removeEventListener('scroll',onScroll);window.cancelAnimationFrame(frame);};
  },[]);

  function returnToTop(event){
    // Keyboard and reduced-motion visitors return immediately. Pointer users
    // keep the same scroll behavior as the rest of the funnel.
    const smooth=event.detail!==0&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smoother=motion.current?.ScrollSmoother.get();
    if(smoother)smoother.scrollTo(0,smooth);
    else window.scrollTo({top:0,behavior:smooth?'smooth':'instant'});
    if(window.location.hash)window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);
    root.current?.querySelector('.mk-brand')?.focus({preventScroll:true});
  }

  useEffect(()=>{
    let cancelled=false,scope;
    const ref=captureRef();
    if(ref)root.current.querySelectorAll('a[href^="/signup"]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('ref',ref);link.setAttribute('href',url.pathname+url.search);});
    Promise.all([import('./motion/scope'),import('./motion/index')]).then(([runtime,{mounts}])=>{
      if(cancelled)return;scope=runtime.createMotionScope(root.current);
      motion.current=scope;
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
    }).catch(error=>{scope?.dispose();motion.current=null;if(!cancelled){root.current.dataset.motionReady='fallback';console.error('Homepage motion unavailable',error);}});
    return()=>{cancelled=true;motion.current=null;scope?.dispose();};
  },[]);
  return <div ref={root} className="funnel-home">{children}
    {/* Outside smooth-content so its transform cannot move this control. */}
    <button type="button" className="funnel-back-to-top" data-visible={showTop} aria-hidden={!showTop} tabIndex={showTop?0:-1} onClick={returnToTop}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 11 6-6 6 6M12 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <span>Back to top</span>
    </button>
  </div>;
}
