/* Service worker TOKOKU Lite: tidak menyimpan cache, semua permintaan langsung ke internet
   (data selalu terbaru). Ada hanya supaya aplikasi bisa diinstal di Android. */
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => { e.respondWith(fetch(e.request)); });
