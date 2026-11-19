import {describe,it,expect,vi,afterEach} from 'vitest';
import {touchStory} from '../app/funnel/motion/touch-story';

afterEach(()=>document.body.replaceChildren());
describe('native touch scroll scenes',()=>{
 it('reserves scroll travel, refreshes geometry and restores the original DOM on teardown',()=>{
  document.body.innerHTML='<section><h2>Story</h2><div id="stage">Art</div><footer>Next</footer></section>';
  const stage=document.querySelector('#stage');let height=700,travel=1200;
  Object.defineProperty(stage,'offsetHeight',{get:()=>height});
  let options;const kill=vi.fn();
  const animation={pause:vi.fn(),kill:vi.fn()};
  const cleanup=touchStory({document,ScrollTrigger:{create:vi.fn(o=>{options=o;return {kill};})}},stage,animation,{id:'test',distance:()=>travel});
  const wrapper=stage.parentElement;
  expect(wrapper.style.height).toBe('1900px');expect(options.pin).toBeUndefined();
  expect(options.animation).toBe(animation);expect(options.start).toBe('top top');
  height=430;travel=900;options.onRefreshInit();
  expect(wrapper.style.height).toBe('1330px');expect(options.end()).toBe('+=900');
  cleanup();expect(kill).toHaveBeenCalledOnce();expect(animation.kill).toHaveBeenCalledOnce();
  expect(document.querySelector('.touch-story')).toBeNull();expect(stage.previousElementSibling.tagName).toBe('H2');expect(stage.nextElementSibling.tagName).toBe('FOOTER');
  expect(stage.classList.contains('touch-story-stage')).toBe(false);
 });
});
