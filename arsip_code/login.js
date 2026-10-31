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
  // Jual Barang & Chat (modal) – batalkan pembukaan modal bila belum masuk
  ["sellModal", "chatModal"].forEach(id => {
    document.getElementById(id).addEventListener("show.bs.modal", e => {
      if (loggedIn) return;
      e.preventDefault();
      pendingNotice = id === "sellModal" ? "jual barang" : "chat dan nego";
      showLogin();
    });
  });

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
