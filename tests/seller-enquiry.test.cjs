const {test}=require('node:test');
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(deliver){
 let handler,reset=false;const calls=[];
 const values={owner_name:'Seller Test',owner_phone:'9876543210',category:'Plot',city:'',contact_preference:'Phone Call'};
 const form={addEventListener:(event,fn)=>handler=fn,reportValidity:()=>true,reset:()=>reset=true};
 const status={style:{},textContent:''},button={};let id=0;
 vm.runInNewContext(fs.readFileSync('seller-enquiry.js','utf8'),{
 document:{getElementById:key=>({sellPropertyForm:form,sellStatus:status,sellSubmit:button})[key]},
 FormData:class{get(key){return values[key]}},crypto:{randomUUID:()=>`id-${++id}`},
 window:{deliverEnquiry:async(record,email)=>{calls.push({record,email});return deliver()}}
 });
 return {send:()=>handler({preventDefault(){}}),calls,status,button,values,didReset:()=>reset};
}
test('seller sends no photos and defaults empty city to Amravati',async()=>{
 const h=setup(()=>({saved:true,emailSent:true}));await h.send();assert.equal(h.calls[0].record.enquiry_kind,'seller');assert.equal(h.calls[0].record.visitor_city,'Amravati');assert.equal('photos' in h.calls[0].record,false);assert.equal(h.didReset(),true);
});
test('failed save keeps fields and retry uses same request id',async()=>{
 const h=setup(()=>{throw Error('offline')});await h.send();await h.send();assert.equal(h.didReset(),false);assert.equal(h.calls[0].record.request_id,h.calls[1].record.request_id);assert.equal(h.button.disabled,false);
});
test('changed details after failure get a new request id',async()=>{
 const h=setup(()=>{throw Error('offline')});await h.send();h.values.city='Nagpur';await h.send();assert.notEqual(h.calls[0].record.request_id,h.calls[1].record.request_id);
});
