/* واجهة موحّدة للتطبيقين: شريط تنقل سفلي/جانبي، زر إضافة سريع، المظهر (داكن + حجم الخط)،
   حركات انتقال، سحب السطر لإظهار أزراره، قفل تلقائي، تنزيل نسخة احتياطية */
(function () {
  'use strict';
  var APP = window.APP, W = window;
  if (!APP || W.__UI_ON) return;
  W.__UI_ON = 1;
  var GH = APP.mode === 'ghadaq';
  function g(name) { try { return (0, eval)('typeof ' + name + ' !== "undefined" ? ' + name + ' : null'); } catch (e) { return null; } }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function msg(t, err) { var f = g('toast'); if (f) { try { f(t, err ? 'err' : 'ok'); return; } catch (e) { /* */ } } alert(t); }

  /* ---------- إعدادات كل تطبيق ---------- */
  var IC = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    inv: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h6"/>',
    book: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M8 8h6M8 12h6"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4a4 4 0 0 1 0 8M22 21c0-3-2-5-4-5.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    archive: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg>'; }
  var CFG = GH ? {
    color: '#0f4c5c',
    nav: function () {
      var ICO = { dash: 'home', entry: 'plus', accts: 'users', search: 'search', stmt: 'list', month: 'cal', year: 'chart', aging: 'cal', match: 'check', rcpt: 'inv', price: 'tag', cmp: 'chart', sett: 'gear', logp: 'list', arch: 'archive' };
      return Array.prototype.map.call(document.querySelectorAll('#nav button[data-p]'), function (b) { return [b.dataset.p, b.textContent.trim(), ICO[b.dataset.p] || 'list']; });
    },
    navKey: function () { return 'n' + document.querySelectorAll('#nav button[data-p]').length; },
    scroll: true,
    cur: function () { var S = g('S'); return S ? S.page : ''; },
    is: function (k, c) { return k === c; },
    open: function (k) { if (k === 'more') return moreSheet(); W.go(k); },
    entry: ['entry'],
    fab: function () { W.go('entry'); },
    header: function () { return document.querySelector('header .top .ui-hgrp'); },
    dark: function () { var S = g('S'); return !!(S && S.dark); },
    setDark: function (d) { try { W.setLook(d ? 1 : 0); } catch (e) { /* */ } },
    zoom: function () { var S = g('S'); return S ? S.zoom : 1; },
    setZoom: function (z) { try { W.setZoom(z); } catch (e) { /* */ } },
    locked: function () { var S = g('S'); return !(S && S.tok); },
    lock: function () { try { W.lockNow(); } catch (e) { /* */ } },
    backup: function () { var S = g('S'); return RT.post({ a: ['dlBackup' + (S && S.tok ? '#' + S.tok : ''), []] }).then(function (v) { return typeof v === 'string' ? JSON.parse(v) : v; }); }
  } : {
    color: '#1F4E79',
    nav: function () {
      var V = g('VIEW_SEC'), C = g('CUR'), SEC = g('SECTIONS'), sec = V && C ? V[C] : '';
      if (!sec || sec === 'x' || !SEC || !SEC[sec]) return [];
      var ICO = { inv: 'plus', pinv: 'inv', psearch: 'search', plog: 'list', items: 'tag', pprice: 'chart', sup: 'users', jentry: 'plus', daily: 'cal', jsearch: 'search', jlog: 'list',
        sentry: 'plus', sstmt: 'list', ssum: 'chart', ssup: 'users', slog: 'list', rmon: 'cal', ryear: 'chart' };
      return SEC[sec].tabs.map(function (t) { return [t[0], t[1], ICO[t[0]] || (/سجل/.test(t[1]) ? 'list' : /بحث/.test(t[1]) ? 'search' : /مورد/.test(t[1]) ? 'users' : /ملخص|تقرير/.test(t[1]) ? 'chart' : /إدخال/.test(t[1]) ? 'plus' : 'inv')]; });
    },
    navKey: function () { var V = g('VIEW_SEC'), C = g('CUR'); return V && C ? (V[C] || '') : ''; },
    scroll: true,
    cur: function () { return g('CUR') || ''; },
    is: function (k, c) { return k === c; },
    open: function (k) { W.go(k); },
    entry: ['inv', 'jentry', 'sentry'],
    fab: function () {
      sheet('إضافة سريعة', [['🧾 فاتورة شراء', function () { W.go('inv'); }], ['📒 حركة يومية', function () { W.go('jentry'); }], ['👤 قيد مورد', function () { W.go('sentry'); }]]);
    },
    header: function () { return document.querySelector('header .hb'); },
    dark: function () { var v = ls('safa_dark'); return v === null ? !!(W.matchMedia && W.matchMedia('(prefers-color-scheme: dark)').matches) : v === '1'; },
    setDark: function (d) { ls('safa_dark', d ? '1' : '0'); applySafa(); },
    zoom: function () { return Number(ls('safa_zoom')) || 1; },
    setZoom: function (z) { ls('safa_zoom', String(z)); applySafa(); },
    locked: function () { return !g('TOK'); },
    lock: function () { try { W.setTok(''); W.pinGate().then(function () { W.go(g('CUR') || 'home'); }); } catch (e) { /* */ } },
    backup: function () { return RT.post({ fn: 'webDownloadBackup', args: [g('TOK') || ''] }); }
  };
  function applySafa() {
    document.documentElement.classList.toggle('ui-dark', CFG.dark());
    var z = CFG.zoom(); document.body.style.zoom = z === 1 ? '' : String(z);
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = CFG.dark() ? '#0F1720' : APP.color;
  }

  /* ---------- الأنماط ---------- */


  /* ---------- ورقة سفلية عامة ---------- */
  function sheet(title, items, html) {
    var o = el('<div class="ui-sheet"><div class="bx"><div class="gr"></div>' + (title ? '<h3>' + E(title) + '</h3>' : '') + (html || '') + '</div></div>');
    (items || []).forEach(function (it) {
      var b = el('<button class="it' + (it[2] ? ' ' + it[2] : '') + '">' + it[0] + '</button>');
      b.onclick = function () { o.remove(); it[1](); };
      o.querySelector('.bx').appendChild(b);
    });
    o.onclick = function (e) { if (e.target === o) o.remove(); };
    document.body.appendChild(o);
    return o;
  }
  function moreSheet() {
    var bs = Array.prototype.slice.call(document.querySelectorAll('#nav button'));
    sheet('كل الصفحات', bs.map(function (b) { return [E(b.textContent), function () { b.click(); }]; }));
  }

  /* ---------- شريط التنقل + زر الإضافة ---------- */
  var nav, fab;
  var NAVKEY = null;
  /* كل سحبة تنقل الشريط صفحة واحدة (مجموعة الأزرار التالية) */
  function flick(n) {
    var x0 = 0, y0 = 0, sl = 0, dx = 0, on = false, horiz = null;
    function rail() { return getComputedStyle(n).flexDirection === 'column'; }
    n.addEventListener('touchstart', function (e) {
      if (rail() || e.touches.length !== 1) { on = false; return; }
      on = true; horiz = null; dx = 0; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; sl = n.scrollLeft; n._drag = false;
    }, { passive: true });
    n.addEventListener('touchmove', function (e) {
      if (!on) return;
      var mx = e.touches[0].clientX - x0, my = e.touches[0].clientY - y0;
      if (horiz === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) horiz = Math.abs(mx) > Math.abs(my);
      if (!horiz) return;
      e.preventDefault(); dx = mx; n._drag = Math.abs(dx) > 6;
      n.style.scrollSnapType = 'none'; n.style.scrollBehavior = 'auto'; n.scrollLeft = sl - dx;
    }, { passive: false });
    n.addEventListener('touchend', function () {
      if (!on) return; on = false;
      if (horiz && Math.abs(dx) > 25) {
        /* صفحة واحدة لكل سحبة: تنتقل بمقدار الأزرار الظاهرة على الشاشة */
        var bw = (n.querySelector('button') || {}).offsetWidth || 76, page = Math.max(1, Math.floor(n.clientWidth / bw) - 1) * bw;
        n.scrollTo({ left: sl - (dx > 0 ? 1 : -1) * page, behavior: 'smooth' });
      }
      setTimeout(function () { n.style.scrollSnapType = ''; }, 600);
      if (!n._drag) return; setTimeout(function () { n._drag = false; }, 400);
    });
  }
  function fixVp() {
    var ms = document.querySelectorAll('meta[name=viewport]'), want = 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover';
    if (!ms.length) { var m = document.createElement('meta'); m.name = 'viewport'; document.head.appendChild(m); ms = [m]; }
    Array.prototype.forEach.call(ms, function (m) { if (m.content !== want) m.content = want; });
  }
  fixVp();
  document.addEventListener('focusout', function (e) {
    var t = e.target; if (!t || !/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
    var vv = W.visualViewport; if (!vv || vv.scale <= 1.01) return;
    var m = document.querySelector('meta[name=viewport]'); if (!m) return;
    var c = m.content; m.content = c + ', user-scalable=0'; setTimeout(function () { m.content = c; }, 300);
  }, true);
  function buildNav() {
    if (!nav || !document.documentElement.contains(nav)) {
      nav = el('<div class="ui-bnav' + (CFG.scroll ? ' sc' : '') + '"></div>');
      nav.addEventListener('click', function (e) { if (nav._drag) { nav._drag = false; e.stopPropagation(); e.preventDefault(); return; } var b = e.target.closest('button'); if (b) CFG.open(b.dataset.k); }, true);
      if (CFG.scroll) flick(nav);
      document.documentElement.appendChild(nav);
      NAVKEY = null;
    }
    /* الزر العائم أُلغي بطلب المستخدم */
    sync();
  }
  function fillNav() {
    var key = CFG.navKey ? CFG.navKey() : 'all';
    if (key === NAVKEY && nav.children.length) return;
    NAVKEY = key; nav._on = null;
    var items = typeof CFG.nav === 'function' ? CFG.nav() : CFG.nav;
    nav.innerHTML = items.map(function (n) { return '<button data-k="' + n[0] + '">' + svg(n[2]) + '<span>' + n[1] + '</span></button>'; }).join('');
    var show = items.length > 0;
    nav.style.display = show ? '' : 'none';
    document.body.classList.toggle('ui-has-nav', show);
    document.body.classList.toggle('ui-no-nav', !show);
  }
  function navH() {
    if (!nav) return;
    var land = false;
    var h = nav.style.display === 'none' || land ? 0 : Math.ceil(nav.getBoundingClientRect().height);
    if (h && document.documentElement.style.getPropertyValue('--ui-nh') !== h + 'px') document.documentElement.style.setProperty('--ui-nh', h + 'px');
    var bar = GH ? null : document.querySelector('main .bar'), bh = 0;
    if (bar && getComputedStyle(bar).position === 'fixed' && getComputedStyle(bar).display !== 'none') bh = Math.ceil(bar.getBoundingClientRect().height);
    if (document.documentElement.style.getPropertyValue('--ui-bh') !== bh + 'px') document.documentElement.style.setProperty('--ui-bh', bh + 'px');
    { var hd = document.querySelector('header'), hb = hd ? getComputedStyle(hd).backgroundColor : ''; if (hb && hb !== 'rgba(0, 0, 0, 0)' && document.documentElement.style.getPropertyValue('--ui-hb') !== hb) document.documentElement.style.setProperty('--ui-hb', hb); }
  }
  W.addEventListener('resize', function () { setTimeout(navH, 100); });
  function sync() {
    if (!nav) return;
    fillNav(); navH();
    var c = CFG.cur(), raw = GH ? c : g('CUR');
    Array.prototype.forEach.call(nav.querySelectorAll('button'), function (b) { b.classList.toggle('on', CFG.is(b.dataset.k, c)); });
    var on = nav.querySelector('button.on'); if (CFG.scroll && on && on !== nav._on) { nav._on = on; try { on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); } catch (e) { /* */ } }
    if (fab) fab.classList.toggle('hide', CFG.entry.indexOf(raw) > -1 || !!document.getElementById('pin'));
  }

  /* ---------- زر المظهر في الرأس ---------- */
  /* رأس مكتبة الصفاء المضغوط: أزرار بأيقونات فقط في الشاشات الصغيرة حتى يظهر العنوان كاملًا */
  var HIC = {
    ref: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v5h-5"/>',
    home: IC.home,
    set: IC.gear
  };
  /* توحيد رأس يومية غدق مع مكتبة الصفاء: تحديث، مشاركة، Aa، الإعدادات، الرئيسية */
  function hbtn(k, lb, fn) {
    var b = el('<button type="button" class="ui-hbtn ui-hi" data-ui="' + k + '" title="' + lb + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + HIC[k] + '</svg>' + (k === 'set' ? '' : '<span class="ui-lb">' + lb + '</span>') + '</button>');
    b.onclick = fn; return b;
  }
  function tidyGh() {
    var top = document.querySelector('header .top'); if (!top || top.querySelector('.ui-hgrp')) return;
    var grp = el('<div class="ui-hgrp"></div>');
    var old = top.querySelector('button[onclick*="go(S.page)"]');
    grp.appendChild(hbtn('ref', 'تحديث', function () { var S = g('S'); W.go(S ? S.page : 'dash'); }));
    grp.appendChild(hbtn('set', 'الإعدادات', function () { W.go('sett'); }));
    grp.appendChild(hbtn('home', 'الرئيسية', function () { W.go('dash'); }));
    Array.prototype.forEach.call(top.querySelectorAll(':scope > .ui-hbtn'), function (b) { b.remove(); });
    if (old) old.remove();
    top.appendChild(grp);
    ghHome();
  }
  function ghHome() { var b = document.querySelector('.ui-hgrp [data-ui="home"]'), S = g('S'); if (b) b.classList.toggle('hide', !S || S.page === 'dash'); }
  function tidyHeader() {
    if (GH) return tidyGh();
    var h = CFG.header(); if (!h) return;
    Array.prototype.forEach.call(h.querySelectorAll('button'), function (b) {
      if (b.dataset.ui) return;
      var oc = b.getAttribute('onclick') || '', k = /refreshView/.test(oc) ? 'ref' : b.id === 'homeBtn' ? 'home' : /settings/.test(oc) ? 'set' : '';
      if (!k) return;
      b.dataset.ui = k;
      var lb = k === 'ref' ? 'تحديث' : k === 'home' ? 'الرئيسية' : 'الإعدادات';
      b.title = lb;
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + HIC[k] + '</svg>' + (k === 'set' ? '' : '<span class="ui-lb">' + lb + '</span>');
    });
  }
  function headerBtn() {
    tidyHeader(); if (GH) ghHome();
    var h = CFG.header(); if (!h || h.querySelector('.ui-aa')) return;
    var b = el('<button class="ui-hbtn ui-aa" title="المظهر والإعدادات">Aa</button>');
    b.onclick = lookSheet;
    if (GH) h.insertBefore(b, h.querySelector('[data-ui="set"]')); else { var hb = document.getElementById('homeBtn'); h.insertBefore(b, hb ? hb.previousElementSibling || hb : null); }
  }
  var LOCKM = Number(ls('ui_lock') || 10);
  function lookSheet() {
    var z = [[0.9, 'صغير'], [1, 'عادي'], [1.12, 'كبير'], [1.25, 'كبير جدًا']], d = CFG.dark(), cz = CFG.zoom();
    var o = sheet('المظهر والإعدادات', [], '<div class="rw"><b>الوضع</b><span class="ui-seg"><button data-d="0" class="' + (d ? '' : 'on') + '">☀️ فاتح</button><button data-d="1" class="' + (d ? 'on' : '') + '">🌙 داكن</button></span></div>' +
      '<div class="rw"><b>حجم الخط</b><span class="ui-seg">' + z.map(function (q) { return '<button data-z="' + q[0] + '" class="' + (cz === q[0] ? 'on' : '') + '">' + q[1] + '</button>'; }).join('') + '</span></div>' +
      '<div class="rw"><b>القفل التلقائي</b><span class="ui-seg">' + [[5, '5 د'], [10, '10 د'], [30, '30 د'], [0, 'إيقاف']].map(function (q) { return '<button data-l="' + q[0] + '" class="' + (LOCKM === q[0] ? 'on' : '') + '">' + q[1] + '</button>'; }).join('') + '</span></div>' +
      '<div class="rw" style="border:0"><b>نسخة احتياطية على هذا الجهاز</b><button class="ui-hbtn" data-bk="1" style="background:var(--ui)">⬇︎ تنزيل</button></div>' +
      '<div style="color:#8796A5;font-size:12.5px">القفل التلقائي يطلب رمز الدخول بعد مدة بلا استخدام (إذا كان الرمز مفعّلًا).</div>');
    o.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.d) { CFG.setDark(b.dataset.d === '1'); o.remove(); lookSheet(); }
      else if (b.dataset.z) { CFG.setZoom(Number(b.dataset.z)); o.remove(); lookSheet(); }
      else if (b.dataset.l) { LOCKM = Number(b.dataset.l); ls('ui_lock', String(LOCKM)); o.remove(); lookSheet(); }
      else if (b.dataset.bk) { o.remove(); backup(); }
    });
  }

  /* ---------- النسخة الاحتياطية على الجهاز ---------- */
  function backup() {
    if (!navigator.onLine) { msg('تنزيل النسخة يحتاج اتصالًا بالإنترنت', true); return; }
    var w = sheet('', [], '<div style="text-align:center;padding:16px"><b>جارٍ تجهيز النسخة الاحتياطية…</b><br><span style="color:#8796A5">قد يستغرق ذلك دقيقة</span></div>');
    CFG.backup().then(function (r) {
      w.remove();
      if (!r || !r.files || !r.files.length) { msg((r && r.msg) || 'تعذّر تجهيز النسخة', true); return; }
      sheet('النسخة الاحتياطية جاهزة', r.files.map(function (f) {
        return ['⬇︎ ' + E(f.name), function () {
          var bin = atob(f.b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          var url = URL.createObjectURL(new Blob([u], { type: f.mime || 'application/octet-stream' })), a = document.createElement('a');
          a.href = url; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        }];
      }), '<div style="color:#8796A5;font-size:13px;margin-bottom:10px">اضغط على الملف لتنزيله، ثم اختر «حفظ في الملفات» لحفظه على الجهاز.</div>');
    }, function (e) { w.remove(); msg('تعذّر تجهيز النسخة: ' + (e && e.message || e), true); });
  }

  /* ---------- القفل التلقائي ---------- */
  var LAST = Date.now();
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (t) { W.addEventListener(t, function () { LAST = Date.now(); }, { passive: true, capture: true }); });
  function lockCheck() {
    if (!LOCKM || CFG.locked() || document.getElementById('pin')) { LAST = Date.now(); return; }
    if (Date.now() - LAST > LOCKM * 60000) { LAST = Date.now(); CFG.lock(); }
  }
  setInterval(lockCheck, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) lockCheck(); });

  /* ---------- حركة انتقال عند تبديل الصفحة ---------- */
  function animView() {
    var v = document.getElementById('view'); if (!v) return;
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) if (ms[i].target === v && ms[i].addedNodes.length > 1) { v.classList.remove('ui-in'); void v.offsetWidth; v.classList.add('ui-in'); break; }
    }).observe(v, { childList: true });
  }

  /* ---------- سحب السطر لليسار لإظهار أزراره ---------- */
  var SW = null;
  document.addEventListener('touchstart', function (e) {
    var tr = e.target.closest && e.target.closest('tr');
    if (!tr || e.touches.length !== 1 || !tr.querySelector('button')) { SW = null; return; }
    var sc = tr.closest('.tw') || tr.closest('table').parentElement;
    SW = { tr: tr, x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, lock: 0, sc: sc, sl: sc ? sc.scrollLeft : 0, can: sc ? sc.scrollWidth > sc.clientWidth + 4 : false };
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (!SW) return;
    var dx = e.touches[0].clientX - SW.x, dy = e.touches[0].clientY - SW.y;
    if (!SW.lock) SW.lock = Math.abs(dx) > 12 ? (Math.abs(dx) > Math.abs(dy) * 1.5 ? 1 : -1) : 0;
    if (SW.lock !== 1 || SW.can) return;
    SW.dx = dx; SW.tr.classList.add('ui-sw'); SW.tr.style.transform = 'translateX(' + Math.max(-90, Math.min(0, dx)) + 'px)';
  }, { passive: true });
  document.addEventListener('touchend', function () {
    if (!SW) return;
    var s = SW; SW = null;
    s.tr.style.transform = '';
    if (s.lock === 1 && s.dx < -60 && !s.can && (!s.sc || s.sc.scrollLeft === s.sl)) {
      var bs = Array.prototype.slice.call(s.tr.querySelectorAll('button')).filter(function (b) { return b.offsetParent && !b.disabled && b.textContent.trim(); });
      if (!bs.length) return;
      var t = (s.tr.querySelector('td.l,td.t') || s.tr.querySelector('td') || {}).textContent || '';
      sheet(t.trim().slice(0, 60), bs.map(function (b) { return [E(b.textContent.trim()), function () { b.click(); }, /حذف/.test(b.textContent) ? 'red' : '']; }));
    }
  });

  /* ---------- حذف بدون نافذة تأكيد (التراجع متاح لثوانٍ بعده) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button');
    if (!b) return;
    setTimeout(function () { if (/^تأكيد (الحذف|حذف)/.test((b.textContent || '').trim()) && !b.disabled) b.click(); }, 0);
  });
  if (GH) {
    var tryDel = setInterval(function () {
      if (typeof W.doDel === 'function' && typeof W.delM === 'function' && !W.delM.__ui) { var f = function (i) { W.doDel(i); }; f.__ui = 1; W.delM = f; clearInterval(tryDel); }
    }, 500);
  }

  /* ---------- التشغيل ---------- */
  function start() {
    if (!GH) applySafa();
    buildNav(); headerBtn(); animView();
    if (typeof W.go === 'function' && !W.go.__ui) {
      var og = W.go, ng = function () { var r = og.apply(this, arguments); setTimeout(function () { sync(); headerBtn(); }, 0); return r; };
      ng.__ui = 1; W.go = ng;
    }
    setInterval(function () { sync(); headerBtn(); fixVp(); if (nav && !document.documentElement.contains(nav)) { nav = null; buildNav(); } }, 1500);
    if (!GH && W.matchMedia) { try { W.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (ls('safa_dark') === null) applySafa(); }); } catch (e) { /* */ } }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  else setTimeout(start, 0);
})();
