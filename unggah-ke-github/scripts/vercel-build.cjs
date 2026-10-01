'use strict';
// Only these storefront files become public on Vercel.
// server/, scripts/, .server/ and the API source are NOT static output.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const PRIVATE = path.join(ROOT, '.server');
fs.rmSync(PUBLIC, {recursive:true, force:true});
fs.mkdirSync(PUBLIC, {recursive:true});
fs.mkdirSync(PRIVATE, {recursive:true});
// Unique to this deployment, shared by every instance of its function.
// Generated at Vercel build time; never committed or downloaded to browsers.
fs.writeFileSync(path.join(PRIVATE, 'session-key.json'), JSON.stringify({key:crypto.randomBytes(32).toString('base64')}), {mode:0o600});
for (const relative of ['index.html','src/data.js','src/app.js','src/styles.css']) {
  const from = path.join(ROOT, relative), to = path.join(PUBLIC, relative);
  fs.mkdirSync(path.dirname(to), {recursive:true}); fs.copyFileSync(from, to);
}
function copyImages(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const from = path.join(dir,e.name);
    if (e.isDirectory()) copyImages(from);
    else if (e.isFile() && /\.(?:png|jpe?g|webp|gif|avif|svg)$/i.test(e.name)) {
      const to = path.join(PUBLIC,path.relative(ROOT,from));
      fs.mkdirSync(path.dirname(to), {recursive:true}); fs.copyFileSync(from,to);
    }
  }
}
copyImages(path.join(ROOT,'assets'));
const pointer = fs.readFileSync(path.join(ROOT,'server','panel-redirect.html'),'utf8');
for (const name of ['panel-sentot-2026.html','panel-sentot-2026 (1).html','panel-sentot-2026 (2).html','admin.html','panel-admin.html']) {
  fs.writeFileSync(path.join(PUBLIC,name),pointer);
}
const panel = JSON.parse(fs.readFileSync(path.join(ROOT,'server','panel-template.json'),'utf8')).html;
if (!panel.includes('<!--SERVER_CONTEXT-->')) throw new Error('Missing secure panel context');
if (Buffer.byteLength(panel) > 4*1024*1024) throw new Error('Panel too large for Vercel Function response');
console.log('Storefront built in public/. Admin stays behind server authentication.');
