// js/store.js
import { normalizeTransaction } from './utils.js';

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
    { id: 'cat-10', name: 'Lainnya', icon: '✨', type: 'Pengeluaran' }
];

export const store = {
    state: {
        transactions: [],
        tasks: [],
        categories: DEFAULT_CATEGORIES,
        settings: {
            userName: 'Akmal',
            theme: 'light'
        }
    },
    
    toggleTheme() {
        const currentSettings = this.get('settings') || {};
        const newTheme = currentSettings.theme === 'dark' ? 'light' : 'dark';
        const updatedSettings = { ...currentSettings, theme: newTheme };
        this.set('settings', updatedSettings);
        document.documentElement.setAttribute('data-theme', newTheme);
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
    
    set(key, value) {
        if (key === 'transactions' && Array.isArray(value)) {
            value = value.map(normalizeTransaction).filter(Boolean);
        }
        this.state[key] = value;
        localStorage.setItem(`financeku_${key}`, JSON.stringify(value));
        
        // Update Flutter Widget if Tasks change
        if (key === 'tasks' && window.HomeWidgetBridge) {
            try {
                const pendingTasks = value.filter(t => t.Status !== 'Done')
                    .sort((a, b) => new Date(a.Deadline) - new Date(b.Deadline))
                    .slice(0, 5);
                
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
        transactions.sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
        this.set('transactions', transactions);
    },
    
    updateTransaction(id, updates) {
        const transactions = this.state.transactions.map(trx => 
            trx.ID === id ? normalizeTransaction({ ...trx, ...updates }) : trx
        );
        this.set('transactions', transactions);
    },
    
    deleteTransaction(id) {
        const transactions = this.state.transactions.filter(trx => trx.ID !== id);
        this.set('transactions', transactions);
    },

    // Merge fresh API list with local cache safely so local additions are never wiped
    mergeApiTransactions(apiList) {
        if (!Array.isArray(apiList)) return;
        
        const localList = this.state.transactions || [];
        const mergedMap = new Map();
        
        // Normalize API Items
        apiList.forEach(item => {
            const norm = normalizeTransaction(item);
            if (norm && norm.ID) {
                mergedMap.set(String(norm.ID), norm);
            }
        });
        
        // Preserve any local items not present in API array yet
        localList.forEach(item => {
            const norm = normalizeTransaction(item);
            if (norm && norm.ID) {
                const idStr = String(norm.ID);
                if (!mergedMap.has(idStr)) {
                    mergedMap.set(idStr, norm);
                }
            }
        });
        
        const mergedList = Array.from(mergedMap.values());
        mergedList.sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
        
        this.set('transactions', mergedList);
    },
    
    loadFromCache() {
        ['transactions', 'tasks', 'settings', 'categories'].forEach(key => {
            const cached = localStorage.getItem(`financeku_${key}`);
            if (cached) {
                try {
                    let parsed = JSON.parse(cached);
                    if (key === 'transactions' && Array.isArray(parsed)) {
                        parsed = parsed.map(normalizeTransaction).filter(Boolean);
                    }
                    this.state[key] = parsed;
                } catch (e) {
                    console.error('Error parsing cache for', key);
                }
            }
        });
        
        let categoriesUpdated = false;

        // Pastikan kategori "Uang Saku" selalu ada
        if (this.state.categories && !this.state.categories.some(c => c.name === 'Uang Saku')) {
            const index = this.state.categories.findIndex(c => c.id === 'cat-10');
            const newCat = { id: 'cat-11', name: 'Uang Saku', icon: '🪙', type: 'Pemasukan' };
            if (index > -1) {
                this.state.categories.splice(index, 0, newCat);
            } else {
                this.state.categories.push(newCat);
            }
            categoriesUpdated = true;
        }
        
        // Pastikan kategori "Token AI" selalu ada
        if (this.state.categories && !this.state.categories.some(c => c.name === 'Token AI')) {
            const index = this.state.categories.findIndex(c => c.id === 'cat-10');
            const newCat = { id: 'cat-12', name: 'Token AI', icon: '🤖', type: 'Pengeluaran' };
            if (index > -1) {
                this.state.categories.splice(index, 0, newCat);
            } else {
                this.state.categories.push(newCat);
            }
            categoriesUpdated = true;
        }
        
        // Pastikan kategori "Investasi" (Pengeluaran) selalu ada
        if (this.state.categories && !this.state.categories.some(c => c.name === 'Investasi' && c.type === 'Pengeluaran')) {
            const index = this.state.categories.findIndex(c => c.id === 'cat-10');
            const newCat = { id: 'cat-13', name: 'Investasi', icon: '📈', type: 'Pengeluaran' };
            if (index > -1) {
                this.state.categories.splice(index, 0, newCat);
            } else {
                this.state.categories.push(newCat);
            }
            categoriesUpdated = true;
        }

        // Pastikan kategori "Tabungan" selalu ada
        if (this.state.categories && !this.state.categories.some(c => c.name === 'Tabungan')) {
            const index = this.state.categories.findIndex(c => c.id === 'cat-10');
            const newCat = { id: 'cat-14', name: 'Tabungan', icon: '🏦', type: 'Pengeluaran' };
            if (index > -1) {
                this.state.categories.splice(index, 0, newCat);
            } else {
                this.state.categories.push(newCat);
            }
            categoriesUpdated = true;
        }

        if (categoriesUpdated) {
            this.set('categories', this.state.categories);
        }
    }
};

// Initialize cache
store.loadFromCache();
