/* مكتبة الصفاء / يومية غدق — تشغيل دون اتصال + مزامنة
   - يحفظ صفحة الواجهة نفسها في الجهاز فتفتح حتى دون إنترنت
   - يحفظ آخر نتيجة لكل صفحة عرض، ويعرضها دون اتصال
   - الإدخالات الجديدة دون اتصال تُحفظ في الجهاز وتُرسل تلقائيًا عند عودة الإنترنت */
(function () {
  'use strict';
  var APP = window.APP;
  if (!APP) return;
  var W = window;
  /* بعد عرض الواجهة تعمل نسخة واحدة فقط من هذا الملف */
  var GEN = W.__RT_GEN = (W.__RT_GEN || 0) + 1;
  function live() { return GEN === W.__RT_GEN; }
  /* متغيرات الواجهة المعرّفة بـ const ليست على window، نقرؤها من النطاق العام */
  function gS() { try { return (0, eval)('typeof S !== "undefined" ? S : null'); } catch (e) { return null; } }

  /* ---------- تخزين IndexedDB بسيط ---------- */
  var DBP = null;
  function db() {
    if (DBP) return DBP;
    DBP = new Promise(function (res, rej) {
      var r = indexedDB.open('rt_' + APP.id, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return DBP;
  }
  function kget(k) { return db().then(function (d) { return new Promise(function (res) { var q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(undefined); }; }); }).catch(function () { return undefined; }); }
  function kset(k, v) { return db().then(function (d) { return new Promise(function (res) { var t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = function () { res(); }; t.onerror = function () { res(); }; }); }).catch(function () {}); }
  function sha(s) {
    try { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }); }
    catch (e) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Promise.resolve('h' + h); }
  }

  /* ---------- الاتصال بالخادم ---------- */
  function post(body) {
    return fetch(APP.exec, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new TypeError('HTTP ' + r.status); return r.text(); })
      .then(function (t) {
        var j; try { j = JSON.parse(t); } catch (e) { throw new TypeError('رد غير متوقع من الخادم — تأكد من نشر الواجهة بوصول «أي شخص»'); }
        if (j && j.err !== undefined) { var er = new Error(j.err); er.app = true; throw er; }
        return j ? j.v : j;
      });
  }
  function netErr(e) { return !(e && e.app); }

  /* ---------- وصف العمليات لكل تطبيق ---------- */
  var M = APP.mode === 'ghadaq' ? {
    parse: function (a) { var n = String(a[0] || ''), h = n.indexOf('#'); return { fn: h > -1 ? n.slice(0, h) : n, tok: h > -1 ? n.slice(h + 1) : '', args: a[1] || [] }; },
    body: function (c, a) { return { a: a }; },
    retok: function (a, tok) { var n = String(a[0] || ''), h = n.indexOf('#'); a = a.slice(); a[0] = (h > -1 ? n.slice(0, h) : n) + (tok ? '#' + tok : ''); return a; },
    shell: { a: ['shell', []] },
    shellOut: function (v) { return typeof v === 'string' ? JSON.parse(v) : v; },
    ok: function (v) { try { var o = typeof v === 'string' ? JSON.parse(v) : v; return o && o.ok === false ? (o.msg || 'خطأ') : ''; } catch (e) { return ''; } },
    writes: ['add', 'update', 'remove', 'newAccount', 'archive', 'unarchive', 'saveSettings', 'upload', 'undo', 'flush', 'renameAcc', 'closeAcc',
      'saveOrder', 'mergeAcc', 'savePT', 'rescanPT', 'coSave', 'pinSet', 'pinOff', 'lockNow', 'backupNow', 'mailNow'],
    nocache: [],
    prefetch: function () { var S = gS(); return ((S && S.acc) || []).map(function (x) { return ['account', [x.name]]; }); },
    offline: {
      add: function (e) { return JSON.stringify({ ok: true, offline: true, mirror: !!(e && e.mirror) }); }
    }
  } : {
    parse: function (a) { var args = (a[1] || []).slice(), tok = args.length ? args.pop() : ''; return { fn: String(a[0] || ''), tok: tok, args: args }; },
    body: function (c, a) { return { fn: a[0], args: a[1] || [] }; },
    retok: function (a, tok) { var args = (a[1] || []).slice(); args[args.length - 1] = tok; return [a[0], args]; },
    shell: { fn: 'webShell', args: [''] },
    shellOut: function (v) { return v; },
    ok: function (v) { return v && v.ok === false ? (v.msg || 'خطأ') : ''; },
    prefetch: function () { return []; },
    writes: ['webSaveInvoice', 'webSaveJournal', 'webJUpdate', 'webJDelete', 'webPUpdate', 'webPDelete', 'webAddItem', 'webFillCodes', 'webAddSupplier',
      'webSupSaveEntry', 'webSupDeleteEntry', 'webSupSaveSupplier', 'webSupDeleteSupplier', 'webInvReplace', 'webInvDelete', 'webInvAttach',
      'webSaveSettings', 'webSetPin', 'webBackupNow', 'webAutoBackup', 'webSetRate', 'webSetGeminiKey'],
    nocache: ['webPdf', 'webInvPdf', 'webSupPdf', 'webInvExtract', 'webAiState', 'webPFindPdf'],
    offline: {
      webSaveJournal: function (p) {
        return { ok: true, offline: true, msg: '📴 حُفظت دون اتصال، وستُرسل تلقائيًا عند عودة الإنترنت', bal: (W.B && W.B.bal) || { cash: 0, due: 0 } };
      },
      webSaveInvoice: function (p) {
        return { ok: true, offline: true, key: '', msg: '📴 حُفظت الفاتورة دون اتصال، وستُرسل تلقائيًا عند عودة الإنترنت' };
      },
      webSupSaveEntry: function (rec) {
        if (rec && rec.id) return null; /* تعديل قيد قديم يحتاج اتصالًا */
        return kget('lastSup').then(function (d) {
          d = d ? JSON.parse(d) : { suppliers: [], entries: [], audit: [] };
          var k = Number(rec.rate) > 0 && rec.cur ? Number(rec.rate) : 1;
          d.entries.push({ id: 'offline|' + Date.now(), sid: rec.sid, date: rec.date, desc: (rec.desc || '') + ' (بانتظار المزامنة)', inc: (Number(rec.inc) || 0) * k, out: (Number(rec.out) || 0) * k,
            method: rec.method || '', link: 'OFFLINE', cur: rec.cur || '', rate: Number(rec.rate) || 0 });
          return d;
        });
      }
    }
  };
  function isWrite(fn) { return M.writes.indexOf(fn) > -1; }

  /* ---------- صندوق الإرسال (العمليات المنتظرة) ---------- */
  var OUT = [], LASTTOK = '', SYNCING = false;
  var ready = kget('outbox').then(function (v) { OUT = v ? JSON.parse(v) : []; badge(); });
  function saveOut() { badge(); return kset('outbox', JSON.stringify(OUT)); }

  var DELS = APP.mode === 'ghadaq' ? ['remove'] : ['webJDelete', 'webPDelete', 'webInvDelete', 'webSupDeleteEntry', 'webSupDeleteSupplier'];
  function call(a, now) {
    var c0 = M.parse(a);
    if (!now && DELS.indexOf(c0.fn) > -1) return undoWait().then(function () { return call(a, true); });
    var c = c0;
    if (c.tok) LASTTOK = c.tok;
    var keyP = sha(c.fn + '|' + JSON.stringify(c.args));
    if (isWrite(c.fn)) {
      if (c.args[0] && typeof c.args[0] === 'object' && M.offline[c.fn] && !c.args[0].__oid) c.args[0].__oid = APP.id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      var a2 = a; /* الكائن نفسه داخل a صار يحمل __oid لمنع التكرار عند إعادة الإرسال */
      if (!navigator.onLine && M.offline[c.fn]) return queue(c, a2);
      return post(M.body(c, a2)).then(function (v) { afterWrite(c.fn, v); return v; }, function (e) {
        if (netErr(e) && M.offline[c.fn]) return queue(c, a2);
        throw netErr(e) ? offErr() : e;
      });
    }
    if (M.nocache.indexOf(c.fn) > -1) return post(M.body(c, a)).catch(function (e) { throw netErr(e) ? offErr() : e; });
    var fromCache = function (e) {
      return keyP.then(function (k) { return kget('c|' + k); }).then(function (v) {
        if (v === undefined) throw netErr(e) ? new Error('📴 لا يوجد اتصال، ولم تُفتح هذه الصفحة من قبل على هذا الجهاز.') : e;
        offline(true);
        return JSON.parse(v);
      });
    };
    if (!navigator.onLine) return fromCache(new TypeError('offline'));
    return post(M.body(c, a)).then(function (v) {
      offline(false);
      keyP.then(function (k) { kset('c|' + k, JSON.stringify(v === undefined ? null : v)); });
      if (c.fn === 'webSupLoad') kset('lastSup', JSON.stringify(v));
      return v;
    }, function (e) { if (!netErr(e)) throw e; return fromCache(e); });
  }
  function afterWrite(fn, v) {
    if (fn.indexOf('webSup') === 0 && v && v.entries) kset('lastSup', JSON.stringify(v));
  }
  function offErr() { return new Error('📴 هذه العملية تحتاج اتصالًا بالإنترنت. حاول بعد عودة الاتصال.'); }
  function queue(c, a) {
    var r = M.offline[c.fn](c.args[0]);
    return Promise.resolve(r).then(function (res) {
      if (res === null) throw offErr();
      return ready.then(function () {
        OUT.push({ a: a, fn: c.fn, at: Date.now(), d: label(c) });
        saveOut(); offline(true);
        return res;
      });
    });
  }
  function label(c) {
    var p = c.args[0] || {};
    if (c.fn === 'webSaveInvoice') return 'فاتورة ' + (p.invoice || '') + ' — ' + (p.supplier || '');
    if (c.fn === 'webSaveJournal') return 'يومية ' + (p.date || '') + ' (' + ((p.lines || []).length) + ' سطر)';
    if (c.fn === 'webSupSaveEntry') return 'قيد ' + (p.sid || '') + ' ' + (p.date || '');
    return c.fn;
  }

  /* ---------- المزامنة ---------- */
  function sync() {
    if (!live() || SYNCING || !navigator.onLine) return Promise.resolve();
    return ready.then(function () {
      if (!OUT.length) return;
      SYNCING = true; badge();
      var done = 0, failed = [];
      return (function next() {
        if (!OUT.length) return;
        var x = OUT[0], a = LASTTOK ? M.retok(x.a, LASTTOK) : x.a;
        return post(M.body(M.parse(a), a)).then(function (v) {
          var bad = M.ok(v);
          if (bad) failed.push(x.d + ': ' + bad);
          afterWrite(x.fn, v);
          OUT.shift(); done++; saveOut(); return next();
        }, function (e) {
          if (netErr(e)) throw e;
          if (/PIN_REQUIRED|LOCKED/.test(e.message)) throw e; /* ننتظر فتح القفل */
          failed.push(x.d + ': ' + e.message); OUT.shift(); saveOut(); return next();
        });
      })().then(function () { fin(done, failed); }, function () { fin(done, failed); });
    });
  }
  function fin(done, failed) {
    SYNCING = false; badge();
    if (done) {
      try { if (W.qClear) W.qClear(); } catch (e) {}
      try { var S = gS(); if (S && S.cache) { S.cache = {}; S.pidx = null; } } catch (e) {}
      note('✅ تمت مزامنة ' + done + ' عملية', '#2E7D32');
      try { if (W.refreshView && APP.mode !== 'ghadaq') W.refreshView(); } catch (e) {}
      try { var S2 = gS(); if (APP.mode === 'ghadaq' && W.go && S2 && S2.page) W.go(S2.page); } catch (e) {}
    }
    if (failed.length) alert('تعذّر حفظ بعض العمليات المرسلة بعد عودة الاتصال، أعد إدخالها:\n\n' + failed.join('\n'));
  }

  /* ---------- شارة الحالة ---------- */
  var OFF = false;
  function offline(v) { if (OFF !== v) { OFF = v; badge(); } }
  function el() {
    var b = document.getElementById('rt-badge');
    if (!b && document.body) {
      b = document.createElement('div'); b.id = 'rt-badge';
      b.style.cssText = 'position:fixed;bottom:calc(10px + env(safe-area-inset-bottom));left:10px;z-index:9999;padding:7px 12px;border-radius:20px;font:600 13px system-ui,-apple-system,sans-serif;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.2);display:none;cursor:pointer;direction:rtl';
      b.onclick = function () { if (OUT.length) alert('بانتظار المزامنة:\n\n' + OUT.map(function (x) { return '• ' + x.d; }).join('\n')); sync(); };
      document.body.appendChild(b);
    }
    return b;
  }
  var NOTE = 0;
  function badge() {
    var b = el(); if (!b || Date.now() < NOTE) return;
    var n = OUT.length;
    if (SYNCING) { b.textContent = '⟳ جارٍ المزامنة…'; b.style.background = '#1565C0'; }
    else if (n) { b.textContent = '📴 بانتظار المزامنة: ' + n; b.style.background = '#EF6C00'; }
    else if (OFF || !navigator.onLine) { b.textContent = '📴 دون اتصال — تعرض آخر نسخة محفوظة'; b.style.background = '#546E7A'; }
    else { b.style.display = 'none'; return; }
    b.style.display = 'block';
  }
  function note(t, c) { var b = el(); if (!b) return; b.textContent = t; b.style.background = c; b.style.display = 'block'; NOTE = Date.now() + 4000; setTimeout(function () { NOTE = 0; badge(); }, 4100); }

  /* ---------- التراجع عن الحذف: الحذف يُنفَّذ بعد 5 ثوانٍ إلا إذا ضغطت «تراجع» ---------- */
  function undoWait() {
    return new Promise(function (res, rej) {
      var old = document.getElementById('rt-undo'); if (old) old.remove();
      var n = 5, b = document.createElement('div'); b.id = 'rt-undo';
      b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom));z-index:9995;background:#1F2933;color:#fff;border-radius:14px;padding:10px 12px 10px 16px;display:flex;align-items:center;gap:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);font:700 15px Cairo,system-ui,sans-serif;direction:rtl;white-space:nowrap';
      b.innerHTML = '<span>🗑 سيتم الحذف خلال <b id="rt-un">5</b> ث</span><button style="border:0;border-radius:10px;background:#FFB74D;color:#1F2933;font:800 15px Cairo,system-ui,sans-serif;padding:8px 16px">تراجع</button>';
      document.body.appendChild(b);
      var t = setInterval(function () { n--; var x = document.getElementById('rt-un'); if (x) x.textContent = n; if (n <= 0) { clearInterval(t); b.remove(); res(); } }, 1000);
      b.querySelector('button').onclick = function () { clearInterval(t); b.remove(); var e = new Error('↩︎ تم التراجع، لم يُحذف شيء'); e.app = true; e.undo = true; rej(e); };
    });
  }

  /* ---------- سجل الأخطاء: يُرسل تلقائيًا إلى الملف لتشخيصه ---------- */
  var ERRN = 0, ERRS = {};
  function logErr(kind, m, extra) {
    try {
      m = String(m || '').slice(0, 500);
      if (!m || ERRS[m] || ERRN > 15 || !navigator.onLine || /PIN_REQUIRED|LOCKED|تم التراجع|Failed to fetch|NetworkError|Load failed|اتصال/.test(m)) return;
      ERRS[m] = 1; ERRN++;
      var S = gS(), view = APP.mode === 'ghadaq' ? (S && S.page) : (W.CUR || '');
      var rec = { app: APP.id, kind: kind, msg: m, extra: String(extra || '').slice(0, 1500), view: String(view || ''), ua: navigator.userAgent.slice(0, 200), at: new Date().toISOString() };
      post(APP.mode === 'ghadaq' ? { a: ['logErr', [rec]] } : { fn: 'webLogError', args: [rec] }).catch(function () {});
    } catch (e) { /* */ }
  }
  W.addEventListener('error', function (e) { if (live()) logErr('js', e.message, (e.filename || '') + ':' + (e.lineno || '') + ' ' + (e.error && e.error.stack || '')); });
  W.addEventListener('unhandledrejection', function (e) { if (live()) { var r = e.reason; logErr('promise', r && r.message || r, r && r.stack); } });

  /* ---------- بديل google.script.run ---------- */
  function runner(ok, fail) {
    return new Proxy({}, {
      get: function (t, k) {
        if (k === 'withSuccessHandler') return function (h) { return runner(h, fail); };
        if (k === 'withFailureHandler') return function (h) { return runner(ok, h); };
        if (k === 'withUserObject') return function () { return runner(ok, fail); };
        return function () {
          var a = Array.prototype.slice.call(arguments);
          call(a).then(function (v) { if (ok) ok(v); }, function (e) { if (e && e.app && !e.undo) logErr('server', e.message, String(a[0]).split('#')[0]); if (fail) fail(e); else console.error(e); });
        };
      }
    });
  }
  W.google = W.google || {};
  W.google.script = { run: runner(null, null), host: { close: function () {}, setHeight: function () {}, setWidth: function () {}, editor: { focus: function () {} } } };

  /* ---------- تشغيل ---------- */
  W.addEventListener('online', function () { if (live()) { offline(false); setTimeout(sync, 1500); } });
  W.addEventListener('offline', function () { if (live()) offline(true); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) sync(); });
  setInterval(function () { if (live() && OUT.length) sync(); }, 30000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { badge(); setTimeout(sync, 3000); });
  else { badge(); setTimeout(sync, 3000); }

  /* تحديث صفحة الواجهة نفسها: تُحفظ النسخة الجديدة وتُطبَّق تلقائيًا عند العودة للتطبيق */
  var SHELLNEW = false, SHELLAT = 0;
  function checkShell() {
    if (!live() || !navigator.onLine || Date.now() - SHELLAT < 300000) return;
    SHELLAT = Date.now();
    post(M.shell).then(function (s) {
      s = M.shellOut(s);
      if (!s || s.length < 1000) return;
      return kget('shell').then(function (old) { if (old !== s) return kset('shell', s).then(function () { if (old) SHELLNEW = true; }); });
    }).catch(function () {});
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    if (SHELLNEW && !OUT.length && !(document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))) { location.reload(); return; }
    checkShell();
  });
  setTimeout(checkShell, 6000);

  /* تحميل مسبق للحسابات/الصفحات لتعمل دون اتصال */
  var PFAT = 0;
  function prefetch() {
    if (!live() || !navigator.onLine || Date.now() - PFAT < 600000) return;
    var list = M.prefetch(); if (!list.length) return;
    PFAT = Date.now();
    var i = 0;
    (function next() {
      if (i >= list.length || !navigator.onLine) return;
      var x = list[i++];
      call(M.retok([x[0], x[1].concat(APP.mode === 'ghadaq' ? [] : [''])], LASTTOK)).then(function () { setTimeout(next, 400); }, function () { setTimeout(next, 400); });
    })();
  }
  setTimeout(prefetch, 9000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(prefetch, 3000); });

  /* ---------- تأكيد الخروج عند زر الرجوع ---------- */
  var LEAVING = false;
  function exitBox() {
    if (document.getElementById('rt-exit')) return;
    var n = OUT.length, o = document.createElement('div'); o.id = 'rt-exit';
    o.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,32,.5);display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;font-family:system-ui,-apple-system,sans-serif';
    o.innerHTML = '<div style="background:#fff;border-radius:16px;max-width:360px;width:100%;padding:22px 20px 16px;box-shadow:0 20px 50px rgba(0,0,0,.3);text-align:center">' +
      '<div style="font-size:19px;font-weight:700;margin-bottom:8px">الخروج من ' + (APP.short || 'التطبيق') + '؟</div>' +
      '<div style="color:#555;font-size:15px;line-height:1.7;margin-bottom:16px">' + (n ? '⚠︎ لديك ' + n + ' عملية بانتظار المزامنة، وستُرسل عند فتح التطبيق مع الإنترنت.' : 'هل تريد الخروج من التطبيق؟') + '</div>' +
      '<div style="display:flex;gap:10px"><button id="rt-stay" style="flex:1;min-height:46px;border:0;border-radius:11px;background:' + (APP.color || '#1F4E79') + ';color:#fff;font:700 16px inherit">البقاء</button>' +
      '<button id="rt-go" style="flex:1;min-height:46px;border:1px solid #ccc;border-radius:11px;background:#fff;color:#B00020;font:700 16px inherit">خروج</button></div></div>';
    document.body.appendChild(o);
    document.getElementById('rt-stay').onclick = function () { o.remove(); history.pushState({ rt: 1 }, ''); };
    document.getElementById('rt-go').onclick = function () { LEAVING = true; o.remove(); history.back(); setTimeout(function () { try { window.close(); } catch (e) { /* */ } }, 300); };
  }
  function armBack() { try { if (!history.state || !history.state.rt) history.pushState({ rt: 1 }, ''); } catch (e) { /* */ } }
  W.addEventListener('popstate', function () {
    if (!live() || LEAVING || !document.body) return;
    /* نافذة مفتوحة: الرجوع يغلقها */
    var ov = document.querySelector('.ui-sheet,#dpop,#aikey');
    if (ov) { ov.remove(); document.body.style.overflow = ''; history.pushState({ rt: 1 }, ''); return; }
    /* مكتبة الصفاء: من داخل أي قسم يعود الرجوع إلى الرئيسية */
    if (APP.mode !== 'ghadaq' && W.CUR && W.CUR !== 'home' && typeof W.go === 'function') { history.pushState({ rt: 1 }, ''); W.go('home'); return; }
    exitBox();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', armBack); else setTimeout(armBack, 0);

  W.RT = { call: call, sync: sync, kget: kget, kset: kset, post: post, M: M };
})();
