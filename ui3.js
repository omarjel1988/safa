/* إضافات الواجهة (3): التذكير اليومي، قوالب القيود، البحث الموحّد، المفضلة، أعمار الأرصدة، تصوير المرفقات،
   تنبيه ارتفاع السعر، المقارنة بالعام الماضي، كشف مورد مختصر للواتساب */
(function () {
  'use strict';
  var APP = window.APP, W = window;
  if (!APP || W.__UI3_ON) return;
  W.__UI3_ON = 1;
  var GH = APP.mode === 'ghadaq';
  function g(name) { try { return (0, eval)('typeof ' + name + ' !== "undefined" ? ' + name + ' : null'); } catch (e) { return null; } }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function msg(t, err) { var f = g('toast'); try { if (f) return GH ? f(t, err ? 1 : 0) : f(t, err ? 'err' : 'ok'); } catch (e) { /* */ } alert(t); }
  function sheet(title, items, html) {
    var o = el('<div class="ui-sheet"><div class="bx"><div class="gr"></div>' + (title ? '<h3>' + E(title) + '</h3>' : '') + (html || '') + '</div></div>');
    (items || []).forEach(function (it) { var b = el('<button class="it' + (it[2] ? ' ' + it[2] : '') + '">' + it[0] + '</button>'); b.onclick = function () { if (!it[3]) o.remove(); it[1](b); }; o.querySelector('.bx').appendChild(b); });
    o.onclick = function (e) { if (e.target === o) o.remove(); };
    document.body.appendChild(o); return o;
  }
  function closeSheets() { Array.prototype.forEach.call(document.querySelectorAll('.ui-sheet'), function (s) { s.remove(); }); }
  function fmt(n) { n = Number(n) || 0; return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function num(v) { var s = String(v == null ? '' : v).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[,،\s]/g, ''); var n = parseFloat(s); return isNaN(n) ? 0 : n; }
  function setVal(i, v) { if (!i) return; i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }
  /* نداء الخادم: يومية غدق عبر call (تُرجع JSON محلولًا)، والصفاء عبر call الخاصة به */
  function api(name, args) {
    var c = g('call');
    if (GH) { if (!c) return Promise.reject(new Error('غير جاهز')); return c.apply(null, [name].concat(args || [])); }
    if (!c) return Promise.reject(new Error('غير جاهز'));
    return Promise.resolve(c.apply(null, [name].concat(args || [])));
  }
  var css = document.createElement('style');
  css.textContent = [
    '.u3-bar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.u3-bar button{flex:1 1 auto;min-height:44px;border:1.5px dashed var(--ui);border-radius:12px;background:transparent;color:var(--ui);font:800 14.5px Cairo,system-ui,sans-serif;padding:6px 12px}',
    '.u3-in{width:100%;min-height:46px;font-size:16px;border:1px solid #c9d3dd;border-radius:12px;padding:8px 12px;box-sizing:border-box;margin:0 0 10px;font-family:inherit;background:#fff;color:#17212B}',
    '.u3-row{display:flex;align-items:center;gap:8px;padding:10px 4px;border-bottom:1px solid #EEF2F6}.u3-row .t{flex:1;min-width:0}.u3-row .t b{display:block}.u3-row .t small{color:#8796A5}.u3-row button{border:0;background:#F3F6F9;border-radius:10px;min-height:38px;padding:4px 12px;font:700 14px inherit;color:inherit}',
    '.u3-res{max-height:55vh;overflow:auto}.u3-res .u3-row{cursor:pointer}',
    '.u3-star{font-size:22px;background:none!important;color:#C9A227!important;min-width:44px}',
    '.u3-cam{display:inline-flex;align-items:center;gap:6px;margin-top:6px;border:1.5px solid var(--ui);color:var(--ui);background:transparent;border-radius:10px;min-height:40px;padding:4px 14px;font:800 14px Cairo,system-ui,sans-serif}',
    '.u3-thumb{display:block;max-width:140px;max-height:140px;border-radius:10px;margin-top:8px;border:1px solid #dfe5ea}',
    '.u3-ban{display:flex;flex-wrap:wrap;align-items:center;gap:10px;justify-content:space-between;background:#FFF4E5;border:1px solid #F5C58A;color:#7A4100;border-radius:14px;padding:10px 14px;margin:0 0 12px;font-weight:700}.u3-ban button{white-space:nowrap;border:0;border-radius:10px;background:#EF6C00;color:#fff;min-height:38px;padding:4px 14px;font:800 14px inherit}',
    '.u3-ly{margin-top:12px}.u3-ly .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.u3-ly .c{background:#F4F8FC;border-radius:12px;padding:10px 12px}.u3-ly .c small{display:block;color:#637082}.u3-ly .c b{font-size:18px}',
    '.u3-rise{outline:2px solid #C62828;outline-offset:2px}.u3-rb{display:inline-block;background:#C62828;color:#fff;border-radius:8px;padding:2px 8px;font-size:12.5px;font-weight:800;margin-inline-start:6px}',
    '.u3-age td.t{text-align:right}.u3-chip{display:inline-block;border-radius:10px;padding:2px 9px;font-weight:800;font-size:12.5px}.u3-chip.r{background:#fdecec;color:#9b1c1c}.u3-chip.o{background:#fff1e0;color:#9a4d00}.u3-chip.g{background:#e9f6ee;color:#1d5b33}',
    'html.ui-dark .u3-in,body.dark .u3-in{background:#0F1720;color:#E6EDF3;border-color:#2A3644}html.ui-dark .u3-row,body.dark .u3-row{border-color:#243140}html.ui-dark .u3-row button,body.dark .u3-row button{background:#1E2A36}',
    'html.ui-dark .u3-ban,body.dark .u3-ban{background:#33251a;border-color:#6b4a2c;color:#FFD9A8}html.ui-dark .u3-ly .c{background:#1E2A36}html.ui-dark .u3-ly .c small{color:#9AA7B4}',
    'body.dark .u3-chip.r{background:#3a1c1f;color:#f5c2c2}body.dark .u3-chip.o{background:#382d14;color:#f3dca0}body.dark .u3-chip.g{background:#16301f;color:#b8e6c6}body.dark .u3-thumb{border-color:#34494f}',
    'body:not(.u3x) .tiles{grid-template-columns:1fr 1fr!important;gap:10px!important}body:not(.u3x) .tile{padding:14px 13px!important;min-height:150px!important;border-radius:18px!important}body:not(.u3x) .tile b{font-size:17px!important}body:not(.u3x) .tile small{font-size:12px!important;line-height:1.5}body:not(.u3x) .tile em{font-size:11.5px!important;padding:2px 9px!important}body:not(.u3x) .tile svg{width:28px!important;height:28px!important}',
    '@media (min-width:900px){body:not(.u3x) .tiles{grid-template-columns:repeat(4,1fr)!important}}',
    '.u3-nosrch{display:none!important}.tiles + [data-u3mv]{margin-top:14px!important}',
    '@media print{.u3-bar,.u3-cam,.u3-ban{display:none!important}}'
  ].join('');
  document.head.appendChild(css);

  /* ================= 5) المفضلة ================= */
  var FK = 'fav_' + APP.id;
  function favs() { try { return JSON.parse(ls(FK) || '[]'); } catch (e) { return []; } }
  function setFavs(a) { ls(FK, JSON.stringify(a)); FSIG = ''; applyFavs(true); }
  function allNames() {
    if (GH) { var S = g('S'); return S && S.acc ? S.acc.map(function (a) { return a.name; }) : []; }
    var B = g('B'); return B && B.suppliers ? B.suppliers.slice().sort(function (a, b) { return String(a).localeCompare(String(b), 'ar'); }) : [];
  }
  var FSIG = '';
  function applyFavs(force) {
    var F = favs(), sig = F.join('|');
    FSIG = sig;
    var names = {}; allNames().forEach(function (n) { names[n] = 1; });
    Array.prototype.forEach.call(document.querySelectorAll('select'), function (s) {
      var mk = function () { return sig + '#' + s.options.length + '#' + (s.options[1] ? s.options[1].value : '') + '#' + (s.options[1] ? s.options[1].textContent.charAt(0) : ''); };
      if (s.dataset.fv === mk()) return;
      var opts = Array.prototype.slice.call(s.options), hits = opts.filter(function (o) { return names[o.value]; });
      if (hits.length < 2) { s.dataset.fv = mk(); return; }
      opts.forEach(function (o) { if (!o.hasAttribute('value')) o.setAttribute('value', o.value); var base = o.textContent.replace(/^⭐ /, ''); o.textContent = F.indexOf(o.value) > -1 ? '⭐ ' + base : base; });
      if (!F.length) { s.dataset.fv = mk(); return; }
      var cur = s.value, first = opts.filter(function (o) { return !names[o.value]; }).pop();
      var anchor = first ? first.nextSibling : s.firstChild;
      F.slice().forEach(function (n) { var o = opts.filter(function (x) { return x.value === n; })[0]; if (o) { s.insertBefore(o, anchor); anchor = o.nextSibling; } });
      s.value = cur;
      s.dataset.fv = mk();
    });
    if (GH) {
      var box = document.getElementById('cards');
      if (box && F.length) {
        var nm = function (x) { var t = x.querySelector('.n'); return t && t.firstChild ? t.firstChild.textContent.replace(/^⭐ /, '').trim() : ''; };
        var cards = Array.prototype.slice.call(box.querySelectorAll('.acc'));
        var favCards = F.map(function (n) { return cards.filter(function (x) { return nm(x) === n; })[0]; }).filter(Boolean);
        if (favCards.some(function (c) { return !c.classList.contains('u3f'); })) {
          var ref = box.firstChild;
          favCards.forEach(function (c) {
            var t = c.querySelector('.n'); if (t && t.firstChild && t.firstChild.nodeType === 3 && t.firstChild.textContent.indexOf('⭐') < 0) t.firstChild.textContent = '⭐ ' + t.firstChild.textContent;
            c.classList.add('u3f');
            if (c !== ref) box.insertBefore(c, ref);
            ref = c.nextSibling;
          });
        }
      }
    }
  }
  setInterval(applyFavs, 800);
  function favSheet() {
    var F = favs(), names = allNames();
    if (!names.length) { msg('افتح التطبيق وانتظر تحميل البيانات أولًا', 1); return; }
    var o = sheet('⭐ المفضلة', [], '<div style="color:#8796A5;font-size:13px;margin-bottom:8px">' + (GH ? 'الحسابات' : 'الموردون') + ' المميّزة بنجمة تظهر أولًا في كل القوائم' + (GH ? ' وفي بطاقات الرئيسية' : '') + '.</div>' +
      '<input class="u3-in" id="u3-fq" placeholder="بحث…" autocomplete="off"><div id="u3-fl"></div>');
    var draw = function () {
      var q = o.querySelector('#u3-fq').value.trim();
      var list = names.filter(function (n) { return !q || n.indexOf(q) > -1; });
      list.sort(function (a, b) { return (F.indexOf(a) > -1 ? 0 : 1) - (F.indexOf(b) > -1 ? 0 : 1); });
      o.querySelector('#u3-fl').innerHTML = list.map(function (n) { var on = F.indexOf(n) > -1; return '<div class="u3-row"><div class="t"><b>' + E(n) + '</b></div><button class="u3-star" data-n="' + E(n) + '">' + (on ? '★' : '☆') + '</button></div>'; }).join('');
    };
    o.querySelector('#u3-fq').oninput = draw;
    o.querySelector('#u3-fl').onclick = function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return;
      var n = b.dataset.n, i = F.indexOf(n);
      if (i > -1) F.splice(i, 1); else F.push(n);
      setFavs(F); b.textContent = i > -1 ? '☆' : '★';
      if (GH && i > -1) { var r = g('renderCards'); try { if (r) r(); } catch (er) { /* */ } }
    };
    draw();
  }

  /* ================= 2) قوالب القيود المتكررة ================= */
  var TK = 'tpl_' + APP.id, TPL = null;
  function tplLoad() {
    try { TPL = JSON.parse(ls(TK) || 'null'); } catch (e) { TPL = null; }
    return api(GH ? 'tplGet' : 'webTplGet').then(function (l) { TPL = Array.isArray(l) ? l : []; ls(TK, JSON.stringify(TPL)); return TPL; }, function () { return TPL || []; });
  }
  function tplSave(l) { TPL = l; ls(TK, JSON.stringify(l)); return api(GH ? 'tplSet' : 'webTplSet', [l]).catch(function (e) { msg('تعذّر حفظ القوالب: ' + (e && e.message || e), 1); }); }
  function formKind() {
    if (GH) return document.getElementById('nb') && document.getElementById('na') ? 'g' : '';
    var c = g('CUR'); return c === 'jentry' && document.getElementById('jlines') ? 'j' : c === 'sentry' && document.getElementById('e-desc') ? 's' : '';
  }
  function readForm(k) {
    var V = function (id) { var x = document.getElementById(id); return x ? x.value : ''; };
    if (k === 'g') return { acc: V('na'), b: V('nb'), s: V('ns'), w: V('nw') };
    if (k === 's') return { sup: V('e-sup'), desc: V('e-desc'), inc: V('e-inc'), out: V('e-out'), method: V('e-method') };
    var ln = null, ls2 = document.querySelectorAll('#jlines .line');
    for (var i = ls2.length - 1; i >= 0; i--) { var st = ls2[i].querySelector('.st'); if (st && st.value.trim()) { ln = ls2[i]; break; } }
    if (!ln) return null;
    var q = function (c) { var x = ln.querySelector(c); return x ? x.value : ''; };
    return { st: q('.st'), d: q('.d'), o: q('.o'), i: q('.i'), sp: q('.sp') };
  }
  function fillForm(k, t) {
    var S = function (id, v) { var x = document.getElementById(id); if (x && v != null && v !== '') setVal(x, v); };
    if (k === 'g') { S('na', t.acc); setTimeout(function () { S('nb', t.b); S('ns', t.s); S('nw', t.w); var x = document.getElementById('nb'); if (x) x.focus(); }, 60); return; }
    if (k === 's') { S('e-sup', t.sup); setTimeout(function () { S('e-desc', t.desc); S('e-inc', t.inc); S('e-out', t.out); S('e-method', t.method); }, 60); return; }
    var lines = document.querySelectorAll('#jlines .line'), ln = null;
    for (var i = 0; i < lines.length; i++) { var st = lines[i].querySelector('.st'); if (st && !st.value.trim()) { ln = lines[i]; break; } }
    if (!ln) { var add = g('addJLine'); if (add) { add(); lines = document.querySelectorAll('#jlines .line'); ln = lines[lines.length - 1]; } }
    if (!ln) return;
    [['.st', t.st], ['.d', t.d], ['.o', t.o], ['.i', t.i], ['.sp', t.sp]].forEach(function (p) { var x = ln.querySelector(p[0]); if (x && p[1] != null && p[1] !== '') setVal(x, p[1]); });
  }
  function tplDesc(t) {
    var a = t.f || {};
    var amt = function (o, i) { return (num(o) ? 'صادر ' + fmt(num(o)) : '') + (num(o) && num(i) ? ' · ' : '') + (num(i) ? 'وارد ' + fmt(num(i)) : ''); };
    if (t.k === 'g') return [a.acc, amt(a.s, a.w)].filter(Boolean).join(' — ');
    if (t.k === 's') return [a.sup, amt(a.out, a.inc)].filter(Boolean).join(' — ');
    return [a.sp, amt(a.o, a.i)].filter(Boolean).join(' — ');
  }
  function tplSheet() {
    var k = formKind(); if (!k) return;
    var draw = function (o, list) {
      var mine = list.map(function (t, i) { return { t: t, i: i }; }).filter(function (x) { return x.t.k === k; });
      o.querySelector('#u3-tl').innerHTML = mine.length ? mine.map(function (x) {
        return '<div class="u3-row"><div class="t" data-use="' + x.i + '" style="cursor:pointer"><b>📌 ' + E(x.t.n) + '</b><small>' + E(tplDesc(x.t)) + '</small></div><button data-del="' + x.i + '" title="حذف">🗑</button></div>';
      }).join('') : '<div style="color:#8796A5;padding:10px 0">لا توجد قوالب بعد. املأ النموذج ثم اضغط «حفظ الحالي كقالب».</div>';
    };
    var o = sheet('📌 القوالب', [], '<div id="u3-tl"><div style="color:#8796A5">جارٍ التحميل…</div></div>' +
      '<div style="display:flex;gap:8px;margin-top:12px"><input class="u3-in" id="u3-tn" placeholder="اسم القالب (مثال: إيجار المحل)" style="margin:0"><button class="it" id="u3-ts" style="width:auto;margin:0;background:var(--ui);color:#fff;white-space:nowrap">حفظ الحالي كقالب</button></div>');
    var list = TPL || [];
    draw(o, list);
    tplLoad().then(function (l) { list = l; if (document.body.contains(o)) draw(o, list); });
    o.querySelector('#u3-tl').onclick = function (e) {
      var u = e.target.closest('[data-use]'), d = e.target.closest('[data-del]');
      if (u) { var t = list[+u.dataset.use]; o.remove(); fillForm(k, t.f || {}); msg('تمت تعبئة «' + t.n + '» — راجع ثم احفظ'); return; }
      if (d) { var t2 = list[+d.dataset.del]; if (!confirm('حذف القالب «' + t2.n + '»؟')) return; list = list.filter(function (x, i) { return i !== +d.dataset.del; }); tplSave(list); draw(o, list); }
    };
    o.querySelector('#u3-ts').onclick = function () {
      var n = o.querySelector('#u3-tn').value.trim(), f = readForm(k);
      if (!n) { o.querySelector('#u3-tn').focus(); msg('اكتب اسمًا للقالب', 1); return; }
      if (!f || !(f.b || f.desc || f.st)) { msg('املأ البيان أولًا في النموذج', 1); return; }
      list = list.filter(function (x) { return !(x.k === k && x.n === n); }).concat([{ k: k, n: n, f: f }]);
      tplSave(list); draw(o, list); o.querySelector('#u3-tn').value = ''; msg('حُفظ القالب «' + n + '»');
    };
  }
  /* زر القوالب فوق نموذج الإدخال */
  function barWatch() {
    var k = formKind(); if (!k || document.getElementById('u3-tbar')) return;
    var target = null;
    if (k === 'g') { var nb = document.getElementById('nb'); target = nb && nb.closest('.form'); if (target && target.closest('#ov')) return; }
    else if (k === 'j') target = document.getElementById('jlines');
    else { var d = document.getElementById('e-desc'); target = d && d.closest('.card'); }
    if (!target) return;
    var b = el('<div class="u3-bar" id="u3-tbar"><button type="button">📌 القوالب المحفوظة</button></div>');
    b.querySelector('button').onclick = tplSheet;
    target.parentNode.insertBefore(b, target);
    if (TPL === null) tplLoad();
  }
  setInterval(barWatch, 700);

  /* ================= 4) البحث الموحّد السريع ================= */
  var ICON_S = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  function searchBtn() {
    var h = GH ? document.querySelector('header .top .ui-hgrp') : document.querySelector('header .hb');
    if (!h || h.querySelector('.u3-sbtn')) return;
    var anchor = h.querySelector('.ui-share') || h.querySelector('.ui-aa'); if (!anchor) return;
    var b = el('<button class="ui-hbtn u3-sbtn" title="بحث سريع في كل شيء">' + ICON_S + '</button>');
    b.onclick = quickSearch;
    h.insertBefore(b, anchor);
  }
  setInterval(searchBtn, 700);
  function quickSearch() {
    var o = sheet('🔍 بحث سريع في كل شيء', [], '<input class="u3-in" id="u3-sq" type="search" enterkeyhint="search" autocomplete="off" placeholder="' + (GH ? 'اسم حساب، كلمة من البيان، مبلغ، رقم سند…' : 'مورد، صنف، رقم فاتورة، بيان، مبلغ…') + '"><div class="u3-res" id="u3-sr"></div>');
    var inp = o.querySelector('#u3-sq'), res = o.querySelector('#u3-sr'), tm = 0, seq = 0;
    setTimeout(function () { inp.focus(); }, 80);
    if (!GH) {
      res.innerHTML = '<div style="color:#8796A5;font-size:13px">اكتب كلمة ثم اضغط بحث في لوحة المفاتيح. يبحث في الموردين والأصناف والفواتير واليومية وقيود الموردين.</div>';
      inp.onkeydown = function (e) {
        if (e.key !== 'Enter') return; e.preventDefault();
        var q = inp.value.trim(); if (q.length < 2) { msg('اكتب حرفين على الأقل', 1); return; }
        o.remove(); try { (0, eval)('GQ=' + JSON.stringify(q)); } catch (er) { /* */ }
        var cur = g('CUR'), v = g('vGSearch'); if (cur === 'gsearch' && v) v(); else W.go('gsearch');
      };
      return;
    }
    var run = function () {
      var q = inp.value.trim(), my = ++seq;
      if (q.length < 2) { res.innerHTML = ''; return; }
      var S = g('S'), accs = (S && S.acc || []).map(function (a, i) { return { a: a, i: i }; }).filter(function (x) { return x.a.name.indexOf(q) > -1; });
      var h = accs.length ? '<div style="font-weight:800;margin:4px 0">الحسابات</div>' + accs.slice(0, 8).map(function (x) {
        return '<div class="u3-row" data-acc="' + x.i + '"><div class="t"><b>' + E(x.a.name) + '</b><small>الرصيد ' + fmt(x.a.bal) + ' ' + E(x.a.cur || '') + '</small></div></div>';
      }).join('') : '';
      res.innerHTML = h + '<div style="color:#8796A5;padding:8px 0">جارٍ البحث في القيود…</div>';
      api('search', [{ q: q, acc: 'الكل', from: '', to: '', kind: '' }]).then(function (r) {
        if (my !== seq || !document.body.contains(o)) return;
        var rows = (r && r.rows || []).slice().sort(function (a, b) { return String(b.d).localeCompare(String(a.d)); });
        W.__U3R = rows;
        res.innerHTML = h + '<div style="font-weight:800;margin:10px 0 4px">القيود (' + rows.length + ')</div>' + (rows.length ? rows.slice(0, 60).map(function (x, i) {
          var a = typeof x.s === 'number' && x.s ? 'صادر ' + fmt(x.s) : typeof x.w === 'number' && x.w ? 'وارد ' + fmt(x.w) : '';
          return '<div class="u3-row" data-row="' + i + '"><div class="t"><b>' + E(x.b) + '</b><small>' + E(x.acc) + ' · ' + E(x.d || '') + (x.rc ? ' · سند ' + E(x.rc) : '') + '</small></div><b style="white-space:nowrap">' + a + '</b></div>';
        }).join('') + (rows.length > 60 ? '<div style="color:#8796A5;padding:8px 0">أول 60 نتيجة من ' + rows.length + '</div>' : '') : '<div style="color:#8796A5">لا توجد قيود مطابقة</div>');
      }).catch(function (e) { if (my === seq) res.innerHTML = h + '<div style="color:#C62828">' + E(e && e.message || e) + '</div>'; });
    };
    inp.oninput = function () { clearTimeout(tm); tm = setTimeout(run, 450); };
    res.onclick = function (e) {
      var a = e.target.closest('[data-acc]'), r = e.target.closest('[data-row]');
      if (a) { o.remove(); var oa = g('openAcc'); if (oa) oa(+a.dataset.acc); return; }
      if (r) {
        var x = W.__U3R[+r.dataset.row], q = inp.value.trim(); o.remove();
        var S = g('S'); if (S) S.cur = x.acc;
        W.go('accts');
        var t0 = Date.now(), iv = setInterval(function () { var f = document.getElementById('af'); if (f || Date.now() - t0 > 6000) { clearInterval(iv); if (f) setTimeout(function () { setVal(f, q); }, 300); } }, 150);
      }
    };
  }

  /* ================= 6) أعمار الأرصدة (يومية غدق) ================= */
  function agingSetup() {
    var nav = document.getElementById('nav'); if (!nav || nav.querySelector('[data-p="aging"]')) return;
    var after = nav.querySelector('[data-p="year"]') || nav.querySelector('[data-p="month"]');
    var b = el('<button data-p="aging">أعمار الأرصدة</button>');
    b.onclick = function () { W.go('aging'); };
    if (after) after.insertAdjacentElement('afterend', b); else nav.appendChild(b);
    var og = W.go;
    W.go = function (p) {
      if (p !== 'aging') return og.apply(this, arguments);
      var S = g('S'); if (S) { S.page = 'aging'; S.after = null; }
      Array.prototype.forEach.call(document.querySelectorAll('#nav button'), function (x) { x.classList.toggle('on', x.dataset.p === 'aging'); });
      W.scrollTo(0, 0);
      agingPage();
    };
  }
  function agingPage() {
    var v = document.getElementById('view'); if (!v) return;
    var hz = ls('u3_age_z') !== '0', gen = ls('u3_age_g') === '1';
    v.innerHTML = "<h2>أعمار الأرصدة</h2><div class='card noprint'><div class='mut' style='margin-bottom:8px'>كم مضى على آخر دفعة (صادر) لكل حساب، مرتّبة من الأقدم. اضغط أي حساب لفتحه.</div>" +
      "<label class='chk'><input type='checkbox' id='u3-az'" + (hz ? ' checked' : '') + "> إخفاء الحسابات ذات الرصيد صفر</label>" +
      "<label class='chk' style='margin-top:6px'><input type='checkbox' id='u3-ag'" + (gen ? ' checked' : '') + "> إظهار حساب «العام»</label></div><div id='u3-ar'><div class='empty'>جارٍ التحميل…</div></div>";
    document.getElementById('u3-az').onchange = function () { ls('u3_age_z', this.checked ? '1' : '0'); agingPage(); };
    document.getElementById('u3-ag').onchange = function () { ls('u3_age_g', this.checked ? '1' : '0'); agingPage(); };
    var draw = function () {
      var S = g('S'), box = document.getElementById('u3-ar'); if (!S || !box || S.page !== 'aging') return;
      var today = new Date(String(S.today || '').replace(/-/g, '/')), list = (S.acc || []).map(function (a, i) {
        var days = a.lastPay ? Math.round((today - new Date(String(a.lastPay).replace(/-/g, '/'))) / 864e5) : null;
        return { a: a, i: i, days: days };
      }).filter(function (x) { return (!hz || Math.abs(x.a.bal) >= 0.005) && (gen || x.a.name !== 'العام'); });
      list.sort(function (x, y) { return (y.days == null ? 1e9 : y.days) - (x.days == null ? 1e9 : x.days); });
      if (!list.length) { box.innerHTML = "<div class='card empty'>لا توجد حسابات</div>"; return; }
      var chip = function (d) { if (d == null) return "<span class='u3-chip r'>لا توجد دفعات</span>"; return "<span class='u3-chip " + (d > 60 ? 'r' : d > 30 ? 'o' : 'g') + "'>" + d + ' يوم</span>'; };
      var c60 = list.filter(function (x) { return x.days == null || x.days > 60; }).length, c30 = list.filter(function (x) { return x.days != null && x.days > 30 && x.days <= 60; }).length;
      box.innerHTML = "<div class='kpis'><div class='kpi'><span>أكثر من 60 يومًا</span><b>" + c60 + "</b></div><div class='kpi'><span>من 31 إلى 60 يومًا</span><b>" + c30 + "</b></div><div class='kpi'><span>30 يومًا أو أقل</span><b>" + (list.length - c60 - c30) + '</b></div></div>' +
        "<div class='tw'><table class='u3-age'><tr><th>الحساب</th><th>منذ آخر دفعة</th><th>آخر دفعة</th><th>الرصيد</th><th>آخر حركة</th></tr>" +
        list.map(function (x) {
          return "<tr style='cursor:pointer' data-i='" + x.i + "'><td class='t'><b>" + E(x.a.name) + '</b></td><td>' + chip(x.days) + '</td><td>' + E(x.a.lastPay || '—') + "</td><td><b class='" + (x.a.bal < 0 ? 'neg' : '') + "'>" + fmt(x.a.bal) + '</b> ' + E(x.a.cur || '') + '</td><td>' + E(x.a.last || '—') + '</td></tr>';
        }).join('') + '</table></div>';
      box.querySelector('table').onclick = function (e) { var r = e.target.closest('[data-i]'); if (r) { var oa = g('openAcc'); if (oa) oa(+r.dataset.i); } };
    };
    var S = g('S');
    if (S && S.acc && S.acc.length) draw();
    var boot = g('boot');
    if (boot) Promise.resolve(boot()).then(draw).catch(function () { /* */ });
  }

  /* ================= 8) تصوير المرفقات مباشرة + معاينة ================= */
  function camWatch() {
    Array.prototype.forEach.call(document.querySelectorAll('input[type=file]'), function (inp) {
      if (inp.dataset.u3 || !/image/.test(inp.accept || '')) return;
      inp.dataset.u3 = '1';
      if (inp.id === 'cof' || inp.style.display === 'none' || getComputedStyle(inp).display === 'none') return;
      var b = el('<button type="button" class="u3-cam">📷 تصوير الآن</button>');
      b.onclick = function () { inp.setAttribute('capture', 'environment'); inp.click(); setTimeout(function () { inp.removeAttribute('capture'); }, 1500); };
      inp.insertAdjacentElement('afterend', b);
      inp.addEventListener('change', function () {
        var old = inp.parentNode.querySelector('.u3-thumb'); if (old) old.remove();
        var f = inp.files && inp.files[0]; if (!f || !/^image/.test(f.type)) return;
        var im = document.createElement('img'); im.className = 'u3-thumb'; im.src = URL.createObjectURL(f);
        b.insertAdjacentElement('afterend', im);
      });
    });
  }
  setInterval(camWatch, 900);
  /* رفع أسرع في يومية غدق: تصغير صورة السند إلى 1280 بكسل */
  if (GH) {
    var fdTry = setInterval(function () {
      if (!g('fileData') || W.__u3fd) return;
      W.__u3fd = 1; clearInterval(fdTry);
      W.fileData = function (f) {
        if (!/^image/.test(f.type)) {
          if (f.size > 8e6) return Promise.reject(new Error('حجم الملف أكبر من 8 ميغا'));
          return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(f); });
        }
        return new Promise(function (res, rej) {
          var url = URL.createObjectURL(f), img = new Image();
          img.onload = function () {
            var k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement('canvas');
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
            res(c.toDataURL('image/jpeg', 0.72));
          };
          img.onerror = rej; img.src = url;
        });
      };
    }, 500);
  }

  /* ================= 9) تنبيه ارتفاع السعر في فاتورة الشراء ================= */
  function riseTh() { return Number(ls('u3_rise') || 10); }
  function rises() {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll('.line'), function (d) {
      var pa = d.querySelector('.pa'), m = pa && pa.textContent.match(/أعلى بنسبة ([\d.]+)%/), n = d.querySelector('.n');
      var p = m ? +m[1] : 0, big = p >= riseTh();
      d.classList.toggle('u3-rise', big);
      var bd = pa && pa.querySelector('.u3-rb');
      if (big && pa && !bd) pa.insertAdjacentHTML('afterbegin', '<span class="u3-rb">⚠ ارتفاع كبير</span> ');
      if (big) out.push((n ? n.value.trim() : '') + ' (+' + p.toFixed(1) + '%)');
    });
    return out;
  }
  if (!GH) {
    setInterval(function () { if (g('CUR') === 'inv') rises(); }, 800);
    var siTry = setInterval(function () {
      var si = g('saveInv'); if (!si || W.__u3si) return;
      W.__u3si = 1; clearInterval(siTry);
      W.saveInv = function (again) {
        if (again) return si.apply(this, arguments);
        var r = rises();
        if (r.length && !confirm('⚠ ارتفاع في السعر أكثر من ' + riseTh() + '% عن آخر سعر شراء:\n\n• ' + r.join('\n• ') + '\n\nهل تريد حفظ الفاتورة؟')) return;
        return si.apply(this, arguments);
      };
    }, 500);
  }

  /* ================= 10) مقارنة بنفس الشهر من العام الماضي + 1) تذكير اليومية (الصفاء) ================= */
  var MNS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  function homeExtras() {
    if (GH || g('CUR') !== 'home') return;
    var d = g('DASH'), k = document.getElementById('kpis'); if (!d || !k) return;
    var view = document.getElementById('view');
    if (d.lastJ !== undefined && d.today && d.lastJ !== d.today && !document.getElementById('u3-jban') && ls('u3_jban') !== d.today) {
      var bn = el('<div class="u3-ban" id="u3-jban"><span>📒 لم تُدخل يومية اليوم بعد' + (d.lastJ ? ' — آخر يومية ' + E(d.lastJ) : '') + '</span><span style="display:flex;gap:6px"><button>إدخال الآن</button><button style="background:transparent;color:inherit;border:1px solid currentColor">لاحقًا</button></span></div>');
      var bs = bn.querySelectorAll('button');
      bs[0].onclick = function () { W.go('jentry'); };
      bs[1].onclick = function () { ls('u3_jban', d.today); bn.remove(); };
      var hero = view && view.querySelector('.hero'); if (hero) hero.insertAdjacentElement('afterend', bn);
    }
    if (d.ly && !document.getElementById('u3-ly')) {
      var L = d.ly, mo = MNS[(L.m || 1) - 1] + ' ' + L.y, ch = L.ptd ? (d.pMonth - L.ptd) / L.ptd * 100 : null;
      var c = function (t, v, s) { return '<div class="c"><small>' + t + '</small><b>' + v + '</b>' + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
      var box = el('<div class="card u3-ly" id="u3-ly"><h2>مقارنة بـ ' + E(mo) + '</h2><div class="g">' +
        c('مشتريات هذا الشهر حتى اليوم', fmt(d.pMonth), ch === null ? 'لا توجد مشتريات في نفس الفترة من العام الماضي' : (ch >= 0 ? '⬆ ' : '⬇ ') + Math.abs(ch).toFixed(0) + '% عن نفس الفترة (' + fmt(L.ptd) + ')') +
        c('مشتريات ' + E(mo) + ' كاملًا', fmt(L.p), L.n + ' فاتورة') +
        c('مقبوضات ' + E(mo), fmt(L.inn), 'هذا الشهر: ' + fmt(d.jin)) +
        c('مدفوعات ' + E(mo), fmt(L.out), 'هذا الشهر: ' + fmt(d.jout)) + '</div></div>');
      k.insertAdjacentElement('afterend', box);
    }
  }
  setInterval(homeExtras, 700);

  /* رئيسية الصفاء: إخفاء مربع البحث، والمبالغ أسفل الأقسام الرئيسية */
  function homeLayout() {
    if (GH || g('CUR') !== 'home') return;
    var v = document.getElementById('view'); if (!v) return;
    var f = v.querySelector(':scope > form.srch'); if (f) f.classList.add('u3-nosrch');
    var tiles = v.querySelector(':scope > .tiles'); if (!tiles) return;
    var after = tiles;
    Array.prototype.forEach.call(v.children, function (c) {
      if (c === tiles || c.classList.contains('hero') || c.id === 'u3-jban' || c.classList.contains('u3-nosrch') || c.id === 'dash2') return;
      if (c.compareDocumentPosition(tiles) & Node.DOCUMENT_POSITION_FOLLOWING) c.dataset.u3mv = '1';
    });
    Array.prototype.slice.call(v.querySelectorAll(':scope > [data-u3mv]')).forEach(function (c) { if (c.previousElementSibling !== after) after.insertAdjacentElement('afterend', c); after = c; });
  }
  (function () {
    var ob = null;
    setInterval(function () {
      var v = document.getElementById('view'); if (!v || GH) return;
      if (!ob || ob._v !== v) { if (ob) ob.disconnect(); ob = new MutationObserver(function () { homeLayout(); }); ob._v = v; ob.observe(v, { childList: true }); }
      homeLayout();
    }, 300);
  })();

  /* ================= 12) كشف مورد مختصر للإرسال على واتساب ================= */
  function supShortText() {
    var sel = document.getElementById('k-sup'), name = sel ? sel.value : '';
    var from = (document.getElementById('k-from') || {}).value || '', to = (document.getElementById('k-to') || {}).value || '';
    var tb = document.querySelector('#k-tbl table'); if (!name || !tb) return '';
    var stats = {}; Array.prototype.forEach.call(document.querySelectorAll('#k-stats > div'), function (s) { var a = s.querySelector('small,span'), b = s.querySelector('b'); if (a && b) stats[a.textContent.trim()] = b.textContent.trim(); });
    var rows = Array.prototype.slice.call(tb.querySelectorAll('tbody tr')).filter(function (r) { return !r.classList.contains('detail'); }).map(function (r) {
      var c = r.querySelectorAll('td'); return { d: c[0].textContent.trim(), b: c[1].textContent.replace(/\s+/g, ' ').trim(), i: c[3].textContent.trim(), o: c[4].textContent.trim(), bal: c[5].textContent.trim() };
    });
    var last = rows.slice(-15), B = g('B'), shop = (B && B.set && B.set.shop) || 'مكتبة الصفاء';
    var out = ['*كشف حساب مختصر — ' + name + '*', shop, 'الفترة: ' + (from || 'من البداية') + ' إلى ' + (to || 'اليوم'), ''];
    if (stats['الرصيد المرحّل']) out.push('الرصيد المرحّل: ' + stats['الرصيد المرحّل']);
    if (rows.length > last.length) out.push('… ' + (rows.length - last.length) + ' حركة سابقة غير معروضة');
    last.forEach(function (x) { out.push('▫️ ' + x.d + ' | ' + x.b + ' | ' + (x.i ? 'وارد ' + x.i : '') + (x.i && x.o ? ' / ' : '') + (x.o ? 'صادر ' + x.o : '') + ' | الرصيد ' + x.bal); });
    out.push('');
    if (stats['إجمالي الوارد']) out.push('إجمالي الوارد: ' + stats['إجمالي الوارد']);
    if (stats['إجمالي الصادر']) out.push('إجمالي الصادر: ' + stats['إجمالي الصادر']);
    if (stats['الرصيد الختامي']) out.push('*الرصيد الختامي: ' + stats['الرصيد الختامي'] + '*');
    return out.join('\n').slice(0, 6000);
  }
  function supShortWatch() {
    if (GH || g('CUR') !== 'sstmt') return;
    var tb = document.getElementById('k-tbl'); if (!tb || !tb.querySelector('table') || document.getElementById('u3-wa')) return;
    var b = el('<div class="u3-bar" id="u3-wa"><button type="button">🟢 إرسال كشف مختصر للمورد (واتساب)</button></div>');
    b.querySelector('button').onclick = function () { var t = supShortText(); if (!t) { msg('اختر المورد أولًا', 1); return; } W.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank'); };
    tb.parentNode.insertBefore(b, tb);
  }
  setInterval(supShortWatch, 700);

  /* ================= 1) التذكير اليومي على الإيميل (من يومية غدق) ================= */
  function remSheet() {
    var o = sheet('🔔 التذكير اليومي', [], '<div style="color:#8796A5;font-size:13px;margin-bottom:10px">يصلك بريد على Gmail في الساعة التي تختارها إذا لم تُدخل يومية مكتبة الصفاء لذلك اليوم، ومعه تنبيهات الحسابات المتأخرة في السداد في يومية غدق. فعّل إشعارات تطبيق Gmail على جوالك حتى يصلك كتنبيه.</div><div id="u3-rm">جارٍ التحميل…</div>');
    var box = o.querySelector('#u3-rm');
    var draw = function (r) {
      var hrs = ''; for (var h = 6; h <= 23; h++) hrs += '<option value="' + h + '"' + (r.hour === h ? ' selected' : '') + '>' + (h > 12 ? (h - 12) + ' مساءً' : h === 12 ? '12 ظهرًا' : h + ' صباحًا') + '</option>';
      box.innerHTML = '<div class="rw"><b>التذكير</b><span class="ui-seg"><button data-on="1" class="' + (r.on ? 'on' : '') + '">تشغيل</button><button data-on="0" class="' + (r.on ? '' : 'on') + '">إيقاف</button></span></div>' +
        '<div class="rw"><b>الساعة</b><select id="u3-rh" class="u3-in" style="width:auto;margin:0;min-height:40px">' + hrs + '</select></div>' +
        '<label class="rw" style="cursor:pointer"><b>يومية مكتبة الصفاء غير مُدخلة</b><input type="checkbox" id="u3-rs"' + (r.safa ? ' checked' : '') + ' style="width:22px;height:22px"></label>' +
        '<label class="rw" style="cursor:pointer"><b>حسابات متأخرة في السداد</b><input type="checkbox" id="u3-ra"' + (r.alerts ? ' checked' : '') + ' style="width:22px;height:22px"></label>' +
        '<div style="color:#8796A5;font-size:13px;margin:8px 0">يُرسل إلى: <b dir="ltr">' + E(r.to || '—') + '</b></div>' +
        '<button class="it" id="u3-rsave" style="background:var(--ui);color:#fff;text-align:center">حفظ</button><button class="it" id="u3-rtest" style="text-align:center">إرسال بريد تجريبي الآن</button>';
      var on = r.on;
      Array.prototype.forEach.call(box.querySelectorAll('[data-on]'), function (b) { b.onclick = function () { on = b.dataset.on === '1'; Array.prototype.forEach.call(box.querySelectorAll('[data-on]'), function (x) { x.classList.toggle('on', x === b); }); }; });
      box.querySelector('#u3-rsave').onclick = function () {
        var b = this; b.disabled = true; b.textContent = 'جارٍ الحفظ…';
        api('remSet', [{ on: on, hour: +box.querySelector('#u3-rh').value, safa: box.querySelector('#u3-rs').checked, alerts: box.querySelector('#u3-ra').checked }])
          .then(function (x) { o.remove(); msg(x.on ? '✔ التذكير مفعّل يوميًا الساعة ' + x.hour + ':00' : 'أُوقف التذكير اليومي'); })
          .catch(function (e) { b.disabled = false; b.textContent = 'حفظ'; msg('تعذّر الحفظ: ' + (e && e.message || e), 1); });
      };
      box.querySelector('#u3-rtest').onclick = function () {
        var b = this; b.disabled = true; b.textContent = 'جارٍ الإرسال…';
        api('remTest', []).then(function (x) { b.textContent = '✔ أُرسل إلى ' + (x && x.to || 'بريدك'); }).catch(function (e) { b.disabled = false; b.textContent = 'إرسال بريد تجريبي الآن'; msg('تعذّر الإرسال: ' + (e && e.message || e), 1); });
      };
    };
    api('remGet', []).then(draw).catch(function (e) { box.innerHTML = '<div style="color:#C62828">' + E(e && e.message || e) + '</div>'; });
  }

  /* صفوف إضافية في نافذة «المظهر والإعدادات» */
  setInterval(function () {
    var bx = document.querySelector('.ui-sheet .bx'); if (!bx || bx.querySelector('.u3-rows') || !/المظهر والإعدادات/.test(bx.textContent)) return;
    var h = '<div class="u3-rows">' +
      '<div class="rw"><b>⭐ المفضلة</b><button class="ui-hbtn" data-u3="fav" style="background:var(--ui)">تعديل</button></div>' +
      (GH ? '<div class="rw"><b>🔔 التذكير اليومي</b><button class="ui-hbtn" data-u3="rem" style="background:var(--ui)">إعداد</button></div>' :
        '<div class="rw"><b>تنبيه ارتفاع السعر</b><span class="ui-seg">' + [5, 10, 20].map(function (p) { return '<button data-rise="' + p + '" class="' + (riseTh() === p ? 'on' : '') + '">' + p + '%</button>'; }).join('') + '</span></div>') + '</div>';
    var r = el(h), rws = bx.querySelectorAll('.rw');
    bx.insertBefore(r, rws[rws.length - 1] || null);
    r.onclick = function (e) {
      var b = e.target.closest('[data-u3]'), p = e.target.closest('[data-rise]');
      if (b) { closeSheets(); if (b.dataset.u3 === 'fav') favSheet(); else remSheet(); }
      if (p) { ls('u3_rise', p.dataset.rise); Array.prototype.forEach.call(r.querySelectorAll('[data-rise]'), function (x) { x.classList.toggle('on', x === p); }); }
    };
  }, 400);

  if (GH) { var agTry = setInterval(function () { if (document.getElementById('nav') && W.go && g('S')) { clearInterval(agTry); agingSetup(); } }, 300); }
})();
