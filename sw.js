// Offline support for Shift Roster.
// The page itself is fetched network-first so updates show up straight away, with the cached
// copy used when there is no signal. Icons, the manifest and the libraries loaded from CDNs
// (Firebase, pdf.js, pako) are served from the cache once they have been fetched once.
// The real app and the test copy (/test/) share one website, so each keeps its own cache
const PREFIX=/\/test\//.test(self.location.pathname)?'shift-roster-test-v':'shift-roster-v';
const CACHE=PREFIX+'18';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).catch(function(){}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf(PREFIX)===0&&k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function isLibrary(url){
  return /^https:\/\/(www\.gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com\/ajax\/libs)\//.test(url);
}

self.addEventListener('fetch',function(e){
  const req=e.request;
  if(req.method!=='GET') return;
  const url=req.url;
  // Pages: network first, cached copy when offline
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){
      const copy=res.clone();
      caches.open(CACHE).then(function(c){ c.put('./index.html',copy); });
      return res;
    }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  // Same-site files and CDN libraries: cache first, then network (and remember it)
  if(url.indexOf(self.location.origin)===0||isLibrary(url)){
    e.respondWith(caches.match(req).then(function(hit){
      return hit||fetch(req).then(function(res){
        if(res&&(res.ok||res.type==='opaque')){ const copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,copy); }); }
        return res;
      });
    }));
  }
  // Everything else (Firebase database traffic etc.) goes straight to the network
});
