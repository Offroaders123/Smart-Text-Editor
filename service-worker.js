// @ts-check
/// <reference no-default-lib="true"/>
/// <reference types="better-typescript/worker"/>

const STE = {
  version: "Smart Text Editor v4.10.0",
  cache: true,
  environment: {
    get macOSDevice() {
      // @ts-expect-error
      return (/(macOS|Mac)/i.test(navigator.userAgentData?.platform || navigator.platform) && navigator.standalone === undefined);
    }
  },
  /** @type { File[] } */
  shareFiles: []
}

self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(async keys => {
    const results = keys.map(async key => {
      if (key.startsWith("Smart Text Editor") && key !== STE.version){
        return caches.delete(key);
      }
    });
    await Promise.all(results);
    await self.clients.claim();
    return messageClients({ action: "service-worker-activated" });
  }));
});

self.addEventListener("fetch",async event => {
  if (event.request.method === "POST"){
    event.waitUntil((async () => {
      const formData = await event.request.formData();
      const files = formData.getAll("file");
      for (const file of files){
        STE.shareFiles.push(/** @type { File } */ (file));
      }
      event.respondWith(Response.redirect("./?share-target=true",303));
    })());
    return;
  }

  if (event.request.url === `${(self.location.href.match(/(.*\/).*/) || "")[1]}manifest.webmanifest`){
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (cached !== undefined) return cached;

      const fetched = await fetch("./manifest.webmanifest");
      const manifest = await fetched.json();

      manifest.icons = manifest.icons.filter(/** @param { { platform: string; purpose: string; } } icon */ icon => {
        switch (true){
          case !STE.environment.macOSDevice && icon.platform !== "macOS":
          case STE.environment.macOSDevice && icon.platform === "macOS" || icon.purpose === "maskable": {
            return icon;
          }
        }
      });

      const result = new Response(JSON.stringify(manifest,null,2),{ headers: { "Content-Type": "text/json" } });

      if (STE.cache){
        const cache = await caches.open(STE.version);
        await cache.put(event.request,result.clone());
      }

      return result;
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached !== undefined) return cached;

    const fetched = await fetch(event.request);

    if (STE.cache){
      const cache = await caches.open(STE.version);
      await cache.put(event.request,fetched.clone());
    }

    return fetched;
  })());
});

self.addEventListener("message",async event => {
  switch (event.data.action){
    case "share-target": {
      const client = event.source;
      client?.postMessage({ action: "share-target", files: STE.shareFiles });
      break;
    }
    case "clear-site-caches": {
      const keys = await caches.keys();
      const results = keys.map(key => {
        if (key.startsWith("Smart Text Editor")){
          return caches.delete(key);
        }
      });
      await Promise.all(results);
      await messageClients({ action: "clear-site-caches-complete" });
      break;
    }
  }
});

/**
 * @param { any } message
 * @param { StructuredSerializeOptions } options
*/
async function messageClients(message,options = {}){
  const clients = await self.clients.matchAll();
  for (const client of clients){
    client.postMessage(message,options);
  }
}