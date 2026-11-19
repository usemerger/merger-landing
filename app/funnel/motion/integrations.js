
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  document.querySelectorAll('#integrations, .verticals-strip').forEach(section=>{
  let visible=false;
  let paused=false;
  const pause=section.querySelector('.verticals-pause');
  section.querySelectorAll('.integration-track').forEach(track=>{
    const copy=track.querySelector('.integration-set').cloneNode(true);
    copy.setAttribute('aria-hidden','true');
    copy.removeAttribute('aria-label');
    copy.inert=true;
    track.append(copy);
  });
  function sync(){
    section.dataset.running=String(visible&&!paused&&!document.hidden&&!reduced.matches);
    if(pause){
      pause.hidden=reduced.matches;
      pause.setAttribute('aria-pressed',String(paused));
      pause.setAttribute('aria-label',paused?'Resume vertical animation':'Pause vertical animation');
      pause.title=paused?'Resume animation':'Pause animation';
    }
    section.querySelectorAll('.integration-window').forEach(row=>{
      // A stationary list needs no extra keyboard stop or pause instruction.
      const list=row.querySelector('.integration-set');
      row.tabIndex=reduced.matches?-1:0;
      row.setAttribute('aria-label',list.getAttribute('aria-label')+(reduced.matches?'':'. Focus to pause the moving logos.'));
    });
  }
  section.dataset.ready='true';
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(section);
  scope.listen(document,'visibilitychange',sync);
  scope.listen(reduced,'change',sync);
  scope.listen(pause,'click',()=>{paused=!paused;sync();});
  sync();
  });
})();

}
