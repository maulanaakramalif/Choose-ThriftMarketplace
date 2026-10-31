// ===== Bagian dari script.js =====
/* ==========================================================
   Thrift Marketplace – interaksi frontend (tanpa backend)
   Data produk di bawah hanya contoh; ganti dengan data asli
   dari API saat backend sudah siap.
   ========================================================== */

const CATEGORY_LABEL = {
  pria: "Pakaian Pria", wanita: "Pakaian Wanita", sepatu: "Sepatu & Sneakers",
  aksesoris: "Aksesoris", elektronik: "Elektronik", buku: "Buku"
};

const PRODUCTS = [
  { id: 1, name: "Jaket denim Levi's 90an ukuran L", price: 185000, brand: "Levi's", cond: "Baik", city: "Batam", cat: "pria", icon: "bi-person-standing", tone: 1 },
  { id: 2, name: "Nike Air Max 90 ukuran 42", price: 650000, brand: "Nike", cond: "Seperti baru", city: "Jakarta", cat: "sepatu", icon: "bi-balloon", tone: 2 },
  { id: 3, name: "Kemeja flanel kotak Uniqlo", price: 75000, brand: "Uniqlo", cond: "Baik", city: "Bandung", cat: "pria", icon: "bi-person-standing", tone: 3 },
  { id: 4, name: "Kamera Canon AE-1 + lensa 50mm", price: 1850000, brand: "Canon", cond: "Baik", city: "Yogyakarta", cat: "elektronik", icon: "bi-camera", tone: 5 },
  { id: 5, name: "Dress floral vintage midi", price: 120000, brand: "Zara", cond: "Seperti baru", city: "Surabaya", cat: "wanita", icon: "bi-person-standing-dress", tone: 4 },
  { id: 6, name: "Adidas Samba OG ukuran 40", price: 480000, brand: "Adidas", cond: "Layak pakai", city: "Batam", cat: "sepatu", icon: "bi-balloon", tone: 1 },
  { id: 7, name: "Jam tangan Casio F-91W", price: 90000, brand: "Casio", cond: "Baik", city: "Jakarta", cat: "aksesoris", icon: "bi-watch", tone: 2 },
  { id: 8, name: "Hoodie crewneck The North Face", price: 295000, brand: "The North Face", cond: "Seperti baru", city: "Bandung", cat: "pria", icon: "bi-person-standing", tone: 3 },
  { id: 9, name: "Headphone Sony MDR-7506", price: 720000, brand: "Sony", cond: "Baik", city: "Surabaya", cat: "elektronik", icon: "bi-headphones", tone: 5 },
  { id: 10, name: "Novel Laskar Pelangi cetakan awal", price: 60000, brand: "Bentang", cond: "Layak pakai", city: "Yogyakarta", cat: "buku", icon: "bi-book", tone: 4 },
  { id: 11, name: "Blazer oversized wol", price: 210000, brand: "H&M", cond: "Baik", city: "Batam", cat: "wanita", icon: "bi-person-standing-dress", tone: 1 },
  { id: 12, name: "Tas selempang kulit Polo", price: 150000, brand: "Polo", cond: "Baik", city: "Jakarta", cat: "aksesoris", icon: "bi-handbag", tone: 2 }
];

const state = {
  q: "", brand: "", cond: "", city: "", price: "", cat: "", sort: "recommended",
  wishlist: new Set(), cart: new Set()
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rupiah = n => "Rp" + n.toLocaleString("id-ID");

/* ---------- Toast ---------- */
const toastEl = $("#appToast");
const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2600 });
function notify(msg) { $("#toastMsg").textContent = msg; toast.show(); }

/* ---------- Isi opsi brand & kota dari data ---------- */
function fillOptions(selectId, key) {
  const sel = $(selectId);
  [...new Set(PRODUCTS.map(p => p[key]))].sort().forEach(v => sel.add(new Option(v, v)));
}
fillOptions("#filterBrand", "brand");
fillOptions("#filterCity", "city");

/* ---------- Render produk ---------- */
function getFiltered() {
  let list = PRODUCTS.filter(p => {
    const q = state.q.trim().toLowerCase();
    if (q && !(p.name + " " + p.brand).toLowerCase().includes(q)) return false;
    if (state.brand && p.brand !== state.brand) return false;
    if (state.cond && p.cond !== state.cond) return false;
    if (state.city && p.city !== state.city) return false;
    if (state.cat && p.cat !== state.cat) return false;
    if (state.price) {
      const [min, max] = state.price.split("-").map(Number);
      if (p.price < min || p.price > max) return false;
    }
    return true;
  });
  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "high") list.sort((a, b) => b.price - a.price);
  if (state.sort === "newest") list.sort((a, b) => b.id - a.id);
  return list;
}

function cardHTML(p) {
  const wished = state.wishlist.has(p.id);
  const inCart = state.cart.has(p.id);
  return `
  <div class="col">
    <article class="card tm-product h-100 border-0">
      <div class="tm-thumb tm-tone-${p.tone}">
        <i class="bi ${p.icon}" aria-hidden="true"></i>
        <button class="tm-wish ${wished ? "active" : ""}" data-wish="${p.id}" aria-pressed="${wished}" aria-label="Simpan ${p.name} ke wishlist">
          <i class="bi ${wished ? "bi-heart-fill" : "bi-heart"}"></i>
        </button>
        <span class="tm-cond">${p.cond}</span>
      </div>
      <div class="card-body d-flex flex-column p-3">
        <h3 class="card-title fw-semibold">${p.name}</h3>
        <p class="tm-price mb-1">${rupiah(p.price)}</p>
        <p class="small text-body-secondary mb-3"><i class="bi bi-geo-alt me-1"></i>${p.city}</p>
        <div class="d-flex gap-2 mt-auto">
          <button class="btn btn-primary btn-sm flex-grow-1 rounded-pill" data-cart="${p.id}" ${inCart ? "disabled" : ""}>
            ${inCart ? "Di keranjang" : "Beli"}
          </button>
          <button class="btn btn-outline-success btn-sm rounded-pill" data-nego="${p.id}" aria-label="Chat dan nego ${p.name}">
            <i class="bi bi-chat-dots"></i> Nego
          </button>
        </div>
      </div>
    </article>
  </div>`;
}

function render() {
  const list = getFiltered();
  $("#productGrid").innerHTML = list.map(cardHTML).join("");
  $("#emptyState").classList.toggle("d-none", list.length > 0);

  const filtering = state.q || state.brand || state.cond || state.city || state.price || state.cat;
  $("#resultInfo").textContent = filtering
    ? `${list.length} barang ditemukan`
    : "Rekomendasi dan barang yang baru diunggah.";

  // label kategori aktif
  const badge = $("#activeCategory");
  if (state.cat) {
    badge.innerHTML = `${CATEGORY_LABEL[state.cat]} <button type="button" class="btn-close ms-1" style="font-size:.6rem" aria-label="Hapus filter kategori" id="clearCat"></button>`;
    badge.classList.remove("d-none"); badge.classList.add("d-inline-flex");
  } else {
    badge.classList.add("d-none"); badge.classList.remove("d-inline-flex");
  }
  $$(".tm-cat").forEach(b => b.classList.toggle("active", b.dataset.category === state.cat));
}

/* ---------- Filter & pencarian ---------- */
$("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  state.q = $("#searchInput").value;
  render();
  $("#produk").scrollIntoView();
});
$("#searchInput").addEventListener("input", e => { state.q = e.target.value; render(); });

[["#filterBrand", "brand"], ["#filterCondition", "cond"], ["#filterCity", "city"], ["#filterPrice", "price"]]
  .forEach(([id, key]) => $(id).addEventListener("change", e => { state[key] = e.target.value; render(); }));

$("#sortSelect").addEventListener("change", e => { state.sort = e.target.value; render(); });

$$("#trendingChips [data-search]").forEach(btn => btn.addEventListener("click", () => {
  state.q = btn.dataset.search;
  $("#searchInput").value = state.q;
  render();
  $("#produk").scrollIntoView();
}));

// Kategori: tile, dropdown navbar, dan "Lihat semua"
$$("[data-category]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  state.cat = el.dataset.category;
  render();
  $("#produk").scrollIntoView();
}));
document.addEventListener("click", e => {
  if (e.target.id === "clearCat") { state.cat = ""; render(); }
});

function resetFilters() {
  Object.assign(state, { q: "", brand: "", cond: "", city: "", price: "", cat: "" });
  $("#searchForm").reset();
  render();
}
$("#resetFilters").addEventListener("click", resetFilters);

/* ---------- Wishlist, keranjang, nego (delegasi event) ---------- */
function updateBadge(id, n) {
  const el = $(id);
  el.textContent = n;
  el.classList.toggle("d-none", n === 0);
}

$("#productGrid").addEventListener("click", e => {
  const wish = e.target.closest("[data-wish]");
  const cart = e.target.closest("[data-cart]");
  const nego = e.target.closest("[data-nego]");

  if (wish) {
    const id = Number(wish.dataset.wish);
    const added = !state.wishlist.has(id);
    added ? state.wishlist.add(id) : state.wishlist.delete(id);
    wish.classList.toggle("active", added);
    wish.setAttribute("aria-pressed", added);
    wish.firstElementChild.className = "bi " + (added ? "bi-heart-fill" : "bi-heart");
    updateBadge("#wishlistCount", state.wishlist.size);
    notify(added ? "Disimpan ke wishlist." : "Dihapus dari wishlist.");
  }
  if (cart) {
    const id = Number(cart.dataset.cart);
    state.cart.add(id);
    cart.disabled = true;
    cart.textContent = "Di keranjang";
    updateBadge("#cartCount", state.cart.size);
    notify("Ditambahkan ke keranjang.");
  }
  if (nego) openChat(PRODUCTS.find(p => p.id === Number(nego.dataset.nego)));
});

$("#btnWishlist").addEventListener("click", () =>
  notify(state.wishlist.size ? `${state.wishlist.size} barang di wishlist kamu.` : "Wishlist kamu masih kosong."));
$("#btnCart").addEventListener("click", () =>
  notify(state.cart.size ? `${state.cart.size} barang di keranjang kamu.` : "Keranjang kamu masih kosong."));

/* ---------- Form jual barang (validasi Bootstrap) ---------- */
$("#sellForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
  bootstrap.Modal.getInstance($("#sellModal")).hide();
  form.reset();
  form.classList.remove("was-validated");
  notify("Barang berhasil dipasang.");
});

/* ---------- Mulai ---------- */
render();

// ===== Bagian dari login.js =====
/* ==========================================================
   Login card – frontend saja, belum terhubung ke backend.
   Cari komentar "TODO BACKEND" untuk titik sambung ke API.
   Dimuat SETELAH main.js (memakai fungsi notify()).
   ========================================================== */

(function () {
  const loginModalEl = document.getElementById("loginModal");
  const loginModal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
  const form = document.getElementById("loginForm");
  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmit");
  const toggleBtn = document.getElementById("togglePassword");

  let loggedIn = false;
  let pendingNotice = "";

  /* ---------- Buka login: dari menu profil ---------- */
  document.querySelectorAll("[data-open-login]").forEach(el =>
    el.addEventListener("click", e => { e.preventDefault(); loginModal.show(); }));

  /* ---------- Tahan aksi yang butuh akun ---------- */
  // Jual Barang – batalkan pembukaan modal bila belum masuk
  ["sellModal"].forEach(id => {
    document.getElementById(id).addEventListener("show.bs.modal", e => {
      if (loggedIn) return;
      e.preventDefault();
      pendingNotice = id === "sellModal" ? "jual barang" : "chat dan nego";
      showLogin();
    });
  });

  //Open chat page - batalkan pembukaan chat page jika belum login 
  /* ---------- Chat / nego ---------- */
  const btnChat = document.getElementById("btnChat")
  btnChat.addEventListener('click', function(){
  if (loggedIn) {
    window.location.href = 'chat_page.html';
  }
  else {
    loginModal.show();
  }
  })

  // Open notif page - batalkan pembukaan page jika belum login
 /*-------------notification----------------*/
 const btnNotif = document.getElementById("btnNotif")
 btnNotif.addEventListener('click',function(){
  if (loggedIn) {
    window.location.href = 'notification_page.html';
  }
  else {
    loginModal.show();
  }
 })

  // Beli & Wishlist – dicegat sebelum handler di main.js (fase capture)
  document.addEventListener("click", e => {
    if (loggedIn) return;
    const gated = e.target.closest("[data-wish], [data-cart], #btnWishlist, #btnCart");
    if (!gated) return;
    e.preventDefault();
    e.stopPropagation();
    pendingNotice = gated.matches("[data-cart], #btnCart") ? "membeli barang" : "menyimpan ke wishlist";
    showLogin();
  }, true);

  function showLogin() {
    document.getElementById("loginHint").textContent =
      pendingNotice ? `Masuk dulu untuk ${pendingNotice}.` : "Masuk untuk lanjut belanja dan jual barang.";
    loginModal.show();
  }

  /* ---------- Tampil / sembunyikan password ---------- */
  toggleBtn.addEventListener("click", () => {
    const show = passEl.type === "password";
    passEl.type = show ? "text" : "password";
    toggleBtn.innerHTML = `<i class="bi ${show ? "bi-eye-slash" : "bi-eye"}"></i>`;
    toggleBtn.setAttribute("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
    toggleBtn.setAttribute("aria-pressed", show);
  });

  /* ---------- Validasi & kirim ---------- */
  function validate() {
    let ok = true;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
    emailEl.classList.toggle("is-invalid", !emailOk);
    if (!emailOk) ok = false;

    const passOk = passEl.value.length >= 8;
    passEl.classList.toggle("is-invalid", !passOk);
    if (!passOk) ok = false;
    return ok;
  }

  [emailEl, passEl].forEach(el =>
    el.addEventListener("input", () => { el.classList.remove("is-invalid"); errorBox.classList.add("d-none"); }));

  form.addEventListener("submit", e => {
    e.preventDefault();
    errorBox.classList.add("d-none");
    if (!validate()) { (emailEl.classList.contains("is-invalid") ? emailEl : passEl).focus(); return; }

    setLoading(true);

    // TODO BACKEND: ganti simulasi ini dengan request ke API login, mis.
    // fetch("/api/login", { method: "POST", body: JSON.stringify({ email, password, remember }) })
    setTimeout(() => {
      setLoading(false);
      const fakeFail = passEl.value === "00000000"; // hanya untuk mencoba tampilan galat
      if (fakeFail) {
        errorBox.textContent = "Email atau password salah. Periksa lagi lalu coba masuk kembali.";
        errorBox.classList.remove("d-none");
        return;
      }
      onLoginSuccess(emailEl.value.trim());
    }, 900);
  });

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.innerHTML = on
      ? '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Memproses…'
      : "Masuk";
  }

  function onLoginSuccess(email) {
    loggedIn = true;
    loginModal.hide();
    form.reset();
    pendingNotice = "";
    document.querySelectorAll('[data-auth="out"]').forEach(el => el.classList.add("d-none"));
    document.querySelectorAll('[data-auth="in"]').forEach(el => el.classList.remove("d-none"));
    document.getElementById("profileEmail").textContent = email;
    notify("Berhasil masuk. Silakan lanjutkan.");
  }

  document.getElementById("logoutBtn").addEventListener("click", e => {
    e.preventDefault();
    loggedIn = false;
    document.querySelectorAll('[data-auth="in"]').forEach(el => el.classList.add("d-none"));
    document.querySelectorAll('[data-auth="out"]').forEach(el => el.classList.remove("d-none"));
    notify("Kamu sudah keluar.");
  });

  /* ---------- Tautan lain (belum ada halamannya) ---------- */
  document.getElementById("forgotLink").addEventListener("click", e => {
    e.preventDefault(); notify("Fitur lupa password belum tersedia.");
  });
  document.getElementById("registerLink").addEventListener("click", e => {
    e.preventDefault(); notify("Halaman daftar belum tersedia.");
  });
  document.getElementById("googleLogin").addEventListener("click", () =>
    notify("Masuk dengan Google belum tersedia."));

  // Fokus ke email saat kartu terbuka; bersihkan status saat ditutup
  loginModalEl.addEventListener("shown.bs.modal", () => emailEl.focus());
  loginModalEl.addEventListener("hidden.bs.modal", () => {
    form.reset();
    [emailEl, passEl].forEach(el => el.classList.remove("is-invalid"));
    errorBox.classList.add("d-none");
    passEl.type = "password";
    toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
    setLoading(false);
    if (!loggedIn) pendingNotice = "";
  });
})();

