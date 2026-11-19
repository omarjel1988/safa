/* إضافات الواجهة (2): الدخول ببصمة الوجه، الإدخال بالصوت، الطباعة، المشاركة عبر واتساب */
(function () {
  'use strict';
  var APP = window.APP, W = window;
  if (!APP || W.__UI2_ON) return;
  W.__UI2_ON = 1;
  var GH = APP.mode === 'ghadaq';
  function g(name) { try { return (0, eval)('typeof ' + name + ' !== "undefined" ? ' + name + ' : null'); } catch (e) { return null; } }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function msg(t, err) { var f = g('toast'); try { if (f) return GH ? f(t, err ? 1 : 0) : f(t, err ? 'err' : 'ok'); } catch (e) { /* */ } alert(t); }
  function sheet(title, items, html) {
    var o = el('<div class="ui-sheet"><div class="bx"><div class="gr"></div>' + (title ? '<h3>' + E(title) + '</h3>' : '') + (html || '') + '</div></div>');
    (items || []).forEach(function (it) { var b = el('<button class="it' + (it[2] ? ' ' + it[2] : '') + '">' + it[0] + '</button>'); b.onclick = function () { o.remove(); it[1](); }; o.querySelector('.bx').appendChild(b); });
    o.onclick = function (e) { if (e.target === o) o.remove(); };
    document.body.appendChild(o); return o;
  }
  var b64 = function (buf) { var s = '', u = new Uint8Array(buf); for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); };
  var unb64 = function (s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  var rnd = function (n) { var u = new Uint8Array(n); crypto.getRandomValues(u); return u; };

  /* ================= 1) الدخول ببصمة الوجه / الإصبع ================= */
  var BK = 'bio_' + APP.id;
  function bioInfo() { try { return JSON.parse(ls(BK) || 'null'); } catch (e) { return null; } }
  function bioOk() {
    if (!W.PublicKeyCredential || !navigator.credentials) return Promise.resolve(false);
    try { return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(function () { return false; }); } catch (e) { return Promise.resolve(false); }
  }
  function checkPin(pin) {
    if (GH) return RT.post({ a: ['unlock', [{ pin: pin, remember: true }]] }).then(function (v) { var r = typeof v === 'string' ? JSON.parse(v) : v; if (!r || !r.token) throw new Error('رمز غير صحيح'); return true; });
    return RT.post({ fn: 'webCheckPin', args: [pin] }).then(function (r) { if (!r || !r.tok) throw new Error('رمز غير صحيح'); return true; });
  }
  function bioEnable() {
    var o = sheet('تفعيل الدخول ببصمة الوجه', [], '<div style="color:#637082;font-size:14px;margin-bottom:10px">أدخل رمز الدخول الحالي مرة واحدة، ثم أكّد ببصمة الوجه أو الإصبع.</div>' +
      '<input id="bio-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="8" style="width:100%;min-height:48px;font-size:20px;text-align:center;border:1px solid #ccc;border-radius:12px;margin-bottom:10px;box-sizing:border-box">' +
      '<button class="it" id="bio-go" style="background:var(--ui);color:#fff;text-align:center">متابعة</button><div id="bio-err" style="color:#C62828;font-weight:700"></div>');
    var inp = o.querySelector('#bio-pin'); setTimeout(function () { inp.focus(); }, 80);
    o.querySelector('#bio-go').onclick = function () {
      var pin = inp.value.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).trim(), er = o.querySelector('#bio-err');
      if (!pin) return;
      er.textContent = 'جارٍ التحقق…';
      checkPin(pin).then(function () {
        er.textContent = '';
        return navigator.credentials.create({ publicKey: {
          challenge: rnd(32), rp: { name: APP.short || 'التطبيق', id: location.hostname },
          user: { id: rnd(16), name: APP.id, displayName: APP.short || APP.id },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' }, timeout: 60000, attestation: 'none' } });
      }).then(function (cr) {
        if (!cr) return;
        ls(BK, JSON.stringify({ id: b64(cr.rawId), p: btoa(unescape(encodeURIComponent(pin))) }));
        o.remove(); msg('تم تفعيل الدخول ببصمة الوجه ✓');
      }).catch(function (e) { er.textContent = (e && e.name === 'NotAllowedError') ? 'أُلغيت العملية' : (e && e.message) || 'تعذّر التفعيل'; });
    };
  }
  function bioUnlock(fill) {
    var b = bioInfo(); if (!b) return;
    navigator.credentials.get({ publicKey: { challenge: rnd(32), rpId: location.hostname, allowCredentials: [{ type: 'public-key', id: unb64(b.id) }], userVerification: 'required', timeout: 60000 } })
      .then(function (a) { if (a) fill(decodeURIComponent(escape(atob(b.p)))); })
      .catch(function (e) { if (!(e && e.name === 'NotAllowedError')) msg('تعذّر التحقق بالبصمة: ' + ((e && e.message) || e), true); });
  }
  function lockWatch() {
    if (!bioInfo()) return;
    var box = GH ? document.querySelector('#lock .lbox') : document.querySelector('#pin .card');
    if (!box || box.querySelector('.bio-btn')) return;
    var btn = el('<button type="button" class="bio-btn" style="width:100%;min-height:50px;margin-top:12px;border:0;border-radius:12px;background:#111827;color:#fff;font:800 16px Cairo,system-ui,sans-serif">🔓 الدخول ببصمة الوجه</button>');
    btn.onclick = function () {
      bioUnlock(function (pin) {
        if (GH) { var i = document.getElementById('lpin'); if (i) { i.value = pin; if (W.doUnlock) W.doUnlock(); } }
        else { var j = document.getElementById('pinin'); if (j) { j.value = pin; var f = j.closest('form'); if (f) { if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event('submit', { cancelable: true })); } } }
      });
    };
    box.appendChild(btn);
  }
  setInterval(lockWatch, 600);

  /* ================= 9 + 10) الطباعة والمشاركة ================= */
  var pcss = document.createElement('style');
  pcss.textContent = '@media print{header,nav,.ui-bnav,.ui-hbtn,#rt-badge,#rt-new,#rt-undo,#ui-mic,.ui-sheet,button,.noprint,.pdf,#toast,#kp{display:none!important}' +
    'body{background:#fff!important;padding:0!important;zoom:1!important}main{max-width:none!important;padding:0!important}.card,.tw,.stat,.kpi{box-shadow:none!important;break-inside:avoid}' +
    'input,select{border:0!important;background:none!important}table{width:100%!important}th,td{padding:4px 6px!important}}' +
    'html.pr80 body{font-size:11px!important}html.pr80 .stats,html.pr80 .kpis{display:block!important}html.pr80 .stat,html.pr80 .kpi{padding:4px 0!important;border:0!important;border-bottom:1px dashed #999!important;border-radius:0!important}' +
    'html.pr80 th,html.pr80 td{font-size:10px!important;padding:2px 3px!important}';
  document.head.appendChild(pcss);
  function doPrint(narrow) {
    var st = document.createElement('style'); st.id = 'pr-page';
    st.textContent = narrow ? '@page{size:80mm auto;margin:3mm}' : '@page{size:A4;margin:12mm}';
    document.head.appendChild(st);
    document.documentElement.classList.toggle('pr80', !!narrow);
    var done = function () { st.remove(); document.documentElement.classList.remove('pr80'); W.removeEventListener('afterprint', done); };
    W.addEventListener('afterprint', done);
    setTimeout(function () { W.print(); setTimeout(done, 1500); }, 60);
  }
  function title() {
    if (GH) { var S = g('S'), on = document.querySelector('#nav button.on'); return 'يومية غدق — ' + (on ? on.textContent.trim() : '') + (S && S.cur && /stmt|accts/.test(S.page) ? ' — ' + S.cur : ''); }
    var t = document.getElementById('ttl'), on2 = document.querySelector('.ui-bnav button.on');
    return 'مكتبة الصفاء — ' + (t ? t.textContent.trim() : '') + (on2 ? ' — ' + on2.textContent.trim() : '');
  }
  function pageText() {
    var v = document.getElementById('view'); if (!v) return '';
    var out = [title(), new Date().toLocaleDateString('ar-SA-u-ca-gregory-nu-latn'), ''];
    Array.prototype.forEach.call(v.querySelectorAll('.stat,.st,.kpi'), function (s) {
      var a = s.querySelector('span,small'), b = s.querySelector('b'); if (a && b) out.push('▫️ ' + a.textContent.trim() + ': ' + b.textContent.trim());
    });
    var tb = v.querySelector('table');
    if (tb) {
      out.push('');
      var rows = Array.prototype.slice.call(tb.querySelectorAll('tr'));
      rows.slice(0, 41).forEach(function (r, i) {
        var cells = Array.prototype.map.call(r.querySelectorAll('th,td'), function (c) { return c.textContent.replace(/\s+/g, ' ').trim(); }).filter(function (x) { return x && !/^(تعديل|حذف|فتح|تكرار|الفاتورة)$/.test(x); });
        if (cells.length) out.push((i === 0 ? '*' : '') + cells.join(' | ') + (i === 0 ? '*' : ''));
      });
      if (rows.length > 41) out.push('… و' + (rows.length - 41) + ' سطرًا آخر');
      var tf = tb.querySelector('tr.tot,tfoot tr'); if (tf && rows.indexOf(tf) > 40) out.push('*' + Array.prototype.map.call(tf.querySelectorAll('td'), function (c) { return c.textContent.trim(); }).filter(Boolean).join(' | ') + '*');
    }
    return out.join('\n').slice(0, 6000);
  }
  function shareSheet() {
    sheet('طباعة ومشاركة', [
      ['🖨 طباعة الصفحة (A4)', function () { doPrint(false); }],
      ['🧾 طباعة إيصال صغير (80 مم)', function () { doPrint(true); }],
      ['🟢 مشاركة عبر واتساب', function () { W.open('https://wa.me/?text=' + encodeURIComponent(pageText()), '_blank'); }],
      ['⤴︎ مشاركة بطريقة أخرى', function () { var t = pageText(); if (navigator.share) navigator.share({ title: title(), text: t }).catch(function () {}); else { try { navigator.clipboard.writeText(t); msg('تم نسخ النص'); } catch (e) { /* */ } } }]
    ], '<div style="color:#8796A5;font-size:13px;margin-bottom:10px">تُطبع أو تُشارك الصفحة المفتوحة حاليًا كما تظهر أمامك (مع الفلاتر).</div>');
  }
  function headerBtns() {
    var h = GH ? document.querySelector('header .top .ui-hgrp') : document.querySelector('header .hb');
    if (!h || h.querySelector('.ui-share')) return;
    var aa = h.querySelector('.ui-aa'); if (!aa) return;
    var b = el('<button class="ui-hbtn ui-share" title="طباعة ومشاركة"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px"><path d="M4 12v8h16v-8"/><path d="M12 3v12M7 8l5-5 5 5"/></svg></button>');
    b.onclick = shareSheet;
    h.insertBefore(b, aa);
  }
  setInterval(headerBtns, 700);

  /* زر تفعيل البصمة داخل نافذة المظهر */
  setInterval(function () {
    var bx = document.querySelector('.ui-sheet .bx'); if (!bx || bx.querySelector('.bio-row') || !/المظهر والإعدادات/.test(bx.textContent)) return;
    bioOk().then(function (ok) {
      if (!ok || bx.querySelector('.bio-row')) return;
      var on = !!bioInfo();
      var r = el('<div class="rw bio-row"><b>الدخول ببصمة الوجه</b><button class="ui-hbtn" style="background:' + (on ? '#C62828' : 'var(--ui)') + '">' + (on ? 'إيقاف' : 'تفعيل') + '</button></div>');
      r.querySelector('button').onclick = function () { var s = r.closest('.ui-sheet'); if (s) s.remove(); if (on) { ls(BK, null); msg('أُوقف الدخول ببصمة الوجه'); } else bioEnable(); };
      var rws = bx.querySelectorAll('.rw'); bx.insertBefore(r, rws[rws.length - 1] || null);
    });
  }, 400);
})();
