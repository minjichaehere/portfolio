const NS='http://www.w3.org/2000/svg';
const colors=['#FFD3F3','#CFF5FF','#FFFFFF'];
const tilt=-20*Math.PI/180;
export const orbitPoint=a=>{const x=232*Math.cos(a),y=82*Math.sin(a);return [300+x*Math.cos(tilt)-y*Math.sin(tilt),300+x*Math.sin(tilt)+y*Math.cos(tilt)]};
export function createOrbits(host){
 const layers=['back','front'].map((side,index)=>{
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 600 600');svg.setAttribute('aria-hidden','true');svg.classList.add('globe-orbit-layer',side);
  const id='mj-'+side;
  svg.innerHTML=`<defs>
   <linearGradient id="${id}-line"><stop stop-color="#fff"/><stop offset=".3" stop-color="#C7B5FF"/><stop offset=".55" stop-color="#F0C4F2"/><stop offset=".8" stop-color="#B9CBFF"/><stop offset="1" stop-color="#fff"/></linearGradient>
   <radialGradient id="${id}-glow"><stop stop-color="#F6D2FF" stop-opacity=".95"/><stop offset=".3" stop-color="#C86BFF" stop-opacity=".5"/><stop offset=".65" stop-color="#9A4DFF" stop-opacity=".15"/><stop offset="1" stop-color="#9A4DFF" stop-opacity="0"/></radialGradient>
   <linearGradient id="${id}-ray"><stop stop-color="#E9A6FF" stop-opacity="0"/><stop offset=".42" stop-color="#F3D6FF" stop-opacity=".9"/><stop offset=".5" stop-color="#fff"/><stop offset=".58" stop-color="#F3D6FF" stop-opacity=".9"/><stop offset="1" stop-color="#E9A6FF" stop-opacity="0"/></linearGradient>
   <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
   <filter id="${id}-trail"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
   ${colors.map((c,k)=>`<linearGradient id="${id}-tail${k}" gradientUnits="userSpaceOnUse"><stop stop-color="${c}"/><stop offset=".35" stop-color="${c}" stop-opacity=".6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`).join('')}
  </defs>
  ${[-20,38].map((rotation,k)=>`<g transform="rotate(${rotation} 300 300)" opacity="${k?.38:.8}"><path d="M68 300 A232 82 0 0 ${index?0:1} 532 300" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="#C9B6FF" stroke-width="6" opacity=".2" filter="url(#${id}-soft)"/><path d="M68 300 A232 82 0 0 ${index?0:1} 532 300" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="url(#${id}-line)" stroke-width="${k?1.2:1.6}"/></g>`).join('')}
  <g class="orbit-tail" filter="url(#${id}-trail)" opacity="${index?1:.6}">${colors.map((c,k)=>`<path fill="url(#${id}-tail${k})"/>`).join('')}</g>
  <g class="orbit-star"><circle r="38" fill="url(#${id}-glow)"/><ellipse rx="64" ry="1.7" fill="url(#${id}-ray)"/><ellipse rx="48" ry="1.7" transform="rotate(90)" fill="url(#${id}-ray)"/><circle r="9" fill="#fff" opacity=".8" filter="url(#${id}-soft)"/><path d="M0 -15Q2 -2 15 0Q2 2 0 15Q-2 2 -15 0Q-2 -2 0 -15Z" fill="#fff"/></g>
  ${index?[[500,120,.34,0],[100,140,.24,1.1],[480,500,.22,2.2]].map(([x,y,size,phase])=>`<g class="ambient-spark" data-x="${x}" data-y="${y}" data-size="${size}" data-phase="${phase}" transform="translate(${x} ${y}) scale(${size})"><path d="M0 -25Q3.2 -3.2 25 0Q3.2 3.2 0 25Q-3.2 3.2 -25 0Q-3.2 -3.2 0 -25Z" fill="#F9F4FF" stroke="#CBBCE6" stroke-width="1.6"/></g>`).join(''):''}`;
  host.appendChild(svg);return {svg,star:svg.querySelector('.orbit-star'),paths:[...svg.querySelectorAll('.orbit-tail path')],gradients:colors.map((c,k)=>svg.querySelector('#'+id+'-tail'+k))};
 });
 function ribbon(points,start,end,k){if(end-start<1)return '';const l=[],r=[];for(let i=start;i<=end;i++){const p=points[i],offset=[-p.spread,p.spread,0][k],half=p.width*(k===2?.225:.5);l.push(`${(p.x+p.nx*(offset+half)).toFixed(2)} ${(p.y+p.ny*(offset+half)).toFixed(2)}`);r.push(`${(p.x+p.nx*(offset-half)).toFixed(2)} ${(p.y+p.ny*(offset-half)).toFixed(2)}`)}return'M'+l.join('L')+'L'+r.reverse().join('L')+'Z'}
 return {
  update(seconds){
   layers[1].svg.querySelectorAll('.ambient-spark').forEach(star=>{
    const phase=Number(star.dataset.phase),x=Number(star.dataset.x),y=Number(star.dataset.y),size=Number(star.dataset.size);
    const shimmer=(1-Math.cos((seconds+phase)*Math.PI*2/3.2))/2;
    const lift=4*(1-Math.cos((seconds+phase)*Math.PI*2/6));
    star.setAttribute('transform',`translate(${x} ${y-lift}) scale(${size*(.55+.45*shimmer)})`);
    star.setAttribute('opacity',(.4+.6*shimmer).toFixed(3));
   });
   const a=Math.PI-seconds/13*Math.PI*2,p=orbitPoint(a),front=Math.sin(a)>=0,scale=.6+.5*(Math.sin(a)+1)/2,points=[];
   for(let i=0;i<=48;i++){const ai=a+.924*i/48,q=orbitPoint(ai),b=orbitPoint(ai-.01),c=orbitPoint(ai+.01),dx=c[0]-b[0],dy=c[1]-b[1],len=Math.hypot(dx,dy),fade=1-i/48,sc=.6+.5*(Math.sin(ai)+1)/2;points.push({x:q[0],y:q[1],nx:-dy/len,ny:dx/len,front:Math.sin(ai)>=0,width:(.5+6.5*Math.pow(fade,1.6))*sc,spread:(.6+1.6*fade)*sc})}
   let split=49;for(let i=1;i<=48;i++)if(points[i].front!==points[0].front){split=i;break}
   layers.forEach((l,index)=>{l.star.setAttribute('transform',`translate(${p[0]} ${p[1]}) scale(${scale})`);l.star.setAttribute('opacity',Boolean(index)===front?'1':'0');l.gradients.forEach(g=>{g.setAttribute('x1',p[0]);g.setAttribute('y1',p[1]);g.setAttribute('x2',points[48].x);g.setAttribute('y2',points[48].y)});l.paths.forEach((path,k)=>{const head=ribbon(points,0,Math.min(split,48),k),rest=split<=48?ribbon(points,split-1,48,k):'';path.setAttribute('d',Boolean(index)===front?head:rest)})});
  },
  resize(x,y,size){layers.forEach(l=>Object.assign(l.svg.style,{left:`${x-size/2}px`,top:`${y-size/2}px`,width:`${size}px`,height:`${size}px`}))},
  dispose(){layers.forEach(l=>l.svg.remove())}
 };
}
