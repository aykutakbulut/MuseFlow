self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // PWA kurulabilirliği için bir fetch listener'ın KAYIT EDİLMİŞ olması
  // yeterlidir; isteklere müdahale etmek zorunda değiliz.
  //
  // ÖNEMLİ: event.respondWith(fetch(...)) çağrısı yapmıyoruz. Çünkü:
  //   1. Herhangi bir fetch başarısız olduğunda tüm istek "Failed to fetch"
  //      ile çöküyordu (sayfa açılmıyordu).
  //   2. Ses akışının Range (byte-range) isteklerini ve streaming'i bozuyordu.
  //
  // respondWith çağrılmadığında tarayıcı isteği kendi varsayılan davranışıyla
  // (Range, cache, redirect dahil) doğru şekilde yönetir.
});
