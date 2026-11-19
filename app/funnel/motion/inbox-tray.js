
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
 'use strict';
 const host=document.querySelector('.origin-tray-renderer');if(!host)return;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 let renderer,promise,near=false,disposed=false;
 const state={reveal:1,fill:1,scatter:1};
 function draw(){
  host.dataset.progress=state.fill.toFixed(3);
  if(near)renderer?.update(reduce.matches?{reveal:1,fill:1,scatter:1}:state);
 }
 async function load(){
  if(promise)return promise;
  if(disposed||reduce.matches)return;
  promise=import('./models/inbox-tray.js').then(m=>m.createInboxTray(host)).then(instance=>{
   if(disposed){instance.dispose();return;}renderer=instance;draw();
  }).catch(()=>{host.dataset.ready='false';});
  return promise;
 }
 const observer=new IntersectionObserver(([entry])=>{near=entry.isIntersecting;if(near){load();draw();}},{rootMargin:'650px'});observer.observe(host);
 const restore=()=>{if(!document.hidden&&near){load();draw();}};
 scope.listen(document,'visibilitychange',restore);scope.listen(reduce,'change',restore);
 scope.listen(document.querySelector('[data-tray-export]'),'click',async()=>{await load();renderer?.previewStill();});
 window.MergerInboxTray={timeline(){
  Object.assign(state,{reveal:0,fill:0,scatter:0});draw();
  return gsap.timeline({onUpdate:draw})
   .to(state,{reveal:1,duration:.85,ease:'power2.out'},0)
   .to(state,{fill:1,duration:4.15,ease:'none'},.55)
   .to(state,{scatter:1,duration:1.35,ease:'power2.inOut'},4.15)
   .to({}, {duration:.8},5.5);
 }};
 scope.listen(window,'pagehide',()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',restore);reduce.removeEventListener('change',restore);renderer?.dispose();},{once:true});
})();

}
