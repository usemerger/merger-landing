import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fragmentTransform,inspectionScale } from './singularity-motion.mjs';
import { diskVertex,diskFragment,horizonVertex,horizonFragment } from './singularity-shaders.js';

// Original Merger shards, materials, motion function, and singularity shaders.
// Render on scroll/resize only. Nothing runs continuously while the reader pauses.
export async function createScrollSingularity(host) {
 const scene=new THREE.Scene();
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.setClearColor(0,0);host.append(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(36,1,.1,40);camera.position.set(0,0,11);
 const lightStage=new THREE.Scene();lightStage.background=new THREE.Color('#111217');
 [[[-4,5,3],3,8,'#ffedcf',5],[[4,1,4],1.5,7,'#bed2fa',3],[[0,-4,1],5,.8,'#e2ac59',5],[[0,1,-4],4,4,'#e4ad54',2]].forEach(([p,w,h,c,intensity])=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(intensity),side:THREE.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);lightStage.add(m);
 });
 const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(lightStage,.04);scene.environment=env.texture;pmrem.dispose();
 lightStage.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 scene.add(new THREE.AmbientLight('#fff4df',.24));
 [[[3,5,6],'#fff1d4',2.4],[[-4,1,2],'#a5b3d0',1.1],[[1,-3,-2],'#dfaa55',1.5]].forEach(([p,c,i])=>{const l=new THREE.DirectionalLight(c,i);l.position.set(...p);scene.add(l);});
 let model;
 try {model=await new GLTFLoader().loadAsync('/funnel-v3/assets/aspiration/merger-singularity.glb');}
 catch(error){env.dispose();renderer.dispose();renderer.domElement.remove();host.dataset.ready='false';throw error;}
 model.scene.updateMatrixWorld(true);
 const root=new THREE.Group();scene.add(root);const shards=[];
 model.scene.traverse(n=>{
  if(!/^shard_\d+$/.test(n.name))return;
  const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();n.matrixWorld.decompose(p,q,s);
  const content=n.clone(true);content.position.set(0,0,0);content.quaternion.identity();content.scale.set(1,1,1);
  content.traverse(o=>{if(o.isMesh){const list=Array.isArray(o.material)?o.material:[o.material];const copies=list.map(m=>{const c=m.clone();c.envMapIntensity=1.45;return c;});o.material=Array.isArray(o.material)?copies:copies[0];}});
  const g=new THREE.Group();g.position.copy(p);g.quaternion.copy(q);g.scale.copy(s);g.add(content);root.add(g);shards.push({g,base:p.toArray(),q});
 });
 const core=new THREE.Group();core.position.y=-.255;root.add(core);
 const uniforms=()=>({uTime:{value:0},uEnergy:{value:0},uPulse:{value:0},uFine:{value:0}});
 const disks=[];
 [[.58,.2,0],[1.8,-.55,0]].forEach((rotation,i)=>{
  const u=uniforms();u.uFine.value=i;const m=new THREE.Mesh(new THREE.RingGeometry(.158,.55,80),new THREE.ShaderMaterial({uniforms:u,vertexShader:diskVertex,fragmentShader:diskFragment,side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));m.rotation.set(...rotation);core.add(m);disks.push(m);
 });
 const horizon=new THREE.Mesh(new THREE.SphereGeometry(.155,32,24),new THREE.ShaderMaterial({uniforms:uniforms(),vertexShader:horizonVertex,fragmentShader:horizonFragment,toneMapped:false}));core.add(horizon);
 const coreLight=new THREE.PointLight('#efba60',3.5,4,2);core.add(coreLight);
 const linePositions=new Float32Array(shards.length*6),lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.BufferAttribute(linePositions,3));
 const lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:'#edc776',transparent:true,opacity:0,blending:THREE.AdditiveBlending}));root.add(lines);
 let amount=0,clock=0,orientation=null,disposed=false;
 function draw(){if(disposed||document.hidden)return;renderer.render(scene,camera);}
 function update(a,t,pose=null){
  amount=a;clock=t;orientation=pose;
  // A scene may choreograph a full forward turn independently of the core clock.
  // Other callers retain their original rotation and tilt.
  root.rotation.y=pose?.y??(-.12+a*.38+t*.045);
  root.rotation.z=pose?.z??(-.05+a*.06+Math.sin(t*.12)*.05);
  root.scale.setScalar(inspectionScale(a,camera.aspect));
  shards.forEach(({g,base,q},i)=>{const next=fragmentTransform(i,base,a,t);g.position.set(...next.position);g.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...next.rotation)));linePositions.set([0,-.255,0,...next.position],i*6);});
  lineGeometry.attributes.position.needsUpdate=true;lines.material.opacity=a*.33;core.scale.setScalar(.2+a*1.4);
  [...disks,horizon].forEach(m=>{m.material.uniforms.uTime.value=t;m.material.uniforms.uEnergy.value=a;});disks[0].rotation.z=t*.075;disks[1].rotation.z=-t*.1;draw();
 }
 const resize=new ResizeObserver(()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.position.z=11*Math.max(1,.8/camera.aspect);camera.updateProjectionMatrix();update(amount,clock,orientation);});resize.observe(host);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dataset.ready='false';});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{update(amount,clock,orientation);host.dataset.ready='true';});
 host.dataset.ready='true';update(0,0);
 return {update,dispose(){disposed=true;resize.disconnect();scene.traverse(o=>{o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose());});env.dispose();renderer.dispose();renderer.domElement.remove();host.dataset.ready='false';}};
}
