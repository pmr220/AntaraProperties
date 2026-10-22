const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(request){
  let submit;
  const status={textContent:''},button={disabled:false,textContent:''};
  const form={elements:{name:{value:'Asha Test'},phone:{value:'+91 98765 43210'}},
    reportValidity:()=>true,querySelector:()=>button,
    addEventListener:(_,fn)=>submit=fn,reset(){this.elements.name.value='';this.elements.phone.value='';}};
  vm.runInNewContext(fs.readFileSync('builder-project.js','utf8'),{
    document:{getElementById:id=>id==='projectEnquiry'?form:status},window:{Antara:{request}}
  });
  return {form,status,button,submit:()=>submit({preventDefault(){}})};
}
test('callback submits only name and normalized mobile; success clears form',async()=>{
  const calls=[];const h=setup(async(...args)=>calls.push(args));await h.submit();
  assert.equal(calls[0][0],'/rest/v1/rpc/submit_rangoli_enquiry');
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0][1])),{method:'POST',body:{visitor_name:'Asha Test',visitor_phone:'9876543210'}});
  assert.match(h.status.textContent,/has been received/);assert.equal(h.form.elements.name.value,'');
});
test('failed submission retains entered details and allows retry',async()=>{
  const h=setup(async()=>{throw new Error('offline');});await h.submit();
  assert.equal(h.form.elements.name.value,'Asha Test');assert.match(h.status.textContent,/could not be sent/);assert.equal(h.button.disabled,false);
});
test('invalid mobile never calls the API',async()=>{
  let calls=0;const h=setup(async()=>calls++);h.form.elements.phone.value='123';await h.submit();assert.equal(calls,0);
});
test('rapid double submission sends a single request',async()=>{
  let finish,calls=0;const h=setup(()=>{calls++;return new Promise(resolve=>finish=resolve);});
  const pending=h.submit();await h.submit();assert.equal(calls,1);assert.equal(h.button.disabled,true);finish();await pending;assert.equal(h.button.disabled,false);
});
