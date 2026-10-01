/* =====================================================================
   SENTOT AI x SC (SOFIA COLLECTION) — logika website
   ---------------------------------------------------------------------
   ISI WEBSITE (profil, produk, jasa, testimoni, FAQ) tidak lagi ditulis di
   sini, melainkan di berkas "data.js" — dan paling mudah diubah lewat
   halaman panel admin https://sentot.my.id/admin (butuh password) tanpa menyentuh kode.
   ===================================================================== */

/* Data yang dipakai website:
   1) hasil edit terakhir dari panel admin (tersimpan di perangkat pengunjung), atau
   2) data bawaan website — mana yang versinya paling baru. */
let DATA = {}, PROFIL = {}, KATEGORI = [], PRODUK = [], JASA = [], TESTIMONI = [], FAQ = [];

function muatData() {
  const bawaan = window.SA_DATA || {};
  let terpilih = bawaan;
  try {
    const simpanan = storage.getItem("sa_data_v1");
    if (simpanan) {
      const d = JSON.parse(simpanan);
      if (d && d.PROFIL && d.PRODUK && (d._t || 0) >= (bawaan._t || 0)) terpilih = d;
    }
  } catch (e) { /* abaikan: pakai data bawaan */ }
  DATA = terpilih;
  PROFIL     = DATA.PROFIL     || {};
  KATEGORI   = DATA.KATEGORI   || [];
  PRODUK     = DATA.PRODUK     || [];
  JASA       = DATA.JASA       || [];
  TESTIMONI  = DATA.TESTIMONI  || [];
  FAQ        = DATA.FAQ        || [];
}

/* =====================================================================
   DI BAWAH INI ADALAH KODE PROGRAM — tidak perlu diubah
   ===================================================================== */

/* ---------- util ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rupiah = n => "Rp" + Math.round(n).toLocaleString("id-ID");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const storage = (() => {
  try { localStorage.setItem("__cek", "1"); localStorage.removeItem("__cek"); return localStorage; }
  catch (e) { const mem = {}; return { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => (mem[k] = String(v)), removeItem: k => delete mem[k] }; }
})();

const IKON = {
  grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
  shirt: '<path d="M16 3l4 2-2 4-2-1v12H8V8L6 9 4 5l4-2 4 3z"/>',
  kaaba: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 8l5 3v5l-5 3-5-3v-5z"/>',
  drop: '<path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0C6 8.5 12 2 12 2z"/>',
  sparkle: '<path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/><path d="M18 15l.9 2.6L21.5 18.5 18.9 19.4 18 22l-.9-2.6L14.5 18.5 17.1 17.6z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.4A2 2 0 0 0 9.6 17h9.2"/>',
  wa: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.7-.2-2.4-.9-3.9-2.5-1.2-1.3-1.6-2.4-1.7-2.9 0-.4 0-1 .3-1.4.2-.3.5-.6.7-.7.2-.1.4-.1.6 0h.4c.2 0 .3.1.5.5l.6 1.4c0 .2 0 .3-.1.5l-.3.4-.2.2c-.1.1-.1.2 0 .4.2.3.6.9 1.1 1.4.7.6 1.2.8 1.5.9.2.1.3.1.4 0l.6-.6c.2-.2.3-.2.5-.1l1.4.7c.2.1.3.2.3.4 0 .2 0 .6-.2 1z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  pin: '<path d="M12 22s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
  truck: '<path d="M2 6h11v9H2zM13 9h4l4 4v2h-8z"/><circle cx="6.5" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/>',
  monitor: '<rect x="2" y="4" width="20" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  pen: '<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="M14 6l3-3 3 3-3 3z"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>',
  file: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/>',
  hand: '<path d="M8 12V5a2 2 0 1 1 4 0v6"/><path d="M12 11V4a2 2 0 1 1 4 0v8"/><path d="M16 12V7a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-4a2 2 0 1 1 4 0"/>',
  star: '<path d="M12 2l2.9 6.3 6.9.8-5 4.7 1.3 6.8L12 17.5 5.9 20.6 7.2 13.8 2.2 9.1l6.9-.8z"/>'
};
const svg = (k, size = 18, stroke = true) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKON[k] || IKON.check}</svg>`;

/* ---------- state ---------- */
let KERANJANG = [];
try { KERANJANG = JSON.parse(storage.getItem("sa_keranjang") || "[]") || []; } catch (e) { KERANJANG = []; }
let filterKategori = "semua";
let kataKunci = "";
let urutkan = "populer";

const simpanKeranjang = () => { try { storage.setItem("sa_keranjang", JSON.stringify(KERANJANG)); } catch (e) {} };
const totalItem = () => KERANJANG.reduce((s, i) => s + i.qty, 0);
const subtotal = () => KERANJANG.reduce((s, i) => s + i.harga * i.qty, 0);

/* ---------- WhatsApp ---------- */
const waLink = pesan => `https://wa.me/${PROFIL.wa}?text=${encodeURIComponent(pesan)}`;
const waUmum = () => waLink(`Assalamualaikum ${PROFIL.brandJasa} 🙏\nSaya mau tanya-tanya soal produk ${PROFIL.brandToko} / layanan jasa yang tersedia.`);

function bukaWA(pesan) {
  const url = waLink(pesan);
  const w = window.open(url, "_blank");
  if (!w) location.href = url;   // fallback bila pop-up diblokir
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- render: header, hero, footer dari PROFIL ---------- */
function renderProfil() {
  $$("[data-brand-jasa]").forEach(e => (e.textContent = PROFIL.brandJasa));
  $$("[data-brand-toko]").forEach(e => (e.textContent = PROFIL.brandToko));
  $$("[data-kota]").forEach(e => (e.textContent = PROFIL.kota));
  $$("[data-alamat]").forEach(e => (e.textContent = PROFIL.alamat));
  $$("[data-jam]").forEach(e => (e.textContent = PROFIL.jam));
  $$("[data-email]").forEach(e => { e.textContent = PROFIL.email || "-"; });
  $$("[data-pemilik]").forEach(e => (e.textContent = PROFIL.pemilik));
  $$("[data-rekening]").forEach(e => (e.textContent = PROFIL.rekening));
  $$("[data-ongkir]").forEach(e => (e.textContent = rupiah(PROFIL.ongkirSurabaya)));
  $$("[data-gratis-ongkir]").forEach(e => (e.textContent = rupiah(PROFIL.gratisOngkirMin)));

  const waNum = e => { if (e) { e.href = waUmum(); } };
  $$("[data-wa]").forEach(waNum);
  $("#waTeks").textContent = "+" + PROFIL.wa.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, "$1 $2-$3-$4");

  const sos = [];
  if (PROFIL.ig) sos.push(`<li>${svg("sparkle", 16)} Instagram: <a href="https://instagram.com/${PROFIL.ig.replace("@", "")}" target="_blank" rel="noopener">${esc(PROFIL.ig)}</a></li>`);
  if (PROFIL.tiktok) sos.push(`<li>${svg("sparkle", 16)} TikTok: ${esc(PROFIL.tiktok)}</li>`);
  const elSos = $("#sosmed");
  if (elSos) elSos.innerHTML = sos.join("");

  const stat = $("#heroStat");
  if (stat) stat.innerHTML = PROFIL.stat.map(s => `<div><strong>${esc(s.angka)}</strong><span>${esc(s.label)}</span></div>`).join("");

  const tk = $("#trustRow");
  if (tk) tk.innerHTML = [
    "Halal & original", "Bisa COD area Surabaya", "Same-day Surabaya", "Terima custom order"
  ].map(t => `<li>${svg("check", 15)} ${t}</li>`).join("");
}

/* ---------- slot foto pemilik (kartu SENTOT AI) ----------
   Foto dibaca dari assets/foto-sentot.jpg. Bila berkasnya belum ada, slot
   menampilkan monogram "S" — lencana SAI tetap tampil di pojok slot. */
function siapkanFotoPemilik() {
  const kotak = $("#fotoSentot");
  if (!kotak) return;
  const img = $(".brand-photo-img", kotak);
  if (!img) { kotak.classList.add("is-kosong"); return; }
  const perbarui = () => kotak.classList.toggle("is-kosong", !(img.complete && img.naturalWidth > 0));
  img.addEventListener("load", perbarui);
  img.addEventListener("error", () => kotak.classList.add("is-kosong"));
  if (img.complete) perbarui();
}

/* ---------- render: katalog ---------- */
function renderKategori() {
  $("#chips").innerHTML = KATEGORI.map(k => {
    const n = k.id === "semua" ? PRODUK.length : PRODUK.filter(p => p.kategori === k.id).length;
    return `<button class="chip ${filterKategori === k.id ? "active" : ""}" data-kat="${k.id}">
      ${svg(k.ico, 16)} ${esc(k.nama)} <span class="n">(${n})</span></button>`;
  }).join("");
  $$("#chips .chip").forEach(c => c.addEventListener("click", () => {
    filterKategori = c.dataset.kat;
    renderKategori(); renderProduk();
    $("#katalogJudul").textContent = (KATEGORI.find(k => k.id === filterKategori) || {}).nama || "Semua Produk";
  }));
}

function produkTersaring() {
  let list = PRODUK.slice();
  if (filterKategori !== "semua") list = list.filter(p => p.kategori === filterKategori);
  if (kataKunci) {
    const q = kataKunci.toLowerCase();
    list = list.filter(p => (p.nama + " " + p.deskripsi + " " + p.kategori).toLowerCase().includes(q));
  }
  const harga = p => p.harga;
  if (urutkan === "murah") list.sort((a, b) => harga(a) - harga(b));
  if (urutkan === "mahal") list.sort((a, b) => harga(b) - harga(a));
  if (urutkan === "populer") list.sort((a, b) => parseFloat(b.terjual) - parseFloat(a.terjual));
  if (urutkan === "baru") list.sort((a, b) => (b.badge === "Baru" ? 1 : 0) - (a.badge === "Baru" ? 1 : 0));
  return list;
}

const namaKategori = id => (KATEGORI.find(k => k.id === id) || {}).nama || "";

/* Daftar foto sebuah produk: foto utama (gambar) + foto tambahan (galeri),
   tanpa duplikat. Dipakai kartu katalog (penanda jumlah) & modal detail. */
const fotoProduk = p => [p.gambar, ...(p.galeri || [])].filter((x, i, a) => x && a.indexOf(x) === i);

function renderProduk() {
  const list = produkTersaring();
  const grid = $("#grid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <div style="font-size:2rem">🔎</div><strong>Produk tidak ditemukan</strong>
      Coba kata kunci lain, atau <a href="#" id="tanyaKosong" style="color:var(--green-700);font-weight:650">tanya langsung via WhatsApp</a> — kami bisa carikan.</div>`;
    const t = $("#tanyaKosong");
    if (t) t.addEventListener("click", e => { e.preventDefault(); bukaWA(`Assalamualaikum, saya mencari produk: ${kataKunci}. Kira-kira ada?`); });
    return;
  }
  grid.innerHTML = list.map(p => {
    const badge = p.badge ? `<span class="badge ${p.badge === "Promo" ? "gold" : (p.badge === "Terlaris" || p.badge === "Best Seller" ? "" : "green")}">${esc(p.badge)}</span>` : "";
    const old = p.hargaCoret ? `<span class="price-old">${rupiah(p.hargaCoret)}</span>` : "";
    const hemat = p.hargaCoret ? `<span style="font-size:.74rem;color:var(--rose-600);font-weight:700">Hemat ${rupiah(p.hargaCoret - p.harga)}</span>` : "";
    const foto = fotoProduk(p);
    const chipFoto = foto.length > 1 ? `<span class="foto-count" title="${foto.length} foto produk">📷 ${foto.length}</span>` : "";
    return `<article class="card">
      <div class="card-media" data-detail="${p.id}">${badge}${chipFoto}<img src="${p.gambar}" alt="${esc(p.nama)}" loading="lazy"></div>
      <div class="card-body">
        <div class="card-cat">${esc(namaKategori(p.kategori))}</div>
        <h3>${esc(p.nama)}</h3>
        <p class="card-desc">${esc(p.deskripsi)}</p>
        <div class="rate"><span class="stars">★★★★★</span> ${p.rating} · ${esc(p.terjual)} terjual</div>
        <div class="price-row"><span class="price">${rupiah(p.harga)}</span>${old}</div>
        <div style="margin-top:2px">${hemat}</div>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" data-add="${p.id}">${svg("cart", 15)} Keranjang</button>
          <button class="icon-btn" title="Tanya produk ini via WhatsApp" data-tanya="${p.id}">${svg("wa", 18)}</button>
        </div>
      </div>
    </article>`;
  }).join("");

  $$("#grid [data-add]").forEach(b => b.addEventListener("click", () => tambah(String(b.dataset.add), 1, true)));
  $$("#grid [data-tanya]").forEach(b => b.addEventListener("click", () => {
    const p = PRODUK.find(x => x.id === b.dataset.tanya);
    bukaWA(`Assalamualaikum ${PROFIL.brandToko} 🙏\nSaya mau tanya produk ini:\n• ${p.nama}\n• Harga: ${rupiah(p.harga)}\n\nApakah stoknya ready dan bisa kirim ke kota saya?`);
  }));
  $$("#grid [data-detail]").forEach(m => m.addEventListener("click", () => bukaDetail(String(m.dataset.detail))));
}

/* ---------- render: jasa ---------- */
function renderJasa() {
  $("#svcGrid").innerHTML = JASA.map(s => `<article class="svc">
    <div class="svc-head ${s.foto ? "has-foto" : ""}">
      ${s.foto ? `<img src="${s.foto}" alt="${esc(s.nama)}" loading="lazy">` : ""}
      <span class="svc-ico">${svg(s.ico, 22)}</span>
    </div>
    <h3>${esc(s.nama)}</h3>
    <p>${esc(s.tagline)}</p>
    <ul>${s.fitur.map(f => `<li>${svg("check", 15)}<span>${esc(f)}</span></li>`).join("")}</ul>
    <div class="svc-price">
      <div><div class="lbl">${esc(s.satuan)}</div><div class="val">${esc(s.harga)}</div></div>
      <button class="btn btn-gold btn-sm" data-jasa="${s.id}">${svg("wa", 15)} Tanya & pesan</button>
    </div>
  </article>`).join("");
  $$("#svcGrid [data-jasa]").forEach(b => b.addEventListener("click", () => {
    const s = JASA.find(x => x.id === b.dataset.jasa);
    bukaWA(s.wa + `\n\n(Dikirim dari website ${PROFIL.brandJasa})`);
  }));
}

/* ---------- render: testimoni & faq ---------- */
function renderTestiFaq() {
  $("#testiGrid").innerHTML = TESTIMONI.map(t => `<article class="quote">
    <span class="stars">${"★".repeat(t.bintang)}${"☆".repeat(5 - t.bintang)}</span>
    <p>“${esc(t.teks)}”</p>
    <div class="who"><div class="avatar">${esc(t.nama.charAt(0))}</div>
      <div><strong>${esc(t.nama)}</strong><span>${esc(t.kota)}</span></div></div>
  </article>`).join("");
  $("#faqList").innerHTML = FAQ.map(f => `<details class="qa"><summary>${esc(f.q)}</summary><div class="ans">${esc(f.a)}</div></details>`).join("");
}

/* ---------- keranjang ---------- */
function tambah(id, qty = 1, notif = false) {
  const p = PRODUK.find(x => x.id === id);
  if (!p) return;
  const ada = KERANJANG.find(i => i.id === id);
  if (ada) ada.qty += qty; else KERANJANG.push({ id: p.id, nama: p.nama, harga: p.harga, gambar: p.gambar, qty });
  simpanKeranjang(); renderKeranjang();
  if (notif) toast(`✓ ${p.nama} masuk keranjang`);
}

function ubahQty(id, delta) {
  const it = KERANJANG.find(i => i.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) KERANJANG = KERANJANG.filter(i => i.id !== id);
  simpanKeranjang(); renderKeranjang();
}

function hapus(id) {
  KERANJANG = KERANJANG.filter(i => i.id !== id);
  simpanKeranjang(); renderKeranjang(); toast("Produk dihapus dari keranjang");
}

function renderKeranjang() {
  $("#cartCount").textContent = totalItem();
  const body = $("#cartBody");
  if (!KERANJANG.length) {
    body.innerHTML = `<div class="cart-empty"><div class="big">🧺</div><strong>Keranjang masih kosong</strong>
      <p style="font-size:.88rem">Yuk pilih produk favorit Anda dulu.</p>
      <button class="btn btn-primary btn-sm" data-tutup-tutup>Mulai belanja</button></div>`;
    const b = $("[data-tutup-tutup]", body);
    if (b) b.addEventListener("click", () => { tutupDrawer(); location.hash = "#katalog"; });
  } else {
    body.innerHTML = KERANJANG.map(i => `<div class="citem">
      <img src="${i.gambar}" alt="${esc(i.nama)}">
      <div>
        <h4>${esc(i.nama)}</h4>
        <div class="cp">${rupiah(i.harga)} <span style="font-weight:400;color:var(--muted);font-size:.78rem">× ${i.qty}</span></div>
        <div class="qty">
          <button data-qty="${i.id}" data-d="-1" aria-label="kurangi">−</button><span>${i.qty}</span>
          <button data-qty="${i.id}" data-d="1" aria-label="tambah">+</button>
        </div>
        <button class="rm" data-rm="${i.id}">Hapus</button>
      </div></div>`).join("");
    $$("#cartBody [data-qty]").forEach(b => b.addEventListener("click", () => ubahQty(b.dataset.qty, Number(b.dataset.d))));
    $$("#cartBody [data-rm]").forEach(b => b.addEventListener("click", () => hapus(b.dataset.rm)));
  }
  const sub = subtotal();
  const gratis = sub >= PROFIL.gratisOngkirMin && sub > 0;
  $("#sumSub").textContent = rupiah(sub);
  $("#sumOngkir").textContent = sub === 0 ? "-" : (gratis ? "GRATIS (area Surabaya)" : `mulai ${rupiah(PROFIL.ongkirSurabaya)}`);
  $("#sumTotal").textContent = rupiah(sub);
  $("#freeInfo").style.display = sub > 0 && !gratis ? "block" : "none";
  $("#freeInfo").textContent = `Tambah ${rupiah(PROFIL.gratisOngkirMin - sub)} lagi untuk gratis ongkir area Surabaya 🎉`;
  $("#btnCheckout").disabled = !KERANJANG.length;
  $("#btnCheckout").style.opacity = KERANJANG.length ? 1 : .5;
}

/* ---------- drawer ---------- */
const bukaDrawer = () => { $("#drawer").classList.add("show"); $("#overlay").classList.add("show"); document.body.style.overflow = "hidden"; };
const tutupDrawer = () => { $("#drawer").classList.remove("show"); $("#overlay").classList.remove("show"); document.body.style.overflow = ""; };

/* ---------- modal detail produk ---------- */
function bukaDetail(id) {
  const p = PRODUK.find(x => x.id === id);
  if (!p) return;
  const foto = fotoProduk(p);
  const galeriHtml = foto.length > 1 ? `<div class="detail-galeri" aria-label="Galeri foto produk">${
    foto.map((g, i) => `<button type="button" class="${i === 0 ? "on" : ""}" data-gf="${g}" aria-label="Lihat foto ${i + 1}"><img src="${g}" alt="" loading="lazy"></button>`).join("")
  }</div>` : "";
  $("#detailBody").innerHTML = `<div class="detail-grid">
    <div><img id="dFoto" src="${foto[0]}" alt="${esc(p.nama)}">${galeriHtml}</div>
    <div>
      <div class="card-cat">${esc(namaKategori(p.kategori))}</div>
      <h2 style="font-size:1.4rem;margin-bottom:6px">${esc(p.nama)}</h2>
      <div class="rate"><span class="stars">★★★★★</span> ${p.rating} · ${esc(p.terjual)} terjual</div>
      <div class="detail-price">${rupiah(p.harga)} ${p.hargaCoret ? `<span class="price-old" style="font-size:.9rem">${rupiah(p.hargaCoret)}</span>` : ""}</div>
      <p style="font-size:.92rem;color:var(--ink-soft)">${esc(p.deskripsi)}</p>
      <div class="detail-meta">
        <div>${svg("check", 16)} Pilihan: ${esc(p.varian.join(", "))}</div>
        <div>${svg("shield", 16)} Bebas alkohol &amp; dipilih dari supplier terpercaya</div>
        <div>${svg("truck", 16)} Dikirim dari ${esc(PROFIL.kota)} · bisa COD &amp; same-day Surabaya</div>
      </div>
      <div class="qtyline"><span class="lbl">Jumlah:</span>
        <div class="qty"><button id="dqMinus" aria-label="kurangi">−</button><span id="dqv">1</span><button id="dqPlus" aria-label="tambah">+</button></div>
      </div>
      <div class="card-actions" style="margin-top:18px">
        <button class="btn btn-primary btn-block" id="dAdd">${svg("cart", 16)} Tambah ke Keranjang</button>
      </div>
      <button class="btn btn-outline btn-block" style="margin-top:10px" id="dWa">${svg("wa", 16)} Tanya stok &amp; varian via WhatsApp</button>
    </div></div>`;

  $$("#detailBody .detail-galeri [data-gf]").forEach(b => b.addEventListener("click", () => {
    $("#dFoto").src = b.dataset.gf;
    $$("#detailBody .detail-galeri [data-gf]").forEach(x => x.classList.toggle("on", x === b));
  }));

  let q = 1;
  $("#dqMinus").addEventListener("click", () => { q = Math.max(1, q - 1); $("#dqv").textContent = q; });
  $("#dqPlus").addEventListener("click", () => { q = Math.min(99, q + 1); $("#dqv").textContent = q; });
  $("#dAdd").addEventListener("click", () => { tambah(p.id, q, true); tutupModal("#detailModal"); bukaDrawer(); });
  $("#dWa").addEventListener("click", () => bukaWA(`Assalamualaikum ${PROFIL.brandToko} 🙏\nSaya mau tanya produk:\n• ${p.nama}\n• Harga: ${rupiah(p.harga)}\n• Varian: ${p.varian.join(" / ")}\n\nStoknya ready?`));
  bukaModal("#detailModal");
}

/* ---------- modal checkout ---------- */
function susunPesan() {
  const nama = $("#fNama").value.trim() || "-";
  const hp = $("#fHp").value.trim() || "-";
  const alamat = $("#fAlamat").value.trim() || "-";
  const kirim = $("#fKirim").value;
  const bayar = $("#fBayar").value;
  const catatan = $("#fCatatan").value.trim() || "-";
  const sub = subtotal();
  const gratis = sub >= PROFIL.gratisOngkirMin;

  const barang = KERANJANG.map((i, n) => `${n + 1}. ${i.nama}\n   ${i.qty} x ${rupiah(i.harga)} = ${rupiah(i.harga * i.qty)}`).join("\n");
  return `Assalamualaikum ${PROFIL.brandJasa} / ${PROFIL.brandToko} 🙏
Saya mau pesan:

${barang}

Subtotal: ${rupiah(sub)}
Ongkir: ${gratis ? "GRATIS (area Surabaya)" : "mohon dihitung"} 
Total sementara: ${rupiah(sub)}

Nama: ${nama}
No. HP: ${hp}
Alamat / patokan: ${alamat}
Metode: ${kirim}
Pembayaran: ${bayar}
Catatan: ${catatan}

Mohon dikonfirmasi ketersediaan stok dan total akhirnya ya. Terima kasih 🙏`;
}

function bukaCheckout() {
  if (!KERANJANG.length) { toast("Keranjang masih kosong"); return; }
  tutupDrawer();
  bukaModal("#checkoutModal");
  perbaruiPratinjau();
}

function perbaruiPratinjau() {
  $("#preview").value = susunPesan();
}

function salinPesan() {
  const ta = $("#preview");
  ta.removeAttribute("readonly");
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  if (!ok && navigator.clipboard) navigator.clipboard.writeText(ta.value).then(() => toast("Pesan disalin ✓"), () => {});
  else toast(ok ? "Pesan disalin ✓" : "Silakan salin manual");
  ta.setAttribute("readonly", "readonly");
}

/* ---------- modal helper ---------- */
const bukaModal = sel => { $(sel).classList.add("show"); document.body.style.overflow = "hidden"; };
const tutupModal = sel => { $(sel).classList.remove("show"); if (!$(".drawer.show") && !$(".modal.show")) document.body.style.overflow = ""; };
const tutupSemua = () => { tutupDrawer(); $$(".modal.show").forEach(m => m.classList.remove("show")); document.body.style.overflow = ""; };

/* ---------- init ---------- */
function init() {
  muatData();
  renderProfil(); renderKategori(); renderProduk(); renderJasa(); renderTestiFaq(); renderKeranjang();
  siapkanFotoPemilik();

  $("#cartBtn").addEventListener("click", bukaDrawer);
  $("#closeCart").addEventListener("click", tutupDrawer);
  $("#overlay").addEventListener("click", tutupSemua);
  $$("[data-close]").forEach(b => b.addEventListener("click", () => { tutupModal("#" + b.closest(".modal").id); }));

  $("#searchInput").addEventListener("input", e => { kataKunci = e.target.value.trim(); renderProduk(); });
  $("#sortSel").addEventListener("change", e => { urutkan = e.target.value; renderProduk(); });
  $("#btnCheckout").addEventListener("click", bukaCheckout);
  $("#btnSalin").addEventListener("click", salinPesan);
  $("#btnKirimWa").addEventListener("click", () => { perbaruiPratinjau(); bukaWA($("#preview").value); });
  $$("#checkoutForm input, #checkoutForm textarea, #checkoutForm select").forEach(el => {
    el.addEventListener("change", perbaruiPratinjau);
    el.addEventListener("input", perbaruiPratinjau);
  });
  $("#btnReset").addEventListener("click", () => { $("#checkoutForm").reset(); perbaruiPratinjau(); });

  $("#burger").addEventListener("click", () => $("#nav").classList.toggle("show"));
  $$("#nav a").forEach(a => a.addEventListener("click", () => $("#nav").classList.remove("show")));

  document.addEventListener("keydown", e => { if (e.key === "Escape") tutupSemua(); });

  // tahun di footer
  $("#tahun").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", init);
