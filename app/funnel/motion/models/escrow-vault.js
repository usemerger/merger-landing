import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// A physical, scroll-driven sculpture. No perpetual render loop or remote assets.
const clamp=n=>Math.max(0,Math.min(1,n));
const mix=(a,b,t)=>a+(b-a)*t;
export function createEscrowVault(host){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse), (max-width:850px)').matches?1.25:1.75));
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 const scene=new THREE.Scene(),rig=new THREE.Group();scene.add(rig);
 const camera=new THREE.PerspectiveCamera(31,1,.1,40);
 const studio=new THREE.Scene();studio.background=new THREE.Color('#030404');
 [
  [[-4,4,3],1.1,7,'#dbe4eb',4],[[4,4,-2],1,6,'#e8d5ad',3.2],
  [[0,5,-1],5,.6,'#d4dbe0',3],[[1,1,6],4,.6,'#89949c',.8]
 ].forEach(([p,w,h,c,power])=>{
  const light=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(power),side:THREE.DoubleSide}));
  light.position.set(...p);light.lookAt(0,0,0);studio.add(light);
 });
 const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.04);
 scene.environment=env.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 scene.add(new THREE.AmbientLight('#c9d0d5',.16));
 const key=new THREE.DirectionalLight('#e3e8ed',3);key.position.set(-4,6,5);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:20});key.shadow.bias=-.0003;key.shadow.normalBias=.02;scene.add(key);
 const rim=new THREE.DirectionalLight('#dbc393',2.5);rim.position.set(3,3,-3);scene.add(rim);
 const fill=new THREE.DirectionalLight('#b2bdc6',1.4);fill.position.set(1,2,7);scene.add(fill);
 const interiorLight=new THREE.PointLight('#d7ba7a',0,3.2,2);interiorLight.position.set(0,.2,.55);rig.add(interiorLight);
 const grain=document.createElement('canvas');grain.width=256;grain.height=256;const gc=grain.getContext('2d');
 for(let y=0;y<256;y++){const tone=118+((y*17)%31);gc.fillStyle=`rgb(${tone},${tone},${tone})`;gc.fillRect(0,y,256,1);}
 const grainTexture=new THREE.CanvasTexture(grain);grainTexture.wrapS=grainTexture.wrapT=THREE.RepeatWrapping;grainTexture.repeat.set(2,3);
 const metal=new THREE.MeshPhysicalMaterial({color:'#34393d',metalness:.86,roughness:.36,envMapIntensity:1.65,clearcoat:.1,clearcoatRoughness:.4,bumpMap:grainTexture,bumpScale:.006});
 const edge=new THREE.MeshStandardMaterial({color:'#464b4d',metalness:1,roughness:.26,envMapIntensity:1});
 const deep=new THREE.MeshStandardMaterial({color:'#050707',metalness:.4,roughness:.65});
 const gold=new THREE.MeshStandardMaterial({color:'#8c7953',metalness:.9,roughness:.32});
 function box(parent,w,h,d,x,y,z,mat,r=.04){
  const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w*.45,h*.45,d*.45)),mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function cylinder(parent,radius,length,x,y,z,mat,axis='z'){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,48),mat);
  if(axis==='z')mesh.rotation.x=Math.PI/2;
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 // Thick shell, visible interior and machined front frame. The opening is real.
 box(rig,2.72,.19,1.62,0,1.34,-.12,metal,.06);box(rig,2.72,.19,1.62,0,-1.34,-.12,metal,.06);
 box(rig,.19,2.55,1.62,-1.26,0,-.12,metal,.06);box(rig,.19,2.55,1.62,1.26,0,-.12,metal,.06);
 box(rig,2.39,2.50,.10,0,0,-.88,deep,.035);
 box(rig,2.25,.045,1.26,0,-.68,-.1,edge,.012);
 box(rig,.045,2.43,.06,-1.13,0,.72,edge,.015);box(rig,.045,2.43,.06,1.13,0,.72,edge,.015);
 box(rig,2.30,.045,.06,0,1.20,.72,edge,.015);box(rig,2.30,.045,.06,0,-1.20,.72,edge,.015);
 for(const x of [-1.27,1.27])for(const y of [-1.05,0,1.05])cylinder(rig,.029,.012,x,y,.708,edge);
 box(rig,2.86,.12,1.80,0,-1.49,-.08,metal,.045);
 for(const x of [-.95,.95])box(rig,.34,.13,.94,x,-1.60,-.1,deep,.03);
 const hinge=new THREE.Group();hinge.position.set(-1.16,0,.74);rig.add(hinge);
 box(hinge,2.30,2.43,.19,1.15,0,.015,metal,.075);
 box(hinge,2.18,2.31,.026,1.15,0,.125,edge,.045);
 box(hinge,2.15,2.28,.03,1.15,0,.146,metal,.045);
 box(hinge,2.18,2.26,.055,1.15,0,-.11,deep,.045);
 for(const y of [-.81,.81]){cylinder(rig,.09,.40,-1.22,y,.76,edge,'y');cylinder(rig,.098,.26,-1.22,y,.76,metal,'y');}
 // Radial handle and retractable locking bolts move with the actual door.
 const wheel=new THREE.Group();wheel.position.set(1.15,-.05,.30);hinge.add(wheel);
 cylinder(wheel,.17,.13,0,0,0,edge);
 for(let i=0;i<3;i++){
  const spoke=box(wheel,.07,.47,.08,0,.27,.01,edge,.025);spoke.rotation.z=i*Math.PI*2/3;spoke.position.set(-Math.sin(spoke.rotation.z)*.27,Math.cos(spoke.rotation.z)*.27,.01);
 }
 cylinder(wheel,.10,.14,0,0,.065,metal);
 const boltGroups=[];
 for(const y of [-.83,0,.83])boltGroups.push(box(hinge,.18,.11,.12,2.31,y,-.02,edge,.035));
 // Small Merger inlay and precise dial markings catch the studio rim light.
 const diamond=new THREE.Mesh(new THREE.OctahedronGeometry(.11,0),gold);diamond.scale.set(.6,1.25,.14);diamond.position.set(1.15,.73,.18);hinge.add(diamond);
 for(let i=0;i<32;i++){
  const a=i/32*Math.PI*2,m=box(hinge,.012,i%4===0?.055:.025,.01,1.15+Math.sin(a)*.30,-.05+Math.cos(a)*.30,.176,edge,.002);m.rotation.z=-a;
 }
 // One payment folio follows the same path into, and back out of, the vault.
 const payment=new THREE.Group();rig.add(payment);
 const paymentMaterial=new THREE.MeshPhysicalMaterial({color:'#806c42',metalness:.82,roughness:.27,clearcoat:.3});
 box(payment,1.12,.65,.045,0,0,0,paymentMaterial,.06);
 const label=document.createElement('canvas');label.width=896;label.height=520;const c=label.getContext('2d');
 c.fillStyle='#171711';c.fillRect(0,0,896,520);c.strokeStyle='#9f8c60';c.lineWidth=3;c.strokeRect(20,20,856,480);
 c.fillStyle='#c9b991';c.font='500 34px Inter, sans-serif';c.fillText('PAYMENT / USD',66,112);
 c.fillStyle='#f2e8ce';c.font='500 108px Inter, sans-serif';c.fillText('$250,000',60,284);
 c.fillStyle='#a99d7e';c.font='400 28px Inter, sans-serif';c.fillText('ILLUSTRATIVE TRANSACTION',66,426);
 const texture=new THREE.CanvasTexture(label);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const face=new THREE.Mesh(new THREE.PlaneGeometry(1.08,.61),new THREE.MeshStandardMaterial({map:texture,roughness:.4,metalness:.3,emissive:'#c5ac73',emissiveIntensity:.15}));face.position.z=.027;payment.add(face);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.35}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.68;floor.receiveShadow=true;scene.add(floor);
 let last={reveal:1,open:0,wheel:1,payment:1,amount:0,light:1},disposed=false,viewDistance=1;
 function update(state){
  if(disposed)return;last={...state};const {reveal,open,wheel:turn,payment:travel,amount,light}=state;
  rig.rotation.y=-.14;rig.position.y=-.05;
  const framing=viewDistance*(1+clamp(open)*(camera.aspect<1.6?.32:.12));
  camera.position.set(3.10*framing,1.85*framing,7.45*framing);camera.lookAt(-.08-clamp(open)*.55,-.05,.15);
  hinge.rotation.y=-clamp(open)*Math.PI*.58;wheel.rotation.z=turn*Math.PI*.68;
  boltGroups.forEach(b=>b.position.x=2.25+.13*turn);
  if(travel<=1){payment.position.set(mix(-2.65,0,clamp(travel)),mix(.10,-.12,clamp(travel)),mix(1.65,-.22,clamp(travel)));}
  else{payment.position.set(mix(0,2.7,clamp(travel-1)),mix(-.12,.04,clamp(travel-1)),mix(-.22,1.2,clamp(travel-1)));}
  payment.rotation.y=mix(.1,-.20,clamp(travel*.5));payment.scale.setScalar(.92);payment.visible=amount>.01;
  paymentMaterial.transparent=true;paymentMaterial.opacity=amount;face.material.transparent=true;face.material.opacity=amount;
  interiorLight.intensity=light*2.2;renderer.toneMappingExposure=mix(.30,1.15,reveal);
  host.dataset.open=open.toFixed(3);host.dataset.payment=travel.toFixed(3);host.dataset.locked=String(turn>.98&&open<.01);
  if(!document.hidden)renderer.render(scene,camera);
 }
 function resize(){
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h);camera.aspect=w/h;
  viewDistance=Math.max(1,1.35/camera.aspect);
  camera.updateProjectionMatrix();update(last);
 }
 const observer=new ResizeObserver(resize);observer.observe(host);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dataset.ready='false';});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{resize();host.dataset.ready='true';});
 resize();host.dataset.ready='true';
 return {update,poster(){update(last);return renderer.domElement.toDataURL('image/png');},dispose(){
  disposed=true;observer.disconnect();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose();grainTexture.dispose();env.dispose();renderer.dispose();renderer.domElement.remove();
 }};
}
