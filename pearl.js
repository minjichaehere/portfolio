import { createOrbits } from './globe-orbits.js';
import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const host=document.querySelector('.pearl-art');
const hero=document.querySelector('.hero');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,orbits;
try {
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();
 const camera=new THREE.OrthographicCamera(-4,4,2.8,-2.8,.1,30);
 camera.position.set(0,0,10);
 const environment=new RoomEnvironment();
 function panel(color,x,y,z,w,h){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);environment.add(m)}
 panel(0xd9dcf7,-4,2,2,3,6);panel(0xc4ddeb,4,1,0,2,5);panel(0xe9d7e7,0,5,-2,4,2);
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(environment,.05).texture;environment.dispose();pmrem.dispose();
 const group=new THREE.Group();scene.add(group);
 const loader=new THREE.TextureLoader();
 const [map,bump]=await Promise.all([loader.loadAsync('./assets/earth-pearl.png'),loader.loadAsync('./assets/earth-relief.png')]);
 map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const pearl=new THREE.MeshPhysicalMaterial({color:0xf1f0fa,metalness:.52,roughness:.2,iridescence:.38,iridescenceIOR:1.3,iridescenceThicknessRange:[170,310],clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.15});
 const earthMaterial=pearl.clone();earthMaterial.map=map;earthMaterial.bumpMap=bump;earthMaterial.bumpScale=.025;earthMaterial.roughness=.27;earthMaterial.clearcoat=.65;
 const earth=new THREE.Mesh(new THREE.SphereGeometry(1.07,96,64),earthMaterial);
 // Fixed orthographic viewpoint centred at 10° E, 50° N: Europe stays visible.
 earth.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),THREE.MathUtils.degToRad(50));
 earth.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.PI/2-THREE.MathUtils.degToRad(10)));
 group.add(earth);
 orbits=createOrbits(host);
 const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-3,4,6);scene.add(key);
 const fill=new THREE.DirectionalLight(0xdcdff8,1);fill.position.set(3,-1,4);scene.add(fill);
 let paused=preference.matches,visible=true,time=0,last=0,frame=0;
 function update(){
  // Original six-second ease-in/out float: 0 → 8 CSS px upward → 0.
  const lift=preference.matches?0:4*(1-Math.cos(time*Math.PI*2/6));
  earth.position.y=lift*(camera.top-camera.bottom)/Math.max(host.clientHeight,1)/group.scale.y;
  orbits.update(time);
 }
 const render=()=>renderer.render(scene,camera);
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const mobile=matchMedia('(max-width:1000px)').matches,height=mobile?3.8:5.6,width=height*w/h;
  camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();
  group.position.set(mobile?0:width*.21,mobile?0:.68,0);group.scale.setScalar(mobile?Math.min(.96,width/4.45):1.08);
  renderer.setSize(w,h,false);group.updateMatrixWorld(true);camera.updateMatrixWorld(true);const center=group.position.clone().project(camera);const size=4.28*group.scale.x*h/height;orbits.resize((center.x+1)*w/2,(1-center.y)*h/2,size);update();render();
 }
 function tick(now){frame=0;if(paused||!visible||document.hidden)return;time+=Math.min((now-last)/1000,.05);last=now;update();render();frame=requestAnimationFrame(tick)}
 function schedule(){if(frame)cancelAnimationFrame(frame);frame=0;if(!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick)}else render()}
 window.mjGlobe={pause(){paused=true;schedule()},play(){paused=false;schedule()},toggle(){paused=!paused;schedule();return paused}};
 preference.addEventListener('change',e=>{paused=e.matches;update();schedule()});
 document.addEventListener('visibilitychange',schedule);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:.05}).observe(hero);
 new ResizeObserver(resize).observe(host);
 renderer.domElement.classList.add('globe-renderer');renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);resize();host.classList.add('webgl-ready');schedule();
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;cancelAnimationFrame(frame);host.classList.remove('webgl-ready');orbits.dispose();});
} catch(error){orbits?.dispose();renderer?.dispose();host.classList.remove('webgl-ready')}
