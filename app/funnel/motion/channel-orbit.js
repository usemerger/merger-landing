
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => {
  'use strict';
  // Explanatory marketing motion, driven by the same reversible scroll timeline.
  // DOM logos stay crisp; the original Three.js model supplies the real shards/core.
  window.MergerChannelOrbit = {
    create(section) {
      const stage = section.querySelector('.channel-orbit');
      const host = stage.querySelector('.channel-singularity');
      const nodes = [...stage.querySelectorAll('.channel-orbit-item')];
      const rings = stage.querySelector('.channel-orbit-rings');
      const reduce = matchMedia('(prefers-reduced-motion:reduce)');
      let model, promise, disposed = false, near = false, width = 0, height = 0;
      const state = {open:0, clock:0, spin:0, turn:0, gather:0, reveal:0};
      const clamp = value => Math.max(0, Math.min(1, value));
      const smooth = value => {const t=clamp(value);return t*t*(3-2*t);};

      function draw() {
        if(disposed)return;
        nodes.forEach((node,i) => {
          const arrival = smooth((state.reveal-i*.045)/.4);
          const pull = smooth((state.gather-i*.025)/.775);
          const radius = 1-pull;
          const angle = i/nodes.length*Math.PI*2 - Math.PI/2 + state.turn + pull*.75;
          const depth = Math.sin(angle);
          const x = Math.cos(angle)*width*.395*radius;
          const y = Math.sin(angle)*height*.36*radius;
          const scale = (.94+depth*.06)*(1-pull*.7);
          node.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
          node.style.opacity=String(arrival*(1-smooth((pull-.68)/.32)));
          node.style.zIndex=depth>.1?'4':'2';
        });
        rings.style.opacity=String(.55*state.reveal*(1-state.gather));
        if(near&&!reduce.matches)model?.update(state.open,state.clock,{
          y:-.12+state.spin,z:-.05+state.open*.06
        });
        stage.dataset.openness=state.open.toFixed(3);
        stage.dataset.gather=state.gather.toFixed(3);
        stage.dataset.turn=state.turn.toFixed(3);
        stage.dataset.clock=state.clock.toFixed(3);
        stage.dataset.spin=state.spin.toFixed(6);
      }
      async function load() {
        if(promise||disposed||reduce.matches)return;
        promise=import('./models/singularity-scroll.js')
          .then(m=>m.createScrollSingularity(host))
          .then(instance=>{if(disposed){instance.dispose();return;}model=instance;draw();})
          .catch(()=>{host.dataset.ready='false';});
      }
      const resize = new ResizeObserver(entries=>{
        width=entries[0].contentRect.width;height=entries[0].contentRect.height;draw();
      });
      resize.observe(stage);
      const observer=new IntersectionObserver(([entry])=>{
        near=entry.isIntersecting;if(near){load();draw();}
      },{rootMargin:'650px'});
      observer.observe(stage);
      const restore=()=>{if(!document.hidden){if(near)load();draw();}};
      scope.listen(document,'visibilitychange',restore);
      function staticPose(){Object.assign(state,{open:.8,clock:6,spin:0,turn:0,gather:0,reveal:1});draw();}
      function timeline() {
        Object.assign(state,{open:0,clock:0,spin:0,turn:0,gather:0,reveal:0});draw();
        const tl=gsap.timeline({onUpdate:draw});
        // Let the fully assembled mark register after the scene crossfade.
        // These are scroll-timeline units, not an automatic playback delay.
        const logoHold=1.6;
        tl.to({}, {duration:logoHold},0)
          .to(state,{open:.9,duration:1.6,ease:'power2.inOut'},logoHold)
          .to(state,{reveal:1,duration:1.2,ease:'none'},logoHold+.45)
          .to(state,{clock:24,duration:7.1,ease:'none'},logoHold)
          // One continuous forward revolution lands on the original face without
          // rewinding. Deceleration spans closing, rather than reversing its angle.
          .to(state,{spin:Math.PI*2,duration:7.1,ease:'sine.inOut'},logoHold)
          .to(state,{turn:1.55,duration:4.4,ease:'none'},logoHold+.65)
          // Keep all ten marks visible before drawing them into the exposed core.
          .to(state,{gather:1,duration:1.65,ease:'power2.inOut'},logoHold+4.05)
          // The last logo reaches the core before the physical shards close.
          .to(state,{open:0,duration:1.3,ease:'power2.inOut'},logoHold+5.8)
          // Match the initial assembled orientation, then hold before unpinning.
          .to({}, {duration:1.1},logoHold+7.1);
        return tl;
      }
      const dispose=()=>{
        disposed=true;observer.disconnect();resize.disconnect();model?.dispose();
        document.removeEventListener('visibilitychange',restore);
      };
      scope.listen(window,'pagehide',dispose,{once:true});
      return {timeline,staticPose,draw};
    }
  };
})();

}
