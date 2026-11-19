// Let Safari own the sticky viewport and native scrolling. Only the story's
// transform/opacity timeline is scrubbed; no fixed-position pin or touch hijack.
export function touchStory(scope, stage, animation, {id, distance=1600}={}) {
  const {document,ScrollTrigger}=scope;
  const wrapper=document.createElement('div');
  wrapper.className='touch-story';
  stage.before(wrapper);wrapper.append(stage);stage.classList.add('touch-story-stage');
  const measure=()=>{
    const travel=typeof distance==='function'?distance():distance;
    wrapper.style.height=`${stage.offsetHeight+travel}px`;
    return travel;
  };
  measure();animation.pause(0);
  const trigger=ScrollTrigger.create({id,trigger:wrapper,start:'top top',
    end:()=>`+=${measure()}`,animation,scrub:.18,invalidateOnRefresh:true,
    onRefreshInit:measure});
  return ()=>{trigger.kill();animation.kill();stage.classList.remove('touch-story-stage');wrapper.replaceWith(stage);};
}
