// js/store.js
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
    { id: 'cat-10', name: 'Lainnya', icon: '✨', type: 'Pengeluaran' }
];

export const store = {
    state: {
        transactions: [],
        tasks: [],
        categories: DEFAULT_CATEGORIES,
        settings: {
            userName: 'Akmal',
            theme: 'dark'
        }
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
    
    set(key, value) {
        this.state[key] = value;
        localStorage.setItem(`financeku_${key}`, JSON.stringify(value));
        this.notify();
    },
    
    addTransaction(trx) {
        const transactions = [trx, ...this.state.transactions];
        // Sort by date desc
        transactions.sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
        this.set('transactions', transactions);
    },
    
    updateTransaction(id, updates) {
        const transactions = this.state.transactions.map(trx => 
            trx.ID === id ? { ...trx, ...updates } : trx
        );
        this.set('transactions', transactions);
    },
    
    deleteTransaction(id) {
        const transactions = this.state.transactions.filter(trx => trx.ID !== id);
        this.set('transactions', transactions);
    },
    
    loadFromCache() {
        ['transactions', 'tasks', 'settings'].forEach(key => {
            const cached = localStorage.getItem(`financeku_${key}`);
            if (cached) {
                try {
                    this.state[key] = JSON.parse(cached);
                } catch (e) {
                    console.error('Error parsing cache for', key);
                }
            }
        });
    }
};

// Initialize cache
store.loadFromCache();
