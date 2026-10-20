// RIS offline helper: keeps the app opening even on a weak network.
const V='ris-v4';
const CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // never touch Firebase data / auth traffic
  if(/firestore\.googleapis|identitytoolkit|securetoken|googleapis\.com\/(identitytoolkit|v1)/.test(u.host+u.pathname))return;
  const same=u.origin===location.origin;
  const lib=/gstatic\.com|cdnjs\.cloudflare\.com|fonts\.g/.test(u.host);
  if(same&&(r.mode==='navigate'||/index\.html$|\/$/.test(u.pathname))){
    // network first for the app page, so a new upload shows up at once
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put(r,c));return x}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
  }else if(same||lib){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x})));
  }
});
