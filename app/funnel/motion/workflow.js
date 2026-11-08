
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const section=document.querySelector('#workflow');
  if(!section)return;
  const rail=section.querySelector('.workflow-rail');
  const panels=[...section.querySelectorAll('.workflow-panel')];
  const desktopFilms=[...section.querySelectorAll('.workflow-desktop-video')];
  const mobileFilms=[...section.querySelectorAll('.workflow-mobile-phone video')];
  const films=[...desktopFilms,...mobileFilms];
  const playback=section.querySelector('.workflow-playback');
  const positions=[...section.querySelectorAll('.workflow-position span')];
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let active=0,visible=false,paused=false,mode='flow',current=null;
  function load(film){if(!film.getAttribute('src')){film.src=film.dataset.src;film.load();}}
  function label(){playback.textContent=paused?'▶':'Ⅱ';playback.setAttribute('aria-label',paused?'Play walkthrough video':'Pause walkthrough video');}
  function sync(){
    if(mode==='flow'){desktopFilms.forEach(f=>f.pause());if(!visible||document.hidden)mobileFilms.forEach(f=>f.pause());return;}
    current=mode==='horizontal'?desktopFilms[active]:mobileFilms[active];
    films.forEach(f=>{if(f!==current)f.pause();});
    if(visible)load(current);
    if(!visible||document.hidden||paused||reduce.matches){current.pause();return;}
    if(current.paused&&!current.ended){const requested=current;requested.play().catch(error=>{if(error.name==='NotAllowedError'&&requested===current&&visible){paused=true;label();}});}
  }
  function chapter(index){
    if(index!==active){films.forEach(f=>f.pause());active=index;const next=mode==='horizontal'?desktopFilms[index]:mobileFilms[index];if(next.readyState>0)next.currentTime=0;label();}
    section.dataset.workflowChapter=String(index+1);
    desktopFilms.forEach((f,i)=>f.classList.toggle('is-active',i===index));
    positions.forEach((p,i)=>p.classList.toggle('is-active',i===index));
    sync();
  }
  scope.listen(playback,'click',()=>{if(current?.ended){current.currentTime=0;paused=false;}else paused=!paused;label();sync();});
  // Native controls remain available on the stacked/mobile recordings.
  mobileFilms.forEach(f=>scope.listen(f,'play',()=>films.forEach(other=>{if(other!==f)other.pause();})));
  const observer=new IntersectionObserver(entries=>{const e=entries[0];visible=e.isIntersecting&&(mode==='flow'||e.intersectionRatio>=.45);sync();},{threshold:[0,.45]});observer.observe(section.querySelector('.workflow-stage'));
  scope.listen(document,'visibilitychange',sync);
  films.forEach(f=>scope.listen(f,'ended',()=>{if(f===current&&mode==='horizontal'){playback.textContent='↻';playback.setAttribute('aria-label','Replay walkthrough video');}}));
  let media;
  function buildMotion(){
  media?.revert();
  media=window.gsap?.matchMedia();
  media?.add({wide:'(min-width:720px) and (min-height:760px) and (pointer:fine)',reduce:'(prefers-reduced-motion:reduce)',all:'all'},({conditions})=>{
    const triggers=[];mode=conditions.wide&&!conditions.reduce?'horizontal':'flow';section.dataset.workflowMode=mode;
    const titleWords=panels.map(p=>window.MergerTextMotion.split(p.querySelector('h3')));
    paused=false;label();
    if(mode==='horizontal'){
      const timeline=gsap.timeline({scrollTrigger:{id:'merger-workflow-story',trigger:section,start:'top top',end:()=>'+='+Math.max(2200,innerWidth*2),pin:section.querySelector('.workflow-stage'),scrub:.65,invalidateOnRefresh:true},onUpdate:()=>chapter(timeline.time()<1.7?0:timeline.time()<4.5?1:2)});
      timeline.to({}, {duration:1})
        .to(rail,{xPercent:-100/3,duration:1.4,ease:'power2.inOut'},1)
        .to({}, {duration:1.4},2.4)
        .to(rail,{xPercent:-200/3,duration:1.4,ease:'power2.inOut'},3.8)
        .to({}, {duration:1.5},5.2);
      window.MergerTextMotion.reveal(panels[0].querySelector('h3'),{trigger:section,start:'top 65%'});
      panels.slice(1).forEach((p,i)=>{
        const at=i===0?1.5:4.3,words=titleWords[i+1];
        timeline.fromTo(words,{yPercent:110,opacity:0},window.MergerTextMotion.target(words,{duration:.7}),at)
          .fromTo(p.querySelector('.workflow-chapter'),{y:8,opacity:0},{y:0,opacity:1,duration:.5,ease:'power3.out'},at-.08)
          .fromTo(p.querySelector('.workflow-panel-body'),{y:10,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out'},at+.15);
      });
      chapter(0);
      return()=>{timeline.scrollTrigger?.kill();timeline.kill();films.forEach(f=>f.pause());section.dataset.workflowMode='flow';};
    }
    gsap.set([rail,...panels.map(p=>p.querySelector('.workflow-panel-copy'))],{clearProps:'transform,opacity'});
    if(!conditions.reduce)panels.forEach(p=>window.MergerTextMotion.reveal(p.querySelector('h3'),{start:'top 88%'}));
    // Stacked recordings use native controls, so they never play before the reader reaches them.
    chapter(0);
    return()=>{triggers.forEach(t=>t.kill());films.forEach(f=>f.pause());};
  });
  if(!media){section.dataset.workflowMode='flow';mobileFilms.forEach(load);}
  }
  buildMotion();
})();
}
