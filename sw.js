/* Service worker: caches the app files so the converter works offline. Bump VERSION after changing any file. */
var VERSION='needle-converter-v1';
var FILES=['./','index.html','en.html','manifest.webmanifest','manifest-en.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==VERSION}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(hit){
    var net=fetch(req).then(function(res){
      if(res&&(res.ok||res.type==='opaque')){var copy=res.clone(); caches.open(VERSION).then(function(c){c.put(req,copy)});}
      return res;
    }).catch(function(){return hit});
    return hit||net;
  }));
});
