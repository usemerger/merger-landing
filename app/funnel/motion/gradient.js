import {ShaderMount} from './vendor/paper-shaders-0.0.82/dist/shader-mount.js';
import {meshGradientFragmentShader} from './vendor/paper-shaders-0.0.82/dist/shaders/mesh-gradient.js';

export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;


const host=document.querySelector('#gradient-mesh');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const colors=['#0c1112','#68563c','#232b28','#3c4235','#0c1112'].map(hex=>[...hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255),1]);
const uniforms={u_colors:[...colors,...Array.from({length:5},()=>[0,0,0,0])],u_colorsCount:colors.length,u_distortion:.55,u_swirl:.18,u_grainMixer:0,u_grainOverlay:.035,u_fit:2,u_scale:1.12,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:.5,u_originY:.5,u_worldWidth:0,u_worldHeight:0};
let shader,visible=true;
function sync(){
 const paused=!visible||reduce.matches||document.body.dataset.motion==='reduced'||document.body.dataset.backgroundPaused==='true'||document.hidden;
 shader?.setSpeed(paused?0:.18);
 host.dataset.state=shader?(paused?'paused':'animated'):'fallback';
}
const media=gsap.matchMedia();
media.add('(min-width:851px) and (pointer:fine)',()=>{
try{
 shader=new ShaderMount(host,meshGradientFragmentShader,uniforms,{alpha:false,antialias:false},0,4500,1,786432);
 host.classList.remove('fallback');
 host.dataset.renderer='paper-mesh-gradient-0.0.82';
 const instance=shader;
 scope.listen(host.querySelector('canvas'),'webglcontextlost',()=>{if(shader===instance){host.dataset.state='fallback';host.classList.add('fallback');}});
 sync();
}catch{host.dataset.state='fallback';host.classList.add('fallback');}
return()=>{const instance=shader;shader=null;instance?.dispose();host.dataset.state='fallback';};
});
// Phones retain the CSS ambient backdrop, with no continuously running shader.
const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(host);
scope.listen(document,'merger:motionchange',sync);scope.listen(document,'visibilitychange',sync);scope.listen(reduce,'change',sync);
scope.listen(window,'pagehide',()=>{const instance=shader;shader=null;instance?.dispose();});scope.listen(window,'pageshow',sync);

}
