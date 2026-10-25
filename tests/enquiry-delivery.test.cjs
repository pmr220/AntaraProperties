const {test}=require('node:test');
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(save,mail){
 const events=[];
 const context={window:{Antara:{request:async(path,options)=>{events.push(['save',path,options]);return save();}}},fetch:async()=>{events.push(['email']);return mail();},AbortController,setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync('enquiry-delivery.js','utf8'),context);
 return {deliver:context.window.deliverEnquiry,events};
}
test('saves admin record before email notification',async()=>{
 const h=setup(()=>null,()=>({ok:true,json:async()=>({success:true})}));const r=await h.deliver({request_id:'id'},{});
 assert.deepEqual(h.events.map(e=>e[0]),['save','email']);assert.equal(r.saved,true);assert.equal(r.emailSent,true);
});
test('database failure prevents notification and propagates for retry',async()=>{
 const h=setup(()=>{throw Error('database unavailable')},()=>{});await assert.rejects(h.deliver({},{}),/database unavailable/);assert.equal(h.events.length,1);
});
test('email network failure preserves successful admin receipt',async()=>{
 const h=setup(()=>null,()=>{throw Error('network')});const r=await h.deliver({},{});assert.equal(r.saved,true);assert.equal(r.emailSent,false);
});
test('email rejection is not reported as delivery success',async()=>{
 const h=setup(()=>null,()=>({ok:true,json:async()=>({success:'false'})}));const r=await h.deliver({},{});assert.equal(r.emailSent,false);
});
