var cacheVersion = 1.78;
self.addEventListener("activate",function(event){
  event.waitUntil(caches.keys().then(function(cacheVersions){
    return Promise.all(cacheVersions.map(function(cache){
      if (cache != cacheVersion){
        return caches.delete(cache);
      }
    }));
  }));
});
self.addEventListener("fetch",function(event){
  event.respondWith(fetch(event.request).then(function(resolve){
    var resolveClone = resolve.clone();
    caches.open(cacheVersion).then(function(cache){
      cache.put(event.request,resolveClone);
    });
    return resolve;
    }).catch(function(error){
    caches.match(event.request).then(function(resolve){
      return resolve;
  })}));
});