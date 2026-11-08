
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const scene=document.querySelector('#origin-match');
  if(!scene)return;
  const stage=scene.querySelector('.match-stage');
  const feed=scene.querySelector('.match-feed'),brand=scene.querySelector('.match-brand');
  const adrian=scene.querySelector('.match-profile-adrian'),maya=scene.querySelector('.match-profile-maya');
  const cursor=scene.querySelector('.match-cursor'),ring=scene.querySelector('.match-click-ring');
  const duration=12.6,stops={posts:1.5,adrian:4.9,maya:10.5};
  let currentView=null;
  function fit(){
    if(!stage.dataset.motion)return;
    stage.style.removeProperty('height');
    // Measure only on layout/refresh, never during the scroll animation.
    const needed=Math.max(feed.offsetTop+feed.offsetHeight,adrian.offsetHeight,maya.offsetHeight)+10;
    if(needed>stage.clientHeight)stage.style.height=Math.ceil(needed)+'px';
  }
  function setView(view){
    if(currentView===view)return;
    currentView=view;stage.dataset.view=view;
    for(const [el,key] of [[feed,'posts'],[adrian,'adrian'],[maya,'maya']]){
      const hidden=key!==view;
      el.inert=hidden;el.setAttribute('aria-hidden',String(hidden));
    }
  }
  function reset(){
    delete stage.dataset.motion;delete stage.dataset.view;currentView=null;
    stage.style.removeProperty('height');
    for(const el of [feed,adrian,maya]){el.inert=false;el.removeAttribute('aria-hidden');}
  }
  function point(person,axis,offset=0){
    const target=scene.querySelector('.match-post-'+person+' .match-author');
    // offsetLeft/Top describe the stable card layout, unaffected by entrance transforms.
    return axis==='x'?target.closest('.match-post').offsetLeft+target.offsetLeft+target.offsetWidth*.48+offset:
      feed.offsetTop+target.closest('.match-post').offsetTop+target.offsetTop+target.offsetHeight*.5+offset;
  }
  function timeline(){
    stage.dataset.motion='enabled';setView('posts');fit();
    const tl=gsap.timeline({onUpdate:()=>{
      const time=tl.time();setView(time>=8.2?'maya':time>=6.5?'posts':time>=3.25?'adrian':'posts');
    }});
    tl.fromTo(scene.querySelectorAll('.match-post'),{opacity:0,y:24,scale:.97},{opacity:1,y:0,scale:1,duration:.7,stagger:.08,ease:'power3.out'},.1);
    tl.set([adrian,maya],{autoAlpha:0,y:20,scale:.97},0);
    tl.fromTo(cursor,{opacity:0,x:()=>stage.clientWidth*.85,y:()=>stage.clientHeight*.83},{opacity:1,x:()=>point('seller','x'),y:()=>point('seller','y'),duration:.65,ease:'power2.inOut'},2.15);
    tl.to(cursor,{scale:.9,duration:.14,ease:'power2.out'},2.85);
    tl.to(cursor,{scale:1,duration:.14,ease:'power2.out'},2.99);
    tl.fromTo(ring,{opacity:0,scale:.95,x:()=>point('seller','x',-14),y:()=>point('seller','y',-14)},{opacity:.6,scale:1,duration:.12,ease:'power2.out'},2.86);
    tl.to(ring,{opacity:0,scale:1.6,duration:.35,ease:'power2.out'},2.98);
    tl.to([cursor,brand],{opacity:0,duration:.25,ease:'power2.out'},3.1);
    tl.to(feed,{autoAlpha:0,y:-15,scale:.97,duration:.4,ease:'power2.inOut'},3.1);
    tl.to(adrian,{autoAlpha:1,y:0,scale:1,duration:.55,ease:'power3.out'},3.25);
    tl.fromTo(adrian.querySelectorAll('.match-metric,.match-profile-section'),{opacity:0,y:8},{opacity:1,y:0,duration:.35,stagger:.06,ease:'power3.out'},3.65);
    tl.to(adrian,{autoAlpha:0,y:16,scale:.97,duration:.4,ease:'power2.inOut'},6.2);
    tl.to(feed,{autoAlpha:1,y:0,scale:1,duration:.45,ease:'power3.out'},6.45);
    tl.to(brand,{opacity:1,duration:.3},6.45);
    tl.fromTo(cursor,{opacity:0,x:()=>point('seller','x'),y:()=>point('seller','y')},{opacity:1,x:()=>point('investor','x'),y:()=>point('investor','y'),duration:.6,ease:'power2.inOut'},7.1);
    tl.to(cursor,{scale:.9,duration:.14,ease:'power2.out'},7.75);
    tl.to(cursor,{scale:1,duration:.14,ease:'power2.out'},7.89);
    tl.fromTo(ring,{opacity:0,scale:.95,x:()=>point('investor','x',-14),y:()=>point('investor','y',-14)},{opacity:.6,scale:1,duration:.12,ease:'power2.out'},7.76);
    tl.to(ring,{opacity:0,scale:1.6,duration:.35,ease:'power2.out'},7.88);
    tl.to([cursor,brand],{opacity:0,duration:.25},8.05);
    tl.to(feed,{autoAlpha:0,y:-15,scale:.97,duration:.4,ease:'power2.inOut'},8.05);
    tl.to(maya,{autoAlpha:1,y:0,scale:1,duration:.55,ease:'power3.out'},8.2);
    tl.fromTo(maya.querySelectorAll('.match-metric,.match-profile-section'),{opacity:0,y:8},{opacity:1,y:0,duration:.35,stagger:.06,ease:'power3.out'},8.6);
    tl.to({}, {duration:2.8},9.8);
    return tl;
  }
  // The mock authors are also inspectable: use the same scroll positions rather
  // than creating a second, competing animation state or an external profile.
  scene.querySelectorAll('[data-match-open]').forEach(button=>scope.listen(button,'click',()=>{
    const key=button.dataset.matchOpen;
    if(!stage.dataset.motion){
      (key==='posts'?feed:key==='adrian'?adrian:maya).scrollIntoView({behavior:'instant',block:'center'});
      return;
    }
    const parent=ScrollTrigger.getById('merger-origin-story');
    const mobile=ScrollTrigger.getById('merger-match-mobile');
    const trigger=parent||mobile;if(!trigger)return;
    const time=(parent?trigger.animation.labels['match-preview']:0)+stops[key];
    const y=trigger.start+(trigger.end-trigger.start)*time/trigger.animation.duration();
    const smoother=window.ScrollSmoother?.get();
    if(smoother)smoother.scrollTo(y,false);else scrollTo(0,y);
    ScrollTrigger.update();trigger.getTween()?.progress(1);trigger.animation.time(time);
    if(key==='posts')feed.querySelector('.match-author').focus({preventScroll:true});
    else (key==='adrian'?adrian:maya).querySelector('.match-back').focus({preventScroll:true});
  }));
  scope.listen(ScrollTrigger,'refreshInit',fit);
  window.MergerMatchPreview={duration,timeline,reset};
})();

}
