/* 摸魚廣場 Service Worker：網頁一律先向伺服器確認最新版（沒網路才用快取） */
const CACHE = 'mofish-v11-14';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  const net = isPage ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req);
  e.respondWith(net.then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(isPage ? './index.html' : req, cp)); } return r; })
    .catch(() => caches.match(isPage ? './index.html' : req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
