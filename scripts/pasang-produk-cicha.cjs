'use strict';
/* =====================================================================
   PASANG PRODUK CICHA (tokocicha.my.id) KE WEBSITE SENTOT AI
   ---------------------------------------------------------------------
   Menambahkan 13 barang dagangan Candraningrum (tokocicha.my.id) ke
   katalog sentot.my.id — TANPA memindahkan halaman lain dari situs itu
   (profil pemilik, artikel, layanan titip beli, keagenan VMA/Bumida tidak
   dibawa, sesuai permintaan).

   Yang dikerjakan skrip ini:
     1. Foto produk di assets/img/cicha/ dipakai sebagai berkas biasa.
     2. Foto bawaan yang tadinya tertanam sebagai data URI besar di
        index.html ditukar ke berkas di assets/img — isinya identik
        (dicocokkan lewat MD5), jadi halaman jadi jauh lebih ringan.
     3. Data website disamakan dengan src/data.js (sumber isi terlengkap:
        25 produk bergaleri + 5 layanan jasa), lalu ditambah 13 produk dan
        3 kategori dari tokocicha.my.id.
     4. index.html disamakan dengan sumbernya: gaya dari src/styles.css dan
        logika dari src/app.js, plus perbaikan marka yang diperiksa
        scripts/test-auth.cjs — logo SC 800x800, slot foto pemilik
        ber-lencana SAI, dan tombol pengelola yang menuju /admin.
     5. Logika tampilan kecil: produk yang harganya belum ada diberi label
        "Tanya harga" dan produk baru yang belum punya angka penjualan
        tidak lagi menampilkan "Rp0" atau "undefined".

   Jalankan sekali dari akar repo:
     node scripts/pasang-produk-cicha.cjs
   Setelah itu WAJIB:
     node scripts/sync-panel.cjs
     ADMIN_PASSWORD='...' node scripts/test-auth.cjs
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const P = rel => path.join(ROOT, rel);
const baca = rel => fs.readFileSync(P(rel), 'utf8');
const tulis = (rel, isi) => fs.writeFileSync(P(rel), isi);

/* ---------- kategori & produk baru ---------- */
const LABEL_KATEGORI = [
  { id: 'skincare',    nama: 'Skincare & Kecantikan', ico: 'sparkle' },
  { id: 'kewanitaan',  nama: 'Perawatan Kewanitaan',  ico: 'drop' },
  { id: 'rumahtangga', nama: 'Rumah Tangga',          ico: 'box' }
];

const foto = slug => 'assets/img/cicha/' + slug + '.jpg';

const PRODUK_BARU = [
  {
    id: 'misschique-retinol-serum', nama: 'Misschique Encapsulated Retinol Serum 20 ml', kategori: 'skincare',
    harga: 190000, hargaCoret: 0, gambar: foto('misschique-encapsulated-retinol-serum'),
    galeri: [], badge: 'Baru', varian: ['20 ml'],
    deskripsi: 'Serum retinol terenkapsulasi 5% + Niacinamide 4% — membantu meremajakan kulit dengan lembut dan minim iritasi.'
  },
  {
    id: 'misschique-peeling-serum', nama: 'Misschique Peeling Serum 20 ml', kategori: 'skincare',
    harga: 130000, hargaCoret: 0, gambar: foto('misschique-peeling-serum'),
    galeri: [], badge: 'Baru', varian: ['20 ml'],
    deskripsi: 'Peeling serum multi-acid: 5% AHA · 0,5% BHA · 2% PHA — eksfoliasi lembut, termasuk untuk kulit sensitif.'
  },
  {
    id: 'ichiboss-papaya-soap', nama: 'ICHIBOSS Papaya Brightening Soap', kategori: 'skincare',
    harga: 38500, hargaCoret: 0, gambar: foto('ichiboss-papaya-brightening-soap'),
    galeri: [], badge: 'Baru', varian: ['1 pcs'],
    deskripsi: 'Sabun perawatan kulit cerah & glowing — membantu mencerahkan, menyamarkan noda hitam dan bekas jerawat, serta melembapkan.'
  },
  {
    id: 'ichiboss-tea-tree-soap', nama: 'ICHIBOSS Tea Tree Acne Care Soap 50 g', kategori: 'skincare',
    harga: 38500, hargaCoret: 0, gambar: foto('ichiboss-tea-tree-acne-care-soap'),
    galeri: [], badge: 'Baru', varian: ['50 g'],
    deskripsi: 'Sabun perawatan kulit berjerawat — melawan bakteri penyebab jerawat, mengurangi minyak, dan menjaga kelembapan kulit.'
  },
  {
    id: 'bavvoc-spray-bubble-gum', nama: 'Bavvoc Feminine Spray Bubble Gum 10 ml', kategori: 'kewanitaan',
    harga: 38500, hargaCoret: 0, gambar: foto('bavvoc-feminine-spray-bubble-gum'),
    galeri: [], badge: 'Baru', varian: ['10 ml'],
    deskripsi: 'Spray area kewanitaan bebas alkohol & bebas kimia — pH balance dengan aroma bubble gum yang manis.'
  },
  {
    id: 'bavvoc-spray-strawberry', nama: 'Bavvoc Feminine Spray Strawberry 10 ml', kategori: 'kewanitaan',
    harga: 38500, hargaCoret: 0, gambar: foto('bavvoc-feminine-spray-strawberry'),
    galeri: [], badge: 'Baru', varian: ['10 ml'],
    deskripsi: 'Spray area kewanitaan bebas alkohol & bebas kimia — pH balance dengan aroma strawberry yang segar.'
  },
  {
    id: 'bavvoc-spray-vanilla', nama: 'Bavvoc Feminine Spray Vanilla 10 ml', kategori: 'kewanitaan',
    harga: 39500, hargaCoret: 0, gambar: foto('bavvoc-feminine-spray-vanilla'),
    galeri: [], badge: 'Baru', varian: ['10 ml'],
    deskripsi: 'Spray area kewanitaan bebas alkohol & bebas kimia — pH balance dengan aroma vanilla yang lembut.'
  },
  {
    id: 'bavvoc-feminine-wash', nama: 'Bavvoc Pure Essence Feminine Wash', kategori: 'kewanitaan',
    harga: 55780, hargaCoret: 0, gambar: foto('bavvoc-pure-essence-feminine-wash'),
    galeri: [], badge: 'Baru', varian: ['1 botol'],
    deskripsi: 'Pembersih area kewanitaan dengan 3 bahan aktif + 10 ekstrak alami — pH balance, membantu mencerahkan, dan perlindungan anti bakteri.'
  },
  {
    id: 'bavvoc-lumi-veil', nama: 'Bavvoc Lumi Veil — Soft Care Brighter Arm 10 g', kategori: 'skincare',
    harga: 0, hargaCoret: 0, gambar: foto('bavvoc-lumi-veil'),
    galeri: [], badge: 'Baru', varian: ['10 g'],
    deskripsi: 'Krim perawatan lembut yang membantu mencerahkan & melembapkan kulit — gentle on skin untuk pemakaian harian. Stok sedang kosong: tetap bisa chat untuk PO atau kabar stok berikutnya.'
  },
  {
    id: 'optimo-toilet-cleaner', nama: 'ÓPTIMO+ Toilet Cleaner 1000 ml', kategori: 'rumahtangga',
    harga: 62000, hargaCoret: 0, gambar: foto('optimo-toilet-cleaner'),
    galeri: [], badge: 'Baru', varian: ['1000 ml'],
    deskripsi: 'Penghilang noda membandel, kerak, karat & bekas sabun pada kamar mandi — bersih, higienis, dan berkilau.'
  },
  {
    id: 'optimo-oxi-bleach', nama: 'ÓPTIMO+ Oxi-Bleach 500 gr', kategori: 'rumahtangga',
    harga: 35000, hargaCoret: 0, gambar: foto('optimo-oxi-bleach'),
    galeri: [], badge: 'Baru', varian: ['500 gr'],
    deskripsi: 'Penghilang noda pakaian berbasis oksigen — bersih maksimal, pakaian kembali seperti baru.'
  },
  {
    id: 'optimo-multi-spray', nama: 'ÓPTIMO+ Multi Spray Perfume 60 ml', kategori: 'rumahtangga',
    harga: 18500, hargaCoret: 0, gambar: foto('optimo-multi-spray-perfume'),
    galeri: [], badge: 'Baru', varian: ['60 ml'],
    deskripsi: 'Penghilang bau tak sedap + pewangi tahan lama untuk helm, sofa, sepatu, bantal, dan permukaan lain.'
  },
  {
    id: 'optimo-multi-cleaner', nama: 'ÓPTIMO+ Multi Cleaner 100 ml', kategori: 'rumahtangga',
    harga: 28000, hargaCoret: 0, gambar: foto('optimo-multi-cleaner'),
    galeri: [], badge: 'Baru', varian: ['100 ml'],
    deskripsi: 'Pembersih noda serbaguna berbentuk busa — cepat, praktis, tanpa dibilas.'
  }
];

/* ---------- tambalan kecil pada logika tampilan ---------- */
const HELPER = [
  'const hargaTeks = p => (Number(p.harga) > 0 ? rupiah(p.harga) : "Tanya harga");',
  '/* Baris rating hanya tampil bila datanya ada — produk yang baru ditambahkan belum punya angka penjualan. */',
  'const rateHtml = p => (p.rating || p.terjual)',
  '  ? `<div class="rate"><span class="stars">★★★★★</span> ${p.rating ? p.rating : ""}${p.rating && p.terjual ? " · " : ""}${p.terjual ? esc(p.terjual) + " terjual" : ""}</div>`',
  '  : "";'
].join('\n');

const TAMBALAN = [
  [1, 'const rupiah = n => "Rp" + Math.round(n).toLocaleString("id-ID");',
      'const rupiah = n => "Rp" + Math.round(n).toLocaleString("id-ID");\n' + HELPER],
  [2, '<div class="rate"><span class="stars">★★★★★</span> ${p.rating} · ${esc(p.terjual)} terjual</div>',
      '${rateHtml(p)}'],
  [1, 'const old = p.hargaCoret ?', 'const old = p.hargaCoret && p.harga > 0 ?'],
  [1, 'const hemat = p.hargaCoret ?', 'const hemat = p.hargaCoret && p.harga > 0 ?'],
  [1, '<span class="price">${rupiah(p.harga)}</span>', '<span class="price">${hargaTeks(p)}</span>'],
  [2, '• Harga: ${rupiah(p.harga)}', '• Harga: ${p.harga > 0 ? rupiah(p.harga) : "mohon info harga terbaru"}'],
  [1, '<div class="detail-price">${rupiah(p.harga)}', '<div class="detail-price">${hargaTeks(p)}'],
  [1, 'Bebas alkohol &amp; dipilih dari supplier terpercaya',
      '${p.kategori === "rumahtangga" ? "Aman dipakai sesuai petunjuk &amp; dipilih dari supplier terpercaya" : "Bebas alkohol &amp; dipilih dari supplier terpercaya"}'],
  [1, 'const harga = p => p.harga;', 'const harga = p => (p.harga > 0 ? p.harga : Infinity);'],
  [1, 'parseFloat(b.terjual) - parseFloat(a.terjual)', '(parseFloat(b.terjual) || 0) - (parseFloat(a.terjual) || 0)'],
  [1, '<div class="cp">${rupiah(i.harga)}', '<div class="cp">${i.harga > 0 ? rupiah(i.harga) : "harga menyusul"}'],
  [1, '${i.qty} x ${rupiah(i.harga)} = ${rupiah(i.harga * i.qty)}',
      '${i.qty} x ${i.harga > 0 ? rupiah(i.harga) + " = " + rupiah(i.harga * i.qty) : "(harga menyusul)"}']
];

const tambalKode = (kode, nama) => {
  for (const [minimal, dari, ke] of TAMBALAN) {
    const jumlah = kode.split(dari).length - 1;
    if (jumlah < minimal) throw new Error(`${nama}: pola tidak ditemukan (${jumlah}x) → ${dari.slice(0, 70)}`);
    kode = kode.split(dari).join(ke);
  }
  return kode;
};

/* ---------- marka yang diperiksa scripts/test-auth.cjs ---------- */
const TOMBOL_LAMA = 'href="https://sentot.my.id/panel-sentot-2026.html"';
const TOMBOL_BARU = 'href="https://sentot.my.id/admin"';
const TOMBOL_CADANGAN = {
  dari: '    <div class="foot-bottom">',
  ke: [
    '    <div class="footer-admin">',
    '      <a class="admin-link" href="https://sentot.my.id/admin" rel="nofollow noopener">',
    '        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="m9.5 3-.5 2a8 8 0 0 0-1.6.9l-2-.6-2.5 4.3 1.5 1.5a8 8 0 0 0 0 1.8l-1.5 1.5 2.5 4.3 2-.6A8 8 0 0 0 9 19l.5 2h5l.5-2a8 8 0 0 0 1.6-.9l2 .6 2.5-4.3-1.5-1.5a8 8 0 0 0 0-1.8l1.5-1.5-2.5-4.3-2 .6A8 8 0 0 0 15 5l-.5-2z"/></svg>',
    '        <span>Admin</span>',
    '      </a>',
    '    </div>',
    '',
    '    <div class="foot-bottom">'
  ].join('\n')
};
const MARKA_LOGO = [
  /<img class="brand-logo" src="assets\/logo-sc\.jpg" alt="Logo Sofia Collection"[^>]*>/,
  '<img class="brand-logo" src="assets/logo-sc.jpg" alt="Logo Sofia Collection" width="800" height="800">'
];
const SLOT_FOTO = {
  dari: '<span class="brand-mark" style="width:56px;height:56px;flex:0 0 56px;border-radius:15px;margin-bottom:14px;font-size:1.1rem">SAI</span>',
  ke: [
    '<span class="brand-photo" id="fotoSentot">',
    '          <img class="brand-photo-img" src="assets/foto-sentot.jpg" alt="Foto Sentot, pemilik SENTOT AI">',
    '          <span class="brand-photo-fallback" aria-hidden="true">S</span>',
    '          <span class="brand-badge" title="SENTOT AI">SAI</span>',
    '        </span>'
  ].join('\n')
};

/* ================= jalankan ================= */
const _t = Date.now();
const lap = [];

/* --- src/app.js: tambalan logika tampilan --- */
const appJs = tambalKode(baca('src/app.js'), 'src/app.js');
tulis('src/app.js', appJs);

/* --- data: ambil dari src/data.js (sumber isi terlengkap), lalu ditambah --- */
const dataJs = baca('src/data.js');
const kotakAwal = {};
new Function('window', dataJs + '\nreturn window.SA_DATA;')(kotakAwal);
const data = kotakAwal.SA_DATA;
for (const k of LABEL_KATEGORI) if (!data.KATEGORI.some(x => x.id === k.id)) data.KATEGORI.push({ ...k });
for (const p of PRODUK_BARU) if (!data.PRODUK.some(x => x.id === p.id)) data.PRODUK.push({ ...p });
data._t = _t;

/* --- index.html --- */
const stylesCss = baca('src/styles.css');
const AWAL = '/*__SA_DATA_START__*/', AKHIR = '/*__SA_DATA_END__*/';
let html = baca('index.html');
if (html.indexOf(AWAL) < 0 || html.indexOf(AKHIR) < 0) throw new Error('Penanda data di index.html tidak ditemukan');

/* Semua foto yang tertanam di index.html ditukar ke berkas di assets/ —
   isinya identik (MD5), jadi tampilan tidak berubah tapi halaman jauh lebih ringan. */
const petaAset = {};
for (const dir of ['assets', 'assets/img']) {
  for (const f of fs.readdirSync(P(dir))) {
    if (!/\.(jpe?g|png|webp|gif|avif|svg)$/i.test(f)) continue;
    const isi = fs.readFileSync(P(dir + '/' + f));
    petaAset[crypto.createHash('md5').update(isi).digest('hex')] = dir + '/' + f;
  }
}
let ditukar = 0, disimpan = 0;
html = html.replace(/data:image\/[a-z+.-]+;base64,([A-Za-z0-9+/=]+)/g, (utuh, b64) => {
  const md5 = crypto.createHash('md5').update(Buffer.from(b64, 'base64')).digest('hex');
  if (!petaAset[md5]) { disimpan++; return utuh; }
  ditukar++;
  return petaAset[md5];
});
lap.push(`Foto tertanam ditukar ke berkas assets: ${ditukar} (${disimpan} foto khas panel dibiarkan)`);

/* Gaya & logika di index.html disamakan dengan sumbernya di src/ */
const iGaya0 = html.indexOf('<style>') + '<style>'.length;
const iGaya1 = html.indexOf('</style>', iGaya0);
if (iGaya0 < 8 || iGaya1 < 0) throw new Error('Blok <style> storefront tidak ditemukan');
html = html.slice(0, iGaya0) + '\n' + stylesCss.trimEnd() + '\n' + html.slice(iGaya1);

const iSkrip0 = html.lastIndexOf('<script>') + '<script>'.length;
const iSkrip1 = html.indexOf('</script>', iSkrip0);
if (iSkrip0 < 8 || iSkrip1 < 0) throw new Error('Blok <script> storefront tidak ditemukan');
html = html.slice(0, iSkrip0) + '\n' + appJs.trimEnd() + '\n' + html.slice(iSkrip1);
lap.push('index.html: gaya dari src/styles.css, logika dari src/app.js');

/* Data website di index.html = data src/data.js yang sudah ditambah */
const iData0 = html.indexOf(AWAL) + AWAL.length, iData1 = html.indexOf(AKHIR);
html = html.slice(0, iData0) + JSON.stringify(data).replace(/<\//g, '<\\/') + html.slice(iData1);

/* Perbaikan marka */
if (!html.includes('<div class="footer-admin">')) {
  if (!html.includes(TOMBOL_CADANGAN.dari)) throw new Error('Penanda footer tidak ditemukan');
  html = html.replace(TOMBOL_CADANGAN.dari, TOMBOL_CADANGAN.ke);
} else if (html.includes(TOMBOL_LAMA)) {
  html = html.split(TOMBOL_LAMA).join(TOMBOL_BARU);
}
if (!MARKA_LOGO[0].test(html)) throw new Error('Marka logo SC tidak ditemukan');
html = html.replace(MARKA_LOGO[0], MARKA_LOGO[1]);
if (!html.includes(SLOT_FOTO.dari)) throw new Error('Marka kartu SENTOT AI tidak ditemukan');
html = html.replace(SLOT_FOTO.dari, SLOT_FOTO.ke);
for (const [nama, penanda] of [
  ['tombol pengelola menuju /admin', '<a id="adminLink" class="admin-link" href="https://sentot.my.id/admin"'],
  ['logo SC 800x800', 'src="assets/logo-sc.jpg" alt="Logo Sofia Collection" width="800" height="800"'],
  ['slot foto pemilik ber-lencana SAI', 'class="brand-photo" id="fotoSentot"']
]) {
  if (!html.includes(penanda)) throw new Error(`Perbaikan marka gagal: ${nama}`);
}
tulis('index.html', html);

/* --- src/data.js: disunting di tempat supaya komentar & susunannya tetap enak dibaca --- */
let sumber = dataJs;
if (!/_t: \d+,/.test(sumber)) throw new Error('Penanda _t di src/data.js tidak ditemukan');
sumber = sumber.replace(/_t: \d+,/, `_t: ${_t},`);

const anchorKategori = sumber.indexOf('\n],\n\n  PRODUK: [');
if (anchorKategori < 0) throw new Error('Daftar KATEGORI di src/data.js tidak ditemukan');
const barisKategori = LABEL_KATEGORI
  .map(k => `  { id: ${JSON.stringify(k.id)}, nama: ${JSON.stringify(k.nama)}, ico: ${JSON.stringify(k.ico)} }`)
  .join(',\n');
sumber = sumber.slice(0, anchorKategori) + ',\n' + barisKategori + sumber.slice(anchorKategori);

const anchorProduk = sumber.indexOf('\n],\n\n  JASA: [');
if (anchorProduk < 0) throw new Error('Daftar PRODUK di src/data.js tidak ditemukan');
const teksProduk = PRODUK_BARU.map(p => [
  '  {',
  `    id: ${JSON.stringify(p.id)}, nama: ${JSON.stringify(p.nama)}, kategori: ${JSON.stringify(p.kategori)},`,
  `    harga: ${p.harga}, hargaCoret: 0, gambar: ${JSON.stringify(p.gambar)},`,
  `    galeri: [], badge: ${JSON.stringify(p.badge)}, varian: [${p.varian.map(v => JSON.stringify(v)).join(', ')}],`,
  `    deskripsi: ${JSON.stringify(p.deskripsi)}`,
  '  }'
].join('\n')).join(',\n');
sumber = sumber.slice(0, anchorProduk) +
  ',\n\n  /* ---------- BARANG DAGANGAN CICHA (tokocicha.my.id) ---------- */\n' +
  teksProduk + sumber.slice(anchorProduk);

const kotak = {};
new Function('window', sumber + '\nreturn window.SA_DATA;')(kotak);
const hasil = kotak.SA_DATA;
for (const kunci of ['PROFIL', 'KATEGORI', 'PRODUK', 'JASA', 'TESTIMONI', 'FAQ']) {
  if (JSON.stringify(hasil[kunci]) !== JSON.stringify(data[kunci])) {
    throw new Error(`Suntingan src/data.js tidak sama dengan data index.html pada ${kunci} — dibatalkan`);
  }
}
tulis('src/data.js', sumber);

lap.push(`Kategori: ${data.KATEGORI.length} · Produk: ${data.PRODUK.length} (ditambah ${PRODUK_BARU.length} produk dari tokocicha.my.id)`);
lap.push('Selesai. Lanjutkan: node scripts/sync-panel.cjs && node scripts/test-auth.cjs');
console.log(lap.join('\n'));
