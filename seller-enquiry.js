(() => {
  const form=document.getElementById('sellPropertyForm'),status=document.getElementById('sellStatus');
  const button=document.getElementById('sellSubmit');
  let busy=false,requestId=null,requestKey=null;
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!form.reportValidity())return;
    const values=new FormData(form),name=String(values.get('owner_name')||'').trim();
    const phone=String(values.get('owner_phone')||'').replace(/\D/g,'').replace(/^91(?=\d{10}$)/,'');
    status.style.display='block';
    if(name.length<2||!/^[6-9]\d{9}$/.test(phone)){status.textContent='Please enter your name and a valid 10-digit Indian mobile number.';return;}
    const category=values.get('category')||'Plot',city=String(values.get('city')||'').trim()||'Amravati';
    const preference=values.get('contact_preference')||'Phone Call';
    const key=JSON.stringify([name,phone,category,city,preference]);
    if(key!==requestKey){requestId=crypto.randomUUID();requestKey=key;}
    busy=true;button.disabled=true;button.textContent='Sending…';status.textContent='';
    try{
      const result=await window.deliverEnquiry({request_id:requestId,visitor_name:name,visitor_phone:phone,
        enquiry_kind:'seller',property_category:category,visitor_city:city,contact_preference:preference},
        {name,phone,property_type:category,city,preferred_contact:preference,source:'Sell Your Property',
         _subject:'Antara Properties: seller enquiry'});
      form.reset();requestId=null;requestKey=null;
      status.textContent=result.emailSent?'Thank you. Your property enquiry has been received. We will contact you shortly.':'Thank you. Your property enquiry is saved with Antara Properties. The email notification could not be confirmed, but your details have been received.';
    }catch{status.textContent='We could not confirm your enquiry was saved. Please try again. Your details are still here.';}
    finally{busy=false;button.disabled=false;button.textContent='Submit for Review ↗';}
  });
})();
