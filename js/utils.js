// js/utils.js

// Semua render halaman memakai innerHTML dan sebagian datanya berasal dari luar
// (judul & deskripsi undangan Google Calendar orang lain, catatan di Sheet yang
// bisa diedit siapa pun yang punya akses). Itu batas kepercayaan, jadi teksnya
// harus di-escape sebelum ditempel ke HTML.
const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
    return String(value === null || value === undefined ? '' : value)
        .replace(/[&<>"']/g, ch => ESCAPE_MAP[ch]);
}

// Tanggal lokal YYYY-MM-DD. new Date().toISOString() memakai UTC, jadi di WIB
// (UTC+7) transaksi sebelum jam 07:00 akan tercatat mundur satu hari.
export function todayISO(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Label tampilan untuk transaksi yang sumber dananya tidak tercatat di Sheet.
export const WALLET_UNSET_LABEL = 'Belum diisi';

export function generateUUID() {
    // Tersedia di semua browser target pada konteks aman (https / localhost).
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function formatRupiah(number) {
    if (isNaN(number)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

export function parseLocalDate(dateString) {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;
    
    const str = String(dateString).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d, 12, 0, 0); // Noon local time to avoid timezone shifts
    }
    
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }
    return new Date();
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return parseLocalDate(dateString).toLocaleDateString('id-ID', options);
}

// Ekspor CSV — backup dan bahan lapor pajak/rekonsiliasi manual.
// BOM di depan supaya Excel membaca UTF-8 dan tidak merusak karakter non-ASCII.
export function exportTransactionsCsv(transactions, filename = 'financeku.csv') {
    const header = ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Catatan', 'Dompet'];
    const rows = transactions.map(t => [t.Tanggal, t.Tipe, t.Kategori, t.Jumlah, t.Catatan, t.Dompet]);
    const csv = [header, ...rows]
        .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Universal Normalization for Transaction Objects
// Solves case sensitivity, timezone shifts, empty fields, and misplaced timestamp columns in Sheet
export function normalizeTransaction(trx) {
    if (!trx) return null;
    
    let rawDompet = String(trx.Dompet || trx.dompet || trx.DOMPET || trx.wallet || trx.Wallet || '').trim();

    // Baris lama ditulis backend versi pertama yang tidak menulis kolom Dompet,
    // sehingga "Dibuat Pada" mendarat di kolom Dompet.
    if (/^\d{4}-\d{2}-\d{2}([T ]|$)/.test(rawDompet)) rawDompet = '';

    // Sumber dana yang tidak diketahui DIBIARKAN kosong, bukan dianggap "Tunai".
    // Menebak nama dompet berarti memindahkan uang ke akun yang salah tanpa
    // sepengetahuan pengguna, dan saldo Tunai jadi ikut melenceng.
    const dompetVal = rawDompet;

    let rawDate = trx.Tanggal || trx.tanggal || trx.TANGGAL;
    let cleanDate = '';
    
    if (rawDate) {
        const strDate = String(rawDate).trim();
        if (strDate.includes('T')) {
            const dObj = new Date(strDate);
            if (!isNaN(dObj.getTime())) cleanDate = todayISO(dObj);
        } else if (/^\d{4}-\d{2}-\d{2}/.test(strDate)) {
            cleanDate = strDate.substring(0, 10);
        } else {
            const dObj = new Date(strDate);
            if (!isNaN(dObj.getTime())) cleanDate = todayISO(dObj);
        }
    }

    if (!cleanDate) cleanDate = todayISO();

    const createdAtVal = String(trx['Dibuat Pada'] || trx.dibuatPada || trx.created_at || trx.timestamp || new Date().toISOString());

    return {
        ID: String(trx.ID || trx.id || ('local-' + Date.now())),
        Tanggal: cleanDate,
        Tipe: String(trx.Tipe || trx.tipe || 'Pengeluaran'),
        Kategori: String(trx.Kategori || trx.kategori || 'Lainnya'),
        Jumlah: Math.abs(parseFloat(trx.Jumlah || trx.jumlah) || 0),
        Catatan: String(trx.Catatan || trx.catatan || ''),
        Dompet: dompetVal,
        'Dibuat Pada': createdAtVal
    };
}
