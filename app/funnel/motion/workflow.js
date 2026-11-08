import {touchStory} from './touch-story';

import {createInlinePlayback} from './inline-playback';

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
  films.forEach(film=>{film.muted=true;film.defaultMuted=true;film.playsInline=true;film.setAttribute('muted','');film.setAttribute('playsinline','');});
  const playback=section.querySelector('.workflow-playback');
  const positions=[...section.querySelectorAll('.workflow-position span')];
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let active=0,visible=false,paused=false,mode='flow',current=null;
  function load(film){if(!film.getAttribute('src')){film.src=film.dataset.src;film.load();}}
  const mobileButtons=new Map(mobileFilms.map((film,index)=>{
    const button=document.createElement('button');button.type='button';button.className='workflow-inline-playback';
    button.textContent='Play walkthrough';button.setAttribute('aria-label',`Play walkthrough ${index+1}`);
    film.closest('.workflow-mobile-phone').append(button);
    const nativeControls=film.controls;film.controls=false;film.loop=true;
    scope.onDispose(()=>{button.remove();film.controls=nativeControls;film.loop=false;});
    return [film,button];
  }));
  const inline=createInlinePlayback({videos:mobileFilms,load,isHidden:()=>document.hidden,
    canAutoplay:()=>!reduce.matches&&!window.navigator.connection?.saveData,
    onState:(film,state)=>{const button=mobileButtons.get(film);button.dataset.state=state;
      button.textContent=state==='playing'?'Pause video':state==='loading'?'Pause video':state==='error'?'Retry video':'Play video';
      const title=panels[mobileFilms.indexOf(film)].querySelector('h3');
      button.setAttribute('aria-label',`${button.textContent}: ${title.getAttribute('aria-label')||title.textContent}`);
    }});
  mobileButtons.forEach((button,film)=>scope.listen(button,'click',()=>inline.toggle(film)));
  const mobileObserver=new IntersectionObserver(entries=>inline.visibility(entries),{threshold:[0,.35,.5,.75,1]});
  mobileFilms.forEach(film=>{mobileObserver.observe(film);scope.listen(film,'ended',()=>inline.ended(film));});
  scope.listen(document,'visibilitychange',inline.sync);scope.listen(reduce,'change',inline.sync);scope.onDispose(()=>inline.dispose());
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
  const observer=new IntersectionObserver(entries=>{const e=entries[0];visible=e.isIntersecting&&(mode==='flow'||e.intersectionRatio>=.45);sync();},{threshold:[0,.45]});observer.observe(section.querySelector('.workflow-stage'));
  scope.listen(document,'visibilitychange',sync);
  films.forEach(f=>scope.listen(f,'ended',()=>{if(f===current&&mode==='horizontal'){playback.textContent='↻';playback.setAttribute('aria-label','Replay walkthrough video');}}));
  let media;
  function buildMotion(){
  media?.revert();
  media=window.gsap?.matchMedia();
  media?.add({wide:'(min-width:720px) and (min-height:760px) and (pointer:fine)',reduce:'(prefers-reduced-motion:reduce)',all:'all'},({conditions})=>{
    const triggers=[];mode=!conditions.reduce?'horizontal':'flow';const touch=!conditions.wide&&mode==='horizontal';section.dataset.workflowMode=mode;section.toggleAttribute('data-workflow-touch',touch);inline.setEnabled(mode==='flow');
    const titleWords=panels.map(p=>window.MergerTextMotion.split(p.querySelector('h3')));
    paused=false;label();
    if(mode==='horizontal'){
      const timeline=gsap.timeline({scrollTrigger:touch?undefined:{id:'merger-workflow-story',trigger:section,start:'top top',end:()=>'+='+Math.max(2200,innerWidth*2),pin:section.querySelector('.workflow-stage'),scrub:.65,invalidateOnRefresh:true},onUpdate:()=>chapter(timeline.time()<1.7?0:timeline.time()<4.5?1:2)});
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
      const releaseTouch=touch?touchStory(scope,section.querySelector('.workflow-stage'),timeline,{id:'merger-workflow-story',distance:1800}):null;
      chapter(0);
      return()=>{releaseTouch?.();section.removeAttribute('data-workflow-touch');timeline.scrollTrigger?.kill();timeline.kill();films.forEach(f=>f.pause());section.dataset.workflowMode='flow';};
    }
    gsap.set([rail,...panels.map(p=>p.querySelector('.workflow-panel-copy'))],{clearProps:'transform,opacity'});
    if(!conditions.reduce)panels.forEach(p=>window.MergerTextMotion.reveal(p.querySelector('h3'),{start:'top 88%'}));
    // Only the visible mobile recording plays; tap playback survives autoplay denial.
    chapter(0);
    return()=>{triggers.forEach(t=>t.kill());films.forEach(f=>f.pause());};
  });
  if(!media){section.dataset.workflowMode='flow';mobileFilms.forEach(load);}
  }
  buildMotion();
})();
}
