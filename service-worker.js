var cacheName = 1.69;
self.addEventListener("activate",function(event){
  event.waitUntil(caches.keys().then(function(cacheNames){
    return Promise.all(cacheNames.map(function(cache){
      if (cache != cacheName){
        return caches.delete(cache);
      }
    }));
  }));
});
self.addEventListener("fetch",function(event){
  event.respondWith(fetch(event.request).then(function(resolve){
    caches.open(cacheName).then(function(cache){
      cache.put(event.request,resolve.clone());
    });
    return resolve;
    }).catch(function(error){
    caches.match(event.request).then(function(resolve){
      return resolve;
  })}));
});