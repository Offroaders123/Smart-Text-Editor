self.worker = {
  version: 2.22
}
self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(versions => Promise.all(versions.map(cache => {
    if (cache != worker.version) return caches.delete(cache);
  }))));
});
self.addEventListener("fetch",event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request).then(response => caches.open(worker.version).then(cache => {
    cache.put(event.request,response.clone());
    return response;
  }))));
});
self.addEventListener("message",event => {
  if (event.data.action == "clear-cache"){
    caches.keys().then(versions => {
      Promise.all(versions.map(cache => caches.delete(cache)));
      self.clients.matchAll().then(clients => clients.forEach(client => client.postMessage({ action: "clear-cache-success" })));
    });
  }
});

/* Web Share Target hook - to be re-added at some point

  if (event.request.method == "POST"){
    event.respondWith(async () => {
      var client = await self.clients.get(event.clientId || event.resultingClientId), requestData = await event.request.formData(), files = requestData.getAll("media");
      files.forEach((mediaFile,index) => files[index] = mediaFile.get("file"));
      client.postMessage({
        action: "load-files",
        files: files
      });
    });
  } else 

*/