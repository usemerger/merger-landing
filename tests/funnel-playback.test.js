import {describe,it,expect,vi} from 'vitest';
import {createInlinePlayback} from '../app/funnel/motion/inline-playback';

function setup(options={}){
 const videos=[0,1,2].map(()=>({paused:true,ended:false,currentTime:0,pause:vi.fn(function(){this.paused=true;}),play:vi.fn(function(){this.paused=false;return Promise.resolve();})}));
 const load=vi.fn(),onState=vi.fn();
 const player=createInlinePlayback({videos,load,onState,...options});
 player.setEnabled(true);
 const visible=(index,ratio=1)=>player.visibility([{target:videos[index],intersectionRatio:ratio}]);
 return {videos,load,onState,player,visible};
}
const flush=()=>new Promise(resolve=>queueMicrotask(resolve));

describe('visible inline walkthrough playback',()=>{
 it('loads and plays only the most visible film, muted and inline',async()=>{
  const {videos,load,visible}=setup();visible(0);await flush();
  expect(load).toHaveBeenCalledExactlyOnceWith(videos[0]);
  expect(videos[0]).toMatchObject({paused:false,muted:true,defaultMuted:true,playsInline:true});
  visible(0,0);visible(1);await flush();
  expect(videos[0].paused).toBe(true);expect(videos[1].paused).toBe(false);expect(videos[2].play).not.toHaveBeenCalled();
 });
 it('does not retry blocked autoplay, but a direct tap can recover',async()=>{
  const {videos,player,onState,visible}=setup();
  videos[0].play.mockRejectedValueOnce(new DOMException('Gesture required','NotAllowedError'));
  visible(0);await flush();
  expect(onState).toHaveBeenCalledWith(videos[0],'blocked');
  visible(0,.75);visible(0,1);expect(videos[0].play).toHaveBeenCalledTimes(1);
  player.toggle(videos[0]);await flush();expect(videos[0].play).toHaveBeenCalledTimes(2);expect(videos[0].paused).toBe(false);
 });
 it('preserves a user pause after scrolling out and back',async()=>{
  const {videos,player,visible}=setup();visible(0);await flush();player.toggle(videos[0]);visible(0,0);visible(0);
  expect(videos[0].paused).toBe(true);expect(videos[0].play).toHaveBeenCalledTimes(1);
 });
 it('offers manual playback when reduced motion or data saving disables autoplay',async()=>{
  const {videos,player,visible}=setup({canAutoplay:()=>false});visible(0);expect(videos[0].play).not.toHaveBeenCalled();
  player.toggle(videos[0]);await flush();expect(videos[0].paused).toBe(false);
 });
 it('pauses when backgrounded and resumes when visible again',async()=>{
  let hidden=false;const {videos,player,visible}=setup({isHidden:()=>hidden});visible(0);await flush();
  hidden=true;player.sync();expect(videos[0].paused).toBe(true);
  hidden=false;player.sync();await flush();expect(videos[0].paused).toBe(false);
 });
 it('cancels late play completion after switching to desktop mode',async()=>{
  const {videos,player,visible}=setup();let resolve;
  videos[0].play.mockImplementation(()=>new Promise(done=>{resolve=()=>{videos[0].paused=false;done();};}));
  visible(0);player.setEnabled(false);resolve();await flush();expect(videos[0].paused).toBe(true);
 });
 it('pauses and prevents new playback after route disposal',async()=>{
  const {videos,player,visible}=setup();visible(0);await flush();player.dispose();visible(1);player.toggle(videos[1]);
  expect(videos.every(v=>v.paused)).toBe(true);expect(videos[1].play).not.toHaveBeenCalled();
 });
});
