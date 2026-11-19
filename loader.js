/* محمّل التطبيق: يعرض الواجهة المحفوظة فورًا، أو يجلبها أول مرة من الخادم */
(function () {
  'use strict';
  var APP = window.APP;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register((APP.root || './') + 'sw.js', { scope: APP.root || './' }).catch(function () {});
  function msg(t, retry) {
    document.getElementById('st').innerHTML = t + (retry ? '<br><br><button onclick="location.reload()">إعادة المحاولة</button>' : '');
  }
  function head() {
    return '<title>' + APP.short + '</title><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">' +
      '<meta name="apple-mobile-web-app-title" content="' + APP.short + '"><meta name="apple-mobile-web-app-status-bar-style" content="default">' +
      '<meta name="theme-color" content="' + APP.color + '"><link rel="apple-touch-icon" href="' + APP.icon + '"><link rel="icon" href="' + APP.icon + '">' +
      '<link rel="manifest" href="' + APP.manifest + '">';
  }
  function render(shell, core) {
    var inj = head() + '<script>window.APP=' + JSON.stringify(APP) + ';<\/script><script>' + core + '<\/script>';
    var html = shell.replace(/<base[^>]*>/i, '');
    html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, function (m) { return m + inj; }) : inj + html;
    document.open(); document.write(html); document.close();
  }
  var coreP = Promise.all([fetch((APP.root || './') + 'core.js', { cache: navigator.onLine ? 'no-cache' : 'default' }).then(function (r) { return r.text(); }),
    fetch((APP.root || './') + 'ui.js', { cache: navigator.onLine ? 'no-cache' : 'default' }).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }),
    fetch((APP.root || './') + 'ui2.js', { cache: navigator.onLine ? 'no-cache' : 'default' }).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; })])
    .then(function (x) { return x[0] + '<\/script><script>' + x[1] + '<\/script><script>' + x[2]; });
  Promise.all([RT.kget('shell'), coreP]).then(function (x) {
    var shell = x[0], core = x[1];
    if (shell) { render(shell, core); return; }
    if (!navigator.onLine) { msg('📴 لا يوجد اتصال.<br>افتح التطبيق مرة واحدة مع الإنترنت ليُحفظ على هذا الجهاز.', true); return; }
    msg('جارٍ تجهيز التطبيق لأول مرة…');
    return RT.post(RT.M.shell).then(function (s) {
      s = RT.M.shellOut(s);
      if (!s || s.length < 1000) throw new Error('لم تصل الواجهة من الخادم');
      return RT.kset('shell', s).then(function () { render(s, core); });
    });
  }).catch(function (e) {
    msg('تعذّر فتح التطبيق: ' + (e && e.message || e) + '<br><small>تأكد من الاتصال، ومن نشر الواجهة بوصول «أي شخص» مع دالة doPost.</small>', true);
  });
})();
