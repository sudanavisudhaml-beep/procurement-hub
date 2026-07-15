# Astra Procurement Hub

Platform pertukaran informasi vendor antar **Business Unit** di lingkungan Astra.
Setiap BU dapat **menelusuri** dan **membagikan** referensi vendor yang pernah
mereka gunakan — memperkaya pilihan satu sama lain. Keputusan pengadaan tetap
sepenuhnya di tangan masing-masing BU (referensi, **bukan** penetapan standar).

> **Sifat platform:** referensi & pertukaran informasi. Pencantuman vendor
> bukan rekomendasi, sertifikasi, atau jaminan dari Astra. Berlaku prinsip
> **DYOR (Do Your Own Research)** — tiap BU wajib uji tuntas sendiri.

## Struktur proyek

```
Procurement-Hub/
├─ index.html      # markup semua halaman (Beranda / Pengamanan / Travel)
├─ styles.css      # seluruh tampilan (tema Astra biru)
├─ data.js         # data konten: segmen pengamanan + vendor travel
├─ app.js          # router, render, fallback logo
├─ assets/         # astra-logo.png, sigap-logo.png (lihat assets/README.md)
└─ README.md
```

Situs ini **statis** (HTML/CSS/JS murni) — tidak butuh build step.

## Menjalankan secara lokal

Cukup buka `index.html` di browser. Atau jalankan server statis kecil:

```bash
# Python
python -m http.server 5500
# atau Node
npx serve .
```

Lalu buka `http://localhost:5500`.

## Roadmap

- [x] Situs referensi statis (Pengamanan + Travel)
- [ ] Gerbang login + sign-up lintas-BU (Firebase Authentication)
- [ ] Alur approval `pending → approved` sebelum konten tampil
- [ ] Form "Bagikan Referensi" (kontribusi vendor oleh BU)
- [ ] Deploy (GitHub Pages / Netlify / Azure Static Web Apps)

## Catatan keamanan data

Data vendor bersifat internal Astra. Saat autentikasi aktif, **konten hanya
tampil untuk user berstatus `approved`**, dan akses data dikunci lewat
Firebase Security Rules (bukan sekadar disembunyikan di HTML).

---
© PT Astra International Tbk · Internal Procurement Hub
