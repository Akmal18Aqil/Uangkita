# FinanceKu
Aplikasi web pencatatan keuangan dan manajemen tugas pribadi dengan desain premium (Dark Glassmorphism).
Dibangun menggunakan Vanilla JS, CSS murni tanpa framework, dan Google Sheets sebagai database via Google Apps Script.

## Persiapan & Instalasi

### 1. Setup Google Sheets & Apps Script (Backend)
Aplikasi ini tidak memerlukan server database tradisional, melainkan menggunakan Google Sheets milik Anda sendiri.

1. Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet baru.
2. Namai spreadsheet tersebut, misalnya **FinanceKu DB**.
3. Di dalam Google Sheets, klik menu **Ekstensi > Apps Script**.
4. Akan terbuka tab baru. Di sebelah kiri, Anda akan melihat file `Code.gs`.
5. Salin isi dari folder `appscript/` di repositori ini ke Apps Script editor Anda:
   - Buat file `Code.gs` dan salin isinya.
   - Buat file script baru `Transaksi.gs` dan salin isinya.
   - Buat file script baru `Tasks.gs` dan salin isinya.
   - Buat file script baru `Helpers.gs` dan salin isinya.
6. Untuk file `appsscript.json`, di editor klik ikon Gear (Project Settings) > centang "Tampilkan file manifes 'appsscript.json' di editor". Lalu kembali ke editor, buka file `appsscript.json` dan timpa isinya.
7. Simpan semua file.

### 2. Deploy Apps Script
1. Di editor Apps Script, klik tombol **Terapkan (Deploy) > Deployment Baru**.
2. Pilih jenis "Aplikasi Web" (Web App).
3. Isi deskripsi (misal: "Versi 1.0").
4. Jalankan sebagai: **Saya**.
5. Siapa yang memiliki akses: **Siapa saja** (Anyone).
6. Klik Terapkan. Anda mungkin akan diminta mengotorisasi akses (ke Sheets dan Calendar). Lanjutkan dengan menyetujui izin keamanan.
7. Setelah berhasil, salin **URL Aplikasi Web**.

### 3. Hubungkan ke Web App
1. Jalankan aplikasi web ini secara lokal (misalnya menggunakan Live Server atau `npm run dev` jika menggunakan bundler lokal).
2. Buka menu **Pengaturan** di aplikasi.
3. Paste **URL Aplikasi Web** yang didapat dari langkah sebelumnya ke kolom **Web App URL**.
4. Klik **Simpan Pengaturan**. Aplikasi kini sudah terhubung ke backend Google Sheets Anda!

### 4. Deploy ke Vercel (Frontend)
Karena aplikasi ini 100% Vanilla JS SPA, sangat mudah dideploy ke Vercel:

1. Push seluruh repositori proyek ini ke GitHub Anda.
2. Buka [Vercel](https://vercel.com/) dan login/daftar.
3. Klik **Add New... > Project**.
4. Import repositori GitHub Anda.
5. Biarkan pengaturan default (Build command kosong). Vercel akan otomatis mengenali konfigurasi dari `vercel.json` yang sudah disediakan untuk routing SPA.
6. Klik **Deploy**.
7. Selesai! Web app Anda sudah online.

## Fitur
- **Dashboard**: Ringkasan saldo, pengeluaran bulan ini, dan tugas mendesak.
- **Transaksi**: Catat pemasukan dan pengeluaran. Mendukung filter dan pencarian.
- **Analitik**: Chart SVG kustom yang menampilkan tren mingguan dan proporsi pengeluaran per kategori.
- **Tugas (Kanban)**: Papan kanban interaktif terintegrasi langsung dengan Google Calendar untuk pengingat otomatis.
- **Pengaturan**: Kustomisasi profil dan penambahan kategori transaksi.

## Desain
Sistem desain dirancang menggunakan token CSS kustom di `css/index.css` dengan tema **Dark Glassmorphism**. Aplikasi sepenuhnya responsif (Mobile First).
