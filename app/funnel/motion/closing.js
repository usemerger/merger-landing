
export default function mount(scope) {
const {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;
(() => { const media=gsap.matchMedia();media.add('(prefers-reduced-motion:no-preference)',()=>{window.MergerTextMotion?.reveal(document.querySelector('#faq-heading'));});document.querySelectorAll('.faq-list details').forEach(el=>scope.listen(el,'toggle',()=>requestAnimationFrame(()=>ScrollTrigger.refresh(true))));})();
}
