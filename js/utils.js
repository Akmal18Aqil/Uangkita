// js/utils.js

export function generateUUID() {
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
    
    let rawDompet = trx.Dompet || trx.dompet || trx.DOMPET || trx.wallet || trx.Wallet || '';
    
    // If Column G in Google Sheet accidentally stored a timestamp string (e.g. "2026-07-25T02:49:28.964Z")
    if (typeof rawDompet === 'string' && (rawDompet.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(rawDompet))) {
        rawDompet = 'Tunai';
    }
    
    const dompetVal = rawDompet && String(rawDompet).trim() ? String(rawDompet).trim() : 'Tunai';

    let rawDate = trx.Tanggal || trx.tanggal || trx.TANGGAL;
    let cleanDate = '';
    
    if (rawDate) {
        const strDate = String(rawDate).trim();
        if (strDate.includes('T')) {
            const dObj = new Date(strDate);
            if (!isNaN(dObj.getTime())) {
                const y = dObj.getFullYear();
                const m = String(dObj.getMonth() + 1).padStart(2, '0');
                const d = String(dObj.getDate()).padStart(2, '0');
                cleanDate = `${y}-${m}-${d}`;
            }
        } else if (/^\d{4}-\d{2}-\d{2}/.test(strDate)) {
            cleanDate = strDate.substring(0, 10);
        } else {
            const dObj = new Date(strDate);
            if (!isNaN(dObj.getTime())) {
                const y = dObj.getFullYear();
                const m = String(dObj.getMonth() + 1).padStart(2, '0');
                const d = String(dObj.getDate()).padStart(2, '0');
                cleanDate = `${y}-${m}-${d}`;
            }
        }
    }
    
    if (!cleanDate) {
        const now = new Date();
        cleanDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

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
