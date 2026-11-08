
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const section=document.querySelector('#start.offer-section');
  if(!section)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const easeOut=getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim()||'cubic-bezier(.23,1,.32,1)';
  const running=new Set();
  let observer;

  function words(element){
    if(!element)return [];
    if(element.querySelector('.offer-word'))return [...element.querySelectorAll('.offer-word')];
    const text=element.innerText;
    const heading=/^H[1-6]$/.test(element.tagName);
    const characterEffect=element.dataset.offerText==='characters';
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    // Preserve explicit breaks and real whitespace, including edited headlines.
    nodes.forEach(node=>{
      const fragment=document.createDocumentFragment();
      (characterEffect?[...node.textContent]:node.textContent.split(/(\s+)/)).filter(Boolean).forEach(part=>{
        if(/^\s+$/.test(part)){fragment.append(document.createTextNode(part));return;}
        const span=document.createElement('span');span.className='offer-word';span.textContent=part;if(heading)span.setAttribute('aria-hidden','true');fragment.append(span);
      });
      node.replaceWith(fragment);
    });
    if(heading)element.setAttribute('aria-label',text.replace(/\s+/g,' ').trim());
    return [...element.querySelectorAll('.offer-word')];
  }
  function animate(element,frames,timing){
    const animation=element.animate(frames,{...timing,fill:'backwards'});
    running.add(animation);
    animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
  }
  function play(element){
    if(reduced.matches||!Element.prototype.animate)return;
    const targets=words(element),effect=element.dataset.offerText;
    targets.forEach((word,i)=>{
      // One pass on arrival. Prices, disclosures and controls never wait for motion.
      const step=effect==='characters'?40:Math.min(55,360/Math.max(1,targets.length-1));
      const frames=effect==='wipe'?
        [{clipPath:'inset(0 -8% 102% -8%)',transform:'translateY(8px)'},{clipPath:'inset(-30% -8% -30% -8%)',transform:'translateY(0)'}]:
        [{opacity:0,transform:`translateY(${effect==='headline'?34:12}px)`},{opacity:1,transform:'translateY(0)'}];
      animate(word,frames,{duration:effect==='headline'?760:580,delay:i*step,easing:easeOut});
    });
  }
  function setup(){
    observer?.disconnect();
    running.forEach(animation=>animation.cancel());running.clear();
    if(reduced.matches||!('IntersectionObserver' in window))return;
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting){observer.unobserve(entry.target);play(entry.target);}}
    },{threshold:.35});
    section.querySelectorAll('[data-offer-text]').forEach(el=>observer.observe(el));
  }
  scope.listen(reduced,'change',setup);
  scope.listen(document,'merger:closing-copy-updated',event=>{if(event.detail==='start')setup();});
  // Direct review links need to use the same scroller as the rest of the funnel.
  function followOfferLink(){
    if(!['#start','#start-review'].includes(location.hash))return;
    requestAnimationFrame(()=>{
      const target=document.querySelector(location.hash);
      if(!target)return;
      const smoother=window.ScrollSmoother?.get();
      if(smoother)smoother.scrollTo(target,false,'top 40px');
      else target.scrollIntoView({behavior:'instant',block:'start'});
    });
  }
  scope.listen(window,'load',followOfferLink,{once:true});
  scope.listen(window,'hashchange',followOfferLink);
  scope.onDispose(()=>running.forEach(animation=>animation.cancel()));
  setup();
})();

}
