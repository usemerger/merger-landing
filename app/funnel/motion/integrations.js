
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const section=document.querySelector('#integrations');
  if(!section)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let visible=false;
  section.querySelectorAll('.integration-track').forEach(track=>{
    const copy=track.querySelector('.integration-set').cloneNode(true);
    copy.setAttribute('aria-hidden','true');
    copy.removeAttribute('aria-label');
    copy.inert=true;
    track.append(copy);
  });
  function sync(){
    section.dataset.running=String(visible&&!document.hidden&&!reduced.matches);
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
  sync();
})();

}
