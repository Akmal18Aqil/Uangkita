// js/store.js
import { normalizeTransaction } from './utils.js';
import { api } from './api.js';

export const DEFAULT_CATEGORIES = [
    { id: 'cat-1', name: 'Makanan', icon: '🍽️', type: 'Pengeluaran' },
    { id: 'cat-2', name: 'Transportasi', icon: '🚗', type: 'Pengeluaran' },
    { id: 'cat-3', name: 'Belanja', icon: '🛍️', type: 'Pengeluaran' },
    { id: 'cat-4', name: 'Tagihan', icon: '📄', type: 'Pengeluaran' },
    { id: 'cat-5', name: 'Hiburan', icon: '🎬', type: 'Pengeluaran' },
    { id: 'cat-6', name: 'Kesehatan', icon: '🏥', type: 'Pengeluaran' },
    { id: 'cat-7', name: 'Gaji', icon: '💰', type: 'Pemasukan' },
    { id: 'cat-8', name: 'Bonus', icon: '🎁', type: 'Pemasukan' },
    { id: 'cat-9', name: 'Investasi', icon: '📈', type: 'Pemasukan' },
    { id: 'cat-11', name: 'Uang Saku', icon: '🪙', type: 'Pemasukan' },
    { id: 'cat-12', name: 'Token AI', icon: '🤖', type: 'Pengeluaran' },
    { id: 'cat-13', name: 'Investasi', icon: '📈', type: 'Pengeluaran' },
    { id: 'cat-14', name: 'Tabungan', icon: '🏦', type: 'Pengeluaran' },
    { id: 'cat-15', name: 'Lainnya', icon: '✨', type: 'Pemasukan' },
    { id: 'cat-10', name: 'Lainnya', icon: '✨', type: 'Pengeluaran' }
];

// Saldo dompet = saldo awal + seluruh mutasi. Tanpa saldo awal, dompet yang
// sudah berisi uang sebelum aplikasi dipakai akan selalu terbaca minus.
export const DEFAULT_WALLETS = [
    { name: 'Tunai', icon: '💵', opening: 0 },
    { name: 'Dana', icon: '🔵', opening: 0 },
    { name: 'Wondr', icon: '🟢', opening: 0 },
    { name: 'ShopeePay', icon: '🟠', opening: 0 }
];

// Kunci yang isinya wajib array. Respons API yang gagal bisa bernilai null dan
// kalau ikut tersimpan, seluruh halaman yang memanggil .length/.filter ikut mati
// sampai localStorage dibersihkan manual.
const ARRAY_KEYS = ['transactions', 'tasks', 'categories', 'wallets'];

// Tanggal sudah dinormalkan ke format YYYY-MM-DD, jadi perbandingan string sudah
// kronologis tanpa mengalokasikan objek Date di setiap perbandingan sort.
function byDateDesc(a, b) {
    if (a.Tanggal === b.Tanggal) return 0;
    return a.Tanggal < b.Tanggal ? 1 : -1;
}

export const store = {
    state: {
        transactions: [],
        tasks: [],
        categories: DEFAULT_CATEGORIES,
        wallets: DEFAULT_WALLETS,
        settings: {
            userName: 'Akmal',
            theme: 'light',
            budget: '',
            targetSavings: ''
        }
    },

    // JSON.stringify seluruh daftar transaksi bersifat sinkron dan memblokir main
    // thread, jadi penulisan dikumpulkan dulu lalu ditulis sekali saat browser idle.
    _pendingKeys: new Set(),
    _flushScheduled: false,

    _persist(key) {
        this._pendingKeys.add(key);
        if (this._flushScheduled) return;
        this._flushScheduled = true;

        const schedule = typeof requestIdleCallback === 'function'
            ? (cb) => requestIdleCallback(cb, { timeout: 1000 })
            : (cb) => setTimeout(cb, 0);

        schedule(() => this.flush());
    },

    // Dipanggil juga saat halaman disembunyikan/ditutup supaya tidak ada data hilang.
    flush() {
        this._flushScheduled = false;
        if (this._pendingKeys.size === 0) return;

        this._pendingKeys.forEach(key => {
            try {
                localStorage.setItem(`financeku_${key}`, JSON.stringify(this.state[key]));
            } catch (e) {
                console.error('Gagal menyimpan cache untuk', key, e);
            }
        });
        this._pendingKeys.clear();
    },

    toggleTheme() {
        const currentSettings = this.get('settings') || {};
        const newTheme = currentSettings.theme === 'dark' ? 'light' : 'dark';
        this.set('settings', { ...currentSettings, theme: newTheme });
        // Penerapan ke DOM ditangani applyThemeUI() di app.js (yang juga menukar
        // ikon matahari/bulan); menyetel atribut di sini hanya duplikasi.
        return newTheme;
    },
    
    listeners: [],
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },
    
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    },
    
    get(key) {
        return this.state[key];
    },
    
    // `normalized: true` dipakai pemanggil internal yang datanya sudah dinormalkan,
    // supaya seluruh daftar tidak diproses ulang percuma.
    set(key, value, { normalized = false } = {}) {
        // Penjaga tunggal untuk semua pemanggil: api.fetch() bisa mengembalikan
        // null (mode mock / sheet kosong) dan dulu nilai itu ikut tersimpan.
        if (ARRAY_KEYS.includes(key) && !Array.isArray(value)) {
            if (value !== null && value !== undefined) {
                console.warn(`store.set('${key}') diabaikan: nilainya bukan array`, value);
            }
            return;
        }
        if (key === 'transactions' && !normalized) {
            value = value.map(normalizeTransaction).filter(Boolean);
        }
        this.state[key] = value;
        this._persist(key);

        // Update Flutter Widget if Tasks change
        if (key === 'tasks' && window.HomeWidgetBridge) {
            try {
                const pendingTasks = value.filter(t => t.Status !== 'Done')
                    .map(t => {
                        const ts = t.Deadline ? new Date(t.Deadline).getTime() : NaN;
                        return { task: t, ts: Number.isNaN(ts) ? Infinity : ts };
                    })
                    .sort((a, b) => a.ts - b.ts)
                    .slice(0, 5)
                    .map(entry => entry.task);

                let title = 'Tugas Terdekat';
                let desc = pendingTasks.length > 0 
                    ? pendingTasks.map((t, i) => `${i+1}. ${t.Judul} (${t.Prioritas})`).join('\\n')
                    : 'Tidak ada tugas yang mendesak.';
                    
                window.HomeWidgetBridge.postMessage(JSON.stringify({
                    title: title,
                    desc: desc
                }));
            } catch(e) {
                console.error('Failed to update flutter widget', e);
            }
        }
        
        this.notify();
    },
    
    addTransaction(trx) {
        const norm = normalizeTransaction(trx);
        const transactions = [norm, ...this.state.transactions];
        transactions.sort(byDateDesc);
        this.set('transactions', transactions, { normalized: true });
    },

    updateTransaction(id, updates) {
        const transactions = this.state.transactions.map(trx =>
            trx.ID === id ? normalizeTransaction({ ...trx, ...updates }) : trx
        );
        this.set('transactions', transactions, { normalized: true });
    },

    deleteTransaction(id) {
        const transactions = this.state.transactions.filter(trx => trx.ID !== id);
        this.set('transactions', transactions, { normalized: true });
    },

    // Google Sheet adalah acuan. Baris lokal yang tidak ada di server HANYA
    // dipertahankan kalau perubahannya memang masih mengantre untuk dikirim.
    //
    // Versi sebelumnya menyimpan SEMUA baris lokal yang tidak cocok selamanya.
    // Kalau backend membuat ID sendiri (Apps Script versi lama mengabaikan
    // payload.id), ID lokal dan ID di Sheet berbeda untuk transaksi yang sama,
    // sehingga satu baris di Sheet muncul dua kali di aplikasi — dan menetap.
    mergeApiTransactions(apiList) {
        if (!Array.isArray(apiList)) return;

        const { unsent, deleted } = api.pendingSync();
        const merged = new Map();

        apiList.forEach(item => {
            const norm = normalizeTransaction(item);
            if (!norm || !norm.ID) return;
            const id = String(norm.ID);
            if (deleted.has(id)) return; // sudah dihapus lokal, penghapusan masih diantre
            merged.set(id, norm);
        });

        (this.state.transactions || []).forEach(item => {
            const norm = normalizeTransaction(item);
            if (!norm || !norm.ID) return;
            const id = String(norm.ID);
            if (unsent.has(id) && !merged.has(id)) merged.set(id, norm);
        });

        const mergedList = Array.from(merged.values());
        mergedList.sort(byDateDesc);

        this.set('transactions', mergedList, { normalized: true });
    },

    loadFromCache() {
        ['transactions', 'tasks', 'settings', 'categories', 'wallets'].forEach(key => {
            const cached = localStorage.getItem(`financeku_${key}`);
            if (!cached) return;
            try {
                let parsed = JSON.parse(cached);
                // Cache lama bisa berisi "null" dari bug sebelumnya; abaikan supaya
                // aplikasi tidak permanen rusak setelah satu kali gagal fetch.
                if (ARRAY_KEYS.includes(key) && !Array.isArray(parsed)) return;
                if (key === 'transactions') {
                    parsed = parsed.map(normalizeTransaction).filter(Boolean);
                }
                this.state[key] = parsed;
            } catch (e) {
                console.error('Error parsing cache for', key);
            }
        });

        // Kategori bawaan yang belum ada di cache lama ditambahkan sekali di sini,
        // dicocokkan per (nama + tipe) karena "Investasi" ada di kedua tipe.
        const known = new Set(this.state.categories.map(c => `${c.name}|${c.type}`));
        const missing = DEFAULT_CATEGORIES.filter(c => !known.has(`${c.name}|${c.type}`));
        if (missing.length > 0) {
            const lainnyaIdx = this.state.categories.findIndex(c => c.id === 'cat-10');
            const at = lainnyaIdx > -1 ? lainnyaIdx : this.state.categories.length;
            this.state.categories.splice(at, 0, ...missing);
            this.set('categories', this.state.categories);
        }
    }
};

// Initialize cache
store.loadFromCache();

// Penulisan yang masih tertunda harus dituntaskan sebelum halaman ditutup.
// 'pagehide' dan visibilitychange adalah sinyal yang andal di browser mobile,
// berbeda dengan 'beforeunload' yang sering tidak jalan di Android/iOS.
if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => store.flush());
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') store.flush();
    });
}
