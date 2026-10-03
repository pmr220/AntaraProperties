const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function harness(respond, initial=null){
  const store=new Map(initial?[['antara.auth.session',JSON.stringify(initial)]]:[]),calls=[];
  const context={window:{RE_CONFIG:{supabase:{url:'https://example.supabase.co',publishableKey:'public-test'}}},Blob,Date,JSON,Error,encodeURIComponent,
    sessionStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
    fetch:async(url,options)=>{calls.push({url,options});const [status,data]=await respond(url,options);return {ok:status>=200&&status<300,status,text:async()=>JSON.stringify(data)};}};
  vm.runInNewContext(fs.readFileSync('antara-api.js','utf8'),context);
  return {api:context.window.Antara,calls,store};
}
test('anonymous reads send only the publishable key, even if an admin session exists',async()=>{
  const h=harness(()=>[200,[]],{access_token:'private-token',expires_at:Date.now()/1000+1000});
  await h.api.table('property_listings');assert.equal(h.calls[0].options.headers.apikey,'public-test');assert.equal(h.calls[0].options.headers.Authorization,undefined);
});
test('non-admin login discards the session',async()=>{
  const h=harness(url=>url.includes('/token')?[200,{access_token:'x',expires_in:3600,refresh_token:'r'}]:[200,false]);
  await assert.rejects(h.api.login('owner@example.com','password'),/admin access/);assert.equal(h.api.hasSession(),false);
});
test('expired session refresh is shared across simultaneous authenticated reads',async()=>{
  const h=harness(url=>url.includes('/token')?[200,{access_token:'new',refresh_token:'r2',expires_in:3600}]:[200,[]],{access_token:'old',refresh_token:'r1',expires_at:0});
  await Promise.all([h.api.table('properties','',{auth:true}),h.api.table('leads','',{auth:true})]);
  assert.equal(h.calls.filter(c=>c.url.includes('/token')).length,1);
  h.calls.filter(c=>c.url.includes('/rest')).forEach(c=>assert.equal(c.options.headers.Authorization,'Bearer new'));
});
test('unauthorized authenticated response clears session',async()=>{
  const h=harness(()=>[401,{message:'Expired token'}],{access_token:'x',expires_at:Date.now()/1000+1000});
  await assert.rejects(h.api.table('properties','',{auth:true}),/Expired token/);assert.equal(h.api.hasSession(),false);
});
test('logout clears local session even if server fails',async()=>{
  const h=harness(()=>[500,{message:'Offline'}],{access_token:'x',expires_at:Date.now()/1000+1000});
  await assert.rejects(h.api.logout());assert.equal(h.api.hasSession(),false);
});
test('photo signing uses private bucket endpoint and short expiry',async()=>{
  const h=harness(()=>[200,{signedURL:'/object/sign/property-photos/a.jpg?token=x'}]);
  assert.equal(await h.api.photo('folder/a photo.jpg'),'https://example.supabase.co/storage/v1/object/sign/property-photos/a.jpg?token=x');
  assert.match(h.calls[0].url,/folder\/a%20photo.jpg$/);assert.equal(JSON.parse(h.calls[0].options.body).expiresIn,300);
});
