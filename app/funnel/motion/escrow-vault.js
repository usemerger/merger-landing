
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
 'use strict';
 const scene=document.querySelector('#origin-escrow'),host=scene?.querySelector('.vault-renderer');if(!host)return;
 const visual=scene.querySelector('.vault-visual'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const state={reveal:1,open:0,wheel:1,payment:1,amount:0,light:.7};
 const duration=11.8;let renderer,promise,near=false,disposed=false,phase='agree';
 const select=p=>{if(phase===p&&visual.dataset.phase===p)return;phase=p;visual.dataset.phase=p;};
 const draw=()=>{
  // Chapter jumps and restored scroll positions can activate a pinned scene
  // before IntersectionObserver catches up. Use the timeline's active state too.
  const active=scene.getAttribute('aria-hidden')==='false'||window.ScrollTrigger?.getById('merger-escrow-mobile')?.isActive;
  if(active&&!renderer&&!promise)load();
  if(near||active)renderer?.update(state);
 };
 async function load(){
  if(disposed||reduce.matches)return;if(promise)return promise;
  promise=import('./models/escrow-vault.js').then(m=>m.createEscrowVault(host)).then(instance=>{
   if(disposed){instance.dispose();return;}renderer=instance;draw();
  }).catch(()=>{host.dataset.ready='false';});return promise;
 }
 const observer=new IntersectionObserver(([entry])=>{near=entry.isIntersecting;if(near){load();draw();}},{rootMargin:'500px'});observer.observe(host);
 const restore=()=>{if(!document.hidden&&near){load();draw();}};
 scope.listen(document,'visibilitychange',restore);scope.listen(reduce,'change',restore);
 function reset(){delete visual.dataset.motion;delete visual.dataset.phase;}
 function timeline(){
  visual.dataset.motion='enabled';select('agree');Object.assign(state,{reveal:.2,open:1,wheel:0,payment:0,amount:0,light:.2});draw();
  const q=s=>scene.querySelectorAll(s);
  const tl=gsap.timeline({onUpdate:()=>{select(tl.time()<4.4?'agree':tl.time()<8.1?'hold':'release');draw();}});
  tl.fromTo(q('.vault-parties'),{opacity:0,y:10},{opacity:1,y:0,duration:.6,ease:'power3.out'},.1);
  tl.fromTo(q('.vault-agreement'),{autoAlpha:0,y:18,scale:.97},{autoAlpha:1,y:0,scale:1,duration:.65,ease:'power3.out'},.15);
  tl.fromTo(q('.vault-party-check'),{opacity:.18,scale:.95},{opacity:1,scale:1,duration:.35,stagger:.4,ease:'power2.out'},1.15);
  tl.fromTo(q('.vault-agreement-check'),{opacity:0,y:6},{opacity:1,y:0,duration:.35,stagger:.08,ease:'power3.out'},1.7);
  tl.to(state,{reveal:1,duration:.9,ease:'power2.out'},2.2);
  tl.to(q('.vault-agreement'),{autoAlpha:0,y:-18,scale:.97,duration:.55,ease:'power2.inOut'},2.6);
  tl.to(state,{amount:1,duration:.35,ease:'power2.out'},2.9);
  tl.to(state,{payment:1,duration:1.5,ease:'power2.inOut'},3.05);
  tl.to(state,{open:0,duration:1.05,ease:'power2.inOut'},4.65);
  tl.to(state,{wheel:1,light:.7,duration:.55,ease:'power2.inOut'},5.7);
  tl.fromTo(q('.vault-hold-seal'),{opacity:0,y:8},{opacity:1,y:0,duration:.4,ease:'power3.out'},6.05);
  tl.fromTo(q('.vault-condition'),{opacity:0},{opacity:1,duration:.35,stagger:.16,ease:'power2.out'},7.2);
  tl.to(q('.vault-hold-seal'),{opacity:0,y:-6,duration:.3,ease:'power2.out'},8.0);
  tl.to(state,{wheel:0,duration:.5,ease:'power2.inOut'},8.15);
  tl.to(state,{open:1,light:1,duration:1,ease:'power2.inOut'},8.65);
  tl.to(state,{payment:2,duration:1.15,ease:'power2.inOut'},9.55);
  tl.to(state,{amount:0,duration:.3,ease:'power2.out'},10.65);
  tl.fromTo(q('.vault-receipt'),{autoAlpha:0,y:12,scale:.97},{autoAlpha:1,y:0,scale:1,duration:.5,ease:'power3.out'},10.65);
  tl.to({}, {duration:.65},11.15);
  return tl;
 }
 window.MergerEscrowVault={duration,timeline,reset,async exportPoster(){await load();return renderer?.poster();}};
 scope.listen(window,'pagehide',()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',restore);reduce.removeEventListener('change',restore);renderer?.dispose();},{once:true});
})();

}
