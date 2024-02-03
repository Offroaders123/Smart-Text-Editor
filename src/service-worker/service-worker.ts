declare var self: ServiceWorkerGlobalScope;
declare const clients: Clients;

const NAME = "Smart Text Editor";
const VERSION = "v4.27.5";
const CACHE_NAME = `${NAME} ${VERSION}`;

const IS_MACOS_DEVICE: boolean = (/(macOS|Mac)/i.test(navigator.userAgentData?.platform ?? navigator.platform) && navigator.maxTouchPoints < 1);

const SHARE_FILES: File[] = [];

self.addEventListener("activate",event => {
  event.waitUntil(removeOutdatedVersions());
});

self.addEventListener("fetch",async event => {
  if (event.request.method === "POST"){
    event.waitUntil((async () => {
      const formData = await event.request.formData();
      const files = formData.getAll("file");
      for (const file of files){
        SHARE_FILES.push(file as File);
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

      manifest.icons = manifest.icons.filter((icon: { platform: string; purpose: string; }) => {
        switch (true){
          case !IS_MACOS_DEVICE && icon.platform !== "macOS":
          case IS_MACOS_DEVICE && icon.platform === "macOS" || icon.purpose === "maskable": {
            return icon;
          }
        }
      });

      const result = new Response(JSON.stringify(manifest,null,2),{ headers: { "Content-Type": "text/json" } });

      await cacheRequest(event.request,result);

      return result;
    })());
    return;
  }

  event.respondWith(matchRequest(event.request));
});

self.addEventListener("message",async event => {
  switch (event.data.action){
    case "share-target": {
      const client = event.source;
      client?.postMessage({ action: "share-target", files: SHARE_FILES });
      break;
    }
    case "clear-site-caches": {
      const keys = await caches.keys();

      await Promise.all(keys.map(async key => {
        if (key.startsWith(NAME)){
          await caches.delete(key);
        }
      }));

      await messageClients({ action: "clear-site-caches-complete" });
      break;
    }
  }
});

/**
 * Clears out old versions of the app from Cache Storage.
*/
async function removeOutdatedVersions(): Promise<void> {
  const keys = await caches.keys();

  await Promise.all(keys.map(async key => {
    const isOutdatedVersion = key.startsWith(NAME) && key !== CACHE_NAME;

    if (isOutdatedVersion){
      await caches.delete(key);
    }
  }));

  await clients.claim();
  await messageClients({ action: "service-worker-activated" });
}

/**
 * Matches a network request with it's cached counterpart from Cache Storage.
 * 
 * If it hasn't been cached yet, it will fetch the network for a response, cache a clone, then return the response.
*/
async function matchRequest(request: Request): Promise<Response> {
  let response = await caches.match(request);
  if (response !== undefined) return response;

  response = await fetch(request);
  await cacheRequest(request,response);

  return response;
}

/**
 * Adds a network request and response to Cache Storage.
*/
async function cacheRequest(request: Request, response: Response): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request,response.clone());
}

async function messageClients(message: any, options: StructuredSerializeOptions = {}): Promise<void> {
  const clients = await self.clients.matchAll();

  for (const client of clients){
    client.postMessage(message,options);
  }
}

export {};