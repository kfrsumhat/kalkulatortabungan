# Simulasi Tabungan – KF RSU MHAT (Bank Jambi)

Kalkulator penempatan dana (Deposito, Deposito Syariah, Double Untung, SILAH) berbasis **Vite + React + TypeScript + Tailwind**.
Statis penuh: tanpa backend, tanpa Supabase/Firebase, tanpa analytics. Logika perhitungan, data produk, dan seluruh teks berasal dari `PERHITUNGAN_DPK.html`.

## Menjalankan
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit test perhitungan (Vitest)
npm run build      # hasil di dist/
npm run preview
```

## Deploy (semua hosting statis)
- **Netlify**: Build command `npm run build`, Publish directory `dist`.
- **Vercel**: Framework "Vite" (otomatis). Output `dist`.
- **Cloudflare Pages**: Build `npm run build`, output `dist`.
- **GitHub Pages**: unggah isi `dist/` (aset memakai `base: "./"`, jadi aman di subpath).

## Mengubah data lewat Admin
1. Buka footer → **⚙ Admin** (atau tambahkan `#admin` pada URL). Kunjungan pertama meminta Anda **membuat kata sandi** (tidak ada PIN bawaan).
2. Ubah bunga, pajak, produk, teks, S&K, template WhatsApp, warna, logo, dst. Perubahan langsung tampil sebagai **pratinjau** (disimpan sebagai draft di `localStorage` browser Anda).
3. Tab **Ekspor & Riwayat** → **Unduh config.json** → ganti `public/config.json` di repo → deploy ulang.
4. Tersedia: Import config.json, Reset ke default, Buang draft, dan riwayat 10 versi (Restore).

> **Keamanan:** gerbang admin hanya di sisi klien (hash SHA-256 + salt, 5 percobaan lalu kunci 60 dtk). Hash ikut berada di `config.json` yang publik. Ini bukan keamanan sungguhan; yang menentukan versi live adalah file di repo.

## Struktur
`src/lib/calc.ts` fungsi murni (hit, daysOf, computeProduct, simulate) · `src/lib/wa.ts` link WhatsApp · `src/hooks/useConfig.tsx` config + draft + riwayat · `src/components/*` UI · `src/components/admin/*` panel admin · `public/config.json` data default (skema berversi `schemaVersion`).

## Animasi
GSAP+ScrollTrigger hanya untuk judul per kata dan count-up angka; Motion untuk card, hover/tap, transisi tab, drawer admin, donut; Lenis untuk smooth scroll (disinkronkan ke GSAP ticker, berhenti saat admin terbuka). `prefers-reduced-motion` mematikan Lenis dan animasi.

## Asumsi
- Perhitungan memakai bunga sederhana per hari ÷ 365 dan pajak atas bunga, **identik** dengan HTML asli (diuji pada 240 kombinasi produk × nominal × tenor, 0 selisih).
- Skema config diperluas dari HTML: `p{}` menjadi `products[]` agar produk bisa ditambah/diduplikat/diurutkan. Isi lama dipetakan 1:1.
- Grafik menampilkan bunga kotor vs bersih terhadap waktu (linear karena bunga sederhana); donut menampilkan komposisi bersih vs pajak.
- Hasil tampil langsung (live) seperti HTML asli; tombol "Hitung simulasi" menandai interaksi dan menggulir ke hasil.
- Font Fraunces & Plus Jakarta Sans dimuat dari Google Fonts, dengan fallback system font.
