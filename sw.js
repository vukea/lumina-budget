/* ══ KILL-SWITCH SERVICE WORKER ══
   The previous worker cached HTML/CSS cache-first, which left devices
   stuck on a stale layout. This replacement self-destructs: the browser
   re-checks sw.js on navigation, sees it changed, installs this version,
   then on activate it wipes every cache, unregisters itself, and reloads
   open clients so they fetch the latest page fresh from the network. */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.navigate(client.url));
  })());
});

/* Pass-through fetch: never serve from cache again. */
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
