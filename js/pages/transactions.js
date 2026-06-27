// js/pages/transactions.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatRupiah, formatDate } from '../utils.js';
import { getListSkeleton } from '../components/skeleton.js';
import { openTransactionForm } from '../components/transactionForm.js';
import { showToast } from '../components/toast.js';

let currentFilter = 'Semua';
let currentSearch = '';

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';
    
    container.innerHTML = `
        <div class="glass-card mb-md">
            <div class="form-group" style="margin-bottom: 8px;">
                <input type="text" id="search-tx" class="form-control" placeholder="🔍 Cari catatan transaksi..." value="${currentSearch}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <select id="category-filter" class="form-control" style="appearance: auto;">
                    <option value="">Semua Kategori</option>
                    <!-- Injected later -->
                </select>
            </div>
        </div>
        
        <div class="quick-amounts mb-md filter-chips">
            <div class="chip ${currentFilter === 'Semua' ? 'bg-primary' : ''}" data-filter="Semua">Semua</div>
            <div class="chip ${currentFilter === 'Pemasukan' ? 'bg-success' : ''}" data-filter="Pemasukan">Pemasukan</div>
            <div class="chip ${currentFilter === 'Pengeluaran' ? 'bg-danger' : ''}" data-filter="Pengeluaran">Pengeluaran</div>
        </div>
        
        <div id="transactions-list">
            ${getListSkeleton(5)}
        </div>
    `;
    
    // Setup Events
    setTimeout(() => {
        const searchInput = container.querySelector('#search-tx');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase();
                renderList(container);
            });
        }
        
        container.querySelectorAll('.filter-chips .chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                // reset classes
                container.querySelectorAll('.filter-chips .chip').forEach(c => {
                    c.style.background = 'rgba(255, 255, 255, 0.05)';
                    c.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                });
                
                currentFilter = e.target.dataset.filter;
                e.target.style.background = currentFilter === 'Pemasukan' ? 'var(--success)' : 
                                            currentFilter === 'Pengeluaran' ? 'var(--danger)' : 'var(--accent-primary)';
                
                renderList(container);
            });
        });
        
        // Initial fetch check
        if (store.get('transactions').length === 0) {
            api.fetch('getTransactions').then(data => {
                store.set('transactions', data);
                populateCategoryFilter(container);
                renderList(container);
            }).catch(err => {
                console.error(err);
                populateCategoryFilter(container);
                renderList(container); // render empty/cache
            });
        } else {
            populateCategoryFilter(container);
            renderList(container);
        }
        
        // Category filter change event
        const catFilter = container.querySelector('#category-filter');
        if (catFilter) {
            catFilter.addEventListener('change', (e) => {
                renderList(container);
            });
        }
    }, 50);
    
    // Bind global delete method to window for inline onclick handler
    window.deleteTransaction = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
        try {
            await api.fetch('deleteTransaction', { id });
            store.deleteTransaction(id);
            showToast('Transaksi dihapus');
            renderList(container);
        } catch (error) {
            showToast('Gagal menghapus transaksi', 'error');
        }
    };
    
    window.editTransaction = (id) => {
        const tx = store.get('transactions').find(t => t.ID === id);
        if (tx) {
            openTransactionForm(tx);
        }
    };
    
    return container;
}

function populateCategoryFilter(container) {
    const catFilter = container.querySelector('#category-filter');
    if (!catFilter) return;
    
    const categories = store.get('categories');
    const options = categories.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('');
    // keep the first option
    catFilter.innerHTML = `<option value="">Semua Kategori</option>${options}`;
}

function renderList(container) {
    const listContainer = container.querySelector('#transactions-list');
    let transactions = store.get('transactions') || [];
    
    // Apply filters
    if (currentFilter !== 'Semua') {
        transactions = transactions.filter(t => t.Tipe === currentFilter);
    }
    
    if (currentSearch) {
        transactions = transactions.filter(t => 
            (t.Catatan && t.Catatan.toLowerCase().includes(currentSearch))
        );
    }
    
    const catFilter = container.querySelector('#category-filter');
    if (catFilter && catFilter.value) {
        transactions = transactions.filter(t => t.Kategori === catFilter.value);
    }
    
    if (transactions.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state mt-lg animate-fade-in">
                <div class="empty-icon">📝</div>
                <p>Tidak ada transaksi ditemukan</p>
            </div>
        `;
        return;
    }
    
    // Group by Date
    const grouped = {};
    transactions.forEach(trx => {
        const d = trx.Tanggal.split('T')[0];
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(trx);
    });
    
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    const categories = store.get('categories');
    
    let html = '';
    
    sortedDates.forEach(date => {
        const group = grouped[date];
        let dailySubtotal = 0;
        
        let itemsHtml = group.map(trx => {
            const isIncome = trx.Tipe === 'Pemasukan';
            const amount = parseFloat(trx.Jumlah) || 0;
            dailySubtotal += isIncome ? amount : -amount;
            
            const catInfo = categories.find(c => c.name === trx.Kategori) || { icon: '✨' };
            
            return `
                <div class="transaction-item animate-fade-up" onclick="window.editTransaction('${trx.ID}')">
                    <div class="transaction-icon">${catInfo.icon}</div>
                    <div class="transaction-details">
                        <div class="transaction-title">${trx.Catatan || trx.Kategori}</div>
                        <div class="transaction-category">${trx.Kategori}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                            ${isIncome ? '+' : '-'}${formatRupiah(Math.abs(amount))}
                        </div>
                        <button onclick="event.stopPropagation(); window.deleteTransaction('${trx.ID}')" class="icon-btn" style="width: 24px; height: 24px; padding: 0; display: inline-flex; margin-top: 4px;" title="Hapus">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        html += `
            <div class="transaction-group animate-fade-in">
                <div class="transaction-date">
                    <span>${formatDate(date)}</span>
                    <span class="${dailySubtotal >= 0 ? 'text-success' : 'text-danger'}">
                        ${dailySubtotal >= 0 ? '+' : ''}${formatRupiah(dailySubtotal)}
                    </span>
                </div>
                ${itemsHtml}
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
}
