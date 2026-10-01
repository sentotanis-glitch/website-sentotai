'use strict';
/* Menyamakan salinan TEMPLATE_MULTI / APLIKASI / GAYA yang tertanam di
   server/panel-template.json dengan isi terkini index.html, src/app.js,
   dan src/styles.css — supaya tombol "Terbitkan" di panel tidak pernah
   mengirim versi basi, dan scripts/test-auth.cjs tetap lolos.

   Jalankan setiap kali ketiga berkas storefront itu diubah:
     node scripts/sync-panel.cjs
*/
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PANEL = path.join(ROOT, 'server', 'panel-template.json');

const SALINAN = [
  ['TEMPLATE_MULTI', 'index.html'],
  ['APLIKASI', 'src/app.js'],
  ['GAYA', 'src/styles.css'],
];

/* Escape ala literal JS di panel: standar JSON.stringify, lalu "</" menjadi
   "<\/" agar tidak memutus blok <script> tempat literal ini tertanam. */
const escapeLiteral = isi => JSON.stringify(isi).slice(1, -1).replace(/<\//g, '<\\/');

const data = JSON.parse(fs.readFileSync(PANEL, 'utf8'));
let html = data.html;

for (const [nama, rel] of SALINAN) {
  const isi = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const marker = `const ${nama} = "`;
  const awal = html.indexOf(marker);
  if (awal < 0) throw new Error(`Marker ${marker} tidak ditemukan di panel-template.json`);
  let j = awal + marker.length;
  while (j < html.length) {
    if (html[j] === '\\') { j += 2; continue; }
    if (html[j] === '"') break;
    j++;
  }
  if (j >= html.length) throw new Error(`Akhir literal ${nama} tidak ditemukan`);
  html = html.slice(0, awal + marker.length) + escapeLiteral(isi) + html.slice(j);
}

if (!html.includes('<!--SERVER_CONTEXT-->')) throw new Error('Marker server context hilang');
data.html = html;
fs.writeFileSync(PANEL, JSON.stringify(data));
console.log('Salinan TEMPLATE_MULTI/APLIKASI/GAYA di panel-template.json disinkronkan.');
