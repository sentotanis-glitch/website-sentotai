# SENTOT AI × SOFIA COLLECTION

Website toko dan layanan jasa, dengan panel admin berpassword di Vercel.

- Website: https://sentot.my.id
- Panel: https://sentot.my.id/admin
- Tombol **Admin** tetap di kiri bawah toko. Alamat panel lama mengarah ke login.
- Toko tetap publik; pengelolaan online dan proxy GitHub memerlukan sesi yang valid.

## Pengaturan Vercel

Gunakan Framework **Other**. `vercel.json` mengatur:

- Node.js 22; build `node scripts/vercel-build.cjs`.
- Output statis **public** — jangan mengubahnya menjadi `.` atau `server`.
- Function `api/admin.js` untuk login, logout, panel, pemeriksaan sesi, dan proxy GitHub.

Atur **Environment Variables → Production**, lalu deploy ulang:

| Key | Isi |
|---|---|
| `ADMIN_PASSWORD` | Password pribadi, unik, minimal 16 karakter, maksimal 512 |
| `GITHUB_TOKEN` | Fine-grained token khusus repo ini, izin **Contents: Read and write**, untuk fitur Kirim ke GitHub |

**Jangan commit password/token/.env.** Tidak ada password bawaan. Jika password tidak disetel atau terlalu pendek, panel gagal-tertutup (tidak dapat dibuka). Tanpa token, login tetap berfungsi tetapi penerbitan belum aktif.

Token GitHub tidak dikirim ke browser dalam versi online. Token lama di localStorage dibersihkan ketika halaman login/panel baru dibuka. Atur token server sebelum mengandalkan fitur penerbitan, dan cabut token lama setelah token baru berhasil diuji.

## Struktur

- `index.html`, `src/{data,app,styles}.*`, `assets/`: toko publik, konten tetap dapat diedit melalui panel.
- `api/admin.js`: Vercel Function entrypoint.
- `server/auth.cjs`: pemeriksaan password/sesi/CSRF dan proxy GitHub ke repo ini saja.
- `server/login.html`: tampilan login.
- `server/panel-template.json`: kode antarmuka panel; **bukan kredensial atau otorisasi**, tidak termasuk output publik Vercel.
- `scripts/vercel-build.cjs`: menyalin hanya storefront ke `public/`, serta membuat kunci sesi deployment di `.server/`.
- `panel-sentot-2026.html`, `(1)` dan `(2)`: pengalih saja, mengganti salinan editor publik yang lama.

Panel memuat data terbit terbaru dari `/src/data.js`, lalu memakai draft lokal yang lebih baru jika ada. Hasil ekspor dan publikasi mempertahankan tombol Admin. Sesi berlaku 1 jam; klik **Keluar** setelah selesai. Mengganti password dan redeploy mencabut sesi dari deployment sebelumnya pada domain aktif.

## GitHub Pages dan versi lama

Toko GitHub Pages tetap berfungsi. GitHub Pages tidak menjalankan autentikasi Node.js: panel di sana hanya mengarah ke login Vercel. Jangan mengunggah berkas `admin.html` luring atau panel versi lama.

Repositori ini publik: kode dan riwayat lama tetap dapat dibaca. Tidak ada kredensial server di dalamnya. Setelah migrasi sukses, tinjau/hapus atau lindungi deployment Vercel lama yang masih menayangkan editor terbuka; jangan menghapus Production aktif. Perlindungan baru tidak berlaku surut ke berkas yang sudah disalin/diunduh.

## Keamanan dan pengujian

- Password diperiksa di server; HMAC-signed session memakai kunci acak per deployment, ditambah password sebagai pengikat rotasi.
- Cookie **HttpOnly + Secure + SameSite=Strict**, TTL satu jam.
- Pemeriksaan Origin dan CSRF untuk perubahan; tidak menerima upstream URL sembarang atau kredensial dari klien.
- Proxy dibatasi pada repo `sentotanis-glitch/website-sentotai`, cabang `main`, dan operasi penerbitan storefront. Force push dan penulisan file server melalui panel ditolak.
- Respons admin `no-store`, anti-frame, `noindex`; halaman toko tidak memuat rahasia.
- Pembatasan login di memori hanya per instance, **bukan global**. Gunakan password kuat; rate limiting di Vercel Firewall dapat ditambahkan.
- `scripts/vercel-build.cjs` tidak menyalin API, server, atau kunci sesi ke `public/`.
- Jangan unggah `.server/`, `public/`, `.env*`, atau berkas test/demo.

Sebelum rilis, login salah/benar, tampering cookie, Origin/CSRF, kedaluwarsa, logout, proxy GitHub simulasi, dan tampilan HP/laptop diuji lokal. Pengujian akhir pada deployment Vercel tetap diperlukan setelah env dan unggahan diterapkan.

Kontak usaha: WhatsApp **088214949749** · Email **sentotanis@gmail.com**.
