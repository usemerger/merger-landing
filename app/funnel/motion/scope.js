import {gsap as engine} from 'gsap';
import {ScrollTrigger as Trigger} from 'gsap/ScrollTrigger';
import {ScrollSmoother as Smoother} from 'gsap/ScrollSmoother';

// Each mounted homepage owns its resources. In particular, account/admin routes
// must never inherit a pinned page, WebGL renderer or pending frame fetch.
export function createMotionScope(root) {
  engine.registerPlugin(Trigger,Smoother);
  // Safari's collapsing URL bar is not a new layout. Rebuilding scrubbed
  // stories during those height-only changes rewinds them under the finger.
  Trigger.config({ignoreMobileResize:true});
  let disposed=false;
  const cleanups=[],raf=new Set(),timers=new Set(),intervals=new Set(),bitmaps=new Set();
  const abort=new AbortController();
  const context=engine.context(()=>{},root);
  const onDispose=fn=>cleanups.push(fn);
  const run=fn=>(...args)=>{if(!disposed){let result;context.add(()=>{result=fn(...args);});return result;}};
  const gsap=new Proxy(engine,{get(target,key){
    if(key==='matchMedia')return (...args)=>{const mm=target.matchMedia(...args);onDispose(()=>mm.revert());return mm;};
    return target[key];
  }});
  const ScrollSmoother=new Proxy(Smoother,{get(target,key){if(key==='create')return options=>{const smoother=target.create(options);onDispose(()=>smoother.kill());return smoother;};return target[key];}});
  const bindings={gsap,ScrollTrigger:Trigger,ScrollSmoother};
  const win=new Proxy(window,{get(target,key){if(key in bindings)return bindings[key];const value=target[key];return typeof value==='function'&&!/^[A-Z]/.test(String(key))?value.bind(target):value;},set(_,key,value){bindings[key]=value;return true;}});
  const doc=new Proxy(document,{get(target,key){
    if(key==='body'||key==='documentElement')return root;
    if(key==='querySelector')return selector=>root.querySelector(selector);
    if(key==='querySelectorAll')return selector=>root.querySelectorAll(selector);
    const value=target[key];return typeof value==='function'?value.bind(target):value;
  }});
  function listen(target,type,callback,options){
    if(!target)return;
    if(type==='pagehide'){onDispose(()=>callback(new Event('pagehide')));return;}
    const handler=run(callback);target.addEventListener(type,handler,options);
    onDispose(()=>target.removeEventListener(type,handler,options));
  }
  const observer=Type=>class extends Type {constructor(callback,options){super(run(callback),options);onDispose(()=>this.disconnect());}};
  const scope={window:win,document:doc,gsap,ScrollTrigger:Trigger,ScrollSmoother,listen,onDispose,
    matchMedia:window.matchMedia.bind(window),
    requestAnimationFrame:fn=>{if(disposed)return 0;const id=window.requestAnimationFrame(time=>{raf.delete(id);run(fn)(time);});raf.add(id);return id;},
    cancelAnimationFrame:id=>{raf.delete(id);window.cancelAnimationFrame(id);},
    setTimeout:(fn,ms)=>{if(disposed)return 0;const id=window.setTimeout(()=>{timers.delete(id);run(fn)();},ms);timers.add(id);return id;},
    clearTimeout:id=>{timers.delete(id);window.clearTimeout(id);},
    setInterval:(fn,ms)=>{if(disposed)return 0;const id=window.setInterval(run(fn),ms);intervals.add(id);return id;},
    clearInterval:id=>{intervals.delete(id);window.clearInterval(id);},
    IntersectionObserver:observer(window.IntersectionObserver),ResizeObserver:observer(window.ResizeObserver),
    fetch:(url,options={})=>window.fetch(url,{...options,signal:options.signal?AbortSignal.any([abort.signal,options.signal]):abort.signal}),
    createImageBitmap:async(...args)=>{const bitmap=await window.createImageBitmap(...args);if(disposed){bitmap.close();throw new DOMException('Unmounted','AbortError');}bitmaps.add(bitmap);return bitmap;},
    run,
    dispose(){if(disposed)return;disposed=true;abort.abort();
      [...cleanups].reverse().forEach(fn=>{try{fn();}catch{}});
      context.revert();raf.forEach(id=>window.cancelAnimationFrame(id));timers.forEach(id=>window.clearTimeout(id));intervals.forEach(id=>window.clearInterval(id));bitmaps.forEach(b=>b.close());
      root.querySelectorAll('video').forEach(video=>video.pause());
      root.querySelectorAll('.integration-set[aria-hidden="true"]').forEach(el=>el.remove());
    }
  };
  return scope;
}
