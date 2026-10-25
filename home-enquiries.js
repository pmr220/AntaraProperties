(() => {
  const dialog=document.getElementById('homeEnquiry');
  const form=document.getElementById('homeEnquiryForm');
  const title=document.getElementById('homeEnquiryTitle');
  const categoryField=document.getElementById('homeCategoryField');
  const status=document.getElementById('homeEnquiryStatus');
  const close=document.getElementById('homeEnquiryClose');
  const submit=form.querySelector('button[type="submit"]');
  let kind='project',trigger=null,sending=false,requestId=null,requestKey=null;
  document.querySelectorAll('[data-home-enquiry]').forEach(button=>button.addEventListener('click',()=>{
    if(sending)return;
    kind=button.dataset.homeEnquiry;trigger=button;
    title.textContent=kind==='project'?'Enquire about Rangoli Heights':'Find your perfect property';
    categoryField.hidden=kind==='project';
    form.elements.category.disabled=kind==='project';
    form.elements.category.required=kind!=='project';
    status.textContent='';dialog.showModal();document.body.classList.add('home-enquiry-open');
  }));
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('cancel',event=>{if(sending)event.preventDefault();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('home-enquiry-open');trigger?.focus();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(sending||!form.reportValidity())return;
    const name=form.elements.name.value.trim();
    const phone=form.elements.phone.value.replace(/\D/g,'').replace(/^91(?=\d{10}$)/,'');
    if(name.length<2||!/^[6-9]\d{9}$/.test(phone)){status.textContent='Please enter your name and a valid 10-digit Indian mobile number.';return;}
    const project=kind==='project';
    const payload={name,phone,property_type:project?'Rangoli Heights — 2 BHK':form.elements.category.value,
      source:project?'Homepage — Rangoli Heights':'Homepage — Buy or invest',
      _subject:project?'Antara Properties: Rangoli Heights enquiry':'Antara Properties: property enquiry',
      _template:'table',_captcha:'false'};
    sending=true;submit.disabled=true;close.disabled=true;submit.textContent='Sending…';status.textContent='';
    const key=JSON.stringify([kind,name,phone,payload.property_type]);
    if(key!==requestKey){requestId=crypto.randomUUID();requestKey=key;}
    try{
      const result=await window.deliverEnquiry({request_id:requestId,visitor_name:name,visitor_phone:phone,
        enquiry_kind:kind,property_category:project?'Flat':form.elements.category.value},payload);
      form.reset();requestId=null;requestKey=null;
      status.textContent=result.emailSent?'Thank you. Your enquiry has been received. Antara Properties will contact you shortly.':'Thank you. Your enquiry is saved with Antara Properties. The email notification could not be confirmed, but your details have been received.';
    }catch{
      status.textContent='We could not confirm your enquiry was saved. Please try again, or email antaraproperties1@gmail.com.';
    }finally{
      sending=false;submit.disabled=false;close.disabled=false;submit.textContent='Send enquiry ↗';
    }
  });
})();
