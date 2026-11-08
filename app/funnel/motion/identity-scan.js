
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const duration=5.6;
  function reset(){document.querySelector('.identity-face')?.removeAttribute('data-motion');}
  function timeline(scene){
    const face=scene.querySelector('.identity-face');
    const base=face.querySelector('.identity-face-base');
    const light=face.querySelector('.identity-laser-light');
    const scan=face.querySelector('.identity-scan-sweep');
    face.dataset.motion='enabled';
    const tl=gsap.timeline();
    // The image and light stay registered. Only the narrow SVG mask moves,
    // revealing real skin texture instead of a rectangle floating over it.
    tl.fromTo(face,{scale:.965,yPercent:1.5},{scale:1,yPercent:0,duration:4.7,ease:'sine.out'},0);
    tl.fromTo(base,{opacity:.16},{opacity:.36,duration:1.1,ease:'power2.out'},.1);
    tl.fromTo(light,{opacity:0},{opacity:.94,duration:.5,ease:'sine.out'},.65);
    tl.fromTo(scan,{y:100},{y:1160,duration:3.8,ease:'sine.inOut'},.65);
    tl.to(light,{opacity:0,duration:.6,ease:'sine.out'},4.1);
    tl.to(base,{opacity:.4,duration:.65,ease:'sine.out'},4.1);
    tl.to({}, {duration:.9},4.7);
    return tl;
  }
  window.MergerIdentityScan={duration,timeline,reset};
})();

}
