'use strict';
// Uji keamanan panel admin — jalankan sebelum menerbitkan perubahan:
//   ADMIN_PASSWORD='password-Anda-min-16-karakter' node scripts/test-auth.cjs
// Menguji: login, sesi, CSRF, Origin, rate limit, kedaluwarsa, logout, proxy GitHub,
// dan memastikan hanya storefront yang menjadi publik. Tanpa dependensi, tanpa jaringan.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'sentot.my.id';
const PASSWORD = process.env.ADMIN_PASSWORD || 'password-uji-lokal-12345678';
let port = 0, session = '', lastStatus = 0;

function request(method, urlPath, opts = {}) {
  const {cookie = '', origin = 'https://' + HOST, body = null, headers = {}, host = HOST, usePort = port} = opts;
  return new Promise((resolve, reject) => {
    const text = body === null ? null : (typeof body === 'string' ? body : JSON.stringify(body));
    const r = http.request({
      hostname: '127.0.0.1', port: usePort, method, path: urlPath,
      headers: Object.assign(
        {Host: host, Origin: origin},
        cookie ? {Cookie: cookie} : {},
        text ? {'Content-Type': typeof body === 'string' ? 'application/x-www-form-urlencoded' : 'application/json', 'Content-Length': Buffer.byteLength(text)} : {},
        headers
      )
    }, res => {
      let out = '';
      res.setEncoding('utf8');
      res.on('data', c => out += c);
      res.on('end', () => resolve({status: res.statusCode, headers: res.headers, text: out, setCookie: (res.headers['set-cookie'] || []).join('\n')}));
    });
    r.on('error', reject);
    if (text) r.write(text);
    r.end();
  });
}
function cookieOf(setCookieHeader, name) {
  const m = String(setCookieHeader || '').match(new RegExp('(?:^|[\\s,])' + name + '=([^;,]*)'));
  return m ? m[1] : '';
}
async function login(password = PASSWORD, ip = '198.51.100.7', usePort = port) {
  const page = await request('GET', '/admin', {usePort, headers: {'X-Forwarded-For': ip}});
  const csrf = cookieOf(page.headers['set-cookie'], '__Host-sai_login');
  return request('POST', '/api/admin?action=login', {usePort, headers: {'X-Forwarded-For': ip}, cookie: `__Host-sai_login=${csrf}`, body: `csrf=${csrf}&password=${encodeURIComponent(password)}`});
}
async function withServer(options, fn) {
  const {createHandler} = require(path.join(ROOT, 'server', 'auth.cjs'));
  const server = http.createServer(createHandler(options));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  try { return await fn(server.address().port); } finally { server.close(); }
}
function contextOf(html) {
  const m = html.match(/window\.__SA_SECURE_ADMIN__=(\{.*?\});<\/script>/s);
  return m ? JSON.parse(m[1].replace(/\\u003c/g, '<')) : null;
}
function jpegSize(buf) {
  // Baca dimensi dari penanda SOF berkas JPEG — tanpa dependensi luar.
  for (let i = 2; i + 9 < buf.length;) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return {height:buf.readUInt16BE(i + 5), width:buf.readUInt16BE(i + 7)};
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('Dimensi JPEG tidak terbaca');
}
function panelCopy(name) {
  // Ambil isi salinan berkas storefront yang tertanam di panel admin (string literal JS).
  const panel = JSON.parse(fs.readFileSync(path.join(ROOT, 'server', 'panel-template.json'), 'utf8')).html;
  const marker = `const ${name} = "`;
  const i = panel.indexOf(marker);
  assert.ok(i >= 0, 'salinan ' + name + ' tidak ditemukan di panel');
  let j = i + marker.length;
  const awal = j;
  while (j < panel.length) { if (panel[j] === '\\') { j += 2; continue; } if (panel[j] === '"') break; j++; }
  return JSON.parse('"' + panel.slice(awal, j) + '"');
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('hanya storefront yang menjadi publik di Vercel', () => {
  const files = fs.readdirSync(path.join(ROOT, 'public')).sort();
  assert.ok(files.includes('index.html') && files.includes('src') && files.includes('assets'), 'isi public/: ' + files.join(' '));
  for (const bad of ['server', 'api', '.server', 'scripts', 'package.json', 'node_modules'])
    assert.ok(!files.includes(bad), 'public/ tidak boleh berisi ' + bad + '/');
  const storefront = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
  assert.ok(storefront.includes('https://sentot.my.id/admin'), 'tombol Admin harus menuju /admin (login)');
  for (const f of ['index.html', 'src/data.js', 'src/app.js', 'src/styles.css']) {
    const body = fs.readFileSync(path.join(ROOT, 'public', f), 'utf8');
    assert.ok(!/ADMIN_PASSWORD|ghp_[A-Za-z0-9]{20,}|github_pat_/.test(body), f + ' memuat rahasia?');
  }
});

test('alamat panel lama = pengalih, bukan editor terbuka', () => {
  for (const name of ['panel-sentot-2026.html', 'panel-sentot-2026 (1).html', 'panel-sentot-2026 (2).html', 'admin.html', 'panel-admin.html']) {
    const html = fs.readFileSync(path.join(ROOT, 'public', name), 'utf8');
    assert.ok(html.includes('/admin'), name + ' tidak mengarah ke /admin');
    assert.ok(!html.includes('Simpan Pengaturan') && !html.includes('Ubah data usaha'), name + ' masih berisi editor terbuka');
    assert.ok(html.length < 5000, name + ' berukuran ' + html.length + ' byte — seharusnya hanya pengalih');
  }
});

test('tanpa ADMIN_PASSWORD: panel gagal-tertutup (503), form disembunyikan', async () => {
  const {createHandler} = require(path.join(ROOT, 'server', 'auth.cjs'));
  const resources = () => ({deploymentKey: require(path.join(ROOT, '.server', 'session-key.json')).key, panel: '<!--SERVER_CONTEXT-->', login: fs.readFileSync(path.join(ROOT, 'server', 'login.html'), 'utf8')});
  const server = http.createServer(createHandler({env: {ADMIN_PASSWORD: 'terlalu-pendek'}, resources}));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const p = server.address().port;
  try {
    const res = await request('GET', '/admin', {usePort: p});
    assert.equal(res.status, 503, 'tanpa password, /admin harus 503 dan tidak membuka panel');
    assert.ok(res.text.includes('Login belum diaktifkan') && res.text.includes('ADMIN_PASSWORD'), 'pesan penuntun harus jelas');
    assert.ok(res.text.includes('<form hidden'), 'form login harus disembunyikan');
    const api = await request('POST', '/api/admin?action=github', {usePort: p, body: {method: 'GET', path: '/'}});
    assert.equal(api.status, 503, 'proxy GitHub juga tertutup saat password belum disetel');
  } finally { server.close(); }
});

test('GET /admin tanpa sesi -> halaman login saja + header pengaman', async () => {
  const res = await request('GET', '/admin');
  assert.equal(res.status, 200);
  assert.ok(res.text.includes('Masuk Admin'), 'harus tampilan login');
  assert.ok(!res.text.includes('__SA_SECURE_ADMIN__'), 'editor panel tidak boleh terkirim tanpa login');
  assert.ok(res.headers['cache-control'].includes('no-store'), 'respons login wajib no-store');
  assert.equal(res.headers['x-frame-options'], 'DENY');
  assert.ok(res.headers['content-security-policy'].includes("frame-ancestors 'none'"));
  assert.ok(res.headers['x-robots-tag'].includes('noindex'), 'halaman admin tidak boleh diindeks');
  assert.match(cookieOf(res.headers['set-cookie'], '__Host-sai_login'), /^[a-f0-9]{48}$/, 'nonce CSRF login harus acak');
  assert.ok(!/ADMIN_PASSWORD|GITHUB_TOKEN:|ghp_/.test(res.text), 'halaman login tidak boleh memuat rahasia');
});

test('password salah -> 401, tanpa sesi', async () => {
  const res = await login('password-salah-ini-coba-coba-123', '198.51.100.20');
  assert.equal(res.status, 401, 'status harus 401');
  assert.ok(!/__Host-sai_admin=.{6,}/.test(res.setCookie), 'tidak boleh menerbitkan sesi');
  assert.ok(res.text.includes('Password belum cocok'), 'pesan harus netral');
});

test('login tanpa nonce CSRF -> 403', async () => {
  const res = await request('POST', '/api/admin?action=login', {body: 'password=' + encodeURIComponent(PASSWORD)});
  assert.equal(res.status, 403, 'login tanpa CSRF nonce harus ditolak');
});

test('Origin asing -> 403', async () => {
  const res = await request('POST', '/api/admin?action=login', {origin: 'https://penyerang.example', body: 'csrf=' + 'a'.repeat(48) + '&password=' + encodeURIComponent(PASSWORD)});
  assert.equal(res.status, 403, 'Origin lintas-domain harus ditolak');
});

test('5x password salah dari IP sama -> terkunci 15 menit (429)', async () => {
  for (let i = 0; i < 5; i++) lastStatus = (await login('salah-' + i + '-sekali-lagi-123456', '203.0.113.77')).status;
  assert.equal(lastStatus, 401, 'percobaan ke-5 masih dijawab 401, lalu dikunci');
  const blocked = await login(PASSWORD, '203.0.113.77');
  assert.equal(blocked.status, 429, 'setelah 5 kali salah, permintaan berikutnya 429 meski password benar');
  assert.ok(Number(blocked.headers['retry-after']) > 0, 'harus mengirim Retry-After');
  assert.ok(blocked.text.includes('Terlalu banyak percobaan'), 'pesan harus menjelaskan');
  assert.equal((await login(PASSWORD, '203.0.113.78')).status, 303, 'IP lain tidak ikut terblokir (pembatasan per-instance)');
});

test('login benar -> 303 + cookie HttpOnly/Secure/SameSite=Strict, TTL 1 jam', async () => {
  const res = await login(PASSWORD, '198.51.100.7');
  assert.equal(res.status, 303);
  assert.equal(res.headers.location, '/admin');
  assert.ok(/__Host-sai_admin=[^;,]{20,}/.test(res.setCookie), 'sesi harus terbit');
  assert.ok(res.setCookie.includes('HttpOnly') && res.setCookie.includes('Secure') && res.setCookie.includes('SameSite=Strict'), 'flag cookie kurang: ' + res.setCookie);
  assert.ok(res.setCookie.includes('Max-Age=3600'), 'TTL sesi 1 jam');
  assert.ok(/__Host-sai_login=;[^\n]*Max-Age=0/.test(res.setCookie), 'nonce login dibuang setelah dipakai');
  session = '__Host-sai_admin=' + cookieOf(res.headers['set-cookie'], '__Host-sai_admin');
});

test('sesi asli -> panel termuat, tanpa token GitHub di browser', async () => {
  const res = await request('GET', '/admin', {cookie: session});
  assert.equal(res.status, 200, 'panel harus terbuka dengan sesi sah');
  const ctx = contextOf(res.text);
  assert.ok(ctx, 'konteks server harus disuntikkan ke panel');
  assert.equal(ctx.endpoint, '/api/admin');
  assert.match(ctx.csrf, /^[a-f0-9]{48}$/);
  assert.ok(Number.isInteger(ctx.expiresAt) && ctx.expiresAt > Date.now(), 'expiry sesi harus ada');
  assert.equal(JSON.stringify(Object.keys(ctx).sort()), JSON.stringify(['branch', 'csrf', 'endpoint', 'expiresAt', 'githubConfigured', 'owner', 'repo']), 'isi konteks server berubah: ' + Object.keys(ctx));
  assert.equal(ctx.githubConfigured, false, 'tanpa GITHUB_TOKEN, panel wajib menandai penerbitan belum aktif');
  assert.ok(res.text.includes('<script src="/src/data.js"></script>'), 'panel memuat data terbit terbaru');
  assert.equal((await request('GET', '/api/admin?action=session', {cookie: session})).status, 200, 'pemeriksaan sesi harus 200');
});

test('token GitHub tidak pernah dikirim ke browser', async () => {
  const SECRET = 'ghp_' + 'A1b2C3d4E5'.repeat(4); // nilai uji, bukan token asli
  await withServer({env: {ADMIN_PASSWORD: PASSWORD, GITHUB_TOKEN: SECRET}}, async p => {
    const page = await request('GET', '/admin', {usePort: p});
    assert.ok(!page.text.includes(SECRET) && !/ghp_[A-Za-z0-9]{20,}/.test(page.text), 'token bocor di halaman login');
    const ok = await login(PASSWORD, '198.51.100.31', p);
    const s = '__Host-sai_admin=' + cookieOf(ok.headers['set-cookie'], '__Host-sai_admin');
    const panel = await request('GET', '/admin', {usePort: p, cookie: s});
    assert.equal(panel.status, 200);
    assert.equal(contextOf(panel.text).githubConfigured, true, 'panel harus tahu penerbitan sudah aktif');
    assert.ok(!panel.text.includes(SECRET), 'token bocor di dalam panel');
    assert.equal(JSON.stringify(Object.keys(contextOf(panel.text)).sort()), JSON.stringify(['branch', 'csrf', 'endpoint', 'expiresAt', 'githubConfigured', 'owner', 'repo']), 'konteks server tidak boleh memuat field rahasia');
  });
});

test('cookie sesi dipalsukan atau diubah -> minta login ulang', async () => {
  const value = session.split('=')[1];
  const forged = Buffer.from(JSON.stringify({v: 1, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, aud: HOST, csrf: 'a'.repeat(48)})).toString('base64url') + '.' + 'B'.repeat(43);
  for (const bad of [value.slice(0, -2) + 'xx', forged, 'x.y', '.', '']) {
    const res = await request('GET', '/admin', {cookie: '__Host-sai_admin=' + bad});
    assert.ok(res.text.includes('Masuk Admin') && !res.text.includes('__SA_SECURE_ADMIN__'), 'cookie ' + JSON.stringify(bad.slice(0, 24)) + ' seharusnya minta login ulang');
  }
});

test('sesi tidak berlaku di domain lain (terikat ke Host)', async () => {
  const res = await request('GET', '/admin', {cookie: session, host: 'salinan-sentot.example'});
  assert.ok(!res.text.includes('__SA_SECURE_ADMIN__'), 'domain lain tidak boleh memakai sesi domain asli');
});

test('sesi kedaluwarsa setelah 1 jam', async () => {
  let clock = Math.floor(Date.now() / 1000);
  await withServer({env: {ADMIN_PASSWORD: PASSWORD}, now: () => clock * 1000}, async p => {
    const ok = await login(PASSWORD, '198.51.100.90', p);
    const live = '__Host-sai_admin=' + cookieOf(ok.headers['set-cookie'], '__Host-sai_admin');
    assert.ok(live.length > 30, 'login harus menerbitkan sesi pada handler berjam');
    assert.equal((await request('GET', '/api/admin?action=session', {usePort: p, cookie: live})).status, 200, 'sesi baru harus valid');
    clock += 3601;
    const expired = await request('GET', '/api/admin?action=session', {usePort: p, cookie: live});
    assert.equal(expired.status, 401, 'sesi > 1 jam harus ditolak');
    assert.equal(JSON.parse(expired.text).requiresLogin, true, 'harus minta login ulang');
    assert.equal((await request('POST', '/api/admin?action=github', {usePort: p, cookie: live, body: {method: 'GET', path: '/'}})).status, 401, 'proxy wajib tutup setelah sesi kedaluwarsa');
    assert.ok((await request('GET', '/admin', {usePort: p, cookie: live})).text.includes('Masuk Admin'), 'panel tertutup lagi saat sesi lewat');
  });
});

test('proxy GitHub butuh sesi + CSRF + Origin + JSON', async () => {
  assert.equal((await request('POST', '/api/admin?action=github', {body: {method: 'GET', path: '/'}})).status, 401, 'tanpa sesi harus 401');
  const ctx = contextOf((await request('GET', '/admin', {cookie: session})).text);
  assert.equal((await request('POST', '/api/admin?action=github', {cookie: session, body: {method: 'GET', path: '/'}})).status, 403, 'tanpa x-csrf-token harus 403');
  assert.equal((await request('POST', '/api/admin?action=github', {cookie: session, headers: {'X-CSRF-Token': 'f'.repeat(48)}, body: {method: 'GET', path: '/'}})).status, 403, 'CSRF salah harus 403');
  assert.equal((await request('POST', '/api/admin?action=github', {cookie: session, origin: 'https://penyerang.example', headers: {'X-CSRF-Token': ctx.csrf}, body: {method: 'GET', path: '/'}})).status, 403, 'Origin asing harus 403');
  assert.equal((await request('GET', '/api/admin?action=github', {cookie: session})).status, 405, 'hanya POST yang diterima');
  const noJson = await request('POST', '/api/admin?action=github', {cookie: session, headers: {'X-CSRF-Token': ctx.csrf, 'Content-Type': 'text/plain'}, body: '{"method":"GET","path":"/"}'});
  assert.equal(noJson.status, 415, 'content-type harus JSON');
  const gated = await request('POST', '/api/admin?action=github', {cookie: session, headers: {'X-CSRF-Token': ctx.csrf}, body: {method: 'GET', path: '/git/ref/heads/main'}});
  assert.equal(gated.status, 503, 'tanpa GITHUB_TOKEN wajib 503, bukan memanggil sembarang URL (' + gated.status + ')');
});

test('proxy GitHub menolak operasi di luar penerbitan storefront', () => {
  const {validateGithub} = require(path.join(ROOT, 'server', 'auth.cjs'));
  const sha40 = 'a'.repeat(40);
  const deny = [
    ['force push', {method: 'PATCH', path: '/git/refs/heads/main', body: {sha: sha40, force: true}}],
    ['menimpa berkas server', {method: 'PUT', path: '/contents/server/auth.cjs', body: {message: 'x', branch: 'main', content: 'eA=='}}],
    ['menimpa function API', {method: 'PUT', path: '/contents/api/admin.js', body: {message: 'x', branch: 'main', content: 'eA=='}}],
    ['membaca .env', {method: 'GET', path: '/contents/.env'}],
    ['traversal jalur', {method: 'PUT', path: '/contents/..%2F..%2Fetc%2Fpasswd', body: {message: 'x', branch: 'main', content: 'eA=='}}],
    ['commit tanpa pesan', {method: 'POST', path: '/git/commits', body: {tree: sha40, parents: [sha40]}}],
    ['tree berisi berkas terlarang', {method: 'POST', path: '/git/trees', body: {base_tree: sha40, tree: [{path: 'api/admin.js', mode: '100644', type: 'blob', sha: sha40}]}}],
    ['blob bukan base64', {method: 'POST', path: '/git/blobs', body: {encoding: 'utf-8', content: 'x'}}],
    ['path lintas repo', {method: 'GET', path: '/../org/repo'}],
    ['tanpa path', {method: 'GET'}]
  ];
  for (const [label, input] of deny) assert.throws(() => validateGithub(input), 'seharusnya DITOLAK: ' + label);
  assert.deepEqual(validateGithub({method: 'GET', path: '/git/ref/heads/main'}), {method: 'GET', route: '/git/ref/heads/main'}, 'cek ref utama harus diizinkan');
  assert.equal(validateGithub({method: 'GET', path: '/contents/src/data.js?ref=main'}).route, '/contents/src/data.js?ref=main', 'baca data terbit harus diizinkan');
  assert.equal(validateGithub({method: 'PUT', path: '/contents/index.html', body: {message: 'isi toko', branch: 'main', content: 'eA==', sha: sha40}}).body.sha, sha40, 'terbit index.html + sha harus diizinkan');
});

test('logout: CSRF wajib benar, lalu sesi dicabut server', async () => {
  const fresh = await login(PASSWORD, '198.51.100.44');
  const mine = '__Host-sai_admin=' + cookieOf(fresh.headers['set-cookie'], '__Host-sai_admin');
  const ctx = contextOf((await request('GET', '/admin', {cookie: mine})).text);
  assert.ok(ctx, 'sesi baru harus bisa membuka panel');
  const bad = await request('POST', '/api/admin?action=logout', {cookie: mine, body: 'csrf=' + 'c'.repeat(48)});
  assert.equal(bad.status, 403, 'CSRF logout salah harus 403');
  assert.equal((await request('GET', '/api/admin?action=session', {cookie: mine})).status, 200, 'percobaan logout gagal tidak boleh mencabut sesi');
  const out = await request('POST', '/api/admin?action=logout', {cookie: mine, body: 'csrf=' + ctx.csrf});
  assert.equal(out.status, 303);
  assert.ok(/__Host-sai_admin=;[^\n]*Max-Age=0/.test(out.setCookie), 'cookie sesi harus dihapus');
  assert.equal(cookieOf(out.headers['set-cookie'], '__Host-sai_admin'), '', 'nilai sesi dikosongkan');
  assert.equal((await request('GET', '/api/admin?action=session', {cookie: mine})).status, 401, 'cookie lama tidak boleh dipakai lagi setelah Keluar');
  assert.ok(!(await request('GET', '/admin', {cookie: mine})).text.includes('__SA_SECURE_ADMIN__'), 'setelah logout wajib login lagi');
  assert.equal((await request('POST', '/api/admin?action=logout', {cookie: mine, body: 'csrf=' + ctx.csrf})).status, 303, 'logout ulang tetap aman (idempoten)');
});

test('aksi & metode tak dikenal ditolak rapi', async () => {
  assert.equal((await request('GET', '/api/admin?action=entah')).status, 404, 'aksi tak dikenal -> 404');
  assert.equal((await request('DELETE', '/api/admin?action=logout', {cookie: session})).status, 405, 'DELETE tidak diizinkan');
  assert.equal((await request('GET', '/api/admin?action=logout')).status, 405, 'logout wajib POST');
  assert.equal((await request('POST', '/api/admin?action=session', {cookie: session})).status, 405, 'session hanya GET');
  assert.equal((await request('GET', '/admin', {host: 'host tidak valid!'})).status, 400, 'Host header asing -> 400');
});

test('perbaikan tampilan & login: logo SC persegi, slot foto SENTOT AI berlencana SAI, spasi password diabaikan', async () => {
  const baca = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

  /* 1) logo Sofia Collection: berkas 800x800 dan benar-benar persegi */
  const logo = fs.readFileSync(path.join(ROOT, 'assets', 'logo-sc.jpg'));
  const ukuran = jpegSize(logo);
  assert.equal(ukuran.width, 800, 'lebar assets/logo-sc.jpg harus 800 px, dapat ' + ukuran.width);
  assert.equal(ukuran.height, 800, 'tinggi assets/logo-sc.jpg harus 800 px (persegi), dapat ' + ukuran.height);
  assert.ok(fs.readFileSync(path.join(ROOT, 'public', 'assets', 'logo-sc.jpg')).equals(logo), 'public/ harus memuat logo yang sama persis');

  /* 2) marka + gaya: logo tampil kotak, bukan gepeng */
  const toko = baca(path.join('public', 'index.html'));
  assert.match(toko, /<img class="brand-logo" src="assets\/logo-sc\.jpg" alt="Logo Sofia Collection" width="800" height="800">/, 'marka logo di index.html harus 800x800');
  const gaya = baca(path.join('public', 'src', 'styles.css'));
  const aturanLogo = gaya.slice(gaya.indexOf('.brand-logo{'), gaya.indexOf('}', gaya.indexOf('.brand-logo{')));
  assert.match(aturanLogo, /aspect-ratio:1\/1/, 'logo harus dipaksa persegi lewat aspect-ratio: ' + aturanLogo);
  assert.match(aturanLogo, /object-fit:cover/, 'logo harus object-fit:cover agar tidak gepeng: ' + aturanLogo);
  assert.match(aturanLogo, /width:96px;height:96px/, 'ukuran tampil logo harus sama sisi: ' + aturanLogo);

  /* 3) kartu SENTOT AI: slot foto pemilik + lencana SAI */
  assert.match(toko, /<span class="brand-photo" id="fotoSentot">/, 'slot foto pemilik belum ada di kartu SENTOT AI');
  assert.match(toko, /<img class="brand-photo-img" src="assets\/foto-sentot\.jpg"[^>]*alt="Foto Sentot, pemilik SENTOT AI"/, 'slot harus menunjuk assets/foto-sentot.jpg dengan alt yang jelas');
  assert.match(toko, /<span class="brand-badge" title="SENTOT AI">SAI<\/span>/, 'lencana SAI harus menempel di slot foto');
  for (const aturan of ['.brand-photo{', '.brand-photo-img{', '.brand-badge{', '.brand-photo.is-kosong .brand-photo-img{', '.brand-photo-fallback{'])
    assert.ok(gaya.includes(aturan), 'gaya slot foto belum lengkap, kurang ' + aturan);
  const aturanFoto = gaya.slice(gaya.indexOf('.brand-photo{'), gaya.indexOf('}', gaya.indexOf('.brand-photo{')));
  assert.match(aturanFoto, /aspect-ratio:1\/1/, 'slot foto juga harus persegi: ' + aturanFoto);
  const aplikasi = baca(path.join('public', 'src', 'app.js'));
  assert.ok(aplikasi.includes('function siapkanFotoPemilik()'), 'fallback slot foto (bila berkas belum diunggah) belum ada di app.js');
  assert.match(aplikasi, /renderKeranjang\(\);\n  siapkanFotoPemilik\(\);/, 'siapkanFotoPemilik() harus dipanggil saat init');

  /* 4) salinan di dalam panel tidak basi — "Terbitkan" tidak boleh membatalkan perbaikan ini */
  assert.equal(panelCopy('TEMPLATE_MULTI'), baca('index.html'), 'TEMPLATE_MULTI di panel berbeda dari index.html');
  assert.equal(panelCopy('APLIKASI'), baca('src/app.js'), 'APLIKASI di panel berbeda dari src/app.js');
  assert.equal(panelCopy('GAYA'), baca('src/styles.css'), 'GAYA di panel berbeda dari src/styles.css');
  const panel = JSON.parse(baca(path.join('server', 'panel-template.json'))).html;
  const b64Logo = panel.match(/"assets\/logo-sc\.jpg":\{"mime":"image\/jpeg","b64":"([^"]+)"/);
  assert.ok(b64Logo, 'ASET panel harus menyimpan logo SC');
  assert.ok(Buffer.from(b64Logo[1], 'base64').equals(logo), 'salinan logo di panel masih versi lama');

  /* 5) spasi di sekitar password admin diabaikan, syarat panjang tetap dihitung setelah dirapikan */
  await withServer({env: {ADMIN_PASSWORD: '  password-uji-lokal-12345678  '}}, async p => {
    assert.equal((await login('password-uji-lokal-12345678', '198.51.100.61', p)).status, 303, 'password tanpa spasi harus tetap cocok walau ADMIN_PASSWORD tersimpan dengan spasi');
    assert.equal((await login('  password-uji-lokal-12345678\n', '198.51.100.62', p)).status, 303, 'spasi/enter yang ikut terkirim saat login harus diabaikan');
    assert.equal((await login('password-uji-lokal-1234567', '198.51.100.63', p)).status, 401, 'password salah tetap harus ditolak');
  });
  await withServer({env: {ADMIN_PASSWORD: '     terlalu-pendek     '}}, async p => {
    assert.equal((await request('GET', '/admin', {usePort: p})).status, 503, 'panjang minimum 16 karakter dihitung setelah spasi dibuang');
  });
});

(async () => {
  cp.execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'vercel-build.cjs')], {cwd: ROOT, env: {ADMIN_PASSWORD: PASSWORD, PATH: process.env.PATH}});
  const {createHandler} = require(path.join(ROOT, 'server', 'auth.cjs'));
  const server = http.createServer(createHandler({env: {ADMIN_PASSWORD: PASSWORD}}));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
  let pass = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass++; console.log('  \x1b[32m✓\x1b[0m ' + name); }
    catch (e) { console.log('  \x1b[31m✗\x1b[0m ' + name + '\n      ' + String(e.message || e).split('\n').slice(0, 5).join('\n      ')); }
  }
  server.close();
  console.log('\n' + pass + '/' + tests.length + ' uji keamanan' + (pass === tests.length ? ' lolos — panel siap terbit dengan password' : ' gagal — perbaiki sebelum terbit'));
  process.exit(pass === tests.length ? 0 : 1);
})();
