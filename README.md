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
> Langkah di bawah untuk deployment **pertama kali**. Untuk memperbarui kode yang sudah ter-deploy, lihat bagian [Memperbarui Apps Script](#memperbarui-apps-script-wajib-dibaca-saat-mengubah-kode-gs).

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

### 5. Pengaturan Awal (penting)
Setelah terhubung, buka **Pengaturan** dan isi:

1. **Saldo Awal tiap Dompet** — saldo yang sudah ada di Tunai/Dana/dll sebelum mulai mencatat. Tanpa ini saldo di Dashboard akan terbaca minus.
2. **Budget Bulanan** — batas pengeluaran; dipakai untuk progres budget & peringatan dini.
3. **Target Tabungan** — dihitung dari transaksi berkategori `Tabungan` dan `Investasi`.

## Fitur
- **Dashboard**: Saldo total lintas dompet (termasuk saldo awal), pemasukan/pengeluaran per periode (bulan/minggu/rentang kustom), grafik pemasukan vs pengeluaran 6 bulan, progres budget dengan angka "aman per hari", dan transaksi terbaru.
- **Transaksi**: CRUD penuh dengan filter bulan, tipe, kategori, dan pencarian. Ada ringkasan masuk/keluar/selisih serta **ekspor CSV**.
- **Analitik**: Navigasi antar bulan, perbandingan bulan-ke-bulan, rasio menabung, rata-rata harian, proyeksi akhir bulan, tren mingguan pemasukan vs pengeluaran, dan rincian per kategori.
- **Tugas (Kanban)**: Papan Todo/In Progress/Done dengan penanda **Terlambat**, terintegrasi Google Calendar (pengingat H-2 hari, H-24, H-12, H-5 jam) dan impor agenda kalender.
- **Notifikasi**: Lonceng di header menampilkan tugas terlambat/jatuh tempo, peringatan budget, dan perubahan yang belum tersinkron.
- **Pengaturan**: Profil, budget, target, manajemen dompet & kategori, tes koneksi API, dan pembersihan cache.

### Memperbarui Apps Script (WAJIB dibaca saat mengubah kode `.gs`)
> [!IMPORTANT]
> **Menyimpan kode di editor Apps Script TIDAK mengubah web app yang aktif.**
> Deployment terkunci pada snapshot versi. Selama versinya belum dinaikkan,
> URL Anda tetap menjalankan kode lama walaupun editornya sudah berisi kode baru.

Cara yang benar untuk **memperbarui** (URL tidak berubah):

1. Tempel kode `.gs` terbaru, lalu **Simpan**.
2. **Terapkan (Deploy) → Kelola deployment**.
3. Klik ikon **pensil (Edit)** pada deployment yang aktif.
4. **Versi → Versi baru** → **Terapkan**.

Jangan pakai "Deployment Baru" untuk update — itu membuat **URL baru**, dan aplikasi Anda masih menunjuk ke URL lama.

**Cara memastikan sudah benar:** buka **Pengaturan → Tes Koneksi**. Kalau masih versi lama, aplikasi akan bilang begitu secara eksplisit (juga muncul di lonceng notifikasi).

## Memperbaiki Data Lama (sekali jalan)
Backend versi pertama hanya menulis 7 kolom sehingga kolom **Dompet** tidak pernah terisi dan **Dibuat Pada** mendarat di kolom Dompet. Setelah deploy ulang Apps Script:

1. Buka editor Apps Script.
2. Pilih fungsi **`repairDompetColumn`** pada dropdown, lalu klik **Run**.
3. Timestamp yang nyasar dipindahkan ke kolom yang benar.

Nilai Dompet baris-baris lama memang tidak pernah tersimpan, jadi tidak bisa dipulihkan. Baris tersebut muncul sebagai **"Belum diisi"** di aplikasi — bukan diam-diam dihitung sebagai Tunai — dan bisa dilengkapi dengan mengetuk transaksinya lalu memilih sumber dana.

## Cara Kerja Offline
Perubahan yang gagal dikirim (HP offline, Apps Script timeout, kuota habis) **tidak hilang** — disimpan di antrean lokal dan dikirim ulang otomatis saat koneksi kembali. ID transaksi dibuat di sisi klien, jadi pengiriman ulang tidak pernah menghasilkan baris ganda di Sheet. Jumlah antrean yang tertunda terlihat di halaman Pengaturan.

## Pemeriksaan
```bash
node test.mjs
```
Menguji normalisasi transaksi (tanggal, nominal, dompet), escaping HTML, dan kejujuran persentase pada grafik.

## Desain
Sistem desain memakai token CSS kustom di `css/index.css`, mendukung tema **terang & gelap**. Aplikasi mobile-first dan bisa dipasang sebagai PWA.

## Catatan Skala
`getTransactions` mengembalikan seluruh baris sheet dalam satu panggilan. Untuk pemakaian pribadi (ribuan baris) ini cukup; kalau sudah puluhan ribu baris, tambahkan parameter filter bulan/tahun di `Transaksi.gs`.
