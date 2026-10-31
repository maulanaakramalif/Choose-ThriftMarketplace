/* ==========================================================
   Halaman notifikasi – frontend saja (data contoh)
   Buka notifikasi tertentu lewat URL: notification_page.html?id=2
   TODO BACKEND: ganti NOTIFS dengan data dari API, dan panggil API
   di markRead(), markAllRead, toggleRead, dan deleteNtf.
   ========================================================== */

const TYPES = {
  order:    { icon: "bi-truck",          label: "Pesanan" },
  offer:    { icon: "bi-chat-left-text", label: "Tawaran" },
  wishlist: { icon: "bi-heart",          label: "Wishlist" },
  info:     { icon: "bi-megaphone",      label: "Info" }
};

let NOTIFS = [
  { id: 1, type: "order", group: "Hari ini", time: "09.14", read: false,
    title: "Pesanan #TM-2041 sedang dikirim",
    text: "Kurir sudah mengambil paketmu dan sedang menuju alamat tujuan.",
    info: [["Nomor pesanan", "#TM-2041"], ["Barang", "Kemeja flanel kotak Uniqlo"], ["Kurir", "J&T Express"], ["Estimasi tiba", "2 hari lagi"]],
    steps: [["Pesanan dibayar", true], ["Penjual mengemas barang", true], ["Dikirim oleh kurir", true], ["Sampai di tujuan", false]],
    action: { label: "Lacak pesanan", href: "#" } },
  { id: 2, type: "offer", group: "Hari ini", time: "08.40", read: false,
    title: "Tawaran kamu untuk Nike Air Max dibalas",
    text: "Dimas Sneakers membalas tawaranmu. Buka chat untuk melanjutkan negosiasi.",
    info: [["Penjual", "Dimas Sneakers"], ["Barang", "Nike Air Max 90 ukuran 42"], ["Harga tayang", "Rp650.000"], ["Tawaranmu", "Rp550.000"]],
    action: { label: "Buka chat", href: "chat_page.html?seller=2" } },
  { id: 3, type: "wishlist", group: "Hari ini", time: "07.05", read: false,
    title: "Harga Jaket Denim turun",
    text: "Penjual menurunkan harga barang yang ada di wishlist kamu.",
    info: [["Barang", "Jaket denim Levi’s 90an ukuran L"], ["Harga sebelumnya", "Rp210.000"], ["Harga sekarang", "Rp185.000"], ["Lokasi", "Batam"]],
    action: { label: "Lihat barang", href: "index.html#produk" } },
  { id: 4, type: "offer", group: "Kemarin", time: "19.22", read: true,
    title: "Penjual menerima tawaranmu",
    text: "Rina Thrift menyetujui tawaranmu. Lanjutkan ke pembayaran agar barang segera dikirim.",
    info: [["Penjual", "Rina Thrift"], ["Barang", "Dress floral vintage midi"], ["Harga disepakati", "Rp100.000"]],
    action: { label: "Buka chat", href: "chat_page.html?seller=4" } },
  { id: 5, type: "info", group: "Kemarin", time: "10.00", read: true,
    title: "Gratis ongkir akhir pekan",
    text: "Nikmati gratis ongkir untuk pembelian di atas Rp100.000 selama akhir pekan ini.",
    info: [["Minimal belanja", "Rp100.000"], ["Berlaku", "Sabtu – Minggu"]],
    action: { label: "Belanja sekarang", href: "index.html#produk" } },
  { id: 6, type: "order", group: "Kemarin", time: "08.30", read: true,
    title: "Pesanan #TM-2037 telah sampai",
    text: "Paketmu sudah diterima. Konfirmasi pesanan agar dana diteruskan ke penjual.",
    info: [["Nomor pesanan", "#TM-2037"], ["Barang", "Jam tangan Casio F-91W"], ["Kurir", "JNE"]],
    steps: [["Pesanan dibayar", true], ["Penjual mengemas barang", true], ["Dikirim oleh kurir", true], ["Sampai di tujuan", true]],
    action: { label: "Konfirmasi diterima", href: "#" } },
  { id: 7, type: "info", group: "Minggu ini", time: "Sen", read: true,
    title: "Verifikasi akunmu",
    text: "Lengkapi verifikasi identitas agar bisa mendapat lencana penjual terverifikasi.",
    info: [["Status", "Belum diverifikasi"], ["Waktu proses", "1–2 hari kerja"]],
    action: { label: "Verifikasi sekarang", href: "#" } },
  { id: 8, type: "wishlist", group: "Minggu ini", time: "Min", read: true,
    title: "Barang di wishlist tinggal sedikit",
    text: "Kamera Canon AE-1 yang kamu simpan sudah dilihat banyak pembeli. Segera putuskan sebelum terjual.",
    info: [["Barang", "Kamera Canon AE-1 + lensa 50mm"], ["Harga", "Rp1.850.000"], ["Lokasi", "Yogyakarta"]],
    action: { label: "Lihat barang", href: "index.html#produk" } }
];

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const app = $("#ntfApp");
let activeId = null;
let filter = "all";

/* Tinggi header bisa berbeda-beda; ukur supaya panel pas satu layar */
function syncHeaderHeight() {
  const h = $("#ntfHeader").offsetHeight;
  document.documentElement.style.setProperty("--ntf-header-h", h + "px");
}
syncHeaderHeight();
window.addEventListener("resize", syncHeaderHeight);

/* ---------- Daftar ---------- */
function visibleItems() {
  return NOTIFS.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });
}

function renderList() {
  const items = visibleItems();
  let html = "", lastGroup = "";

  items.forEach(n => {
    if (n.group !== lastGroup) {
      html += `<div class="tm-ntf-group" role="presentation">${esc(n.group)}</div>`;
      lastGroup = n.group;
    }
    html += `
    <button class="tm-ntf-item ${n.id === activeId ? "active" : ""} ${n.read ? "" : "is-unread"}" data-id="${n.id}" role="listitem">
      <span class="tm-ntf-icon tm-ntf-${n.type}"><i class="bi ${TYPES[n.type].icon}"></i></span>
      <span class="flex-grow-1 min-w-0">
        <span class="d-flex justify-content-between gap-2">
          <span class="ntf-title">${esc(n.title)}</span>
          <span class="ntf-time">${esc(n.time)}</span>
        </span>
        <span class="ntf-text">${esc(n.text)}</span>
      </span>
      ${n.read ? "" : '<span class="tm-ntf-dot" aria-label="Belum dibaca"></span>'}
    </button>`;
  });

  $("#ntfList").innerHTML = html;
  $("#listEmpty").classList.toggle("d-none", items.length > 0);

  const unread = NOTIFS.filter(n => !n.read).length;
  const badge = $("#unreadTotal");
  badge.textContent = unread;
  badge.classList.toggle("d-none", unread === 0);
  $("#markAllRead").disabled = unread === 0;
}

/* ---------- Detail ---------- */
function renderDetail() {
  const n = NOTIFS.find(x => x.id === activeId);
  if (!n) return;

  $("#detailIcon").className = `tm-ntf-icon tm-ntf-${n.type}`;
  $("#detailIcon").innerHTML = `<i class="bi ${TYPES[n.type].icon}"></i>`;
  $("#detailTitle").textContent = n.title;
  $("#detailTime").textContent = `${TYPES[n.type].label} · ${n.group}, ${n.time}`;
  $("#detailText").textContent = n.text;

  const infoCard = $("#detailInfoCard");
  infoCard.classList.toggle("d-none", !n.info);
  $("#detailInfo").innerHTML = (n.info || []).map(([k, v]) =>
    `<dt class="col-5 col-sm-4">${esc(k)}</dt><dd class="col-7 col-sm-8">${esc(v)}</dd>`).join("");

  const stepsWrap = $("#detailStepsWrap");
  stepsWrap.classList.toggle("d-none", !n.steps);
  $("#detailSteps").innerHTML = (n.steps || []).map(([label, done]) =>
    `<li class="${done ? "done" : ""}"><span class="tm-ntf-step-dot"><i class="bi bi-check-lg"></i></span><span>${esc(label)}</span></li>`).join("");

  const action = $("#detailAction");
  action.textContent = n.action.label;
  action.href = n.action.href;

  $("#toggleRead").textContent = n.read ? "Tandai belum dibaca" : "Tandai sudah dibaca";
  $("#detailBody").scrollTop = 0;
}

function openNtf(id) {
  activeId = id;
  const n = NOTIFS.find(x => x.id === id);
  n.read = true;                       // TODO BACKEND: kirim status dibaca ke API
  $("#detailEmpty").classList.add("d-none");
  const pane = $("#detailPane");
  pane.classList.remove("d-none");
  pane.classList.add("d-flex");
  app.classList.add("is-open");
  renderList();
  renderDetail();
}

function closeDetail() {
  activeId = null;
  app.classList.remove("is-open");
  $("#detailPane").classList.add("d-none");
  $("#detailPane").classList.remove("d-flex");
  $("#detailEmpty").classList.remove("d-none");
  renderList();
}

/* ---------- Event ---------- */
$("#ntfList").addEventListener("click", e => {
  const item = e.target.closest("[data-id]");
  if (item) openNtf(Number(item.dataset.id));
});

$("#backToList").addEventListener("click", () => app.classList.remove("is-open"));

$("#ntfTabs").addEventListener("click", e => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  document.querySelectorAll("#ntfTabs .nav-link").forEach(b => b.classList.toggle("active", b === btn));
  renderList();
});

$("#markAllRead").addEventListener("click", () => {
  NOTIFS.forEach(n => { n.read = true; });   // TODO BACKEND
  renderList();
  if (activeId) renderDetail();
});

$("#toggleRead").addEventListener("click", () => {
  const n = NOTIFS.find(x => x.id === activeId);
  if (!n) return;
  n.read = !n.read;                           // TODO BACKEND
  renderList();
  renderDetail();
});

$("#deleteNtf").addEventListener("click", () => {
  NOTIFS = NOTIFS.filter(x => x.id !== activeId);   // TODO BACKEND
  closeDetail();
});

/* ---------- Mulai ---------- */
renderList();
const wanted = Number(new URLSearchParams(location.search).get("id"));
if (NOTIFS.some(n => n.id === wanted)) openNtf(wanted);
