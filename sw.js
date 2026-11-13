/* オフライン用：一度ひらいたら端末に保存して、電波がなくても動くようにする */
var CACHE = 'piano-oto-v2';
var FILES = ['./', 'index.html', 'songs.js', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png', 'notes/60.m4a', 'notes/61.m4a', 'notes/62.m4a', 'notes/63.m4a', 'notes/64.m4a', 'notes/65.m4a', 'notes/66.m4a', 'notes/67.m4a', 'notes/68.m4a', 'notes/69.m4a', 'notes/70.m4a', 'notes/71.m4a', 'notes/72.m4a', 'notes/73.m4a', 'notes/74.m4a', 'notes/75.m4a', 'notes/76.m4a', 'notes/77.m4a', 'notes/78.m4a', 'notes/79.m4a', 'notes/80.m4a', 'notes/81.m4a', 'notes/82.m4a', 'notes/83.m4a', 'notes/84.m4a'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    /* 同じサイトのほかのアプリ（電車・まち・がっき）の保存データは消さない。自分の古い版だけ消す */
    var mine = CACHE.replace(/v\d+$/, '');
    return Promise.all(keys.map(function (k) { if (k !== CACHE && k.indexOf(mine) === 0) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* 保存してあるものをすぐ返す（電波が弱くても待たない）。裏で新しい版があれば取っておく */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok && res.status === 200 && req.url.indexOf(self.location.origin) === 0) c.put(req, res.clone());
        return res;
      });
      if (hit) { net['catch'](function () {}); return hit; }
      return net['catch'](function () { return c.match('index.html'); });
    });
  }));
});
