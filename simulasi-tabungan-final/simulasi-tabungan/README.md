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

## Deploy & keamanan
Lihat **PANDUAN_DEPLOY.md** (langkah upload ke GitHub, hosting, HTTPS, header keamanan, perawatan jangka panjang).

## Mengubah data lewat Admin
Panel admin **nonaktif di situs publik** (aman). Aktif saat `npm run dev` atau build dengan `VITE_ENABLE_ADMIN=true`.
1. Jalankan `npm run dev`, buka `http://localhost:5173/#admin`, buat kata sandi (hanya tersimpan di browser Anda).
2. Ubah bunga, produk, teks, warna, **logo & sampul (upload gambar)**, dst. Draft tersimpan otomatis di browser.
3. Tab **Ekspor & Riwayat** → **Unduh config.json** → ganti `public/config.json` → commit & push. (Hash kata sandi tidak ikut terekspor.)

## Struktur
`src/lib/calc.ts` fungsi murni (hit, daysOf, computeProduct, simulate) · `src/lib/wa.ts` link WhatsApp · `src/hooks/useConfig.tsx` config + draft + riwayat · `src/components/*` UI · `src/components/admin/*` panel admin · `public/config.json` data default (skema berversi `schemaVersion`).

## Animasi
GSAP+ScrollTrigger hanya untuk judul per kata dan count-up angka; Motion untuk card, hover/tap, transisi tab, drawer admin, donut; Lenis untuk smooth scroll (disinkronkan ke GSAP ticker, berhenti saat admin terbuka). `prefers-reduced-motion` mematikan Lenis dan animasi.

## Asumsi
- Perhitungan memakai bunga sederhana per hari ÷ 365 dan pajak atas bunga, **identik** dengan HTML asli (diuji pada 240 kombinasi produk × nominal × tenor, 0 selisih).
- Skema config diperluas dari HTML: `p{}` menjadi `products[]` agar produk bisa ditambah/diduplikat/diurutkan. Isi lama dipetakan 1:1.
- Grafik menampilkan bunga kotor vs bersih terhadap waktu (linear karena bunga sederhana); donut menampilkan komposisi bersih vs pajak.
- Hasil tampil langsung (live) seperti HTML asli; tombol "Hitung simulasi" menandai interaksi dan menggulir ke hasil.
- Font IBM Plex Sans (formal, angka tabular) di-host sendiri lewat `@fontsource` — tanpa permintaan ke Google Fonts.
