import {touchStory} from './touch-story';

// Copy scrolls past first. The complete visual then settles into a stable
// viewport before any of its explanatory sequence advances.
export function originTouchScene(scope, scene, animation, options) {
  const {document,ResizeObserver}=scope;
  const art=scene.querySelector('.origin-art');
  const frame=document.createElement('div'),viewport=document.createElement('div');
  frame.className='origin-touch-frame';viewport.className='origin-touch-artboard';
  art.before(frame);frame.append(viewport);viewport.append(art);
  scene.dataset.touchArrival='true';
  const previousScale=art.style.scale;
  const fit=()=>{
    // Read untransformed layout only on resize/refresh, never on scroll. This
    // also fits taller phone/profile artwork without cropping the sequence.
    const available=Math.max(1,viewport.clientHeight-104);
    art.style.scale=String(Math.min(1,available/Math.max(1,art.offsetHeight)));
  };
  fit();
  const observer=new ResizeObserver(fit);observer.observe(viewport);observer.observe(art);
  const cleanup=touchStory(scope,frame,animation,options);
  return ()=>{
    observer.disconnect();cleanup();frame.replaceWith(art);
    art.style.scale=previousScale;delete scene.dataset.touchArrival;
  };
}
