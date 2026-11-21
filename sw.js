/* يحفظ ملفات التطبيق في الجهاز ليفتح دون اتصال */
var V = 'safa-v99';
var FILES = ['./', './index.html', './shell.html', './core.js', './loader.js', './ui.js', './ui2.js', './ui3.js', './icon-180.png', './icon-192.png', './icon-512.png', './manifest.json',
  './ghadaq/', './ghadaq/index.html', './ghadaq/shell.html', './ghadaq/manifest.json', './ghadaq/icon-180.png', './ghadaq/icon-192.png', './ghadaq/icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V && k !== 'fonts' && k !== 'share-inbox'; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  /* ملف مُشارَك من تطبيق آخر (واتساب، المعرض…): يُحفظ ثم يُفتح التطبيق ليقرأه */
  if (e.request.method === 'POST' && /\/share-target\/?$/.test(u.pathname)) {
    e.respondWith(e.request.formData().then(function (fd) {
      var f = fd.get('file');
      return caches.open('share-inbox').then(function (c) {
        if (!f || typeof f === 'string') return;
        return c.put('./share-file', new Response(f, { headers: { 'Content-Type': f.type || 'application/octet-stream', 'X-Name': encodeURIComponent(f.name || 'file') } }));
      });
    }).catch(function () {}).then(function () { return Response.redirect(u.pathname.replace(/share-target\/?$/, '') + '?share=1', 303); }));
    return;
  }
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) {
    /* الشبكة أولًا (لتصل التحديثات)، ثم النسخة المحفوظة دون اتصال */
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {
      if (r.ok) { var cl = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cl); }); }
      return r;
    }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); }); }));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open('fonts').then(function (c) { return c.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (n) { c.put(e.request, n.clone()); return n; });
    }); }));
  }
});
