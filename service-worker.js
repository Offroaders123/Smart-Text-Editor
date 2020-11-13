var worker = {
  cache_version: 2.16
}
self.addEventListener("activate",function(event){
  event.waitUntil(caches.keys().then(function(cacheVersions){
    return Promise.all(cacheVersions.map(function(cache){
      if (cache != worker.cache_version) return caches.delete(cache);
    }));
  }));
});
self.addEventListener("fetch",function(event){
  if (event.request.method == "POST"){
    return event.respondWith(async function(){
      var client = await self.clients.get(event.clientId || event.resultingClientId), requestData = await event.request.formData(), files = requestData.getAll("media");
      files.forEach(function(mediaFile,index){
        files[index] = mediaFile.get("file");
      });
      client.postMessage({
        action: "load-files",
        files: files
      });
    });
  }
  event.respondWith(fetch(event.request).then(function(resolve){
    var resolveClone = resolve.clone();
    caches.open(worker.cache_version).then(function(cache){
      cache.put(event.request,resolveClone);
    });
    return resolve;
  }).catch(function(error){
    return caches.match(event.request);
  }));
});
self.addEventListener("message",function(event){
  if (event.data.action == "clear-cache"){
    caches.keys().then(function(cacheVersions){
      Promise.all(cacheVersions.map(function(cache){
        return caches.delete(cache);
      }));
      self.clients.matchAll().then(function(clients){
        clients.forEach(function(client){
          client.postMessage({
            action: "clear-cache-success"
          });
        });
      });
    });
  }
});