self.Editor = {
  version: 3.04,
  environment: () => ({
    macOS_device: (/(Mac)/i.test(navigator.platform) && navigator.standalone === undefined)
  }),
  share_files: []
}
self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(versions => Promise.all(versions.map(cache => {
    if (cache !== Editor.version) return caches.delete(cache);
  }))));
  event.waitUntil(clients.claim());
  postMessageAllClients({ action: "service-worker-activated" });
});
self.addEventListener("fetch",event => {
  if (event.request.method == "POST"){
    event.respondWith(Response.redirect("/?share-target=true",303));
    return event.waitUntil((async () => {
      Editor.share_files = Array.from(await event.request.formData()).map(file => file[1]);
    })());
  }
  if (event.request.url === `${self.location.href.match("(.*\/).*")[1]}manifest.webmanifest`){
    return event.respondWith(caches.match(event.request).then(response => {
      return response || fetch("manifest.webmanifest").then(async request => {
        const manifest = await request.json();
        manifest.icons = manifest.icons.filter(icon => {
          if (!Editor.environment().macOS_device && icon.platform !== "macOS") return icon;
          if (Editor.environment().macOS_device && icon.platform === "macOS" || icon.purpose === "maskable") return icon;
        });
        const response = new Response(new Blob([JSON.stringify(manifest,null,"  ")],{ type: "text/json" }));
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
  if (event.data.action === "share-target"){
    clients.matchAll().then(clients => clients.filter(client => client.id === event.source.id).forEach(client => client.postMessage({ action: "share-target", files: Editor.share_files })));
  }
  if (event.data.action === "clear-site-caches"){
    caches.keys().then(versions => {
      Promise.all(versions.map(cache => caches.delete(cache)));
      postMessageAllClients({ action: "clear-site-caches-complete" });
    });
  }
});
function postMessageAllClients(data){
  clients.matchAll().then(clients => clients.forEach(client => client.postMessage(data)));
}