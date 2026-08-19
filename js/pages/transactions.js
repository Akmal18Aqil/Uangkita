// js/pages/transactions.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatRupiah, formatDate, esc, todayISO, debounce, exportTransactionsCsv, WALLET_UNSET_LABEL } from '../utils.js';
import { getListSkeleton } from '../components/skeleton.js';
import { openTransactionForm } from '../components/transactionForm.js';
import { showToast } from '../components/toast.js';
import { showConfirm } from '../components/modal.js';

let currentFilter = 'Semua';
let currentSearch = '';
let currentMonth = todayISO().slice(0, 7); // '' berarti semua bulan

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1 flex-col gap-md';

    container.innerHTML = `
        <div class="clean-card" style="padding: 14px;">
            <div class="form-group" style="margin-bottom: 8px;">
                <input type="search" id="search-tx" class="form-control" placeholder="🔍 Cari catatan atau kategori..." value="${esc(currentSearch)}" aria-label="Cari transaksi">
            </div>
            <div class="filter-row">
                <input type="month" id="month-filter" class="form-control" value="${currentMonth}" aria-label="Filter bulan">
                <button class="action-pill-btn" id="btn-all-months" title="Tampilkan semua bulan">Semua</button>
            </div>
            <div class="form-group" style="margin-bottom: 0; margin-top: 8px;">
                <select id="category-filter" class="form-control" style="appearance: auto;" aria-label="Filter kategori">
                    <option value="">Semua Kategori</option>
                </select>
            </div>
        </div>

        <div class="segmented-control" role="tablist" aria-label="Tipe transaksi">
            ${['Semua', 'Pemasukan', 'Pengeluaran'].map(f => `
                <button type="button" role="tab" class="segmented-item ${currentFilter === f ? 'active' : ''}"
                        aria-selected="${currentFilter === f}" data-filter="${f}">${f}</button>
            `).join('')}
        </div>

        <div class="clean-card tx-summary" id="tx-summary"></div>

        <div id="transactions-list">
            ${getListSkeleton(5)}
        </div>
    `;

    const rerender = () => renderList(container);

    container.querySelector('#search-tx').addEventListener('input', debounce((e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        rerender();
    }, 200));

    container.querySelector('#month-filter').addEventListener('change', (e) => {
        currentMonth = e.target.value;
        rerender();
    });

    container.querySelector('#btn-all-months').addEventListener('click', () => {
        currentMonth = '';
        container.querySelector('#month-filter').value = '';
        rerender();
    });

    container.querySelector('#category-filter').addEventListener('change', rerender);

    container.querySelectorAll('.segmented-control .segmented-item').forEach(item => {
        item.addEventListener('click', (e) => {
            container.querySelectorAll('.segmented-control .segmented-item').forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-selected', 'false');
            });
            e.currentTarget.classList.add('active');
            e.currentTarget.setAttribute('aria-selected', 'true');
            currentFilter = e.currentTarget.dataset.filter;
            rerender();
        });
    });

    // Delegasi: daftar dirender ulang tiap filter berubah, jadi listener per baris
    // akan menumpuk. Ini juga menghapus kebutuhan onclick + window.* global.
    container.querySelector('#transactions-list').addEventListener('click', async (e) => {
        const row = e.target.closest('[data-tx-id]');
        if (!row) return;
        const id = row.dataset.txId;
        const tx = (store.get('transactions') || []).find(t => t.ID === id);
        if (!tx) return;

        if (e.target.closest('[data-action="delete"]')) {
            const label = tx.Catatan && tx.Catatan !== '-' ? tx.Catatan : tx.Kategori;
            if (!await showConfirm(`Hapus "${esc(label)}" sebesar ${formatRupiah(tx.Jumlah)}?`, { title: 'Hapus Transaksi?' })) return;
            try {
                await api.fetch('deleteTransaction', { id });
                store.deleteTransaction(id);
                showToast('Transaksi berhasil dihapus');
                renderList(container);
            } catch (error) {
                showToast('Gagal menghapus transaksi', 'error');
            }
            return;
        }

        openTransactionForm(tx);
    });

    container.addEventListener('click', (e) => {
        if (!e.target.closest('#btn-export-csv')) return;
        const rows = filterTransactions(container);
        if (rows.length === 0) return showToast('Tidak ada transaksi untuk diekspor', 'error');
        exportTransactionsCsv(rows, `financeku-${currentMonth || 'semua'}.csv`);
        showToast(`${rows.length} transaksi diekspor`);
    });

    if ((store.get('transactions') || []).length === 0) {
        api.fetch('getTransactions')
            .then(data => {
                if (Array.isArray(data)) store.mergeApiTransactions(data);
            })
            .catch(err => console.error('Gagal memuat transaksi', err))
            .finally(() => refresh(container));
    } else {
        refresh(container);
    }

    return container;
}

export function refresh(container) {
    populateCategoryFilter(container);
    renderList(container);
}

function populateCategoryFilter(container) {
    const catFilter = container.querySelector('#category-filter');
    if (!catFilter) return;

    const selected = catFilter.value;
    // Transaksi hanya menyimpan nama kategori, jadi nama yang muncul di dua tipe
    // (mis. "Investasi") harus tampil sekali saja supaya filternya tidak ambigu.
    const seen = new Set();
    const options = (store.get('categories') || [])
        .filter(c => !seen.has(c.name) && seen.add(c.name))
        .map(c => `<option value="${esc(c.name)}">${esc(c.icon)} ${esc(c.name)}</option>`)
        .join('');

    catFilter.innerHTML = `<option value="">Semua Kategori</option>${options}`;
    catFilter.value = selected;
}

function filterTransactions(container) {
    let transactions = store.get('transactions') || [];
    const categoryValue = container.querySelector('#category-filter')?.value;

    if (currentMonth) transactions = transactions.filter(t => t.Tanggal.startsWith(currentMonth));
    if (currentFilter !== 'Semua') transactions = transactions.filter(t => t.Tipe === currentFilter);
    if (categoryValue) transactions = transactions.filter(t => t.Kategori === categoryValue);
    if (currentSearch) {
        transactions = transactions.filter(t =>
            (t.Catatan || '').toLowerCase().includes(currentSearch) ||
            (t.Kategori || '').toLowerCase().includes(currentSearch) ||
            (t.Dompet || '').toLowerCase().includes(currentSearch)
        );
    }
    return transactions;
}

function renderSummary(container, transactions) {
    const income = transactions.filter(t => t.Tipe === 'Pemasukan').reduce((s, t) => s + (parseFloat(t.Jumlah) || 0), 0);
    const expense = transactions.filter(t => t.Tipe !== 'Pemasukan').reduce((s, t) => s + (parseFloat(t.Jumlah) || 0), 0);
    const net = income - expense;

    container.querySelector('#tx-summary').innerHTML = `
        <div class="tx-summary-grid">
            <div>
                <span class="tx-summary-label">Masuk</span>
                <span class="amount text-success">${formatRupiah(income)}</span>
            </div>
            <div>
                <span class="tx-summary-label">Keluar</span>
                <span class="amount text-danger">${formatRupiah(expense)}</span>
            </div>
            <div>
                <span class="tx-summary-label">Selisih</span>
                <span class="amount ${net >= 0 ? 'text-success' : 'text-danger'}">${net >= 0 ? '+' : '−'}${formatRupiah(Math.abs(net))}</span>
            </div>
        </div>
        <div class="tx-summary-footer">
            <span>${transactions.length} transaksi${currentMonth ? '' : ' (semua bulan)'}</span>
            <button class="action-pill-btn" id="btn-export-csv">⬇ Ekspor CSV</button>
        </div>
    `;
}

function renderList(container) {
    const listContainer = container.querySelector('#transactions-list');
    const transactions = filterTransactions(container);

    renderSummary(container, transactions);

    if (transactions.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state mt-lg animate-fade-in">
                <div class="empty-icon">📝</div>
                <p>Tidak ada transaksi yang cocok dengan filter ini</p>
            </div>
        `;
        return;
    }

    const grouped = new Map();
    transactions.forEach(trx => {
        if (!grouped.has(trx.Tanggal)) grouped.set(trx.Tanggal, []);
        grouped.get(trx.Tanggal).push(trx);
    });

    // Kunci berformat YYYY-MM-DD, jadi urutan kronologis cukup perbandingan string.
    const sortedDates = [...grouped.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    const categories = store.get('categories') || [];

    listContainer.innerHTML = sortedDates.map(date => {
        const group = grouped.get(date);
        let dailySubtotal = 0;

        const itemsHtml = group.map(trx => {
            const isIncome = trx.Tipe === 'Pemasukan';
            const amount = parseFloat(trx.Jumlah) || 0;
            dailySubtotal += isIncome ? amount : -amount;

            const catInfo = categories.find(c => c.name === trx.Kategori && c.type === trx.Tipe)
                || categories.find(c => c.name === trx.Kategori)
                || { icon: '✨' };

            return `
                <div class="transaction-item animate-fade-up" data-tx-id="${esc(trx.ID)}" role="button" tabindex="0">
                    <div class="transaction-icon">${esc(catInfo.icon)}</div>
                    <div class="transaction-details">
                        <div class="transaction-title">${esc(trx.Catatan && trx.Catatan !== '-' ? trx.Catatan : trx.Kategori)}</div>
                        <div class="transaction-category">${esc(trx.Kategori)} • ${trx.Dompet ? esc(trx.Dompet) : `<span class="wallet-unset">${WALLET_UNSET_LABEL}</span>`}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                            ${isIncome ? '+' : '−'}${formatRupiah(amount)}
                        </div>
                        <button data-action="delete" class="icon-btn tx-delete-btn" aria-label="Hapus transaksi">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--danger)" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="transaction-group animate-fade-in">
                <div class="transaction-date-pill">
                    <span>${formatDate(date)}</span>
                    <span class="${dailySubtotal >= 0 ? 'text-success' : 'text-danger'}">
                        ${dailySubtotal >= 0 ? '+' : '−'}${formatRupiah(Math.abs(dailySubtotal))}
                    </span>
                </div>
                ${itemsHtml}
            </div>
        `;
    }).join('');
}
