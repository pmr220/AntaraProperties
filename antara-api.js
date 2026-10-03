/* Small host-independent Supabase REST client. No secret keys in this file. */
(() => {
  const config = window.RE_CONFIG.supabase;
  const key = 'antara.auth.session';
  let session = null, refreshing = null;
  try { session = JSON.parse(sessionStorage.getItem(key)); } catch { /* signed out */ }
  function remember(value) {
    session = value;
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  }
  async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
    if (auth) await refresh();
    if (auth && !session) throw new Error('Please sign in again.');
    const binary = body instanceof Blob;
    const response = await fetch(config.url + path, {
      method,
      headers: { apikey: config.publishableKey,
        ...(auth ? { Authorization: 'Bearer ' + session.access_token } : {}),
        ...(body !== undefined && !binary ? {'Content-Type': 'application/json'} : {}), ...headers },
      ...(body !== undefined ? {body: binary ? body : JSON.stringify(body)} : {})
    });
    const raw = await response.text();
    let data; try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
    if (!response.ok) {
      if (response.status === 401 && auth) remember(null);
      if (data?.code === 'PGRST202' && path.includes('/rpc/antara_')) {
        throw new Error('Admin setup is not installed yet. Ask your website manager to run database/02_admin_publishing.sql in Supabase.');
      }
      throw new Error(data?.msg || data?.message || data?.error_description || 'Request failed. Please try again.');
    }
    return data;
  }
  async function refresh() {
    if (!session || session.expires_at > Date.now()/1000 + 60) return;
    if (!refreshing) refreshing = (async () => {
      try {
        const data = await request('/auth/v1/token?grant_type=refresh_token', {
          method:'POST',body:{refresh_token:session.refresh_token}
        });
        remember({...data,expires_at:Date.now()/1000 + data.expires_in});
      } catch (error) { remember(null); throw error; }
      finally { refreshing = null; }
    })();
    await refreshing;
  }
  const api = {
    request,
    async login(email,password) {
      const data = await request('/auth/v1/token?grant_type=password', {method:'POST',body:{email,password}});
      remember({...data,expires_at:Date.now()/1000 + data.expires_in});
      try { await api.requireAdmin(); } catch(error) { remember(null); throw error; }
    },
    async requireAdmin() {
      const allowed = await request('/rest/v1/rpc/antara_admin_session',{method:'POST',body:{},auth:true});
      if (!allowed) throw new Error('This account does not have admin access.');
    },
    hasSession: () => Boolean(session),
    async logout() {
      try { if (session) await request('/auth/v1/logout',{method:'POST',auth:true}); }
      finally { remember(null); }
    },
    table(name,query='',options={}) {return request('/rest/v1/'+name+query,options);},
    async photo(path, bucket='property-photos', auth=false) {
      const result = await request('/storage/v1/object/sign/'+bucket+'/'+path.split('/').map(encodeURIComponent).join('/'),{
        method:'POST',body:{expiresIn:300},auth
      });
      return config.url + '/storage/v1' + result.signedURL;
    },
    async compress(file) {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Use JPG, PNG or WebP photos. Export HEIC photos as JPG first.');
      if (file.size > 25*1024*1024) throw new Error('Each original photo must be smaller than 25 MB.');
      const bitmap = await createImageBitmap(file);
      try {
        const scale = Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
        const ctx = canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
        const blob = await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.8));
        if (!blob || blob.size > 5*1024*1024) throw new Error('Could not resize photo. Please choose a smaller image.');
        return blob;
      } finally { bitmap.close(); }
    }
  };
  window.Antara = api;
})();
