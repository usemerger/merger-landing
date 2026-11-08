// One visible recording at a time. A rejected autoplay request is not retried
// until the visitor presses Play; user pauses also survive scrolling away/back.
export function createInlinePlayback({videos,load,onState,canAutoplay=()=>true,isHidden=()=>false}) {
  const states=new Map(videos.map(video=>[video,{ratio:0,paused:false,blocked:false,manual:false,pending:false,epoch:0}]));
  let enabled=false,current=null,disposed=false;
  function stop(video){const state=states.get(video);state.epoch++;state.pending=false;video.pause();onState(video,'paused');}
  function play(video,manual=false){
    const state=states.get(video);
    if(disposed||!enabled||isHidden())return;
    if(manual)state.manual=true;
    if(!manual&&(state.paused||state.blocked||(!state.manual&&!canAutoplay()))){stop(video);return;}
    if(state.pending||(!video.paused&&!video.ended))return;
    videos.forEach(other=>{if(other!==video)stop(other);});current=video;
    video.muted=true;video.defaultMuted=true;video.playsInline=true;
    load(video);if(video.ended)video.currentTime=0;
    const epoch=++state.epoch;state.pending=true;onState(video,'loading');
    // Keep play() in the tap handler's call stack for Safari's user activation.
    Promise.resolve(video.play()).then(()=>{
      if(epoch!==state.epoch){if(current!==video||!enabled||isHidden())video.pause();return;}
      state.pending=false;
      if(disposed||!enabled||isHidden()||current!==video){stop(video);return;}
      onState(video,'playing');
    }).catch(error=>{
      if(epoch!==state.epoch)return;
      state.pending=false;state.blocked=true;
      onState(video,error.name==='NotAllowedError'?'blocked':'error');
    });
  }
  function sync(){
    if(disposed)return;
    const candidate=enabled&&!isHidden()?videos.reduce((best,video)=>states.get(video).ratio>=.35&&(!best||states.get(video).ratio>states.get(best).ratio)?video:best,null):null;
    if(current&&current!==candidate)stop(current);
    current=candidate;
    if(candidate)play(candidate);
  }
  return {
    setEnabled(value){enabled=value;sync();},
    visibility(entries){entries.forEach(({target,intersectionRatio})=>states.get(target).ratio=intersectionRatio);sync();},
    sync,
    toggle(video){const state=states.get(video);if(!video.paused||state.pending){state.paused=true;stop(video);}else{state.paused=false;state.blocked=false;play(video,true);}},
    ended(video){onState(video,'ended');},
    dispose(){disposed=true;current=null;videos.forEach(stop);}
  };
}
