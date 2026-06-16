self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // PWA kurulumu için fetch listener zorunludur.
  // Gelişmiş önbellekleme gerekmediği için direkt ağa paslıyoruz.
  event.respondWith(fetch(event.request));
});
