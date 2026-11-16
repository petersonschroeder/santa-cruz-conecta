/* PWA: não armazenar catálogo, tokens de login nem páginas administrativas. */
const STATIC_CACHE = 'scc-pwa-v1';
const OFFLINE = '/offline.html';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll([
    OFFLINE, '/assets/offline.css', '/assets/pwa-icon-192.png'
  ])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('scc-pwa-')&&k!==STATIC_CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request=event.request;
  const url=new URL(request.url);
  if(request.mode!=='navigate'||url.origin!==self.location.origin||request.method!=='GET')return;
  // Navegação sempre tenta a rede; tela offline não contém dados pessoais ou cópias desatualizadas.
  event.respondWith(fetch(request).catch(()=>caches.match(OFFLINE)));
});
