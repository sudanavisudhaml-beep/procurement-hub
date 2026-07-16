/* ============================================================
   Firebase config + kebijakan akses Astra Procurement Hub
   Catatan: apiKey web Firebase MEMANG publik — aman di-commit.
   Yang rahasia (service account) tidak pernah ditaruh di sini.
   ============================================================ */

export const firebaseConfig = {
  apiKey: "AIzaSyDRnp_vDN2OJ9PHTjgn6AyGZB5jEB7tURw",
  authDomain: "astra-procurement-hub.firebaseapp.com",
  projectId: "astra-procurement-hub",
  storageBucket: "astra-procurement-hub.firebasestorage.app",
  messagingSenderId: "376511730991",
  appId: "1:376511730991:web:c41c6be22d7811e6be3dda",
  measurementId: "G-5BJEEBXN6Y"
};

/* Admin utama: auto-approve + bisa meng-approve anggota lain.
   PENTING: harus SAMA dengan nilai di firestore.rules.
   Login ke Hub dengan akun ini untuk jadi admin. */
export const ADMIN_EMAIL = "sudanavisudhaml@gmail.com";

/* Domain yang di-auto-approve (paling andal via Google Sign-in,
   karena emailnya terverifikasi). Tambah domain BU di sini bila perlu.
   Harus SAMA dengan daftar di firestore.rules. */
export const AUTO_APPROVE_DOMAINS = ["astra.co.id"];

/* ====== DEMO MODE ======
   true  = lewati gerbang login, Hub langsung tampil (untuk demo).
   false = aktifkan lagi login + approval Firebase.
   Gerbangnya tidak dihapus — tinggal ubah ke false untuk menghidupkan. */
export const BYPASS_AUTH = true;
