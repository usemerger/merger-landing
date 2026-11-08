
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const scene=document.querySelector('#origin-vision-statement');
  if(!scene)return;
  const stage=scene.querySelector('.vision-stage'),track=scene.querySelector('.vision-sentence');
  const viewport=scene.querySelector('.vision-viewport');
  const words=[...track.querySelectorAll('.vision-word')];
  words.forEach(word=>{
    const text=word.textContent;
    word.replaceChildren(...[...text].map(letter=>{const span=document.createElement('span');span.className='vision-char';span.textContent=letter;return span;}));
  });
  const chars=[...track.querySelectorAll('.vision-char')];
  const cursor=scene.querySelector('.vision-cursor');
  const handoff=scene.querySelector('.vision-handoff');
  const handoffChars=[...handoff.querySelectorAll('.vision-char')];
  const times=[];
  let time=.7,sentenceEnd=0,handoffAt=0;
  chars.forEach((char,index)=>{
    if(char===handoffChars[0]){
      sentenceEnd=time;
      time+=1.6; // Finish reading the promise before introducing the next step.
      handoffAt=time;
    }
    times.push(time);time+=.085;
    if(char===char.parentElement.lastElementChild){time+=.045;if(char.closest('.vision-keyword'))time+=1.35;}
  });
  const keywordTime=name=>times[chars.indexOf(scene.querySelector(`[data-vision-key="${name}"] .vision-char`))];
  const verifiedAt=keywordTime('verified'),secureAt=keywordTime('secure');
  const duration=time+2.4;
  window.MergerVisionStatement={
    duration,
    reset(){stage.removeAttribute('data-motion');},
    timeline(){
      stage.dataset.motion='enabled';
      const tl=gsap.timeline();
      const verified=scene.querySelector('.vision-identity'),secure=scene.querySelector('.vision-lock');
      const scan=scene.querySelector('.vision-identity-scan');
      const arrow=scene.querySelector('.vision-arrow'),shaft=scene.querySelector('.vision-arrow-shaft'),head=scene.querySelector('.vision-arrow-head');
      tl.set(chars,{opacity:0},0).set(track,{x:0},0).set(cursor,{opacity:.8,x:0},0);
      tl.set([verified,secure],{opacity:0,y:36,scale:.94},0);
      tl.set(scan,{opacity:0,y:0},0);
      tl.set(arrow,{opacity:0,x:0,y:0},0).set(shaft,{scaleX:0},0).set(head,{opacity:0,x:-12},0);
      chars.forEach((char,index)=>{
        tl.to(char,{opacity:1,duration:.001,ease:'none'},times[index]);
        // Prelaid glyphs reserve their space; only opacity and transforms change.
        tl.to(cursor,{x:()=>char.offsetLeft+char.offsetWidth+5,duration:.001,ease:'none'},times[index]);
        if(!handoff.contains(char))tl.to(track,{x:()=>-Math.max(0,char.offsetLeft+char.offsetWidth-viewport.clientWidth*(viewport.clientWidth<700?.92:.66)),duration:.085,ease:'none'},times[index]);
      });
      tl.fromTo(verified,{rotation:-3,opacity:0,x:0,y:36,scale:.94},{rotation:0,opacity:1,y:0,scale:1,duration:1.7,ease:'power2.out',immediateRender:false},verifiedAt-.15);
      tl.to(scan,{opacity:.65,duration:.25},verifiedAt+.6).to(scan,{y:()=>verified.clientHeight*.5,duration:1.5,ease:'none'},verifiedAt+.6).to(scan,{opacity:0,duration:.35},verifiedAt+1.85);
      tl.to(verified,{opacity:0,x:-28,duration:1.25,ease:'power2.inOut'},secureAt-1.6);
      tl.fromTo(secure,{rotation:4,opacity:0,y:36,scale:.94},{rotation:0,opacity:1,y:0,scale:1,duration:1.8,ease:'power2.out',immediateRender:false},secureAt-.15);
      tl.to(secure,{opacity:0,y:-18,duration:.75,ease:'power2.inOut'},sentenceEnd+.55);
      tl.to(cursor,{opacity:0,duration:.2},sentenceEnd+.4);
      // The line keeps moving in the same direction and settles around the
      // complete handoff, so neither the phrase nor the arrow is cut off.
      tl.to(track,{x:()=>-handoff.offsetLeft+Math.max(16,(viewport.clientWidth-handoff.offsetWidth)/2),duration:1.05,ease:'power2.inOut'},handoffAt-.55);
      tl.to(chars.filter(char=>!handoff.contains(char)),{opacity:0,duration:.65,ease:'power2.inOut'},handoffAt-.55);
      tl.set(cursor,{x:()=>handoffChars[0].offsetLeft-5,opacity:.8},handoffAt-.05);
      tl.to(cursor,{opacity:0,duration:.2},time+.15);
      tl.to(arrow,{opacity:1,duration:.2},time+.2);
      tl.to(shaft,{scaleX:1,duration:.85,ease:'power2.inOut'},time+.2);
      tl.to(head,{opacity:1,x:0,duration:.4,ease:'power2.out'},time+.75);
      // Match the route into verification: right on desktop, down in the
      // stacked layout. The following chapter starts as the arrow leads out.
      tl.to(arrow,{x:()=>document.querySelector('#why').dataset.originMode==='pinned'?18:0,y:()=>document.querySelector('#why').dataset.originMode==='pinned'?0:18,duration:.65,ease:'power2.inOut'},duration-.65);
      tl.to({}, {duration:2.4},time);
      return tl;
    }
  };
})();

}
