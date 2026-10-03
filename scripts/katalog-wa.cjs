'use strict';
/* =====================================================================
   KATALOG-WA — menyiapkan isi website menjadi katalog WhatsApp Business
   ---------------------------------------------------------------------
   WhatsApp Business tidak bisa "diimpor" dari luar (katalognya diketik
   langsung di aplikasi WA Business milik toko), jadi skrip ini menyiapkan
   segala sesuatu supaya memasukkan SEMUA produk www.sentot.my.id ke
   katalog WA Business tinggal salin-tempel:

     1. Membaca data website dari src/data.js.
     2. Menyamakan blok <script> index.html dengan src/app.js (fitur
        tautan langsung ?produk=ID ikut terpasang di halaman publik).
     3. Membuat katalog-wa.html  — dokumen siap pakai: langkah-langkah di
        aplikasi WA Business + kartu per produk (foto, nama, harga,
        deskripsi, tautan, kode) dengan tombol SALIN di tiap kolom.
     4. Membuat katalog-wa.txt   — versi teks polos, enak disalin dari HP.

   Jalankan dari akar repo setiap kali data produk berubah:
     node scripts/katalog-wa.cjs
     node scripts/sync-panel.cjs
     ADMIN_PASSWORD='...' node scripts/test-auth.cjs
   ===================================================================== */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const P = rel => path.join(ROOT, rel);
const baca = rel => fs.readFileSync(P(rel), 'utf8');
const tulis = (rel, isi) => fs.writeFileSync(P(rel), isi);

const SITUS = 'https://sentot.my.id';
const rupiah = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- 1. baca data website ---------- */
const dataJs = baca('src/data.js');
const kotak = {};
new Function('window', dataJs + '\nreturn window.SA_DATA;')(kotak);
const DATA = kotak.SA_DATA;
if (!DATA || !Array.isArray(DATA.PRODUK) || !DATA.PRODUK.length) throw new Error('src/data.js tidak memuat PRODUK');
const PROFIL = DATA.PROFIL || {};
const KATEGORI = DATA.KATEGORI || [];
const namaKategori = id => (KATEGORI.find(k => k.id === id) || {}).nama || 'Lainnya';

/* ---------- 2. index.html: logika = src/app.js ---------- */
const appJs = baca('src/app.js');
let html = baca('index.html');
const iSkrip0 = html.lastIndexOf('<script>') + '<script>'.length;
const iSkrip1 = html.indexOf('</script>', iSkrip0);
if (iSkrip0 < 8 || iSkrip1 < 0) throw new Error('Blok <script> storefront tidak ditemukan di index.html');
html = html.slice(0, iSkrip0) + '\n' + appJs.trimEnd() + '\n' + html.slice(iSkrip1);
tulis('index.html', html);

/* ---------- 3. susun isi katalog ---------- */
const tautanProduk = p => `${SITUS}/?produk=${encodeURIComponent(p.id)}`;
const deskripsiWA = p => {
  let d = String(p.deskripsi || '').trim();
  if (Array.isArray(p.varian) && p.varian.length) d += '\nPilihan: ' + p.varian.join(', ');
  return d;
};

const kartu = DATA.PRODUK.map((p, i) => ({
  nomor: i + 1,
  id: p.id,
  kategori: namaKategori(p.kategori),
  nama: String(p.nama || '').trim(),
  foto: p.gambar ? `${SITUS}/${p.gambar}` : '',
  fotoLokal: p.gambar || '',
  adaHarga: Number(p.harga) > 0,
  hargaTampil: Number(p.harga) > 0 ? rupiah(p.harga) : 'Belum ada harga',
  hargaSalin: Number(p.harga) > 0 ? String(Math.round(p.harga)) : '',
  deskripsi: deskripsiWA(p),
  tautan: tautanProduk(p),
}));

const DATA_SALIN = {};
for (const k of kartu) {
  DATA_SALIN[k.id] = {
    nama: k.nama,
    harga: k.hargaSalin,
    deskripsi: k.deskripsi,
    tautan: k.tautan,
    kode: k.id,
    semua: [
      `Nama: ${k.nama}`,
      `Harga: ${k.adaHarga ? k.hargaSalin : '(kosongkan — tanya harga)'}`,
      `Deskripsi: ${k.deskripsi}`,
      `Tautan: ${k.tautan}`,
      `Kode item: ${k.id}`
    ].join('\n')
  };
}

/* ---------- 4. katalog-wa.html ---------- */
const grup = [];
for (const kat of KATEGORI.filter(k => k.id !== 'semua')) {
  const isi = kartu.filter(k => k.kategori === kat.nama);
  if (isi.length) grup.push({ nama: kat.nama, isi });
}
for (const k of kartu.filter(k => !grup.some(g => g.isi.includes(k)))) {
  let lain = grup.find(g => g.nama === 'Lainnya');
  if (!lain) grup.push((lain = { nama: 'Lainnya', isi: [] }));
  lain.isi.push(k);
}

const htmlKartu = k => `
<article class="card" id="p-${esc(k.id)}">
  <div class="foto">
    ${k.foto ? `<img src="${esc(k.foto)}" alt="${esc(k.nama)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(k.fotoLokal)}'">` : '<div class="nofoto">tanpa foto</div>'}
  </div>
  <div class="isi">
    <div class="top"><span class="nomor">#${k.nomor}</span><span class="kat">${esc(k.kategori)}</span>
      <button class="btn semua" onclick="salin('${esc(k.id)}','semua',this)">Salin semua</button></div>
    <h3>${esc(k.nama)}</h3>
    <table>
      <tr><th>Nama</th><td><code>${esc(k.nama)}</code></td>
          <td><button class="btn" onclick="salin('${esc(k.id)}','nama',this)">Salin</button></td></tr>
      <tr><th>Harga</th><td>${k.adaHarga
            ? `<code>${esc(k.hargaSalin)}</code> <small>(tampil ${esc(k.hargaTampil)})</small>`
            : '<span class="nol">Belum ada harga — kosongkan kolom harga di WA</span>'}
          </td><td>${k.adaHarga ? `<button class="btn" onclick="salin('${esc(k.id)}','harga',this)">Salin</button>` : ''}</td></tr>
      <tr><th>Deskripsi</th><td><pre>${esc(k.deskripsi)}</pre></td>
          <td><button class="btn" onclick="salin('${esc(k.id)}','deskripsi',this)">Salin</button></td></tr>
      <tr><th>Tautan</th><td><code class="link">${esc(k.tautan)}</code><br><small>Di WA Business buka langsung halaman produk ini di website</small></td>
          <td><button class="btn" onclick="salin('${esc(k.id)}','tautan',this)">Salin</button></td></tr>
      <tr><th>Kode item</th><td><code>${esc(k.id)}</code> <small>(opsional)</small></td>
          <td><button class="btn" onclick="salin('${esc(k.id)}','kode',this)">Salin</button></td></tr>
    </table>
  </div>
</article>`;

const htmlDoc = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Katalog WhatsApp Business — ${esc(PROFIL.brandToko || 'SOFIA COLLECTION')}</title>
<style>
:root{--wa:#128C7E;--wa-d:#075E54;--ink:#1f2a28;--muted:#5c6b68;--bg:#f4f7f6;--card:#fff;--line:#e2e8e6}
*{box-sizing:border-box}
body{margin:0;font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);background:var(--bg)}
.wrap{max-width:900px;margin:0 auto;padding:28px 18px 80px}
header.hero{background:var(--wa-d);color:#fff;border-radius:18px;padding:28px 26px;margin-bottom:26px}
header.hero h1{margin:0 0 8px;font-size:1.5rem}
header.hero p{margin:6px 0;opacity:.92}
.badge{display:inline-block;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:3px 12px;font-size:.8rem;margin:2px 6px 2px 0}
h2{font-size:1.15rem;margin:36px 0 10px;color:var(--wa-d)}
ol li,ul li{margin:7px 0}
.card{display:flex;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin:14px 0}
.foto{flex:0 0 130px}
.foto img{width:130px;height:130px;object-fit:cover;border-radius:12px;background:#eee}
.nofoto{width:130px;height:130px;border-radius:12px;background:#eee;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.8rem}
.isi{flex:1;min-width:0}
.top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.nomor{font-weight:700;color:var(--wa-d)}
.kat{font-size:.75rem;background:#e7f3f1;color:var(--wa-d);border-radius:999px;padding:2px 10px}
.card h3{margin:6px 0 8px;font-size:1.05rem}
table{width:100%;border-collapse:collapse}
th{width:92px;text-align:left;vertical-align:top;color:var(--muted);font-weight:600;font-size:.85rem;padding:5px 8px 5px 0}
td{padding:5px 8px;border-top:1px solid var(--line);vertical-align:top;font-size:.92rem;word-break:break-word}
td:last-child{width:86px;text-align:right;border-left:none}
code{background:#f0f4f3;border-radius:6px;padding:1px 6px;font-size:.88em}
code.link{color:var(--wa-d)}
pre{margin:0;white-space:pre-wrap;font:inherit;font-size:.92rem}
small{color:var(--muted)}
.nol{color:#b3541e;font-weight:600}
.btn{border:1px solid var(--wa);background:#fff;color:var(--wa-d);border-radius:8px;padding:4px 12px;font-size:.8rem;font-weight:650;cursor:pointer}
.btn:hover{background:#e7f3f1}
.btn.semua{margin-left:auto;background:var(--wa);color:#fff}
.btn.semua:hover{background:var(--wa-d)}
.kotak{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin:12px 0}
details{margin:8px 0}
summary{cursor:pointer;font-weight:650;color:var(--wa-d)}
footer{margin-top:40px;color:var(--muted);font-size:.85rem;text-align:center}
@media(max-width:640px){.card{flex-direction:column}.foto img,.nofoto{width:100%;height:180px}}
@media print{.btn{display:none}body{background:#fff}}
</style>
</head>
<body>
<div class="wrap">

<header class="hero">
  <h1>📦 Isi Katalog WhatsApp Business — ${esc(PROFIL.brandToko || 'SOFIA COLLECTION')}</h1>
  <p>Semua <strong>${kartu.length} produk</strong> dari <strong>${SITUS}</strong> sudah disiapkan di bawah, tinggal
  <em>salin-tempel</em> ke katalog WA Business Anda (nomor ${esc(PROFIL.wa || '')}).</p>
  <p>
    <span class="badge">✓ Nama</span><span class="badge">✓ Harga</span><span class="badge">✓ Deskripsi + varian</span>
    <span class="badge">✓ Tautan langsung ke produk</span><span class="badge">✓ Kode item</span>
  </p>
  <p style="font-size:.85rem">Dibuat otomatis dari data website, ${esc(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))}.
  Ada versi teks polos juga: <code style="background:rgba(255,255,255,.15);color:#fff">katalog-wa.txt</code>.</p>
  <p style="font-size:.85rem;margin-top:10px">⚡ <strong>Jalur lebih cepat:</strong> lewat Meta Commerce Manager semua produk bisa masuk
  sekaligus lewat satu berkas feed — tidak perlu salin-tempel satu-satu. Lihat <code style="background:rgba(255,255,255,.15);color:#fff">katalog-meta.csv</code>
  dan README bagian 1d.</p>
</header>

<h2>Langkah 1 · Siapkan foto produk dulu</h2>
<div class="kotak">
  <ul>
    <li><strong>Paling gampang:</strong> buka <code>${SITUS}</code> di HP → tekan lama foto produk → <em>Download gambar / Simpan gambar</em>. Foto utama + foto galeri (tombol 📷) semuanya boleh dipakai — WA menerima <strong>sampai 10 foto per item</strong>.</li>
    <li>Atau pakai berkas foto dari folder <code>assets/img/</code> repositori ini (kirim ke HP via WA/email dulu).</li>
  </ul>
</div>

<h2>Langkah 2 · Buka katalog di WhatsApp Business</h2>
<div class="kotak">
  <details open><summary>Android</summary>
    <ol><li>Buka aplikasi <strong>WhatsApp Business</strong> → ⋮ (titik tiga) → <strong>Setelan / Pengaturan</strong>.</li>
    <li><strong>Fitur Bisnis</strong> (atau <em>Alat Bisnis</em>) → <strong>Katalog</strong>.</li>
    <li><strong>Tambah item baru</strong> → ketuk ➕ → <strong>Tambahkan gambar</strong> (pilih dari galeri).</li>
    <li>Isi <em>Nama, Harga, Deskripsi, Tautan, Kode item</em> dengan menyalin dari kartu di bawah.</li>
    <li><strong>Simpan</strong>. Ulangi untuk tiap produk.</li></ol>
  </details>
  <details><summary>iPhone</summary>
    <ol><li>Buka <strong>WhatsApp Business</strong> → <strong>Pengaturan</strong> (pojok kanan bawah).</li>
    <li><strong>Fitur Bisnis</strong> → <strong>Katalog</strong> → <strong>Tambah item baru</strong>.</li>
    <li><strong>Tambah gambar</strong> → pilih foto dari galeri HP.</li>
    <li>Isi <em>Nama, Harga, Deskripsi, Tautan, Kode item</em> dari kartu di bawah → <strong>Simpan</strong>.</li></ol>
  </details>
  <details><summary>WhatsApp Web / Desktop</summary>
    <ol><li>Klik ⋮ di atas daftar chat → <strong>Katalog</strong> → <strong>Tambahkan item baru</strong>.</li>
    <li>Unggah foto, isi nama/harga/deskripsi/tautan/kode → <strong>TAMBAHKAN KE KATALOG</strong>.</li></ol>
  </details>
  <p style="margin-bottom:0"><small>Katalog bisa ditinjau dulu oleh WhatsApp sebelum tampil publik — ini normal dan biasanya cepat.</small></p>
</div>

<h2>Langkah 3 · Setelah semua produk masuk</h2>
<div class="kotak">
  <ul>
    <li><strong>Bagikan link katalog:</strong> di halaman Katalog, ketuk ikon 🔗 → kirim linknya ke pelanggan / pasang di status &amp; bio.</li>
    <li><strong>Cantumkan website di profil bisnis:</strong> Pengaturan → <strong>Profil Bisnis</strong> → isi kolom situs web dengan <code>${SITUS}</code>.</li>
    <li>Pelanggan yang mengetuk <em>Tautan</em> pada item katalog akan langsung membuka halaman produk itu di website (bukan sekadar beranda).</li>
  </ul>
</div>

<h2>Langkah 4 · Salin-tempel ${kartu.length} produk di bawah</h2>
<p style="color:var(--muted);margin-top:0">Urutan mengikuti kategori website. Tombol <strong>Salin</strong> menyalin isi kolom persis seperti yang diminta WA Business.
Untuk produk yang belum ada harganya, <strong>kosongkan kolom harga</strong> — keterangannya sudah tertulis di deskripsi.</p>
${grup.map(g => `<h2 style="margin-top:28px">${esc(g.nama)} <small style="color:var(--muted);font-weight:400">(${g.isi.length} produk)</small></h2>${g.isi.map(htmlKartu).join('')}`).join('')}

<footer>Dibuat otomatis oleh <code>scripts/katalog-wa.cjs</code> dari <code>src/data.js</code> — jalankan ulang bila produk berubah.</footer>
</div>

<script>
const DATA_SALIN = ${JSON.stringify(DATA_SALIN).replace(/</g, '\\u003c')};
function salin(id, medan, tombol) {
  const teks = (DATA_SALIN[id] || {})[medan] || "";
  const asli = tombol.textContent;
  const selesai = ok => { tombol.textContent = ok ? "✓ Tersalin" : "Gagal — salin manual"; setTimeout(() => (tombol.textContent = asli), 1600); };
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = teks; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta); selesai(ok);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(teks).then(() => selesai(true), fallback);
  } else fallback();
}
</script>
</body>
</html>
`;
tulis('katalog-wa.html', htmlDoc);

/* ---------- 5. katalog-wa.txt ---------- */
const baris = [];
baris.push('==========================================================');
baris.push(`KATALOG WHATSAPP BUSINESS — ${PROFIL.brandToko || 'SOFIA COLLECTION'}`);
baris.push(`Sumber: ${SITUS} · WA: ${PROFIL.wa || '-'}`);
baris.push(`Dibuat: ${new Date().toISOString().slice(0, 10)} · Total ${kartu.length} produk`);
baris.push('==========================================================', '');
baris.push('CARA PAKAI:');
baris.push('1. Di aplikasi WhatsApp Business: Pengaturan > Fitur Bisnis > Katalog > Tambah item baru.');
baris.push('2. Unggah foto produk (pakai foto di website: tekan lama fotonya > simpan). Maksimal 10 foto per item.');
baris.push('3. Salin Nama, Harga (angka saja), Deskripsi, Tautan, dan Kode dari daftar di bawah.');
baris.push('4. Simpan. Ulangi untuk tiap produk.');
baris.push('5. Bila semua sudah masuk: bagikan link katalog (ikon 🔗 di halaman Katalog) dan cantumkan website di Profil Bisnis.', '');
let grupTeks = '';
for (const g of grup) {
  grupTeks += `\n========== ${g.nama.toUpperCase()} (${g.isi.length} produk) ==========\n`;
  for (const k of g.isi) {
    grupTeks += [
      `--- [${k.nomor}] ${k.nama} ---`,
      `Nama     : ${k.nama}`,
      `Harga    : ${k.adaHarga ? k.hargaSalin : '(kosongkan — belum ada harga)'}`,
      `Deskripsi: ${k.deskripsi.replace(/\n/g, ' | ')}`,
      `Tautan   : ${k.tautan}`,
      `Kode     : ${k.id}`, ''
    ].join('\n');
  }
}
baris.push(grupTeks);
tulis('katalog-wa.txt', baris.join('\n'));

console.log([
  `Selesai.`,
  `• index.html: blok logika disamakan dengan src/app.js (tautan langsung ?produk=ID ikut terpasang)`,
  `• katalog-wa.html: ${kartu.length} produk dalam ${grup.length} kategori, siap salin-tempel ke WA Business`,
  `• katalog-wa.txt: versi teks polos`,
  `Lanjutan: node scripts/sync-panel.cjs && ADMIN_PASSWORD='...' node scripts/test-auth.cjs`
].join('\n'));
