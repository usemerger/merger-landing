import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {FILMS,renderFrame} from './scenes.mjs';
const root=dirname(fileURLToPath(import.meta.url));
for(const film of FILMS){
 const folder=join(root,'frames',film.id);mkdirSync(folder,{recursive:true});
 writeFileSync(join(root,`${film.id}-poster.svg`),renderFrame(film.id,film.poster));
 for(let frame=0;frame<film.duration*30;frame++)writeFileSync(join(folder,`${String(frame).padStart(4,'0')}.svg`),renderFrame(film.id,frame/30));
 console.log(`${film.id}: ${film.duration*30} frames`);
}
