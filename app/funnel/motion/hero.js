
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width:851px) and (pointer:fine)');
  let smoother,intro;
  const off=()=>reduce.matches;
  const notify=()=>document.dispatchEvent(new Event('merger:motionchange'));
  function configureScroll(){
    smoother?.kill();smoother=null;document.body.dataset.scroll='native';
    if(!off()&&desktop.matches&&window.ScrollSmoother){gsap.registerPlugin(ScrollTrigger,ScrollSmoother);smoother=ScrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:1.15,effects:false,smoothTouch:false});document.body.dataset.scroll='smoother';}
  }
  function entrance(){
    intro?.kill();if(!window.gsap)return;
    const words=window.MergerTextMotion.split($('#promise'));
    gsap.set(['.device','.line > span','.intro',...words],{clearProps:'transform,opacity'});
    if(!off())intro=gsap.timeline().fromTo(words,{yPercent:110,opacity:0},window.MergerTextMotion.target(words,{duration:.85}),.12).from('.intro',{y:10,opacity:0,duration:.65,stagger:.07,ease:'power3.out'},.26).from('.device',{y:26,opacity:0,duration:1,ease:'power3.out'},.35);
  }
  function motionChange(){
    document.body.dataset.motion=off()?'reduced':'full';
    configureScroll();entrance();notify();
  }
  scope.listen(reduce,'change',motionChange);scope.listen(desktop,'change',configureScroll);
  $$('a[href^="#"]').forEach(a=>scope.listen(a,'click',e=>{const target=$(a.getAttribute('href'));if(!target)return;e.preventDefault();const triggerId={context:'merger-context-story',trust:'merger-trust-story',workflow:'merger-workflow-story',aspiration:'merger-aspiration-story',why:'merger-origin-story'}[target.id];const pinned=triggerId&&window.ScrollTrigger?.getById(triggerId);if(smoother)smoother.scrollTo(pinned?Math.max(0,pinned.start-40):target,pinned?false:e.detail!==0,'top 40px');else target.scrollIntoView({behavior:'instant'});if(a.classList.contains('skip')){target.tabIndex=-1;target.focus({preventScroll:true});}}));
  motionChange();
})();
}
