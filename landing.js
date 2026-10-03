(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,frame=0;
  const hero=document.getElementById('hero'),scene=document.getElementById('scene'),toggle=document.getElementById('motionToggle');
  const update=()=>{frame=0;if(paused)return;const r=hero.getBoundingClientRect();scene.style.setProperty('--scroll',Math.min(1,Math.max(0,-r.top/r.height)));document.querySelectorAll('.collection,.perspective').forEach(el=>{const b=el.getBoundingClientRect();el.style.setProperty('--travel',Math.max(0,Math.min(1,(innerHeight-b.top)/(innerHeight+b.height))));});};
  const schedule=()=>{if(!frame&&!paused)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',schedule,{passive:true});
  const reset=()=>{scene.style.setProperty('--rx','0deg');scene.style.setProperty('--ry','0deg');scene.style.setProperty('--scroll','0');};
  document.querySelector('.hero-art').addEventListener('pointermove',e=>{if(paused||e.pointerType!=='mouse')return;const r=e.currentTarget.getBoundingClientRect();scene.style.setProperty('--rx',((e.clientX-r.left)/r.width-.5)*10+'deg');scene.style.setProperty('--ry',((e.clientY-r.top)/r.height-.5)*5+'deg');});
  document.querySelector('.hero-art').addEventListener('pointerleave',reset);
  function state(){toggle.textContent=paused?'Enable motion ↗':'Pause motion Ⅱ';toggle.setAttribute('aria-pressed',String(paused));if(paused)reset();else schedule();}
  toggle.addEventListener('click',()=>{paused=!paused;state();});reduced.addEventListener('change',()=>{paused=reduced.matches;state();});state();
  document.getElementById('quickSearch').addEventListener('submit',e=>{e.preventDefault();location.href='properties.html#'+encodeURIComponent(document.getElementById('category').value);});
  document.querySelectorAll('[data-whatsapp]').forEach(a=>{a.href='https://wa.me/'+window.RE_CONFIG.whatsapp+'?text='+encodeURIComponent('Hello Antara Properties, I would like to discuss a property in Amravati.');a.target='_blank';a.rel='noopener';});
  document.getElementById('year').textContent=new Date().getFullYear();
})();
