
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  // Explanatory marketing motion: driven by the existing reversible scroll timeline.
  // Move the shared surface, fade its contents, then reveal the matching vertical.
  window.MergerDealMorph={timeline(scene){
    const visual=scene.querySelector('.deal-morph-visual');
    visual.dataset.motionReady='true';
    const pieces=[...visual.querySelectorAll('.deal-morph-piece')];
    const tl=gsap.timeline({onUpdate:()=>{visual.dataset.progress=(tl.time()/tl.duration()).toFixed(3);}});
    pieces.forEach((piece,i)=>{
      const message=piece.querySelector('.deal-message');
      const skin=piece.querySelector('.deal-message-skin');
      const content=piece.querySelector('.deal-message-content');
      const tail=piece.querySelector('.deal-message-tail');
      const result=piece.querySelector('.deal-result');
      const label=piece.querySelector('.deal-result-label');
      const start=2.05+i*.38;
      // Staggered arrival, then a full readable pause before the shape changes.
      tl.fromTo(message,{opacity:0,y:24,scale:.97},{opacity:1,y:0,scale:1,duration:.65,ease:'power3.out'},i*.3);
      tl.fromTo(piece,{x:0,y:0,rotation:[-1.5,1,-.8][i]},
        {x:()=>visual.clientWidth*(.17+i*.33)-result.offsetWidth/2-piece.offsetLeft,
         y:()=>visual.clientHeight*.41-piece.offsetTop,rotation:0,duration:1.45,ease:'power2.inOut'},start);
      tl.fromTo(content,{opacity:1},{opacity:0,duration:.36,ease:'power2.out'},start+.04);
      tl.fromTo(tail,{opacity:1},{opacity:0,duration:.25,ease:'power2.out'},start);
      tl.fromTo(skin,{scaleX:1,scaleY:1,opacity:1},
        {scaleX:()=>result.offsetWidth/piece.clientWidth,scaleY:()=>result.offsetHeight/piece.clientHeight,duration:1.45,ease:'power2.inOut'},start);
      tl.to(skin,{opacity:0,duration:.4,ease:'power2.out'},start+1.02);
      tl.fromTo(result,{opacity:0,scale:.94},{opacity:1,scale:1,duration:.65,ease:'power2.out'},start+.8);
      tl.fromTo(label,{opacity:0,y:8},{opacity:1,y:0,duration:.45,ease:'power2.out'},start+1.35);
    });
    tl.fromTo(visual.querySelector('.deal-review-note'),{opacity:0,y:8},{opacity:1,y:0,duration:.5,ease:'power2.out'},4.65);
    tl.to({}, {duration:.9},5.15);
    return tl;
  }};
})();

}
