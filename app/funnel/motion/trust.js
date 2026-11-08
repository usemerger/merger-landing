
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const section=document.querySelector('#trust');
  if(!section)return;
  const canvas=section.querySelector('canvas');
  const context=canvas.getContext('2d',{alpha:false});
  const heading=section.querySelector('h2');
  const support=section.querySelector('.trust-support');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const lastFrame=95;
  const frames=new Map(),pending=new Set(),failed=new Set();
  let desired=0,visible=false,media,raf=0,rendered=-1,direction=1;
  // Draw the actual requested image. This avoids paused-video seek/decode stalls.
  // Keep at most eight decoded frames; close evicted bitmaps to bound memory.
  function trim(){
    while(frames.size>8){
      const candidates=[...frames.keys()].filter(index=>index!==desired&&index!==rendered);
      candidates.sort((a,b)=>Math.abs(b-desired)-Math.abs(a-desired));
      const index=candidates[0];if(index===undefined)break;
      frames.get(index).close();frames.delete(index);
    }
  }
  function draw(){
    if(!context||!visible||reduce.matches||document.hidden)return;
    const frame=frames.get(desired);if(!frame)return;
    context.drawImage(frame,0,0,canvas.width,canvas.height);
    rendered=desired;
    section.dataset.trustFrame=String(rendered);
    section.dataset.trustReady='true';
    trim();
  }
  async function loadFrame(index){
    if(index<0||index>lastFrame||frames.has(index)||pending.has(index)||failed.has(index))return;
    pending.add(index);
    try{
      const response=await fetch(`/funnel-v3/assets/trust/frames/frame-${String(index).padStart(3,'0')}.webp`);
      if(!response.ok)throw new Error('Frame unavailable');
      const bitmap=await createImageBitmap(await response.blob());
      frames.set(index,bitmap);draw();trim();
    }catch{
      // Keep the last visible frame or still poster if a frame cannot load.
      failed.add(index);section.dataset.trustMedia='frame-unavailable';
    }finally{pending.delete(index);if(index!==desired&&!frames.has(desired)&&!failed.has(desired))requestPaint();}
  }
  function paint(){
    raf=0;
    if(!visible||reduce.matches||document.hidden)return;
    draw();
    if(pending.size<4)loadFrame(desired);
    for(const offset of [direction,-direction,2*direction]){
      if(pending.size>=4)break;
      loadFrame(desired+offset);
    }
  }
  function requestPaint(){if(!raf)raf=requestAnimationFrame(paint);}
  function setProgress(value){
    const next=Math.round(Math.max(0,Math.min(1,value))*lastFrame);
    if(next!==desired)direction=Math.sign(next-desired);
    desired=next;requestPaint();
  }
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;if(visible)requestPaint();
  },{rootMargin:'400px 0px'});
  observer.observe(section);
  scope.listen(document,'visibilitychange',()=>{if(!document.hidden)requestPaint();});
  function buildMotion(){
    media?.revert();
    if(!window.gsap||!window.ScrollTrigger)return;
    media=gsap.matchMedia();
    media.add({wide:'(min-width:720px) and (min-height:760px) and (pointer:fine)',reduce:'(prefers-reduced-motion:reduce)',all:'all'},({conditions})=>{
      const lines=[...heading.querySelectorAll('.trust-heading-line')];
      const words=lines.map(line=>window.MergerTextMotion.split(line));
      // Split the visual lines while exposing one uninterrupted heading.
      heading.setAttribute('aria-label',lines.map(line=>line.textContent.trim()).join(' '));
      lines.forEach(line=>line.setAttribute('aria-hidden','true'));
      if(conditions.reduce){
        section.dataset.trustReady='false';
        section.dataset.trustMotion='still';
        return;
      }
      section.dataset.trustMotion='scroll';
      const frame={position:0};
      const tl=gsap.timeline({scrollTrigger:{id:'merger-trust-story',trigger:section,start:conditions.wide?'top 12%':'top 75%',end:conditions.wide?'+=720':'bottom 35%',pin:conditions.wide?section.querySelector('.trust-stage'):false,scrub:.35,invalidateOnRefresh:true}});
      tl.to(frame,{position:1,duration:4,ease:'none',onUpdate:()=>{setProgress(frame.position);}},0)
        .fromTo(section.querySelector('.eyebrow'),{opacity:0,y:8},{opacity:1,y:0,duration:.5,ease:'power3.out'},0)
        .fromTo(words[0],{yPercent:110,opacity:0},window.MergerTextMotion.target(words[0],{duration:.85}),.1)
        .fromTo(support,{opacity:0,y:12},{opacity:1,y:0,duration:.8,ease:'power3.out'},1.6);
      if(words[1].length)tl.fromTo(words[1],{yPercent:110,opacity:0},window.MergerTextMotion.target(words[1],{duration:.85}),.65);
      requestPaint();
      return()=>{cancelAnimationFrame(raf);raf=0;};
    });
  }
  scope.onDispose(()=>{frames.forEach(frame=>frame.close());frames.clear();});
  buildMotion();
})();
}
