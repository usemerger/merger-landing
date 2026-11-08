// Scroll must remain visible even when the next frame arrives after the finger
// has moved. Keep a small decoded cache and display the closest available pose.
export function scrollFrames(scope,host,folder,count,{loop=0,active=()=>true,reduced=()=>false}={}) {
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d');
 const frames=new Map(),pending=new Set(),failed=new Set(),controllers=new Set();
 let wanted=0,rendered=-1,direction=1,disposed=false;
 function draw(){
  if(disposed||reduced()||!frames.size)return;
  const nearest=[...frames.keys()].sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted))[0];
  if(nearest===rendered)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(frames.get(nearest),0,0,canvas.width,canvas.height);
  rendered=nearest;host.dataset.ready='true';host.dataset.frame=String(nearest);
 }
 function load(i){
  if(i<0||i>=count||frames.has(i)||pending.has(i)||failed.has(i)||pending.size>=2||reduced()||!active()||disposed)return;
  pending.add(i);const controller=new AbortController();controllers.add(controller);
  scope.fetch(`/funnel-v3/assets/aspiration/${folder}/${String(i).padStart(2,'0')}.webp`,{signal:controller.signal})
   .then(r=>{if(!r.ok)throw Error('frame unavailable');return r.blob();})
   .then(blob=>scope.createImageBitmap(blob)).then(bitmap=>{
    if(disposed){bitmap.close();return;}
    frames.set(i,bitmap);draw();
    while(frames.size>6){
     const key=[...frames.keys()].filter(k=>k!==wanted&&k!==rendered).sort((a,b)=>Math.abs(b-wanted)-Math.abs(a-wanted))[0];
     frames.get(key).close();frames.delete(key);
    }
   }).catch(e=>{if(e.name!=='AbortError')failed.add(i);})
   .finally(()=>{pending.delete(i);controllers.delete(controller);warm();});
 }
 function warm(){load(wanted);load(wanted+direction);}
 return {
  update(progress){
   const next=loop?((Math.floor(progress*count*loop)%count)+count)%count:Math.round(Math.max(0,Math.min(1,progress))*(count-1));
   if(next!==wanted)direction=next>wanted?1:-1;
   wanted=next;draw();warm();
  },warm,
  dispose(){disposed=true;controllers.forEach(c=>c.abort());frames.forEach(b=>b.close());frames.clear();}
 };
}
