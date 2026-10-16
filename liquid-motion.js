(()=>{
 const video=document.querySelector('.liquid-video'),canvas=document.querySelector('.liquid-canvas'),art=document.querySelector('.liquid-motion'),hero=document.querySelector('.hero'),button=document.querySelector('.liquid-toggle');
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),english=document.documentElement.lang==='en';
 let paused=reduced.matches,visible=true,frame=0,lastPaint=0;
 video.muted=true;
 // Remove the neutral dark studio backdrop while retaining the coloured glass.
 function paint(){if(video.readyState<2)return;ctx.drawImage(video,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
  for(let i=0;i<d.length;i+=4){const peak=Math.max(d[i],d[i+1],d[i+2]);const t=Math.max(0,Math.min(1,(peak-43)/60));d[i+3]=Math.round(255*t*t*(3-2*t));}
  ctx.putImageData(pixels,0,0);
 }
 function tick(now){frame=0;if(paused||!visible||document.hidden)return;if(now-lastPaint>=40){paint();lastPaint=now}frame=requestAnimationFrame(tick)}
 function label(){button.textContent=english?(paused?'Play motion':'Pause motion'):(paused?'모션 재생':'모션 정지');button.setAttribute('aria-pressed',String(paused));}
 function sync(){cancelAnimationFrame(frame);frame=0;if(paused||!visible||document.hidden){video.pause();paint();return}video.play().then(()=>{if(!frame&&!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}).catch(()=>{paused=true;label();paint()})}
 video.addEventListener('loadeddata',()=>{paint();sync()});video.addEventListener('seeked',paint);
 button.addEventListener('click',()=>{paused=!paused;label();sync()});
 reduced.addEventListener('change',e=>{paused=e.matches;art.style.transform='translateX(-50%)';label();sync()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.05}).observe(hero);
 document.addEventListener('visibilitychange',sync);
 hero.addEventListener('pointermove',e=>{if(paused||reduced.matches||e.pointerType==='touch')return;const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;art.style.transform=`translateX(-50%) perspective(900px) rotateY(${x*6}deg) rotateX(${-y*4}deg) translate(${x*8}px,${y*6}px)`});
 hero.addEventListener('pointerleave',()=>{art.style.transform='translateX(-50%)'});
 label();sync();
})();
