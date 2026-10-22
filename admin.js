(() => {
  const api=window.Antara, $=id=>document.getElementById(id);
  const categories={plot:'Plot',farm:'Farm / Farm land',row_house:'Row house',unfinished_house:'Raw / Unfinished house',flat:'Flat',villa:'Villa',independent_house:'Independent house',commercial:'Commercial',builder_project:'Builder project',other:'Other'};
  const core=[['title','Property title'],['category','Property type',categories],['transaction_type','For',{sale:'Sale',rent:'Rent',lease:'Lease'}],['locality','Locality / area'],['city','City'],['asking_price','Total price (₹)','number'],['rate','Rate (₹)','number'],['rate_unit','Rate per',{ 'sq.ft':'sq. ft.','sq.m':'sq. m.',acre:'Acre',hectare:'Hectare',month:'Month'}],['land_area','Plot / land area','number'],['land_area_unit','Area unit',{'sq.ft':'sq. ft.','sq.m':'sq. m.',acre:'Acre',hectare:'Hectare'}],['description','Public description','textarea']];
  const extra=[['village','Village'],['address','Full address (private)'],['landmark','Landmark'],['carpet_area','Carpet area','number'],['carpet_area_unit','Carpet area unit'],['built_up_area','Built-up area','number'],['built_up_area_unit','Built-up area unit'],['deposit','Deposit (₹)','number'],['map_url','Map link','url']];
  const detailNames=['dimensions','dimensions_unit','road_width','road_width_unit','frontage','facing','access_road','water_source','electricity','land_use','survey_number','ownership_type','title_notes','bedrooms','bathrooms','balconies','floor_number','total_floors','parking_spaces','furnishing','property_age','construction_stage','builder_name','project_name','unit_types','possession_date','registration_number'];
  detailNames.forEach(name=>extra.push(['detail_'+name,name.replaceAll('_',' ')]));
  const privateFields=[['owner_name','Owner name'],['owner_phone','Owner phone','tel'],['owner_email','Owner email','email'],['owner_expected_price','Owner expected price (₹)','number'],['commission_notes','Commission notes','textarea'],['internal_notes','Internal notes','textarea']];
  let current=null, photos=[], records=[], busy=false, dirty=false;
  function field([name,label,type]) {
    const wrap=document.createElement('label');wrap.textContent=label;
    const input=document.createElement(typeof type==='object'?'select':type==='textarea'?'textarea':'input');
    input.name=name;
    if(typeof type==='object') {input.add(new Option('Select (optional)',''));Object.entries(type).forEach(([value,text])=>input.add(new Option(text,value)));}
    else if(type && type!=='textarea') {input.type=type;if(type==='number'){input.min='0';input.step='any';}}
    if(input.tagName!=='SELECT') input.maxLength=type==='textarea'?5000:500;
    wrap.append(input);return wrap;
  }
  core.forEach(f=>$('coreFields').append(field(f)));extra.forEach(f=>$('extraFields').append(field(f)));privateFields.forEach(f=>$('privateFields').append(field(f)));
  function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error);}
  async function task(fn){if(busy)return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn();}catch(e){message(e.message,true);}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
  function show(tab){['inventory','editor','enquiries'].forEach(t=>$(t).hidden=t!==tab);document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.tab===tab));}
  function leave(){return !dirty || window.confirm('Leave without saving your changes?');}
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  $('propertyForm').addEventListener('input',()=>dirty=true);
  function clearEditor(record=null){current=record;photos=[];$('propertyForm').reset();$('photoPreview').replaceChildren();$('editorTitle').textContent=record?'Edit property':'Add a property';const form=$('propertyForm');for(const el of form.elements){if(el.name && el.name!=='action'){el.value=el.name.startsWith('detail_')?(record?.details?.[el.name.slice(7)]??''):(record?.[el.name]??'');}}if(!record){form.elements.city.value='Amravati';form.elements.transaction_type.value='sale';}dirty=false;}
  function line(parent,text,tag='p'){const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;}
  function button(parent,text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>task(fn));parent.append(b);return b;}
  async function loadInventory(){records=await api.table('properties','?select=*&order=created_at.desc',{auth:true});$('count').textContent='('+records.length+')';$('propertyList').replaceChildren();if(!records.length)line($('propertyList'),'No properties yet. Choose Add Property to start.');for(const p of records){const card=document.createElement('article');card.className='record';line(card,p.status,'span').className='badge';line(card,p.title||'Untitled draft','h3');line(card,[p.reference,categories[p.category],p.locality].filter(Boolean).join(' · '));const actions=document.createElement('div');actions.className='actions';button(actions,'Edit',async()=>{clearEditor(p);await loadPhotos();show('editor');});if(p.status==='published'){button(actions,'Hide',()=>setStatus(p,'hidden'));button(actions,'Mark sold',()=>setStatus(p,'sold'));}card.append(actions);$('propertyList').append(card);}}
  async function setStatus(p,status){await api.table('properties','?id=eq.'+p.id,{method:'PATCH',auth:true,body:{status}});message(status==='sold'?'Property marked sold and removed from public listings.':'Property hidden from the website.');await loadInventory();}
  async function loadPhotos(){photos=await api.table('property_photos','?property_id=eq.'+current.id+'&order=position',{auth:true});await drawPhotos();}
  async function drawPhotos(){const wrap=$('photoPreview');wrap.replaceChildren();for(const photo of photos){const box=document.createElement('div');box.className='photo';try{const img=document.createElement('img');img.src=await api.photo(photo.object_path,'property-photos',true);img.alt=photo.caption||'Property photo';box.append(img);}catch{line(box,'Photo preview unavailable');}line(box,photo.position===1?'Cover photo':'Photo '+photo.position,'small');button(box,'Remove photo',async()=>{if(!confirm('Remove this photo now? This also removes it from the website.'))return;await api.table('property_photos','?id=eq.'+photo.id,{method:'DELETE',auth:true});try{await api.request('/storage/v1/object/property-photos',{method:'DELETE',auth:true,body:{prefixes:[photo.object_path]}});}catch{message('Photo removed from listing. Stored file cleanup can be retried later.',true);}await loadPhotos();});wrap.append(box);}}
  $('photos').addEventListener('change',()=>{const files=[...$('photos').files];dirty=true;message(files.length+photos.length>4?'Choose fewer photos: a property can have up to 4.':files.length+' new photo(s) selected. Save to upload.',files.length+photos.length>4);});
  async function save(publish){
    const files=[...$('photos').files];if(files.length+photos.length>4)throw new Error('A property can have up to 4 photos. Remove an existing photo or select fewer.');
    const fd=new FormData($('propertyForm')), body={details:{...(current?.details||{})}};
    for(const [name,,type] of [...core,...extra,...privateFields]){const value=String(fd.get(name)||'').trim();if(name.startsWith('detail_')){body.details[name.slice(7)]=value||null;}else body[name]=value?(type==='number'?Number(value):value):null;}
    if(publish && (!body.title||!body.category||!body.locality))throw new Error('To publish, add a title, property type, locality.');
    message('Preparing photos…');const compressed=[];for(const f of files)compressed.push(await api.compress(f));
    const id=current?.id||crypto.randomUUID();
    message('Saving property…');const saved=await api.table('properties',current?'?id=eq.'+id:'',{method:current?'PATCH':'POST',auth:true,body:current?body:{...body,id,status:'draft'},headers:{Prefer:'return=representation'}});
    current=saved[0];
    for(let i=0;i<compressed.length;i++){
      const position=[1,2,3,4].find(n=>!photos.some(p=>p.position===n));const path=id+'/'+crypto.randomUUID()+'.jpg';
      await api.request('/storage/v1/object/property-photos/'+path,{method:'POST',auth:true,body:compressed[i],headers:{'Content-Type':'image/jpeg','x-upsert':'false'}});
      try{const added=await api.table('property_photos','',{method:'POST',auth:true,body:{property_id:id,object_path:path,position},headers:{Prefer:'return=representation'}});photos.push(added[0]);}
      catch(error){try{await api.request('/storage/v1/object/property-photos',{method:'DELETE',auth:true,body:{prefixes:[path]}});}catch{/* orphan cleanup recorded in setup guide */}throw error;}
    }
    $('photos').value='';dirty=false;await drawPhotos();
    if(publish)await api.request('/rest/v1/rpc/antara_publish_property',{method:'POST',auth:true,body:{target_id:id}});
    message(publish?'Published. This property is now on the website.':'Saved. Use Save & publish when the listing is ready.');await loadInventory();show('inventory');
  }
  $('propertyForm').addEventListener('submit',e=>{e.preventDefault();task(async()=>{try{await save(e.submitter?.value==='publish');}catch(error){$('photos').value='';if(current)await loadPhotos();throw new Error(error.message+' Your saved record is retained; reselect any photos that did not upload.');}});});
  async function loadEnquiries(){for(const [table,target] of [['leads','leadList'],['seller_submissions','submissionList']]){const rows=await api.table(table,'?select=*&order=created_at.desc',{auth:true});$(target).replaceChildren();if(!rows.length)line($(target),'No records yet.');for(const row of rows){const card=document.createElement('article');card.className='record';line(card,row.name||row.owner_name,'h3');line(card,[row.phone||row.owner_phone,row.email||row.owner_email,row.property_reference,row.status].filter(Boolean).join(' · '));line(card,row.message||'');if(table==='seller_submissions'){line(card,JSON.stringify(row.property_details,null,2),'pre');const images=await api.table('seller_submission_photos','?submission_id=eq.'+row.id+'&order=position',{auth:true});for(const photo of images){const link=document.createElement('a');link.textContent='View photo '+photo.position;link.href=await api.photo(photo.object_path,'seller-photos',true);link.target='_blank';link.rel='noopener';card.append(link,document.createElement('br'));}}else{const label=document.createElement('label');label.textContent='Follow-up status';const select=document.createElement('select');for(const status of ['new','contacted','site_visit','follow_up','closed','not_interested'])select.add(new Option(status.replaceAll('_',' '),status));select.value=row.status;select.addEventListener('change',()=>task(async()=>{try{await api.table('leads','?id=eq.'+row.id,{method:'PATCH',auth:true,body:{status:select.value}});row.status=select.value;message('Lead status saved.');}catch(error){select.value=row.status;throw error;}}));label.append(select);card.append(label);
        const actions=document.createElement('div');actions.className='actions';
        if(row.status!=='contacted')button(actions,'Mark contacted',async()=>{await api.table('leads','?id=eq.'+row.id,{method:'PATCH',auth:true,body:{status:'contacted'}});message('Enquiry marked contacted.');await loadEnquiries();});
        button(actions,'Delete enquiry',async()=>{if(!confirm('Permanently delete this enquiry from '+(row.name||'this visitor')+'? This cannot be undone.'))return;await api.table('leads','?id=eq.'+row.id,{method:'DELETE',auth:true});message('Enquiry deleted.');await loadEnquiries();});
        card.append(actions);line(card,'Received '+new Date(row.created_at).toLocaleString('en-IN'),'small');}$(target).append(card);}}}
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>task(async()=>{if(!leave())return;dirty=false;message('');if(b.dataset.tab==='editor')clearEditor();if(b.dataset.tab==='inventory')await loadInventory();if(b.dataset.tab==='enquiries')await loadEnquiries();show(b.dataset.tab);})));
  $('cancel').addEventListener('click',()=>{if(leave()){dirty=false;show('inventory');}});
  $('refresh').addEventListener('click',()=>task(loadInventory));
  async function enter(){await api.requireAdmin();await loadInventory();$('login').hidden=true;$('dashboard').hidden=false;}
  $('loginForm').addEventListener('submit',e=>{e.preventDefault();task(async()=>{const form=new FormData(e.target);message('Signing in…');await api.login(form.get('email').trim(),form.get('password'));e.target.reset();await enter();message('');});});
  $('logout').addEventListener('click',()=>task(async()=>{if(!leave())return;dirty=false;try{await api.logout();}finally{location.reload();}}));
  if(api.hasSession())task(enter);
})();
