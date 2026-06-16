self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Pass-through for now. For a full offline experience, you would cache assets here.
  e.respondWith(fetch(e.request));
});
