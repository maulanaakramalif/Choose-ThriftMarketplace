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

/* ---------- Chat / nego ---------- */
const chatModal = $("#chatModal");
const chatLog = $("#chatLog");
let currentProduct = null;

function addBubble(text, mine) {
  const b = document.createElement("div");
  b.className = "tm-bubble " + (mine ? "tm-bubble-me" : "tm-bubble-seller");
  b.textContent = text;
  chatLog.appendChild(b);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function openChat(p) {
  currentProduct = p;
  chatModal.dataset.product = p.name;
  chatModal.dataset.price = p.price;
  bootstrap.Modal.getOrCreateInstance(chatModal).show();
}

chatModal.addEventListener("show.bs.modal", e => {
  // dibuka dari tombol navbar (tanpa produk spesifik)
  if (e.relatedTarget) { currentProduct = null; }
  chatLog.innerHTML = '<div class="tm-bubble tm-bubble-seller">Halo, ada yang bisa dibantu?</div>';
  const chips = $("#offerChips");
  chips.innerHTML = "";
  if (currentProduct) {
    $("#chatProduct").textContent = `${currentProduct.name} · ${rupiah(currentProduct.price)}`;
    $("#negoBox").classList.remove("d-none");
    [0.9, 0.8, 0.7].forEach(f => {
      const offer = Math.round(currentProduct.price * f / 1000) * 1000;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm btn-outline-success rounded-pill";
      btn.textContent = `Tawar ${rupiah(offer)}`;
      btn.addEventListener("click", () => sendMessage(`Boleh saya tawar ${rupiah(offer)}?`, true));
      chips.appendChild(btn);
    });
  } else {
    $("#chatProduct").textContent = "Pesan masuk";
    $("#negoBox").classList.add("d-none");
  }
});
chatModal.addEventListener("hidden.bs.modal", () => { currentProduct = null; });

function sendMessage(text, isOffer) {
  if (!text.trim()) return;
  addBubble(text, true);
  setTimeout(() => addBubble(isOffer
    ? "Terima kasih tawarannya, saya pertimbangkan dulu ya."
    : "Baik, ditunggu ya.", false), 700);
}
$("#chatSend").addEventListener("click", () => {
  const input = $("#chatInput");
  sendMessage(input.value, false);
  input.value = "";
  input.focus();
});
$("#chatInput").addEventListener("keydown", e => { if (e.key === "Enter") $("#chatSend").click(); });

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
