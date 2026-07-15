# assets/

Letakkan dua file logo di sini (nama harus persis):

- `astra-logo.png` — wordmark Astra (dipakai di header & footer)
- `sigap-logo.png` — logo SIGAP (dipakai di kartu & detail vendor pengamanan)

Kalau file belum ada, situs tetap tampil rapi: logo otomatis diganti
wordmark teks (lihat `installLogoFallback()` di `app.js`).

Sumber logo: ekstrak dari file demo lama Anda (string `data:image/png;base64,...`),
atau gunakan file PNG asli. Ukuran ideal: tinggi ~64–128px, latar transparan.
