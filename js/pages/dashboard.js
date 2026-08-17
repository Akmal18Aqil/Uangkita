// js/pages/dashboard.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatRupiah, formatDate, parseLocalDate, todayISO, esc } from '../utils.js';
import { getListSkeleton } from '../components/skeleton.js';
import { createReferenceBarChart, createProgressBar } from '../components/chart.js';
import { openTransactionForm } from '../components/transactionForm.js';
import { showToast } from '../components/toast.js';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export async function render() {
    const container = document.createElement('div');
    container.className = 'dashboard-grid animate-fade-in stagger-1';

    container.innerHTML = `
        <!-- Hero Cards Row (Income & Expense) -->
        <div class="hero-cards-row">
            <div class="hero-blue-card">
                <div class="hero-card-header">
                    <span class="hero-title" id="hero-income-label">Pemasukan</span>
                    <button class="hero-icon-btn" id="btn-hero-add-income" aria-label="Tambah pemasukan" title="Tambah Pemasukan">↗</button>
                </div>
                <div class="hero-amount" id="hero-income-amount">Rp 0</div>
                <div class="hero-badge" id="hero-income-badge">—</div>
            </div>

            <div class="clean-card hero-expense-card">
                <div class="flex justify-between items-center">
                    <span class="hero-expense-label" id="hero-expense-label">Pengeluaran</span>
                    <button class="hero-icon-btn-outline" id="btn-hero-add-expense" aria-label="Tambah pengeluaran" title="Tambah Pengeluaran">↘</button>
                </div>
                <div id="hero-expense-amount" class="hero-expense-amount">Rp 0</div>
                <div class="hero-expense-meta" id="hero-expense-count">0 transaksi</div>
            </div>
        </div>

        <!-- Total Balance & Bar Chart Card -->
        <div class="balance-chart-card">
            <div class="balance-header-row">
                <div>
                    <div class="total-balance-label">Saldo Total (Semua Dompet)</div>
                    <div class="total-balance-value">
                        <span id="total-balance">Rp 0</span>
                        <span class="badge-pill-positive" id="total-balance-badge">—</span>
                    </div>
                </div>
            </div>

            <div class="segmented-control mt-md mb-md" role="tablist" aria-label="Periode">
                <button type="button" class="segmented-item active" role="tab" aria-selected="true" data-period="monthly">Bulan Ini</button>
                <button type="button" class="segmented-item" role="tab" aria-selected="false" data-period="weekly">Minggu Ini</button>
                <button type="button" class="segmented-item" role="tab" aria-selected="false" data-period="custom">Pilih Tanggal</button>
            </div>

            <div id="custom-date-range" class="custom-date-range" hidden>
                <input type="date" id="date-start" class="form-control" aria-label="Tanggal mulai">
                <span style="color: var(--text-muted);">–</span>
                <input type="date" id="date-end" class="form-control" aria-label="Tanggal akhir">
                <button id="btn-apply-filter" class="btn btn-primary btn-inline">Cari</button>
            </div>

            <div class="chart-caption">Pemasukan vs pengeluaran 6 bulan terakhir</div>
            <div id="reference-chart-container"></div>
        </div>

        <!-- Budget Bulanan -->
        <div id="budget-card"></div>

        <!-- Saldo per Dompet -->
        <div class="my-cards-section">
            <div class="section-header">
                <h3 class="section-title">Dompet Saya</h3>
                <a href="#/settings" class="view-all">Atur</a>
            </div>

            <div class="credit-card-graphic">
                <div class="card-graphic-top">
                    <span style="font-weight: 700; font-family: var(--font-heading); letter-spacing: 1px;">FINANCEKU</span>
                    <span class="contactless-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path></svg>
                    </span>
                </div>
                <div class="card-chip"></div>
                <div class="flex items-center justify-between" style="margin-top: 10px;">
                    <div>
                        <div class="card-caption">SALDO GABUNGAN</div>
                        <div class="card-number-masked" id="card-total-balance">Rp 0</div>
                    </div>
                    <div class="card-expiry" id="card-owner">—</div>
                </div>
            </div>

            <div class="wallet-summary-rows">
                <div class="flex justify-between items-center wallet-summary-row">
                    <span><span class="text-success" style="font-weight:bold;">↑</span> Pemasukan periode ini</span>
                    <span class="amount text-primary" id="summary-income-month">Rp 0</span>
                </div>
                <div class="flex justify-between items-center wallet-summary-row">
                    <span><span class="text-danger" style="font-weight:bold;">↓</span> Pengeluaran periode ini</span>
                    <span class="amount text-primary" id="summary-expense-month">Rp 0</span>
                </div>
            </div>

            <div class="ewallet-grid-list" id="wallet-balances"></div>
        </div>

        <!-- Recent Transactions Section -->
        <div>
            <div class="section-header">
                <h3 class="section-title">Transaksi Terbaru</h3>
                <a href="#/transactions" class="view-all">Lihat Semua</a>
            </div>
            <div id="recent-transactions">
                ${getListSkeleton(3)}
            </div>
        </div>

        <!-- Target Tabungan -->
        <div>
            <div class="section-header">
                <h3 class="section-title">Target Tabungan &amp; Investasi</h3>
                <a href="#/settings" class="view-all">Atur Target</a>
            </div>
            <div id="savings-widget"></div>
        </div>
    `;

    const segmentedItems = container.querySelectorAll('.segmented-control .segmented-item');
    const customRange = container.querySelector('#custom-date-range');

    segmentedItems.forEach(item => {
        item.addEventListener('click', (e) => {
            segmentedItems.forEach(i => {
                i.classList.remove('active');
                i.setAttribute('aria-selected', 'false');
            });
            e.currentTarget.classList.add('active');
            e.currentTarget.setAttribute('aria-selected', 'true');

            const period = e.currentTarget.dataset.period;
            customRange.hidden = period !== 'custom';
            if (period !== 'custom') updateDashboardData(container, period);
        });
    });

    container.querySelector('#btn-apply-filter').addEventListener('click', () => {
        const start = container.querySelector('#date-start').value;
        const end = container.querySelector('#date-end').value;
        if (!start || !end) return showToast('Harap pilih tanggal mulai dan akhir', 'error');
        if (start > end) return showToast('Tanggal mulai melewati tanggal akhir', 'error');
        updateDashboardData(container, 'custom', { start, end });
    });

    container.querySelector('#btn-hero-add-income').addEventListener('click', () => openTransactionForm({ Tipe: 'Pemasukan' }));
    container.querySelector('#btn-hero-add-expense').addEventListener('click', () => openTransactionForm({ Tipe: 'Pengeluaran' }));

    // Ketuk transaksi untuk mengedit. Delegasi dipakai supaya ID tidak perlu
    // ditempel ke atribut onclick (kutip di dalam ID akan mematahkan HTML-nya).
    container.querySelector('#recent-transactions').addEventListener('click', (e) => {
        const row = e.target.closest('[data-tx-id]');
        if (!row) return;
        const tx = (store.get('transactions') || []).find(t => t.ID === row.dataset.txId);
        if (tx) openTransactionForm(tx);
    });

    updateDashboardData(container, 'monthly');

    try {
        const [transactions, tasks] = await Promise.all([
            api.fetch('getTransactions').catch(() => null),
            api.fetch('getTasks').catch(() => null)
        ]);

        if (Array.isArray(transactions)) store.mergeApiTransactions(transactions);
        if (Array.isArray(tasks)) store.set('tasks', tasks);
        refresh(container);
    } catch (error) {
        console.error('Failed to update fresh dashboard data:', error);
    }

    return container;
}

export function refresh(container) {
    const activeItem = container.querySelector('.segmented-control .segmented-item.active');
    const activePeriod = activeItem ? activeItem.dataset.period : 'monthly';

    let customDates = null;
    if (activePeriod === 'custom') {
        const start = container.querySelector('#date-start').value;
        const end = container.querySelector('#date-end').value;
        if (start && end) customDates = { start, end };
    }

    updateDashboardData(container, activePeriod, customDates);
}

function periodRange(period, customDates) {
    const now = new Date();
    if (period === 'weekly') {
        const day = now.getDay() || 7; // Senin sebagai awal minggu
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
        return { start, end, label: 'Minggu Ini' };
    }
    if (period === 'custom' && customDates) {
        const start = parseLocalDate(customDates.start);
        start.setHours(0, 0, 0, 0);
        const end = parseLocalDate(customDates.end);
        end.setHours(23, 59, 59, 999);
        return { start, end, label: 'Periode Dipilih' };
    }
    return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
        label: 'Bulan Ini'
    };
}

// Periode pembanding: bulan kalender sebelumnya untuk mode bulanan (bukan
// "mundur N hari", yang untuk Maret akan menyeret sisa Januari ke dalamnya).
function previousRange(period, start, end) {
    if (period === 'monthly') {
        const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
        const prevEnd = new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59, 999);
        return { start: prevStart, end: prevEnd };
    }
    const span = end.getTime() - start.getTime();
    return { start: new Date(start.getTime() - span - 1), end: new Date(start.getTime() - 1) };
}

function growthLabel(current, previous) {
    if (previous === 0) return current > 0 ? 'Baru periode ini' : 'Belum ada data';
    const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
    return `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}% vs periode lalu`;
}

function updateDashboardData(container, period = 'monthly', customDates = null) {
    const transactions = store.get('transactions') || [];
    const wallets = store.get('wallets') || [];
    const settings = store.get('settings') || {};

    const { start: startDate, end: endDate, label: periodLabel } = periodRange(period, customDates);
    const { start: prevStartDate, end: prevEndDate } = previousRange(period, startDate, endDate);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Saldo dompet berangkat dari saldo awal yang diisi user di Pengaturan.
    const walletBalances = new Map(wallets.map(w => [w.name, Number(w.opening) || 0]));
    const walletLookup = new Map(wallets.map(w => [w.name.toLowerCase(), w.name]));
    const fallbackWallet = wallets[0] ? wallets[0].name : 'Tunai';

    let periodIncome = 0, periodExpense = 0, expenseTxCount = 0;
    let prevIncome = 0, prevExpense = 0;
    let balanceNow = 0, balancePrev = 0;
    let monthExpense = 0;
    let totalSaved = 0;
    const filteredTx = [];

    // Grafik 6 bulan: kunci "YYYY-M" supaya tidak tertukar antar tahun.
    const monthly = new Map();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthly.set(`${d.getFullYear()}-${d.getMonth()}`, { label: MONTHS_SHORT[d.getMonth()], income: 0, expense: 0, isActive: i === 0 });
    }

    transactions.forEach(trx => {
        const date = parseLocalDate(trx.Tanggal);
        const amount = parseFloat(trx.Jumlah) || 0;
        const isIncome = trx.Tipe === 'Pemasukan';
        const signed = isIncome ? amount : -amount;

        const walletName = walletLookup.get(String(trx.Dompet || '').toLowerCase()) || fallbackWallet;
        walletBalances.set(walletName, (walletBalances.get(walletName) || 0) + signed);

        if (date <= endDate) balanceNow += signed;
        if (date <= prevEndDate) balancePrev += signed;

        if (!isIncome && (trx.Kategori === 'Investasi' || trx.Kategori === 'Tabungan')) totalSaved += amount;

        if (date >= monthStart && date <= monthEnd && !isIncome) monthExpense += amount;

        if (date >= startDate && date <= endDate) {
            filteredTx.push(trx);
            if (isIncome) periodIncome += amount;
            else { periodExpense += amount; expenseTxCount++; }
        }

        if (date >= prevStartDate && date <= prevEndDate) {
            if (isIncome) prevIncome += amount;
            else prevExpense += amount;
        }

        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const bucket = monthly.get(monthKey);
        if (bucket) {
            if (isIncome) bucket.income += amount;
            else bucket.expense += amount;
        }
    });

    const openingTotal = wallets.reduce((sum, w) => sum + (Number(w.opening) || 0), 0);
    const totalBalance = openingTotal + balanceNow;
    const prevTotalBalance = openingTotal + balancePrev;

    container.querySelector('#hero-income-label').textContent = `Pemasukan · ${periodLabel}`;
    container.querySelector('#hero-expense-label').textContent = `Pengeluaran · ${periodLabel}`;
    container.querySelector('#hero-income-amount').textContent = formatRupiah(periodIncome);
    container.querySelector('#hero-expense-amount').textContent = formatRupiah(periodExpense);
    container.querySelector('#hero-income-badge').textContent = growthLabel(periodIncome, prevIncome);
    container.querySelector('#hero-expense-count').textContent =
        `${expenseTxCount} transaksi · ${growthLabel(periodExpense, prevExpense).replace(' vs periode lalu', '')}`;

    container.querySelector('#total-balance').textContent = formatRupiah(totalBalance);

    const balanceBadge = container.querySelector('#total-balance-badge');
    balanceBadge.textContent = growthLabel(totalBalance, prevTotalBalance);
    balanceBadge.classList.toggle('negative', totalBalance < prevTotalBalance);

    container.querySelector('#summary-income-month').textContent = formatRupiah(periodIncome);
    container.querySelector('#summary-expense-month').textContent = formatRupiah(periodExpense);
    container.querySelector('#card-total-balance').textContent = formatRupiah(totalBalance);
    container.querySelector('#card-owner').textContent = settings.userName || 'FinanceKu';

    container.querySelector('#wallet-balances').innerHTML = wallets.map(w => {
        const balance = walletBalances.get(w.name) || 0;
        return `
            <div class="ewallet-item-box">
                <div class="ewallet-item-name">${esc(w.icon)} ${esc(w.name)}</div>
                <div class="ewallet-item-amount ${balance < 0 ? 'text-danger' : ''}">${formatRupiah(balance)}</div>
            </div>
        `;
    }).join('') || '<div class="empty-state" style="grid-column: 1/-1;"><p>Belum ada dompet. Tambahkan di Pengaturan.</p></div>';

    container.querySelector('#reference-chart-container').innerHTML =
        createReferenceBarChart([...monthly.values()]);

    renderBudgetCard(container, settings, monthExpense, now);
    renderRecentTransactions(container, filteredTx);
    renderSavings(container, settings, totalSaved);
}

function renderBudgetCard(container, settings, monthExpense, now) {
    const card = container.querySelector('#budget-card');
    const budget = parseFloat(settings.budget) || 0;

    if (budget <= 0) {
        card.innerHTML = `
            <div class="clean-card budget-empty">
                <div>
                    <div class="budget-title">Budget Bulanan</div>
                    <p class="budget-hint">Tetapkan batas pengeluaran bulanan untuk memantau sisa dana.</p>
                </div>
                <a href="#/settings" class="action-pill-btn">Atur Budget</a>
            </div>
        `;
        return;
    }

    const remaining = budget - monthExpense;
    const usedPct = Math.round((monthExpense / budget) * 100);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(daysInMonth - now.getDate() + 1, 1);
    const safeDaily = Math.max(Math.floor(remaining / daysLeft), 0);

    const tone = usedPct >= 100 ? 'danger' : usedPct >= 80 ? 'warning' : 'success';
    const color = `var(--${tone})`;

    card.innerHTML = `
        <div class="clean-card">
            <div class="section-header" style="margin-bottom: 10px;">
                <h3 class="section-title" style="font-size: 15px;">Budget Bulan Ini</h3>
                <span class="budget-badge budget-${tone}">${usedPct}% terpakai</span>
            </div>
            <div class="budget-amounts">
                <span class="amount text-primary">${formatRupiah(monthExpense)}</span>
                <span class="budget-of">dari ${formatRupiah(budget)}</span>
            </div>
            ${createProgressBar(monthExpense, budget, color)}
            <div class="budget-footer">
                <span>${remaining >= 0 ? 'Sisa' : 'Lewat'} <strong style="color:${color}">${formatRupiah(Math.abs(remaining))}</strong></span>
                <span>${remaining >= 0 ? `Aman ${formatRupiah(safeDaily)}/hari · ${daysLeft} hari lagi` : 'Budget bulan ini terlampaui'}</span>
            </div>
        </div>
    `;
}

const BRAND_ICONS = [
    [['apple', 'iphone', 'macbook'], '🍎'],
    [['spotify', 'musik', 'hiburan', 'netflix'], '🎧'],
    [['uber', 'gojek', 'grab', 'transport', 'bensin'], '🚗'],
    [['gym', 'kesehatan', 'fitnes', 'obat'], '🏋️'],
    [['makanan', 'makan', 'kopi'], '🍽️'],
    [['gaji', 'bonus', 'uang saku'], '💰'],
    [['tabungan', 'investasi'], '🏦']
];

function brandIcon(kategori, catatan) {
    const str = `${kategori} ${catatan || ''}`.toLowerCase();
    const hit = BRAND_ICONS.find(([keys]) => keys.some(k => str.includes(k)));
    return hit ? hit[1] : '✨';
}

function renderRecentTransactions(container, filteredTx) {
    const target = container.querySelector('#recent-transactions');

    if (filteredTx.length === 0) {
        target.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>Tidak ada transaksi di periode ini</p>
            </div>
        `;
        return;
    }

    const sorted = [...filteredTx]
        .sort((a, b) => (a.Tanggal === b.Tanggal ? 0 : a.Tanggal < b.Tanggal ? 1 : -1))
        .slice(0, 5);

    const today = todayISO();
    const groups = [
        ['Hari Ini', sorted.filter(t => t.Tanggal === today)],
        ['Sebelumnya', sorted.filter(t => t.Tanggal !== today)]
    ];

    target.innerHTML = groups.filter(([, items]) => items.length > 0).map(([title, items]) => `
        <div class="transaction-group">
            <div class="transaction-date-pill">
                <span>${title}</span>
                <span>${items.length} transaksi</span>
            </div>
            ${items.map(renderTxItemHtml).join('')}
        </div>
    `).join('');
}

function renderSavings(container, settings, totalSaved) {
    const widget = container.querySelector('#savings-widget');
    const target = parseFloat(settings.targetSavings) || 0;

    if (target <= 0) {
        widget.innerHTML = `
            <div class="savings-item-card">
                <div class="savings-header">
                    <span>🏦 Terkumpul (Tabungan + Investasi)</span>
                    <span class="amount text-primary">${formatRupiah(totalSaved)}</span>
                </div>
                <p class="budget-hint">Tetapkan target di Pengaturan untuk melihat progres.</p>
            </div>
        `;
        return;
    }

    widget.innerHTML = `
        <div class="savings-item-card">
            <div class="savings-header">
                <span>🏦 Tabungan &amp; Investasi</span>
                <span class="amount text-primary">${formatRupiah(totalSaved)} / ${formatRupiah(target)}</span>
            </div>
            ${createProgressBar(totalSaved, target)}
            <div class="budget-footer">
                <span>${Math.round((totalSaved / target) * 100)}% tercapai</span>
                <span>Kurang ${formatRupiah(Math.max(target - totalSaved, 0))}</span>
            </div>
        </div>
    `;
}

function renderTxItemHtml(trx) {
    const isIncome = trx.Tipe === 'Pemasukan';
    return `
        <div class="transaction-item animate-fade-in" data-tx-id="${esc(trx.ID)}" role="button" tabindex="0">
            <div class="transaction-icon">${brandIcon(trx.Kategori, trx.Catatan)}</div>
            <div class="transaction-details">
                <div class="transaction-title">${esc(trx.Catatan && trx.Catatan !== '-' ? trx.Catatan : trx.Kategori)}</div>
                <div class="transaction-category">${formatDate(trx.Tanggal)} • ${esc(trx.Kategori)} • ${esc(trx.Dompet || 'Tunai')}</div>
            </div>
            <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '−'}${formatRupiah(trx.Jumlah)}
            </div>
        </div>
    `;
}
