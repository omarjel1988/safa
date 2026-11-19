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

  /* ================= 8) الإدخال بالصوت ================= */
  var SR = W.SpeechRecognition || W.webkitSpeechRecognition;
  var ONES = { 'صفر': 0, 'واحد': 1, 'واحدة': 1, 'اثنين': 2, 'اثنان': 2, 'إثنين': 2, 'ثنين': 2, 'ثلاث': 3, 'ثلاثة': 3, 'تلاتة': 3, 'تلات': 3, 'أربع': 4, 'اربع': 4, 'أربعة': 4, 'اربعة': 4, 'خمس': 5, 'خمسة': 5, 'ست': 6, 'ستة': 6, 'سبع': 7, 'سبعة': 7, 'ثمان': 8, 'ثماني': 8, 'ثمانية': 8, 'تمانية': 8, 'تسع': 9, 'تسعة': 9, 'عشر': 10, 'عشرة': 10,
    'احدعش': 11, 'إحدى عشر': 11, 'حدعش': 11, 'اثنعش': 12, 'اثنا عشر': 12, 'عشرين': 20, 'عشرون': 20, 'ثلاثين': 30, 'تلاتين': 30, 'أربعين': 40, 'اربعين': 40, 'خمسين': 50, 'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تمانين': 80, 'تسعين': 90,
    'مية': 100, 'مئة': 100, 'مائة': 100, 'ميه': 100, 'ميتين': 200, 'مئتين': 200, 'مائتين': 200, 'ثلاثمية': 300, 'ثلاثمئة': 300, 'تلتمية': 300, 'أربعمية': 400, 'اربعمية': 400, 'أربعمئة': 400, 'خمسمية': 500, 'خمسمئة': 500, 'خمسمائة': 500, 'ستمية': 600, 'ستمئة': 600, 'سبعمية': 700, 'سبعمئة': 700, 'ثمانمية': 800, 'ثمانمئة': 800, 'تسعمية': 900, 'تسعمئة': 900 };
  var MULT = { 'ألف': 1000, 'الف': 1000, 'آلاف': 1000, 'الاف': 1000, 'ألفين': 2000, 'الفين': 2000, 'مليون': 1e6, 'ملايين': 1e6 };
  function parseNum(text) {
    var t = String(text).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[,،]/g, '');
    var dm = t.match(/\d+(?:\.\d+)?/g);
    if (dm) { var v = Number(dm[0]), after = t.slice(t.indexOf(dm[0]) + dm[0].length).trim().split(/\s+/)[0]; if (MULT[after]) v *= MULT[after]; return v; }
    var words = t.split(/\s+/).map(function (w) { return w.replace(/^و/, '').replace(/^ال(?=[ءاأإآ-ي]{3,})/, function (m, i, s) { return ONES[s.slice(2)] !== undefined || MULT[s.slice(2)] ? '' : m; }); });
    var total = 0, cur = 0, any = false;
    words.forEach(function (w) {
      if (ONES[w] !== undefined) { cur += ONES[w]; any = true; }
      else if (MULT[w]) { if (w === 'ألفين' || w === 'الفين') { total += 2000; cur = 0; } else { total += (cur || 1) * MULT[w]; cur = 0; } any = true; }
    });
    return any ? total + cur : 0;
  }
  function norm(s) { return String(s || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim(); }
  function findName(text, names) {
    var t = ' ' + norm(text) + ' ', best = '', bl = 0;
    names.forEach(function (n) { var k = norm(n); if (k && t.indexOf(k) > -1 && k.length > bl) { best = n; bl = k.length; } });
    if (!best) names.forEach(function (n) { var k = norm(n).split(' ')[0]; if (k.length > 2 && t.indexOf(' ' + k) > -1 && k.length > bl) { best = n; bl = k.length; } });
    return best;
  }
  var OUTW = /صادر|دفعه|دفعة|دفعت|دفع|سداد|سددت|مصروف|مصاريف|صرف|سلفة|سلفه/, INW = /وارد|قبض|قبضت|استلام|استلمت|مقبوض|بيع|ايراد|إيراد|دخل/;
  function listen(cb) {
    var r = new SR(); r.lang = 'ar-SA'; r.interimResults = false; r.maxAlternatives = 1;
    var o = sheet('', [], '<div style="text-align:center;padding:14px"><div style="font-size:44px">🎙</div><b>تكلّم الآن…</b><div style="color:#8796A5;margin-top:6px">مثال: «دفعة للعاجي خمسمية ألف»</div></div>');
    r.onresult = function (e) { o.remove(); cb(e.results[0][0].transcript); };
    r.onerror = function (e) { o.remove(); msg(e.error === 'not-allowed' ? 'اسمح للتطبيق باستخدام الميكروفون من الإعدادات' : 'لم أسمع شيئًا، حاول مرة أخرى', true); };
    r.onend = function () { setTimeout(function () { if (document.body.contains(o)) o.remove(); }, 300); };
    o.onclick = function () { try { r.stop(); } catch (e) { /* */ } o.remove(); };
    r.start();
  }
  function setVal(i, v) { if (!i) return; i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }
  function applyVoice(text) {
    var amt = parseNum(text), out = OUTW.test(text), inn = INW.test(text) && !out;
    var note = '«' + text + '»';
    if (GH) {
      var S = g('S'), acc = findName(text, ((S && S.acc) || []).map(function (a) { return a.name; }));
      if (acc) setVal(document.getElementById('na'), acc);
      setVal(document.getElementById('nb'), text);
      if (amt) setVal(document.getElementById(inn ? 'nw' : 'ns'), amt);
      msg('🎙 ' + note + (acc ? ' — الحساب: ' + acc : '') + (amt ? ' — المبلغ: ' + amt.toLocaleString('en-US') : ' — لم أفهم المبلغ'), !amt);
      return;
    }
    var cur = g('CUR');
    if (cur === 'sentry') {
      var sups = Array.prototype.map.call(document.querySelectorAll('#e-sup option'), function (o) { return o.value; }).filter(Boolean);
      var sp = findName(text, sups); if (sp) setVal(document.getElementById('e-sup'), sp);
      setVal(document.getElementById('e-desc'), text);
      if (amt) setVal(document.getElementById(inn ? 'e-inc' : 'e-out'), amt);
      msg('🎙 ' + note + (sp ? ' — المورد: ' + sp : '') + (amt ? ' — المبلغ: ' + amt.toLocaleString('en-US') : ' — لم أفهم المبلغ'), !amt);
    } else if (cur === 'jentry') {
      var lines = document.querySelectorAll('.line'), ln = null;
      for (var i = 0; i < lines.length; i++) { var st = lines[i].querySelector('.st'); if (st && !st.value.trim()) { ln = lines[i]; break; } }
      if (!ln && W.addJLine) { W.addJLine(); lines = document.querySelectorAll('.line'); ln = lines[lines.length - 1]; }
      if (!ln) return;
      setVal(ln.querySelector('.st'), text);
      if (amt) setVal(ln.querySelector(inn ? '.i' : '.o'), amt);
      var sel = ln.querySelector('.sp'); if (sel && !inn) { var s2 = findName(text, Array.prototype.map.call(sel.options, function (o) { return o.value; }).filter(Boolean)); if (s2) setVal(sel, s2); }
      msg('🎙 ' + note + (amt ? ' — المبلغ: ' + amt.toLocaleString('en-US') + (inn ? ' (مقبوضات)' : ' (مدفوعات)') : ' — لم أفهم المبلغ'), !amt);
    }
  }
  function micWatch() {
    if (!SR) return;
    var target = null;
    if (GH) { var nb = document.getElementById('nb'); target = nb && nb.closest('.form'); }
    else { var c = g('CUR'); if (c === 'jentry') target = document.getElementById('jlines'); else if (c === 'sentry') { var d = document.getElementById('e-desc'); target = d && d.closest('.card'); } }
    if (!target || document.getElementById('ui-mic')) return;
    var b = el('<button type="button" id="ui-mic" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;margin:0 0 12px;border:1.5px dashed var(--ui);border-radius:12px;background:transparent;color:var(--ui);font:800 15px Cairo,system-ui,sans-serif">🎙 إدخال بالصوت</button>');
    b.onclick = function () { listen(applyVoice); };
    target.parentNode.insertBefore(b, target);
  }
  setInterval(micWatch, 700);

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
    var h = GH ? document.querySelector('header .top') : document.querySelector('header .hb');
    if (!h || h.querySelector('.ui-share')) return;
    var aa = h.querySelector('.ui-hbtn'); if (!aa) return;
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
