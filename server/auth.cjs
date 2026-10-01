'use strict';
// Server-only. Password and GitHub token come from Vercel Environment Variables.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const OWNER = 'sentotanis-glitch';
const REPO = 'website-sentotai';
const BRANCH = 'main';
const SID = '__Host-sai_admin';
const LOGIN_CSRF = '__Host-sai_login';
const SESSION_SECONDS = 3600;
const SHA = /^[a-f0-9]{40}$/i;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

function equal(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function cookie(req, name) {
  const text = req.headers.cookie || '';
  if (typeof text !== 'string' || text.length > 16384) return '';
  const values = text.split(';').map(s => s.trim()).filter(s => s.startsWith(name + '='));
  return values.length === 1 ? values[0].slice(name.length + 1) : '';
}
function setCookie(res, name, value, seconds) {
  const old = res.getHeader('Set-Cookie') || [];
  res.setHeader('Set-Cookie', [...(Array.isArray(old) ? old : [old]), `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${seconds}`]);
}
function headers(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Vary', 'Cookie');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'same-origin'); // Preserve Origin on same-origin form POST; never leak it cross-origin.
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'");
}
function json(res, status, value) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}
function redirect(res, target) { res.statusCode = 303; res.setHeader('Location', target); res.end(); }
function originMatches(req, host) {
  if (typeof req.headers.origin !== 'string') return false;
  try {
    const u = new URL(req.headers.origin);
    return u.protocol === 'https:' && u.host === host && u.origin === req.headers.origin;
  } catch { return false; }
}
async function readBody(req, max) {
  if (Number(req.headers['content-length'] || 0) > max) throw Object.assign(new Error('Permintaan terlalu besar.'), {status:413});
  if (req.body !== undefined) {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > max) throw Object.assign(new Error('Permintaan terlalu besar.'), {status:413});
    return {raw, value:typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : null};
  }
  let count = 0;
  const chunks = [];
  for await (const chunk of req) {
    const b = Buffer.from(chunk); count += b.length;
    if (count > max) throw Object.assign(new Error('Permintaan terlalu besar.'), {status:413});
    chunks.push(b);
  }
  return {raw:Buffer.concat(chunks).toString('utf8'), value:null};
}
function allowedFile(s) {
  if (typeof s !== 'string' || s.includes('..') || /[%\\\x00-\x1f]/.test(s)) return false;
  return ['index.html','src/data.js','src/app.js','src/styles.css'].includes(s) || /^assets\/(?:img\/)?[A-Za-z0-9_-]+\.(?:png|jpe?g|webp|gif|avif|svg)$/i.test(s);
}
function validateGithub(input) {
  if (!input || typeof input !== 'object') throw new Error('Permintaan GitHub tidak valid.');
  const method = input.method || 'GET', route = input.path, body = input.body;
  let clean;
  if (typeof route !== 'string' || route.length > 500 || /[%\\\x00-\x20]/.test(route)) throw new Error('Jalur GitHub ditolak.');
  if (method === 'GET' && (route === '' || route === '/git/ref/heads/main' || /^\/git\/commits\/[a-f0-9]{40}$/i.test(route))) return {method, route};
  const contents = route.match(/^\/contents\/([^?]+)(\?ref=main)?$/);
  if (method === 'GET' && contents && allowedFile(contents[1]) && contents[2]) return {method, route};
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Isi permintaan GitHub tidak valid.');
  const messageOK = typeof body.message === 'string' && body.message.length <= 4000;
  if (method === 'POST' && route === '/git/blobs' && body.encoding === 'base64' && typeof body.content === 'string' && BASE64.test(body.content)) {
    clean = {encoding:'base64', content:body.content};
  } else if (method === 'POST' && route === '/git/trees' && SHA.test(body.base_tree || '') && Array.isArray(body.tree) && body.tree.length > 0 && body.tree.length <= 100 && body.tree.every(t => t && allowedFile(t.path) && t.mode === '100644' && t.type === 'blob' && SHA.test(t.sha || ''))) {
    clean = {base_tree:body.base_tree, tree:body.tree.map(t => ({path:t.path,mode:'100644',type:'blob',sha:t.sha}))};
  } else if (method === 'POST' && route === '/git/commits' && messageOK && SHA.test(body.tree || '') && Array.isArray(body.parents) && body.parents.length === 1 && body.parents.every(s => SHA.test(s))) {
    clean = {message:body.message, tree:body.tree, parents:body.parents};
  } else if (method === 'PATCH' && route === '/git/refs/heads/main' && SHA.test(body.sha || '') && body.force !== true) {
    clean = {sha:body.sha, force:false};
  } else if (method === 'PUT' && contents && !contents[2] && allowedFile(contents[1]) && messageOK && body.branch === 'main' && typeof body.content === 'string' && BASE64.test(body.content) && (!body.sha || SHA.test(body.sha))) {
    clean = {message:body.message, branch:'main', content:body.content};
    if (body.sha) clean.sha = body.sha;
  } else throw new Error('Operasi ini tidak diizinkan melalui panel.');
  return {method, route, body:clean};
}

function createHandler(options = {}) {
  const env = options.env || process.env;
  const now = options.now || Date.now;
  const fetcher = options.fetch || globalThis.fetch;
  const pause = options.pause || (ms => new Promise(r => setTimeout(r, ms)));
  let cached;
  const resources = options.resources || (() => {
    if (!cached) cached = {
      deploymentKey:require('../.server/session-key.json').key,
      panel:require('./panel-template.json').html,
      login:fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8')
    };
    return cached;
  });
  // Best effort per warm function, not a distributed/global rate limiter.
  // A strong password is mandatory; Vercel WAF rate limiting is recommended as another layer.
  const attempts = new Map();
  // Cookies are stateless, so "Keluar" cannot recall a token by itself. A warm instance
  // therefore remembers logged-out session ids until they expire (best effort per
  // instance, same trade-off as the rate limiter above).
  const revoked = new Map();
  function settings() {
    const password = env.ADMIN_PASSWORD || '';
    if (typeof password !== 'string' || password.length < 16 || password.length > 512) return null;
    const r = resources();
    const key = Buffer.from(r.deploymentKey, 'base64');
    if (key.length !== 32) return null;
    const signingKey = crypto.createHmac('sha256', key).update('sai-admin-v1\0').update(password).digest();
    return {password, signingKey, ...r};
  }
  function mac(text, key) { return crypto.createHmac('sha256', key).update(text).digest('base64url'); }
  function session(req, cfg, host) {
    const c = cookie(req, SID);
    if (c.length > 1000) return null;
    const pieces = c.split('.');
    if (pieces.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(pieces[0]) || !equal(pieces[1], mac(pieces[0], cfg.signingKey))) return null;
    try {
      const s = JSON.parse(Buffer.from(pieces[0], 'base64url').toString('utf8'));
      const t = Math.floor(now()/1000);
      if (s.v !== 1 || s.aud !== host || !Number.isInteger(s.iat) || !Number.isInteger(s.exp) || s.iat > t + 30 || s.exp <= t || s.exp - s.iat !== SESSION_SECONDS || !/^[a-f0-9]{48}$/.test(s.csrf || '') || !/^[a-f0-9]{24}$/.test(s.jti || '')) return null;
      if (revoked.get(s.jti) === s.exp) return null;
      if (revoked.size > 200) { for (const [id, exp] of revoked) if (exp <= t) revoked.delete(id); }
      return s;
    } catch { return null; }
  }
  function showLogin(req, res, cfg, message = '', status = 200, enabled = true) {
    const nonce = crypto.randomBytes(24).toString('hex');
    setCookie(res, LOGIN_CSRF, nonce, 900);
    const template = cfg ? cfg.login : resources().login;
    let html = template.replace('<!--CSRF-->', nonce).replace('<!--MESSAGE-->', message ? `<div class="alert" role="alert">${esc(message)}</div>` : '');
    if (!enabled) html = html.replace('<form id="loginForm"', '<form hidden id="loginForm"');
    res.statusCode = status; res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end(req.method === 'HEAD' ? '' : html);
  }
  function ipKey(req, cfg) {
    const header = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    return mac(String(header).slice(0,200).split(',')[0].trim(), cfg.signingKey);
  }
  return async function handler(req, res) {
    headers(res);
    try {
      const host = String(req.headers.host || '').toLowerCase();
      if (!/^[a-z0-9.-]+(?::\d+)?$/.test(host)) return json(res,400,{message:'Alamat website tidak valid.'});
      const url = new URL(req.url || '/api/admin', 'https://' + host);
      const action = url.searchParams.get('action') || 'panel';
      const cfg = settings();
      if (!cfg) {
        if (action === 'panel' || action === 'login') return showLogin(req,res,null,'Login belum diaktifkan. Pemilik perlu mengisi ADMIN_PASSWORD di Vercel (minimal 16 karakter), lalu Redeploy.',503,false);
        return json(res,503,{message:'Login admin belum dikonfigurasi.'});
      }
      const s = session(req,cfg,host);
      if (action === 'panel' || (action === 'login' && ['GET','HEAD'].includes(req.method))) {
        if (!['GET','HEAD'].includes(req.method)) return json(res,405,{message:'Metode tidak diizinkan.'});
        if (!s) return showLogin(req,res,cfg);
        if (action === 'login') return redirect(res,'/admin');
        const context = JSON.stringify({endpoint:'/api/admin',csrf:s.csrf,expiresAt:s.exp*1000,owner:OWNER,repo:REPO,branch:BRANCH,githubConfigured:!!(env.GITHUB_TOKEN || '').trim()}).replace(/</g,'\\u003c');
        const html = cfg.panel.replace('<!--SERVER_CONTEXT-->', `<script>window.__SA_SECURE_ADMIN__=${context};</script><script src="/src/data.js"></script>`);
        if (!html.includes('window.__SA_SECURE_ADMIN__=')) throw new Error('Panel context marker missing');
        res.statusCode = 200;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(req.method === 'HEAD' ? '' : html);return;
      }
      if (action === 'login') {
        if (req.method !== 'POST') return json(res,405,{message:'Metode tidak diizinkan.'});
        if (!originMatches(req,host)) return json(res,403,{message:'Permintaan harus berasal dari website ini.'});
        if (!(req.headers['content-type'] || '').startsWith('application/x-www-form-urlencoded')) return json(res,415,{message:'Format login tidak valid.'});
        const input = await readBody(req,4096);
        const form = input.value || Object.fromEntries(new URLSearchParams(input.raw));
        const nonce = cookie(req,LOGIN_CSRF);
        if (!/^[a-f0-9]{48}$/.test(nonce) || typeof form.csrf !== 'string' || !equal(nonce,form.csrf)) return showLogin(req,res,cfg,'Halaman login sudah kedaluwarsa. Silakan coba lagi.',403);
        const ip = ipKey(req,cfg), t = now();
        for (const [k,v] of attempts) if (v.until <= t) attempts.delete(k);
        const previous = attempts.get(ip);
        if (previous && previous.count >= 5) {
          res.setHeader('Retry-After',String(Math.ceil((previous.until-t)/1000)));
          return showLogin(req,res,cfg,'Terlalu banyak percobaan. Tunggu 15 menit, lalu coba lagi.',429);
        }
        if (typeof form.password !== 'string' || form.password.length > 512 || !equal(form.password,cfg.password)) {
          if (attempts.size >= 10000) { res.setHeader('Retry-After','900'); return showLogin(req,res,cfg,'Login sedang dibatasi. Silakan coba lagi nanti.',429); }
          attempts.set(ip,{count:(previous?.count || 0)+1,until:previous?.until || t+15*60*1000});
          await pause(400);
          return showLogin(req,res,cfg,'Password belum cocok. Silakan coba lagi.',401);
        }
        attempts.delete(ip);
        const iat = Math.floor(t/1000);
        const payload = Buffer.from(JSON.stringify({v:1,iat,exp:iat+SESSION_SECONDS,aud:host,csrf:crypto.randomBytes(24).toString('hex'),jti:crypto.randomBytes(12).toString('hex')})).toString('base64url');
        setCookie(res,SID,payload+'.'+mac(payload,cfg.signingKey),SESSION_SECONDS);
        setCookie(res,LOGIN_CSRF,'',0);
        return redirect(res,'/admin');
      }
      if (action === 'session') {
        if (req.method !== 'GET') return json(res,405,{message:'Metode tidak diizinkan.'});
        return json(res,s?200:401,s?{authenticated:true,expiresAt:s.exp*1000}:{message:'Sesi berakhir. Masuk kembali.',requiresLogin:true});
      }
      if (action === 'logout') {
        if (req.method !== 'POST') return json(res,405,{message:'Gunakan tombol Keluar di panel.'});
        if (!originMatches(req,host)) return json(res,403,{message:'Asal permintaan ditolak.'});
        const input = await readBody(req,4096);
        const form = input.value || Object.fromEntries(new URLSearchParams(input.raw));
        if (s && (typeof form.csrf !== 'string' || !equal(form.csrf,s.csrf))) return json(res,403,{message:'Permintaan keluar tidak valid.'});
        if (s && s.jti) revoked.set(s.jti, s.exp);
        setCookie(res,SID,'',0);setCookie(res,LOGIN_CSRF,'',0);
        return redirect(res,'/admin');
      }
      if (action !== 'github') return json(res,404,{message:'Tidak ditemukan.'});
      if (req.method !== 'POST') return json(res,405,{message:'Metode tidak diizinkan.'});
      if (!s) return json(res,401,{message:'Sesi berakhir. Masuk kembali sebelum menerbitkan.',requiresLogin:true});
      if (!originMatches(req,host) || typeof req.headers['x-csrf-token'] !== 'string' || !equal(req.headers['x-csrf-token'],s.csrf)) return json(res,403,{message:'Pemeriksaan keamanan gagal. Muat ulang panel.'});
      if (!(req.headers['content-type'] || '').startsWith('application/json')) return json(res,415,{message:'Format permintaan tidak valid.'});
      if (!(env.GITHUB_TOKEN || '').trim()) return json(res,503,{message:'Tambahkan GITHUB_TOKEN di Vercel Environment Variables, lalu Redeploy untuk mengaktifkan Kirim ke GitHub.'});
      const input = await readBody(req,3.8*1024*1024);
      let op;
      try { op = validateGithub(input.value || JSON.parse(input.raw)); }
      catch (e) { return json(res,400,{message:e.message || 'Permintaan tidak valid.'}); }
      const response = await fetcher(`https://api.github.com/repos/${OWNER}/${REPO}${op.route}`, {
        method:op.method,
        headers:{'Authorization':'Bearer '+env.GITHUB_TOKEN.trim(),'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'SENTOT-AI-Admin','Content-Type':'application/json'},
        body:op.body?JSON.stringify(op.body):undefined,
        redirect:'error',signal:AbortSignal.timeout(20000)
      });
      if (response.status === 401) return json(res,502,{message:'GITHUB_TOKEN di Vercel ditolak atau kedaluwarsa. Ganti token lalu Redeploy.'});
      if (response.status === 403) return json(res,403,{message:'GitHub menolak akses. Periksa izin Contents: Read and write, akses repo, dan batas permintaan token di Vercel.'});
      const text = await response.text();
      let value;
      try { value = text ? JSON.parse(text) : {}; } catch { return json(res,502,{message:'Balasan GitHub tidak valid.'}); }
      // Never return an echoed secret even if an upstream error unexpectedly contains it.
      const safe = JSON.stringify(value).split(env.GITHUB_TOKEN.trim()).join('[redacted]');
      res.statusCode=response.status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(safe);
    } catch (e) {
      if (res.headersSent) { res.end(); return; }
      if (e.status === 413) return json(res,413,{message:'Berkas terlalu besar. Perkecil foto atau kirim perubahan dalam bagian lebih kecil.'});
      console.error('Admin request failed:', e.name || 'Error');
      return json(res,503,{message:'Layanan admin sementara belum tersedia. Website toko tetap bisa dibuka.'});
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
module.exports.validateGithub = validateGithub;
