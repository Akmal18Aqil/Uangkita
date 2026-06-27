# FinanceKu — Development Task Checklist

> **Workflow**: Loop setiap phase → build → verify → next phase  
> **Target**: 100% fungsional, siap deploy ke Vercel

---

## Phase 1: Foundation 🏗️

### 1.1 Project Setup
- [x] Buat folder structure (`css/`, `js/`, `js/components/`, `js/pages/`, `assets/`, `appscript/`)
- [x] Buat `index.html` (SPA shell, meta tags, font imports)
- [x] Buat `vercel.json` (SPA rewrite rules)

### 1.2 Design System (`css/index.css`)
- [x] CSS Reset + Box sizing
- [x] CSS Custom Properties (semua tokens: colors, spacing, typography, shadows)
- [x] Google Fonts import (Inter, Outfit, JetBrains Mono)
- [x] Base typography styles
- [x] Utility classes (flex, grid, spacing, text)

### 1.3 Component Styles (`css/components.css`)
- [x] Glass card component
- [x] Bottom navigation bar
- [x] Sidebar (desktop)
- [x] Floating Action Button (FAB)
- [x] Bottom sheet / modal
- [x] Form inputs (text, number, select, date, toggle)
- [x] Quick amount chips
- [x] Category grid selector
- [x] Transaction item row
- [x] Task card (kanban)
- [x] Toast notification
- [x] Loading skeleton
- [x] Empty state

### 1.4 Animations (`css/animations.css`)
- [x] Fade-in / fade-up
- [x] Slide-up (bottom sheet)
- [x] Scale press (button)
- [x] Shimmer (skeleton)
- [x] Count-up (numbers)
- [x] Pulse (urgent deadline)
- [x] Page transition
- [x] Card stagger appear

### 1.5 Core JS Modules
- [x] `js/utils.js` — UUID generator, Rupiah formatter, date formatter, debounce
- [x] `js/store.js` — Simple state management (localStorage cache + in-memory)
- [x] `js/router.js` — Hash-based SPA router
- [x] `js/api.js` — Apps Script API client (fetch wrapper, error handling, caching)
- [x] `js/app.js` — App init, router setup, global event listeners

### 1.6 Base Components JS
- [x] `js/components/navbar.js` — Bottom nav + sidebar render
- [x] `js/components/modal.js` — Bottom sheet + dialog
- [x] `js/components/toast.js` — Toast notifications
- [x] `js/components/skeleton.js` — Loading skeletons
- [x] `js/components/fab.js` — FAB with menu

### 1.7 Apps Script Backend
- [x] `appscript/Code.gs` — doGet/doPost router, CORS headers
- [x] `appscript/Transaksi.gs` — getTransaksi, addTransaksi, updateTransaksi, deleteTransaksi
- [x] `appscript/Helpers.gs` — UUID, timestamp, sheet helpers, response builder
- [x] `appscript/appsscript.json` — Manifest with Calendar scope

### ✅ Phase 1 Checkpoint
- [x] SPA shell loads with navigation working
- [x] Routes switch between empty pages
- [x] Design system visually verified
- [x] Apps Script deployed and responding to test requests

---

## Phase 2: Core Finance 💰

### 2.1 Dashboard Page (`js/pages/dashboard.js`)
- [x] Greeting card (nama + tanggal + waktu)
- [x] Balance card (saldo bulan ini, animated count-up)
- [x] Quick stats row (total pemasukan, pengeluaran, jumlah transaksi)
- [x] Recent transactions list (5 terbaru)
- [x] Upcoming tasks preview (5 deadline terdekat)
- [x] Semua data dari API dengan loading skeleton

### 2.2 Transaction List Page (`js/pages/transactions.js`)
- [x] Header dengan filter bulan/tahun selector
- [x] Filter chips (Semua / Pemasukan / Pengeluaran)
- [x] Search bar (by catatan)
- [x] Transaction list grouped by tanggal
- [x] Daily subtotal per group
- [x] Pull-to-refresh gesture (mobile)
- [x] Empty state jika tidak ada data

### 2.3 Add/Edit Transaction
- [x] Bottom sheet form
- [x] Tipe toggle (Pengeluaran / Pemasukan) — warna berubah
- [x] Jumlah input dengan format Rupiah live
- [x] Quick amount buttons (5K, 10K, 15K, 20K, 25K, 50K, 100K)
- [x] Category grid selector dengan ikon emoji
- [x] Date picker (default hari ini)
- [x] Catatan text input
- [x] Submit → API call → update list → toast sukses
- [x] Edit mode: pre-fill data, update API
- [x] Validasi: jumlah required > 0, kategori required

### 2.4 Delete Transaction
- [x] Confirmation dialog
- [x] API call → remove from list → toast
- [x] Swipe-to-delete gesture (mobile, opsional)

### 2.5 Category System
- [x] Default categories (hardcoded awal)
- [x] Category icons (emoji-based)
- [x] Category colors
- [x] Filter by category di transaction list

### ✅ Phase 2 Checkpoint
- [x] Dashboard menampilkan data real dari Google Sheets
- [x] Bisa tambah transaksi baru → muncul di Sheet & di list
- [x] Bisa edit & delete transaksi
- [x] Filter & search berfungsi
- [x] Semua angka format Rupiah benar

---

## Phase 3: Analytics 📊

### 3.1 Chart Components (`js/components/chart.js`)
- [x] Donut/Pie chart (SVG-based, custom)
- [x] Bar chart (SVG-based, custom)
- [x] Animated draw-in effect
- [x] Tooltip on hover/tap
- [x] Legend component
- [x] Responsive sizing

### 3.2 Analytics Page (`js/pages/analytics.js`)
- [x] Monthly overview bar chart (pemasukan vs pengeluaran)
- [x] Category breakdown donut chart
- [x] Category list dengan persentase & progress bar
- [x] Top 5 kategori pengeluaran
- [x] Daily average spending
- [x] Perbandingan bulan ini vs bulan lalu (% change)
- [x] Month/year selector

### 3.3 Dashboard Charts
- [x] Mini spending trend (7 hari) di dashboard
- [x] Top kategori progress bars di dashboard

### ✅ Phase 3 Checkpoint
- [x] Semua chart render dengan benar dari data real
- [x] Animasi chart smooth
- [x] Angka-angka akurat (cross-check dengan Sheet)
- [x] Responsive di mobile & desktop

---

## Phase 4: Tasks + Calendar ✅📅

### 4.1 Apps Script: Task Backend
- [x] `appscript/Tasks.gs` — getTasks, addTask, updateTask, deleteTask
- [x] Google Calendar: createEvent saat task punya deadline
- [x] Google Calendar: updateEvent saat deadline diubah
- [x] Google Calendar: deleteEvent saat task dihapus/selesai
- [x] Reminder settings: 1 hari + 30 menit sebelum

### 4.2 Task Board Page (`js/pages/tasks.js`)
- [x] Kanban view: 3 kolom (Todo / In Progress / Done)
- [x] Drag & drop antar kolom (update status via API)
- [x] Task cards dengan priority badge, deadline countdown
- [x] Toggle: Board view ↔ List view
- [x] List view dengan checkboxes
- [x] Filter: status, prioritas, kategori
- [x] Sort: deadline, prioritas

### 4.3 Add/Edit Task
- [x] Bottom sheet form
- [x] Judul input (required)
- [x] Deskripsi textarea
- [x] Priority selector (High/Medium/Low) dengan warna
- [x] Deadline datetime picker
- [x] Kategori selector (Bills/Work/Personal)
- [x] Jumlah terkait (opsional, link ke keuangan)
- [x] Calendar sync toggle
- [x] Submit → API → Calendar sync → toast

### 4.4 Task Interactions
- [x] Tap checkbox → toggle done
- [x] Deadline countdown (warna dinamis: merah < 1 hari, orange < 3 hari)
- [x] Pulse animation untuk urgent tasks
- [x] Delete task dengan konfirmasi

### ✅ Phase 4 Checkpoint
- [x] Task CRUD berfungsi penuh
- [x] Kanban drag & drop works
- [x] Google Calendar event terbuat saat set deadline
- [x] Calendar event terupdate/terhapus sesuai perubahan task
- [x] Reminder muncul di Google Calendar

---

## Phase 5: Polish & Deploy 🎨🚀

### 5.1 Settings Page (`js/pages/settings.js`)
- [x] Nama user setting (untuk greeting)
- [x] Apps Script URL configuration
- [x] Theme toggle (Dark/Light)
- [x] Budget bulanan setting
- [x] Kategori manager (list, tambah custom)
- [x] About / version info

### 5.2 UX Polish
- [x] Semua loading states (skeleton screens)
- [x] Error handling (network error, API error) → user-friendly toast
- [x] Empty states dengan ilustrasi/pesan
- [x] Haptic-like feedback (visual press states)
- [x] Smooth page transitions
- [x] Card stagger animations
- [x] Count-up number animations di dashboard
- [x] Konfirmasi sebelum delete (dialog)

### 5.3 Responsive Final Check
- [x] Mobile 320px — semua komponen fit
- [x] Mobile 375px — normal phone
- [x] Tablet 768px — sidebar muncul
- [x] Desktop 1024px+ — full layout
- [x] Desktop 1280px+ — dashboard grid optimal

### 5.4 Performance
- [x] LocalStorage caching untuk data terakhir
- [x] Lazy load pages (import dinamis)
- [x] Optimize CSS (remove unused)
- [x] Image optimization (jika ada)

### 5.5 Deploy
- [x] `vercel.json` configured
- [x] Test local build
- [x] Push ke GitHub
- [x] Setup instruksi: cara deploy ke Vercel
- [x] Setup instruksi: cara setup Apps Script

### 5.6 Documentation
- [x] README.md — cara setup & deploy
- [x] Panduan setup Google Sheet (buat sheet + kolom)
- [x] Panduan deploy Apps Script
- [x] Panduan connect Vercel

### ✅ Phase 5 Final Checkpoint
- [x] Semua fitur berfungsi end-to-end
- [x] UI responsive & smooth di semua ukuran layar
- [x] Tidak ada error di console
- [x] Data konsisten antara web app ↔ Google Sheets
- [x] Siap deploy ke Vercel

---

## 🏁 DEFINITION OF DONE

Aplikasi dianggap **100% selesai** jika:

1. ✅ Dashboard menampilkan data keuangan real-time dari Google Sheets
2. ✅ CRUD Transaksi (tambah, edit, hapus) berfungsi penuh
3. ✅ Analytics/chart menampilkan breakdown & trend yang akurat
4. ✅ Task management dengan kanban board berfungsi
5. ✅ Google Calendar terintegrasi (event terbuat saat ada deadline)
6. ✅ Settings bisa dikonfigurasi
7. ✅ UI premium dark glassmorphism, responsive, dengan animasi smooth
8. ✅ Error handling & loading states lengkap
9. ✅ Siap deploy ke Vercel via GitHub
10. ✅ Dokumentasi setup lengkap
