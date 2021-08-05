self.Editor = {
  version: 2.83,
  environment: () => ({
    macOS_device: (/(Mac)/i.test(navigator.platform) && navigator.standalone == undefined)
  })
}
self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(versions => Promise.all(versions.map(cache => {
    if (cache != Editor.version) return caches.delete(cache);
  }))));
  event.waitUntil(clients.claim());
  postMessageAllClients({ action: "service-worker-activated" });
});
self.addEventListener("fetch",event => {
  if (event.request.url == `${self.location.href.match("(.*\/).*")[1]}manifest.webmanifest`){
    return event.respondWith(caches.match(event.request).then(response => {
      return response || fetch("manifest.webmanifest").then(async request => {
        var manifest = await request.json();
        manifest.icons = manifest.icons.filter(icon => {
          if (!Editor.environment().macOS_device && icon.platform != "macOS") return icon;
          if (Editor.environment().macOS_device && icon.platform == "macOS" || icon.purpose == "maskable") return icon;
        });
        var response = new Response(new Blob([JSON.stringify(manifest,null,"  ")],{ type: "text/json" }));
        caches.open(Editor.version).then(cache => cache.put(event.request,response));
        return response.clone();
      });
    }));
  }
  event.respondWith(caches.match(event.request).then(response => {
    return response || fetch(event.request).then(async response => {
      caches.open(Editor.version).then(cache => cache.put(event.request,response));
      return response.clone();
    });
  }));
});
self.addEventListener("message",event => {
  if (event.data.action == "clear-site-caches"){
    caches.keys().then(versions => {
      Promise.all(versions.map(cache => caches.delete(cache)));
      postMessageAllClients({ action: "clear-site-caches-complete" });
    });
  }
});
function postMessageAllClients(data){
  clients.matchAll().then(clients => clients.forEach(client => client.postMessage(data)));
}

/* Web Share Target hook - to be re-added to the fetch event at some point

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