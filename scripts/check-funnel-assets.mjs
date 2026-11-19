import fs from 'node:fs';
import path from 'node:path';
const missing=new Set(),declared=new Set();
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(js|json|css|mjs)$/.test(file)){
 const source=fs.readFileSync(file,'utf8');
 for(const match of source.matchAll(/\/funnel-v3\/assets\/[\w./-]+\.(?:png|webp|svg|glb|woff2|mp4|jpg)/g))declared.add(match[0]);
}}}
walk('app/funnel');
for(const [dir,count,prefix,pad] of [['trust/frames',96,'frame-',3],['aspiration/handshake-frames',96,'',2],['aspiration/watch-cinematic-frames',96,'',2],['aspiration/car-silhouette-frames',16,'',2]])for(let i=0;i<count;i++)declared.add(`/funnel-v3/assets/${dir}/${prefix}${String(i).padStart(pad,'0')}.webp`);
for(const url of declared)if(!fs.existsSync('public'+url))missing.add(url);
console.log(JSON.stringify({declared:declared.size,missing:[...missing]},null,2));
if(missing.size)process.exitCode=1;
