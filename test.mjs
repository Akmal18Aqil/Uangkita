// Pemeriksaan mandiri: `node test.mjs`
// Menyasar dua tempat yang paling berbahaya kalau diam-diam rusak:
// 1. normalizeTransaction — gerbang yang dilewati SETIAP nominal & tanggal.
// 2. persentase grafik — pernah diisi angka karangan (Math.random / +14%).
import assert from 'node:assert/strict';
import { normalizeTransaction, esc, todayISO } from './js/utils.js';
import { createReferenceBarChart } from './js/components/chart.js';

// --- normalizeTransaction -------------------------------------------------
const iso = todayISO();

// Tanggal ISO dengan waktu tidak boleh bergeser hari saat dinormalkan.
assert.equal(normalizeTransaction({ Tanggal: '2026-08-17T09:30:00' }).Tanggal, '2026-08-17');
assert.equal(normalizeTransaction({ Tanggal: '2026-08-17' }).Tanggal, '2026-08-17');
assert.equal(normalizeTransaction({ tanggal: '2026-08-17' }).Tanggal, '2026-08-17', 'alias huruf kecil harus dikenali');
assert.equal(normalizeTransaction({}).Tanggal, iso, 'tanggal kosong jatuh ke hari ini (waktu lokal, bukan UTC)');

// Nominal selalu positif; arah uang ditentukan oleh Tipe, bukan tanda minus.
assert.equal(normalizeTransaction({ Jumlah: -50000 }).Jumlah, 50000);
assert.equal(normalizeTransaction({ Jumlah: '75000' }).Jumlah, 75000);
assert.equal(normalizeTransaction({ Jumlah: 'abc' }).Jumlah, 0);

// Kolom G di Sheet pernah keisi timestamp, bukan nama dompet.
assert.equal(normalizeTransaction({ Dompet: '2026-07-25T02:49:28.964Z' }).Dompet, 'Tunai');
assert.equal(normalizeTransaction({ Dompet: '  Dana  ' }).Dompet, 'Dana');
assert.equal(normalizeTransaction({}).Dompet, 'Tunai');

assert.equal(normalizeTransaction(null), null);
assert.equal(normalizeTransaction({}).Tipe, 'Pengeluaran', 'default aman: dianggap pengeluaran');

// --- esc ------------------------------------------------------------------
// Judul & deskripsi bisa berasal dari undangan Google Calendar orang lain.
assert.equal(esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
assert.equal(esc(`O'Brien & "co"`), 'O&#39;Brien &amp; &quot;co&quot;');
assert.equal(esc(null), '');

// --- persentase grafik ----------------------------------------------------
const chart = createReferenceBarChart([
    { label: 'Jun', income: 0, expense: 0 },
    { label: 'Jul', income: 1000000, expense: 400000 },
    { label: 'Ags', income: 1500000, expense: 600000 },
    { label: 'Sep', income: 0, expense: 0 }
]);

// Diambil dari isi div persentase saja — atribut style juga memuat "%".
const pctLabels = [...chart.matchAll(/class="chart-col-pct"[^>]*>([^<]*)</g)].map(m => m[1]);

assert.deepEqual(pctLabels, ['', 'baru', '+50%', ''],
    'Jun kosong: tanpa pembanding. Jul: "baru". Ags: +50% nyata. Sep belum terjadi: kosong, bukan -100%.');

// Nilai nol tidak boleh menghasilkan pembagian nol / NaN di output.
assert.equal(chart.includes('NaN'), false);
assert.equal(chart.includes('Infinity'), false);

const empty = createReferenceBarChart([{ label: 'Jan', income: 0, expense: 0 }]);
assert.equal(empty.includes('NaN'), false, 'chart tanpa data sama sekali tetap aman');

console.log('OK — semua pemeriksaan lolos');
