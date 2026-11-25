// Bump VERSION whenever the app shell changes so phones pick up the update.
const VERSION = 'mrt-v1';
const SHELL = ['./', 'index.html', 'app.js', 'app.css', 'config.js', 'manifest.json', 'data/chapters.json', 'data/seed.json', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Stale-while-revalidate for the app, its data, fonts and the Firebase SDK.
// Firestore's own traffic (googleapis.com) is left alone; it has its own offline cache.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const ok = u.origin === self.location.origin || /(^|\.)gstatic\.com$/.test(u.hostname) || u.hostname === 'fonts.googleapis.com';
  if (!ok) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: u.origin === self.location.origin });
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
