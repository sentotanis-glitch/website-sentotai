# Website SENTOT AI × SOFIA COLLECTION — dengan panel admin berpassword

Toko + layanan jasa satu halaman, plus panel pengelola yang **terkunci password di server**.

- Toko: https://sentot.my.id
- Panel admin: https://sentot.my.id/admin ← halaman login
- Kontak: WhatsApp **088214949749** · Email **sentotanis@gmail.com** · BCA **1520514216** a/n Sentot Anis Irwan

Panel lama (`panel-sentot-2026.html`, `admin.html`) kini hanya **pengalih** ke `/admin`. Berkas editor terbuka
tidak ada lagi di repo — dulu panel itu bisa dibuka siapa pun tanpa password, sekarang tidak.

> **Satu hal yang hanya bisa Anda lakukan:** mengisi `ADMIN_PASSWORD` di Vercel (bagian 1 di bawah).
> Tanpa itu, `/admin` menolak semua orang — termasuk Anda — jadi tidak ada password bawaan yang perlu dicari.

---

## 1. Menyetel password (satu kali, ±2 menit)

Password **tidak disimpan di GitHub** (repo ini publik) — ia berada di Environment Variables Vercel,
dan diperiksa hanya di server.

1. Buka **vercel.com** → pilih project `website-sentotai`.
2. **Settings → Environment Variables → Production** → Add New:
   - Key: `ADMIN_PASSWORD`
   - Value: password buatan Anda sendiri, minimal **16** karakter. Pakai 4–5 kata tak berhubungan
     + angka (contoh bentuk: `kata-kata-kata-kata-kata-123`), jangan contoh ini dan jangan password
     yang dipakai di tempat lain. Jangan taruh password di berkas mana pun di repo ini.
     Spasi atau baris baru di awal/akhir ikut terhapus otomatis — jadi salin-tempel tidak bikin gagal masuk.
   - Key: `GITHUB_TOKEN` *(opsional, perlu untuk tombol Terbitkan/Kirim ke GitHub)* —
     fine-grained token, akses **hanya repo ini**, izin **Contents: Read and write**.
3. **Deployments → ⋯ → Redeploy** (env baru hanya aktif setelah deploy ulang).
4. Buka https://sentot.my.id/admin → masuk dengan password → panel terbuka.

**Belum menyetel `ADMIN_PASSWORD`?** Aman: `/admin` menjawab `503` dengan pesan penuntun, form login
disembunyikan, dan proxy GitHub tertutup. Panel gagal-tertutup (*fail-closed*), tidak pernah terbuka diam-diam.

Ganti password kapan saja: ubah `ADMIN_PASSWORD` → Redeploy. Sesi lama ikut hangus (kunci sesi dibuat ulang tiap
deploy, dan ditambatkan ke password).

## 2. Isi repository

| Berkas / folder | Keterangan |
|---|---|
| `index.html`, `src/{data,app,styles}.*`, `assets/` | Toko publik. Konten tetap diedit lewat panel |
| `assets/logo-sc.jpg` | Logo Sofia Collection, **800×800 (persegi)** — tampil 96×96 px di kartu brand |
| `assets/foto-sentot.jpg` | Foto Anda untuk kartu **SENTOT AI** (persegi, min. 400×400). Belum ada? Slot otomatis menampilkan monogram "S" dengan lencana **SAI** tetap di pojoknya |
| `api/admin.js` | Titik masuk Vercel Function (login, logout, sesi, panel, proxy GitHub) |
| `server/auth.cjs` | Password, sesi, CSRF, rate limit, penyaring operasi GitHub |
| `server/login.html` | Tampilan login |
| `server/panel-template.json` | Antarmuka panel — **bukan** kredensial, tidak ikut output publik |
| `server/panel-redirect.html` | Isi pengalih untuk alamat panel lama |
| `scripts/vercel-build.cjs` | Build: salin hanya storefront ke `public/`, buat kunci sesi acak di `.server/` |
| `scripts/test-auth.cjs` | Uji keamanan mandiri (19 pemeriksaan) |
| `scripts/sync-panel.cjs` | Menyalin ulang `index.html`/`src/app.js`/`src/styles.css` ke dalam `server/panel-template.json` — jalankan tiap kali storefront diubah agar "Terbitkan" tidak mengirim versi basi |
| `vercel.json` | Root directory repo ini; rewrite `/admin` → function; header cache |

## 3. Cara memakai panel

Isi website disimpan di `src/data.js`. Panel memuat data terbit terbaru, memakai draft perangkat ini bila lebih baru.
Setelah selesai: **Terbitkan** (lewat proxy GitHub, hanya branch `main`) → Vercel memperbarui ±1 menit → lalu **Keluar**.
Sesi berlaku 1 jam. Cadangan: **🗄 Unduh cadangan data (JSON)**; pulihkan lewat **📥 Pulihkan dari cadangan**.

## 4. Yang dijaga server

- Password diperiksa di server saja; tidak ada kata kunci di berkas publik maupun di riwayat commit.
- Sesi: cookie HMAC `__Host-` — **HttpOnly + Secure + SameSite=Strict**, TTL 1 jam, terikat ke domain,
  ada `jti` yang dicabut saat **Keluar**; penandatanganan memakai kunci acak per-deployment.
- Setiap perubahan butuh Origin sesame + token CSRF; token GitHub **tidak pernah** dikirim ke browser.
- Login dibatasi 5 percobaan / 15 menit per IP per instance (`Retry-After`), jeda 400 ms.
- Proxy GitHub hanya untuk repo `sentotanis-glitch/website-sentotai` branch `main`, hanya berkas
  `index.html`, `src/*`, `assets/**`: force push, penulisan `server/`, `api/`, `.env` ditolak.
- Respons admin: `no-store`, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, `noindex`.

Uji lokal sebelum terbit (tanpa jaringan, tanpa kredensial nyata):

```bash
ADMIN_PASSWORD='password-uji-anda-1234567890' node scripts/test-auth.cjs   # buat public/ + 19 uji
```

`public/`, `.server/`, `.env*` sudah di-`.gitignore` — jangan pernah diunggah.

## 5. Riwayat lama & GitHub Pages

Berkas panel terbuka lama masih terbaca di riwayat commit repo publik ini, tetapi isinya hanya antarmuka editor:
tidak ada password dan tidak ada token (token dulu tersimpan di browser pemilik, bukan di berkas).
Bila suatu ketika Anda pernah menempel token di panel lama, **cabut token itu** di GitHub
(Developer settings → token → Revoke) dan buat baru.

GitHub Pages **tidak** menjalankan Node.js, jadi di sana `/admin` tidak bisa login — halaman pengalih mengarah ke
`https://sentot.my.id/admin`. Jangan mengunggah panel luring (`admin.html` versi editor) ke hosting mana pun.
Setelah login aktif, tinjau deployment Vercel lama yang masih menayangkan editor terbuka: hapus yang tidak dipakai,
jangan hapus Production aktif.
