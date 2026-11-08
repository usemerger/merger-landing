
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  function split(element){
    if(!element)return [];
    const existing=[...element.querySelectorAll('.text-word')];
    if(existing.length)return existing;
    const label=element.innerText.replace(/\s+/g,' ').trim();
    const isHeading=/^H[1-6]$/.test(element.tagName);
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(!node.textContent.trim())return;
      const fragment=document.createDocumentFragment();
      node.textContent.split(/(\s+)/).filter(Boolean).forEach(part=>{
        if(/^\s+$/.test(part)){fragment.append(document.createTextNode(part));return;}
        const mask=document.createElement('span'),word=document.createElement('span');
        mask.className='text-mask';if(isHeading)mask.setAttribute('aria-hidden','true');
        word.className='text-word';word.textContent=part;mask.append(word);fragment.append(mask);
      });
      node.replaceWith(fragment);
    });
    element.dataset.textMotion='words';
    // A single complete heading remains available to assistive technology.
    if(isHeading)element.setAttribute('aria-label',label);
    return [...element.querySelectorAll('.text-word')];
  }
  function target(words,extra={}){
    return {yPercent:0,opacity:1,duration:.75,ease:'power3.out',stagger:{amount:Math.min(.35,Math.max(0,words.length-1)*.055)},...extra};
  }
  function reveal(element,options={}){
    const words=split(element);
    if(!window.gsap||reduced.matches||!words.length)return null;
    return gsap.fromTo(words,{yPercent:110,opacity:0},target(words,{
      scrollTrigger:{trigger:options.trigger||element,start:options.start||'top 88%',once:true},
      ...options.tween
    }));
  }
  window.MergerTextMotion={split,target,reveal};
  scope.listen(document,'DOMContentLoaded',()=>{
    if(!window.gsap||!window.ScrollTrigger)return;
    const headings=['#integrations-heading','#workflow-heading'].map(s=>document.querySelector(s));
    headings.forEach(split);
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion:no-preference)',()=>{
      headings.forEach(heading=>{
        reveal(heading);
        const eyebrow=heading.previousElementSibling;
        if(eyebrow?.classList.contains('eyebrow'))gsap.fromTo(eyebrow,{y:8,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out',scrollTrigger:{trigger:heading,start:'top 90%',once:true}});
      });
    });
  },{once:true});
})();

}
