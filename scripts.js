const C = window.RE_CONFIG || {};

document.addEventListener('DOMContentLoaded', () => {
  // Brand/config injection
  document.querySelectorAll('[data-brand]').forEach(el => el.textContent = C.brand || 'NOVA ESTATES');
  document.querySelectorAll('[data-email]').forEach(el => { el.textContent = C.email; el.href = `mailto:${C.email}`; });
  document.querySelectorAll('[data-phone]').forEach(el => { el.textContent = C.phone; el.href = `tel:+91${C.phone}`; });
  document.querySelectorAll('[data-wa]').forEach(el => { el.href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent('Hi, I am interested in a property. Please share available options.')}`; });
  document.querySelectorAll('[data-city]').forEach(el => el.textContent = C.city || 'Your City & Surrounding Areas');
  document.querySelectorAll('[data-project-name]').forEach(el => el.textContent = C.builderProject?.name || 'Signature Heights');

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');
  toggle?.addEventListener('click', () => panel?.classList.toggle('open'));
  panel?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => panel.classList.remove('open')));

  // Active nav
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-panel a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  // Popup lead form
  const popup = document.querySelector('#leadPopup');
  const openers = document.querySelectorAll('[data-open-popup]');
  const closeBtn = popup?.querySelector('[data-close-popup]');
  const close = () => popup?.classList.remove('show');
  const open = () => popup?.classList.add('show');
  openers.forEach(btn => btn.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  popup?.addEventListener('click', e => { if (e.target === popup) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Auto-open after a short delay once per browser session.
  if (popup && !sessionStorage.getItem('leadPopupSeen')) {
    setTimeout(() => { open(); sessionStorage.setItem('leadPopupSeen', '1'); }, 1350);
  }

  // FormSubmit AJAX capture
  const form = document.querySelector('#leadForm');
  const status = document.querySelector('#formStatus');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    const fd = new FormData(form);
    fd.append('_subject', `New Real Estate Lead — ${C.brand || 'Website'}`);
    fd.append('_captcha', 'false');
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(C.email)}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        if (status) { status.style.display = 'block'; status.textContent = 'Thanks — your details have been sent. We will contact you shortly.'; }
        form.reset();
      } else throw new Error('Submission failed');
    } catch (err) {
      if (status) { status.style.display = 'block'; status.style.color = '#f5d0cb'; status.textContent = 'The form could not send right now. Please use WhatsApp and we will respond quickly.'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    }
  });

  // Property category filters
  const filterButtons = document.querySelectorAll('.property-filter');
  const listings = document.querySelectorAll('.property-listing');
  const noResults = document.querySelector('.no-results');
  const applyFilter = (filter) => {
    let visible = 0;
    listings.forEach((card) => {
      const show = card.dataset.property === filter;
      card.hidden = !show;
      if (show) visible += 1;
      if (show && window.gsap) {
        gsap.fromTo(card, {opacity:0, y:18}, {opacity:1, y:0, duration:.45, ease:'power2.out', overwrite:true});
      }
    });
    if (noResults) noResults.hidden = visible !== 0;
  };
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      applyFilter(btn.dataset.filter);
    });
  });
  if (filterButtons.length) applyFilter(document.querySelector('.property-filter.active')?.dataset.filter || 'plots');

  // 3D card tilt with pointer-safe bounds
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateZ(0)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });


  // Pull approved seller listings into the existing property filters.
  const published = (()=>{try{return JSON.parse(localStorage.getItem('nova_published_properties')||'[]')}catch{return[]}})();
  const listingWrap=document.querySelector('.property-listing-wrap');
  if(listingWrap && published.length){
    const esc=(v='')=>String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
    published.forEach(item=>{
      const card=document.createElement('article'); card.className='property-listing reveal-scale'; card.dataset.property=item.category||'plots';
      const label={plots:'Plot',farms:'Farm',flats:'Flat','raw-houses':'House','shop-space':'Shop Space',villas:'Villa'}[item.category]||'Property';
      const img=item.photos?.[0]||'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1300&q=86';
      card.innerHTML=`<div class="listing-image"><img src="${img}" alt="${esc(item.title)}" loading="lazy"><span class="listing-badge">${label}</span></div><div class="listing-details"><div class="dynamic-tag">Verified seller submission</div><div class="listing-top"><div><div class="property-type">${label}</div><h3>${esc(item.title||'Property')}</h3></div><div class="listing-price">${esc(item.price||'Price on request')}</div></div><p class="listing-location">📍 ${esc(item.location||'Location on request')}</p><p class="listing-desc">${esc(item.description||'')}</p><div class="listing-specs"><div><small>Area</small><strong>${esc(item.area||'-')}</strong></div><div><small>Rate</small><strong>${esc(item.rate||'-')}</strong></div><div><small>Deposit</small><strong>${esc(item.deposit||'-')}</strong></div><div><small>Built-up</small><strong>${esc(item.built_up||'-')}</strong></div></div><div class="listing-actions"><button class="btn btn-primary" type="button" data-open-popup>Enquire Now</button><a class="btn btn-ghost" target="_blank" href="https://wa.me/${C.whatsapp}?text=${encodeURIComponent('Hi, I am interested in '+(item.title||'this property')+' in '+(item.location||'your listed property')+'.')}">WhatsApp</a></div></div>`;
      listingWrap.prepend(card);
    });
  }

  // GSAP progressive enhancement for high-quality reveals / parallax.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach(el => gsap.to(el, {opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 86%',once:true}}));
    gsap.utils.toArray('.reveal-left').forEach(el => gsap.to(el, {opacity:1,x:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 86%',once:true}}));
    gsap.utils.toArray('.reveal-scale').forEach(el => gsap.to(el, {opacity:1,scale:1,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 86%',once:true}}));
    gsap.utils.toArray('[data-parallax]').forEach(el => gsap.to(el, {yPercent:-10, ease:'none', scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1.2}}));
    const heroTitle = document.querySelector('.hero .title');
    if (heroTitle) gsap.from(heroTitle,{y:55,opacity:0,duration:1.15,ease:'power4.out',delay:.1});
  } else {
    document.querySelectorAll('.reveal,.reveal-left,.reveal-scale').forEach(el => {el.style.opacity=1;el.style.transform='none'});
  }
});
