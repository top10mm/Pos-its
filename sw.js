const CACHE_NAME = "meus-postits-shell-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icone-192.png", "./icons/icone-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        (await caches.open(CACHE_NAME)).put(event.request, response.clone());
      }
      return response;
    } catch {
      if (event.request.mode === "navigate") return (await caches.match("./index.html")) || Response.error();
      return Response.error();
    }
  })());
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const wins = await clients.matchAll({type: "window", includeUncontrolled: true});
    for (const win of wins) if ("focus" in win) return win.focus();
    if (clients.openWindow) return clients.openWindow("./");
  })());
});
