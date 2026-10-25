const {test}=require('node:test');
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(respond){
 const el=()=>({handlers:{},disabled:false,textContent:'',addEventListener(e,f){this.handlers[e]=f},focus(){},dataset:{}});
 const dialog=el();dialog.showModal=()=>{};dialog.close=()=>dialog.handlers.close();
 const form=el();form.elements={name:{value:'Test Person'},phone:{value:'+91 9876543210'},category:{value:'Plot'}};form.reportValidity=()=>true;form.reset=()=>{form.elements.name.value=''};
 const submit=el();form.querySelector=()=>submit;
 const nodes={homeEnquiry:dialog,homeEnquiryForm:form,homeEnquiryTitle:el(),homeCategoryField:el(),homeEnquiryStatus:el(),homeEnquiryClose:el()};
 const buttons=['project','property'].map(kind=>({...el(),dataset:{homeEnquiry:kind}}));let calls=[];
 vm.runInNewContext(fs.readFileSync('home-enquiries.js','utf8'),{document:{getElementById:id=>nodes[id],querySelectorAll:()=>buttons,body:{classList:{add(){},remove(){}}}},window:{deliverEnquiry:async(record,email)=>{calls.push({record,payload:email,url:'https://formsubmit.co/ajax/antaraproperties1@gmail.com'});const response=respond();const data=await response.json();return {saved:true,emailSent:response.ok&&(data.success===true||data.success==='true')};}},crypto:{randomUUID:()=> 'test-request-id'}});
 return {nodes,form,submit,calls,open:kind=>buttons[kind==='project'?0:1].handlers.click(),send:()=>form.handlers.submit({preventDefault(){}})};
}
test('project enquiry goes to email with project context and no category requirement',async()=>{const h=setup(()=>({ok:true,json:async()=>({success:'true'})}));h.open('project');await h.send();assert.equal(h.form.elements.category.required,false);assert.match(h.calls[0].url,/antaraproperties1@gmail.com$/);assert.equal(h.calls[0].payload.phone,'9876543210');assert.match(h.calls[0].payload.property_type,/Rangoli Heights/);assert.equal(h.form.elements.name.value,'');});
test('property enquiry includes selected category',async()=>{const h=setup(()=>({ok:true,json:async()=>({success:true})}));h.open('property');assert.equal(h.form.elements.category.required,true);await h.send();assert.equal(h.calls[0].payload.property_type,'Plot');});
test('email rejection after admin save still confirms receipt',async()=>{const h=setup(()=>({ok:true,json:async()=>({success:'false'})}));h.open('project');await h.send();assert.equal(h.form.elements.name.value,'');assert.match(h.nodes.homeEnquiryStatus.textContent,/saved with Antara/);assert.equal(h.submit.disabled,false);});
test('invalid number is not submitted',async()=>{const h=setup(()=>{});h.open('property');h.form.elements.phone.value='123';await h.send();assert.equal(h.calls.length,0);});
