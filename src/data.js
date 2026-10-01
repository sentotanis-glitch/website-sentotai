/* =====================================================================
   DATA WEBSITE — SENTOT AI x SOFIA COLLECTION
   ---------------------------------------------------------------------
   Berkas ini berisi SEMUA isi website: profil usaha, produk, layanan jasa,
   testimoni, dan FAQ.
   Cara paling mudah mengeditnya: buka "admin.html" di browser, ubah lewat
   tampilan yang sudah tersedia, lalu klik "Simpan" / "Unduh index.html".
   (Mengedit berkas ini langsung juga boleh, tapi lebih rawan salah ketik.)
   ===================================================================== */
window.SA_DATA = {
  _t: 1790826458602,   // penanda versi (diisi otomatis oleh build/admin)

  PROFIL: {
  brandJasa: "SENTOT AI",              // divisi jasa & teknologi
  brandToko: "SOFIA COLLECTION",  // divisi toko / fashion & kebutuhan muslim
  pemilik: "Sentot",
  kota: "Surabaya, Jawa Timur",
  alamat: "Melayani area Surabaya & sekitarnya (Sidoarjo, Gresik) — pengiriman ke seluruh Indonesia",
  jam: "Setiap hari, 08.00 – 21.00 WIB",
  wa: "6288214949749",                 // nomor WhatsApp aktif (088214949749)
  email: "sentotanis@gmail.com",       // email aktif
  ig: "@sentot.ai",                    // kosongkan dengan "" bila belum ada
  tiktok: "@sofia.collection",         // kosongkan dengan "" bila belum ada
  rekening: "BCA 1520514216 a/n Sentot Anis Irwan",   // tampil di catatan pembayaran
  gratisOngkirMin: 250000,             // gratis ongkir area Surabaya mulai nominal ini
  ongkirSurabaya: 12000,               // ongkir dasar dalam kota (tampil di catatan)
  stat: [
    { angka: "500+", label: "pesanan & job selesai" },
    { angka: "4.9/5", label: "rating pembeli" },
    { angka: "2", label: "brand dalam satu tempat" }
  ]
},

  KATEGORI: [
  { id: "semua",   nama: "Semua Produk",           ico: "grid" },
  { id: "pakaian", nama: "Pakaian Muslim",         ico: "shirt" },
  { id: "haji",    nama: "Perlengkapan Ibadah, Haji & Umroh", ico: "kaaba" },
  { id: "parfum",  nama: "Minyak Wangi & Parfum",  ico: "drop" },
  { id: "kosmetik",nama: "Kosmetik & Perawatan Tubuh", ico: "sparkle" }
],

  PRODUK: [
  {
    id: "hijab-pashmina", nama: "Hijab Pashmina Premium", kategori: "pakaian",
    harga: 85000, hargaCoret: 119000, gambar: "assets/img/hijab.jpg",
    rating: 4.9, terjual: "320+", badge: "Terlaris",
    varian: ["Cream", "Dusty Rose", "Sage", "Mocha", "Hitam"],
    deskripsi: "Bahan rayon korea adem, jatuh, dan tidak menerawang. Cocok untuk harian, kerja, maupun acara. Lebar 180 x 75 cm, jahitan rapi."
  },
  {
    id: "gamis-abaya", nama: "Gamis Syar'i Abaya Mutiara (Bordir Emas)", kategori: "pakaian",
    harga: 285000, hargaCoret: 349000, gambar: "assets/img/abaya.jpg",
    rating: 4.8, terjual: "180+", badge: "Best Seller",
    varian: ["S", "M", "L", "XL", "XXL"],
    deskripsi: "Abaya bahan nida premium, tebal tapi tidak panas, bordir emas di lengan. Potongan longgar dan sopan, nyaman untuk ibadah & kegiatan sehari-hari."
  },
  {
    id: "koko-basic", nama: "Koko Basic Premium Pria", kategori: "pakaian",
    harga: 165000, hargaCoret: 0, gambar: "assets/img/koko.jpg",
    rating: 4.8, terjual: "140+", badge: "",
    varian: ["M", "L", "XL", "XXL", "Putih", "Hitam", "Navy"],
    deskripsi: "Koko lengan panjang bahan katun premium, bordir halus di kerah. Adem, tidak mudah kusut, cocok untuk sholat Jumat sampai acara formal."
  },
  {
    id: "mukena-travel", nama: "Mukena Travel Lady Amira + Tas", kategori: "pakaian",
    harga: 195000, hargaCoret: 235000, gambar: "assets/img/mukena.jpg",
    rating: 4.9, terjual: "210+", badge: "Promo",
    varian: ["Lilac", "Cream", "Dusty Pink", "Hitam"],
    deskripsi: "Mukena travel ringan dengan renda halus, dilengkapi tas jinjing. Dilipat rapi sehingga mudah dibawa saat perjalanan atau disimpan di tas kerja."
  },
  {
    id: "paket-umroh", nama: "Paket Perlengkapan Umroh Lengkap (9 Item)", kategori: "haji",
    harga: 750000, hargaCoret: 950000, gambar: "assets/img/umroh-set.jpg",
    rating: 5.0, terjual: "95+", badge: "Paling Hemat",
    varian: ["Pria", "Wanita"],
    deskripsi: "Isi: kain ihram/mukena, sajadah travel, tasbih, Al-Qur'an kecil, id card & lanyard, kantong sepatu, tas perlengkapan, buku panduan manasik, dan pouch kecil. Siap dipakai berangkat."
  },
  {
    id: "tas-travel-haji", nama: "Tas Travel Haji & Umroh Premium", kategori: "haji",
    harga: 320000, hargaCoret: 0, gambar: "assets/img/travelbag.jpg",
    rating: 4.8, terjual: "120+", badge: "",
    varian: ["Hijau Tua", "Hitam", "Cokelat"],
    deskripsi: "Bahan kanvas tebal anti air, resleting YKK, banyak kompartemen. Bisa dipakai kabin dan tersedia strap tambahan untuk sajadah/gulungan."
  },
  {
    id: "sajadah-tasbih", nama: "Sajadah Travel Premium + Tasbih Kayu", kategori: "haji",
    harga: 95000, hargaCoret: 125000, gambar: "assets/img/umroh-set.jpg",
    rating: 4.9, terjual: "260+", badge: "Terlaris",
    varian: ["Motif Masjid", "Motif Bunga", "Polos Cream"],
    deskripsi: "Sajadah bulu halus dengan busa tipis, tidak sakit saat dipakai di lantai keras. Bonus tasbih kayu 33 butir dengan tali rapi."
  },
  {
    id: "ihram-sabuk", nama: "Kain Ihram + Sabuk Haji Pria", kategori: "haji",
    harga: 150000, hargaCoret: 0, gambar: "assets/img/hero.jpg",
    rating: 4.8, terjual: "110+", badge: "",
    varian: ["Standar", "Jumbo"],
    deskripsi: "Kain ihram katun tebal nyaman dipakai, dilengkapi sabuk/kantong uang haji anti air. Aman untuk menyimpan uang, kartu, dan dokumen penting."
  },
  /* ---------- PAKAIAN: SARUNG (pria) ---------- */
  {
    id: "sarung-wadimor", nama: "Sarung Wadimor Katun Premium", kategori: "pakaian",
    harga: 175000, hargaCoret: 215000, gambar: "assets/img/sarung-wadimor.jpg",
    rating: 4.9, terjual: "240+", badge: "Terlaris",
    varian: ["Hijau", "Navy", "Maroon", "Cokelat", "Motif Kotak"],
    deskripsi: "Sarung wadimor katun halus, adem dan tidak licin saat dipakai sholat. Tersedia warna polos dan motif kotak, nyaman untuk harian maupun acara."
  },
  {
    id: "sarung-satin", nama: "Sarung Satin Sutra Motif (Edisi Bagus)", kategori: "pakaian",
    harga: 265000, hargaCoret: 320000, gambar: "assets/img/sarung-satin.jpg",
    rating: 4.8, terjual: "95+", badge: "Favorit",
    varian: ["Emas Hijau", "Emas Maroon", "Emas Hitam"],
    deskripsi: "Sarung satin mengkilap dengan motif tenun halus, jatuh rapi dan mewah. Pilihan tepat untuk sholat Jumat, kondangan, atau hadiah untuk ayah dan kakek."
  },
  {
    id: "sarung-anak", nama: "Sarung Anak Motif Lucu (Ukuran 3-12 th)", kategori: "pakaian",
    harga: 85000, hargaCoret: 105000, gambar: "assets/img/sarung-anak.jpg",
    rating: 4.9, terjual: "160+", badge: "",
    varian: ["Biru", "Kuning", "Mint", "Merah", "Ukuran 3-6 th", "Ukuran 7-12 th"],
    deskripsi: "Sarung anak warna cerah dengan motif lucu, bahan katun lembut tidak panas. Karet pinggang elastis sehingga mudah dipakai anak sendiri."
  },

  /* ---------- SAJADAH ---------- */
  {
    id: "sajadah-premium", nama: "Sajadah Bulu Tebal Premium Motif Masjid", kategori: "haji",
    harga: 185000, hargaCoret: 235000, gambar: "assets/img/sajadah-premium.jpg",
    rating: 4.9, terjual: "180+", badge: "Terlaris",
    varian: ["Hijau Masjid", "Maroon", "Cokelat", "Biru Tua"],
    deskripsi: "Sajadah bulu tebal 1,5 cm dengan busa empuk, tidak sakit saat dipakai di lantai keras. Motif masjid klasik, bagian bawah anti licin."
  },
  {
    id: "sajadah-kado", nama: "Sajadah Kado Set (Sajadah + Tasbih + Al-Qur'an)", kategori: "haji",
    harga: 275000, hargaCoret: 340000, gambar: "assets/img/sajadah-kado.jpg",
    rating: 5.0, terjual: "120+", badge: "Paling Hemat",
    varian: ["Dusty Rose", "Cream", "Hijau"],
    deskripsi: "Paket kado cantik: sajadah bulu halus, tasbih, dan Al-Qur'an kecil dalam kotak dengan pita. Siap diberikan untuk walimah, kelahiran, atau hadiah untuk orang tua."
  },

  /* ---------- MUKENA ---------- */
  {
    id: "mukena-premium", nama: "Mukena Katun Jepang Premium (Bukan Travel)", kategori: "pakaian",
    harga: 235000, hargaCoret: 295000, gambar: "assets/img/mukena-premium.jpg",
    rating: 4.9, terjual: "150+", badge: "Terlaris",
    varian: ["Putih", "Cream", "Dusty Pink", "Hijau Mint"],
    deskripsi: "Mukena katun jepang tebal dan adem, dengan renda halus serta bordir rapi. Potongan panjang dan lebar, nyaman untuk sholat di rumah maupun di masjid."
  },
  {
    id: "mukena-anak", nama: "Mukena Anak Motif Bunga (3-12 th)", kategori: "pakaian",
    harga: 145000, hargaCoret: 175000, gambar: "assets/img/mukena-anak.jpg",
    rating: 4.8, terjual: "110+", badge: "",
    varian: ["Pink", "Mint", "Ungu", "Biru"],
    deskripsi: "Mukena anak warna pastel dengan bordir bunga kecil, bahan katun lembut. Ringan dipakai anak dan mudah dibawa ke masjid atau mengaji."
  },

  /* ---------- HIJAB ---------- */
  {
    id: "hijab-instan", nama: "Hijab Instan Jersey Premium (Bergo)", kategori: "pakaian",
    harga: 55000, hargaCoret: 75000, gambar: "assets/img/hijab-instan.jpg",
    rating: 4.9, terjual: "380+", badge: "Terlaris",
    varian: ["Cream", "Dusty Rose", "Hitam", "Abu", "Navy"],
    deskripsi: "Hijab instan bahan jersey adem, langsung pakai tanpa peniti dan tidak mudah melorot. Cocok untuk kerja, kuliah, dan aktivitas harian."
  },
  {
    id: "hijab-voal", nama: "Hijab Segi Empat Voal Motif Bunga", kategori: "pakaian",
    harga: 65000, hargaCoret: 85000, gambar: "assets/img/hijab-voal.jpg",
    rating: 4.8, terjual: "290+", badge: "Promo",
    varian: ["Dusty Blue", "Cream", "Mauve", "Sage"],
    deskripsi: "Hijab voal segi empat dengan motif bunga halus dan jahitan tepi rapi (baby seam). Tidak menerawang, mudah dibentuk, nyaman dipakai seharian."
  },

  {
    id: "parfum-oud", nama: "Parfum Arab Oud Al-Layl 50 ml", kategori: "parfum",
    harga: 185000, hargaCoret: 225000, gambar: "assets/img/parfum-arab.jpg",
    rating: 4.9, terjual: "230+", badge: "Favorit",
    varian: ["Oud", "Musk", "Amber"],
    deskripsi: "Parfum arab konsentrat tinggi (tanpa alkohol), aroma oud hangat dan tahan lama sampai seharian. Botol kaca mewah, cocok untuk hadiah."
  },
  {
    id: "rollon-6in1", nama: "Minyak Wangi Roll-On Series 6 in 1", kategori: "parfum",
    harga: 75000, hargaCoret: 95000, gambar: "assets/img/parfum-rollon.jpg",
    rating: 4.8, terjual: "410+", badge: "Terlaris",
    varian: ["Isi 6 botol (mix aroma)"],
    deskripsi: "Minyak wangi roll-on praktis dibawa di tas atau kantong. Enam pilihan aroma: bunga, musk, oud, vanila, melati, dan sandalwood. Bebas alkohol."
  },
  {
    id: "parfum-musk", nama: "Parfum Al-Rehab Floral Musk", kategori: "parfum",
    harga: 65000, hargaCoret: 0, gambar: "assets/img/parfum-rollon.jpg",
    rating: 4.7, terjual: "190+", badge: "",
    varian: ["Floral", "Musk Putih", "Rose"],
    deskripsi: "Aroma lembut floral-musk yang tidak menyengat, disukai banyak pengguna parfum arab. Cocok untuk aktivitas harian dan setelah sholat."
  },
  {
    id: "bakhoor", nama: "Bakhoor / Dupa Arab Premium", kategori: "parfum",
    harga: 55000, hargaCoret: 0, gambar: "assets/img/parfum-arab.jpg",
    rating: 4.8, terjual: "150+", badge: "",
    varian: ["50 gr", "100 gr"],
    deskripsi: "Wewangian kayu gaharu khas Timur Tengah untuk mengharumkan rumah, ruang tamu, atau kamar. Wangi menenangkan, tahan lama, tanpa bau terbakar."
  },
  {
    id: "skincare-glow", nama: "Paket Skincare Glow + Body Lotion", kategori: "kosmetik",
    harga: 145000, hargaCoret: 189000, gambar: "assets/img/skincare.jpg",
    rating: 4.9, terjual: "280+", badge: "Promo",
    varian: ["Kulit Normal", "Kulit Kering", "Kulit Berminyak"],
    deskripsi: "Paket hemat: serum pencerah, pelembap, dan body lotion. Tekstur ringan, cepat meresap, membantu kulit tampak lebih cerah dan lembut setelah pemakaian rutin."
  },
  {
    id: "handbody-spf", nama: "Hand & Body Lotion SPF 30", kategori: "kosmetik",
    harga: 48000, hargaCoret: 0, gambar: "assets/img/skincare.jpg",
    rating: 4.8, terjual: "350+", badge: "",
    varian: ["250 ml", "500 ml"],
    deskripsi: "Losion badan dengan perlindungan SPF 30, membantu menjaga kulit tetap lembap dan melindungi dari sinar matahari saat beraktivitas di luar ruangan."
  },
  {
    id: "lulur-kopi", nama: "Lulur & Body Scrub Kopi Arabika", kategori: "kosmetik",
    harga: 45000, hargaCoret: 0, gambar: "assets/img/skincare.jpg",
    rating: 4.7, terjual: "170+", badge: "",
    varian: ["250 gr"],
    deskripsi: "Scrub alami dari kopi arabika dan madu untuk mengangkat sel kulit mati. Dipakai 2x seminggu, kulit terasa lebih halus dan segar."
  },
  {
    id: "gift-set-bodycare", nama: "Body Care Gift Set (Kado Cantik)", kategori: "kosmetik",
    harga: 110000, hargaCoret: 140000, gambar: "assets/img/skincare.jpg",
    rating: 4.9, terjual: "85+", badge: "Baru",
    varian: ["Blush", "Cream", "Mix"],
    deskripsi: "Paket kado berisi sabun, body butter, dan scrub kecil dalam kotak cantik. Cocok untuk hadiah ulang tahun, hantaran, atau seserahan ibu."
  }
],

  JASA: [
  {
    id: "website", ico: "monitor", foto: "assets/img/jasa-website.jpg", nama: "Pembuatan Website & Toko Online",
    tagline: "Website toko, profil usaha, atau undangan digital — langsung siap dipakai jualan.",
    harga: "Mulai Rp750.000", satuan: "per paket",
    fitur: ["Desain rapi & mobile friendly", "Tombol pesan otomatis ke WhatsApp", "Katalog produk + form pesanan", "Optimasi dasar Google (SEO)", "Dibantu sampai website online", "Bonus panduan cara update sendiri"],
    wa: "Assalamualaikum SENTOT AI, saya mau tanya-tanya soal jasa pembuatan website.\nJenis usaha saya: \nKira-kira paket apa yang cocok?"
  },
  {
    id: "desain", ico: "pen", nama: "Desain Logo & Konten Sosial Media",
    tagline: "Bikin brand terlihat lebih meyakinkan dengan identitas visual yang konsisten.",
    harga: "Mulai Rp250.000", satuan: "per paket",
    fitur: ["Logo utama + 3 alternatif", "File siap cetak & siap medsos", "Desain feed / banner promosi", "Paket konten bulanan tersedia", "Revisi sampai cocok"],
    wa: "Assalamualaikum SENTOT AI, saya mau pesan jasa desain logo / konten sosmed.\nNama usaha saya: \nBergerak di bidang: "
  },
  {
    id: "titip-beli", ico: "box", foto: "assets/img/jasa-kurir.jpg", nama: "Jasa Titip Beli & Antar Barang",
    tagline: "Belanja atau ambil paket lalu diantar ke alamat Anda. Area Surabaya & sekitarnya.",
    harga: "Mulai Rp10.000", satuan: "sekali antar",
    fitur: ["Same-day area Surabaya", "Bantu belanja bahan / barang titipan", "Ambil paket dari ekspedisi atau toko", "Foto bukti serah terima", "Bisa langganan harian / mingguan"],
    wa: "Assalamualaikum, saya mau pakai jasa antar barang.\nTitik jemput: \nTitik antar: \nBarang yang diantar: \nWaktu: "
  },
  {
    id: "dokumen", ico: "file", nama: "Jasa Antar Dokumen & Surat Penting",
    tagline: "Dokumen, surat, atau berkas penting diantar cepat dan aman dengan bukti foto.",
    harga: "Mulai Rp15.000", satuan: "sekali antar",
    fitur: ["Antar ke kantor, sekolah, atau instansi", "Pengiriman via ekspedisi juga bisa", "Dikabari prosesnya secara berkala", "Bukti foto + tanda terima", "Bisa sekaligus urus ambil berkas"],
    wa: "Assalamualaikum, saya mau pakai jasa antar dokumen.\nJenis dokumen: \nDari: \nKe: \nHarus sampai kapan: "
  },
  {
    id: "tenaga-bantu", ico: "hand", nama: "Tenaga Bantu Serba Bisa (Harian)",
    tagline: "Butuh tambahan tenaga untuk urusan apa saja? Saya siap bantu sesuai kebutuhan Anda.",
    harga: "Mulai Rp150.000", satuan: "per hari (4 jam)",
    fitur: ["Bantu antri / urus administrasi", "Bantu jaga stand atau bantu di toko", "Bantu angkat & packing barang", "Bantu pekerjaan online / admin", "Kesepakatan tugas disesuaikan dulu"],
    wa: "Assalamualaikum, saya mau pakai jasa tenaga bantu harian.\nJenis pekerjaan: \nLokasi: \nTanggal & jam: \nPerkiraan lama: "
  }
],

  TESTIMONI: [
  { nama: "Ummi Rina", kota: "Sidoarjo", bintang: 5, teks: "Mukena travelnya ringan banget, dipakai sholat di perjalanan jadi enak. Packing rapi dan dikirim cepat, alhamdulillah." },
  { nama: "Pak Andi", kota: "Surabaya", bintang: 5, teks: "Pesan paket perlengkapan umroh untuk ibu, semua lengkap dalam satu paket jadi tidak perlu beli satu-satu. Harganya masuk." },
  { nama: "Dina", kota: "Gresik", bintang: 5, teks: "Minyak wanginya wangi dan tahan lama, harganya ramah. Sudah repeat order tiga kali untuk hadiah keluarga." },
  { nama: "Bu Sari", kota: "Surabaya", bintang: 5, teks: "Selain belanja, saya juga pakai jasanya bikin website toko. Komunikatif, hasilnya rapi, dan diajari cara update sendiri." }
],

  FAQ: [
  { q: "Apakah produknya halal dan original?", a: "Ya. Semua produk parfum dan perawatan tubuh yang dijual dipilih dari supplier terpercaya, bebas alkohol untuk minyak wangi, dan tidak mengandung bahan yang diharamkan. Jika ada sertifikasi halal dari produsen, bisa kami kirimkan foto labelnya sebelum Anda memesan." },
  { q: "Bagaimana cara memesan?", a: "Pilih produk, masukkan ke keranjang, lalu klik “Checkout via WhatsApp”. Pesanan Anda otomatis tersusun rapi dan bisa langsung dikirim ke WhatsApp kami. Bisa juga langsung chat tanpa lewat keranjang." },
  { q: "Apakah bisa COD atau bayar di tempat?", a: "Bisa. Untuk area Surabaya dan sekitarnya tersedia COD (bayar saat barang diterima) atau ambil sendiri di titik yang disepakati. Untuk luar kota, pembayaran melalui transfer bank, QRIS, atau e-wallet, lalu barang dikirim via ekspedisi." },
  { q: "Ongkos kirimnya berapa?", a: "Ongkir dalam kota Surabaya mulai Rp12.000 dan gratis untuk belanja minimal Rp250.000 (area tertentu). Luar kota mengikuti tarif ekspedisi pilihan Anda — akan kami hitung dulu sebelum Anda membayar." },
  { q: "Bisa custom order, misalnya satu paket perlengkapan umroh lengkap?", a: "Sangat bisa. Kami sering menyiapkan paket sesuai kebutuhan dan budget, termasuk untuk diserahkan ke jamaah atau dibagikan ke keluarga. Kirimkan daftar kebutuhan Anda via WhatsApp untuk kami buatkan penawaran." },
  { q: "Untuk jasa antar barang dan dokumen, areanya di mana?", a: "Pengantaran same-day melayani area Surabaya, serta Sidoarjo dan Gresik untuk jam tertentu. Untuk luar kota, pengiriman memakai ekspedisi dengan estimasi 1–4 hari kerja." },
  { q: "Belum pernah punya website, apakah tetap bisa dibantu?", a: "Bisa. Kami bantu dari nol: pemilihan nama domain, pembuatan website, sampai website bisa dibuka calon pembeli. Anda cukup menyiapkan foto produk dan daftar harga, sisanya kami kerjakan dan Anda diajari cara mengelolanya." }
]
};
