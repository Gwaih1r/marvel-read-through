// Bump VERSION whenever the app changes so installed copies pick up the update.
const VERSION = 'mrt-v2.6.2';
const SHELL = ['./', 'index.html', 'app.js', 'app.css', 'art.js', 'config.js', 'manifest.json', 'data/chapters.json', 'data/meta.json', 'data/recaps.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'];
const CHAPTERS = Array.from({ length: 26 }, (_, i) => 'data/c' + (100 + i) + '.json');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    // cache: 'reload' skips the browser's HTTP cache, so a new version never installs an old file.
await c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    // Chapter files are warmed in the background so search and stats work offline.
    c.addAll(CHAPTERS.map(u => new Request(u, { cache: 'reload' }))).catch(() => { });
    fetch('data/seed.json').then(r => r.ok && c.put('data/seed.json', r)).catch(() => { });
  }));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Stale-while-revalidate for the app, its data, fonts and the Firebase SDK.
// Firestore and Auth traffic (googleapis.com) is left alone; Firestore keeps its own offline cache.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const ok = u.origin === self.location.origin || /(^|\.)gstatic\.com$/.test(u.hostname) || u.hostname === 'fonts.googleapis.com';
  if (!ok) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: u.origin === self.location.origin });
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => hit || Response.error());
    if (hit) { e.waitUntil(net.catch(() => { })); return hit; }
    return net;
  }));
});
