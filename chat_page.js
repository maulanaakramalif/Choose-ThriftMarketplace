// ===== Bagian dari chat.js =====
/* ==========================================================
   Halaman chat – frontend saja (data contoh, balasan simulasi)
   Buka percakapan tertentu lewat URL: chat.html?seller=2
   TODO BACKEND: ganti SELLERS dengan data dari API dan kirim
   pesan lewat request/WebSocket di fungsi sendMessage().
   ========================================================== */

const SELLERS = [
  { id: 1, name: "Rina Thrift", city: "Batam", online: true, tone: 1, unread: 2,
    product: { name: "Jaket denim Levi’s 90an ukuran L", price: 185000, icon: "bi-person-standing" },
    messages: [
      { from: "me", text: "Halo kak, jaketnya masih ada?", time: "09.12" },
      { from: "seller", text: "Halo, masih ada kak.", time: "09.14" },
      { from: "seller", text: "Kondisi 90% mulus, tidak ada sobek.", time: "09.14" },
      { from: "seller", text: "Mau lihat foto detail jahitannya?", time: "09.15" } ] },
  { id: 2, name: "Dimas Sneakers", city: "Jakarta", online: true, tone: 2, unread: 0,
    product: { name: "Nike Air Max 90 ukuran 42", price: 650000, icon: "bi-balloon" },
    messages: [
      { from: "me", text: "Bisa nego jadi 550 rb?", time: "Kemarin" },
      { from: "seller", text: "Maaf kak, 600 rb pas bisa. Sudah termasuk kotak asli.", time: "Kemarin" } ] },
  { id: 3, name: "Kamera Klasik ID", city: "Yogyakarta", online: false, tone: 3, unread: 1,
    product: { name: "Kamera Canon AE-1 + lensa 50mm", price: 1850000, icon: "bi-camera" },
    messages: [
      { from: "seller", text: "Shutter sudah dicek, jalan normal semua speed.", time: "Sen" } ] },
  { id: 4, name: "Lemari Sari", city: "Bandung", online: false, tone: 4, unread: 0,
    product: { name: "Dress floral vintage midi", price: 120000, icon: "bi-person-standing-dress" },
    messages: [
      { from: "me", text: "Ukurannya all size ya kak?", time: "Min" },
      { from: "seller", text: "Betul, muat sampai L.", time: "Min" } ] },
  { id: 5, name: "Buku Bekas Pak Anton", city: "Surabaya", online: true, tone: 5, unread: 0,
    product: { name: "Novel Laskar Pelangi cetakan awal", price: 60000, icon: "bi-book" },
    messages: [] }
];

const $ = s => document.querySelector(s);
const rupiah = n => "Rp" + n.toLocaleString("id-ID");
const nowTime = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const initials = name => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const app = $("#chatApp");
let activeId = null;
let filter = "all";
let query = "";

const lastMsg = s => s.messages[s.messages.length - 1];

/* ---------- Daftar penjual ---------- */
function renderList() {
  const q = query.trim().toLowerCase();
  const items = SELLERS.filter(s => {
    if (filter === "unread" && s.unread === 0) return false;
    return !q || (s.name + " " + s.product.name).toLowerCase().includes(q);
  });

  $("#sellerList").innerHTML = items.map(s => {
    const last = lastMsg(s);
    return `
    <button class="tm-chat-item ${s.id === activeId ? "active" : ""} ${s.unread ? "has-unread" : ""}" data-id="${s.id}" role="listitem">
      <span class="tm-avatar tm-av-${s.tone} ${s.online ? "tm-online" : ""}">${initials(s.name)}</span>
      <span class="flex-grow-1 min-w-0">
        <span class="d-flex justify-content-between gap-2">
          <span class="fw-semibold text-truncate">${esc(s.name)}</span>
          <span class="time">${last ? last.time : ""}</span>
        </span>
        <span class="d-block small text-body-secondary text-truncate">${esc(s.product.name)}</span>
        <span class="d-flex justify-content-between align-items-center gap-2">
          <span class="preview">${last ? (last.from === "me" ? "Kamu: " : "") + esc(last.text) : "Belum ada pesan"}</span>
          ${s.unread ? `<span class="badge rounded-pill tm-unread">${s.unread}</span>` : ""}
        </span>
      </span>
    </button>`;
  }).join("");

  $("#listEmpty").classList.toggle("d-none", items.length > 0);

  const total = SELLERS.reduce((n, s) => n + s.unread, 0);
  const badge = $("#unreadTotal");
  badge.textContent = total;
  badge.classList.toggle("d-none", total === 0);
}

/* ---------- Percakapan ---------- */
function renderConversation() {
  const s = SELLERS.find(x => x.id === activeId);
  if (!s) return;

  $("#convAvatar").className = `tm-avatar tm-av-${s.tone} ${s.online ? "tm-online" : ""}`;
  $("#convAvatar").textContent = initials(s.name);
  $("#convName").textContent = s.name;
  const status = $("#convStatus");
  status.textContent = s.online ? "Online" : "Terakhir dilihat hari ini";
  status.className = "small mb-0 " + (s.online ? "text-success fw-semibold" : "text-body-secondary");
  $("#convProduct").textContent = s.product.name;
  $("#convPrice").textContent = rupiah(s.product.price);
  $("#convProductIcon").className = "bi " + s.product.icon;

  const box = $("#messages");
  box.innerHTML = s.messages.length
    ? s.messages.map(m => `<div class="tm-msg tm-msg-${m.from}">${esc(m.text)}<span class="t">${m.time}</span></div>`).join("")
    : '<div class="tm-msg-day">Mulai percakapan dengan ' + esc(s.name) + "</div>";
  box.scrollTop = box.scrollHeight;

  renderQuickReplies(s);
}

function renderQuickReplies(s) {
  const offer = Math.round(s.product.price * 0.8 / 1000) * 1000;
  const replies = ["Masih ada?", "Boleh nego?", `Tawar ${rupiah(offer)}`, "Bisa COD?"];
  $("#quickReplies").innerHTML = replies.map(r => `<button type="button" class="btn btn-sm">${esc(r)}</button>`).join("");
}

function openChat(id) {
  activeId = id;
  const s = SELLERS.find(x => x.id === id);
  s.unread = 0;
  $("#convEmpty").classList.add("d-none");
  const pane = $("#convPane");
  pane.classList.remove("d-none");
  pane.classList.add("d-flex");
  app.classList.add("is-open");
  renderList();
  renderConversation();
  if (window.matchMedia("(min-width: 768px)").matches) $("#msgInput").focus();
}

/* ---------- Kirim pesan ---------- */
function sendMessage(text) {
  text = text.trim();
  const s = SELLERS.find(x => x.id === activeId);
  if (!text || !s) return;

  // TODO BACKEND: kirim ke API / WebSocket di sini
  s.messages.push({ from: "me", text, time: nowTime() });
  renderConversation();
  renderList();
  simulateReply(s, text);
}

function simulateReply(s, text) {
  const t = text.toLowerCase();
  let reply = "Baik kak, ditunggu ya.";
  if (t.includes("tawar") || t.includes("nego")) reply = "Boleh kak, tapi jangan terlalu jauh ya. Saya pertimbangkan dulu.";
  else if (t.includes("cod")) reply = `Bisa COD di sekitar ${s.city}, kak.`;
  else if (t.includes("masih")) reply = "Masih ada kak.";

  setTimeout(() => {
    if (activeId === s.id) {
      const box = $("#messages");
      const typing = document.createElement("div");
      typing.className = "tm-msg tm-msg-seller tm-typing";
      typing.id = "typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      box.appendChild(typing);
      box.scrollTop = box.scrollHeight;
    }
  }, 500);

  setTimeout(() => {
    s.messages.push({ from: "seller", text: reply, time: nowTime() });
    if (activeId === s.id) renderConversation(); else s.unread++;
    renderList();
  }, 1700);
}

/* ---------- Event ---------- */
$("#sellerList").addEventListener("click", e => {
  const item = e.target.closest("[data-id]");
  if (item) openChat(Number(item.dataset.id));
});
$("#backToList").addEventListener("click", () => { app.classList.remove("is-open"); });

$("#sellerSearch").addEventListener("input", e => { query = e.target.value; renderList(); });
$("#chatTabs").addEventListener("click", e => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  document.querySelectorAll("#chatTabs .nav-link").forEach(b => b.classList.toggle("active", b === btn));
  renderList();
});

$("#sendBtn").addEventListener("click", () => { sendMessage($("#msgInput").value); $("#msgInput").value = ""; $("#msgInput").focus(); });
$("#msgInput").addEventListener("keydown", e => { if (e.key === "Enter") $("#sendBtn").click(); });
$("#quickReplies").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (btn) sendMessage(btn.textContent);
});

/* ---------- Mulai ---------- */
renderList();
const wanted = Number(new URLSearchParams(location.search).get("seller"));
if (SELLERS.some(s => s.id === wanted)) openChat(wanted);

