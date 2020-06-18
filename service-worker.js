const cacheName = 1.23;
self.addEventListener("activate",function(event){
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
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
    fetch(event.request).then((resolve) => {
      const resClone = resolve.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(event.request, resClone);
      });
      return resolve;
    })
    .catch((err) => caches.match(event.request).then((resolve) => resolve))
  );
});