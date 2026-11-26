/* اختبار سريع للتطبيقين: تحليل الكود + فتح الصفحة بخادم وهمي مقفل والتأكد من ظهور شاشة الرمز دون أخطاء.
   التشغيل: node tests/smoke.js <مجلد يحتوي نسخة المستودع باسم safa> [chrome-path] */
const fs = require('fs'), path = require('path'), http = require('http');
const ts = require('typescript');
const { chromium } = require('playwright');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const REPO = path.join(ROOT, 'safa');
let fail = 0; const bad = m => { fail++; console.log('❌ ' + m); }, ok = m => console.log('✅ ' + m);

/* 1) تحليل كل السكربتات + عدم تكرار تعريف الدوال */
for (const f of ['shell.html', 'ghadaq/shell.html']) {
  const h = fs.readFileSync(path.join(REPO, f), 'utf8'); const re = /<script>([\s\S]*?)<\/script>/g; let m, i = 0;
  while ((m = re.exec(h))) {
    const sf = ts.createSourceFile('x.js', m[1], ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    if (sf.parseDiagnostics.length) bad(`${f} سكربت ${i}: خطأ صياغة ${sf.parseDiagnostics[0].messageText}`);
    const seen = {}; sf.statements.forEach(s => { if (ts.isFunctionDeclaration(s) && s.name) { if (seen[s.name.text]) bad(`${f}: الدالة ${s.name.text} معرّفة مرتين`); seen[s.name.text] = 1; } });
    i++;
  }
  ok(`${f}: ${i} سكربت`);
}
for (const f of ['core.js', 'loader.js', 'sw.js']) { try { new Function(fs.readFileSync(path.join(REPO, f), 'utf8')); ok(f); } catch (e) { bad(f + ': ' + e.message); } }

/* 2) فتح التطبيقين في متصفح */
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(ROOT, p); if (!fp.startsWith(ROOT) || !fs.existsSync(fp)) { r.writeHead(404); return r.end(); }
  const ext = path.extname(fp), ct = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png' }[ext] || 'application/octet-stream';
  r.writeHead(200, { 'Content-Type': ct }); fs.createReadStream(fp).pipe(r);
}).listen(0, async () => {
  const port = srv.address().port;
  const b = await chromium.launch(process.argv[3] ? { executablePath: process.argv[3] } : {});
  for (const [app, url, reply, expect] of [
    ['الصفاء', '/safa/', { err: 'PIN_REQUIRED' }, /رمز|تسجيل الدخول/],
    ['غدق', '/safa/ghadaq/', { err: 'LOCKED|' }, /رمز/]]) {
    const p = await b.newPage({ viewport: { width: 412, height: 860 } }); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.route(/script\.google\.com|googleusercontent/, x => x.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(reply) }));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, x => x.abort());
    try {
      await p.goto(`http://localhost:${port}${url}`); await p.waitForTimeout(5000);
      const txt = await p.evaluate(() => document.body.innerText);
      if (!expect.test(txt)) bad(`${app}: لم تظهر شاشة الرمز`); else ok(`${app}: الصفحة تعمل وتظهر شاشة الرمز`);
      if (errs.length) bad(`${app}: أخطاء في الصفحة: ${[...new Set(errs)].join(' | ').slice(0, 400)}`);
    } catch (e) { bad(`${app}: ${e.message}`); }
  }
  await b.close(); srv.close();
  console.log(fail ? `\n${fail} مشكلة` : '\nكل الاختبارات نجحت'); process.exit(fail ? 1 : 0);
});
