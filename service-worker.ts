/// <reference no-default-lib="true"/>
/// <reference lib="ESNext"/>
/// <reference lib="WebWorker"/>

declare global {
  interface WorkerNavigator {
    standalone?: boolean;
    userAgentData?: NavigatorUAData;
  }

  interface NavigatorUAData {
    platform: string;
  }
}

declare var self: ServiceWorkerGlobalScope;

export {};

const STE = {
  version: "Smart Text Editor v4.0.0",
  cache: true,
  environment: {
    get macOSDevice() {
      return (/(macOS|Mac)/i.test(navigator.userAgentData?.platform || navigator.platform) && navigator.standalone === undefined);
    }
  },
  shareFiles: [] as File[]
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
        STE.shareFiles.push(file as File);
      }
      event.respondWith(Response.redirect("./?share-target=true",303));
    })());
    return;
  }

  if (event.request.url === `${(self.location.href.match("(.*\/).*") || "")[1]}manifest.webmanifest`){
    event.respondWith(caches.match(event.request).then(async response => {
      const result = response || fetch("./manifest.webmanifest").then(async response => {
        const manifest = await response.json();
        manifest.icons = manifest.icons.filter((icon: { platform: string; purpose: string; }) => {
          switch (true){
            case !STE.environment.macOSDevice && icon.platform !== "macOS":
            case STE.environment.macOSDevice && icon.platform === "macOS" || icon.purpose === "maskable": {
              return icon;
            }
          }
        });
        response = new Response(new Blob([JSON.stringify(manifest,null,2)],{ type: "text/json" }));
        if (STE.cache){
          const cache = await caches.open(STE.version);
          cache.put(event.request,response);
        }
        return response.clone();
      });
      return result;
    }));
  }

  event.respondWith(caches.match(event.request).then(async response => {
    const result = response || fetch(event.request).then(async response => {
      if (STE.cache){
        const cache = await caches.open(STE.version);
        await cache.put(event.request,response);
      }
      return response.clone();
    });
    return result;
  }));
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

async function messageClients(message: any, options: StructuredSerializeOptions = {}){
  const clients = await self.clients.matchAll();
  for (const client of clients){
    client.postMessage(message,options);
  }
}