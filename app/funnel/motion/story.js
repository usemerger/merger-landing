
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  if(!window.gsap)return;
  const stage=$('#product-story'),cards=$$('[data-story-card]');
  const narrow=matchMedia('(max-width:1000px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const snapshots=[4.3,8.8,14.8];
  const chapters=[
    ['Keep the conversation moving.','Respond where the relationship already lives.'],
    ['Put the conversation in context.','Link the chat to its deal. Keep the details together.'],
    ['Know what comes next.','Save the next step alongside the conversation.']
  ];
  let timeline,visible=false,lastPhase=-1,wasReduced=false;
  const reduced=()=>reduce.matches||document.body.dataset.motion==='reduced';
  function phase(index){
    if(index===lastPhase)return;lastPhase=index;
    $('#story-headline').textContent=chapters[index][0];$('#story-description').textContent=chapters[index][1];
    stage.dataset.chapter=String(index+1);
    cards.forEach((c,i)=>c.setAttribute('aria-hidden',String(narrow.matches?i!==index:i>index)));
  }
  function playbackState(){
    const playing=timeline&&!timeline.paused();
    stage.dataset.playback=reduced()?'reduced':playing?'playing':'paused';
  }
  function build(){
    const previous=timeline?timeline.time():0;
    timeline?.kill();
    const muted=narrow.matches?0:.38;
    const tl=gsap.timeline({paused:true,repeat:-1,defaults:{ease:'power3.out'},onUpdate:()=>{const t=tl.time();phase(t<5.2?0:t<10.2?1:2);}});
    timeline=tl;
    tl.set(cards,{opacity:0,scale:.97,x:0,y:18})
      .set('.story-veil',{opacity:0})
      .set('.typing-indicator',{opacity:1})
      .set('.typing-indicator i',{opacity:.45,y:0})
      .set(['.incoming-message','.reply-message','.link-after','.saved-check','.note-saved'],{opacity:0,y:6})
      .set('.link-before',{opacity:1,y:0})
      .set('.connection-rail i',{scaleX:0})
      .set('.connection-rail b',{opacity:0,x:0})
      .set('.deal-facts>div',{opacity:0,y:8})
      .set('.next-note span',{opacity:0,y:10});
    tl.fromTo(cards[0],{x:narrow.matches?0:50,y:20,scale:.97,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:.75},.6)
      .to('.story-veil',{opacity:narrow.matches?.34:.13,duration:.65},.6)
      .to('.typing-indicator i',{opacity:1,y:-3,duration:.2,stagger:.08,repeat:3,yoyo:true},1.1)
      .to('.typing-indicator',{opacity:0,duration:.18},2.1)
      .to('.incoming-message',{opacity:1,y:0,duration:.5},2.18)
      .to('.reply-message',{opacity:1,y:0,duration:.5},3.12)
      .to(cards[0],{opacity:muted,scale:narrow.matches?1:.97,y:narrow.matches?-10:-4,duration:.45},4.85)
      .fromTo(cards[1],{x:narrow.matches?0:-40,y:20,scale:.97,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:.75},5.2)
      .to('.connection-rail i',{scaleX:1,duration:.7,ease:'power2.inOut'},5.95)
      .to('.connection-rail b',{opacity:1,duration:.15},5.95)
      .to('.connection-rail b',{x:100,duration:.7,ease:'power2.inOut'},5.95)
      .to('.connection-rail b',{opacity:0,duration:.2},6.65)
      .to('.link-before',{opacity:0,y:-5,duration:.2},6.7)
      .to('.link-after',{opacity:1,y:0,duration:.35},6.87)
      .to('.deal-facts>div',{opacity:1,y:0,duration:.4,stagger:.07},7.25)
      .to(cards[1],{opacity:muted,scale:narrow.matches?1:.97,y:narrow.matches?-10:0,duration:.45},9.85)
      .fromTo(cards[2],{x:narrow.matches?0:35,y:20,scale:.97,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:.75},10.2)
      .to('.next-note span',{opacity:1,y:0,duration:.55,stagger:.07},11.15)
      .to('.saved-check',{opacity:1,y:0,duration:.3},12.4)
      .to('.note-saved',{opacity:1,y:0,duration:.4},12.55);
    if(!narrow.matches)tl.to(cards,{opacity:1,scale:1,y:0,duration:.7,stagger:.06},13.8);
    tl.to(cards,{opacity:0,y:14,scale:.98,duration:.4,stagger:.04},17.35)
      .to('.story-veil',{opacity:0,duration:.5},17.4)
      .to({}, {duration:.5},17.9);
    lastPhase=-1;tl.time(reduced()?snapshots[2]:previous,true);phase(tl.time()<5.2?0:tl.time()<10.2?1:2);
    document.body.dataset.storyReady='true';sync();
  }
  function sync(){
    if(!timeline)return;
    const isReduced=reduced();
    if(isReduced&&!wasReduced){timeline.pause().time(snapshots[2]);}
    wasReduced=isReduced;
    const shouldPlay=!isReduced&&visible&&!document.hidden&&true;
    if(shouldPlay)timeline.play();else timeline.pause();playbackState();
  }
  scope.listen(document,'merger:motionchange',sync);scope.listen(document,'merger:previewchange',sync);
  scope.listen(document,'visibilitychange',sync);scope.listen(reduce,'change',sync);scope.listen(narrow,'change',build);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;sync();},{threshold:[0,.2]}).observe(stage);
  build();
})();

}
