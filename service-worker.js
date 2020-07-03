const cacheName = 1.44;
self.addEventListener("activate",function(event){
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.map(function(cache){
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
self.addEventListener("fetch",function(event){
  event.respondWith(
    fetch(event.request).then(function(resolve){
      const resClone = resolve.clone();
      caches.open(cacheName).then(function(cache){
        cache.put(event.request,resClone);
      });
      return resolve;
    })
    .catch(function(error){
      caches.match(event.request).then(function(resolve){
        return resolve;
      })
    })
  );
});