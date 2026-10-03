'use strict';
/* =====================================================================
   KATALOG-META — membuat feed CSV untuk Meta Commerce Manager
   ---------------------------------------------------------------------
   Jalur "lewat Meta": katalog dibuat di Meta Commerce Manager lalu
   dihubungkan ke akun WhatsApp Business (nomor 088214949749). Semua
   produk masuk sekaligus lewat SATU berkas feed, tidak diketik satu-satu
   di aplikasi WA.

   Skrip ini membaca src/data.js dan membuat katalog-meta.csv dengan
   kolom wajib Meta: id, title, description, availability, condition,
   price, link, image_link (+ additional_image_link, brand,
   custom_label_0). Catatan:

   - price memakai format "angka + kode mata uang" (85000 IDR).
   - Meta minta foto minimal 500x500 px: foto utama yang lebih kecil
     otomatis ditukar dengan foto galeri yang layak; bila tidak ada,
     produknya dilaporkan supaya difoto ulang / diganti.
   - Bavvoc Lumi Veil belum ada harga & stok kosong → availability
     "out of stock" (harga 0 IDR). Ubah barisnya bila harga sudah ada.

   Jalankan dari akar repo setiap kali data produk berubah:
     node scripts/katalog-meta.cjs
   ===================================================================== */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const P = rel => path.join(ROOT, rel);
const SITUS = 'https://sentot.my.id';

/* ---------- data website ---------- */
const kotak = {};
new Function('window', fs.readFileSync(P('src/data.js'), 'utf8') + '\nreturn window.SA_DATA;')(kotak);
const DATA = kotak.SA_DATA;
if (!DATA || !Array.isArray(DATA.PRODUK) || !DATA.PRODUK.length) throw new Error('src/data.js tidak memuat PRODUK');
const KATEGORI = DATA.KATEGORI || [];
const namaKategori = id => (KATEGORI.find(k => k.id === id) || {}).nama || 'Lainnya';

/* ---------- baca dimensi foto (tanpa dependensi luar) ---------- */
function dimensi(buf) {
  if (buf.length > 2 && buf[0] === 0xFF && buf[1] === 0xD8) { // JPEG
    let o = 2;
    while (o < buf.length) {
      if (buf[o] !== 0xFF) { o++; continue; }
      const m = buf[o + 1];
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
        return { w: buf.readUInt16BE(o + 7), h: buf.readUInt16BE(o + 5) };
      }
      o += 2 + buf.readUInt16BE(o + 2);
    }
  } else if (buf.readUInt32BE(0) === 0x89504E47) { // PNG
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } else if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const four = buf.toString('ascii', 12, 16);
    if (four === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3FFF, h: buf.readUInt16LE(28) & 0x3FFF };
    if (four === 'VP8L') { const b = buf.readUInt32LE(21); return { w: (b & 0x3FFF) + 1, h: ((b >> 14) & 0x3FFF) + 1 }; }
    if (four === 'VP8X') return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
  }
  return null;
}
const fotoLayak = rel => {
  try {
    const d = dimensi(fs.readFileSync(P(rel)));
    return !!(d && d.w >= 500 && d.h >= 500);
  } catch (e) { return false; }
};

/* ---------- susun baris feed ---------- */
const kolomTambahan = []; // jumlah kolom additional_image_link terbesar
const peringatan = [];
const baris = DATA.PRODUK.map(p => {
  const adaHarga = Number(p.harga) > 0;
  const habis = !adaHarga; // stok kosong / tanya harga → jangan tampil sebagai barang gratis

  // foto utama minimal 500x500: pakai gambar utama, kalau kecil tukar
  // dengan foto galeri pertama yang layak
  const semuaFoto = [p.gambar, ...(p.galeri || [])].filter(Boolean);
  let utama = semuaFoto[0];
  if (!fotoLayak(utama)) {
    const ganti = semuaFoto.slice(1).find(fotoLayak);
    if (ganti) { peringatan.push(`${p.id}: foto utama ${utama} < 500x500, dipakai ${ganti}`); utama = ganti; }
    else peringatan.push(`${p.id}: TIDAK ADA foto >= 500x500 (${utama}) — Meta bisa menolak fotonya`);
  }
  const tambahan = semuaFoto.filter(f => f !== utama && fotoLayak(f)).slice(0, 9);
  kolomTambahan.push(tambahan.length);

  let deskripsi = String(p.deskripsi || '').trim();
  if (Array.isArray(p.varian) && p.varian.length) deskripsi += ' Pilihan: ' + p.varian.join(', ');

  return {
    id: p.id,
    title: String(p.nama || '').trim(),
    description: deskripsi.replace(/\s+/g, ' '),
    availability: habis ? 'out of stock' : 'in stock',
    condition: 'new',
    price: (adaHarga ? Math.round(p.harga) : 0) + ' IDR',
    link: `${SITUS}/?produk=${encodeURIComponent(p.id)}`,
    image_link: `${SITUS}/${utama}`,
    additional: tambahan.map(f => `${SITUS}/${f}`),
    brand: 'SOFIA COLLECTION',
    custom_label_0: namaKategori(p.kategori)
  };
});

/* ---------- tulis CSV (UTF-8 + BOM, semua kolom diberi tanda kutip) ---------- */
const maksTambahan = Math.max(0, ...kolomTambahan);
const header = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link'];
for (let i = 0; i < maksTambahan; i++) header.push('additional_image_link');
header.push('brand', 'custom_label_0');

const csvField = v => '"' + String(v).replace(/"/g, '""') + '"';
const barisCsv = baris.map(b => {
  const sel = [b.id, b.title, b.description, b.availability, b.condition, b.price, b.link, b.image_link];
  for (let i = 0; i < maksTambahan; i++) sel.push(b.additional[i] || '');
  sel.push(b.brand, b.custom_label_0);
  return sel.map(csvField).join(',');
});
const csv = '\uFEFF' + header.map(csvField).join(',') + '\n' + barisCsv.join('\n') + '\n';
fs.writeFileSync(P('katalog-meta.csv'), csv);

console.log([
  `Selesai: katalog-meta.csv — ${baris.length} produk siap diunggah ke Meta Commerce Manager.`,
  peringatan.length ? 'Perhatian foto:\n  • ' + peringatan.join('\n  • ') : 'Semua foto utama memenuhi syarat minimal 500x500 px.',
  'Cara pakai: lihat README bagian 1d (lewat Meta).'
].join('\n'));
