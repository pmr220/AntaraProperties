(() => {
  const menu=document.getElementById('ap-menu'),open=document.querySelector('.ap-menu-button'),close=document.querySelector('.ap-menu-close');
  open.addEventListener('click',()=>{menu.showModal();open.setAttribute('aria-expanded','true');document.body.classList.add('ap-menu-open');});
  close.addEventListener('click',()=>menu.close());
  menu.addEventListener('close',()=>{open.setAttribute('aria-expanded','false');document.body.classList.remove('ap-menu-open');open.focus();});
  const current=location.pathname.split('/').pop()||'index.html';
  menu.querySelectorAll('nav a').forEach(link=>{if(link.getAttribute('href')===current)link.setAttribute('aria-current','page');});
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  // Associate retained form labels without changing any field names or handlers.
  document.querySelectorAll('.field').forEach((field,i)=>{const label=field.querySelector('label'),input=field.querySelector('input,select,textarea');if(label&&input){if(!input.id)input.id='ap-field-'+i;label.htmlFor=input.id;}});
})();
