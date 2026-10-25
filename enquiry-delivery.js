/* Save to the private admin inbox first; email is an additional notification. */
(() => {
  window.deliverEnquiry=async (record,email) => {
    await window.Antara.request('/rest/v1/rpc/submit_website_enquiry',{method:'POST',body:record});
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch('https://formsubmit.co/ajax/antaraproperties1@gmail.com',{
        method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({...email,_template:'table',_captcha:'false'}),signal:controller.signal
      });
      const data=await response.json();
      return {saved:true,emailSent:response.ok&&(data.success===true||data.success==='true')};
    }catch{return {saved:true,emailSent:false};}
    finally{clearTimeout(timer);}
  };
})();
