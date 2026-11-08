// One-time, reproducible import of the approved workshop. The generated motion
// modules and content are reviewed application source, not visitor-editable HTML.
import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
import {parse} from 'acorn';
import MagicString from 'magic-string';
import postcss from 'postcss';
const project=path.resolve('..');
const reference=path.join(project,'outputs/funnel-migration-20261108/approved-reference');
const original=path.join(project,'outputs/ios-funnel-section-map-20261105/promise-v2');
const out='app/funnel';fs.mkdirSync(out+'/motion',{recursive:true});
const write=(file,text)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);};
const $=load(fs.readFileSync(path.join(reference,'index.html'),'utf8'));
const scripts=$('script[src]').map((_,e)=>$(e).attr('src').split('?')[0]).get().filter(s=>!s.startsWith('vendor/'));
const styles=$('link[rel="stylesheet"]').map((_,e)=>$(e).attr('href').split('?')[0]).get();
const approved=JSON.parse(fs.readFileSync(path.join(project,'outputs/funnel-migration-20261108/approved-copy.json'),'utf8'));
const fieldMap={'headline-copy':'#promise','body-copy':'#hero-body','context-headline-copy':'#context-heading','context-body-copy':'#context-body','context-channel-headline-copy':'#channels-heading','context-channel-body-copy':'#context-channel-body','trust-title-copy':'#trust-heading','trust-support-copy':'#trust-support','workflow-heading-copy':'#workflow-heading','workflow-support-copy':'#workflow-support'};
for(const f of approved.fields){const target=f.target||fieldMap[f.id];if(!target||!f.value)continue;const el=$(target);if(el.length){
 // Preserve the existing line wrappers for motion; only replace when copy differs.
 if(el.text().replace(/\s/g,'')!==f.value.replace(/\s/g,''))el.text(f.value);
}}
const resolveAsset=s=>s.replace(/(?<![\w/-])assets\//g,'/funnel-v3/assets/');
$('script').remove();
$('[src],[data-src],[poster],[href]').each((_,e)=>{for(const attr of ['src','data-src','poster','href']){const value=$(e).attr(attr);if(!value)continue;let next=resolveAsset(value);if(next.startsWith('https://usemerger.com/')){next=next.slice('https://usemerger.com'.length);$(e).removeAttr('target rel');}$(e).attr(attr,next);}});
$('a[href*="review"], [data-tray-export], [data-vault-export]').remove();
const review=$('#review-index');review.nextAll().remove();review.remove();
$('header.nav,.review-dock,#screen-dialog').remove();
const ids={context:['deal-desk'],workflow:['documents'],confidence:['faq'],start:['pricing','waitlist','download']};
for(const [section,aliases] of Object.entries(ids))for(const id of aliases)$(`#${section}`).prepend(`<span id="${id}" class="funnel-anchor" aria-hidden="true"></span>`);
$('img').each((_,e)=>{if(!$(e).attr('fetchpriority'))$(e).attr('loading','lazy');});
$('.footer-column').first().append('<a href="/for">Who it’s for</a><a href="/playbooks">Playbooks</a>');
const faq=$('.faq-list details').map((_,e)=>({question:$(e).find('summary').text().trim(),answer:$(e).find('p').text().trim()})).get();
const offer=$('#start');const purchase=offer.find('.offer-purchase');purchase.replaceWith('<div data-react-purchase></div>');
const footer=$('#footer').remove();
// Remove the offer from main and split its React purchase slot independently.
offer.remove();
const offerHtml=String(offer);
const parts=offerHtml.split('<div data-react-purchase=""></div>');
if(parts.length!==2)throw new Error('Purchase slot not found');
write(out+'/content.json',JSON.stringify({main:$('main').html(),offerBefore:parts[0],offerAfter:parts[1],footer:String(footer),faq},null,2));
// Only copied production dependencies; omit workshop HTML, scripts and old renders.
fs.cpSync(path.join(reference,'assets'),'public/funnel-v3/assets',{recursive:true});
fs.copyFileSync(path.join(original,'assets/aspiration/merger-singularity.glb'),'public/funnel-v3/assets/aspiration/merger-singularity.glb');
let css='';
for(const file of styles){const tree=postcss.parse(resolveAsset(fs.readFileSync(path.join(reference,file),'utf8')));let fonts='';
 tree.walkAtRules('font-face',rule=>{fonts+=rule.toString();rule.remove();});
 tree.walkRules(rule=>{if(rule.parent.type==='atrule'&&/keyframes/.test(rule.parent.name))return;rule.selector=rule.selector.replace(/:root|\bhtml\b|\bbody\b/g,':scope');});
 css+=fonts+'\n@scope (.funnel-home) {\n'+tree.toString()+'\n}\n';
}
write(out+'/funnel.css',css.replace(/Inter/g,'MergerFunnelInter').replaceAll('/assets/MergerFunnelInterVariable.woff2','/assets/InterVariable.woff2'));

function clean(file,source){
 if(file==='hero.js'){
  const start=source.indexOf('  const screen=');const end=source.indexOf('  function configureScroll');
  source=source.slice(0,start)+"  let smoother,intro;\n  const off=()=>reduce.matches;\n  const notify=()=>document.dispatchEvent(new Event('merger:motionchange'));\n"+source.slice(end);
  const a=source.indexOf("  $$('[data-preview]')");const b=source.indexOf("  $$('a[href^=",a);source=source.slice(0,a)+source.slice(b);
  source=source.slice(0,source.indexOf("  const key='merger-promise"))+"  motionChange();\n})();";
 }else if(file==='context.js'){
  const start=source.indexOf('  function applyCopy');const end=source.indexOf('  function buildMotion');source=source.slice(0,start)+source.slice(end);
  source=source.slice(0,source.indexOf("  form.addEventListener('submit'"))+"  buildMotion();\n})();";
 }else if(file==='workflow.js')source=source.slice(0,source.indexOf('  // Copy editing stays local'))+"  buildMotion();\n})();";
 else if(file==='trust.js')source=source.slice(0,source.indexOf("  const form=document.querySelector('#trust-copy-form')"))+"  scope.onDispose(()=>{frames.forEach(frame=>frame.close());frames.clear();});\n  buildMotion();\n})();";
 else if(file==='closing.js')source=`(() => { const media=gsap.matchMedia();media.add('(prefers-reduced-motion:no-preference)',()=>{window.MergerTextMotion?.reveal(document.querySelector('#faq-heading'));});document.querySelectorAll('.faq-list details').forEach(el=>el.addEventListener('toggle',()=>requestAnimationFrame(()=>ScrollTrigger.refresh(true))));})();`;
 else if(file==='offer.js'){const a=source.indexOf('  // This is a plan comparison');const b=source.indexOf('  function words');source=source.slice(0,a)+source.slice(b);source=source.replace('  setup();','  scope.onDispose(()=>running.forEach(animation=>animation.cancel()));\n  setup();');}
 else if(file==='story.js')source=source.replace("!$('#screen-dialog').open","true");
 else if(file==='gradient.js'){source=source.replace("()=>shader?.setSpeed(0)","()=>shader?.dispose()");}
 return source;
}
function instrument(source){
 const tree=parse(source,{ecmaVersion:'latest',sourceType:'module'}),s=new MagicString(source);
 function walk(n,parent){if(!n||typeof n!=='object')return;
  if(n.type==='CallExpression'&&n.callee.type==='MemberExpression'&&n.callee.property.name==='addEventListener'){
   const c=n.callee;s.overwrite(c.object.end,c.end,',');s.prependLeft(c.object.start,'scope.listen(');s.remove(c.end,c.end+1);
   // original target.addEventListener(a,b) becomes scope.listen(target,a,b)
  }
  if(n.type==='Identifier'&&n.name==='MergerTextMotion'&&!(parent?.type==='MemberExpression'&&parent.property===n))s.prependLeft(n.start,'window.');
  for(const [key,v] of Object.entries(n))if(key!=='start'&&key!=='end'){if(Array.isArray(v))v.forEach(x=>walk(x,n));else if(v&&typeof v==='object')walk(v,n);}
 }walk(tree);return s.toString();
}
for(const file of scripts){let source=clean(file,fs.readFileSync(path.join(reference,file),'utf8'));
 source=resolveAsset(source).replaceAll('./vendor/singularity-scroll.js','./models/singularity-scroll.js').replaceAll('./vendor/inbox-tray.js','./models/inbox-tray.js').replaceAll('./vendor/escrow-vault.js','./models/escrow-vault.js').replace(/(\.\/models\/[\w-]+\.js)\?[^'"]+/g,'$1');
 fs.cpSync(path.join(reference,'vendor/paper-shaders-0.0.82'),out+'/motion/vendor/paper-shaders-0.0.82',{recursive:true});
 const imports=[];source=source.replace(/^import .+;\s*$/gm,m=>{imports.push(m);return '';});
 source=instrument(source);
 write(out+'/motion/'+file,imports.join('\n')+`\nexport default function mount(scope) {\nconst {window,document,gsap,ScrollTrigger,ScrollSmoother,matchMedia,requestAnimationFrame,cancelAnimationFrame,setTimeout,clearTimeout,setInterval,clearInterval,IntersectionObserver,ResizeObserver,fetch,createImageBitmap}=scope;\n${source}\n}\n`);
}
// Keep WebGL sources separate with shared Three chunks, not three bundled copies.
for(const file of ['singularity-scroll-source.js','singularity-motion.mjs','singularity-shaders.js','inbox-tray-source.js','escrow-vault-source.js']){
 let source=resolveAsset(fs.readFileSync(path.join(original,file),'utf8'));
 if(file==='singularity-scroll-source.js')source=source.replace("const model=await new GLTFLoader().loadAsync('/funnel-v3/assets/aspiration/merger-singularity.glb');", "let model;try{model=await new GLTFLoader().loadAsync('/funnel-v3/assets/aspiration/merger-singularity.glb');}catch(error){env.dispose();renderer.dispose();renderer.domElement.remove();host.dataset.ready='false';throw error;}");
 write(out+'/motion/models/'+file.replace('-source',''),source);
}
write(out+'/motion/index.js',scripts.map((f,i)=>`import mount${i} from './${f}';`).join('\n')+`\nexport const mounts=[${scripts.map((_,i)=>'mount'+i).join(',')}];\n`);
console.log(JSON.stringify({sections:$('main>section').length,scripts:scripts.length,faq:faq.length,styles:styles.length}));
