import {describe,it,expect,vi} from 'vitest';
import {scrollFrames} from '../app/funnel/motion/scroll-frames';

describe('scroll artwork over a delayed network',()=>{
 function setup(){
  const pending=new Map(),draw=vi.fn();
  const canvas={width:300,height:400,getContext:()=>({clearRect:vi.fn(),drawImage:draw})};
  const host={dataset:{},querySelector:()=>canvas};
  const scope={fetch:vi.fn(url=>new Promise(resolve=>pending.set(Number(url.match(/(\d+)\.webp$/)[1]),resolve))),createImageBitmap:vi.fn(async value=>({value,close:vi.fn()}))};
  const player=scrollFrames(scope,host,'test',96);
  const finish=async i=>{pending.get(i)({ok:true,blob:async()=>i});for(let n=0;n<8;n++)await Promise.resolve();};
  return {player,host,pending,draw,scope,finish};
 }
 it('advances visible poses when scrolling overtakes pending requests',async()=>{
  const {player,host,pending,finish}=setup();
  player.warm();player.update(.5);
  await finish(0);expect(host.dataset.frame).toBe('0');
  await finish(1);expect(host.dataset.frame).toBe('1');
  expect(pending.has(48)).toBe(true);
  player.update(.8);await finish(48);
  expect(host.dataset.frame).toBe('48'); // old code discarded this until scrolling stopped
  expect(pending.has(76)).toBe(true);
  await finish(76);expect(host.dataset.frame).toBe('76');
  player.update(0);expect(host.dataset.frame).toBe('0');
  player.dispose();
 });
 it('does not paint a late response after teardown',async()=>{
  const {player,host,finish,draw}=setup();player.warm();player.dispose();await finish(0);
  expect(draw).not.toHaveBeenCalled();expect(host.dataset.ready).toBeUndefined();
 });
});
