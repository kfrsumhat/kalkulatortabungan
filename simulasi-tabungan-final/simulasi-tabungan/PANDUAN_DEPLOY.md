# Panduan Deploy, Keamanan & Perawatan

## 1. Upload ke GitHub
1. Ekstrak zip. Isi folder `simulasi-tabungan/` = isi repo (termasuk `.github/`, `public/`, `src/`).
2. Di komputer (Node 20+): `npm install` → `npm test` → `npm run build`. Pastikan tanpa error, lalu **commit `package-lock.json`** (mengunci versi → build konsisten bertahun-tahun).
3. `git init && git add . && git commit -m "init" && git branch -M main && git remote add origin <URL-REPO> && git push -u origin main`
   (atau drag-drop file lewat web GitHub; folder `.github` harus ikut).

## 2. Hosting publik (pilih satu)
**A. Cloudflare Pages / Netlify (disarankan, header keamanan penuh)**
Hubungkan repo → Build `npm run build`, Output `dist`. File `public/_headers` otomatis menerapkan CSP, HSTS, anti-clickjacking, dsb. HTTPS gratis otomatis.
**B. Vercel**: import repo, framework Vite. `vercel.json` menerapkan header yang sama.
**C. GitHub Pages**: Settings → Pages → Source = **GitHub Actions**. Workflow `.github/workflows/deploy.yml` menjalankan tes, build, dan deploy tiap push ke `main`. Aktifkan **Enforce HTTPS**. (GitHub Pages tidak bisa mengatur header; perlindungan CSP tetap aktif lewat `<meta>` hasil build.)

## 3. Mengubah data & gambar (rutin)
`npm run dev` → `http://localhost:5173/#admin` → ubah → **Unduh config.json** → ganti `public/config.json` → commit & push. Situs live otomatis ter-update.
Admin sengaja **mati di situs publik**. Bila benar-benar perlu, build dengan variabel `VITE_ENABLE_ADMIN=true` (hanya untuk pratinjau pribadi, jangan untuk situs nasabah).

## 4. Keamanan yang sudah diterapkan
- Situs statis: **tidak ada server/database, tidak ada data nasabah yang disimpan atau dikirim**. Perhitungan berjalan di browser; satu-satunya data keluar adalah tautan WhatsApp yang nasabah tekan sendiri. Ini menghilangkan sebagian besar risiko peretasan data.
- **HTTPS/TLS** (enkripsi di perjalanan) dari hosting + HSTS.
- **CSP ketat**: hanya skrip/gaya/gambar/font dari domain sendiri → memblokir XSS & skrip pihak ketiga. Font kini di-host sendiri (tanpa Google Fonts).
- Anti-clickjacking (`frame-ancestors 'none'`, `X-Frame-Options`), `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (kamera/mikrofon/lokasi dimatikan).
- Admin: nonaktif di produksi; kata sandi memakai PBKDF2 (210 ribu iterasi); hash **tidak** ikut `config.json` publik.
- Upload logo/sampul divalidasi (format, ukuran) & diperkecil; SVG dimuat hanya sebagai `<img>` (skrip tidak berjalan).
- CI menjalankan tes + `npm audit`; **Dependabot** membuka PR pembaruan dependensi tiap minggu.

**Yang perlu Anda lakukan di GitHub/akun hosting:** aktifkan 2FA (kunci utama keamanan, karena siapa pun yang bisa push = bisa mengubah situs), Branch protection untuk `main`, dan Secret scanning (Settings → Code security). Jangan pernah commit kata sandi/token.
Catatan jujur: tidak ada sistem yang 100% kebal; langkah di atas menutup risiko umum untuk situs statis.

## 5. Agar bebas error jangka panjang
- Merge PR Dependabot tiap bulan **setelah CI hijau** (tes perhitungan melindungi rumus bunga/pajak).
- Perbarui tarif: ubah `asOf` + angka produk, unduh config.json, push.
- Cek rutin: buka situs di HP & desktop, uji satu simulasi, tombol WhatsApp.
- Simpan cadangan: `config.json` lama ada di riwayat Git (bisa di-revert).
- Node: pakai versi LTS; jika build gagal setelah update, `git revert` commit terakhir.
