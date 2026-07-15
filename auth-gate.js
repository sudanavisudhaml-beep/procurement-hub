/* ============================================================
   Astra Procurement Hub — Auth Gate
   Login / Sign-up / Pending + panel approval admin.
   Firebase v12 modular SDK (ESM dari gstatic).
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, initializeFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL, AUTO_APPROVE_DOMAINS } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Force long-polling: jaringan korporat/proxy (Astra) sering memblokir
// koneksi WebChannel default Firestore -> "client is offline".
let db;
try {
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch (e) {
  db = getFirestore(app);
}
setPersistence(auth, browserLocalPersistence).catch(() => {});

const $ = (id) => document.getElementById(id);
let pendingSignup = null; // {name, bu} dititipkan dari form daftar

/* ---------------- helpers ---------------- */
function initials(s) {
  const t = (s || "").trim();
  if (!t) return "?";
  const p = t.split(/[\s@.]+/).filter(Boolean);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() || t[0].toUpperCase();
}
function showAuthView(which) { // 'loading' | 'form' | 'pending'
  ["auth-loading", "auth-form", "auth-pending"].forEach(id => {
    const el = $(id); if (el) el.hidden = (id !== "auth-" + which);
  });
}
function authError(msg) {
  const e = $("auth-error");
  if (!e) return;
  e.hidden = !msg;
  e.textContent = msg || "";
}
function friendly(err) {
  const c = (err && err.code) || "";
  const map = {
    "auth/invalid-credential": "Email atau kata sandi salah.",
    "auth/invalid-email": "Format email tidak valid.",
    "auth/user-not-found": "Akun tidak ditemukan.",
    "auth/wrong-password": "Kata sandi salah.",
    "auth/email-already-in-use": "Email sudah terdaftar. Silakan Masuk.",
    "auth/weak-password": "Kata sandi minimal 6 karakter.",
    "auth/popup-closed-by-user": "Jendela Google ditutup sebelum selesai.",
    "auth/popup-blocked": "Popup diblokir browser. Izinkan popup lalu coba lagi.",
    "auth/network-request-failed": "Gangguan jaringan. Coba lagi.",
    "permission-denied": "Akses ditolak oleh aturan database. Pastikan firestore.rules sudah dipasang."
  };
  return map[c] || (err && err.message) || "Terjadi kesalahan. Coba lagi.";
}

/* ---------------- member doc ---------------- */
function computeInitial(user) {
  const email = (user.email || "").toLowerCase();
  const domain = email.split("@")[1] || "";
  if (email === ADMIN_EMAIL.toLowerCase()) return { role: "admin", status: "approved" };
  if (user.emailVerified && AUTO_APPROVE_DOMAINS.includes(domain)) return { role: "member", status: "approved" };
  return { role: "member", status: "pending" };
}
async function ensureMemberDoc(user) {
  const ref = doc(db, "members", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const init = computeInitial(user);
  const data = {
    email: user.email,
    name: (pendingSignup && pendingSignup.name) || user.displayName || (user.email || "").split("@")[0],
    bu: (pendingSignup && pendingSignup.bu) || "",
    role: init.role,
    status: init.status,
    createdAt: serverTimestamp()
  };
  pendingSignup = null;
  await setDoc(ref, data);
  return data;
}

/* ---------------- gate ---------------- */
function lock() { document.body.classList.add("auth-locked"); }
function unlock(user, data) {
  document.body.classList.remove("auth-locked");
  injectTopbar(user, data);
}
function showPending(user, data) {
  const rejected = data && data.status === "rejected";
  const email = $("pending-email"); if (email) email.textContent = user.email || "";
  const t = $("pending-title"), m = $("pending-msg");
  if (t) t.textContent = rejected ? "Pendaftaran belum disetujui" : "Menunggu persetujuan";
  if (m) m.innerHTML = rejected
    ? "Akun <b>" + (user.email || "") + "</b> belum disetujui untuk mengakses Hub. Hubungi admin GA bila ini keliru."
    : "Akun <b>" + (user.email || "") + "</b> sudah terdaftar dan sedang menunggu persetujuan admin. Anda akan bisa masuk setelah disetujui.";
  showAuthView("pending");
  lock();
}

/* ---------------- topbar (setelah masuk) ---------------- */
function injectTopbar(user, data) {
  const nav = document.querySelector(".topnav");
  if (!nav) return;
  let slot = $("auth-slot");
  if (!slot) { slot = document.createElement("div"); slot.id = "auth-slot"; slot.className = "auth-slot"; nav.appendChild(slot); }
  const isAdmin = data.role === "admin";
  slot.innerHTML =
    (isAdmin ? '<button class="admin-btn" id="admin-open"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/></svg>Admin <span class="pcount" id="pcount" hidden>0</span></button>' : "") +
    '<span class="user-chip"><span class="ua">' + initials(data.name || user.email) + '</span><span class="ue">' + (user.email || "") + '</span></span>' +
    '<button class="logout-btn" id="logout-btn">Keluar</button>';
  $("logout-btn").addEventListener("click", () => signOut(auth));
  if (isAdmin) {
    $("admin-open").addEventListener("click", openAdmin);
    refreshPendingCount();
  }
}

/* ---------------- admin approval ---------------- */
async function fetchPending() {
  const q = query(collection(db, "members"), where("status", "==", "pending"));
  const snap = await getDocs(q);
  const rows = [];
  snap.forEach(d => rows.push({ uid: d.id, ...d.data() }));
  return rows;
}
async function refreshPendingCount() {
  try {
    const rows = await fetchPending();
    const b = $("pcount");
    if (b) { b.hidden = rows.length === 0; b.textContent = String(rows.length); }
  } catch (e) { /* diam */ }
}
async function openAdmin() {
  const panel = $("admin-panel"); if (!panel) return;
  panel.classList.add("open");
  const list = $("admin-list");
  list.innerHTML = '<div class="admin-empty">Memuat…</div>';
  try {
    const rows = await fetchPending();
    if (!rows.length) { list.innerHTML = '<div class="admin-empty">Tidak ada permintaan menunggu. 🎉</div>'; return; }
    list.innerHTML = rows.map(r =>
      '<div class="mrow" data-uid="' + r.uid + '">' +
        '<span class="mav">' + initials(r.name || r.email) + '</span>' +
        '<div class="minfo"><div class="mn">' + (r.name || "(tanpa nama)") + '</div>' +
          '<div class="me">' + (r.email || "") + '</div>' +
          (r.bu ? '<span class="mbu">' + r.bu + '</span>' : '') + '</div>' +
        '<div class="macts"><button class="mbtn ok" data-act="approve">Setujui</button>' +
        '<button class="mbtn no" data-act="reject">Tolak</button></div>' +
      '</div>'
    ).join("");
  } catch (e) {
    list.innerHTML = '<div class="admin-empty">Gagal memuat: ' + friendly(e) + '</div>';
  }
}
async function setStatus(uid, status) {
  await updateDoc(doc(db, "members", uid), { status, decidedAt: serverTimestamp() });
}
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".mbtn"); if (!btn) return;
  const row = btn.closest(".mrow"); const uid = row?.dataset.uid; if (!uid) return;
  const act = btn.dataset.act;
  btn.disabled = true;
  try {
    await setStatus(uid, act === "approve" ? "approved" : "rejected");
    row.remove();
    const list = $("admin-list");
    if (list && !list.querySelector(".mrow")) list.innerHTML = '<div class="admin-empty">Tidak ada permintaan menunggu. 🎉</div>';
    refreshPendingCount();
  } catch (err) { alert(friendly(err)); btn.disabled = false; }
});

/* ---------------- form wiring ---------------- */
function wireForms() {
  document.querySelectorAll(".auth-tab").forEach(t => t.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    authError("");
    const login = t.dataset.tab === "login";
    $("form-login").hidden = !login;
    $("form-signup").hidden = login;
  }));

  $("form-login").addEventListener("submit", async (e) => {
    e.preventDefault(); authError("");
    const btn = e.submitter; if (btn) btn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, $("login-email").value.trim(), $("login-password").value);
    } catch (err) { authError(friendly(err)); }
    if (btn) btn.disabled = false;
  });

  $("form-signup").addEventListener("submit", async (e) => {
    e.preventDefault(); authError("");
    const btn = e.submitter; if (btn) btn.disabled = true;
    pendingSignup = { name: $("su-name").value.trim(), bu: $("su-bu").value.trim() };
    try {
      const cred = await createUserWithEmailAndPassword(auth, $("su-email").value.trim(), $("su-password").value);
      sendEmailVerification(cred.user).catch(() => {});
      // onAuthStateChanged akan lanjutkan (buat member doc + routing)
    } catch (err) { pendingSignup = null; authError(friendly(err)); if (btn) btn.disabled = false; }
  });

  $("btn-google").addEventListener("click", async () => {
    authError("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err) { authError(friendly(err)); }
  });

  const closeAdmin = () => $("admin-panel").classList.remove("open");
  $("admin-close")?.addEventListener("click", closeAdmin);
  $("admin-panel")?.addEventListener("click", (e) => { if (e.target.id === "admin-panel") closeAdmin(); });
  $("btn-signout-pending")?.addEventListener("click", () => signOut(auth));
}

/* ---------------- boot ---------------- */
function boot() {
  wireForms();
  showAuthView("loading");
  onAuthStateChanged(auth, async (user) => {
    if (!user) { authError(""); showAuthView("form"); lock(); return; }
    showAuthView("loading");
    try {
      const data = await ensureMemberDoc(user);
      if (data.role === "admin" || data.status === "approved") unlock(user, data);
      else showPending(user, data);
    } catch (err) {
      authError(friendly(err));
      showAuthView("form");
      lock();
    }
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
