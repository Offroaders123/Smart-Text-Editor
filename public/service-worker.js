/// <reference no-default-lib="true"/>
/// <reference types="better-typescript/worker.d.ts"/>

var self = /** @type { ServiceWorkerGlobalScope } */ (/** @type { unknown } */ (globalThis));

const CACHE_VERSION = "Smart Text Editor v4.22.0";

const IS_MACOS_DEVICE = (/(macOS|Mac)/i.test(navigator.userAgentData?.platform ?? navigator.platform) && navigator.standalone === undefined);

/** @type { File[] } */
const SHARE_FILES = [];

self.addEventListener("activate",event => {
  event.waitUntil(removeOutdatedVersions());
});

self.addEventListener("fetch",async event => {
  if (event.request.method === "POST"){
    event.waitUntil((async () => {
      const formData = await event.request.formData();
      const files = formData.getAll("file");
      for (const file of files){
        SHARE_FILES.push(/** @type { File } */ (file));
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
        if (key.startsWith("Smart Text Editor ")){
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
async function removeOutdatedVersions(){
  const keys = await caches.keys();

  await Promise.all(keys.map(async key => {
    const isOutdatedVersion = key.startsWith("Smart Text Editor ") && key !== CACHE_VERSION;

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
 * 
 * @param { Request } request
*/
async function matchRequest(request){
  let response = await caches.match(request);
  if (response !== undefined) return response;

  response = await fetch(request);
  await cacheRequest(request,response);

  return response;
}

/**
 * Adds a network request and response to Cache Storage.
 * 
 * @param { Request } request
 * @param { Response } response
*/
async function cacheRequest(request,response){
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request,response.clone());
}

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