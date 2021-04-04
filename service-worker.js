self.Editor = {
  version: 2.29,
  origin: "https://offroaders123.github.io/Smart-Text-Editor",
  environment: () => ({
    macOS_device: (/(Mac)/i.test(navigator.platform) && navigator.standalone == undefined)
  })
}
self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(versions => Promise.all(versions.map(cache => {
    if (cache != Editor.version) return caches.delete(cache);
  }))));
});
self.addEventListener("fetch",event => {
  if (event.request.url == `${Editor.origin}/manifest.webmanifest`){
    return event.respondWith(fetch("manifest.webmanifest").then(async request => {
      var manifest = await request.json();
      manifest.icons = manifest.icons.filter(icon => {
        if (!Editor.environment().macOS_device && icon.platform != "macOS") return icon;
        if (Editor.environment().macOS_device && icon.platform == "macOS" || icon.purpose == "maskable") return icon;
      });
      var response = new Response(new Blob([JSON.stringify(manifest,null,"  ").replace(/_origin_/g,Editor.origin)],{ type: "text/json" }));
      caches.open(Editor.version).then(cache => cache.put(event.request,response));
      return response.clone();
    }));
  }
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request).then(response => caches.open(Editor.version).then(cache => {
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