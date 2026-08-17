// js/pages/analytics.js
import { store } from '../store.js';
import { formatRupiah, parseLocalDate, esc, exportTransactionsCsv } from '../utils.js';
import { createDonutChart, createBarChart, createProgressBar } from '../components/chart.js';
import { showToast } from '../components/toast.js';

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const CATEGORY_COLORS = ['#3B41F4', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#64748B'];

// Berapa bulan mundur dari bulan berjalan. Analitik sebelumnya terkunci di bulan
// ini saja, sehingga tidak ada cara melihat riwayat.
let monthOffset = 0;

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';
    container.style.paddingBottom = '90px'; // ruang untuk FAB & bottom nav

    container.addEventListener('click', (e) => {
        const nav = e.target.closest('[data-month-step]');
        if (nav) {
            const next = monthOffset + Number(nav.dataset.monthStep);
            if (next > 0) return; // tidak ada data masa depan
            monthOffset = next;
            refresh(container);
            return;
        }

        if (e.target.closest('#btn-export-month')) {
            const { transactions, monthDate } = monthSlice();
            if (transactions.length === 0) return showToast('Tidak ada transaksi di bulan ini', 'error');
            exportTransactionsCsv(transactions, `financeku-${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}.csv`);
            showToast(`${transactions.length} transaksi diekspor`);
        }
    });

    refresh(container);
    return container;
}

function monthSlice(offset = monthOffset) {
    const now = new Date();
    const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    const transactions = (store.get('transactions') || []).filter(t => {
        const d = parseLocalDate(t.Tanggal);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    return { transactions, monthDate, month, year, isCurrentMonth: offset === 0 };
}

function totals(transactions) {
    let income = 0, expense = 0;
    const byCategory = {};
    transactions.forEach(t => {
        const amount = parseFloat(t.Jumlah) || 0;
        if (t.Tipe === 'Pemasukan') {
            income += amount;
        } else {
            expense += amount;
            byCategory[t.Kategori] = (byCategory[t.Kategori] || 0) + amount;
        }
    });
    return { income, expense, byCategory };
}

function deltaBadge(current, previous) {
    if (previous === 0) return current > 0 ? '<span class="delta-neutral">baru</span>' : '';
    const pct = Math.round(((current - previous) / previous) * 100);
    return `<span class="${pct >= 0 ? 'delta-up' : 'delta-down'}">${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%</span>`;
}

export function refresh(container) {
    const { transactions, monthDate, month, year, isCurrentMonth } = monthSlice();
    const { income, expense, byCategory } = totals(transactions);
    const prev = totals(monthSlice(monthOffset - 1).transactions);

    const settings = store.get('settings') || {};
    const budget = parseFloat(settings.budget) || 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysElapsed = isCurrentMonth ? new Date().getDate() : daysInMonth;
    const dailyAverage = expense / daysElapsed;
    const projection = Math.round(dailyAverage * daysInMonth);

    const netCashflow = income - expense;
    const isSurplus = netCashflow >= 0;
    // Rasio menabung = porsi pemasukan yang tidak habis dipakai. Indikator paling
    // ringkas untuk menilai kesehatan keuangan bulanan.
    const savingsRate = income > 0 ? Math.round((netCashflow / income) * 100) : 0;

    // Grafik mingguan: pemasukan dan pengeluaran berdampingan, bukan pemasukan saja.
    const weeks = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const idx = Math.floor((day - 1) / 7);
        if (!weeks[idx]) weeks[idx] = { label: `M${idx + 1}`, income: 0, expense: 0, isActive: false };
    }
    transactions.forEach(t => {
        const bucket = weeks[Math.floor((parseLocalDate(t.Tanggal).getDate() - 1) / 7)];
        if (!bucket) return;
        if (t.Tipe === 'Pemasukan') bucket.income += parseFloat(t.Jumlah) || 0;
        else bucket.expense += parseFloat(t.Jumlah) || 0;
    });
    if (isCurrentMonth) {
        const activeIdx = Math.floor((new Date().getDate() - 1) / 7);
        if (weeks[activeIdx]) weeks[activeIdx].isActive = true;
    }

    let donutData = Object.keys(byCategory)
        .map((cat, idx) => ({ label: cat, value: byCategory[cat], color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }))
        .sort((a, b) => b.value - a.value);

    const hasExpenseData = donutData.length > 0;
    if (!hasExpenseData) donutData = [{ label: 'Belum ada data', value: 1, color: 'rgba(0,0,0,0.06)' }];

    container.innerHTML = `
        <div class="month-nav">
            <button class="icon-btn" data-month-step="-1" aria-label="Bulan sebelumnya">‹</button>
            <div class="month-nav-label">
                <span>${MONTH_NAMES[month]} ${year}</span>
                <small>${transactions.length} transaksi</small>
            </div>
            <button class="icon-btn" data-month-step="1" aria-label="Bulan berikutnya" ${monthOffset >= 0 ? 'disabled' : ''}>›</button>
        </div>

        <div class="metric-grid">
            <div class="clean-card metric-card">
                <div class="metric-head">
                    <span>Pemasukan</span>
                    <span class="metric-pill metric-in">↗</span>
                </div>
                <div class="amount metric-value">${formatRupiah(income)}</div>
                <div class="metric-delta">${deltaBadge(income, prev.income)} vs bulan lalu</div>
            </div>

            <div class="clean-card metric-card">
                <div class="metric-head">
                    <span>Pengeluaran</span>
                    <span class="metric-pill metric-out">↘</span>
                </div>
                <div class="amount metric-value">${formatRupiah(expense)}</div>
                <div class="metric-delta">${deltaBadge(expense, prev.expense)} vs bulan lalu</div>
            </div>
        </div>

        <div class="clean-card mb-md cashflow-banner">
            <div class="flex justify-between items-center">
                <span class="cashflow-label">Arus Kas Bersih</span>
                <span style="font-size: 14px; font-weight: 700; color: ${isSurplus ? 'var(--success)' : 'var(--danger)'};">
                    ${isSurplus ? '+' : '−'}${formatRupiah(Math.abs(netCashflow))} (${isSurplus ? 'Surplus' : 'Defisit'})
                </span>
            </div>
            <div class="cashflow-stats">
                <div><span>Rasio menabung</span><strong class="${savingsRate >= 20 ? 'text-success' : savingsRate >= 0 ? 'text-warning' : 'text-danger'}">${savingsRate}%</strong></div>
                <div><span>Rata-rata harian</span><strong>${formatRupiah(Math.round(dailyAverage))}</strong></div>
                <div><span>${isCurrentMonth ? 'Proyeksi akhir bulan' : 'Total pengeluaran'}</span><strong>${formatRupiah(isCurrentMonth ? projection : expense)}</strong></div>
            </div>
        </div>

        ${budget > 0 ? `
        <div class="clean-card mb-md">
            <div class="section-header" style="margin-bottom: 10px;">
                <h4 style="font-size: 15px; font-weight: 700;">Budget ${MONTH_NAMES[month]}</h4>
                <span class="budget-badge budget-${expense >= budget ? 'danger' : expense >= budget * 0.8 ? 'warning' : 'success'}">
                    ${Math.round((expense / budget) * 100)}%
                </span>
            </div>
            ${createProgressBar(expense, budget, `var(--${expense >= budget ? 'danger' : expense >= budget * 0.8 ? 'warning' : 'success'})`)}
            <div class="budget-footer">
                <span>${formatRupiah(expense)} dari ${formatRupiah(budget)}</span>
                <span>${expense <= budget ? `Sisa ${formatRupiah(budget - expense)}` : `Lebih ${formatRupiah(expense - budget)}`}</span>
            </div>
            ${isCurrentMonth && projection > budget ? `<p class="budget-hint" style="color: var(--danger); margin-top: 8px;">⚠ Dengan laju sekarang, akhir bulan diperkirakan ${formatRupiah(projection)} — melewati budget.</p>` : ''}
        </div>` : ''}

        <div class="clean-card mb-md" style="padding: 18px;">
            <div class="section-header" style="margin-bottom: 8px;">
                <h4 style="font-size: 15px; font-weight: 700;">Tren Mingguan</h4>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">per minggu</span>
            </div>
            ${createBarChart(weeks)}
        </div>

        <div class="clean-card mb-md" style="padding: 18px; text-align: center;">
            <div class="section-header" style="margin-bottom: 18px;">
                <h4 style="font-size: 15px; font-weight: 700; margin: 0;">Pengeluaran per Kategori</h4>
            </div>
            ${createDonutChart(donutData, { centerTitle: 'Total Pengeluaran', centerValue: formatRupiah(expense) })}
        </div>

        <div class="clean-card mb-md" style="padding: 18px;">
            <div class="section-header" style="margin-bottom: 16px;">
                <h4 style="font-size: 15px; font-weight: 700;">Rincian Kategori</h4>
                <button class="action-pill-btn" id="btn-export-month" style="padding: 6px 12px; font-size: 11px;">⬇ Ekspor CSV</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                ${!hasExpenseData
                    ? '<div class="text-center text-muted" style="font-size: 13px; padding: 12px 0;">Belum ada catatan pengeluaran di bulan ini.</div>'
                    : donutData.map(item => `
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; font-weight: 500;">
                                <span style="display: flex; align-items: center; gap: 6px;">
                                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.color}; flex-shrink: 0;"></span>
                                    ${esc(item.label)}
                                </span>
                                <span style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 11px;">${deltaBadge(item.value, prev.byCategory[item.label] || 0)}</span>
                                    <span class="amount text-primary" style="font-weight: 700;">${formatRupiah(item.value)}</span>
                                </span>
                            </div>
                            ${createProgressBar(item.value, expense, item.color)}
                        </div>
                    `).join('')}
            </div>
        </div>
    `;

    bindDonutTooltip(container);
}

function bindDonutTooltip(container) {
    const tooltip = container.querySelector('.chart-tooltip');
    if (!tooltip) return;

    container.querySelectorAll('.chart-segment').forEach(seg => {
        seg.addEventListener('mouseenter', (e) => {
            tooltip.style.display = 'block';
            tooltip.textContent = `${e.target.dataset.label}: ${formatRupiah(Number(e.target.dataset.value))}`;
            e.target.style.opacity = '0.75';
        });
        seg.addEventListener('mousemove', (e) => {
            const rect = e.target.closest('.chart-container').getBoundingClientRect();
            tooltip.style.left = `${e.clientX - rect.left + 10}px`;
            tooltip.style.top = `${e.clientY - rect.top + 10}px`;
        });
        seg.addEventListener('mouseleave', (e) => {
            tooltip.style.display = 'none';
            e.target.style.opacity = '1';
        });
    });
}
