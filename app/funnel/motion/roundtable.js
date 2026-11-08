
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
 'use strict';
 window.MergerRoundtable={timeline(scene){
  const visual=scene.querySelector('.roundtable-visual');
  const camera=visual.querySelector('.roundtable-camera');
  const people=[...visual.querySelectorAll('.roundtable-reveal')];
  const deals=[...visual.querySelectorAll('.roundtable-deal')];
  // A rare explanatory scene: scroll is the only clock. Stop scrolling to hold
  // any reveal; reversing retraces it. The full cutout also works without JS.
  const tl=gsap.timeline({onUpdate:()=>{visual.dataset.progress=(tl.time()/tl.duration()).toFixed(3);}});
  tl.fromTo(camera,{scale:1.16,yPercent:2},{scale:1,yPercent:0,duration:4.8,ease:'power2.inOut'},0);
  tl.fromTo(visual.querySelector('.roundtable-table-mask'),{opacity:.12},{opacity:1,duration:1.1,ease:'power2.out'},0);
  people.forEach((person,i)=>{
   tl.fromTo(person,{opacity:0},{opacity:1,duration:1.0,ease:'power2.out'},[.12,1.0,1.65,2.3,2.95][i]);
  });
  // Resolve the complete photograph after the individual lighting reveals.
  // The alpha mask unions the regions, so overlapping reveals never double-light.
  tl.fromTo(visual.querySelector('.roundtable-complete'),{opacity:0},{opacity:1,duration:1.0,ease:'power2.out'},3.8);
  deals.forEach((deal,i)=>{
   tl.fromTo(deal,{opacity:0,xPercent:[-130,0,130][i],yPercent:[55,-110,55][i],rotation:[-22,0,22][i],scale:.94},
    {opacity:1,xPercent:0,yPercent:0,rotation:[-9,0,9][i],scale:1,duration:1.25,ease:'power2.inOut'},3.75+i*.3);
  });
  tl.fromTo(visual.querySelector('.roundtable-table-light'),{opacity:0},{opacity:1,duration:1.0,ease:'power2.out'},4.25);
  tl.fromTo(visual.querySelector('.roundtable-caption'),{opacity:0,y:8},{opacity:1,y:0,duration:.5,ease:'power2.out'},5.45);
  tl.to({}, {duration:1.1},5.95);
  return tl;
 }};
})();

}
