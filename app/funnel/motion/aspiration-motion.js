import {touchStory} from './touch-story';
import {scrollFrames} from './scroll-frames';

export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
 'use strict';
 const section=document.querySelector('#aspiration');if(!section)return;
 const rail=section.querySelector('.aspiration-rail'),stage=section.querySelector('.aspiration-stage');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)'),logoHost=section.querySelector('.aspiration-singularity');
 const car=section.querySelector('.aspiration-car'),watch=section.querySelector('.aspiration-watch'),people=section.querySelector('.aspiration-people');
 let logo,logoPromise,logoAmount=0,logoTime=0,visible=false,disposed=false;

 const sequence=(host,folder,count,options={})=>scrollFrames(scope,host,folder,count,{...options,active:()=>visible&&!disposed,reduced:()=>reduce.matches});
 const carSequence=sequence(car,'car-silhouette-frames',16,{loop:4});
 const watchSequence=sequence(watch,'watch-cinematic-frames',96);
 const peopleSequence=sequence(people,'handshake-frames',96);
 const players=[carSequence,watchSequence,peopleSequence];
 function updateLogo(amount,time){
  logoAmount=amount;logoTime=time;if(!reduce.matches)logo?.update(amount,time);
  logoHost.dataset.openness=amount.toFixed(2);logoHost.dataset.clock=time.toFixed(2);
 }
 async function loadLogo(){
  if(logoPromise||reduce.matches)return;
  logoPromise=import('./models/singularity-scroll.js').then(m=>m.createScrollSingularity(logoHost)).then(instance=>{
   if(disposed){instance.dispose();return;}logo=instance;updateLogo(logoAmount,logoTime);
  }).catch(()=>{logoHost.dataset.ready='false';});
 }
 const observer=new IntersectionObserver(([e])=>{
  visible=e.isIntersecting;if(visible&&!reduce.matches){loadLogo();players.forEach(p=>p.warm());}
 },{rootMargin:'900px'});observer.observe(section);
 let media;
 function build(){
  media?.revert();media=gsap.matchMedia();
  media.add({wide:'(min-width:720px) and (min-height:760px) and (pointer:fine)',reduce:'(prefers-reduced-motion:reduce)',all:'all'},({conditions})=>{
   const horizontal=!conditions.reduce,touch=!conditions.wide;section.dataset.aspirationMode=horizontal?'horizontal':'flow';section.toggleAttribute('data-aspiration-touch',horizontal&&touch);
   const state={open:0,clock:0,drive:0,hands:0,shake:0};
   if(conditions.reduce){updateLogo(.2,0);return;}
   if(horizontal){
    // Artwork may overflow the rail. Its layout width is the intended pan distance.
    const travel=()=>Math.max(0,rail.offsetWidth-stage.clientWidth);
    const tl=gsap.timeline({scrollTrigger:touch?undefined:{id:'merger-aspiration-story',trigger:section,start:'top top',end:()=>'+='+Math.round(travel()*1.12),pin:stage,scrub:.5,invalidateOnRefresh:true},onUpdate:()=>{
     updateLogo(state.open,state.clock);carSequence.update(state.drive);watchSequence.update(state.hands);peopleSequence.update(state.shake);
     section.dataset.aspirationProgress=tl.progress().toFixed(3);
    }});
    // A phone needs reading holds: continuously panning the desktop timeline
    // moved the watch and handshake out of frame before their actions finished.
    if(touch){
     const beats=[...rail.querySelectorAll('.aspiration-beat')];
     tl.to(rail,{x:()=>-beats[1].offsetLeft,duration:.8,ease:'power2.inOut'},2.4)
       .to(rail,{x:()=>-beats[2].offsetLeft,duration:.8,ease:'power2.inOut'},5.8)
       .to(rail,{x:()=>-beats[3].offsetLeft,duration:.8,ease:'power2.inOut'},9.3);
    } else tl.to(rail,{x:()=>-travel(),duration:7.8,ease:'none'},1.4);
    tl.to(state,{open:.92,duration:1.7,ease:'power2.inOut'},0)
      // Time keeps advancing after opening, until the logo has passed out of view.
      .to(state,{clock:22,duration:4.4,ease:'none'},0)
      // Let the silhouette become visible before its slow physical turn begins.
      .fromTo(watch,{opacity:0},{opacity:1,duration:1.5,ease:'power3.out'},3.05)
      .fromTo(watch,{y:20,scale:.97},{y:-14,scale:1,duration:2.75,ease:'power2.inOut'},3.1)
      .to(state,{hands:1,duration:2.5,ease:'power2.inOut'},3.35)
      .fromTo(people,{y:65,scale:.96,opacity:0},{y:-10,scale:1.02,opacity:.85,duration:touch?1:2,ease:'power3.out'},touch?6.3:4.3)
      .to(state,{shake:1,duration:touch?2.6:3.4,ease:'none'},touch?6.6:4.35)
      .fromTo(car,{xPercent:touch?-35:-65},{xPercent:touch?6:28,duration:3.2,ease:'none'},touch?9.8:6.8)
      .fromTo(car,{opacity:0},{opacity:1,duration:.55,ease:'power3.out'},touch?9.8:7.4)
      .to(state,{drive:1,duration:3.2,ease:'none'},touch?9.8:6.8);
    const releaseTouch=touch?touchStory(scope,stage,tl,{id:'merger-aspiration-story',distance:()=>Math.max(3200,stage.clientHeight*4.5)}):null;
    return()=>{releaseTouch?.();section.removeAttribute('data-aspiration-touch');tl.scrollTrigger?.kill();tl.kill();};
   }
   const triggers=[];
   triggers.push(ScrollTrigger.create({trigger:section.querySelector('.aspiration-tools'),start:'top 60%',end:'bottom 25%',onUpdate:s=>updateLogo(Math.min(.92,s.progress*2.5),s.progress*22)}));
   const watchState={progress:0};
   const watchTl=gsap.timeline({scrollTrigger:{trigger:section.querySelector('.aspiration-deals'),start:'top 75%',end:'bottom 20%',scrub:.5},onUpdate:()=>watchSequence.update(watchState.progress)});
   watchTl.fromTo(watch,{opacity:0},{opacity:1,duration:.42,ease:'power3.out'},0)
     .fromTo(watch,{y:20,scale:.97},{y:-14,scale:1,duration:.8,ease:'power2.inOut'},.2)
     .to(watchState,{progress:1,duration:.8,ease:'power2.inOut'},.2);
   [[people,peopleSequence,'.aspiration-connections']].forEach(([el,player,selector])=>{
    gsap.fromTo(el,{y:25,opacity:.25},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%',once:true}});
    const frameState={progress:0};
    gsap.to(frameState,{progress:1,ease:'none',scrollTrigger:{trigger:section.querySelector(selector),start:'top 70%',end:'bottom 20%',scrub:.4},onUpdate:()=>player.update(frameState.progress)});
   });
   const carState={progress:0};
   const carTl=gsap.timeline({scrollTrigger:{trigger:section.querySelector('.aspiration-goals'),start:'top 75%',end:'bottom 30%',scrub:.4},onUpdate:()=>carSequence.update(carState.progress)});
   carTl.fromTo(car,{xPercent:-20},{xPercent:20,duration:1,ease:'none'},0).to(carState,{progress:1,duration:1,ease:'none'},0);
   return()=>triggers.forEach(t=>t.kill());
  });
  if(visible&&!reduce.matches){loadLogo();players.forEach(p=>p.warm());}ScrollTrigger.refresh();
 }
 if(window.gsap&&window.ScrollTrigger)build();else section.dataset.aspirationMode='flow';
 scope.listen(document,'merger:motionchange',build);
 scope.listen(window,'pagehide',()=>{disposed=true;observer.disconnect();media?.revert();logo?.dispose();players.forEach(p=>p.dispose());},{once:true});
})();

}
