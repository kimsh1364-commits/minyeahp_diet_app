// 앱을 새로 배포할 때마다 VERSION 숫자를 올리면 이전 캐시가 정리돼요.
const VERSION = 'v31';
const CACHE = 'diet-app-' + VERSION;
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'assets/themes/romantic/rose-bloom.webp', 'assets/themes/y2k/bg-pink-stars.webp', 'assets/themes/water/water-bottle.webp', 'assets/themes/clean/clean-bag.webp', 'assets/themes/clean/clean-headphones.webp', 'assets/themes/clean/clean-nails.webp', 'assets/themes/clean/clean-polish.webp', 'assets/themes/clean/clean-skincare.webp', 'assets/themes/clean/clean-water.webp', 'assets/themes/y2k/y2k-cap.webp', 'assets/themes/y2k/y2k-earphones.webp', 'assets/themes/y2k/y2k-mirror.webp', 'assets/themes/y2k/y2k-mp3.webp', 'assets/themes/y2k/y2k-phone.webp', 'assets/themes/y2k/y2k-star.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 같은 주소의 파일은 네트워크 우선(최신 유지), 오프라인이면 캐시 사용
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
