import {FILMS,renderFrame} from './scenes.mjs';
const stage=document.getElementById('stage'),play=document.getElementById('play'),replay=document.getElementById('replay'),timeline=document.getElementById('timeline'),clock=document.getElementById('clock'),download=document.getElementById('download');
const tabs=[...document.querySelectorAll('[data-film]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let film=FILMS[0],time=reduced.matches?FILMS[0].poster:0,playing=!reduced.matches,visible=true,last=0,rendered=0;
function draw(){stage.innerHTML=renderFrame(film.id,time);timeline.value=time;clock.textContent=`${time.toFixed(1)} / ${film.duration.toFixed(1)} s`;play.textContent=playing?'Pause':'Play';}
function choose(id){film=FILMS.find(f=>f.id===id);time=reduced.matches?film.poster:0;playing=!reduced.matches;timeline.max=film.duration;download.href=`${film.id}.mp4`;stage.setAttribute('aria-labelledby',`tab-${film.id}`);tabs.forEach(tab=>{const selected=tab.dataset.film===film.id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1});draw()}
tabs.forEach((tab,index)=>{tab.onclick=()=>choose(tab.dataset.film);tab.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(index+1)%3;if(e.key==='ArrowLeft')next=(index+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();tabs[next].focus();choose(tabs[next].dataset.film)}}});
play.onclick=()=>{playing=!playing;draw()};replay.onclick=()=>{time=0;playing=true;draw()};timeline.oninput=()=>{time=+timeline.value;playing=false;draw()};
document.addEventListener('visibilitychange',()=>{last=0});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0},{threshold:.2}).observe(stage);
reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;time=film.poster;draw()}});
function tick(now){if(last&&playing&&visible&&!document.hidden){time=(time+Math.min(.1,(now-last)/1000))%film.duration;if(now-rendered>32){draw();rendered=now}}last=now;requestAnimationFrame(tick)}
draw();requestAnimationFrame(tick);
