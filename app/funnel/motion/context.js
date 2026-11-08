import {touchStory} from './touch-story';

export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const section = document.querySelector('#context');
  const form = document.querySelector('#context-copy-form');
  const heading = document.querySelector('#context-heading');
  const key = 'merger-context-section-copy-v1';
  let media;
  const orbit = window.MergerChannelOrbit.create(section);

  function buildMotion() {
    media?.revert();
    section.dataset.contextMotion = 'static';
    if (!window.gsap || !window.ScrollTrigger) { orbit.staticPose(); return; }
    window.MergerTextMotion.split(heading);
    section.querySelectorAll('.context-beats strong').forEach(window.MergerTextMotion.split);
    gsap.registerPlugin(ScrollTrigger);
    media = gsap.matchMedia();
    media.add({wide:'(min-width:1100px) and (min-height:760px) and (pointer:fine)',reduce:'(prefers-reduced-motion:reduce)',all:'all'}, ({conditions}) => {
      if(conditions.reduce) { orbit.staticPose(); return; }
      const glass = section.querySelector('.context-brand-glass');
      section.dataset.contextMotion = 'scroll';
      const touch=!conditions.wide;section.toggleAttribute('data-context-touch',touch);
      const find = s => section.querySelector(s);
      const steps = [...section.querySelectorAll('[data-context-beat]')];
      gsap.set(steps,{autoAlpha:0});
      gsap.set(steps[0],{autoAlpha:1});
      let lastBeat = -1;
      function beat(index) {
        if (index === lastBeat) return;
        lastBeat = index; section.dataset.contextPhase = String(index + 1);
      }
      window.MergerTextMotion.reveal(heading,{trigger:section,start:'top 82%'});
      window.MergerTextMotion.reveal(steps[0].querySelector('strong'),{trigger:section,start:'top 65%'});
      const tl = gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:touch?undefined:{id:'merger-context-story',trigger:section,start:'top top',end:'+=3335',pin:'.context-scene',scrub:.55,invalidateOnRefresh:true},onUpdate:()=>beat(tl.time()<1.4?0:tl.time()<3.25?1:tl.time()<5.7?2:3)});
      tl.set(find('.context-channel-copy'),{autoAlpha:0,y:14})
        .set(find('.context-channel-visual'),{autoAlpha:0})
        .set(find('.context-diagram'),{autoAlpha:1,scale:1})
        .set(find('.context-result'),{autoAlpha:0,scale:.97,y:14})
        .set(find('.context-message'),{xPercent:-9,yPercent:-17,rotation:-5})
        .set(glass,{xPercent:16,yPercent:16,rotation:-8,opacity:0})
        .set(find('.context-person'),{xPercent:10,yPercent:-65,rotation:6})
        .set(find('.context-terms'),{xPercent:9,yPercent:48,rotation:4})
        .set(find('.context-board'),{opacity:.12,scale:.97})
        .set(find('.context-board-heading'),{opacity:0,y:8})
        .set(find('.context-line-draw'),{clipPath:'inset(0 0 100% 0)'})
        .set(find('.context-next'),{opacity:0,y:10})
        .to({}, {duration:1.1})
        .to(find('.context-board'),{opacity:1,scale:1,duration:1.2},1.45)
        .to(section.querySelectorAll('.context-fragment'),{xPercent:0,yPercent:0,rotation:0,duration:1.25,stagger:.07},1.5)
        .to(find('.context-board-heading'),{opacity:1,y:0,duration:.6},1.9)
        .to(find('.context-line-draw'),{clipPath:'inset(0 0 0% 0)',duration:.9,ease:'none'},2.4)
        .to(find('.context-next'),{opacity:1,y:0,duration:.6,ease:'power3.out'},2.6)
        // The third step resolves the explanation into the real app's deal card.
        .to(find('.context-diagram'),{autoAlpha:0,scale:.97,duration:.4,ease:'power3.out'},3.25)
        .to(find('.context-result'),{autoAlpha:1,scale:1,y:0,duration:.7,ease:'power3.out'},3.4)
        // A separate depth plane: slow travel across the existing story, no loop.
        .to(glass,{xPercent:0,yPercent:-4,duration:5.7,ease:'none'},0)
        .to(glass,{opacity:.7,duration:1.8,ease:'power3.out'},.2)
        .to({}, {duration:1.6},4.1)
        .to([find('.context-copy'),find('.context-result')],{autoAlpha:0,y:-12,duration:.55,ease:'power3.out'},5.7)
        .to(glass,{opacity:0,duration:.6,ease:'power3.out'},5.7)
        .to(find('.context-channel-copy'),{autoAlpha:1,y:0,duration:.65,ease:'power3.out'},6.05)
        .to(find('.context-channel-visual'),{autoAlpha:1,duration:.7,ease:'power3.out'},6.05)
        .add(orbit.timeline(),6.05);
      // The text shares the diagram's scrubbed timeline: reversing the scroll
      // reverses the same reveal without launching independent entrance tweens.
      [1,2].forEach((index)=>{
        const position=index===1?1.4:3.25;
        const step=steps[index];
        const words=window.MergerTextMotion.split(step.querySelector('strong'));
        tl.to(steps[index-1],{autoAlpha:0,duration:.2,ease:'power3.out'},position-.25)
          .fromTo(step,{autoAlpha:0},{autoAlpha:1,duration:.2,immediateRender:false},position)
          .fromTo(words,{yPercent:110,opacity:0},window.MergerTextMotion.target(words,{duration:.6,immediateRender:false}),position)
          .fromTo(step.querySelector('p'),{yPercent:100,opacity:0},{yPercent:0,opacity:1,duration:.6,ease:'power3.out',immediateRender:false},position+.12);
      });
      const releaseTouch=touch?touchStory(scope,find('.context-scene'),tl,{id:'merger-context-story',distance:2100}):null;
      beat(0);
      return () => {releaseTouch?.();section.removeAttribute('data-context-touch');tl.scrollTrigger?.kill();tl.kill();section.dataset.contextMotion='static';delete section.dataset.contextPhase;};
    });
    ScrollTrigger.refresh();
  }
  buildMotion();
})();
}
