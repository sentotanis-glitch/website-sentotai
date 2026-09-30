# Website SENTOT AI × SC (Sofia Collection)

Website toko + layanan jasa dalam satu halaman:

- **SC — Sofia Collection:** pakaian muslim, perlengkapan haji & umroh, minyak wangi/parfum, kosmetik & perawatan tubuh.
- **SENTOT AI:** pembuatan website, desain logo & konten, titip beli & antar barang, antar dokumen, tenaga bantu harian.

Fitur: katalog + pencarian + filter kategori, keranjang belanja (tersimpan di HP pembeli), **checkout otomatis jadi pesan WhatsApp**, testimoni, FAQ, dan halaman admin untuk mengedit seluruh isi tanpa kode.

Kontak yang sudah terpasang: WhatsApp **088214949749** · Email **sentotanis@gmail.com** · **BCA 1520514216 a/n Sentot Anis Irwan**

---

## Isi repositori ini

| Berkas / folder | Keterangan |
|---|---|
| `index.html` | Halaman utama website |
| `src/data.js` | **Semua isi website** (profil, produk, jasa, testimoni, FAQ) |
| `src/app.js` | Logika website (keranjang, checkout WhatsApp, filter) |
| `src/styles.css` | Tampilan/warna (hijau–emas + rose gold) |
| `assets/img/`, `assets/logo-sc.jpg` | Foto produk & logo SC |
| `vercel.json` | Pengaturan singkat untuk Vercel (pengaturan cache gambar) |

> **Catatan:** panel admin (`admin.html`) **sengaja tidak diunggah** ke repositori ini — ia disimpan di perangkat pemilik saja. Repositori ini hanya berisi website yang dilihat pengunjung.

---

## Cara mengubah isi website (tanpa kode)

1. Buka berkas **`admin.html`** di peramban Anda (berkas ini ada di perangkat Anda, tidak di repositori ini).
2. Edit isinya di tab: Profil Usaha, Produk, Layanan Jasa, Testimoni, FAQ.
3. Buka tab **☁ GitHub & Vercel** → klik **Kirim ke GitHub**.
4. Vercel akan memperbarui website dalam ± 1 menit. Selesai — tanpa mengunggah berkas manual.

Berkas `admin.html` Anda simpan di perangkat sendiri (tidak perlu dionlinekan). Setiap kiriman tersimpan sebagai versi baru di GitHub, jadi **cadangan Anda otomatis dan bisa dikembalikan ke versi lama kapan saja** (lihat tab *Commits* di repositori).

### Panduan sekali saja: menyiapkan GitHub + Vercel (gratis)

**A. Repositori GitHub**
1. Buat akun di **github.com** (gratis).
2. Klik **+** kanan atas → **New repository** → nama mis. `website-sentot` → pilih **Private** (aman) → centang **Add a README file** → **Create repository**.
3. Unggah berkas dari folder ini: **Add file → Upload files** → seret semua berkas & folder di sini → **Commit changes**.

**B. Token akses (kunci khusus panel)**
1. GitHub → foto profil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Nama: mis. `panel-website`. Masa berlaku: 1 tahun (atau sesuka Anda).
3. **Repository access:** Only select repositories → pilih repo `website-sentot`.
4. **Permissions → Repository permissions → Contents → Read and write**.
5. **Generate token** → salin token → tempel di tab **☁ GitHub & Vercel** pada panel → **Simpan Pengaturan** → **Uji Koneksi**.

**C. Vercel (agar website mengudara otomatis)**
1. Buka **vercel.com** → **Sign up** → **Continue with GitHub** (gratis, tanpa kartu kredit).
2. **Add New… → Project** → pilih repo `website-sentot` → **Import**.
3. Framework Preset: **Other**. Build Command & Output Directory: **biarkan kosong**. Klik **Deploy**.
4. Website online di alamat seperti `website-sentot.vercel.app`. Bisa diganti dengan domain sendiri (mis. `sentotai.id`) di menu **Settings → Domains**.

**Alternatif tanpa Vercel — GitHub Pages (gratis juga):**
Repositori → **Settings → Pages** → Source: **Deploy from a branch** → pilih cabang **main**, folder **/(root)** → **Save**.
Website aktif di `nama-pengguna.github.io/nama-repo` (biasanya dalam 1–2 menit).

---

## Keamanan token

- Token hanya tersimpan di perangkat Anda (tidak ikut terunggah ke website).
- Jangan bagikan token ke siapa pun. Bila ragu, cabut di GitHub (**Developer settings → token → Revoke**), lalu buat yang baru.
- Gunakan token dengan izin **hanya satu repo** dan hanya **Contents: Read and write**.

---

## Cadangan data (tambahan)

Selain riwayat GitHub, di panel ada **🗄 Unduh cadangan data (JSON)**. Simpan berkas itu ke tempat aman (Google Drive/WhatsApp diri sendiri). Berkas cadangan bisa dimuat kembali lewat **📥 Pulihkan dari cadangan** — berguna bila ganti perangkat.

---

Semoga berkah dan lancar 🤍
