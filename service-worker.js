var worker = {
  cache_version: 2.17
}
self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(cacheVersions => Promise.all(cacheVersions.map(cache => {
    if (cache != worker.cache_version) return caches.delete(cache);
  }))));
});
self.addEventListener("fetch",event => {
  if (event.request.method == "POST"){
    event.respondWith(async () => {
      var client = await self.clients.get(event.clientId || event.resultingClientId), requestData = await event.request.formData(), files = requestData.getAll("media");
      files.forEach((mediaFile,index) => files[index] = mediaFile.get("file"));
      client.postMessage({
        action: "load-files",
        files: files
      });
    });
  } else event.respondWith(fetch(event.request).then(resolve => {
    var resolveClone = resolve.clone();
    caches.open(worker.cache_version).then(cache => cache.put(event.request,resolveClone));
    return resolve;
  }).catch(error => caches.match(event.request)));
});
self.addEventListener("message",event => {
  if (event.data.action == "clear-cache"){
    caches.keys().then(cacheVersions => {
      Promise.all(cacheVersions.map(cache => caches.delete(cache)));
      self.clients.matchAll().then(clients => clients.forEach(client => client.postMessage({
        action: "clear-cache-success"
      })));
    });
  }
});