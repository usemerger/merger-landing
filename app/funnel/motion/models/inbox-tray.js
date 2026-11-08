import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Explanatory, scroll-scrubbed product sculpture. No perpetual render loop.
const clamp=v=>Math.max(0,Math.min(1,v));
const easeOut=t=>1-Math.pow(1-clamp(t),3); // Existing GSAP power2.out.
const mix=(a,b,t)=>a+(b-a)*t;
const documents=[
 ['telegram','RIVERFRONT / PROPERTY','Revised terms','The seller has updated the terms.','Review the latest offer'],
 ['whatsapp','HARBOR POINT / INVENTORY','Ready to sign','The agreement is ready for review.','Confirm the final details'],
 ['slack','NORTHLINE / CAPITAL','Investor introduction','An introduction for the next round.','Arrange a conversation'],
 ['signal','CEDAR / ACQUISITION','Updated proposal','A new proposal from the buyer.','Compare the terms'],
 ['telegram','HARBOR POINT / INVENTORY','Delivery details','The shipment window has changed.','Confirm with the supplier'],
 ['whatsapp','RIVERFRONT / PROPERTY','Buyer feedback','The buyer has a few more questions.','Send the revised document'],
 ['slack','CEDAR / ACQUISITION','Due diligence','Additional documents have arrived.','Review before the call'],
 ['signal','NORTHLINE / CAPITAL','Next conversation','The investor is available this week.','Find a time to connect'],
 ['telegram','CEDAR / ACQUISITION','Another revision','Updated numbers in the latest file.','Check the new version'],
 ['slack','HARBOR POINT / INVENTORY','A new opportunity','Another introduction to follow up.','Keep the details together'],
 ['whatsapp','NORTHLINE / CAPITAL','Terms to review','The next step is in this message.','Who is following up?'],
 ['signal','RIVERFRONT / PROPERTY','One more detail','An important detail in another chat.','Find the original conversation']
];

export async function createInboxTray(host) {
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse), (max-width:850px)').matches?1.25:1.75));
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const scene=new THREE.Scene(),rig=new THREE.Group();scene.add(rig);
 const camera=new THREE.PerspectiveCamera(33,1,.1,60);camera.position.set(5.4,6.3,8.2);camera.lookAt(0,.65,0);
 const studio=new THREE.Scene();studio.background=new THREE.Color('#060708');
 [
  [[-4,5,1],2,7,'#dce4ec',5],[[4,4,-2],1.5,6,'#f0d2a4',5],
  [[0,6,-4],6,1.4,'#e4e8ed',6],[[1,1,5],4,1,'#9cabb9',1.2]
 ].forEach(([p,w,h,c,power])=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(power),side:THREE.DoubleSide}));
  m.position.set(...p);m.lookAt(0,0,0);studio.add(m);
 });
 const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.06);scene.environment=env.texture;pmrem.dispose();
 studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 const ambient=new THREE.AmbientLight('#c5cfd8',.28);scene.add(ambient);
 const key=new THREE.DirectionalLight('#e2e8ee',3.8);key.position.set(-3,7,5);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:1,far:20});
 key.shadow.bias=-.0005;key.shadow.normalBias=.015;key.shadow.radius=3;scene.add(key);
 const rim=new THREE.DirectionalLight('#e6c18c',3.2);rim.position.set(3,4,-4);scene.add(rim);
 const front=new THREE.DirectionalLight('#aec1d3',.65);front.position.set(0,3,7);scene.add(front);

 // A folded, bevelled metal tray with a lower front lip and rubber feet.
 const steel=new THREE.MeshPhysicalMaterial({color:'#111518',metalness:.92,roughness:.31,envMapIntensity:1.2,clearcoat:.2,clearcoatRoughness:.35});
 const edge=new THREE.MeshStandardMaterial({color:'#484e52',metalness:1,roughness:.25,envMapIntensity:1.3});
 const rubber=new THREE.MeshStandardMaterial({color:'#070809',roughness:.85});
 const tray=new THREE.Group();rig.add(tray);
 function box(parent,w,h,d,x,y,z,material,r=.04){
  const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,h*.45,w*.45,d*.45)),material);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 box(tray,4.35,.13,3.2,0,0,0,steel,.05);
 box(tray,.105,.42,3.16,-2.13,.23,0,steel);box(tray,.105,.42,3.16,2.13,.23,0,steel);
 box(tray,4.3,.44,.11,0,.24,-1.55,steel);
 box(tray,4.28,.15,.11,0,.095,1.55,steel);
 box(tray,.022,.025,3.07,-2.13,.444,0,edge,.01);box(tray,.022,.025,3.07,2.13,.444,0,edge,.01);
 box(tray,4.20,.025,.025,0,.464,-1.55,edge,.01);box(tray,4.18,.018,.02,0,.172,1.59,edge,.008);
 for(const x of [-1.7,1.7])for(const z of [-1.13,1.13])box(tray,.32,.11,.32,x,-.115,z,rubber);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.24}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-.18;floor.receiveShadow=true;scene.add(floor);

 const icons={};await Promise.all(['telegram','whatsapp','slack','signal'].map(async channel=>{
  const img=new Image();img.src=`/funnel-v3/assets/channel-orbit/${channel}.svg`;try{await img.decode();icons[channel]=img;}catch{}
 }));
 await document.fonts.ready;
 const textures=[];
 function textureFor(entry,index){
  const [channel,deal,title,body,next]=entry;
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=850;const c=canvas.getContext('2d');
  c.fillStyle=index%3===0?'#303638':index%3===1?'#242a2c':'#293033';c.fillRect(0,0,1200,850);
  // Fine, deterministic paper grain; no animated texture or expensive filters.
  for(let y=0;y<850;y+=3){c.fillStyle=`rgba(255,255,255,${.007+(y%11)*.0008})`;c.fillRect(0,y,1200,1);}
  c.fillStyle='#8c9698';c.font='500 22px Inter, sans-serif';c.fillText('OPPORTUNITY / CORRESPONDENCE',76,82);
  if(icons[channel])c.drawImage(icons[channel],1030,49,56,56);
  c.strokeStyle='#626c6e';c.lineWidth=1;c.beginPath();c.moveTo(76,128);c.lineTo(1124,128);c.stroke();
  c.fillStyle='#d0b680';c.font='500 25px Inter, sans-serif';c.fillText(deal,76,198);
  c.fillStyle='#eeeee7';c.font='500 57px Inter, sans-serif';c.fillText(title,76,287);
  c.fillStyle='#a8b2b4';c.font='400 29px Inter, sans-serif';c.fillText(body,76,351);
  c.strokeStyle='#778184';c.lineWidth=2;
  [434,472,510].forEach((y,i)=>{c.beginPath();c.moveTo(76,y);c.lineTo(1050-i*110,y);c.stroke();});
  c.fillStyle='#bec5c3';c.font='400 26px Inter, sans-serif';c.fillText(next,76,642);
  c.strokeStyle='#5b6669';c.beginPath();c.moveTo(76,719);c.lineTo(1124,719);c.stroke();
  c.fillStyle='#879393';c.font='400 21px Inter, sans-serif';c.fillText(channel[0].toUpperCase()+channel.slice(1)+' conversation',76,770);
  c.textAlign='right';c.fillText(String(index+1).padStart(2,'0'),1124,770);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(texture);return texture;
 }
 const pageGeometry=new RoundedBoxGeometry(3.30,.022,2.34,2,.009);
 const faceGeometry=new THREE.PlaneGeometry(3.27,2.31);
 const pageEdge=new THREE.MeshStandardMaterial({color:'#252a2c',roughness:.78,metalness:.08});
 const papers=documents.map((entry,i)=>{
  const group=new THREE.Group();rig.add(group);
  const body=new THREE.Mesh(pageGeometry,pageEdge);body.castShadow=true;body.receiveShadow=true;group.add(body);
  const face=new THREE.Mesh(faceGeometry,new THREE.MeshStandardMaterial({map:textureFor(entry,i),color:'#646c70',roughness:.68,metalness:.06}));
  face.rotation.x=-Math.PI/2;face.position.y=.012;face.receiveShadow=true;group.add(face);
  return group;
 });
 // Deliberate physical destinations. Lower sheets remain in the tray; later ones
 // end outside its lip. No random values or physics drift when reversing scroll.
 const spreads=[
  [0,0,.02],[-.13,.07,-.04],[.17,-.08,.08],[-.25,.13,-.11],
  [.30,-.18,.14],[-.42,.29,-.19],[.52,.34,.24],[-.63,-.28,-.28],
  [.78,.5,.33],[-1.05,.72,-.39],[1.15,-.48,.43],[-.28,1.03,-.16]
 ];
 let last={reveal:0,fill:0,scatter:0},disposed=false;
 function update(state){
  if(disposed)return;last={...state};
  const {reveal,fill,scatter}=state;
  rig.rotation.y=mix(-.16,-.04,clamp(fill));rig.position.y=mix(-.12,0,reveal);
  renderer.toneMappingExposure=mix(.25,1.05,reveal);
  let landed=0;
  papers.forEach((paper,i)=>{
   // The first sheet lands alone. Subsequent arrivals overlap as the inbox fills.
   const arrival=i===0?0:.18+(i-1)*.066;
   const local=clamp((fill-arrival)/.16),land=easeOut(local),[sx,sz,angle]=spreads[i];
   paper.visible=local>0;
   const x=sx*mix(.13,1,scatter),z=sz*mix(.13,1,scatter);
   const layer=.105+i*.037;
   paper.position.set(mix((i%2?1:-1)*(1.25+i*.06),x,land),mix(6.3+i*.05,layer,land),mix(-.65,z,land));
   paper.rotation.set((1-land)*(.22+(i%3)*.1),mix((i%2?-.18:.18),angle*mix(.14,1,scatter),land),(1-land)*(i%2?-.16:.16));
   if(local>=.9999)landed++;
  });
  host.dataset.fill=fill.toFixed(3);host.dataset.scatter=scatter.toFixed(3);host.dataset.landed=String(landed);
  if(!document.hidden)renderer.render(scene,camera);
 }
 function resize(){
  const r=host.getBoundingClientRect();if(!r.width||!r.height)return;
  renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;
  const distance=Math.max(1,1.18/camera.aspect);
  camera.position.set(5.4*distance,6.3*distance,8.2*distance);camera.lookAt(0,.65,0);camera.updateProjectionMatrix();update(last);
 }
 const observer=new ResizeObserver(resize);observer.observe(host);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dataset.ready='false';});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{resize();host.dataset.ready='true';});
 resize();host.dataset.ready='true';
 return {update,previewStill(){
  const restore=last;update({reveal:1,fill:1,scatter:1});
  const preview=document.querySelector('[data-tray-still-preview]');
  if(preview)preview.src=renderer.domElement.toDataURL('image/png');
  update(restore);
 },dispose(){disposed=true;observer.disconnect();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();}};
}
