import {afterEach,describe,expect,it,vi} from 'vitest';
import {originTouchScene} from '../app/funnel/motion/origin-touch-scene';

afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();});

describe('story artwork arrival',()=>{
 it('waits for the full stage, fits tall artwork and restores the original scene',()=>{
  document.body.innerHTML='<section><div class="origin-copy">Story</div><figure class="origin-art" style="scale:.9">Phone</figure></section>';
  const scene=document.querySelector('section'),art=scene.querySelector('figure');
  let viewportHeight=674,artHeight=800,resize;
  vi.spyOn(HTMLElement.prototype,'clientHeight','get').mockImplementation(function(){return this.classList.contains('origin-touch-artboard')?viewportHeight:0;});
  vi.spyOn(HTMLElement.prototype,'offsetHeight','get').mockImplementation(function(){return this===art?artHeight:viewportHeight;});
  const disconnect=vi.fn(),observe=vi.fn(),kill=vi.fn();let trigger;
  const animation={pause:vi.fn(),kill:vi.fn()};
  const cleanup=originTouchScene({document,ResizeObserver:class{constructor(fn){resize=fn;}observe=observe;disconnect=disconnect;},ScrollTrigger:{create:o=>{trigger=o;return {kill};}}},scene,animation,{id:'arrival',distance:1000});
  expect(scene.firstElementChild.className).toBe('origin-copy');
  expect(scene.children[1].className).toBe('touch-story');
  expect(animation.pause).toHaveBeenCalledWith(0);
  expect(trigger.start).toBe('top top');expect(trigger.pin).toBeUndefined();
  expect(trigger.trigger.style.height).toBe('1674px');
  expect(Number(art.style.scale)).toBeCloseTo(570/800);
  viewportHeight=540;artHeight=600;resize();trigger.onRefreshInit();
  expect(Number(art.style.scale)).toBeCloseTo(436/600);
  expect(trigger.trigger.style.height).toBe('1540px');
  cleanup();
  expect(disconnect).toHaveBeenCalledOnce();expect(kill).toHaveBeenCalledOnce();
  expect(scene.children.length).toBe(2);expect(scene.lastElementChild).toBe(art);
  expect(Number(art.style.scale)).toBe(.9);expect(scene.hasAttribute('data-touch-arrival')).toBe(false);
 });
});
