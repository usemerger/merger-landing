
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const section=document.querySelector('#why');
  if(!section||!window.gsap||!window.ScrollTrigger)return;
  const stage=section.querySelector('.origin-stage'),world=section.querySelector('.origin-world');
  const scenes=[...section.querySelectorAll('.origin-scene')];
  const buttons=[...section.querySelectorAll('[data-origin-jump]')];
  const route=scenes.map(scene=>[Number(scene.dataset.routeX),Number(scene.dataset.routeY)]);
  const segment=3.1,travel=1.2,hold=1.9;
  // Hold each explanatory scene: four notifications, scrolling inbox, then a
  // full document pile-up, messages becoming deals, then a gathering roundtable.
  const visionHold=window.MergerVisionStatement?.duration||14;
  const identityHold=window.MergerIdentityScan?.duration||5.6;
  const matchHold=window.MergerMatchPreview?.duration||12.6;
  const escrowHold=window.MergerEscrowVault?.duration||11.8;
  const arrivals=scenes.map((_,i)=>i<6?[0,5.9,13.3,20.9,28.5,36.9][i]:36.9+visionHold+travel+(i-6)*segment+(i>6?identityHold-hold:0)+(i>7?matchHold-hold:0));
  let timeline,stops=[],active=-1;
  gsap.registerPlugin(ScrollTrigger);

  function select(index){
    if(active===index)return;
    active=index;section.dataset.originChapter=String(index);
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    scenes.forEach((scene,i)=>{
      if(section.dataset.originMode==='pinned')scene.setAttribute('aria-hidden',String(i!==index));
      else scene.removeAttribute('aria-hidden');
    });
  }

  // One reversible scene timeline. Nothing free-runs while a visitor is reading.
  function choreograph(scene){
    const key=scene.querySelector('[data-origin-art]').dataset.originArt;
    const q=selector=>scene.querySelectorAll(selector);
    const tl=gsap.timeline();
    const renders=q('.origin-render:not(.origin-semantic-image)');
    if(renders.length)tl.fromTo(renders,{opacity:.18,scale:.97,yPercent:3},{opacity:1,scale:1,yPercent:0,duration:1.85,ease:'power2.out'},0);
    switch(key){
      case 'noise':
        tl.fromTo(q('.origin-iphone-shell'),{opacity:.58},{opacity:.85,duration:1.1,ease:'power2.out'},.55);
        tl.fromTo(q('.origin-lockscreen'),{opacity:0},{opacity:1,duration:.45,ease:'power2.out'},.6);
        q('.origin-notification').forEach((notification,i)=>{
          const start=1.2+i*.8;
          tl.fromTo(notification,{opacity:0,y:0,yPercent:-35,scale:.96},{opacity:1,y:0,yPercent:0,scale:1,duration:.42,ease:'power3.out'},start+.08);
          for(let previous=0;previous<i;previous++){
            tl.to(q('.origin-notification')[previous],{y:()=>{
              const width=scene.querySelector('.origin-lockscreen').clientWidth;
              return (i-previous)*width*.266;
            },duration:.45,ease:'power3.out'},start);
          }
        });
        break;
      case 'inbox':
        tl.fromTo(q('.origin-inbox-screen'),{opacity:.25},{opacity:1,duration:.5,ease:'power2.out'},0);
        tl.fromTo(q('.inbox-rows'),{y:0},{y:()=>{
          const list=scene.querySelector('.inbox-rows');
          const viewport=scene.querySelector('.inbox-rows-viewport');
          return -Math.max(0,list.scrollHeight-viewport.clientHeight);
        },duration:4.6,ease:'none'},.8);
        tl.to({}, {duration:.8},5.4);
        break;
      case 'overflow':
        if(window.MergerInboxTray)tl.add(window.MergerInboxTray.timeline(),0);
        break;
      case 'detection':
        if(window.MergerDealMorph)tl.add(window.MergerDealMorph.timeline(scene),0);
        break;
      case 'network':
        if(window.MergerRoundtable)tl.add(window.MergerRoundtable.timeline(scene),0);
        break;
      case 'visionstatement':
        if(window.MergerVisionStatement)tl.add(window.MergerVisionStatement.timeline(),0);
        break;
      case 'identity':
        if(window.MergerIdentityScan)tl.add(window.MergerIdentityScan.timeline(scene),0);
        break;
      case 'match':
        if(window.MergerMatchPreview)tl.add(window.MergerMatchPreview.timeline(scene),0);
        break;
      case 'escrow':
        if(window.MergerEscrowVault)tl.add(window.MergerEscrowVault.timeline(scene),0);
        break;
    }
    return tl;
  }

  const media=gsap.matchMedia();
  media.add({wide:'(min-width:720px) and (min-height:620px) and (pointer:fine)',reduce:'(prefers-reduced-motion:reduce)',all:'all'},context=>{
    window.MergerVisionStatement?.reset();window.MergerIdentityScan?.reset();window.MergerMatchPreview?.reset();window.MergerEscrowVault?.reset();
    const pin=context.conditions.wide&&!context.conditions.reduce;
    section.dataset.originMode=pin?'pinned':'flow';active=-1;select(0);
    if(context.conditions.reduce)return ()=>scenes.forEach(scene=>scene.removeAttribute('aria-hidden'));
    if(!pin){
      scenes.forEach(scene=>{
        const vision=scene.id==='origin-vision-statement';
        if((vision||scene.id==='origin-match'||scene.id==='origin-escrow')&&innerHeight<620)return;
        const motion=choreograph(scene);
        if(vision){
          ScrollTrigger.create({id:'merger-vision-mobile',trigger:scene.querySelector('.vision-stage'),start:'top top',end:()=>'+='+Math.max(2600,innerWidth*2.5),pin:true,animation:motion,scrub:.35,invalidateOnRefresh:true});
          return;
        }
        if(scene.id==='origin-match'){
          ScrollTrigger.create({id:'merger-match-mobile',trigger:scene.querySelector('.origin-art-match'),start:'top 30px',end:()=>'+='+Math.max(2800,innerHeight*4),pin:true,animation:motion,scrub:.4,invalidateOnRefresh:true});
          return;
        }
        if(scene.id==='origin-escrow'){
          ScrollTrigger.create({id:'merger-escrow-mobile',trigger:scene.querySelector('.origin-art-escrow'),start:()=>innerHeight<700?'top 58px':'top 80px',end:()=>'+='+Math.max(2900,innerHeight*3.8),pin:true,animation:motion,scrub:.4,invalidateOnRefresh:true});
          return;
        }
        const messages=scene.id==='origin-detection',roundtable=scene.id==='origin-network';
        // Let all three messages enter the narrow viewport before they turn
        // into icons; finish while the aligned results are still in view.
        ScrollTrigger.create({trigger:scene.querySelector('.origin-art'),start:messages?'top 45%':roundtable?'top 65%':'top 90%',end:messages||roundtable?'center 35%':'bottom 45%',animation:motion,scrub:.5,invalidateOnRefresh:true});
      });
      return ()=>{window.MergerVisionStatement?.reset();window.MergerIdentityScan?.reset();window.MergerMatchPreview?.reset();window.MergerEscrowVault?.reset();scenes.forEach(scene=>scene.removeAttribute('aria-hidden'));};
    }
    const place=()=>scenes.forEach((scene,i)=>gsap.set(scene,{left:route[i][0]*stage.clientWidth,top:route[i][1]*stage.clientHeight}));
    place();stops=arrivals.map((arrival,i)=>i===0?.1:arrival+(i===1?.6:i===2?.25:i===3?1.4:i===4?.55:i===5?.6:1.7));
    timeline=gsap.timeline({onUpdate:()=>{
      if(timeline){let index=0;for(let i=1;i<arrivals.length;i++)if(timeline.time()>=arrivals[i]-travel*.5)index=i;select(index);}
    },scrollTrigger:{id:'merger-origin-story',trigger:stage,start:'top top',end:()=>'+='+(Math.max(10600,innerHeight*16.3)/40.3)*(arrivals.at(-1)+escrowHold+.6),pin:true,scrub:.65,anticipatePin:1,invalidateOnRefresh:true,onRefreshInit:place}});
    scenes.forEach((scene,i)=>{
      const arrival=arrivals[i];
      if(scene.id==='origin-match')timeline.addLabel('match-preview',Math.max(0,arrival-.1));
      if(scene.id==='origin-escrow')timeline.addLabel('escrow-vault',Math.max(0,arrival-.1));
      timeline.add(choreograph(scene),Math.max(0,arrival-.1));
      if(i===0)return;
      const start=arrival-travel;
      timeline.to(world,{x:()=>-route[i][0]*stage.clientWidth,y:()=>-route[i][1]*stage.clientHeight,duration:travel,ease:'power2.inOut'},start);
      timeline.to(section.querySelector('.origin-depth'),{x:()=>-route[i][0]*stage.clientWidth*.055,y:()=>-route[i][1]*stage.clientHeight*.055,duration:travel,ease:'power2.inOut'},start);
      timeline.to(scenes[i-1],{opacity:.08,duration:.8,ease:'none'},start);
      timeline.fromTo(scene,{opacity:.08},{opacity:1,duration:.8,ease:'none'},start+.3);
      timeline.fromTo(scene.querySelector('.origin-art'),{xPercent:3,yPercent:2},{xPercent:0,yPercent:0,duration:travel,ease:'power2.out'},start);
    });
    timeline.to({}, {duration:.6},arrivals.at(-1)+escrowHold);
    return ()=>{timeline=null;window.MergerVisionStatement?.reset();window.MergerIdentityScan?.reset();window.MergerMatchPreview?.reset();window.MergerEscrowVault?.reset();section.dataset.originMode='flow';active=-1;scenes.forEach(scene=>scene.removeAttribute('aria-hidden'));};
  });
  buttons.forEach((button,index)=>scope.listen(button,'click',event=>{
    const trigger=ScrollTrigger.getById('merger-origin-story');
    if(!trigger||!timeline){scenes[index].scrollIntoView({behavior:'instant',block:'start'});return;}
    const progress=stops[index]/timeline.duration();
    const top=trigger.start+(trigger.end-trigger.start)*progress;
    const smoother=window.ScrollSmoother?.get();
    if(smoother)smoother.scrollTo(top,event.detail!==0);
    else window.scrollTo({top,behavior:event.detail!==0?'smooth':'instant'});
    if(event.detail===0){trigger.getTween()?.progress(1);timeline.progress(progress);}
  }));
  // Warm static artwork as the visitor approaches. The 3D tray loads separately
  // when its own scene is near the viewport.
  const preload=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){
      section.querySelectorAll('img').forEach(img=>{img.loading='eager';});
      preload.disconnect();
    }
  },{rootMargin:'900px'});
  preload.observe(section);
  // Reordered sections must refresh their pins in page order.
  scope.listen(window,'load',()=>{ScrollTrigger.sort();ScrollTrigger.refresh();},{once:true});
})();

}
